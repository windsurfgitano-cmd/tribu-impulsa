
import React, { useState, useEffect, FormEvent, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Activity, Users, Settings, LogOut, User as UserIcon, CheckCircle, ArrowRight, Briefcase, Sparkles, MapPin, Globe, Instagram, Calendar, ArrowLeft, Bell, Edit2, Save, X, Share2, Download, FolderSync, TrendingUp, AlertTriangle, AlertCircle, Clock, Send, HelpCircle, ChevronRight, BarChart3, RefreshCw, Zap, Lock, CreditCard, Crown, Gift, Home, Type, Handshake, ExternalLink, MessageCircle, Star, Eye, EyeOff } from 'lucide-react';
import { GlassCard } from './components/GlassCard';
import { ProgressBanner } from './components/ProgressBanner';
import { AcademiaView } from './components/academia/AcademiaView';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { PaymentResult } from './components/PaymentResult';
import { TribalLoadingAnimation } from './components/TribalAnimation';
import { CosmicLoadingAnimation } from './components/CosmicLoadingAnimation';
import { TermsCheckbox, TermsModal } from './components/TermsAndConditions';
import { AFFINITY_OPTIONS, CATEGORY_MAPPING, MatchProfile, TribeAssignments } from './types';
import { TRIBE_CATEGORY_OPTIONS } from './data/tribeCategories';
import { REGIONS, ALL_COMUNAS, searchComunas, searchRegions } from './constants/geography';
import { AFFINITIES } from './constants/affinities';
import { generateMockMatches, getProfileById, getMockActivity, getMyProfile, generateTribeAssignments } from './services/matchService';
import {
  exportForGoogleDrive,
  getDashboardStats,
  getAllUsers,
  createUser,
  getCurrentUser,
  setCurrentUser,
  getUserNotifications,
  markNotificationAsRead,
  createInteraction,
  getAllInteractions,
  UserProfile,
  createNotification,
  updateUser,
  // Nuevas funciones
  getAllUsersCompliance,
  getComplianceStats,
  getAllReports,
  createReport,
  updateReportStatus,
  sendBulkReminder,
  createReminder,
  getOnboardingProgress,
  updateOnboardingProgress,
  isOnboardingComplete,
  getCategoryDistribution,
  Report,
  syncNotificationsFromFirebase
} from './services/databaseService';
import { loadRealUsers, validateCredentials, getUserByEmail, getUserFromFirebaseByEmail, changeUserPassword, markFirstLoginComplete, UNIVERSAL_PASSWORD, forceReloadRealUsers } from './services/realUsersData';
import { ensureTribeAssignments, getUserTribeWithProfiles } from './services/tribeAlgorithm';
import { enableAutoBackup, downloadBackup, checkDataIntegrity } from './services/dataPersistence';
import {
  initializeFirebase,
  requestNotificationPermission,
  onForegroundMessage,
  getNotificationStatus,
  sendLocalNotification,
  saveUserFCMToken,
  sendPushToAll,
  countUsersWithPush,
  clearFCMToken,
  // SincronizaciÃ³n con Firestore
  syncProfileToCloud,
  syncTribeAssignments,
  loadTribeAssignments,
  getProfileFromCloud,
  getAllProfilesFromCloud,
  syncChecklistProgress,
  loadChecklistFromFirebase,
  syncAdminConfig,
  loadAdminConfig,
  getFirestoreInstance,
  logInteraction
} from './services/firebaseService';
import { activateTrialMembership } from './services/membershipService';
import { ensureInitialized } from './services/productionInit';
import { SearchableSelect } from './components/SearchableSelect';
import { CATEGORY_SELECT_OPTIONS, AFFINITY_SELECT_OPTIONS_WITH_GROUP } from './utils/selectOptions';
import { Confetti, useConfetti } from './components/Confetti';
import { OnboardingTutorial, useOnboardingTutorial } from './components/OnboardingTutorial';
import { LoginScreen, RegisterScreen } from './screens/auth';
import { TribeAssignmentsView } from './screens/tribe';
import { MyProfileView, ProfileDetail } from './screens/profile';
import { ActivityView } from './screens/activity';
import { Dashboard } from './screens/dashboard';
import { AdminSettingsTab } from './screens/admin';
import { DirectoryView } from './screens/directory';
import { ClubBienestarView } from './screens/benefits';
import { MembershipScreen } from './screens/membership';
import { SurveyScreen } from './screens/survey';
import { SearchingScreen } from './screens/loading';
import { MemberRoute } from './components/routing';
import { ProfileReminderBanner, OnboardingModal, NotificationButton } from './components/common';
import { PasswordChangeModal } from './components/auth';
import { AppLayout } from './components/layout';
import { CloudMembership, syncMembershipToLocalCache, fetchMembershipFromCloud } from './services/membershipCache';

// ============================================
// INICIALIZACIÃ“N DE PRODUCCIÃ“N
// ============================================

// Inicializar Firebase y Firestore automÃ¡ticamente
initializeFirebase();

// Inicializar producciÃ³n y cargar usuarios
(async () => {
  try {
    await ensureInitialized();
    console.log('âœ… ProducciÃ³n inicializada');

    // Cargar usuarios REALES + sincronizar con Firebase
    await forceReloadRealUsers();
    console.log('âœ… Usuarios cargados y sincronizados');

    // Sincronizar fotos de perfil desde Firebase (para ver fotos actualizadas)
    try {
      const { syncPhotosFromFirebase } = await import('./services/firebaseService');
      const photosUpdated = await syncPhotosFromFirebase();
      if (photosUpdated > 0) {
        console.log(`âœ… ${photosUpdated} fotos actualizadas desde Firebase`);
      }
    } catch (photoErr) {
      console.log('âš ï¸ Sync de fotos pendiente');
    }

    // Generar asignaciones de tribu si es necesario
    ensureTribeAssignments();
  } catch (err) {
    console.error('âŒ Error inicializando:', err);
  }
})();

// Habilitar auto-backup
enableAutoBackup();

// Escuchar notificaciones en primer plano
onForegroundMessage((payload: unknown) => {
  const data = payload as { notification?: { title?: string; body?: string } };
  if (data.notification) {
    sendLocalNotification(
      data.notification.title || 'Tribu Impulsa',
      data.notification.body || 'Nueva notificaciÃ³n'
    );
  }
});

console.log('ðŸš€ Tribu Impulsa v2.0 - PWA ProducciÃ³n');
console.log('ðŸ“Š Integridad de datos:', checkDataIntegrity());
console.log('ðŸ”” Estado notificaciones:', getNotificationStatus());

// ============================================
// SINCRONIZACIÃ“N AUTOMÃTICA CON FIRESTORE
// ============================================

// Sincronizar usuario a la nube
const syncUserToCloud = async (user: UserProfile) => {
  try {
    await syncProfileToCloud({
      id: user.id,
      name: user.name,
      companyName: user.companyName,
      category: user.category,
      location: user.city,
      bio: user.bio,
      instagram: user.instagram,
      website: user.website,
      phone: user.phone,
      email: user.email
    });
    console.log('â˜ï¸ Usuario sincronizado a la nube:', user.email);
  } catch (error) {
    console.error('Error sincronizando usuario:', error);
  }
};

// Sincronizar checklist a la nube
const syncChecklistToCloud = async (userId: string, checklist: { toShare: Record<string, boolean>; shareWithMe: Record<string, boolean> }) => {
  try {
    const completed = Object.values(checklist.toShare).filter(Boolean).length +
      Object.values(checklist.shareWithMe).filter(Boolean).length;
    const total = Object.keys(checklist.toShare).length + Object.keys(checklist.shareWithMe).length;

    await syncChecklistProgress(userId, {
      completed,
      total,
      items: { ...checklist.toShare, ...checklist.shareWithMe }
    });
    console.log('â˜ï¸ Checklist sincronizado:', `${completed}/${total}`);
  } catch (error) {
    console.error('Error sincronizando checklist:', error);
  }
};

// Cargar perfil desde la nube
const loadUserFromCloud = async (userId: string): Promise<UserProfile | null> => {
  try {
    const cloudProfile = await getProfileFromCloud(userId);
    if (cloudProfile) {
      console.log('â˜ï¸ Perfil cargado desde la nube:', cloudProfile.email);
      return cloudProfile as unknown as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error cargando perfil de la nube:', error);
    return null;
  }
};

const SURVEY_CATEGORY_OPTIONS = TRIBE_CATEGORY_OPTIONS;

// Afinidades generadas desde constants/affinities.ts - formato "Grupo - Label"
const SURVEY_AFFINITY_OPTIONS = AFFINITIES.map(aff => `${aff.group} - ${aff.label}`);

const SURVEY_SCOPE_OPTIONS = [
  { value: 'LOCAL', label: 'LOCAL (sÃ³lo si operas en una comuna especÃ­fica)' },
  { value: 'REGIONAL', label: 'REGIONAL (si cubres una o varias regiones de Chile)' },
  { value: 'NACIONAL', label: 'NACIONAL (llegas a todo Chile)' }
];

const SURVEY_REVENUE_OPTIONS = [
  'Menos de $500.000',
  '$500.000 - $2.000.000',
  '$2.000.000 - $5.000.000',
  '$5.000.000 - $10.000.000',
  'MÃ¡s de $10.000.000'
];

// IMPORTANTE: Todas las claves usan el userId para segregar datos por usuario
const getUserStorageKey = (baseKey: string): string => {
  const userId = localStorage.getItem('tribu_current_user') || 'guest';
  return `${baseKey}_${userId}`;
};

const TRIBE_ASSIGNMENTS_KEY = 'tribeAssignmentsData';
const TRIBE_STATUS_KEY = 'tribeAssignmentStatus';
const TRIBE_CHECKLIST_KEY = 'tribeAssignmentsChecklist';
const TRIBE_REPORTS_KEY = 'tribeReportsLog';
const TRIBE_SYNC_KEY = 'tribeAssignmentsSyncedAt';

type AssignmentChecklist = {
  toShare: Record<string, boolean>;
  shareWithMe: Record<string, boolean>;
};

type TribeStatus = 'PENDIENTE' | 'EN PROCESO' | 'COMPLETADO';

type TribeReport = {
  targetId: string;
  targetName: string;      // Nombre del emprendimiento
  targetOwner: string;     // Nombre del dueÃ±o
  reason: string;
  timestamp: string;
};

const buildChecklistFromAssignments = (data: TribeAssignments, existing?: AssignmentChecklist): AssignmentChecklist => {
  const buildMap = (list: MatchProfile[], previous: Record<string, boolean> = {}) => {
    return list.reduce<Record<string, boolean>>((acc, profile) => {
      acc[profile.id] = previous[profile.id] ?? false;
      return acc;
    }, {});
  };

  return {
    toShare: buildMap(data.toShare, existing?.toShare),
    shareWithMe: buildMap(data.shareWithMe, existing?.shareWithMe)
  };
};

const stampTribeSync = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserStorageKey(TRIBE_SYNC_KEY), new Date().toLocaleString('es-CL'));
};

const getTribeSyncedAt = (): string => {
  if (typeof window === 'undefined') return new Date().toLocaleString('es-CL');
  return localStorage.getItem(getUserStorageKey(TRIBE_SYNC_KEY)) ?? new Date().toLocaleString('es-CL');
};

const getStoredTribeAssignments = (category: string, userId?: string): TribeAssignments => {
  if (typeof window === 'undefined') {
    return generateTribeAssignments(category, userId);
  }

  // Key especÃ­fica por usuario para que cada uno tenga sus propias asignaciones
  const storageKey = getUserStorageKey(TRIBE_ASSIGNMENTS_KEY);

  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    const generated = generateTribeAssignments(category, userId);
    localStorage.setItem(storageKey, JSON.stringify(generated));
    stampTribeSync();
    return generated;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.toShare || !parsed?.shareWithMe) {
      throw new Error('invalid assignments');
    }
    return parsed;
  } catch (error) {
    console.warn('Error reading stored assignments', error);
    const fallback = generateTribeAssignments(category, userId);
    localStorage.setItem(storageKey, JSON.stringify(fallback));
    stampTribeSync();
    return fallback;
  }
};

const persistTribeAssignments = async (data: TribeAssignments, userId?: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserStorageKey(TRIBE_ASSIGNMENTS_KEY), JSON.stringify(data));

  // Sincronizar a Firebase
  if (userId) {
    const month = new Date().toISOString().slice(0, 7); // "2025-01"
    await syncTribeAssignments(userId, {
      toShareIds: data.toShare.map(p => p.id),
      shareWithMeIds: data.shareWithMe.map(p => p.id),
      month
    });
  }
};

const getStoredChecklistState = (assignments: TribeAssignments): AssignmentChecklist => {
  if (typeof window === 'undefined') {
    return buildChecklistFromAssignments(assignments);
  }

  const storageKey = getUserStorageKey(TRIBE_CHECKLIST_KEY);
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    const initial = buildChecklistFromAssignments(assignments);
    localStorage.setItem(storageKey, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = buildChecklistFromAssignments(assignments, parsed);
    localStorage.setItem(storageKey, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    console.warn('Error reading checklist', error);
    const fallback = buildChecklistFromAssignments(assignments);
    localStorage.setItem(storageKey, JSON.stringify(fallback));
    return fallback;
  }
};

const persistChecklistState = (data: AssignmentChecklist) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserStorageKey(TRIBE_CHECKLIST_KEY), JSON.stringify(data));
};

const checklistsAreEqual = (a: AssignmentChecklist, b: AssignmentChecklist): boolean => {
  const compare = (mapA: Record<string, boolean>, mapB: Record<string, boolean>) => {
    const keysA = Object.keys(mapA);
    if (keysA.length !== Object.keys(mapB).length) return false;
    return keysA.every(key => mapA[key] === mapB[key]);
  };

  return compare(a.toShare, b.toShare) && compare(a.shareWithMe, b.shareWithMe);
};

// FunciÃ³n para comprimir imagen
const compressImage = (file: File, maxWidth: number = 400): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedBase64);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};


// 5. Full Profile Detail View (Other User)

};

};

// Wrapper for AcademiaView to use with React Router
const AcademiaViewWrapper = () => {
  const navigate = useNavigate();
  return <AcademiaView onNavigateBack={() => navigate('/dashboard')} />;
};

// ============================================
// CLUB DE BIENESTAR - Alianzas y Beneficios
// ============================================
const ALIANZAS_BENEFICIOS = [
  {
    id: 'santander',
    nombre: 'Santander Open Academy',
    descripcion: 'Cursos gratuitos de desarrollo profesional y empresarial',
    tipo: 'EducaciÃ³n',
    descuento: 'GRATIS',
    color: 'from-[#EC0000] to-[#CC0000]',
    logo: 'ðŸŽ“',
    url: 'https://www.santanderopenacademy.com/',
    destacado: false,
    oculto: true
  },
  {
    id: 'lovework',
    nombre: 'Lovework',
    descripcion: 'FormalizaciÃ³n y regularizaciÃ³n empresarial. AsesorÃ­a para emprendedores.',
    tipo: 'Legal / Empresarial',
    descuento: '20% OFF',
    color: 'from-[#E91E63] to-[#C2185B]',
    logo: 'ðŸ’¼',
    url: 'https://lovework.cl/',
    destacado: true
  },
  {
    id: 'soledad-mulati',
    nombre: 'Soledad Mulati',
    descripcion: 'AsesorÃ­a legal preferencial para miembros de Tribu Impulsa',
    tipo: 'Legal',
    descuento: '15% OFF',
    color: 'from-[#6161FF] to-[#4A4AE0]',
    logo: 'âš–ï¸',
    url: null,
    contacto: '+56 9 1234 5678'
  },
  {
    id: 'restaurantes',
    nombre: 'Red de Restaurantes',
    descripcion: 'Descuentos en restaurantes y cafeterÃ­as aliadas a la comunidad',
    tipo: 'GastronomÃ­a',
    descuento: '10-15% OFF',
    color: 'from-[#FF9500] to-[#FF6B00]',
    logo: 'ðŸ½ï¸',
    url: null,
    proximamente: true
  },
  {
    id: 'cowork',
    nombre: 'Espacios Cowork',
    descripcion: 'Acceso preferencial a espacios de trabajo compartido',
    tipo: 'Espacios',
    descuento: '25% OFF',
    color: 'from-[#00CA72] to-[#00A85D]',
    logo: 'ðŸ¢',
    url: null,
    proximamente: true
  },
  {
    id: 'bienestar',
    nombre: 'Club de Bienestar',
    descripcion: 'Yoga, pilates, meditaciÃ³n y mÃ¡s con descuentos exclusivos',
    tipo: 'Bienestar',
    descuento: '20% OFF',
    color: 'from-[#A78BFA] to-[#8B5CF6]',
    logo: 'ðŸ§˜',
    url: null,
    proximamente: true
  }
];

const ClubBienestarView = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [filtroActivo, setFiltroActivo] = useState('todos');

  const categorias = ['todos', 'EducaciÃ³n', 'Legal', 'GastronomÃ­a', 'Espacios', 'Bienestar'];

  // ImÃ¡genes stock para cada alianza
  const alianzaImages: Record<string, string> = {
    'santander': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80',
    'lovework': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
    'soledad-mulati': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
    'restaurantes': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
    'cowork': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    'bienestar': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
  };

  const handleLinkClick = (alianza: typeof ALIANZAS_BENEFICIOS[0]) => {
    if (currentUser) {
      const key = `alianza_click_${currentUser.id}_${alianza.id}`;
      const clicks = JSON.parse(localStorage.getItem(key) || '[]');
      clicks.push({ timestamp: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(clicks));
    }
    if (alianza.url) {
      window.open(alianza.url, '_blank');
    }
  };

  const alianzasFiltradas = filtroActivo === 'todos'
    ? ALIANZAS_BENEFICIOS.filter(a => !a.oculto)
    : ALIANZAS_BENEFICIOS.filter(a => a.tipo.includes(filtroActivo) && !a.oculto);

  const alianzasDestacadas = ALIANZAS_BENEFICIOS.filter(a => a.destacado && !a.oculto);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] via-[#FAF5FF] to-[#FDF4FF] pb-32">
      {/* Hero Header Premium */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6161FF] via-[#8B5CF6] to-[#C026D3]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#A855F7]/20 rounded-full blur-3xl -ml-30 -mb-30" />

        <div className="relative px-4 pt-12 pb-8">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Volver al dashboard</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                  <Gift size={40} className="text-[#6161FF]" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white">Club de Beneficios</h1>
                  <p className="text-white/80 mt-1">Alianzas exclusivas para miembros de la Tribu</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white/15 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/20">
                  <p className="text-white/60 text-xs">Alianzas activas</p>
                  <p className="text-white font-black text-2xl">{ALIANZAS_BENEFICIOS.filter(a => !a.proximamente).length}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/20">
                  <p className="text-white/60 text-xs">PrÃ³ximamente</p>
                  <p className="text-white font-black text-2xl">{ALIANZAS_BENEFICIOS.filter(a => a.proximamente).length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-4">
        {/* Filtros por categorÃ­a */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/50 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setFiltroActivo(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filtroActivo === cat
                  ? 'bg-gradient-to-r from-[#6161FF] to-[#8B5CF6] text-white shadow-lg'
                  : 'text-[#666] hover:bg-gray-100'
                  }`}
              >
                {cat === 'todos' ? 'âœ¨ Todos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Destacados */}
        {filtroActivo === 'todos' && alianzasDestacadas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#181B34] mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#f59e0b]" />
              Destacados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alianzasDestacadas.map((alianza) => (
                <div
                  key={alianza.id}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                >
                  {/* Imagen de fondo */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={alianzaImages[alianza.id]}
                      alt={alianza.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Badge destacado */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-3 py-1 bg-[#f59e0b] text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                        <Star className="w-3 h-3" /> DESTACADO
                      </span>
                    </div>

                    {/* Descuento */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1.5 bg-white text-[#181B34] text-sm font-black rounded-full shadow-lg">
                        {alianza.descuento}
                      </span>
                    </div>

                    {/* Info sobre imagen */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-white/80 text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                        {alianza.tipo}
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[#181B34] mb-1 group-hover:text-[#6161FF] transition-colors">
                      {alianza.nombre}
                    </h3>
                    <p className="text-sm text-[#666] mb-4 line-clamp-2">
                      {alianza.descripcion}
                    </p>

                    {alianza.url ? (
                      <button
                        onClick={() => handleLinkClick(alianza)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6161FF] to-[#8B5CF6] text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-200 transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={16} />
                        Ir al sitio
                      </button>
                    ) : alianza.contacto ? (
                      <a
                        href={`https://wa.me/${alianza.contacto.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Soy miembro de Tribu Impulsa y me interesa el beneficio de ${alianza.nombre}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={16} />
                        Contactar por WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grid de todas las alianzas */}
        <div>
          <h2 className="text-xl font-bold text-[#181B34] mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#6161FF]" />
            {filtroActivo === 'todos' ? 'Todas las alianzas' : filtroActivo}
            <span className="text-sm font-normal text-[#666] bg-gray-100 px-2 py-0.5 rounded-full ml-2">
              {alianzasFiltradas.length}
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alianzasFiltradas.map((alianza) => (
              <div
                key={alianza.id}
                className={`group relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ${alianza.proximamente ? 'opacity-60' : ''}`}
              >
                {/* Imagen */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={alianzaImages[alianza.id]}
                    alt={alianza.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Tags */}
                  <div className="absolute top-3 left-3">
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-white/90 text-[#666]">
                      {alianza.tipo}
                    </span>
                  </div>

                  {alianza.proximamente && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <span className="px-4 py-2 bg-white/90 rounded-full text-sm font-bold text-[#666]">
                        ðŸ”œ PrÃ³ximamente
                      </span>
                    </div>
                  )}

                  {/* Descuento */}
                  <div className="absolute bottom-3 right-3">
                    <span className={`px-3 py-1 text-sm font-bold rounded-full shadow-lg ${alianza.descuento === 'GRATIS'
                      ? 'bg-[#00CA72] text-white'
                      : 'bg-white text-[#181B34]'
                      }`}>
                      {alianza.descuento}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <h3 className="font-bold text-[#181B34] mb-1 group-hover:text-[#6161FF] transition-colors line-clamp-1">
                    {alianza.nombre}
                  </h3>
                  <p className="text-sm text-[#666] mb-4 line-clamp-2">
                    {alianza.descripcion}
                  </p>

                  {alianza.proximamente ? (
                    <div className="w-full py-2.5 rounded-xl bg-gray-100 text-[#666] text-sm text-center font-medium">
                      Avisaremos cuando estÃ© disponible
                    </div>
                  ) : alianza.url ? (
                    <button
                      onClick={() => handleLinkClick(alianza)}
                      className="w-full py-2.5 rounded-xl bg-[#181B34] text-white font-semibold text-sm hover:bg-[#6161FF] transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={14} />
                      Acceder al beneficio
                    </button>
                  ) : alianza.contacto ? (
                    <a
                      href={`https://wa.me/${alianza.contacto.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Soy miembro de Tribu Impulsa y me interesa el beneficio de ${alianza.nombre}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={14} />
                      Contactar
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA para aliados */}
        <div className="mt-10 relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#6161FF] via-[#8B5CF6] to-[#C026D3] p-6 md:p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                <Handshake size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Â¿Tienes un negocio?</h3>
                <p className="text-white/80 text-sm">Ãšnete como aliado y llega a cientos de emprendedores</p>
              </div>
            </div>
            <a
              href="https://wa.me/56951776005?text=Hola!%20Quiero%20ser%20aliado%20del%20Club%20de%20Beneficios%20de%20Tribu%20Impulsa"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-[#6161FF] rounded-xl font-bold hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
            >
              Quiero ser aliado
              <ChevronRight size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Panel Inline (simplified version)
const AdminPanelInline = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshData = () => setRefreshKey(k => k + 1);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check admin session
  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (session) setIsLoggedIn(true);
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    // Simple admin auth (demo: admin@tribuimpulsa.cl / admin123)
    if (email === 'admin@tribuimpulsa.cl' && password === 'admin123') {
      localStorage.setItem('adminSession', JSON.stringify({ email, role: 'superadmin' }));
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Credenciales invÃ¡lidas');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    setIsLoggedIn(false);
  };

  // Stats REALES desde la base de datos
  const realStats = getDashboardStats();
  const stats = {
    users: realStats.totalUsers,
    active: realStats.activeUsers,
    reports: realStats.pendingReports,
    matches: realStats.completedShares
  };

  // Usuarios REALES
  const realUsers = getAllUsers();

  // Reportes REALES (nuevo sistema mejorado + legacy) - se refresca con refreshKey
  const legacyReports = JSON.parse(localStorage.getItem('tribeReportsLog') || '[]');
  const newReports = getAllReports();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _refresh = refreshKey; // Trigger re-render when reports change
  const realReports = newReports.length > 0 ? newReports : legacyReports;

  // Cumplimiento
  const complianceData = getAllUsersCompliance();
  const complianceStats = getComplianceStats();

  // DistribuciÃ³n por rubro
  const categoryDist = getCategoryDistribution();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl border border-[#E4E7EF]">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6161FF] to-[#00CA72] rounded-xl flex items-center justify-center">
              <Settings className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#181B34] text-center mb-2">Admin Panel</h1>
          <p className="text-[#7C8193] text-center mb-6 text-sm">Tribu Impulsa - Acceso Administrativo</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-[#434343] mb-1 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF]"
                placeholder="admin@tribuimpulsa.cl"
              />
            </div>
            <div>
              <label className="block text-sm text-[#434343] mb-1 font-medium">ContraseÃ±a</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF]"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              />
            </div>
            {error && <p className="text-[#FB275D] text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Ingresar
            </button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-4 text-[#7C8193] hover:text-[#6161FF] text-sm">
            â† Volver a la app
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#181B34] text-white px-4 py-3 rounded-xl shadow-lg animate-slideDown">
          {toastMessage}
        </div>
      )}
      {/* Sidebar */}
      <div className="w-64 bg-white min-h-screen p-4 flex flex-col border-r border-[#E4E7EF]">
        <div className="flex items-center gap-3 mb-8 p-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#6161FF] to-[#00CA72] rounded-lg flex items-center justify-center">
            <Settings className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-[#181B34] font-bold text-sm">Tribu Admin</h2>
            <p className="text-[#7C8193] text-xs">SuperAdmin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { id: 'overview', label: 'Dashboard', icon: Activity },
            { id: 'memberships', label: 'MembresÃ­as', icon: Crown },
            { id: 'compliance', label: 'Cumplimiento', icon: TrendingUp },
            { id: 'shares', label: 'Registros Share', icon: Share2 },
            { id: 'users', label: 'Usuarios', icon: Users },
            { id: 'reports', label: 'Reportes', icon: AlertTriangle },
            { id: 'settings', label: 'Config', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === item.id
                ? 'bg-[#6161FF]/10 text-[#6161FF]'
                : 'text-[#7C8193] hover:bg-[#F5F7FB] hover:text-[#181B34]'
                }`}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-[#E4E7EF] pt-4 mt-4 space-y-2">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-2 px-3 py-2 text-[#7C8193] hover:bg-[#F5F7FB] rounded-lg text-sm">
            <ArrowLeft size={16} /> Ver como usuario
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-[#FB275D] hover:bg-[#FB275D]/10 rounded-lg text-sm">
            <LogOut size={16} /> Cerrar SesiÃ³n
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#181B34]">Dashboard Overview</h1>

            {/* Stats principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Usuarios Totales', value: stats.users, color: 'bg-[#6161FF]' },
                { label: 'Usuarios Activos', value: stats.active, color: 'bg-[#00CA72]' },
                { label: 'Reportes Pendientes', value: realReports.filter((r: Report | { status?: string }) => !r.status || r.status === 'pending').length, color: 'bg-[#FFCC00]' },
                { label: 'Cumplimiento Promedio', value: `${complianceStats.averageCompliance}%`, color: 'bg-[#A78BFA]' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl p-5 border border-[#E4E7EF] shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                    <p className="text-[#7C8193] text-sm">{stat.label}</p>
                  </div>
                  <p className="text-3xl font-bold text-[#181B34]">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* DistribuciÃ³n de cumplimiento */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 border border-[#E4E7EF] shadow-sm">
                <h3 className="text-[#181B34] font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#6161FF]" /> Estado de Cumplimiento
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Excelente (80%+)', value: complianceStats.excellent, color: 'bg-[#00CA72]', textColor: 'text-[#00CA72]' },
                    { label: 'Bueno (60-79%)', value: complianceStats.good, color: 'bg-[#6161FF]', textColor: 'text-[#6161FF]' },
                    { label: 'Advertencia (30-59%)', value: complianceStats.warning, color: 'bg-[#FFCC00]', textColor: 'text-[#9D6B00]' },
                    { label: 'CrÃ­tico (<30%)', value: complianceStats.critical, color: 'bg-[#FB275D]', textColor: 'text-[#FB275D]' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm text-[#7C8193]">{item.label}</span>
                      </div>
                      <span className={`text-lg font-bold ${item.textColor}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DistribuciÃ³n por rubro */}
              <div className="bg-white rounded-xl p-5 border border-[#E4E7EF] shadow-sm">
                <h3 className="text-[#181B34] font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-[#A78BFA]" /> DistribuciÃ³n por Rubro
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categoryDist.slice(0, 6).map((cat, i) => (
                    <div key={`${cat.category}-${i}`} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#434343] truncate max-w-[150px]">{cat.category}</span>
                          <span className="text-[#7C8193]">{cat.count} ({cat.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-[#F5F7FB] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: ['#6161FF', '#00CA72', '#FFCC00', '#FB275D', '#A78BFA', '#EC4899'][i % 6]
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Acciones rÃ¡pidas */}
            <div className="bg-white rounded-xl p-5 border border-[#E4E7EF] shadow-sm">
              <h3 className="text-[#181B34] font-semibold mb-4">Acciones RÃ¡pidas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="bg-[#6161FF]/10 text-[#6161FF] p-3 rounded-lg hover:bg-[#6161FF]/20 text-sm font-medium transition">
                  Regenerar TÃ³mbola
                </button>
                <button
                  onClick={() => {
                    const result = exportForGoogleDrive();
                    alert(result.instructions);
                  }}
                  className="bg-[#00CA72]/10 text-[#00CA72] p-3 rounded-lg hover:bg-[#00CA72]/20 text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Exportar Drive
                </button>
                <button
                  onClick={() => setActiveTab('compliance')}
                  className="bg-[#A78BFA]/10 text-[#7C3AED] p-3 rounded-lg hover:bg-[#A78BFA]/20 text-sm font-medium transition"
                >
                  Ver Cumplimiento
                </button>
                <button
                  onClick={() => {
                    const count = sendBulkReminder('mid_month');
                    alert(`âœ… Recordatorio enviado a ${count} usuarios activos`);
                  }}
                  className="bg-[#EC4899]/10 text-[#BE185D] p-3 rounded-lg hover:bg-[#EC4899]/20 text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Enviar Recordatorios
                </button>
              </div>
            </div>

            {/* Google Drive */}
            <div className="bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-xl p-5 border border-[#E4E7EF]">
              <h3 className="text-[#181B34] font-semibold mb-3 flex items-center gap-2">
                <FolderSync size={20} className="text-[#6161FF]" /> SincronizaciÃ³n con Google Drive
              </h3>
              <p className="text-sm text-[#7C8193] mb-3">
                Los datos se exportan como CSV y JSON. Sube los archivos a Google Drive y comparte la carpeta con el equipo.
              </p>
              <a
                href="https://drive.google.com/drive/my-drive"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#6161FF] hover:underline"
              >
                Abrir Google Drive â†’
              </a>
            </div>
          </div>
        )}

        {/* TAB DE MEMBRESÃAS */}
        {activeTab === 'memberships' && (
          <MembershipAdminTab users={realUsers} />
        )}

        {/* TAB DE CUMPLIMIENTO */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#181B34]">Dashboard de Cumplimiento</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const pushCount = countUsersWithPush();
                    if (pushCount === 0) {
                      alert('âš ï¸ NingÃºn usuario tiene notificaciones push activas');
                      return;
                    }
                    const sent = sendPushToAll('ðŸ“¢ Recordatorio de Tribu', 'Â¡No olvides completar tus 10+10 esta semana!');
                    alert(`âœ… Push enviado a ${sent} usuarios`);
                  }}
                  className="bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white px-4 py-2 rounded-lg hover:opacity-90 text-sm font-medium transition flex items-center gap-2"
                >
                  <Zap size={16} /> Push Masivo ({countUsersWithPush()})
                </button>
                <button
                  onClick={() => {
                    const count = sendBulkReminder('mid_month');
                    alert(`âœ… Recordatorio in-app enviado a ${count} usuarios`);
                  }}
                  className="bg-[#A78BFA] text-white px-4 py-2 rounded-lg hover:bg-[#7C3AED] text-sm font-medium transition flex items-center gap-2"
                >
                  <Send size={16} /> Recordatorio In-App
                </button>
              </div>
            </div>

            {/* Resumen visual */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-[#00CA72]/10 to-[#00CA72]/5 rounded-xl p-4 border border-[#00CA72]/20">
                <p className="text-xs text-[#00CA72] font-medium mb-1">EXCELENTE</p>
                <p className="text-3xl font-bold text-[#00CA72]">{complianceStats.excellent}</p>
                <p className="text-xs text-[#7C8193]">80%+ completado</p>
              </div>
              <div className="bg-gradient-to-br from-[#6161FF]/10 to-[#6161FF]/5 rounded-xl p-4 border border-[#6161FF]/20">
                <p className="text-xs text-[#6161FF] font-medium mb-1">BUENO</p>
                <p className="text-3xl font-bold text-[#6161FF]">{complianceStats.good}</p>
                <p className="text-xs text-[#7C8193]">60-79% completado</p>
              </div>
              <div className="bg-gradient-to-br from-[#FFCC00]/10 to-[#FFCC00]/5 rounded-xl p-4 border border-[#FFCC00]/20">
                <p className="text-xs text-[#9D6B00] font-medium mb-1">ADVERTENCIA</p>
                <p className="text-3xl font-bold text-[#9D6B00]">{complianceStats.warning}</p>
                <p className="text-xs text-[#7C8193]">30-59% completado</p>
              </div>
              <div className="bg-gradient-to-br from-[#FB275D]/10 to-[#FB275D]/5 rounded-xl p-4 border border-[#FB275D]/20">
                <p className="text-xs text-[#FB275D] font-medium mb-1">CRÃTICO</p>
                <p className="text-3xl font-bold text-[#FB275D]">{complianceStats.critical}</p>
                <p className="text-xs text-[#7C8193]">&lt;30% completado</p>
              </div>
            </div>

            {/* Tabla de cumplimiento */}
            <div className="bg-white rounded-xl border border-[#E4E7EF] overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-[#F5F7FB]">
                  <tr>
                    <th className="text-left text-[#7C8193] text-sm font-medium px-4 py-3">Usuario</th>
                    <th className="text-center text-[#7C8193] text-sm font-medium px-4 py-3">Yo comparto</th>
                    <th className="text-center text-[#7C8193] text-sm font-medium px-4 py-3">Me comparten</th>
                    <th className="text-center text-[#7C8193] text-sm font-medium px-4 py-3">Total</th>
                    <th className="text-center text-[#7C8193] text-sm font-medium px-4 py-3">Estado</th>
                    <th className="text-right text-[#7C8193] text-sm font-medium px-4 py-3">AcciÃ³n</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EF]">
                  {complianceData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[#7C8193]">
                        No hay datos de cumplimiento aÃºn
                      </td>
                    </tr>
                  ) : (
                    complianceData.map((c) => (
                      <tr key={c.userId} className="hover:bg-[#F5F7FB]/50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-[#181B34] text-sm font-medium">{c.userName}</p>
                            <p className="text-[#7C8193] text-xs">{c.companyName}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium text-[#181B34]">{c.toShareCompleted}/10</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium text-[#181B34]">{c.shareWithMeCompleted}/10</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-[#E4E7EF] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${c.status === 'excellent' ? 'bg-[#00CA72]' :
                                  c.status === 'good' ? 'bg-[#6161FF]' :
                                    c.status === 'warning' ? 'bg-[#FFCC00]' : 'bg-[#FB275D]'
                                  }`}
                                style={{ width: `${c.percentageComplete}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-[#181B34]">{c.percentageComplete}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${c.status === 'excellent' ? 'bg-[#00CA72]/10 text-[#00CA72]' :
                            c.status === 'good' ? 'bg-[#6161FF]/10 text-[#6161FF]' :
                              c.status === 'warning' ? 'bg-[#FFCC00]/10 text-[#9D6B00]' :
                                'bg-[#FB275D]/10 text-[#FB275D]'
                            }`}>
                            {c.status === 'excellent' ? 'â­ Excelente' :
                              c.status === 'good' ? 'ðŸ‘ Bueno' :
                                c.status === 'warning' ? 'âš ï¸ Advertencia' : 'ðŸš¨ CrÃ­tico'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              createReminder(c.userId, 'mid_month');
                              alert(`Recordatorio enviado a ${c.userName}`);
                            }}
                            className="text-[#A78BFA] hover:text-[#7C3AED] text-sm font-medium"
                          >
                            Recordar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB DE REGISTROS DE SHARES */}
        {activeTab === 'shares' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#181B34]">Registros de Compartidos</h1>
              <span className="text-sm text-[#7C8193]">{getShareRecords().length} registros totales</span>
            </div>

            <p className="text-sm text-[#7C8193] bg-[#F5F7FB] p-4 rounded-xl border border-[#E4E7EF]">
              AquÃ­ puedes ver todos los enlaces registrados por los usuarios cuando reportan haber compartido contenido o haberlo recibido.
              Estos datos sirven para verificar el cumplimiento real de las asignaciones.
            </p>

            <div className="bg-white rounded-xl border border-[#E4E7EF] overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-[#F5F7FB]">
                  <tr>
                    <th className="text-left text-[#7C8193] text-sm font-medium px-4 py-3">Fecha</th>
                    <th className="text-left text-[#7C8193] text-sm font-medium px-4 py-3">Tipo</th>
                    <th className="text-left text-[#7C8193] text-sm font-medium px-4 py-3">Usuario</th>
                    <th className="text-left text-[#7C8193] text-sm font-medium px-4 py-3">Perfil Relacionado</th>
                    <th className="text-left text-[#7C8193] text-sm font-medium px-4 py-3">Enlace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EF]">
                  {getShareRecords().length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[#7C8193]">
                        No hay registros de compartidos aÃºn. Los usuarios pueden registrar sus shares desde el checklist.
                      </td>
                    </tr>
                  ) : (
                    getShareRecords()
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((record: ShareRecord) => {
                        const user = realUsers.find(u => u.id === record.userId);
                        return (
                          <tr key={record.id} className="hover:bg-[#F5F7FB]/50">
                            <td className="px-4 py-3 text-sm text-[#434343]">
                              {new Date(record.timestamp).toLocaleDateString('es-CL', {
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${record.type === 'shared_to'
                                ? 'bg-[#6161FF]/10 text-[#6161FF]'
                                : 'bg-[#00CA72]/10 text-[#00CA72]'
                                }`}>
                                {record.type === 'shared_to' ? 'ðŸ“¤ CompartiÃ³' : 'ðŸ“¥ RecibiÃ³'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-[#181B34] font-medium">
                              {user?.name || record.userId}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#434343]">
                              {record.profileName}
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href={record.contentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#6161FF] hover:underline text-sm truncate block max-w-[200px]"
                              >
                                {record.contentUrl.length > 40
                                  ? record.contentUrl.substring(0, 40) + '...'
                                  : record.contentUrl}
                              </a>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#181B34]">GestiÃ³n de Usuarios</h1>
              <button className="bg-[#6161FF] text-white px-4 py-2 rounded-lg hover:bg-[#5050DD] text-sm font-medium transition">
                Exportar CSV
              </button>
            </div>
            <div className="bg-white rounded-xl border border-[#E4E7EF] overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-[#F5F7FB]">
                  <tr>
                    <th className="text-left text-[#7C8193] text-sm font-medium px-4 py-3">Usuario</th>
                    <th className="text-left text-[#7C8193] text-sm font-medium px-4 py-3">Empresa</th>
                    <th className="text-left text-[#7C8193] text-sm font-medium px-4 py-3">Estado</th>
                    <th className="text-right text-[#7C8193] text-sm font-medium px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EF]">
                  {realUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-[#7C8193]">
                        No hay usuarios registrados aÃºn
                      </td>
                    </tr>
                  ) : (
                    realUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[#F5F7FB]/50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-[#181B34] text-sm font-medium">{user.name}</p>
                            <p className="text-[#7C8193] text-xs">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-[#181B34] text-sm">{user.companyName}</p>
                            <p className="text-[#7C8193] text-xs">{user.city}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${user.status === 'pending' ? 'bg-[#FFCC00]/10 text-[#9D6B00]' :
                            user.status === 'suspended' ? 'bg-[#FB275D]/10 text-[#FB275D]' :
                              'bg-[#00CA72]/10 text-[#00CA72]'
                            }`}>
                            {user.status === 'pending' ? 'pendiente' : user.status === 'suspended' ? 'suspendido' : 'activo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => navigate(`/profile/${user.id}`)}
                            className="text-[#6161FF] hover:text-[#5050DD] text-sm font-medium"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#181B34]">Solicitudes de Ayuda</h1>
              <div className="flex gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-[#FFCC00]/10 text-[#9D6B00]">
                  {realReports.filter((r: Report | { status?: string }) => !r.status || r.status === 'pending').length} pendientes
                </span>
                <span className="px-3 py-1 rounded-full bg-[#A78BFA]/10 text-[#7C3AED]">
                  {realReports.filter((r: Report | { status?: string }) => r.status === 'in_review').length} en revisiÃ³n
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {realReports.length === 0 ? (
                <div className="bg-white rounded-xl p-8 border border-[#E4E7EF] shadow-sm text-center">
                  <CheckCircle size={48} className="mx-auto text-[#00CA72] mb-4" />
                  <p className="text-[#181B34] font-medium">Â¡Todo en orden!</p>
                  <p className="text-xs text-[#7C8193] mt-2">No hay reportes pendientes por revisar</p>
                </div>
              ) : (
                realReports.map((report: Report | { targetId?: string; targetUserId?: string; reason: string; timestamp?: string; createdAt?: string; status?: string; fromUserId?: string; id?: string; adminNotes?: string }, i: number) => {
                  const reportAny = report as { targetId?: string; targetUserId?: string; timestamp?: string; createdAt?: string;[key: string]: unknown };
                  const targetUser = realUsers.find(u => u.id === (reportAny.targetId || reportAny.targetUserId));
                  const fromUser = realUsers.find(u => u.id === report.fromUserId);
                  const reportId = report.id || `legacy_${i}`;
                  const status = report.status || 'pending';
                  const timestamp = reportAny.timestamp || reportAny.createdAt || new Date().toISOString();

                  const statusStyles: Record<string, string> = {
                    pending: 'bg-[#FFCC00]/10 text-[#9D6B00]',
                    in_review: 'bg-[#A78BFA]/10 text-[#7C3AED]',
                    resolved: 'bg-[#00CA72]/10 text-[#00CA72]',
                    sanctioned: 'bg-[#FB275D]/10 text-[#FB275D]',
                    dismissed: 'bg-[#7C8193]/10 text-[#7C8193]'
                  };

                  const statusLabels: Record<string, string> = {
                    pending: 'â³ Pendiente',
                    in_review: 'ðŸ” En revisiÃ³n',
                    resolved: 'âœ… Resuelto',
                    sanctioned: 'ðŸš« Sancionado',
                    dismissed: 'âŒ Desestimado'
                  };

                  return (
                    <div key={reportId} className={`bg-white rounded-xl p-5 border shadow-sm ${status === 'pending' ? 'border-[#FFCC00]/30' :
                      status === 'in_review' ? 'border-[#A78BFA]/30' : 'border-[#E4E7EF]'
                      }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[#181B34] font-semibold">
                            {fromUser?.companyName || 'Usuario'} â†’ {targetUser?.name || targetUser?.companyName || 'Usuario'}
                          </p>
                          <p className="text-[#7C8193] text-xs">
                            {new Date(timestamp).toLocaleDateString('es-CL', {
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyles[status]}`}>
                          {statusLabels[status]}
                        </span>
                      </div>

                      <p className="text-[#434343] mb-3 p-3 bg-[#F5F7FB] rounded-lg text-sm">"{report.reason}"</p>

                      {report.adminNotes && (
                        <div className="mb-3 p-3 bg-[#E8D5FF]/20 rounded-lg border border-[#E8D5FF]">
                          <p className="text-xs text-[#7C3AED] font-medium mb-1">Notas del admin:</p>
                          <p className="text-sm text-[#434343]">{report.adminNotes}</p>
                        </div>
                      )}

                      {(status === 'pending' || status === 'in_review') && (
                        <div className="flex gap-2 flex-wrap">
                          {status === 'pending' && (
                            <button
                              onClick={() => {
                                if (report.id) {
                                  updateReportStatus(report.id, 'in_review');
                                  showToast('ðŸ“‹ Reporte en revisiÃ³n');
                                  refreshData();
                                }
                              }}
                              className="flex-1 bg-[#A78BFA] text-white py-2 rounded-lg hover:bg-[#7C3AED] text-sm font-medium transition flex items-center justify-center gap-1"
                            >
                              <Clock size={14} /> Revisar
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const notes = prompt('Notas de resoluciÃ³n (opcional):');
                              if (report.id) {
                                updateReportStatus(report.id, 'resolved', notes || null);
                                showToast('âœ… Reporte marcado como resuelto');
                                refreshData();
                              }
                            }}
                            className="flex-1 bg-[#00CA72] text-white py-2 rounded-lg hover:bg-[#00B366] text-sm font-medium transition"
                          >
                            âœ“ Resolver
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Â¿Sancionar a este usuario? Se suspenderÃ¡ su cuenta.')) {
                                const notes = prompt('Motivo de la sanciÃ³n:');
                                if (report.id) {
                                  updateReportStatus(report.id, 'sanctioned', notes || null);
                                  showToast('ðŸš« Usuario sancionado y cuenta suspendida');
                                  refreshData();
                                }
                              }
                            }}
                            className="flex-1 bg-[#FB275D] text-white py-2 rounded-lg hover:bg-[#E01F50] text-sm font-medium transition"
                          >
                            ðŸš« Sancionar
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Motivo del desestimo:');
                              if (report.id) {
                                updateReportStatus(report.id, 'dismissed', notes || null);
                                showToast('Reporte desestimado');
                                refreshData();
                              }
                            }}
                            className="bg-[#7C8193]/10 text-[#7C8193] py-2 px-3 rounded-lg hover:bg-[#7C8193]/20 text-sm font-medium transition"
                          >
                            Desestimar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <AdminSettingsTab />
        )}
      </main>
    </div>
  );
};

// Banner de recordatorio de perfil incompleto
const ProfileReminderBanner = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [dismissed, setDismissed] = useState(false);

  if (!currentUser || dismissed) return null;

  const validation = validateUserProfile(currentUser);
  if (validation.isComplete) return null;

  return (
    <div className="profile-reminder-banner animate-slideDown">
      <div className="w-10 h-10 bg-[#FFCC00] rounded-full flex items-center justify-center flex-shrink-0">
        <AlertCircle size={20} className="text-[#181B34]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#181B34]">
          âš ï¸ Recuerda completar tus datos
        </p>
        <p className="text-xs text-[#7C8193] mt-0.5">
          Faltan: {validation.missingFields.slice(0, 2).join(', ')}{validation.missingFields.length > 2 ? ` y ${validation.missingFields.length - 2} mÃ¡s` : ''}
        </p>
      </div>
      <button
        onClick={() => navigate('/my-profile')}
        className="px-3 py-1.5 bg-[#FFCC00] text-[#181B34] rounded-lg text-xs font-semibold hover:bg-[#E0A800] transition flex-shrink-0"
      >
        Completar
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-[#7C8193] hover:text-[#181B34] transition flex-shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Componente de ruta protegida para miembros - solo valida sesiÃ³n + membresÃ­a activa
const MemberRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) {
        navigate('/');
        return;
      }

      setAccessGranted(false);

      // Mantener actualizado el flag de perfil completo (no bloquea navegaciÃ³n)
      const validation = validateUserProfile(currentUser);
      await syncProfileCompletionState(currentUser, validation.isComplete);

      // Verificar membresÃ­a
      const status = localStorage.getItem(`membership_status_${currentUser.id}`);
      const paymentMetaRaw = localStorage.getItem(`membership_payment_${currentUser.id}`);

      const trialIsValid = () => {
        if (!paymentMetaRaw) return false;
        try {
          const meta = JSON.parse(paymentMetaRaw);
          return meta.expiresAt ? new Date(meta.expiresAt) > new Date() : false;
        } catch {
          return false;
        }
      };

      if (status === 'miembro' || status === 'admin' || (status === 'trial' && trialIsValid())) {
        setAccessGranted(true);
        return;
      }

      // Verificar en Firebase
      try {
        const { getFirestoreInstance } = await import('./services/firebaseService');
        const { doc, getDoc } = await import('firebase/firestore');
        const db = getFirestoreInstance();
        if (db) {
          const membershipDoc = await getDoc(doc(db, 'memberships', currentUser.id));
          if (membershipDoc.exists()) {
            const data = membershipDoc.data();
            const isActive = data.status === 'miembro' || data.status === 'admin' || (
              data.status === 'trial' &&
              data.expiresAt &&
              new Date(data.expiresAt) > new Date()
            );

            if (isActive) {
              syncMembershipToLocalCache(currentUser.id, data as CloudMembership);
              setAccessGranted(true);
              return;
            }
          }
        }
      } catch (err) {
        console.log('Error verificando membresÃ­a:', err);
      }

      // No es miembro, redirigir a membership
      navigate('/membership');
    };

    checkAccess();
  }, [currentUser, navigate]);

  if (!accessGranted) {
    return <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#6161FF] border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return <>{children}</>;
};


};

const App = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default App;
