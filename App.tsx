
import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Activity, Users, Settings, LogOut, User as UserIcon, CheckCircle, ArrowRight, Briefcase, Sparkles, MapPin, Globe, Instagram, Calendar, ArrowLeft, Bell, Edit2, Save, X, Share2, Download, FolderSync, TrendingUp, AlertTriangle, AlertCircle, Clock, Send, HelpCircle, ChevronRight, BarChart3, RefreshCw, Zap, Lock, CreditCard, Crown, Gift, Home } from 'lucide-react';
import { GlassCard } from './components/GlassCard';
import { AcademiaView } from './components/academia/AcademiaView';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { TribalLoadingAnimation } from './components/TribalAnimation';
import { CosmicLoadingAnimation } from './components/CosmicLoadingAnimation';
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
import { loadRealUsers, validateCredentials, getUserByEmail, changeUserPassword, markFirstLoginComplete, UNIVERSAL_PASSWORD, forceReloadRealUsers } from './services/realUsersData';
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
  // Sincronización con Firestore
  syncProfileToCloud,
  getProfileFromCloud,
  getAllProfilesFromCloud,
  syncChecklistProgress,
  loadChecklistFromFirebase,
  syncAdminConfig,
  loadAdminConfig,
  syncTribeAssignments,
  loadTribeAssignments,
  getFirestoreInstance,
  logInteraction
} from './services/firebaseService';
import { ensureInitialized } from './services/productionInit';

// ============================================
// INICIALIZACIÓN DE PRODUCCIÓN
// ============================================

// Inicializar Firebase y Firestore automáticamente
initializeFirebase();

// Inicializar producción y cargar usuarios
(async () => {
  try {
    await ensureInitialized();
    console.log('✅ Producción inicializada');
    
    // Cargar usuarios REALES + sincronizar con Firebase
    await forceReloadRealUsers();
    console.log('✅ Usuarios cargados y sincronizados');
    
    // Sincronizar fotos de perfil desde Firebase (para ver fotos actualizadas)
    try {
      const { syncPhotosFromFirebase } = await import('./services/firebaseService');
      const photosUpdated = await syncPhotosFromFirebase();
      if (photosUpdated > 0) {
        console.log(`✅ ${photosUpdated} fotos actualizadas desde Firebase`);
      }
    } catch (photoErr) {
      console.log('⚠️ Sync de fotos pendiente');
    }
    
    // Generar asignaciones de tribu si es necesario
    ensureTribeAssignments();
  } catch (err) {
    console.error('❌ Error inicializando:', err);
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
      data.notification.body || 'Nueva notificación'
    );
  }
});

console.log('🚀 Tribu Impulsa v2.0 - PWA Producción');
console.log('📊 Integridad de datos:', checkDataIntegrity());
console.log('🔔 Estado notificaciones:', getNotificationStatus());

// ============================================
// SINCRONIZACIÓN AUTOMÁTICA CON FIRESTORE
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
    console.log('☁️ Usuario sincronizado a la nube:', user.email);
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
    console.log('☁️ Checklist sincronizado:', `${completed}/${total}`);
  } catch (error) {
    console.error('Error sincronizando checklist:', error);
  }
};

// Cargar perfil desde la nube
const loadUserFromCloud = async (userId: string): Promise<UserProfile | null> => {
  try {
    const cloudProfile = await getProfileFromCloud(userId);
    if (cloudProfile) {
      console.log('☁️ Perfil cargado desde la nube:', cloudProfile.email);
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
  { value: 'LOCAL', label: 'LOCAL (sólo si operas en una comuna específica)' },
  { value: 'REGIONAL', label: 'REGIONAL (si cubres una o varias regiones de Chile)' },
  { value: 'NACIONAL', label: 'NACIONAL (llegas a todo Chile)' }
];

const SURVEY_REVENUE_OPTIONS = [
  '1-500.000',
  '500.000 -  1.000.000',
  '1.000.001 - 1.500.000',
  '1.500.001 - 2.000.000',
  '2.000.001 - 3.000.000',
  '3.000.000 +'
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
  targetOwner: string;     // Nombre del dueño
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

  // Key específica por usuario para que cada uno tenga sus propias asignaciones
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

const getStoredTribeStatus = (): TribeStatus => {
  if (typeof window === 'undefined') return 'PENDIENTE';
  return (localStorage.getItem(getUserStorageKey(TRIBE_STATUS_KEY)) as TribeStatus) ?? 'PENDIENTE';
};

const persistTribeStatus = (status: TribeStatus) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserStorageKey(TRIBE_STATUS_KEY), status);
};

const resetTribeStorage = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getUserStorageKey(TRIBE_ASSIGNMENTS_KEY));
  localStorage.removeItem(getUserStorageKey(TRIBE_CHECKLIST_KEY));
  localStorage.removeItem(getUserStorageKey(TRIBE_STATUS_KEY));
  localStorage.removeItem(getUserStorageKey(TRIBE_REPORTS_KEY));
};

const getStoredReports = (): TribeReport[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(getUserStorageKey(TRIBE_REPORTS_KEY));
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Error reading tribe reports', error);
    return [];
  }
};

const persistReport = (report: TribeReport) => {
  if (typeof window === 'undefined') return;
  const current = getStoredReports();
  const next = [...current, report];
  localStorage.setItem(getUserStorageKey(TRIBE_REPORTS_KEY), JSON.stringify(next));
  
  // ☁️ Sincronizar a Firestore
  const userId = localStorage.getItem('tribu_current_user');
  if (userId) {
    logInteraction(userId, 'report', {
      targetId: report.targetId,
      targetName: report.targetName,
      reason: report.reason,
      timestamp: report.timestamp
    });
  }
};

const getTribeStatsSnapshot = (userCategory: string, userId?: string) => {
  const assignments = getStoredTribeAssignments(userCategory, userId);
  const checklist = getStoredChecklistState(assignments);
  const completed = Object.values(checklist.toShare).filter(Boolean).length + Object.values(checklist.shareWithMe).filter(Boolean).length;
  const total = assignments.toShare.length + assignments.shareWithMe.length;
  const reports = getStoredReports().length;
  const syncedAt = getTribeSyncedAt();
  return {
    completed,
    total,
    pending: Math.max(total - completed, 0),
    reports,
    syncedAt
  };
};

type SurveyFormState = {
  email: string;
  name: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  website: string;
  otherChannel: string;
  phone: string;
  city: string;
  category: string;
  affinity: string;
  scope: string;
  sector: string;
  comuna: string;           // Para alcance LOCAL
  selectedRegions: string[]; // Para alcance REGIONAL (array de IDs de región)
  revenue: string;
  copyResponse: boolean;
};

const SURVEY_STORAGE_KEY = 'tribuSurveyResponse';

const getStoredSurveyResponse = (): SurveyFormState | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SURVEY_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Error reading survey response', error);
    return null;
  }
};

const hasCompletedSurvey = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(SURVEY_STORAGE_KEY));
};

const persistSurveyResponse = (data: SurveyFormState) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(data));
};

const EMPTY_SURVEY_FORM: SurveyFormState = {
  email: '',
  name: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  website: '',
  otherChannel: '',
  phone: '',
  city: '',
  category: '',
  affinity: '',
  scope: '',
  sector: '',
  comuna: '',
  selectedRegions: [],
  revenue: '',
  copyResponse: false,
};

const useSurveyGuard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!hasCompletedSurvey()) {
      navigate('/survey', { replace: true });
    }
  }, [navigate]);
};

// ============================================
// VALIDACIÓN DE PERFIL COMPLETO - CAMPOS OBLIGATORIOS
// ============================================

type ProfileValidation = {
  isComplete: boolean;
  missingFields: string[];
  completionPercent: number;
};

const MANDATORY_FIELDS = [
  { key: 'name', label: 'Nombre' },
  { key: 'companyName', label: 'Nombre de tu emprendimiento' },
  { key: 'category', label: 'Giro / Rubro' },
  { key: 'affinity', label: 'Afinidad / Intereses' },
  { key: 'scope', label: 'Alcance geográfico' },
  { key: 'phone', label: 'Teléfono / WhatsApp' },
];

const validateUserProfile = (user: UserProfile | null): ProfileValidation => {
  if (!user) {
    return { isComplete: false, missingFields: MANDATORY_FIELDS.map(f => f.label), completionPercent: 0 };
  }

  const missingFields: string[] = [];
  
  // Validar campos básicos obligatorios
  if (!user.name?.trim()) missingFields.push('Nombre');
  if (!user.companyName?.trim()) missingFields.push('Nombre de tu emprendimiento');
  if (!user.category?.trim()) missingFields.push('Giro / Rubro');
  if (!user.affinity?.trim()) missingFields.push('Afinidad / Intereses');
  if (!user.scope) missingFields.push('Alcance geográfico');
  if (!user.phone?.trim() && !user.whatsapp?.trim()) missingFields.push('Teléfono / WhatsApp');

  // Validación especial para geografía según alcance
  if (user.scope === 'LOCAL' && !user.comuna) {
    missingFields.push('Comuna (requerida para alcance LOCAL)');
  }
  if (user.scope === 'REGIONAL' && (!user.selectedRegions || user.selectedRegions.length === 0)) {
    missingFields.push('Regiones (requeridas para alcance REGIONAL)');
  }

  const totalFields = MANDATORY_FIELDS.length + 1; // +1 por geografía
  const completedFields = totalFields - missingFields.length;
  const completionPercent = Math.round((completedFields / totalFields) * 100);

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercent
  };
};

const isProfileComplete = (user: UserProfile | null): boolean => {
  return validateUserProfile(user).isComplete;
};

// --- Components defined here for file constraint compliance ---

// Auth storage
const AUTH_SESSION_KEY = 'tribuUserSession';

type UserSession = {
  email: string;
  name: string;
  isLoggedIn: boolean;
};

const getStoredSession = (): UserSession | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

const setStoredSession = (session: UserSession) => {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};

const clearStoredSession = () => {
  localStorage.removeItem(AUTH_SESSION_KEY);
};

// Helper para obtener configuración global de la app
const getAppConfig = () => {
  const savedConfig = localStorage.getItem('tribu_admin_config');
  const defaults = {
    membershipPrice: 20000,
    matchesPerUser: 10,
    whatsappSupport: '+56951776005',
    appName: 'Tribu Impulsa',
    mercadopagoMode: 'sandbox'
  };
  if (!savedConfig) return defaults;
  try {
    return { ...defaults, ...JSON.parse(savedConfig) };
  } catch {
    return defaults;
  }
};

// Cargar config desde Firebase y sincronizar con localStorage
const initAppConfigFromFirebase = async () => {
  try {
    const firebaseConfig = await loadAdminConfig();
    if (firebaseConfig) {
      localStorage.setItem('tribu_admin_config', JSON.stringify(firebaseConfig));
      console.log('☁️ Config admin cargada desde Firebase');
    }
  } catch (error) {
    console.warn('⚠️ No se pudo cargar config desde Firebase, usando local');
  }
};

// Ejecutar al cargar la app
initAppConfigFromFirebase();

// 1. Login / Landing - FLUJO UNIFICADO SEAMLESS
const LoginScreen = () => {
  const navigate = useNavigate();
  // Estados del flujo - ahora incluye 'landing' como primera pantalla
  const [step, setStep] = useState<'landing' | 'email' | 'password' | 'register'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  
  // Datos de registro (si es usuario nuevo)
  const [registerData, setRegisterData] = useState({
    name: '',
    companyName: '',
    instagram: '',
    phone: '',
    category: '',
    subcategory: '',
    affinity: ''
  });
  
  // Sistema de categorías anidadas
  const CATEGORY_TREE: Record<string, string[]> = {
    'Moda y Accesorios': ['Ropa mujer', 'Ropa hombre', 'Joyas/Bijouterie', 'Zapatos', 'Carteras', 'Anteojos', 'Relojes', 'Accesorios varios'],
    'Belleza y Bienestar': ['Peluquería/Barbería', 'Manicure/Pedicure', 'Cejas/Pestañas', 'Estética/Spa', 'Maquillaje', 'Skincare/Cosmética', 'Terapias alternativas', 'Masoterapia'],
    'Salud y Fitness': ['Entrenamiento personal', 'Nutrición', 'Psicología', 'Kinesiología', 'Medicina estética', 'Dentista'],
    'Alimentación y Gastronomía': ['Restaurante/Café', 'Pastelería/Repostería', 'Panadería', 'Comida saludable', 'Productos gourmet', 'Catering', 'Delivery', 'Food truck'],
    'Hogar y Decoración': ['Muebles', 'Decoración', 'Ropa de cama', 'Menaje/Cocina', 'Jardinería/Paisajismo', 'Piscinas'],
    'Arte y Diseño': ['Fotografía/Video', 'Diseño gráfico', 'Ilustración', 'Pintura/Cerámica', 'Producción audiovisual', 'Impresión'],
    'Servicios Profesionales': ['Abogados', 'Contadores', 'Arquitectos', 'Coaching', 'Consultoría', 'Traductores', 'Corredores seguros', 'Corredores propiedades'],
    'Marketing y Digital': ['Marketing digital', 'Redes sociales', 'Desarrollo web', 'E-commerce', 'Branding', 'Publicidad'],
    'Educación': ['Clases particulares', 'Cursos idiomas', 'Talleres arte/música', 'Coaching/Mentoring', 'Capacitación empresarial'],
    'Eventos': ['Matrimonios', 'Cumpleaños', 'Eventos corporativos', 'DJ/Música', 'Arriendo espacios', 'Producción ferias'],
    'Mascotas': ['Peluquería canina', 'Alimentos mascotas', 'Accesorios mascotas', 'Veterinaria', 'Paseo perros', 'Hotel mascotas'],
    'Transporte y Logística': ['Delivery', 'Mudanzas', 'Transporte pasajeros', 'Arriendo vehículos'],
    'Construcción': ['Remodelación', 'Electricidad', 'Gasfitería', 'Carpintería', 'Pintura', 'Paneles solares'],
    'Niños y Bebés': ['Ropa infantil', 'Juguetes', 'Accesorios bebé', 'Fiestas infantiles', 'Educación inicial'],
    'Tecnología': ['Desarrollo software', 'Soporte técnico', 'Venta equipos', 'Ciberseguridad', 'Automatización'],
    'Turismo': ['Agencia viajes', 'Hotelería', 'Guías turísticos', 'Cabañas/Arriendo'],
    'Otro': ['Otro']
  };
  
  const AFFINITY_OPTIONS_REG = [
    'Bienestar y salud',
    'Moda y estilo', 
    'Gastronomía',
    'Familia',
    'Mascotas',
    'Tecnología',
    'Arte y cultura',
    'Deportes',
    'Viajes',
    'Emprendimiento',
    'Sustentabilidad',
    'Educación'
  ];

  // Check existing session
  useEffect(() => {
    const session = getStoredSession();
    if (session?.isLoggedIn) {
      if (hasCompletedSurvey()) navigate('/dashboard');
      else navigate('/survey');
    }
  }, [navigate]);

  // Paso 1: Verificar email
  const handleEmailCheck = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    // Verificar si el email existe
    const existingUser = getUserByEmail(email);
    
    if (existingUser) {
      // Usuario existe → pedir contraseña
      setStep('password');
    } else {
      // Usuario NO existe → mostrar registro
      setStep('register');
    }
  };

  // Paso 2a: Login con contraseña
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password) {
      setError('Por favor ingresa tu contraseña');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const user = validateCredentials(email, password);
      const existingUser = getUserByEmail(email);
      const isProfilePasswordValid = existingUser?.password && existingUser.password === password;
      
      if (user || (existingUser && isProfilePasswordValid)) {
        const loggedUser = user || existingUser;
        completeLogin(loggedUser);
      } else {
        setError('Contraseña incorrecta. Recuerda: TRIBU2026');
      }
      
      setIsLoading(false);
    }, 500);
  };

  // Paso 2b: Registro de nuevo usuario - CON TODOS LOS CAMPOS
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validar TODOS los campos obligatorios
    if (!registerData.name || !registerData.companyName || !registerData.instagram || !registerData.phone || !registerData.category) {
      setError('Por favor completa TODOS los campos obligatorios');
      return;
    }
    
    // Validar subcategoría si la categoría no es "Otro"
    if (registerData.category !== 'Otro' && CATEGORY_TREE[registerData.category] && !registerData.subcategory) {
      setError('Por favor selecciona qué ofreces específicamente');
      return;
    }
    
    // Validar formato de Instagram
    const instagramHandle = registerData.instagram.startsWith('@') ? registerData.instagram : `@${registerData.instagram}`;
    
    // Combinar categoría y subcategoría para el perfil
    const fullCategory = registerData.subcategory 
      ? `${registerData.category} - ${registerData.subcategory}` 
      : registerData.category;

    setIsLoading(true);
    
    try {
      const { registerNewUser } = await import('./services/realUsersData');
      const newUser = await registerNewUser({
        email,
        name: registerData.name,
        companyName: registerData.companyName,
        instagram: instagramHandle,
        phone: registerData.phone,
        category: fullCategory,
        affinity: registerData.affinity || registerData.category // Usar afinidad o categoría como fallback
      });
      
      if (newUser) {
        console.log('✅ Nuevo usuario registrado:', newUser.name, fullCategory);
        completeLogin(newUser);
      } else {
        setError('Error al registrar. Intenta de nuevo.');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      setError('Error al registrar. Intenta de nuevo.');
    }
    
    setIsLoading(false);
  };

  // Función común para completar el login
  const completeLogin = async (loggedUser: any) => {
    const session: UserSession = {
      email: loggedUser.email,
      name: loggedUser.name,
      isLoggedIn: true
    };
    setStoredSession(session);
    setCurrentUser(loggedUser.id);
    localStorage.setItem('tribu_current_user', loggedUser.id);
    
    // Sincronizar notificaciones desde Firebase
    syncNotificationsFromFirebase(loggedUser.id);
    
    const surveyData = {
      email: loggedUser.email,
      name: loggedUser.name,
      phone: loggedUser.phone || '',
      instagram: loggedUser.instagram || '',
      city: loggedUser.city || '',
      category: loggedUser.category || '',
      affinity: loggedUser.affinity || loggedUser.category || '',
      scope: loggedUser.scope || 'NACIONAL',
      revenue: loggedUser.revenue || '',
      comuna: loggedUser.comuna || '',
      selectedRegions: loggedUser.selectedRegions || []
    };
    localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(surveyData));
    
    // Solo mostrar popup de cambio de contraseña si:
    // 1. Es firstLogin Y
    // 2. La contraseña actual es TRIBU2026 (no la ha cambiado)
    // 3. No ha cambiado su contraseña previamente
    const hasDefaultPassword = (loggedUser as { password?: string }).password === 'TRIBU2026';
    const hasChangedPassword = localStorage.getItem(`password_changed_${loggedUser.id}`) === 'true';
    
    if ((loggedUser as { firstLogin?: boolean }).firstLogin && hasDefaultPassword && !hasChangedPassword) {
      localStorage.setItem('show_password_change', 'true');
    }
    
    // Verificar membresía
    const membershipStatus = localStorage.getItem(`membership_status_${loggedUser.id}`);
    
    // Si no tiene membresía, verificar en Firebase
    if (!membershipStatus) {
      try {
        const { getFirestoreInstance } = await import('./services/firebaseService');
        const { doc, getDoc } = await import('firebase/firestore');
        const db = getFirestoreInstance();
        if (db) {
          const membershipDoc = await getDoc(doc(db, 'memberships', loggedUser.id));
          if (membershipDoc.exists()) {
            const membership = membershipDoc.data();
            localStorage.setItem(`membership_status_${loggedUser.id}`, membership.status);
            if (membership.status === 'miembro' || membership.status === 'admin') {
              navigate('/searching');
              return;
            }
          }
        }
      } catch (err) {
        console.log('⚠️ Error verificando membresía:', err);
      }
      
      // Usuario nuevo sin membresía → pantalla de pago
      navigate('/membership');
      return;
    }
    
    // Si ya es miembro → continuar
    if (membershipStatus === 'miembro' || membershipStatus === 'admin') {
      navigate('/searching');
    } else {
      // Es invitado → pantalla de pago
      navigate('/membership');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative bg-[#F5F7FB]">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#6161FF]/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#00CA72]/10 blur-[100px]" />
        <div className="absolute top-[30%] left-[20%] w-[200px] h-[200px] rounded-full bg-[#FFCC00]/10 blur-[60px]" />
      </div>

      {/* Logo grande */}
      <div className="mb-4 flex justify-center">
        <img 
          src="/NuevoLogo.jpeg" 
          alt="Tribu Impulsa" 
          className="w-[90%] max-w-[380px] object-contain"
        />
      </div>

      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-[#E4E7EF]">
        
        {/* PASO 0: Landing / Bienvenida */}
        {step === 'landing' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#181B34] text-center">¡Bienvenido/a a Tribu Impulsa!</h2>
            <p className="text-[#7C8193] text-sm text-center">
              La comunidad donde emprendedores <span className="text-[#6161FF] font-semibold">crecen juntos</span>
            </p>
            
            {/* Explicación visual */}
            <div className="space-y-3 my-6">
              <div className="flex items-start gap-3 bg-[#F5F7FB] rounded-xl p-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6161FF] to-[#00CA72] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#181B34]">Tu Tribu Mensual</p>
                  <p className="text-xs text-[#7C8193]">Cada mes recibes 10 emprendedores para impulsar y 10 que te impulsan a ti</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-[#F5F7FB] rounded-xl p-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00CA72] to-[#4AE698] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Share2 size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#181B34]">Impulso Mutuo</p>
                  <p className="text-xs text-[#7C8193]">Compartes en tus redes y ellos comparten las tuyas. Todos ganan exposición</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-[#F5F7FB] rounded-xl p-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FFCC00] to-[#FF9500] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#181B34]">Matching Inteligente</p>
                  <p className="text-xs text-[#7C8193]">El algoritmo te conecta con emprendedores complementarios, nunca competencia</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setStep('email')}
              className="w-full bg-gradient-to-r from-[#6161FF] to-[#8B8BFF] text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-[0_8px_20px_rgba(97,97,255,0.35)] transition-all shadow-md flex items-center justify-center gap-3 group"
            >
              Comenzar
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
            </button>
            
            <p className="text-[10px] text-[#B3B8C6] text-center mt-2">
              ¿Ya tienes cuenta? Ingresa tu email para continuar
            </p>
          </div>
        )}
        
        {/* PASO 1: Email */}
        {step === 'email' && (
          <>
            <p className="text-[#7C8193] mb-6 text-sm text-center -mt-2">
              Conecta, colabora y crece con el <span className="text-[#6161FF] font-semibold">Algoritmo Tribal</span>.
            </p>
          <form onSubmit={handleEmailCheck} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3.5 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                placeholder="tu@email.com"
                autoFocus
              />
            </div>
            
            {error && <p className="text-[#FB275D] text-sm text-center">{error}</p>}
            
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-[#6161FF] to-[#8B8BFF] text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-[0_8px_20px_rgba(97,97,255,0.35)] transition-all shadow-md flex items-center justify-center gap-3 group"
            >
              Continuar
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
            </button>
          </form>
          </>
        )}

        {/* PASO 2a: Contraseña (usuario existente) */}
        {step === 'password' && (
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="bg-[#E6FFF3] border border-[#00CA72]/30 rounded-xl p-3 mb-2">
              <p className="text-[#008A4E] text-sm font-medium">✅ ¡Te encontramos!</p>
              <p className="text-[#008A4E]/80 text-xs">{email}</p>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3.5 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                placeholder="TRIBU2026"
                autoFocus
              />
              <p className="text-[10px] text-[#7C8193] mt-1">Contraseña inicial: TRIBU2026</p>
            </div>
            
            {error && <p className="text-[#FB275D] text-sm text-center">{error}</p>}
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#00CA72] to-[#4AE698] text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-[0_8px_20px_rgba(0,202,114,0.35)] transition-all shadow-md flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
              {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>}
            </button>
            
            <button 
              type="button"
              onClick={() => { setStep('email'); setError(''); setPassword(''); }}
              className="w-full text-[#7C8193] hover:text-[#6161FF] text-sm transition-colors"
            >
              ← Cambiar email
            </button>
          </form>
        )}

        {/* PASO 2b: Registro (usuario nuevo) - FORMULARIO COMPLETO */}
        {step === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-left">
            <div className="bg-[#6161FF]/10 border border-[#6161FF]/30 rounded-xl p-3 mb-2">
              <p className="text-[#6161FF] text-sm font-medium">🎉 ¡Bienvenido/a a la Tribu!</p>
              <p className="text-[#6161FF]/80 text-xs">Completa tus datos para que podamos asignarte tu grupo 10+10</p>
            </div>
            
            <div className="bg-[#F5F7FB] rounded-xl p-2.5 text-sm text-[#434343]">
              📧 {email}
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Tu nombre completo *</label>
              <input 
                type="text" 
                value={registerData.name}
                onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                placeholder="María González"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Nombre de tu emprendimiento *</label>
              <input 
                type="text" 
                value={registerData.companyName}
                onChange={(e) => setRegisterData({...registerData, companyName: e.target.value})}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                placeholder="Mi Empresa"
                required
              />
            </div>
            
            {/* Categoría madre */}
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Rubro principal *</label>
              <select 
                value={registerData.category}
                onChange={(e) => setRegisterData({...registerData, category: e.target.value, subcategory: ''})}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                required
              >
                <option value="">Selecciona tu rubro...</option>
                {[...TRIBE_CATEGORY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Subcategoría - aparece solo si hay categoría */}
            {registerData.category && CATEGORY_TREE[registerData.category] && (
              <div>
                <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Específico *</label>
                <select 
                  value={registerData.subcategory}
                  onChange={(e) => setRegisterData({...registerData, subcategory: e.target.value})}
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                  required
                >
                  <option value="">¿Qué ofreces específicamente?</option>
                  {CATEGORY_TREE[registerData.category].map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Afinidad / Estilo de vida */}
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Afinidad / Estilo de vida</label>
              <select 
                value={registerData.affinity}
                onChange={(e) => setRegisterData({...registerData, affinity: e.target.value})}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
              >
                <option value="">¿Con qué te identificas? (opcional)</option>
                {AFFINITY_OPTIONS_REG.map(aff => (
                  <option key={aff} value={aff}>{aff}</option>
                ))}
              </select>
              <p className="text-[9px] text-[#7C8193] mt-0.5">Ayuda al algoritmo a conectarte mejor</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Instagram *</label>
                <input 
                  type="text" 
                  value={registerData.instagram}
                  onChange={(e) => setRegisterData({...registerData, instagram: e.target.value})}
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                  placeholder="@usuario"
                  required
                />
                <p className="text-[9px] text-[#7C8193] mt-0.5">⚠️ Debe ser público</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Teléfono *</label>
                <input 
                  type="tel" 
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                  placeholder="+56912345678"
                  required
                />
              </div>
            </div>
            
            {error && <p className="text-[#FB275D] text-sm text-center">{error}</p>}
            
            <button 
              type="submit"
              disabled={isLoading || !registerData.name || !registerData.companyName || !registerData.category || !registerData.instagram || !registerData.phone || (registerData.category !== 'Otro' && CATEGORY_TREE[registerData.category] && !registerData.subcategory)}
              className="w-full bg-gradient-to-r from-[#00CA72] to-[#4AE698] text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-[0_8px_20px_rgba(0,202,114,0.35)] transition-all shadow-md flex items-center justify-center gap-3 group disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Registrando...' : '¡Unirme a la Tribu!'}
              {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>}
            </button>
            
            <button 
              type="button"
              onClick={() => { setStep('email'); setError(''); }}
              className="w-full text-[#7C8193] hover:text-[#6161FF] text-sm transition-colors"
            >
              ← Cambiar email
            </button>
            
            <p className="text-[10px] text-[#7C8193] text-center">
              Tu contraseña inicial será: <strong>TRIBU2026</strong><br/>
              Podrás cambiarla después en tu perfil
            </p>
          </form>
        )}
        
        {/* Menú protegido para uso interno */}
        {!devMode ? (
          <div className="mt-4 flex items-center gap-2">
            <input
              type="password"
              value={devPassword}
              onChange={(e) => setDevPassword(e.target.value)}
              placeholder="PIN"
              className="w-16 text-center text-xs bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg px-2 py-1.5"
            />
            <button
              onClick={() => devPassword === '1234' && setDevMode(true)}
              className="text-[10px] text-[#B3B8C6] hover:text-[#7C8193] transition"
            >
              ⚙️
            </button>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-xl border border-[#E4E7EF]">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] text-[#6161FF] uppercase tracking-wide font-bold">🔐 Modo Desarrollo</p>
              <button onClick={() => setDevMode(false)} className="text-[10px] text-[#7C8193] hover:text-[#FB275D]">✕</button>
            </div>
            <p className="text-[10px] text-[#7C8193] mb-2">Contraseña universal: TRIBU2026</p>
            <div className="space-y-1 text-xs text-left">
              <button 
                onClick={() => { setEmail('dafnafinkelstein@gmail.com'); setPassword('TRIBU2026'); }}
                className="block w-full text-left px-2 py-1.5 hover:bg-white rounded text-[#181B34] hover:text-[#6161FF] transition"
              >
                👉 Dafna - By Turquía
              </button>
              <button 
                onClick={() => { setEmail('doraluz@terraflorpaisajismo.cl'); setPassword('TRIBU2026'); }}
                className="block w-full text-left px-2 py-1.5 hover:bg-white rounded text-[#181B34] hover:text-[#6161FF] transition"
              >
                👉 Doraluz - Terraflor
              </button>
              <button 
                onClick={() => { setEmail('guille@elevatecreativo.com'); setPassword('TRIBU2026'); }}
                className="block w-full text-left px-2 py-1.5 hover:bg-white rounded text-[#181B34] hover:text-[#6161FF] transition"
              >
                👉 Guillermo - Elevate
              </button>
            </div>
            <p className="mt-2 text-[10px] text-[#00CA72] uppercase tracking-widest font-semibold">✓ 107+ Usuarios</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Registration Wizard (Unificado - 5 pasos)
const RegisterScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    // Paso 1: Datos personales
    name: '',
    email: '',
    phone: '',
    password: '',
    // Paso 2: Emprendimiento
    companyName: '',
    city: '',
    sector: '',
    // Paso 3: Giro/Rubro
    category: '',
    // Paso 4: Afinidad
    affinity: '',
    scope: 'NACIONAL' as 'LOCAL' | 'REGIONAL' | 'NACIONAL',
    comuna: '',                    // Para alcance LOCAL
    selectedRegions: [] as string[], // Para alcance REGIONAL
    // Paso 5: Redes
    instagram: '',
    facebook: '',
    tiktok: '',
    website: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedRegionForComuna, setSelectedRegionForComuna] = useState('');

  const totalSteps = 5;
  
  // Comunas filtradas por región seleccionada
  const comunasDeRegion = selectedRegionForComuna
    ? REGIONS.find(r => r.id === selectedRegionForComuna)?.comunas || []
    : [];

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Requerido';
      if (!formData.email.trim()) newErrors.email = 'Requerido';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
      if (!formData.phone.trim()) newErrors.phone = 'Requerido';
      if (!formData.password.trim()) newErrors.password = 'Requerido';
      else if (formData.password.length < 4) newErrors.password = 'Mínimo 4 caracteres';
    } else if (step === 2) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Requerido';
      if (!formData.city.trim()) newErrors.city = 'Requerido';
    } else if (step === 3) {
      if (!formData.category) newErrors.category = 'Selecciona un giro';
    } else if (step === 4) {
      if (!formData.affinity) newErrors.affinity = 'Selecciona una afinidad';
      // Validar geografía según alcance
      if (formData.scope === 'LOCAL' && !formData.comuna) {
        newErrors.comuna = 'Selecciona tu comuna';
      }
      if (formData.scope === 'REGIONAL' && formData.selectedRegions.length === 0) {
        newErrors.selectedRegions = 'Selecciona al menos una región';
      }
    } else if (step === 5) {
      if (!formData.instagram.trim()) newErrors.instagram = 'Instagram es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Guardar en databaseService (DB real) - incluir contraseña en el perfil
      const newUser = createUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password, // Contraseña incluida en el perfil
        companyName: formData.companyName,
        city: formData.city,
        sector: formData.sector || null,
        instagram: formData.instagram,
        facebook: formData.facebook || null,
        tiktok: formData.tiktok || null,
        website: formData.website || null,
        category: formData.category,
        affinity: formData.affinity,
        scope: formData.scope,
        whatsapp: formData.phone // WhatsApp = teléfono por defecto
      });
      
      // Establecer usuario actual con el ID (NO email)
      localStorage.setItem('tribu_current_user', newUser.id);
      
      // ☁️ SINCRONIZAR A FIRESTORE (nube)
      syncUserToCloud(newUser);
      
      // También guardar en formato antiguo para compatibilidad
      const surveyData: SurveyFormState = {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        instagram: formData.instagram,
        facebook: formData.facebook,
        tiktok: formData.tiktok,
        website: formData.website,
        otherChannel: '',
        city: formData.city,
        sector: formData.sector,
        comuna: formData.comuna || '',
        selectedRegions: formData.selectedRegions || [],
        category: formData.category,
        affinity: formData.affinity,
        scope: formData.scope,
        revenue: '',
        copyResponse: false
      };
      persistSurveyResponse(surveyData);
      
      console.log('✅ Usuario registrado en DB:', newUser.id);
      navigate('/searching');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#F5F7FB] relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#6161FF]/8 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-[#00CA72]/8 rounded-full blur-[80px]"></div>

      <div className="bg-white rounded-3xl p-8 max-w-lg w-full relative z-10 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-[#E4E7EF]">
        {/* Header con progreso */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={handleBack} className="text-[#7C8193] hover:text-[#6161FF] p-2">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-2 w-8 rounded-full transition-all duration-500 ${step > i ? 'bg-gradient-to-r from-[#6161FF] to-[#00CA72]' : step === i + 1 ? 'bg-[#6161FF]' : 'bg-[#E4E7EF]'}`} />
            ))}
          </div>
          <span className="text-sm text-[#7C8193]">{step}/{totalSteps}</span>
        </div>

        {/* Paso 1: Datos personales */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center mb-6">
              <img src="/NuevoLogo.jpeg" alt="Tribu Impulsa" className="w-16 h-16 mx-auto mb-3 object-contain" />
              <h2 className="text-2xl font-bold text-[#181B34]">¡Bienvenido/a!</h2>
              <p className="text-[#7C8193] text-sm mt-1">Cuéntanos sobre ti</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Nombre y Apellido *</label>
              <input 
                type="text" 
                className={`w-full bg-[#F5F7FB] border ${errors.name ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                placeholder="Ej. María Pérez"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {errors.name && <p className="text-xs text-[#FB275D] mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Email *</label>
              <input 
                type="email" 
                className={`w-full bg-[#F5F7FB] border ${errors.email ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              {errors.email && <p className="text-xs text-[#FB275D] mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Teléfono *</label>
              <input 
                type="tel" 
                className={`w-full bg-[#F5F7FB] border ${errors.phone ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                placeholder="+56 9 1234 5678"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              {errors.phone && <p className="text-xs text-[#FB275D] mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Contraseña *</label>
              <input 
                type="password" 
                className={`w-full bg-[#F5F7FB] border ${errors.password ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                placeholder="Mínimo 4 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              {errors.password && <p className="text-xs text-[#FB275D] mt-1">{errors.password}</p>}
              <p className="text-[10px] text-[#7C8193] mt-1">Usa esta contraseña para ingresar después</p>
            </div>
          </div>
        )}

        {/* Paso 2: Emprendimiento */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#181B34]">Tu Emprendimiento</h2>
              <p className="text-[#7C8193] text-sm mt-1">Datos de tu negocio</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Nombre del Emprendimiento *</label>
              <input 
                type="text" 
                className={`w-full bg-[#F5F7FB] border ${errors.companyName ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                placeholder="Ej. Cosmética Natural"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
              {errors.companyName && <p className="text-xs text-[#FB275D] mt-1">{errors.companyName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Ciudad *</label>
              <input 
                type="text" 
                className={`w-full bg-[#F5F7FB] border ${errors.city ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                placeholder="Ej. Santiago"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
              {errors.city && <p className="text-xs text-[#FB275D] mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Alcance del Servicio</label>
              <div className="grid grid-cols-3 gap-2">
                {['LOCAL', 'REGIONAL', 'NACIONAL'].map(scope => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => setFormData({...formData, scope: scope as typeof formData.scope})}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${formData.scope === scope ? 'bg-[#6161FF] text-white' : 'bg-[#F5F7FB] border border-[#E4E7EF] text-[#434343] hover:border-[#6161FF]'}`}
                  >
                    {scope}
                  </button>
                ))}
              </div>
            </div>
            {formData.scope === 'LOCAL' && (
              <div className="animate-fadeIn space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Región *</label>
                  <div className="relative">
                    <select
                      className={`w-full bg-[#F5F7FB] border ${errors.comuna ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 appearance-none`}
                      value={selectedRegionForComuna}
                      onChange={(e) => {
                        setSelectedRegionForComuna(e.target.value);
                        setFormData({...formData, comuna: ''});
                      }}
                    >
                      <option value="">Selecciona tu región</option>
                      {REGIONS.map(region => (
                        <option key={region.id} value={region.id}>{region.shortName}</option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6161FF] pointer-events-none">▼</span>
                  </div>
                </div>
                {selectedRegionForComuna && (
                  <div>
                    <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Comuna *</label>
                    <div className="relative">
                      <select
                        className={`w-full bg-[#F5F7FB] border ${errors.comuna ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 appearance-none`}
                        value={formData.comuna}
                        onChange={(e) => setFormData({...formData, comuna: e.target.value})}
                      >
                        <option value="">Selecciona tu comuna</option>
                        {comunasDeRegion.map(comuna => (
                          <option key={comuna} value={comuna}>{comuna}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6161FF] pointer-events-none">▼</span>
                    </div>
                  </div>
                )}
                {errors.comuna && <p className="text-xs text-[#FB275D]">{errors.comuna}</p>}
                <p className="text-xs text-[#7C8193]">Solo harás match con emprendedores de tu comuna.</p>
              </div>
            )}
            {formData.scope === 'REGIONAL' && (
              <div className="animate-fadeIn space-y-3">
                <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Regiones de operación *</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {REGIONS.map(region => (
                    <label key={region.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F5F7FB] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedRegions.includes(region.id)}
                        onChange={(e) => {
                          const newRegions = e.target.checked
                            ? [...formData.selectedRegions, region.id]
                            : formData.selectedRegions.filter(r => r !== region.id);
                          setFormData({...formData, selectedRegions: newRegions});
                        }}
                        className="rounded border-[#E4E7EF] text-[#6161FF] focus:ring-[#6161FF]/30"
                      />
                      <span className="text-sm text-[#434343]">{region.shortName}</span>
                    </label>
                  ))}
                </div>
                {errors.selectedRegions && <p className="text-xs text-[#FB275D]">{errors.selectedRegions}</p>}
                <p className="text-xs text-[#7C8193]">Harás match con emprendedores de las regiones seleccionadas.</p>
              </div>
            )}
          </div>
        )}

        {/* Paso 3: Giro/Rubro */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#181B34]">Giro o Rubro</h2>
              <p className="text-[#7C8193] text-sm mt-1">¿En qué categoría está tu negocio?</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Categoría Principal *</label>
              <div className="relative">
                <select 
                  className={`w-full bg-[#F5F7FB] border ${errors.category ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 appearance-none cursor-pointer`}
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Selecciona tu giro</option>
                  {[...SURVEY_CATEGORY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#6161FF]">▼</div>
              </div>
              {errors.category && <p className="text-xs text-[#FB275D] mt-1">{errors.category}</p>}
            </div>
            <p className="text-xs text-[#7C8193] bg-[#F5F7FB] p-3 rounded-lg">
              💡 Selecciona la categoría que mejor describe tu actividad principal. Esto ayuda al algoritmo a encontrar conexiones relevantes.
            </p>
          </div>
        )}

        {/* Paso 4: Afinidad */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#181B34]">Tu Afinidad</h2>
              <p className="text-[#7C8193] text-sm mt-1">¿Con qué tipo de negocios quieres conectar?</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Área de Interés *</label>
              <div className="relative">
                <select 
                  className={`w-full bg-[#F5F7FB] border ${errors.affinity ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 appearance-none cursor-pointer`}
                  value={formData.affinity}
                  onChange={(e) => setFormData({...formData, affinity: e.target.value})}
                >
                  <option value="">Selecciona una afinidad</option>
                  {[...SURVEY_AFFINITY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#6161FF]">▼</div>
              </div>
              {errors.affinity && <p className="text-xs text-[#FB275D] mt-1">{errors.affinity}</p>}
            </div>
            <p className="text-xs text-[#7C8193] bg-[#F5F7FB] p-3 rounded-lg">
              🎯 El algoritmo usará esta información para encontrar negocios complementarios con los que puedas hacer cross-promotion.
            </p>
          </div>
        )}

        {/* Paso 5: Redes Sociales */}
        {step === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#181B34]">Tus Redes</h2>
              <p className="text-[#7C8193] text-sm mt-1">Donde compartirás contenido tribal</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Instagram * (Principal)</label>
              <input 
                type="text" 
                className={`w-full bg-[#F5F7FB] border ${errors.instagram ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                placeholder="@tuinstagram"
                value={formData.instagram}
                onChange={(e) => setFormData({...formData, instagram: e.target.value})}
              />
              {errors.instagram && <p className="text-xs text-[#FB275D] mt-1">{errors.instagram}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Facebook</label>
                <input 
                  type="text" 
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                  placeholder="@facebook"
                  value={formData.facebook}
                  onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">TikTok</label>
                <input 
                  type="text" 
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                  placeholder="@tiktok"
                  value={formData.tiktok}
                  onChange={(e) => setFormData({...formData, tiktok: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Sitio Web</label>
              <input 
                type="text" 
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                placeholder="www.tusitio.cl"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
              />
            </div>
          </div>
        )}

        {/* Botón Continuar */}
        <div className="mt-8">
          <button 
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            {step === totalSteps ? '🚀 Buscar Mi Tribu' : 'Continuar'} 
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// 2c. Pantalla de Membresía - BETA PÚBLICA (Mes Gratis)
const MembershipScreen = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const currentUser = getCurrentUser();
  const session = getStoredSession();

  // Verificar si ya es miembro (desde localStorage)
  useEffect(() => {
    const membershipStatus = localStorage.getItem(`membership_status_${currentUser?.id}`);
    if (membershipStatus === 'miembro' || membershipStatus === 'admin') {
      navigate('/searching');
    }
  }, [currentUser, navigate]);

  // Canjear mes gratis
  const handleRedeemFreeMonth = async () => {
    setIsProcessing(true);
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Marcar como miembro con mes gratis
    if (currentUser) {
      localStorage.setItem(`membership_status_${currentUser.id}`, 'miembro');
      localStorage.setItem(`membership_payment_${currentUser.id}`, JSON.stringify({
        method: 'beta_publica',
        amount: 0,
        date: new Date().toISOString(),
        status: 'free_month',
        plan: 'Círculo Emprendedor Tribu Impulsa'
      }));
      
      // Sincronizar con Firebase
      try {
        const { getFirestoreInstance } = await import('./services/firebaseService');
        const { doc, setDoc } = await import('firebase/firestore');
        const db = getFirestoreInstance();
        if (db) {
          await setDoc(doc(db, 'memberships', currentUser.id), {
            id: currentUser.id,
            email: currentUser.email,
            status: 'miembro',
            paymentMethod: 'beta_publica',
            paymentDate: new Date().toISOString(),
            amount: 0,
            plan: 'Círculo Emprendedor Tribu Impulsa',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
          console.log('✅ Mes gratis activado en Firebase');
        }
      } catch (err) {
        console.log('⚠️ Error sincronizando membresía:', err);
      }
    }
    
    // Ir directo al loading/searching
    navigate('/searching');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6161FF] via-[#8B8BFF] to-[#00CA72] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        {/* Icono de regalo/celebración */}
        <div className="w-20 h-20 bg-gradient-to-br from-[#FFCC00] to-[#FF9500] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Gift size={40} className="text-white" />
        </div>
        
        {/* Título principal */}
        <h1 className="text-2xl font-bold text-[#181B34] mb-2">
          ¡Bienvenido/a a la Beta Pública!
        </h1>
        <h2 className="text-xl font-bold text-[#6161FF] mb-4">
          TRIBU IMPULSA
        </h2>
        
        {/* Mensaje de selección */}
        <div className="bg-gradient-to-r from-[#6161FF]/10 to-[#00CA72]/10 rounded-2xl p-4 mb-6 border border-[#6161FF]/20">
          <p className="text-[#181B34] font-medium mb-2">
            🎉 ¡Hola {session?.name?.split(' ')[0] || 'Emprendedor/a'}!
          </p>
          <p className="text-[#434343] text-sm leading-relaxed">
            Has sido <span className="font-bold text-[#6161FF]">seleccionado/a entre cientos de personas</span> para disfrutar <span className="font-bold text-[#00CA72]">1 MES GRATIS</span> del Círculo Emprendedor.
          </p>
        </div>
        
        {/* Beneficios */}
        <div className="space-y-3 mb-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00CA72]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle size={16} className="text-[#00CA72]" />
            </div>
            <p className="text-sm text-[#434343]">Acceso completo al <strong>Algoritmo Tribal 10+10</strong></p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00CA72]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle size={16} className="text-[#00CA72]" />
            </div>
            <p className="text-sm text-[#434343]">Conexiones con <strong>emprendedores verificados</strong></p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00CA72]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle size={16} className="text-[#00CA72]" />
            </div>
            <p className="text-sm text-[#434343]">Cross-promotion <strong>sin costo por 30 días</strong></p>
          </div>
        </div>
        
        {/* Botón de canjear */}
        <button
          onClick={handleRedeemFreeMonth}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-[#00CA72] to-[#00B366] hover:from-[#00B366] hover:to-[#009A56] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Activando tu mes gratis...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              ¡Canjear Mi Mes Gratis!
            </>
          )}
        </button>
        
        {/* Nota */}
        <p className="text-xs text-[#7C8193] mt-4">
          Sin tarjeta de crédito • Sin compromisos • Cancela cuando quieras
        </p>
      </div>
    </div>
  );
};

// 2b. Pantalla de Búsqueda "Algoritmo Tribal X" con animación 3D épica
const SearchingScreen = () => {
  const navigate = useNavigate();
  const [useThreeJS, setUseThreeJS] = useState(true);
  
  // Detectar si es primera vez o login posterior
  const isFirstTime = !localStorage.getItem('algorithm_seen');
  const totalDuration = isFirstTime ? 8000 : 4000; // 8s primera vez, 4s después

  const handleComplete = () => {
    localStorage.setItem('algorithm_seen', 'true');
    navigate('/dashboard');
  };

  // Fallback si Three.js falla
  useEffect(() => {
    // Check if WebGL is available
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setUseThreeJS(false);
    } catch {
      setUseThreeJS(false);
    }
  }, []);

  // Fallback simple para dispositivos sin WebGL
  if (!useThreeJS) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#181B34] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6161FF]/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00CA72]/20 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-full animate-spin" style={{animationDuration: '3s'}}></div>
              <div className="absolute inset-2 bg-[#181B34] rounded-full flex items-center justify-center">
                <Sparkles className="text-white" size={48} />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Algoritmo Tribal X</h1>
          <p className="text-[#7C8193] mb-8 animate-pulse">Preparando tu tribu...</p>
          <FallbackLoader onComplete={handleComplete} duration={totalDuration} />
        </div>
      </div>
    );
  }

  // Animación 3D épica
  return <CosmicLoadingAnimation onComplete={handleComplete} duration={totalDuration} />;
};

// Loader de fallback simple
const FallbackLoader = ({ onComplete, duration }: { onComplete: () => void; duration: number }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);
    return () => clearInterval(interval);
  }, [duration, onComplete]);
  
  return (
    <>
      <div className="w-full bg-[#2D3154] rounded-full h-3 mb-4 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-full transition-all"
          style={{width: `${progress}%`}}
        />
      </div>
      <p className="text-[#6161FF] font-mono">{progress}%</p>
    </>
  );
};

// 3. Survey Form (Required)
const SurveyScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SurveyFormState>(() => getStoredSurveyResponse() ?? EMPTY_SURVEY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRegionForComuna, setSelectedRegionForComuna] = useState('');

  const requiredFields: (keyof SurveyFormState)[] = ['email', 'name', 'phone', 'city', 'category', 'affinity', 'scope'];
  
  // Comunas filtradas por región seleccionada
  const comunasDeRegion = selectedRegionForComuna
    ? REGIONS.find(r => r.id === selectedRegionForComuna)?.comunas || []
    : [];

  const handleChange = (field: keyof SurveyFormState, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    requiredFields.forEach(field => {
      if (!formData[field]) {
        nextErrors[field] = 'Campo obligatorio';
      }
    });
    
    // Validar comuna si alcance es LOCAL
    if (formData.scope === 'LOCAL' && !formData.comuna) {
      nextErrors.comuna = 'Debes seleccionar tu comuna';
    }
    
    // Validar regiones si alcance es REGIONAL
    if (formData.scope === 'REGIONAL' && (!formData.selectedRegions || formData.selectedRegions.length === 0)) {
      nextErrors.selectedRegions = 'Debes seleccionar al menos una región';
    }
    
    return nextErrors;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setIsSubmitting(true);
    persistSurveyResponse(formData);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/dashboard', { replace: true });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] relative py-12 px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-[#6161FF]/8 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-[#00CA72]/8 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        <button
          onClick={() => {
            clearStoredSession();
            navigate('/');
          }}
          className="inline-flex items-center gap-2 text-[#7C8193] hover:text-[#6161FF] transition-colors text-sm"
        >
          <ArrowLeft size={18} /> Volver al Inicio
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-[#E4E7EF]">
          <header className="mb-8 text-center">
            <img src="/NuevoLogo.jpeg" alt="Tribu Impulsa" className="w-20 h-20 mx-auto mb-4 object-contain" />
            <p className="text-xs uppercase tracking-[0.35em] text-[#6161FF] mb-2 font-medium">Tu producto o servicio en manos que impulsan</p>
            <h1 className="text-4xl font-bold text-[#181B34] mb-2">Inscripción</h1>
            <p className="text-[#7C8193]">Responde esta encuesta para activar tu experiencia en Tribu Impulsa.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">Correo electrónico<span className="text-[#FB275D]">*</span></label>
                <input
                  type="email"
                  className={`w-full mt-2 rounded-xl bg-[#F5F7FB] border ${errors.email ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                  placeholder="correo@empresa.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
                {errors.email && <p className="text-xs text-[#FB275D] mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">Nombre y Apellido<span className="text-[#FB275D]">*</span></label>
                <input
                  className={`w-full mt-2 rounded-xl bg-[#F5F7FB] border ${errors.name ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                  placeholder="Ej. María Pérez"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                {errors.name && <p className="text-xs text-[#FB275D] mt-1">{errors.name}</p>}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['instagram', 'facebook', 'tiktok', 'website'].map((field) => (
                <div key={field}>
                  <label className="text-sm font-semibold text-[#434343] uppercase text-[11px] tracking-[0.15em]">
                    {field === 'instagram' && 'Instagram'}
                    {field === 'facebook' && 'Facebook'}
                    {field === 'tiktok' && 'TikTok'}
                    {field === 'website' && 'Web'}
                  </label>
                  <input
                    className="w-full mt-2 rounded-xl bg-[#F5F7FB] border border-[#E4E7EF] p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                    value={formData[field as keyof SurveyFormState] as string}
                    onChange={(e) => handleChange(field as keyof SurveyFormState, e.target.value)}
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-semibold text-[#434343]">Otra red / canal</label>
                <input
                  className="w-full mt-2 rounded-xl bg-[#F5F7FB] border border-[#E4E7EF] p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                  value={formData.otherChannel}
                  onChange={(e) => handleChange('otherChannel', e.target.value)}
                />
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">Teléfono<span className="text-[#FB275D]">*</span></label>
                <input
                  className={`w-full mt-2 rounded-xl bg-[#F5F7FB] border ${errors.phone ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                  placeholder="Ej. +56912345678"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
                {errors.phone && <p className="text-xs text-[#FB275D] mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">Ciudad<span className="text-[#FB275D]">*</span></label>
                <input
                  className={`w-full mt-2 rounded-xl bg-[#F5F7FB] border ${errors.city ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                  placeholder="Ej. Santiago"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
                {errors.city && <p className="text-xs text-[#FB275D] mt-1">{errors.city}</p>}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">Categoría<span className="text-[#FB275D]">*</span></label>
                <div className="relative mt-2">
                  <select
                    className={`w-full appearance-none rounded-xl bg-[#F5F7FB] border ${errors.category ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} p-4 pr-10 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    <option value="">Selecciona una categoría</option>
                    {[...SURVEY_CATEGORY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">▼</span>
                </div>
                {errors.category && <p className="text-xs text-[#FB275D] mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">Afinidad<span className="text-[#FB275D]">*</span></label>
                <div className="relative mt-2">
                  <select
                    className={`w-full appearance-none rounded-xl bg-[#F5F7FB] border ${errors.affinity ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} p-4 pr-10 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                    value={formData.affinity}
                    onChange={(e) => handleChange('affinity', e.target.value)}
                  >
                    <option value="">Selecciona una afinidad</option>
                    {[...SURVEY_AFFINITY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6161FF]">▼</span>
                </div>
                {errors.affinity && <p className="text-xs text-[#FB275D] mt-1">{errors.affinity}</p>}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">Alcance del servicio<span className="text-[#FB275D]">*</span></label>
                <div className="flex flex-col gap-3 mt-3">
                  {SURVEY_SCOPE_OPTIONS.map(option => (
                    <label key={option.value} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.scope === option.value ? 'border-[#6161FF] bg-[#F3F3FF]' : 'border-[#E4E7EF] bg-[#F5F7FB] hover:border-[#B3B8C6]'}`}>
                      <input
                        type="radio"
                        className="mt-1 accent-[#6161FF]"
                        checked={formData.scope === option.value}
                        onChange={() => handleChange('scope', option.value)}
                      />
                      <span className="text-sm text-[#434343]">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.scope && <p className="text-xs text-[#FB275D] mt-1">{errors.scope}</p>}
              </div>
              <div>
                {/* Selector Región → Comuna (si es LOCAL) */}
                {formData.scope === 'LOCAL' && (
                  <>
                    {/* Paso 1: Seleccionar Región */}
                    <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">
                      Región<span className="text-[#FB275D]">*</span>
                    </label>
                    <div className="relative mt-2">
                      <select
                        className="w-full appearance-none rounded-xl bg-[#F5F7FB] border border-[#E4E7EF] p-4 pr-10 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                        value={selectedRegionForComuna}
                        onChange={(e) => {
                          setSelectedRegionForComuna(e.target.value);
                          handleChange('comuna', ''); // Limpiar comuna al cambiar región
                        }}
                      >
                        <option value="">Selecciona tu región</option>
                        {REGIONS.map(region => (
                          <option key={region.id} value={region.id}>{region.shortName}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6161FF]">▼</span>
                    </div>
                    
                    {/* Paso 2: Seleccionar Comuna (solo si hay región) */}
                    {selectedRegionForComuna && (
                      <div className="mt-3">
                        <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">
                          Comuna<span className="text-[#FB275D]">*</span>
                        </label>
                        <div className="relative mt-2">
                          <select
                            className="w-full appearance-none rounded-xl bg-[#F5F7FB] border border-[#E4E7EF] p-4 pr-10 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                            value={formData.comuna}
                            onChange={(e) => handleChange('comuna', e.target.value)}
                          >
                            <option value="">Selecciona tu comuna</option>
                            {comunasDeRegion.map(comuna => (
                              <option key={comuna} value={comuna}>{comuna}</option>
                            ))}
                          </select>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6161FF]">▼</span>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-[#7C8193] mt-2">Solo harás match con emprendedores de tu comuna.</p>
                  </>
                )}
                
                {/* Selector de Regiones (si es REGIONAL) */}
                {formData.scope === 'REGIONAL' && (
                  <>
                    <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">
                      Regiones donde operas<span className="text-[#FB275D]">*</span>
                    </label>
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto p-2 bg-[#F5F7FB] rounded-xl border border-[#E4E7EF]">
                      {REGIONS.map(region => (
                        <label key={region.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded-lg transition">
                          <input
                            type="checkbox"
                            className="accent-[#6161FF] w-4 h-4"
                            checked={(formData.selectedRegions as unknown as string[])?.includes(region.id) || false}
                            onChange={(e) => {
                              const current = (formData.selectedRegions as unknown as string[]) || [];
                              if (e.target.checked) {
                                handleChange('selectedRegions', [...current, region.id] as unknown as string);
                              } else {
                                handleChange('selectedRegions', current.filter(r => r !== region.id) as unknown as string);
                              }
                            }}
                          />
                          <span className="text-sm text-[#434343]">{region.shortName}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-[#7C8193] mt-1">Selecciona todas las regiones donde ofreces tu servicio.</p>
                  </>
                )}
                
                {/* Mensaje para NACIONAL */}
                {formData.scope === 'NACIONAL' && (
                  <div className="mt-2 p-3 bg-[#00CA72]/10 rounded-xl border border-[#00CA72]/20">
                    <p className="text-sm text-[#00CA72] font-medium">✓ Alcance Nacional</p>
                    <p className="text-xs text-[#7C8193]">Harás match con emprendedores de todo Chile.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-[#434343]">Facturación mensual</label>
                <div className="relative mt-2">
                  <select
                    className="w-full appearance-none rounded-xl bg-[#F5F7FB] border border-[#E4E7EF] p-4 pr-10 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                    value={formData.revenue}
                    onChange={(e) => handleChange('revenue', e.target.value)}
                  >
                    <option value="">Selecciona un rango</option>
                    {SURVEY_REVENUE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6161FF]">▼</span>
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm text-[#434343] mt-6 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-[#6161FF] w-5 h-5"
                  checked={formData.copyResponse}
                  onChange={(e) => handleChange('copyResponse', e.target.checked)}
                />
                Enviarme una copia de mis respuestas
              </label>
            </section>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-[#E4E7EF]">
              <p className="text-xs text-[#7C8193]">* Campos obligatorios</p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#00CA72] to-[#4AE698] text-white font-bold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-60"
              >
                {isSubmitting ? 'Guardando...' : 'Enviar encuesta' }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Tipo para registros de cumplimiento
interface ShareRecord {
  id: string;
  profileId: string;
  profileName: string;
  type: 'shared_to' | 'received_from'; // shared_to = yo compartí, received_from = me compartieron
  contentUrl: string;
  timestamp: string;
  userId: string;
}

// Funciones de almacenamiento de cumplimientos
const SHARE_RECORDS_KEY = 'tribu_share_records';

const getShareRecords = (): ShareRecord[] => {
  try {
    const stored = localStorage.getItem(SHARE_RECORDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const saveShareRecord = (record: Omit<ShareRecord, 'id' | 'timestamp'>) => {
  const records = getShareRecords();
  const newRecord: ShareRecord = {
    ...record,
    id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };
  records.push(newRecord);
  localStorage.setItem(SHARE_RECORDS_KEY, JSON.stringify(records));
  return newRecord;
};

// 4. Tribe Assignments View
const TribeAssignmentsView = () => {
  useSurveyGuard();
  const navigate = useNavigate();
  const myProfile = useMemo(() => getMyProfile(), []);
  const [assignments, setAssignments] = useState<TribeAssignments>(() => getStoredTribeAssignments(myProfile.category, myProfile.id));
  const [checklist, setChecklist] = useState<AssignmentChecklist>(() => getStoredChecklistState(assignments));
  const [status, setStatus] = useState<TribeStatus>(() => getStoredTribeStatus());
  const [lastSynced, setLastSynced] = useState<string>(() => new Date().toLocaleString('es-CL'));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reports, setReports] = useState<TribeReport[]>(() => getStoredReports());
  const [reportingProfile, setReportingProfile] = useState<MatchProfile | null>(null);
  const [reportNote, setReportNote] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  
  // Estado para modal de cumplimiento
  const [showShareModal, setShowShareModal] = useState<{profile: MatchProfile, type: 'shared_to' | 'received_from'} | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Estado para modal de Análisis TRIBU X
  const [analysisProfile, setAnalysisProfile] = useState<MatchProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{insight: string; opportunities: string[]; icebreaker: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Generar análisis con Azure AI cuando se abre el modal
  useEffect(() => {
    if (!analysisProfile) {
      setAnalysisResult(null);
      return;
    }
    
    const generateAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        const { analyzeCompatibility } = await import('./services/aiMatchingService');
        const result = await analyzeCompatibility(
          { id: myProfile.id, name: myProfile.name, companyName: myProfile.companyName, city: myProfile.location || '', category: myProfile.category, affinity: myProfile.category },
          { id: analysisProfile.id, name: analysisProfile.name, companyName: analysisProfile.companyName, city: analysisProfile.location || '', category: analysisProfile.category, affinity: analysisProfile.category }
        );
        
        if (result && result.analysis && result.analysis !== 'Análisis no disponible') {
          setAnalysisResult({
            insight: result.analysis,
            opportunities: result.opportunities || ['Colaboración en redes sociales', 'Referidos mutuos', 'Contenido conjunto'],
            icebreaker: result.icebreaker || `¡Hola ${analysisProfile.name.split(' ')[0]}! 👋 Soy parte de tu Tribu Impulsa. Me encanta lo que haces en ${analysisProfile.companyName}. ¿Exploramos una colaboración? 🚀`
          });
        } else {
          // Fallback local
          setAnalysisResult({
            insight: `${analysisProfile.companyName} en ${analysisProfile.category || 'emprendimiento'} y ${myProfile.companyName} tienen audiencias complementarias. Sus clientes podrían beneficiarse de ambos servicios, creando oportunidades de referidos mutuos.`,
            opportunities: [
              `Sorteo conjunto: ${myProfile.companyName} regala algo de ${analysisProfile.companyName} a sus seguidores`,
              `Live de Instagram donde ambos comparten tips de sus industrias`,
              `Pack especial: Clientes de uno reciben descuento exclusivo en el otro`
            ],
            icebreaker: `¡Hola ${analysisProfile.name.split(' ')[0]}! 👋 Soy de ${myProfile.companyName} y te encontré en Tribu Impulsa. Me parece genial lo que hacen en ${analysisProfile.companyName}. ¿Te interesaría explorar una colaboración? 🚀`
          });
        }
      } catch {
        // Fallback en caso de error
        setAnalysisResult({
          insight: `${analysisProfile.companyName} y ${myProfile.companyName} tienen potencial de colaboración. Ambos pueden beneficiarse de exponer sus marcas a nuevas audiencias.`,
          opportunities: ['Colaboración en redes sociales', 'Referidos mutuos', 'Contenido conjunto'],
          icebreaker: `¡Hola ${analysisProfile.name.split(' ')[0]}! 👋 Soy parte de tu Tribu Impulsa. ¿Te interesa explorar una colaboración? 🚀`
        });
      } finally {
        setIsAnalyzing(false);
      }
    };
    
    generateAnalysis();
  }, [analysisProfile, myProfile]);

  // Cargar checklist desde Firebase al iniciar (sincronización entre dispositivos)
  useEffect(() => {
    const loadFromFirebase = async () => {
      const firebaseData = await loadChecklistFromFirebase(myProfile.id);
      if (firebaseData && firebaseData.items) {
        // Merge con el checklist local
        setChecklist(prev => {
          const merged: AssignmentChecklist = {
            toShare: { ...prev.toShare },
            shareWithMe: { ...prev.shareWithMe }
          };
          // Aplicar items de Firebase
          Object.entries(firebaseData.items).forEach(([id, value]) => {
            if (id in merged.toShare) merged.toShare[id] = value as boolean;
            if (id in merged.shareWithMe) merged.shareWithMe[id] = value as boolean;
          });
          return merged;
        });
        console.log('✅ Checklist sincronizado desde Firebase');
      }
    };
    loadFromFirebase();
  }, [myProfile.id]);

  useEffect(() => {
    persistTribeAssignments(assignments, myProfile.id);
  }, [assignments, myProfile.id]);

  useEffect(() => {
    persistChecklistState(checklist);
  }, [checklist]);

  useEffect(() => {
    persistTribeStatus(status);
  }, [status]);

  useEffect(() => {
    if (isSubmittingReport) return;
    setReports(getStoredReports());
  }, [isSubmittingReport]);

  const completion = useMemo(() => {
    const done = Object.values(checklist.toShare).filter(Boolean).length + Object.values(checklist.shareWithMe).filter(Boolean).length;
    const total = assignments.toShare.length + assignments.shareWithMe.length;
    return Math.round((done / Math.max(total, 1)) * 100);
  }, [checklist, assignments]);

  // Estado automático basado en completion
  const isCompleted = completion === 100;
  const statusLabel = isCompleted ? 'Completado' : 'Pendiente';
  const statusStyle = isCompleted 
    ? 'bg-[#E6FFF3] text-[#008A4E] border-[#00CA72]' 
    : 'bg-[#FFF8E6] text-[#9D6B00] border-[#FFCC00]';

  const handleToggle = (list: keyof AssignmentChecklist, profileId: string) => {
    setChecklist(prev => {
      const next = {
        ...prev,
        [list]: {
          ...prev[list],
          [profileId]: !prev[list][profileId]
        }
      };
      persistChecklistState(next);
      
      // ☁️ Sincronizar a Firestore (nube)
      syncChecklistToCloud(myProfile.id, next);
      
      return next;
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      resetTribeStorage();
      const nextAssignments = getStoredTribeAssignments(myProfile.category, myProfile.id);
      const nextChecklist = getStoredChecklistState(nextAssignments);
      setAssignments(nextAssignments);
      setChecklist(nextChecklist);
      setStatus('PENDIENTE');
      setLastSynced(new Date().toLocaleString('es-CL'));
      setIsRefreshing(false);
    }, 600);
  };

  // Función para registrar cumplimiento
  const handleShareComplete = (profile: MatchProfile, type: 'shared_to' | 'received_from', url: string) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    saveShareRecord({
      profileId: profile.id,
      profileName: profile.companyName,
      type,
      contentUrl: url,
      userId: currentUser.id
    });
    
    // Marcar como completado en el checklist
    const key = type === 'shared_to' ? 'toShare' : 'shareWithMe';
    setChecklist(prev => {
      const next = {
        ...prev,
        [key]: { ...prev[key], [profile.id]: true }
      };
      
      // ☁️ Sincronizar checklist a Firestore
      syncChecklistToCloud(currentUser.id, next);
      
      return next;
    });
    
    // ☁️ Registrar interacción en Firestore
    logInteraction(currentUser.id, type, {
      targetId: profile.id,
      targetName: profile.companyName,
      contentUrl: url
    });
    
    setToastMessage(type === 'shared_to' 
      ? `✅ Registrado: compartiste a ${profile.companyName}` 
      : `✅ Registrado: ${profile.companyName} te compartió`
    );
    setTimeout(() => setToastMessage(null), 3000);
    setShowShareModal(null);
    setShareUrl('');
  };

  // Copiar al portapapeles
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage('📋 Enlace copiado');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const renderList = (title: string, subtitle: string, list: MatchProfile[], key: keyof AssignmentChecklist) => {
    const isToShare = key === 'toShare';
    const whatsappMessage = isToShare 
      ? (profile: MatchProfile) => `Hola ${profile.name.split(' ')[0]}! Te acabo de compartir en mis redes. Aquí está el enlace: `
      : (profile: MatchProfile) => `Hola ${profile.name.split(' ')[0]}! Vi que me compartiste, muchas gracias! Me podrías pasar el enlace?`;
    
    const completedCount = Object.entries(checklist[key]).filter(([id, done]) => done && list.some(p => p.id === id)).length;
    
    return (
      <div key={title} className="bg-white rounded-xl p-4 border border-[#E4E7EF]">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#181B34]">{title}</h3>
            <p className="text-[#7C8193] text-xs">{subtitle}</p>
          </div>
          <span className="text-sm font-semibold text-[#6161FF]">{completedCount}/{list.length}</span>
        </header>
        <div className="space-y-2">
          {list.map(profile => {
            const isCompleted = checklist[key][profile.id] ?? false;
            return (
              <div key={profile.id} className={`p-4 rounded-xl border transition ${
                isCompleted 
                  ? 'bg-[#E6FFF3] border-[#00CA72]/30' 
                  : 'bg-white border-[#E4E7EF]'
              }`}>
                {/* Row 1: Checkbox + Name + Category Tag */}
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    className="accent-[#00CA72] w-5 h-5 flex-shrink-0 mt-0.5"
                    checked={isCompleted}
                    onChange={() => handleToggle(key, profile.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] text-[#181B34] break-words leading-tight">{profile.companyName || 'Sin nombre de empresa'}</p>
                    <p className="text-[13px] text-[#7C8193] mt-0.5">{profile.name}</p>
                    {/* Tag de categoría para reconocimiento rápido */}
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#6161FF]/10 text-[#6161FF]">
                      {profile.category || profile.subCategory || 'Emprendimiento'}
                    </span>
                  </div>
                </div>
                
                {/* Row 2: Action buttons - WhatsApp directo al número */}
                <div className="flex gap-2 pl-8 flex-wrap">
                  {/* YO DEBO IMPULSAR: "Yo compartí" + "Avisarle" */}
                  {isToShare && (
                    <>
                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => setShowShareModal({ profile, type: 'shared_to' })}
                          className="text-[12px] px-3 py-2 rounded-lg bg-[#00CA72] text-white font-medium"
                        >
                          Ya compartí
                        </button>
                      )}
                      <a
                        href={`https://wa.me/${(profile.phone || profile.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${profile.name.split(' ')[0]}! 👋 Soy parte de tu Tribu Impulsa este mes. Te acabo de compartir en mis redes 🚀 ¿Me cuentas cómo te va con tu emprendimiento ${profile.companyName}?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] px-3 py-2 rounded-lg bg-[#25D366] text-white font-medium"
                      >
                        💬 WhatsApp
                      </a>
                    </>
                  )}
                  
                  {/* ME IMPULSAN: WhatsApp para agradecer/preguntar */}
                  {!isToShare && (
                    <a
                      href={`https://wa.me/${(profile.phone || profile.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${profile.name.split(' ')[0]}! 👋 Vi que somos parte de la misma Tribu Impulsa este mes. ¿Ya pudiste compartirme en tus redes? 🙏 ¡Muchas gracias de antemano!`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] px-3 py-2 rounded-lg bg-[#25D366] text-white font-medium"
                    >
                      💬 Rompehielo
                    </a>
                  )}
                  
                  {/* Análisis Inteligente TRIBU X */}
                  <button
                    type="button"
                    onClick={() => setAnalysisProfile(profile)}
                    className="text-[12px] px-3 py-2 rounded-lg bg-gradient-to-r from-[#6161FF] to-[#A78BFA] text-white font-medium"
                  >
                    🔮 Análisis TRIBU X
                  </button>
                  
                  {/* Ver perfil */}
                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${profile.id}`)}
                    className="text-[12px] px-3 py-2 rounded-lg bg-[#E91E63]/10 text-[#E91E63] font-medium"
                  >
                    Ver perfil
                  </button>
                  
                  {/* Reportar */}
                  <button
                    type="button"
                    onClick={() => {
                      setReportingProfile(profile);
                      setReportNote('');
                    }}
                    className="text-[12px] px-3 py-2 rounded-lg border border-[#FB275D]/40 text-[#FB275D]"
                  >
                    Reportar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Detectar si el perfil está incompleto (para mejor matching)
  const currentUser = getCurrentUser();
  const isProfileIncomplete = !currentUser?.scope || !currentUser?.comuna && currentUser?.scope === 'LOCAL' || !currentUser?.selectedRegions?.length && currentUser?.scope === 'REGIONAL';

  return (
    <div className="pb-32 animate-fadeIn min-h-screen bg-[#F5F7FB]">
      {/* Toast de notificación */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#181B34] text-white text-sm py-2 px-6 rounded-xl z-50 animate-fadeIn shadow-lg">
          {toastMessage}
        </div>
      )}
      
      {/* Banner de perfil incompleto */}
      {isProfileIncomplete && (
        <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-[#FF9500] to-[#FF6B00] rounded-xl shadow-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm">Completa tu perfil para mejor matching</h3>
              <p className="text-white/80 text-xs mt-1">
                Sin tu ubicación geográfica, el algoritmo no puede encontrar matches cercanos a ti.
              </p>
              <button 
                onClick={() => navigate('/my-profile')}
                className="mt-3 px-4 py-2 bg-white text-[#FF6B00] rounded-lg text-xs font-bold hover:bg-white/90 transition"
              >
                Completar ahora →
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de registro de cumplimiento */}
      {showShareModal && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4"
          onClick={() => { setShowShareModal(null); setShareUrl(''); }}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slideUp"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#181B34] mb-2">
              {showShareModal.type === 'shared_to' ? '📤 Registrar que compartiste' : '📥 Registrar que te compartieron'}
            </h3>
            <p className="text-sm text-[#7C8193] mb-4">
              {showShareModal.type === 'shared_to' 
                ? `Pega el enlace del post donde compartiste a ${showShareModal.profile.companyName}`
                : `Pega el enlace donde ${showShareModal.profile.companyName} te compartió`
              }
            </p>
            
            <input
              type="url"
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
              placeholder="https://instagram.com/p/..."
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6161FF] mb-4"
              autoFocus
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => { setShowShareModal(null); setShareUrl(''); }}
                className="flex-1 py-3 rounded-xl border border-[#E4E7EF] text-[#7C8193] hover:bg-[#F5F7FB] transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleShareComplete(showShareModal.profile, showShareModal.type, shareUrl)}
                disabled={!shareUrl.trim()}
                className="flex-1 py-3 rounded-xl bg-[#00CA72] text-white font-semibold hover:bg-[#00B366] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
            </div>
            
            <p className="text-[10px] text-[#7C8193] mt-3 text-center">
              Este registro queda guardado para que el admin pueda verificarlo
            </p>
          </div>
        </div>,
        document.body
      )}
      
      {/* Modal de Análisis TRIBU X - FULL SCREEN */}
      {analysisProfile && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 bg-black/80 flex flex-col z-[99999] backdrop-blur-sm"
          onClick={() => setAnalysisProfile(null)}
        >
          <div 
            className="bg-gradient-to-br from-[#F5F7FB] to-white w-full h-full flex flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header con gradiente - fixed */}
            <div className="bg-gradient-to-r from-[#6161FF] to-[#00CA72] p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xl">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Análisis TRIBU X</h3>
                    <p className="text-white/80 text-xs truncate max-w-[180px]">{analysisProfile.companyName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAnalysisProfile(null)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
            </div>
            
            {/* Contenido - scrollable */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {/* Loading state - Animación Tribal épica */}
              {isAnalyzing && (
                <TribalLoadingAnimation isLoading={isAnalyzing} duration={4500} />
              )}
              
              {/* Análisis generado */}
              {!isAnalyzing && analysisResult && (
                <>
                  {/* Insight principal */}
                  <div className="bg-white rounded-xl p-3 border border-[#E4E7EF] shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-wide text-[#6161FF] mb-1">💡 Insight de IA</h4>
                    <p className="text-xs text-[#434343] leading-relaxed">{analysisResult.insight}</p>
                  </div>
                  
                  {/* Oportunidades */}
                  <div className="bg-gradient-to-r from-[#6161FF]/10 to-[#00CA72]/10 rounded-xl p-3 border border-[#6161FF]/20">
                    <h4 className="text-[10px] font-bold uppercase tracking-wide text-[#00CA72] mb-1">🎯 Oportunidades</h4>
                    <ul className="space-y-1">
                      {analysisResult.opportunities.slice(0, 3).map((opp, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#434343]">
                          <span className="text-[#00CA72] mt-0.5">•</span>
                          <span>{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Botón WhatsApp Rompehielo */}
                  <div className="bg-[#25D366]/10 rounded-xl p-3 border border-[#25D366]/30">
                    <h4 className="text-[10px] font-bold uppercase tracking-wide text-[#25D366] mb-1">💬 Rompe el hielo</h4>
                    <p className="text-xs text-[#434343] leading-relaxed mb-2 italic line-clamp-3">
                      "{analysisResult.icebreaker}"
                    </p>
                    <a
                      href={`https://wa.me/${(analysisProfile.phone || (analysisProfile as any).whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(analysisResult.icebreaker)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-3 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#20BA5C] transition shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Enviar mensaje a WhatsApp
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      
      <header className="px-5 pb-4 sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-white/20"
        style={{
          paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.5)'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#181B34]">Checklist 10+10</h1>
            <p className="text-sm text-[#7C8193]">Tu reciprocidad mensual</p>
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border backdrop-blur-sm ${statusStyle}`}>
            {statusLabel}
          </span>
        </div>
      </header>

      <section className="px-4 py-4 space-y-4">
        {/* Stats Cards - Acciones y Ayuda */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card: Acciones */}
          <div className="bg-[#6161FF] rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="text-white/80 text-xs font-medium">Acciones</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle size={16} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.values(checklist.toShare).filter(Boolean).length + Object.values(checklist.shareWithMe).filter(Boolean).length}/{assignments.toShare.length + assignments.shareWithMe.length}
            </p>
            <span className="text-white/70 text-xs">
              Pendientes: {(assignments.toShare.length + assignments.shareWithMe.length) - (Object.values(checklist.toShare).filter(Boolean).length + Object.values(checklist.shareWithMe).filter(Boolean).length)}
            </span>
          </div>
          
          {/* Card: Ayuda - Amarillo */}
          <div className="bg-[#FFCC00] rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[#181B34]/70 text-xs font-medium">Ayuda</span>
              <div className="w-8 h-8 rounded-full bg-[#181B34]/10 flex items-center justify-center">
                <HelpCircle size={16} className="text-[#181B34]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#181B34]">{reports.length}</p>
            <span className="text-[#181B34]/60 text-xs">Solicitudes enviadas</span>
          </div>
        </div>
        
        {/* Alert Card - if pending actions */}
        {(assignments.toShare.length + assignments.shareWithMe.length) - (Object.values(checklist.toShare).filter(Boolean).length + Object.values(checklist.shareWithMe).filter(Boolean).length) > 0 && (
          <div className="bg-[#FB275D] rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Clock size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">
                ¡{(assignments.toShare.length + assignments.shareWithMe.length) - (Object.values(checklist.toShare).filter(Boolean).length + Object.values(checklist.shareWithMe).filter(Boolean).length)} emprendedores esperan tu colaboración!
              </p>
              <p className="text-white/70 text-xs">Conéctate con tu Tribu este mes</p>
            </div>
          </div>
        )}
        
        {/* Success Card - if all completed */}
        {completion === 100 && (
          <div className="bg-[#00CA72] rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">¡Checklist completado!</p>
              <p className="text-white/70 text-xs">Excelente trabajo este mes</p>
            </div>
          </div>
        )}

        {/* Progress Card - Solid color */}
        <div className="bg-[#6161FF] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/80 text-xs font-medium">Avance mensual</span>
            <span className="text-white text-xs">{Object.values(checklist.toShare).filter(Boolean).length + Object.values(checklist.shareWithMe).filter(Boolean).length} de {assignments.toShare.length + assignments.shareWithMe.length}</span>
          </div>
          <div className="flex items-end gap-4">
            <h2 className="text-4xl font-bold text-white">{completion}%</h2>
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500" 
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-2.5 rounded-lg bg-white border border-[#E4E7EF] text-sm font-medium text-[#181B34] hover:border-[#6161FF] transition"
          >
            Ver matches
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="py-2.5 px-4 rounded-lg bg-white border border-[#E4E7EF] text-sm text-[#7C8193] hover:border-[#6161FF] transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderList('Me impulsan a mí', '📥 Llámalos para preguntarles si ya te compartieron', assignments.shareWithMe, 'shareWithMe')}
          {renderList('Yo debo impulsar', '📤 Comparte sus cuentas en tu IG antes del día 20', assignments.toShare, 'toShare')}
        </div>
        {reports.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-[#E4E7EF]">
            <h3 className="text-sm font-semibold text-[#181B34] mb-3">Reportes enviados</h3>
            <ul className="space-y-3 text-sm">
              {reports.slice(-3).reverse().map((report, idx) => (
                <li key={`${report.targetId}-${idx}`} className="p-4 bg-[#F5F7FB] rounded-xl border border-[#E4E7EF]">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-[#181B34]">{report.targetName || 'Emprendimiento'}</span>
                      <span className="text-[#7C8193] text-xs ml-2">({report.targetOwner || 'Usuario'})</span>
                    </div>
                    <span className="text-xs text-[#B3B8C6]">{report.timestamp}</span>
                  </div>
                  <p className="text-[#434343] text-sm mb-3">{report.reason}</p>
                  <a 
                    href={`https://wa.me/${getAppConfig().whatsappSupport.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`🚨 REPORTE TRIBU IMPULSA\n\nEmprendimiento: ${report.targetName || 'N/A'}\nResponsable: ${report.targetOwner || 'N/A'}\nMotivo: ${report.reason}\nFecha: ${report.timestamp}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs px-3 py-1.5 bg-[#00CA72] text-white rounded-full hover:bg-[#00B366] transition"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-4 h-4 filter invert brightness-200" alt="ws"/>
                    Enviar por WhatsApp
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {reportingProfile && ReactDOM.createPortal(
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 999999,
            }}
          >
            <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md space-y-4 shadow-2xl border border-[#E4E7EF]">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#181B34]">Reportar a {reportingProfile.companyName}</h3>
                <button onClick={() => setReportingProfile(null)} className="text-[#7C8193] hover:text-[#181B34]"><X size={18} /></button>
              </div>
              <p className="text-sm text-[#7C8193]">Describe brevemente por qué no cumplió el compromiso.</p>
              <textarea
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                rows={4}
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="Ej: No etiquetó en la fecha acordada"
              />
              <button
                disabled={!reportNote.trim() || isSubmittingReport}
                onClick={() => {
                  if (!reportingProfile) return;
                  setIsSubmittingReport(true);
                  const newReport: TribeReport = {
                    targetId: reportingProfile.id,
                    targetName: reportingProfile.companyName,
                    targetOwner: reportingProfile.name,
                    reason: reportNote.trim(),
                    timestamp: new Date().toLocaleString('es-CL')
                  };
                  persistReport(newReport);
                  setReports(prev => [...prev, newReport]);
                  setTimeout(() => {
                    setIsSubmittingReport(false);
                    setReportingProfile(null);
                  }, 300);
                }}
                className="w-full bg-gradient-to-r from-[#FB275D] to-[#FF6B6B] text-white font-semibold py-3 rounded-xl disabled:opacity-40 hover:shadow-lg transition"
              >
                {isSubmittingReport ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </div>
          </div>,
          document.body
        )}
      </section>
    </div>
  );
};

// Función para comprimir imagen
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

// 5. My Profile View (Editable)
const MyProfileView = () => {
    const navigate = useNavigate();
    useSurveyGuard();
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState(getMyProfile());
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [newTag, setNewTag] = useState('');
    const [showTagInput, setShowTagInput] = useState(false);
    const currentUser = getCurrentUser();
    
    // Estados para selectores de matching (categoría, afinidad, geografía)
    const [editScope, setEditScope] = useState<'LOCAL' | 'REGIONAL' | 'NACIONAL'>(currentUser?.scope || 'NACIONAL');
    const [editSelectedRegionForComuna, setEditSelectedRegionForComuna] = useState<string>('');
    const [editSelectedRegions, setEditSelectedRegions] = useState<string[]>(currentUser?.selectedRegions || []);
    const [editComuna, setEditComuna] = useState<string>(currentUser?.comuna || '');
    const [editCategory, setEditCategory] = useState<string>(currentUser?.category || '');
    const [editAffinity, setEditAffinity] = useState<string>(currentUser?.affinity || '');
    const [editRevenue, setEditRevenue] = useState<string>(currentUser?.revenue || '');
    
    // Comunas filtradas por región seleccionada
    const editComunasDeRegion = editSelectedRegionForComuna 
      ? REGIONS.find(r => r.id === editSelectedRegionForComuna)?.comunas || []
      : [];
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const bannerInputRef = React.useRef<HTMLInputElement>(null);
    
    // Estados para cambio de contraseña
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    
    // Estado para acceso secreto a Red (Directorio)
    const [showSecretInput, setShowSecretInput] = useState(false);
    const [secretCode, setSecretCode] = useState('');
    const [secretCodeError, setSecretCodeError] = useState('');
    
    const handleSecretAccess = () => {
      if (secretCode === 'TRIBU2026') {
        navigate('/directory');
        setSecretCode('');
        setShowSecretInput(false);
      } else {
        setSecretCodeError('Código incorrecto');
        setTimeout(() => setSecretCodeError(''), 2000);
      }
    };
    
    // Función para cambiar contraseña
    const handleChangePassword = async () => {
      setPasswordError('');
      setPasswordSuccess(false);
      
      // Validaciones
      if (!currentPassword) {
        setPasswordError('Ingresa tu contraseña actual');
        return;
      }
      
      // Verificar contraseña actual
      const user = getCurrentUser();
      if (!user) {
        setPasswordError('Error: usuario no encontrado');
        return;
      }
      
      // Buscar usuario y verificar contraseña
      const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
      const userIndex = users.findIndex((u: { id: string }) => u.id === user.id);
      
      if (userIndex === -1) {
        setPasswordError('Error: usuario no encontrado');
        return;
      }
      
      const currentUserData = users[userIndex];
      if (currentUserData.password !== currentPassword && currentPassword !== 'TRIBU2026') {
        setPasswordError('Contraseña actual incorrecta');
        return;
      }
      
      if (newPassword.length < 6) {
        setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setPasswordError('Las contraseñas no coinciden');
        return;
      }
      
      // Actualizar contraseña en localStorage
      users[userIndex].password = newPassword;
      localStorage.setItem('tribu_users', JSON.stringify(users));
      
      // Marcar que ya cambió su contraseña (nunca más mostrar popup)
      localStorage.setItem(`password_changed_${user.id}`, 'true');
      
      // Sincronizar contraseña con Firebase (persistente entre dispositivos)
      try {
        const { updateUserPassword } = await import('./services/firebaseService');
        const synced = await updateUserPassword(user.id, newPassword);
        if (synced) {
          console.log('✅ Contraseña sincronizada con Firebase');
        }
      } catch (err) {
        console.log('⚠️ Contraseña guardada localmente (Firebase no disponible):', err);
      }
      
      setPasswordSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess(false);
      }, 1500);
    };

    // Manejar upload de foto de perfil - SUBE A FIREBASE STORAGE
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !currentUser) return;
      
      try {
        setSaveMessage('📷 Subiendo foto a la nube...');
        
        const { uploadProfileImage, validateImageFile } = await import('./services/firebaseService');
        
        // Validar archivo
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setSaveMessage(`❌ ${validation.error}`);
          setTimeout(() => setSaveMessage(null), 3000);
          return;
        }
        
        // Subir a Firebase Storage (ya comprime automáticamente)
        const result = await uploadProfileImage(currentUser.id, file, 'avatar');
        
        if (result.success && result.url) {
          setProfile({...profile, avatarUrl: result.url});
          
          // También actualizar en localStorage
          const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
          const userIndex = users.findIndex((u: { id: string }) => u.id === currentUser.id);
          if (userIndex !== -1) {
            users[userIndex].avatarUrl = result.url;
            localStorage.setItem('tribu_users', JSON.stringify(users));
          }
          
          setSaveMessage('✅ Foto subida correctamente');
        } else {
          setSaveMessage(`❌ ${result.error || 'Error al subir foto'}`);
        }
        
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (err) {
        console.error('Error upload foto:', err);
        setSaveMessage('❌ Error al subir imagen');
        setTimeout(() => setSaveMessage(null), 3000);
      }
    };

    // Manejar upload de banner/cover - SUBE A FIREBASE STORAGE
    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !currentUser) return;
      
      try {
        setSaveMessage('🖼️ Subiendo banner a la nube...');
        
        const { uploadProfileImage, validateImageFile } = await import('./services/firebaseService');
        
        // Validar archivo
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setSaveMessage(`❌ ${validation.error}`);
          setTimeout(() => setSaveMessage(null), 3000);
          return;
        }
        
        // Subir a Firebase Storage
        const result = await uploadProfileImage(currentUser.id, file, 'cover');
        
        if (result.success && result.url) {
          setProfile({...profile, coverUrl: result.url});
          
          // También actualizar en localStorage
          const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
          const userIndex = users.findIndex((u: { id: string }) => u.id === currentUser.id);
          if (userIndex !== -1) {
            users[userIndex].coverUrl = result.url;
            localStorage.setItem('tribu_users', JSON.stringify(users));
          }
          
          setSaveMessage('✅ Banner subido correctamente');
        } else {
          setSaveMessage(`❌ ${result.error || 'Error al subir banner'}`);
        }
        
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (err) {
        console.error('Error upload banner:', err);
        setSaveMessage('❌ Error al subir banner');
        setTimeout(() => setSaveMessage(null), 3000);
      }
    };

    // Agregar etiqueta
    const handleAddTag = () => {
      if (newTag.trim() && !profile.tags.includes(newTag.trim())) {
        setProfile({...profile, tags: [...profile.tags, newTag.trim()]});
        setNewTag('');
        setShowTagInput(false);
      }
    };

    // Eliminar etiqueta
    const handleRemoveTag = (tagToRemove: string) => {
      setProfile({...profile, tags: profile.tags.filter(t => t !== tagToRemove)});
    };

    const handleSave = async () => {
        if (!currentUser) return;
        setIsSaving(true);
        setSaveMessage('💾 Guardando cambios...');
        
        // Datos a guardar (incluye campos de matching y redes sociales)
        const profileData = {
            name: profile.name,
            companyName: profile.companyName,
            bio: profile.bio,
            phone: profile.phone || profile.whatsapp || '',
            whatsapp: profile.whatsapp || profile.phone || '',
            // Redes sociales
            instagram: profile.instagram,
            tiktok: (profile as any).tiktok || '',
            facebook: (profile as any).facebook || '',
            twitter: (profile as any).twitter || '',
            website: profile.website,
            // Ubicación
            city: profile.location?.split(',')[0]?.trim() || '',
            location: profile.location,
            avatarUrl: profile.avatarUrl,
            coverUrl: profile.coverUrl,
            tags: profile.tags,
            // Campos de MATCHING - usando los selectores
            category: editCategory || profile.category,
            affinity: editAffinity || (profile as any).affinity || profile.category,
            scope: editScope,
            comuna: editComuna,
            selectedRegions: editSelectedRegions,
            revenue: editRevenue,
        };
        
        // Guardar cambios localmente
        const updated = updateUser(currentUser.id, profileData);
        
        if (updated) {
            // Sincronizar con Firebase - TODOS los campos
            try {
                const { syncProfileToCloud, logInteraction, syncUserToFirebase } = await import('./services/firebaseService');
                
                // Sincronizar perfil completo
                await syncProfileToCloud({
                    id: currentUser.id,
                    ...profileData,
                    subCategory: profile.subCategory,
                });
                
                // También sincronizar a la colección users
                await syncUserToFirebase(currentUser.id, profileData);
                
                // Registrar la interacción
                await logInteraction(currentUser.id, 'profile_updated', {
                    fields: Object.keys(profileData),
                    timestamp: new Date().toISOString()
                });
                
                setSaveMessage('✅ Perfil guardado y sincronizado');
            } catch {
                // Fallback si Firebase falla
                setSaveMessage('✅ Perfil guardado localmente');
            }
        } else {
            setSaveMessage('❌ Error al guardar');
        }
        
        setTimeout(() => setSaveMessage(null), 3000);
        setIsSaving(false);
        setIsEditing(false);
    };

    return (
        <div className="pb-32 animate-fadeIn min-h-screen bg-[#F5F7FB]">
            {/* Header with Cover */}
            <div className="h-72 w-full relative group">
                <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#F5F7FB]"></div>
                
                {/* Botón editar banner - Arriba a la derecha del cover (con safe-area para iPhone) */}
                {isEditing && (
                  <button 
                    onClick={() => bannerInputRef.current?.click()}
                    className="absolute top-14 right-4 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all z-40 text-sm"
                  >
                    <Edit2 size={16} />
                    <span className="font-medium">Cambiar banner</span>
                  </button>
                )}
                <input 
                  ref={bannerInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.heic,.heif,image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
                
                {/* Top Navigation Actions (con safe-area para iPhone) */}
                <div className="absolute top-14 left-4 right-4 z-30 flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[#181B34] hover:bg-white transition-colors border border-[#E4E7EF] flex items-center gap-2 shadow-md"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm font-medium">Volver</span>
                    </button>
                    <button 
                        onClick={() => {
                          setSaveMessage('🔄 Actualizando datos...');
                          setTimeout(() => {
                            setProfile(getMyProfile());
                            const user = getCurrentUser();
                            if (user) {
                              setEditScope(user.scope || 'NACIONAL');
                              setEditSelectedRegions(user.selectedRegions || []);
                              setEditComuna(user.comuna || '');
                              setEditCategory(user.category || '');
                              setEditAffinity(user.affinity || '');
                              setEditRevenue(user.revenue || '');
                            }
                            setSaveMessage('✅ Datos actualizados');
                            setTimeout(() => setSaveMessage(null), 2000);
                          }, 500);
                        }}
                        className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[#181B34] hover:bg-white transition-colors border border-[#E4E7EF] flex items-center gap-2 shadow-md"
                    >
                        <RefreshCw size={18} />
                        <span className="text-sm font-medium">Refrescar</span>
                    </button>
                </div>
            </div>

            <div className="px-4 -mt-24 relative z-10">
                <div className="bg-white rounded-2xl !overflow-visible px-6 pb-8 border border-[#E4E7EF] shadow-[0_4px_30px_rgba(0,0,0,0.08)] flex flex-col items-center">
                    
                    {/* Avatar - Simple, sin círculo extra */}
                    <div className="relative -mt-20 mb-4 z-20">
                        <img 
                            src={profile.avatarUrl} 
                            alt={profile.name}
                            className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                        />
                        {isEditing && (
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white"
                          >
                            <div className="text-center">
                              <Edit2 size={20} className="mx-auto mb-1" />
                              <span className="text-xs">Cambiar foto</span>
                            </div>
                          </button>
                        )}
                        <input 
                          ref={fileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif,.webp,.heic,.heif,image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                    </div>

                    {/* Main Info */}
                    <div className="text-center mb-4 w-full">
                        {isEditing ? (
                            <div className="space-y-2">
                                <input 
                                    value={profile.companyName} 
                                    onChange={(e) => setProfile({...profile, companyName: e.target.value})}
                                    className="bg-[#F5F7FB] text-center text-2xl font-bold text-[#181B34] rounded-lg p-2 w-full outline-none border border-[#E4E7EF] focus:border-[#6161FF] focus:ring-2 focus:ring-[#6161FF]/20"
                                />
                                <input 
                                    value={profile.name} 
                                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                                    className="bg-[#F5F7FB] text-center text-[#434343] font-medium text-lg rounded-lg p-2 w-full outline-none border border-[#E4E7EF] focus:border-[#6161FF] focus:ring-2 focus:ring-[#6161FF]/20"
                                />
                            </div>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold text-[#181B34] mb-1 tracking-tight">{profile.companyName}</h2>
                                <p className="text-[#7C8193] font-medium text-lg">{profile.name}</p>
                            </>
                        )}
                        
                        {/* Badge de categoría (solo lectura) */}
                        {!isEditing && (
                          <div className="flex justify-center gap-2 mt-4 flex-wrap">
                            <span className="text-xs font-semibold bg-[#6161FF]/10 border border-[#6161FF]/30 text-[#6161FF] px-4 py-1.5 rounded-full">
                                {editCategory || profile.category}
                            </span>
                          </div>
                        )}
                        
                        {/* Botón Editar Perfil - Centrado debajo de categoría */}
                        <div className="mt-4">
                          {isEditing ? (
                            <div className="flex justify-center gap-3">
                              <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-full bg-[#FB275D]/10 text-[#FB275D] hover:bg-[#FB275D]/20 flex items-center gap-2 text-sm font-medium">
                                <X size={16}/> Cancelar
                              </button>
                              <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-full bg-[#00CA72] text-white hover:bg-[#00B366] flex items-center gap-2 text-sm font-medium disabled:opacity-50">
                                {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16}/>} Guardar
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setIsEditing(true)} className="px-4 py-2 rounded-full border border-[#6161FF]/30 text-[#6161FF] hover:bg-[#6161FF]/10 flex items-center gap-2 text-sm font-medium mx-auto">
                              <Edit2 size={14} /> Editar Perfil
                            </button>
                          )}
                        </div>
                    </div>

                    {/* Mensaje de guardado */}
                    {saveMessage && (
                        <div className={`w-full p-3 rounded-xl text-center text-sm font-medium mb-4 ${
                            saveMessage.includes('✅') || saveMessage.includes('📷')
                                ? 'bg-[#E6FFF3] text-[#008A4E] border border-[#00CA72]/30' 
                                : 'bg-[#FFF0F3] text-[#FB275D] border border-[#FB275D]/30'
                        }`}>
                            {saveMessage}
                        </div>
                    )}

        {/* Campos editables del perfil */}
        {isEditing && (
          <div className="w-full mb-6 space-y-4">
            {/* Datos básicos */}
            <div className="bg-[#F5F7FB] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase text-[#6161FF] tracking-wide">Datos Básicos</h4>
              <div>
                <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Nombre del Emprendimiento</label>
                <input 
                  value={profile.companyName}
                  onChange={(e) => setProfile({...profile, companyName: e.target.value})}
                  placeholder="Mi Empresa"
                  className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Tu Nombre</label>
                <input 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  placeholder="Tu nombre"
                  className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">WhatsApp</label>
                <input 
                  value={profile.whatsapp || profile.phone || ''}
                  onChange={(e) => setProfile({...profile, whatsapp: e.target.value, phone: e.target.value})}
                  placeholder="+56 9 1234 5678"
                  className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Descripción del Negocio</label>
                <textarea 
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  placeholder="Describe tu emprendimiento..."
                  rows={3}
                  className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF] resize-none"
                />
              </div>
            </div>

            {/* Categoría y Afinidad - SELECTORES para matching */}
            <div className="bg-[#F5F7FB] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase text-[#6161FF] tracking-wide">🎯 Categoría e Intereses (para Matching)</h4>
              <div>
                <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Giro/Categoría del Negocio</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                >
                  <option value="">Selecciona tu giro...</option>
                  {[...TRIBE_CATEGORY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Afinidad/Intereses</label>
                <select
                  value={editAffinity}
                  onChange={(e) => setEditAffinity(e.target.value)}
                  className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                >
                  <option value="">Selecciona tu afinidad...</option>
                  {[...AFFINITY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map((aff, idx) => (
                    <option key={idx} value={aff}>{aff}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Facturación Mensual</label>
                <select
                  value={editRevenue}
                  onChange={(e) => setEditRevenue(e.target.value)}
                  className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                >
                  <option value="">Selecciona rango...</option>
                  <option value="Menos de $500.000">Menos de $500.000</option>
                  <option value="$500.000 - $2.000.000">$500.000 - $2.000.000</option>
                  <option value="$2.000.000 - $5.000.000">$2.000.000 - $5.000.000</option>
                  <option value="$5.000.000 - $10.000.000">$5.000.000 - $10.000.000</option>
                  <option value="Más de $10.000.000">Más de $10.000.000</option>
                </select>
              </div>
            </div>

            {/* Geografía - SELECTORES para matching */}
            <div className="bg-[#F5F7FB] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase text-[#6161FF] tracking-wide">📍 Alcance Geográfico (para Matching)</h4>
              <div>
                <label className="text-xs font-bold uppercase text-[#7C8193] mb-2 block">Alcance del Servicio</label>
                <div className="grid grid-cols-3 gap-2">
                  {['LOCAL', 'REGIONAL', 'NACIONAL'].map(scope => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => setEditScope(scope as 'LOCAL' | 'REGIONAL' | 'NACIONAL')}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${editScope === scope ? 'bg-[#6161FF] text-white' : 'bg-white border border-[#E4E7EF] text-[#434343] hover:border-[#6161FF]'}`}
                    >
                      {scope}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* LOCAL: Selector Región -> Comuna */}
              {editScope === 'LOCAL' && (
                <div className="space-y-3 animate-fadeIn">
                  <div>
                    <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Región</label>
                    <select
                      value={editSelectedRegionForComuna}
                      onChange={(e) => {
                        setEditSelectedRegionForComuna(e.target.value);
                        setEditComuna(''); // Reset comuna al cambiar región
                      }}
                      className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                    >
                      <option value="">Selecciona región...</option>
                      {REGIONS.map(region => (
                        <option key={region.id} value={region.id}>{region.shortName}</option>
                      ))}
                    </select>
                  </div>
                  {editSelectedRegionForComuna && (
                    <div>
                      <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Comuna</label>
                      <select
                        value={editComuna}
                        onChange={(e) => setEditComuna(e.target.value)}
                        className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                      >
                        <option value="">Selecciona comuna...</option>
                        {editComunasDeRegion.map(comuna => (
                          <option key={comuna} value={comuna}>{comuna}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
              
              {/* REGIONAL: Multi-select de regiones */}
              {editScope === 'REGIONAL' && (
                <div className="animate-fadeIn">
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-2 block">Regiones donde operas</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {REGIONS.map(region => (
                      <button
                        key={region.id}
                        type="button"
                        onClick={() => {
                          if (editSelectedRegions.includes(region.id)) {
                            setEditSelectedRegions(editSelectedRegions.filter(r => r !== region.id));
                          } else {
                            setEditSelectedRegions([...editSelectedRegions, region.id]);
                          }
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all text-left ${
                          editSelectedRegions.includes(region.id) 
                            ? 'bg-[#6161FF] text-white' 
                            : 'bg-white border border-[#E4E7EF] text-[#434343] hover:border-[#6161FF]'
                        }`}
                      >
                        {editSelectedRegions.includes(region.id) ? '✓ ' : ''}{region.shortName}
                      </button>
                    ))}
                  </div>
                  {editSelectedRegions.length > 0 && (
                    <p className="text-xs text-[#6161FF] mt-2">{editSelectedRegions.length} región(es) seleccionada(s)</p>
                  )}
                </div>
              )}
              
              {editScope === 'NACIONAL' && (
                <p className="text-sm text-[#7C8193] italic">Operación a nivel nacional - matchearás con todos</p>
              )}
            </div>

            {/* Redes sociales */}
            <div className="bg-[#F5F7FB] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase text-[#6161FF] tracking-wide">Redes Sociales</h4>
              <div>
                <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Instagram</label>
                <input 
                  value={profile.instagram}
                  onChange={(e) => setProfile({...profile, instagram: e.target.value})}
                  placeholder="@tu_instagram"
                  className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">TikTok</label>
                <input 
                  value={(profile as any).tiktok || ''}
                  onChange={(e) => setProfile({...profile, tiktok: e.target.value} as any)}
                  placeholder="@tu_tiktok"
                  className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Facebook</label>
                <input 
                  value={(profile as any).facebook || ''}
                  onChange={(e) => setProfile({...profile, facebook: e.target.value} as any)}
                  placeholder="facebook.com/tu_pagina"
                  className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">X (Twitter)</label>
                <input 
                  value={(profile as any).twitter || ''}
                  onChange={(e) => setProfile({...profile, twitter: e.target.value} as any)}
                  placeholder="@tu_usuario"
                  className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Sitio Web</label>
                <input 
                  value={profile.website}
                  onChange={(e) => setProfile({...profile, website: e.target.value})}
                  placeholder="www.tusitio.cl"
                  className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                />
              </div>
            </div>
          </div>
        )}

        {!isEditing && profile && (
          <div className="flex flex-wrap gap-3 w-full mb-6">
            <a
              href={`https://www.instagram.com/${profile.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E91E63] via-[#C13584] to-[#F77737] text-white font-semibold hover:opacity-90 transition shadow-md"
            >
              <Instagram size={16} /> Instagram
            </a>
            {(profile as any).tiktok && (
              <a
                href={`https://www.tiktok.com/@${(profile as any).tiktok.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#000000] text-white font-semibold hover:bg-[#1a1a1a] transition shadow-md"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                TikTok
              </a>
            )}
            {(profile as any).facebook && (
              <a
                href={`https://facebook.com/${(profile as any).facebook.replace('facebook.com/', '').replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1877F2] text-white font-semibold hover:bg-[#166FE5] transition shadow-md"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
            )}
            {(profile as any).twitter && (
              <a
                href={`https://x.com/${(profile as any).twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#000000] text-white font-semibold hover:bg-[#1a1a1a] transition shadow-md"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X
              </a>
            )}
            <a
              href={`https://wa.me/${getAppConfig().whatsappSupport.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Conoce a ${profile.companyName} (${profile.category}). Mira su perfil en Tribu Impulsa.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00CA72] text-white font-semibold hover:bg-[#00B366] transition shadow-md"
            >
              <Share2 size={16} /> WhatsApp
            </a>
          </div>
        )}

        {/* Details - Solo visible cuando NO estamos editando */}
        {!isEditing && (
        <div className="space-y-8 w-full text-left">
                        <div>
                            <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">Biografía</h3>
                            <p className="text-[#434343] leading-relaxed text-lg">
                                {profile.bio}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-[#F5F7FB] p-4 rounded-2xl flex items-center gap-4 border border-[#E4E7EF]">
                              <div className="bg-[#6161FF]/10 p-2 rounded-lg text-[#6161FF] shrink-0"><MapPin size={20} /></div>
                              <div className="text-sm min-w-0">
                                <span className="block text-[#7C8193] text-[10px] mb-0.5 uppercase tracking-wide">Ubicación</span>
                                <span className="font-medium text-[#181B34]">{profile.location}</span>
                              </div>
                            </div>
                            <a 
                              href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[#F5F7FB] p-4 rounded-2xl flex items-center gap-4 border border-[#E4E7EF] hover:border-[#00CA72] transition-colors"
                            >
                              <div className="bg-[#00CA72]/10 p-2 rounded-lg text-[#00CA72] shrink-0"><Globe size={20} /></div>
                              <div className="text-sm min-w-0 flex-1">
                                <span className="block text-[#7C8193] text-[10px] mb-0.5 uppercase tracking-wide">Sitio Web</span>
                                <span className="font-medium text-[#181B34] block truncate">{profile.website}</span>
                              </div>
                              <ArrowRight size={16} className="text-[#7C8193] shrink-0" />
                            </a>
                        </div>
        </div>
        )}

        {/* Secciones siempre visibles */}
        <div className="space-y-8 w-full text-left">
                        <div>
                            <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">Etiquetas</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.tags.map((tag, idx) => (
                                <span key={`${tag}-${idx}`} className="text-sm bg-[#F5F7FB] border border-[#E4E7EF] px-4 py-2 rounded-lg text-[#434343] hover:border-[#6161FF] hover:text-[#6161FF] transition-colors flex items-center gap-2">
                                    #{tag}
                                    {isEditing && (
                                      <button 
                                        onClick={() => handleRemoveTag(tag)}
                                        className="text-[#FB275D] hover:text-[#FB275D] ml-1"
                                      >
                                        <X size={14} />
                                      </button>
                                    )}
                                </span>
                                ))}
                                {isEditing && !showTagInput && (
                                    <button 
                                      onClick={() => setShowTagInput(true)}
                                      className="text-sm border border-dashed border-[#6161FF]/40 px-4 py-2 rounded-lg text-[#6161FF] hover:bg-[#6161FF]/10"
                                    >
                                        + Agregar
                                    </button>
                                )}
                                {isEditing && showTagInput && (
                                  <div className="flex gap-2 items-center">
                                    <input
                                      type="text"
                                      value={newTag}
                                      onChange={(e) => setNewTag(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                      placeholder="Nueva etiqueta"
                                      className="text-sm bg-[#F5F7FB] border border-[#E4E7EF] px-3 py-2 rounded-lg outline-none focus:border-[#6161FF] w-32"
                                      autoFocus
                                    />
                                    <button 
                                      onClick={handleAddTag}
                                      className="text-[#00CA72] hover:text-[#00B366]"
                                    >
                                      <CheckCircle size={20} />
                                    </button>
                                    <button 
                                      onClick={() => { setShowTagInput(false); setNewTag(''); }}
                                      className="text-[#7C8193] hover:text-[#FB275D]"
                                    >
                                      <X size={20} />
                                    </button>
                                  </div>
                                )}
                            </div>
                        </div>
                        
                        {/* SECCIÓN MEMBRESÍA */}
                        <MembershipSection userId={currentUser?.id || ''} />
                        
                        {/* Botón de Notificaciones Push */}
                        <NotificationButton />
                        
                        {/* Opciones de cuenta */}
                        <div className="pt-4 border-t border-[#E4E7EF] space-y-3">
                            {/* Cambiar contraseña */}
                            <button 
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full py-3 rounded-xl border border-[#6161FF]/30 text-[#6161FF] hover:bg-[#6161FF]/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                            >
                                <Lock size={16} /> Cambiar Contraseña
                            </button>
                            
                            {/* Cerrar sesión */}
                            <button 
                                onClick={() => {
                                  clearStoredSession();
                                  localStorage.removeItem('tribu_session');
                                  localStorage.removeItem('algorithm_seen');
                                  navigate('/');
                                }} 
                                className="w-full py-3 rounded-xl border border-[#FB275D]/30 text-[#FB275D] hover:bg-[#FB275D]/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                            >
                                <LogOut size={16} /> Cerrar Sesión
                            </button>
                            
                            {/* Acceso secreto a Red/Directorio */}
                            <div className="pt-4 border-t border-dashed border-[#E4E7EF]">
                              <button
                                onClick={() => setShowSecretInput(!showSecretInput)}
                                className="text-xs text-[#B3B8C6] hover:text-[#7C8193] transition-colors"
                              >
                                🔐 Acceso administrador
                              </button>
                              {showSecretInput && (
                                <div className="mt-2 space-y-2 animate-fadeIn">
                                  <input
                                    type="password"
                                    value={secretCode}
                                    onChange={(e) => setSecretCode(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSecretAccess()}
                                    placeholder="Código de acceso..."
                                    className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-2 text-sm"
                                  />
                                  {secretCodeError && (
                                    <p className="text-xs text-[#FB275D]">{secretCodeError}</p>
                                  )}
                                  <button
                                    onClick={handleSecretAccess}
                                    className="w-full py-2 rounded-lg bg-[#181B34] text-white text-sm"
                                  >
                                    Acceder a Red Completa
                                  </button>
                                </div>
                              )}
                            </div>
                        </div>
                        
                        {/* Modal cambio de contraseña */}
                        {showPasswordModal && (
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                              <h3 className="text-lg font-bold text-[#181B34] mb-4 flex items-center gap-2">
                                <Lock size={20} className="text-[#6161FF]" />
                                Cambiar Contraseña
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase">Contraseña actual</label>
                                  <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-sm"
                                    placeholder="TRIBU2026"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase">Nueva contraseña</label>
                                  <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-sm"
                                    placeholder="Mínimo 6 caracteres"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase">Confirmar nueva contraseña</label>
                                  <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-sm"
                                    placeholder="Repetir contraseña"
                                  />
                                </div>
                                {passwordError && (
                                  <p className="text-[#FB275D] text-sm">{passwordError}</p>
                                )}
                                {passwordSuccess && (
                                  <p className="text-[#00CA72] text-sm">✅ Contraseña actualizada correctamente</p>
                                )}
                                <div className="flex gap-3 pt-2">
                                  <button
                                    onClick={() => {
                                      setShowPasswordModal(false);
                                      setCurrentPassword('');
                                      setNewPassword('');
                                      setConfirmPassword('');
                                      setPasswordError('');
                                      setPasswordSuccess(false);
                                    }}
                                    className="flex-1 py-2.5 rounded-xl border border-[#E4E7EF] text-[#7C8193] hover:bg-[#F5F7FB]"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={handleChangePassword}
                                    className="flex-1 py-2.5 rounded-xl bg-[#6161FF] text-white hover:bg-[#5151EE]"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente de Sección de Membresía
const MembershipSection = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [membership, setMembership] = useState<{
    status: string;
    paymentDate?: string;
    expiresAt?: string;
    paymentMethod?: string;
    amount?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos de membresía
  useEffect(() => {
    const loadMembership = async () => {
      if (!userId) return;
      
      // Primero buscar en localStorage
      const localStatus = localStorage.getItem(`membership_status_${userId}`);
      const localPayment = localStorage.getItem(`membership_payment_${userId}`);
      
      if (localStatus) {
        const paymentData = localPayment ? JSON.parse(localPayment) : {};
        setMembership({
          status: localStatus,
          paymentDate: paymentData.date,
          paymentMethod: paymentData.method,
          amount: paymentData.amount,
          expiresAt: paymentData.expiresAt
        });
      }
      
      // Luego intentar obtener de Firebase (fuente de verdad)
      try {
        const { getFirestoreInstance } = await import('./services/firebaseService');
        const { doc, getDoc } = await import('firebase/firestore');
        const db = getFirestoreInstance();
        if (db) {
          const membershipDoc = await getDoc(doc(db, 'memberships', userId));
          if (membershipDoc.exists()) {
            const data = membershipDoc.data();
            setMembership({
              status: data.status,
              paymentDate: data.paymentDate,
              expiresAt: data.expiresAt,
              paymentMethod: data.paymentMethod,
              amount: data.amount
            });
            // Sincronizar con localStorage (Firebase es fuente de verdad)
            localStorage.setItem(`membership_status_${userId}`, data.status || 'invitado');
            
            // Si es miembro/admin, guardar datos de pago. Si no, limpiar
            if (data.status === 'miembro' || data.status === 'admin') {
              localStorage.setItem(`membership_payment_${userId}`, JSON.stringify({
                method: data.paymentMethod,
                amount: data.amount,
                date: data.paymentDate,
                expiresAt: data.expiresAt
              }));
            } else {
              // Limpiar datos de pago si fue revocado
              localStorage.removeItem(`membership_payment_${userId}`);
            }
          }
        }
      } catch (err) {
        console.log('Error cargando membresía:', err);
      }
      
      setIsLoading(false);
    };
    
    loadMembership();
  }, [userId]);

  // Formatear fecha
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear precio - Usar precio de configuración como fallback
  const config = getAppConfig();
  const formatPrice = (amount?: number) => {
    const value = amount || config.membershipPrice;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Calcular días restantes
  const getDaysRemaining = () => {
    if (!membership?.expiresAt) return null;
    const expiry = new Date(membership.expiresAt);
    const now = new Date();
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (isLoading) {
    return (
      <div className="pt-4 border-t border-[#E4E7EF]">
        <div className="animate-pulse bg-[#F5F7FB] rounded-2xl h-32"></div>
      </div>
    );
  }

  const isMember = membership?.status === 'miembro' || membership?.status === 'admin';
  const daysRemaining = getDaysRemaining();

  return (
    <div className="pt-4 border-t border-[#E4E7EF]">
      <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">Membresía</h3>
      
      <div className={`rounded-2xl p-4 border ${isMember ? 'bg-gradient-to-br from-[#6161FF]/5 to-[#00CA72]/5 border-[#6161FF]/20' : 'bg-[#F5F7FB] border-[#E4E7EF]'}`}>
        {/* Estado */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isMember ? 'bg-[#6161FF]/10' : 'bg-[#7C8193]/10'}`}>
              <Crown size={20} className={isMember ? 'text-[#6161FF]' : 'text-[#7C8193]'} />
            </div>
            <div>
              <p className="font-semibold text-[#181B34]">
                {membership?.status === 'admin' ? 'Administrador' : isMember ? 'Miembro Activo' : 'Invitado'}
              </p>
              <p className="text-xs text-[#7C8193]">
                {isMember ? 'Acceso completo' : 'Acceso limitado'}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            membership?.status === 'admin' ? 'bg-[#FFCC00]/20 text-[#B38F00]' :
            isMember ? 'bg-[#00CA72]/20 text-[#008A4E]' : 'bg-[#7C8193]/20 text-[#7C8193]'
          }`}>
            {membership?.status === 'admin' ? 'ADMIN' : isMember ? 'ACTIVO' : 'PENDIENTE'}
          </span>
        </div>

        {/* Detalles si es miembro */}
        {isMember && (
          <div className="space-y-2 text-sm border-t border-[#E4E7EF]/50 pt-3">
            {/* Plan especial para Beta Pública */}
            {membership?.paymentMethod === 'beta_publica' ? (
              <>
                <div className="bg-gradient-to-r from-[#00CA72]/10 to-[#6161FF]/10 rounded-xl p-3 mb-2">
                  <p className="text-[#00CA72] font-bold text-center">
                    🎉 Mes Gratis - Círculo Emprendedor
                  </p>
                  <p className="text-xs text-[#7C8193] text-center mt-1">
                    Beta Pública Tribu Impulsa
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Activado:</span>
                  <span className="text-[#181B34] font-medium">{formatDate(membership?.paymentDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Válido hasta:</span>
                  <span className="text-[#181B34] font-medium">{formatDate(membership?.expiresAt)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Fecha de pago:</span>
                  <span className="text-[#181B34] font-medium">{formatDate(membership?.paymentDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Método:</span>
                  <span className="text-[#181B34] font-medium capitalize">{membership?.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Monto:</span>
                  <span className="text-[#181B34] font-medium">{formatPrice(membership?.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Vence:</span>
                  <span className="text-[#181B34] font-medium">{formatDate(membership?.expiresAt)}</span>
                </div>
              </>
            )}
            {daysRemaining !== null && daysRemaining <= 30 && (
              <div className="mt-2 p-2 bg-[#FFCC00]/10 rounded-lg">
                <p className="text-xs text-[#B38F00] font-medium">
                  ⚠️ Tu membresía vence en {daysRemaining} días
                </p>
              </div>
            )}
          </div>
        )}

        {/* Botón para invitados */}
        {!isMember && (
          <button
            onClick={() => navigate('/membership')}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#00CA72] to-[#00B366] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <Gift size={18} />
            ¡Canjear Mi Mes Gratis!
          </button>
        )}
      </div>
    </div>
  );
};

// Componente Toggle de Notificaciones
const NotificationButton = () => {
  const [status, setStatus] = useState(getNotificationStatus());
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const currentUser = getCurrentUser();
  
  const isEnabled = status.permission === 'granted' && status.hasToken;

  const handleToggle = async () => {
    if (isEnabled) {
      // Desactivar - limpiar token
      setIsLoading(true);
      if (currentUser) {
        clearFCMToken();
        // También podríamos remover de la DB
      }
      setShowToast('Notificaciones desactivadas');
      setTimeout(() => setShowToast(null), 3000);
      setStatus(getNotificationStatus());
      setIsLoading(false);
    } else {
      // Activar
      setIsLoading(true);
      const token = await requestNotificationPermission();
      if (token) {
        if (currentUser) {
          saveUserFCMToken(currentUser.id, token);
        }
        sendLocalNotification('¡Notificaciones activadas!', 'Recibirás alertas de tu tribu');
        setShowToast('¡Notificaciones activadas!');
      } else {
        setShowToast('No se pudieron activar las notificaciones');
      }
      setTimeout(() => setShowToast(null), 3000);
      setStatus(getNotificationStatus());
      setIsLoading(false);
    }
  };

  if (!status.supported) {
    return (
      <div className="p-4 bg-[#F5F7FB] rounded-xl border border-[#E4E7EF] text-center">
        <p className="text-sm text-[#7C8193]">Tu navegador no soporta notificaciones</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toast notification */}
      {showToast && (
        <div className="absolute -top-12 left-0 right-0 bg-[#181B34] text-white text-sm py-2 px-4 rounded-lg text-center animate-fadeIn">
          {showToast}
        </div>
      )}
      
      <div className={`p-4 rounded-xl border flex items-center justify-between ${
        isEnabled 
          ? 'bg-[#E6FFF3] border-[#00CA72]/30' 
          : 'bg-[#F5F7FB] border-[#E4E7EF]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isEnabled ? 'bg-[#00CA72] text-white' : 'bg-[#E4E7EF] text-[#7C8193]'
          }`}>
            <Bell size={20} />
          </div>
          <div>
            <p className={`font-semibold text-sm ${isEnabled ? 'text-[#008A4E]' : 'text-[#181B34]'}`}>
              {isEnabled ? 'Notificaciones activas' : 'Notificaciones'}
            </p>
            <p className={`text-xs ${isEnabled ? 'text-[#00CA72]' : 'text-[#7C8193]'}`}>
              {isEnabled ? 'Recibirás alertas de tu tribu' : 'Activa para recibir alertas'}
            </p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${
            isEnabled ? 'bg-[#00CA72]' : 'bg-[#E4E7EF]'
          } ${isLoading ? 'opacity-50' : ''}`}
        >
          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
    </div>
  );
};

// Componente de Análisis de Match con LLM
const MATCH_ANALYSIS_STORAGE_KEY = 'tribu_match_analysis';
const MATCH_ANALYSIS_MONTH_KEY = 'tribu_match_analysis_month';

interface MatchAnalysis {
  profileId: string;
  analysis: string;
  generatedAt: string;
  month: string;
}

const getStoredAnalysis = (profileId: string): MatchAnalysis | null => {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const storedMonth = localStorage.getItem(MATCH_ANALYSIS_MONTH_KEY);
  
  // Si cambió el mes, limpiar análisis antiguos
  if (storedMonth !== currentMonth) {
    localStorage.removeItem(MATCH_ANALYSIS_STORAGE_KEY);
    localStorage.setItem(MATCH_ANALYSIS_MONTH_KEY, currentMonth);
    return null;
  }
  
  const allAnalysis = JSON.parse(localStorage.getItem(MATCH_ANALYSIS_STORAGE_KEY) || '{}');
  return allAnalysis[profileId] || null;
};

const saveAnalysis = (profileId: string, analysis: string) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const allAnalysis = JSON.parse(localStorage.getItem(MATCH_ANALYSIS_STORAGE_KEY) || '{}');
  
  allAnalysis[profileId] = {
    profileId,
    analysis,
    generatedAt: new Date().toISOString(),
    month: currentMonth
  };
  
  localStorage.setItem(MATCH_ANALYSIS_STORAGE_KEY, JSON.stringify(allAnalysis));
  localStorage.setItem(MATCH_ANALYSIS_MONTH_KEY, currentMonth);
};

// Master Prompt para análisis de compatibilidad
const generateMatchAnalysisPrompt = (myProfile: MatchProfile, targetProfile: MatchProfile) => {
  return `Eres el "Algoritmo Tribal X" de Tribu Impulsa, una plataforma de cross-promotion para emprendedores chilenos.

CONTEXTO:
- Usuario actual: ${myProfile.name} de "${myProfile.companyName}"
- Categoría: ${myProfile.category}
- Ubicación: ${myProfile.location}
- Bio: ${myProfile.bio}
- Tags: ${myProfile.tags?.join(', ') || 'N/A'}

EMPRENDEDOR A ANALIZAR:
- Nombre: ${targetProfile.name} de "${targetProfile.companyName}"
- Categoría: ${targetProfile.category}  
- Subcategoría: ${targetProfile.subCategory}
- Ubicación: ${targetProfile.location}
- Bio: ${targetProfile.bio}
- Instagram: ${targetProfile.instagram}
- Tags: ${targetProfile.tags?.join(', ') || 'N/A'}

INSTRUCCIONES:
Genera un análisis breve (máximo 3-4 oraciones) explicando por qué estos dos emprendedores podrían tener una buena sinergia comercial para hacer cross-promotion en Chile. Considera:
1. Complementariedad de rubros (no competencia directa)
2. Potencial de audiencia compartida
3. Oportunidades de colaboración específicas

Responde en español chileno, de forma cercana y profesional. NO uses bullets, solo texto fluido.`;
};

// Estructura de análisis enriquecido
interface EnrichedAnalysis {
  insight: string;
  opportunities: string[];
  icebreaker: string;
}

const MatchAnalysisSection = ({ profileId, profileData }: { profileId: string; profileData: MatchProfile }) => {
  const [analysis, setAnalysis] = useState<EnrichedAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const myProfile = getMyProfile();
  
  // Verificar si ya existe análisis guardado al montar
  useEffect(() => {
    const stored = getStoredAnalysis(profileId);
    if (stored) {
      try {
        // Intentar parsear como objeto enriquecido
        const parsed = typeof stored.analysis === 'string' && stored.analysis.startsWith('{') 
          ? JSON.parse(stored.analysis) 
          : null;
        if (parsed && parsed.insight) {
          setAnalysis(parsed);
        } else {
          // Migrar análisis antiguo a formato nuevo
          setAnalysis({
            insight: stored.analysis,
            opportunities: ['Colaboración en redes sociales', 'Referidos mutuos'],
            icebreaker: `¡Hola! Vi tu emprendimiento en Tribu Impulsa y creo que podríamos colaborar. ¿Te interesa conversar?`
          });
        }
        setHasGenerated(true);
      } catch {
        setHasGenerated(false);
      }
    }
  }, [profileId]);
  
  // Generar análisis inteligente local - ESPECÍFICO para cada match
  const generateSmartAnalysis = (me: MatchProfile, target: MatchProfile): EnrichedAnalysis => {
    const sameLocation = me.location === target.location;
    const meCategory = me.category || 'emprendimiento';
    const targetCategory = target.category || 'emprendimiento';
    const meName = me.companyName || me.name;
    const targetName = target.companyName || target.name;
    
    // Insight ÚNICO basado en la combinación específica de categorías
    let insight = '';
    
    // Análisis específico por tipo de negocio
    if (targetCategory.includes('Paisajismo') || targetCategory.includes('Jardín')) {
      insight = `${targetName} puede atraer clientes que valoran el bienestar y la naturaleza - exactamente el perfil que busca servicios como los de ${meName}. Una colaboración donde ${targetName} recomiende tus servicios a sus clientes (y viceversa) podría generar leads de alta calidad para ambos.`;
    } else if (targetCategory.includes('Belleza') || targetCategory.includes('Estética')) {
      insight = `Los clientes de ${targetName} buscan verse y sentirse bien - una audiencia perfecta para ${meName}. Podrían crear experiencias conjuntas de bienestar o packs que combinen sus servicios para maximizar el valor percibido.`;
    } else if (targetCategory.includes('Marketing') || targetCategory.includes('Digital')) {
      insight = `${targetName} tiene expertise en visibilidad digital que podría potenciar la presencia online de ${meName}. A cambio, ${meName} podría ser un caso de éxito o referencia para ${targetName}.`;
    } else if (targetCategory.includes('Consultoría') || targetCategory.includes('Coaching')) {
      insight = `${targetName} trabaja con emprendedores que podrían necesitar exactamente lo que ofrece ${meName}. Esta conexión podría generar referidos de calidad en ambas direcciones.`;
    } else if (targetCategory.includes('Salud') || targetCategory.includes('Kinesiología')) {
      insight = `${targetName} y ${meName} comparten una audiencia interesada en bienestar integral. Sus clientes naturalmente podrían beneficiarse de ambos servicios, creando un ecosistema de salud completo.`;
    } else if (targetCategory.includes('Gastronomía') || targetCategory.includes('Alimentos')) {
      insight = `${targetName} tiene acceso a una audiencia que valora experiencias de calidad. Un evento conjunto o colaboración de contenido podría exponer ambas marcas a nuevos clientes potenciales.`;
    } else {
      insight = `${targetName} en ${targetCategory} y ${meName} en ${meCategory} tienen audiencias complementarias sin competir directamente. Sus clientes podrían beneficiarse de ambos servicios, creando oportunidades de referidos mutuos.`;
    }
    
    if (sameLocation) {
      insight += ` Al estar ambos en ${me.location}, pueden coordinar eventos presenciales o activaciones conjuntas.`;
    }
    
    // Oportunidades ESPECÍFICAS para este match
    const opportunities = [
      `Sorteo conjunto: ${meName} regala un servicio/producto de ${targetName} a sus seguidores (y viceversa)`,
      `Contenido colaborativo: Live de Instagram donde ambos comparten tips de sus industrias`,
      `Pack especial: Clientes de ${targetName} reciben descuento exclusivo en ${meName}`
    ];
    
    // Mensaje rompehielos personalizado
    const firstName = target.name?.split(' ')[0] || 'Hola';
    const icebreaker = `¡Hola ${firstName}! 👋 Soy de ${meName} y te encontré en Tribu Impulsa. Me parece que lo que hacen en ${targetName} es genial y creo que nuestras audiencias podrían beneficiarse mutuamente. ¿Te interesaría explorar un sorteo cruzado o alguna colaboración? ¡Creo que podría funcionar muy bien! 🚀`;
    
    return {
      insight,
      opportunities,
      icebreaker
    };
  };

  // Función para generar análisis con delay realista
  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    
    // Delay variable de 3-5 segundos para simular "pensando"
    const thinkingTime = 3000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, thinkingTime));
    
    try {
      // Intentar usar Azure OpenAI primero
      const { analyzeCompatibility } = await import('./services/aiMatchingService');
      const result = await analyzeCompatibility(
        { id: myProfile.id, name: myProfile.name, companyName: myProfile.companyName, city: myProfile.location || '', category: myProfile.category, affinity: myProfile.category },
        { id: profileData.id, name: profileData.name, companyName: profileData.companyName, city: profileData.location || '', category: profileData.category, affinity: profileData.category }
      );
      
      // Verificar que el resultado sea válido y no sea el mensaje de error genérico
      const isValidResult = result && 
        result.analysis && 
        result.analysis !== 'Análisis no disponible' &&
        result.opportunities && 
        result.opportunities.length > 0;
      
      if (isValidResult) {
        // Usar icebreaker del LLM si existe, o generar uno básico
        const llmIcebreaker = result.icebreaker || 
          `¡Hola ${profileData.name.split(' ')[0]}! 👋 Vi tu negocio ${profileData.companyName} y me encantó. ¿Te interesa explorar una colaboración? 🤝`;
        
        const enriched: EnrichedAnalysis = {
          insight: result.analysis,
          opportunities: result.opportunities,
          icebreaker: llmIcebreaker
        };
        console.log('✅ Análisis LLM completo:', enriched);
        setAnalysis(enriched);
        saveAnalysis(profileId, JSON.stringify(enriched));
      } else {
        // LLM no disponible o respuesta inválida - usar fallback local inteligente
        throw new Error('Using local fallback');
      }
    } catch {
      // Usar fallback inteligente local (siempre funciona)
      console.log('✅ Usando análisis local enriquecido');
      const smartAnalysis = generateSmartAnalysis(myProfile, profileData);
      setAnalysis(smartAnalysis);
      saveAnalysis(profileId, JSON.stringify(smartAnalysis));
    } finally {
      setIsLoading(false);
      setHasGenerated(true);
    }
  };
  
  // Generar URL de WhatsApp con mensaje pre-escrito
  const getWhatsAppUrl = () => {
    if (!analysis) return '#';
    const phone = profileData.phone?.replace(/\D/g, '') || '';
    const message = encodeURIComponent(analysis.icebreaker);
    return phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
  };
  
  // Estado de carga con animación épica
  if (isLoading) {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#6161FF]/20">
        <TribalLoadingAnimation isLoading={true} duration={4500} />
      </div>
    );
  }
  
  // Mostrar análisis enriquecido
  if (analysis) {
    return (
      <div className="bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-2xl p-5 border border-[#6161FF]/20 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-[#181B34] block">Análisis de Compatibilidad</span>
            <span className="text-xs text-[#7C8193]">Generado por Tribu X</span>
          </div>
        </div>
        
        {/* Insight principal */}
        <div className="bg-white rounded-xl p-4 border border-[#E4E7EF]">
          <h4 className="text-xs font-bold uppercase tracking-wide text-[#6161FF] mb-2">💡 Insight</h4>
          <p className="text-sm text-[#434343] leading-relaxed">{analysis.insight}</p>
        </div>
        
        {/* Oportunidades */}
        <div className="bg-white rounded-xl p-4 border border-[#E4E7EF]">
          <h4 className="text-xs font-bold uppercase tracking-wide text-[#00CA72] mb-2">🎯 Oportunidades concretas</h4>
          <ul className="space-y-2">
            {analysis.opportunities.map((opp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#434343]">
                <span className="text-[#00CA72] mt-0.5">•</span>
                <span>{opp}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Romper el hielo */}
        <div className="bg-[#25D366]/10 rounded-xl p-4 border border-[#25D366]/30">
          <h4 className="text-xs font-bold uppercase tracking-wide text-[#25D366] mb-2">💬 Rompe el hielo</h4>
          <p className="text-sm text-[#434343] leading-relaxed mb-3 italic">"{analysis.icebreaker}"</p>
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-[#20BA5C] transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Enviar mensaje
          </a>
        </div>
      </div>
    );
  }
  
  // Botón para generar análisis
  return (
    <div className="bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-2xl p-5 border border-[#6161FF]/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-[#181B34] block">¿Es buen match?</span>
          <span className="text-xs text-[#7C8193]">Descubre sinergias y oportunidades</span>
        </div>
      </div>
      <button
        onClick={handleGenerateAnalysis}
        className="w-full py-3 bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg"
      >
        <Sparkles size={18} />
        Analizar compatibilidad
      </button>
    </div>
  );
};

// 5. Full Profile Detail View (Other User)
const ProfileDetail = () => {
  useSurveyGuard();
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MatchProfile | undefined>(undefined);
  
  const instagramHandle = profile?.instagram?.replace('@', '') || '';
  const shareMessage = profile ? encodeURIComponent(`Conoce a ${profile.companyName} (${profile.category}). Mira su perfil en Tribu Impulsa.`) : '';

  useEffect(() => {
    if (id) {
      const p = getProfileById(id);
      setProfile(p);
    }
  }, [id]);

  if (!profile) return <div className="text-center mt-20 text-[#7C8193]">Cargando perfil...</div>;

  return (
    <div className="pb-24 animate-slideUp bg-[#F5F7FB] min-h-screen">
      {/* Header / Cover Image */}
      <div className="h-72 w-full relative">
         <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#F5F7FB]"></div>
         
         <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-md p-3 rounded-full text-[#181B34] hover:bg-white transition-colors z-20 border border-[#E4E7EF] shadow-md"
        >
          <ArrowLeft size={20} />
        </button>
      </div>
      
      <div className="px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl !overflow-visible px-6 pb-8 border border-[#E4E7EF] shadow-[0_4px_30px_rgba(0,0,0,0.08)] flex flex-col items-center">
           
           {/* Avatar simple sin logo overlay */}
           <div className="-mt-20 mb-6 z-20">
              <img 
                  src={profile.avatarUrl} 
                  alt={profile.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
              />
           </div>

           {/* Main Info - Flows naturally */}
           <div className="text-center mb-8 w-full">
             <h2 className="text-3xl font-bold text-[#181B34] mb-1 tracking-tight">{profile.companyName}</h2>
             <p className="text-[#7C8193] font-medium text-lg">{profile.name}</p>
             <div className="flex justify-center gap-2 mt-4 flex-wrap">
               <span className="text-xs font-semibold bg-[#6161FF]/10 border border-[#6161FF]/30 px-4 py-1.5 rounded-full text-[#6161FF]">
                 {profile.category}
               </span>
               <span className="text-xs font-semibold bg-[#00CA72]/10 border border-[#00CA72]/30 px-4 py-1.5 rounded-full text-[#00CA72]">
                 {profile.subCategory}
               </span>
             </div>
           </div>

           <div className="space-y-8 w-full text-left">
             <div>
               <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">Sobre Nosotros</h3>
               <p className="text-[#434343] leading-relaxed text-lg">
                 {profile.bio}
               </p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F5F7FB] p-4 rounded-2xl flex items-center gap-4 border border-[#E4E7EF]">
                   <div className="bg-[#6161FF]/10 p-2 rounded-lg text-[#6161FF]"><MapPin size={20} /></div>
                   <div className="text-sm">
                      <span className="block text-[#7C8193] text-[10px] mb-0.5 uppercase tracking-wide">Ubicación</span>
                      <span className="font-medium text-[#181B34]">{profile.location}</span>
                   </div>
                </div>
                <div className="bg-[#F5F7FB] p-4 rounded-2xl flex items-center gap-4 border border-[#E4E7EF]">
                   <div className="bg-[#00CA72]/10 p-2 rounded-lg text-[#00CA72]"><Calendar size={20} /></div>
                   <div className="text-sm">
                      <span className="block text-[#7C8193] text-[10px] mb-0.5 uppercase tracking-wide">Fundada</span>
                      <span className="font-medium text-[#181B34]">{profile.foundingYear}</span>
                   </div>
                </div>
             </div>

             <div>
                <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">Enlaces</h3>
                <div className="flex flex-col gap-3">
                  {/* Sitio Web - siempre visible */}
                  {profile.website ? (
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 text-[#434343] hover:text-[#6161FF] transition-colors bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EF] group hover:border-[#6161FF]"
                    >
                      <Globe size={20} className="text-[#6161FF] group-hover:scale-110 transition-transform"/> 
                      <span className="font-medium text-sm truncate">{profile.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 text-[#7C8193] bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EF]">
                      <Globe size={20} className="text-[#B3B8C6]"/> 
                      <span className="font-medium text-sm italic">Sitio web no registrado</span>
                    </div>
                  )}
                  
                  {/* Instagram - siempre visible */}
                  {profile.instagram ? (
                    <a 
                      href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 text-[#434343] hover:text-[#E91E63] transition-colors bg-gradient-to-r from-[#F5F7FB] to-[#FFF0F5] p-4 rounded-2xl border border-[#E91E63]/30 group hover:border-[#E91E63]"
                    >
                      <div className="bg-gradient-to-br from-[#E91E63] via-[#C13584] to-[#F77737] p-2 rounded-lg">
                        <Instagram size={18} className="text-white group-hover:scale-110 transition-transform"/> 
                      </div>
                      <span className="font-medium text-sm">{profile.instagram}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 text-[#7C8193] bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EF]">
                      <div className="bg-[#E4E7EF] p-2 rounded-lg">
                        <Instagram size={18} className="text-[#B3B8C6]"/> 
                      </div>
                      <span className="font-medium text-sm italic">Instagram no registrado</span>
                    </div>
                  )}
                  
                  {/* Email de contacto - siempre visible */}
                  {profile.email ? (
                    <a 
                      href={`mailto:${profile.email}`}
                      className="flex items-center gap-4 text-[#434343] hover:text-[#6161FF] transition-colors bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EF] group hover:border-[#6161FF]"
                    >
                      <div className="bg-[#6161FF]/10 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-[#6161FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-medium text-sm truncate">{profile.email}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 text-[#7C8193] bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EF]">
                      <div className="bg-[#E4E7EF] p-2 rounded-lg">
                        <svg className="w-5 h-5 text-[#B3B8C6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-medium text-sm italic">Email no registrado</span>
                    </div>
                  )}
                </div>
             </div>

             <div>
               <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">Tags</h3>
               <div className="flex flex-wrap gap-2">
                 {profile.tags.map(tag => (
                   <span key={tag} className="text-sm bg-[#F5F7FB] border border-[#E4E7EF] px-4 py-2 rounded-lg text-[#434343] hover:border-[#6161FF] hover:text-[#6161FF] transition-colors">
                     #{tag}
                   </span>
                 ))}
               </div>
             </div>

             {/* Sección de Análisis de Match - Tribu X */}
             <MatchAnalysisSection profileId={profile.id} profileData={profile} />

             <button className="w-full bg-gradient-to-r from-[#00CA72] to-[#4AE698] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02]">
               <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-6 h-6 filter invert brightness-200" alt="ws"/>
               Contactar por WhatsApp
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

// 6. Activity View - Sistema de notificaciones tribales
// 20 tipos de actividades:
// 1. share_reminder - Recordatorio de compartir
// 2. report_warning - Alguien te reportó
// 3. report_received - Recibiste un reporte de alguien
// 4. thanks_received - Alguien te dio gracias
// 5. like_received - Alguien te dio like
// 6. shared_you - Alguien te compartió
// 7. new_assignment - Nueva asignación tribal
// 8. month_start - Inicio de mes
// 9. mid_month - Recordatorio mitad de mes
// 10. month_end - Fin de mes
// 11. streak_achieved - Racha lograda
// 12. compliance_low - Cumplimiento bajo
// 13. compliance_high - Cumplimiento excelente
// 14. new_member - Nuevo miembro en la comunidad
// 15. profile_viewed - Alguien vio tu perfil
// 16. tribe_updated - Tu tribu fue actualizada
// 17. welcome - Bienvenida
// 18. tip - Consejo del día
// 19. achievement - Logro desbloqueado
// 20. system - Mensaje del sistema

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
  color: string;
  actionUrl?: string;
  archivedAt?: string;  // Para actividades archivadas
}

const ACTIVITY_CONFIG: Record<string, { icon: string; color: string; priority: number }> = {
  share_reminder: { icon: '📤', color: 'bg-[#FFCC00]/10 text-[#9D6B00]', priority: 1 },
  report_warning: { icon: '⚠️', color: 'bg-[#FB275D]/10 text-[#FB275D]', priority: 0 },
  report_received: { icon: '📋', color: 'bg-[#FB275D]/10 text-[#FB275D]', priority: 0 },
  thanks_received: { icon: '💜', color: 'bg-[#6161FF]/10 text-[#6161FF]', priority: 2 },
  like_received: { icon: '❤️', color: 'bg-[#FB275D]/10 text-[#E91E63]', priority: 2 },
  shared_you: { icon: '🔄', color: 'bg-[#00CA72]/10 text-[#00CA72]', priority: 1 },
  new_assignment: { icon: '🎯', color: 'bg-[#6161FF]/10 text-[#6161FF]', priority: 0 },
  month_start: { icon: '📅', color: 'bg-[#00CA72]/10 text-[#00CA72]', priority: 1 },
  mid_month: { icon: '⏰', color: 'bg-[#FFCC00]/10 text-[#9D6B00]', priority: 1 },
  month_end: { icon: '🏁', color: 'bg-[#FB275D]/10 text-[#FB275D]', priority: 0 },
  streak_achieved: { icon: '🔥', color: 'bg-[#FF6B35]/10 text-[#FF6B35]', priority: 2 },
  compliance_low: { icon: '📉', color: 'bg-[#FB275D]/10 text-[#FB275D]', priority: 0 },
  compliance_high: { icon: '🏆', color: 'bg-[#00CA72]/10 text-[#00CA72]', priority: 2 },
  new_member: { icon: '👋', color: 'bg-[#6161FF]/10 text-[#6161FF]', priority: 3 },
  profile_viewed: { icon: '👀', color: 'bg-[#7C8193]/10 text-[#7C8193]', priority: 3 },
  tribe_updated: { icon: '🔄', color: 'bg-[#6161FF]/10 text-[#6161FF]', priority: 1 },
  welcome: { icon: '🎉', color: 'bg-[#00CA72]/10 text-[#00CA72]', priority: 0 },
  tip: { icon: '💡', color: 'bg-[#FFCC00]/10 text-[#9D6B00]', priority: 3 },
  achievement: { icon: '🏅', color: 'bg-[#FFD700]/10 text-[#B8860B]', priority: 2 },
  system: { icon: '📢', color: 'bg-[#7C8193]/10 text-[#7C8193]', priority: 2 }
};

// ============================================
// SISTEMA DE ACTIVIDADES PERSISTENTE (POR USUARIO)
// ============================================
const ACTIVITIES_KEY = 'tribu_activities';
const ARCHIVED_KEY = 'tribu_activities_archived';

// Obtener actividades del localStorage (específicas por usuario)
const getStoredActivities = (): ActivityItem[] => {
  if (typeof window === 'undefined') return [];
  const storageKey = getUserStorageKey(ACTIVITIES_KEY);
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch { return []; }
  }
  // Primera vez para este usuario - generar actividades iniciales
  const initial = generateInitialActivities();
  localStorage.setItem(storageKey, JSON.stringify(initial));
  return initial;
};

// Guardar actividades (específicas por usuario)
const persistActivities = (activities: ActivityItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserStorageKey(ACTIVITIES_KEY), JSON.stringify(activities));
};

// Obtener actividades archivadas (específicas por usuario)
const getArchivedActivities = (): ActivityItem[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(getUserStorageKey(ARCHIVED_KEY));
  if (stored) {
    try { return JSON.parse(stored); } catch { return []; }
  }
  return [];
};

// Archivar una actividad (NO borrar)
const archiveActivity = (activity: ActivityItem) => {
  if (typeof window === 'undefined') return;
  const archived = getArchivedActivities();
  archived.push({ ...activity, archivedAt: new Date().toISOString() });
  localStorage.setItem(getUserStorageKey(ARCHIVED_KEY), JSON.stringify(archived));
};

// Restaurar actividad archivada
const restoreActivity = (id: string): ActivityItem | null => {
  const archived = getArchivedActivities();
  const activity = archived.find(a => a.id === id);
  if (activity) {
    const updated = archived.filter(a => a.id !== id);
    localStorage.setItem(getUserStorageKey(ARCHIVED_KEY), JSON.stringify(updated));
    return activity;
  }
  return null;
};

// Generar actividades iniciales
const generateInitialActivities = (): ActivityItem[] => {
  const currentUser = getCurrentUser();
  const userName = currentUser?.name?.split(' ')[0] || 'Emprendedor';
  
  return [
    {
      id: `act_${Date.now()}_1`,
      type: 'welcome',
      title: `¡Bienvenido/a ${userName}!`,
      description: 'Tu comunidad de emprendedores te espera. Revisa tu tribu 10+10 y comienza a compartir.',
      timestamp: new Date().toLocaleDateString('es-CL'),
      isRead: false,
      icon: '🎉',
      color: 'bg-[#00CA72]/10 text-[#00CA72]',
      actionUrl: '/tribe'
    },
    {
      id: `act_${Date.now()}_2`,
      type: 'new_assignment',
      title: 'Tu tribu está lista',
      description: 'Tienes 10 cuentas para impulsar y 10 que te impulsarán. ¡Revísalas!',
      timestamp: new Date().toLocaleDateString('es-CL'),
      isRead: false,
      icon: '🎯',
      color: 'bg-[#6161FF]/10 text-[#6161FF]',
      actionUrl: '/tribe'
    },
    {
      id: `act_${Date.now()}_3`,
      type: 'tip',
      title: 'Consejo: Historias > Posts',
      description: 'Las historias de Instagram tienen más alcance. Comparte contenido de tu tribu en historias.',
      timestamp: new Date().toLocaleDateString('es-CL'),
      isRead: false,
      icon: '💡',
      color: 'bg-[#FFCC00]/10 text-[#9D6B00]'
    }
  ];
};

// Crear nueva actividad (para uso del sistema)
const createActivity = (type: string, title: string, description: string, actionUrl?: string): ActivityItem => {
  const config = ACTIVITY_CONFIG[type] || ACTIVITY_CONFIG.system;
  const activity: ActivityItem = {
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    description,
    timestamp: new Date().toLocaleDateString('es-CL'),
    isRead: false,
    icon: config.icon,
    color: config.color,
    actionUrl
  };
  
  // Persistir inmediatamente
  const activities = getStoredActivities();
  activities.unshift(activity);
  persistActivities(activities);
  
  return activity;
};

const ActivityView = () => {
  useSurveyGuard();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>(() => getStoredActivities());
  const [archivedActivities, setArchivedActivities] = useState<ActivityItem[]>(() => getArchivedActivities());
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [expandedItem, setExpandedItem] = useState<ActivityItem | null>(null);
  
  // Persistir cambios
  useEffect(() => {
    persistActivities(activities);
  }, [activities]);
  
  const filteredActivities = filter === 'unread' 
    ? activities.filter(a => !a.isRead)
    : filter === 'archived'
    ? archivedActivities
    : activities;
  
  const unreadCount = activities.filter(a => !a.isRead).length;
  
  const markAsRead = (id: string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };
  
  const markAllAsRead = () => {
    setActivities(prev => prev.map(a => ({ ...a, isRead: true })));
  };
  
  // Archivar en vez de borrar
  const handleArchive = (id: string) => {
    const activity = activities.find(a => a.id === id);
    if (activity) {
      archiveActivity(activity);
      setActivities(prev => prev.filter(a => a.id !== id));
      setArchivedActivities(getArchivedActivities());
    }
  };
  
  // Restaurar actividad archivada
  const handleRestore = (id: string) => {
    const activity = restoreActivity(id);
    if (activity) {
      setActivities(prev => [activity, ...prev]);
      setArchivedActivities(getArchivedActivities());
    }
  };

  return (
    <div className="pb-32 animate-fadeIn min-h-screen bg-[#F5F7FB]">
      <header className="px-6 pb-4 sticky top-0 z-30 backdrop-blur-xl bg-white/90 border-b border-[#E4E7EF] shadow-sm"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold flex items-center gap-2 text-[#181B34]">
            <Bell className="text-[#6161FF]" /> Actividad
            {unreadCount > 0 && (
              <span className="bg-[#FB275D] text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h1>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-[#6161FF] hover:underline"
              >
                Marcar leído
              </button>
            )}
          </div>
        </div>
        
        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filter === 'all' ? 'bg-[#6161FF] text-white' : 'bg-[#F5F7FB] text-[#7C8193]'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filter === 'unread' ? 'bg-[#6161FF] text-white' : 'bg-[#F5F7FB] text-[#7C8193]'
            }`}
          >
            Sin leer ({unreadCount})
          </button>
          {archivedActivities.length > 0 && (
            <button
              onClick={() => setFilter('archived')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                filter === 'archived' ? 'bg-[#7C8193] text-white' : 'bg-[#F5F7FB] text-[#7C8193]'
              }`}
            >
              Archivadas ({archivedActivities.length})
            </button>
          )}
        </div>
      </header>
      
      <div className="px-4 py-4 space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-[#7C8193]">No hay actividades {filter === 'unread' ? 'sin leer' : ''}</p>
          </div>
        ) : (
          filteredActivities.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white p-4 rounded-2xl flex gap-4 items-start group hover:shadow-md transition-all border cursor-pointer ${
                item.isRead ? 'border-[#E4E7EF]' : 'border-[#6161FF]/30 bg-[#6161FF]/5'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Abrir modal para ver completo
                setExpandedItem(item);
              }}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className={`font-semibold text-sm ${item.isRead ? 'text-[#434343]' : 'text-[#181B34]'}`}>
                    {item.title}
                  </h3>
                  <span className="text-[10px] text-[#7C8193] whitespace-nowrap">{item.timestamp}</span>
                </div>
                <p className="text-xs text-[#7C8193] leading-relaxed line-clamp-2">{item.description}</p>
                <span className="text-[10px] text-[#6161FF] mt-1 inline-block">Tocar para ver más →</span>
              </div>
              {filter === 'archived' ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleRestore(item.id); }}
                  className="text-[#00CA72] hover:text-[#008A4E] transition p-1 text-xs"
                >
                  Restaurar
                </button>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleArchive(item.id); }}
                  className="opacity-0 group-hover:opacity-100 text-[#7C8193] hover:text-[#FB275D] transition p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Modal para ver actividad completa */}
      {expandedItem && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 bg-black/50 z-[10000] flex items-end justify-center animate-fadeIn"
          onClick={() => {
            markAsRead(expandedItem.id);
            setExpandedItem(null);
          }}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-t-3xl p-6 animate-slideUp max-h-[80vh] overflow-y-auto"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl ${expandedItem.color}`}>
                {expandedItem.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-[#181B34]">{expandedItem.title}</h2>
                <p className="text-xs text-[#7C8193]">{expandedItem.timestamp}</p>
              </div>
              <button 
                onClick={() => {
                  markAsRead(expandedItem.id);
                  setExpandedItem(null);
                }}
                className="text-[#7C8193] hover:text-[#181B34] p-1"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Content */}
            <div className="text-sm text-[#434343] leading-relaxed whitespace-pre-wrap mb-6">
              {expandedItem.description}
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              {expandedItem.actionUrl && (
                <button
                  onClick={() => {
                    markAsRead(expandedItem.id);
                    navigate(expandedItem.actionUrl!);
                    setExpandedItem(null);
                  }}
                  className="flex-1 bg-[#6161FF] text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
                >
                  Ir a ver →
                </button>
              )}
              <button
                onClick={() => {
                  markAsRead(expandedItem.id);
                  setExpandedItem(null);
                }}
                className={`${expandedItem.actionUrl ? '' : 'flex-1'} px-6 py-3 rounded-xl font-medium border border-[#E4E7EF] text-[#7C8193] hover:bg-[#F5F7FB] transition`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Directory View - Lista de todos los emprendedores
const DirectoryView = () => {
  useSurveyGuard();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const allUsers = getAllUsers().filter(u => u.email !== 'admin@tribuimpulsa.cl');
  const myProfile = getMyProfile();
  
  // Obtener matches recomendados
  const matches = useMemo(() => {
    if (!myProfile) return [];
    return generateMockMatches(myProfile.category, myProfile.id).slice(0, 8);
  }, [myProfile]);
  
  const filteredUsers = allUsers.filter(user => 
    user.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-32 min-h-screen bg-[#F5F7FB]">
      <header className="px-5 pb-4 sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-white/20"
        style={{
          paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.5)'
        }}
      >
        <h1 className="text-xl font-bold text-[#181B34]">Red de Emprendedores</h1>
        <p className="text-sm text-[#7C8193]">{allUsers.length} emprendimientos activos</p>
        
        {/* Search with glass effect */}
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="Buscar por nombre o rubro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#6161FF] pl-10"
          />
          <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C8193]" />
        </div>
      </header>
      
      {/* Recomendados para ti - Al inicio */}
      {matches.length > 0 && !searchQuery && (
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#181B34]">⭐ Recomendados para ti</h2>
            <span className="text-xs text-[#7C8193]">{matches.length} matches</span>
          </div>
          
          <div className="space-y-2 mb-4">
            {matches.map((match) => (
              <div 
                key={match.id} 
                className="bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-xl p-4 border border-[#6161FF]/20 hover:border-[#6161FF] transition-colors"
              >
                <div className="flex gap-3 items-center">
                  <img 
                    src={match.targetProfile.avatarUrl} 
                    alt={match.targetProfile.name} 
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-[#6161FF]/30"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#181B34] truncate text-sm">{match.targetProfile.companyName}</h3>
                        <p className="text-xs text-[#7C8193] truncate">{match.targetProfile.name}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${match.affinityScore > 90 ? 'bg-[#00CA72]/20 text-[#00CA72]' : 'bg-[#6161FF]/20 text-[#6161FF]'}`}>
                        {match.affinityScore}%
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7C8193] mt-1 truncate">{match.reason}</p>
                    
                    <button
                      onClick={() => navigate(`/profile/${match.targetProfile.id}`)}
                      className="mt-2 text-[10px] font-semibold text-[#E91E63] bg-[#E91E63]/10 px-3 py-1 rounded-full hover:bg-[#E91E63]/20 transition-colors"
                    >
                      Ver perfil →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-b border-[#E4E7EF] mb-4"></div>
          <h2 className="text-base font-semibold text-[#181B34] mb-3">Todos los emprendimientos</h2>
        </div>
      )}
      
      <div className={`px-4 ${matches.length > 0 && !searchQuery ? '' : 'py-4'} space-y-2`}>
        {filteredUsers.map(user => (
          <div 
            key={user.id}
            onClick={() => navigate(`/profile/${user.id}`)}
            className="bg-white rounded-xl p-4 border border-[#E4E7EF] hover:border-[#6161FF] transition-colors cursor-pointer flex items-center gap-3"
          >
            <img 
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=6161FF&color=fff`}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-[#181B34] truncate">{user.companyName || user.name}</h3>
              <p className="text-xs text-[#7C8193] truncate">{user.name}</p>
              <span className="text-[10px] text-[#6161FF]">{user.category}</span>
            </div>
            <ChevronRight size={18} className="text-[#7C8193] flex-shrink-0" />
          </div>
        ))}
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#7C8193]">No se encontraron emprendimientos</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Tutorial Steps Component - Sin emojis, iconos profesionales
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: '¡Conoce a tu Tribu!',
    subtitle: 'Bienvenido/a a la comunidad de emprendedores',
    content: '🎯 Tribu Impulsa es una red de apoyo mutuo donde emprendedores se impulsan entre sí.\n\nCada mes recibes TU TRIBU: un grupo de emprendedores seleccionados especialmente para ti.',
    iconType: 'zap',
    color: 'from-[#6161FF] to-[#00CA72]'
  },
  {
    id: 'howItWorks',
    title: '¿Cómo funciona?',
    subtitle: 'Es simple: dar y recibir',
    content: '📤 YO DOY: Compartes el contenido de 10 emprendedores en tus redes sociales (historias, posts, etc.)\n\n📥 YO RECIBO: 10 emprendedores diferentes comparten TU contenido en sus redes\n\n¡Así todos ganamos exposición!',
    iconType: 'users',
    color: 'from-[#00CA72] to-[#4AE698]'
  },
  {
    id: 'matching',
    title: 'Matching Inteligente',
    subtitle: 'El algoritmo trabaja por ti',
    content: '🧠 Nuestro algoritmo te conecta con emprendedores:\n\n✓ Complementarios a tu negocio (no competencia)\n✓ De la zona geográfica que tú hayas elegido\n✓ Con intereses y afinidades similares\n\nEl 1° de cada mes recibes una NUEVA Tribu.',
    iconType: 'zap',
    color: 'from-[#A78BFA] to-[#C9A8FF]'
  },
  {
    id: 'checklist',
    title: 'Tu Checklist Mensual',
    subtitle: 'Mantén el control de tus colaboraciones',
    content: '✅ Paso 1: Ve a "Checklist" en el menú\n✅ Paso 2: Revisa tus 10+10 asignaciones\n✅ Paso 3: Comparte y marca "Ya compartí"\n✅ Paso 4: Escríbeles por WhatsApp\n\nSi alguien no cumple, puedes reportarlo.',
    iconType: 'check',
    color: 'from-[#FFCC00] to-[#FFE066]'
  },
  {
    id: 'start',
    title: '¡Listo para empezar!',
    subtitle: 'Tu Tribu te está esperando',
    content: '🚀 Ya tienes todo lo que necesitas:\n\n1. Revisa tu Tribu del mes\n2. Comparte a tus 10 asignados\n3. Conéctate por WhatsApp\n4. ¡Crece junto a la comunidad!\n\n¿Empezamos?',
    iconType: 'user',
    color: 'from-[#E91E63] to-[#FF6B9D]'
  }
];

// Iconos SVG para el onboarding (más profesionales que emojis)
const OnboardingIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    zap: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  };
  return icons[type] || icons.zap;
};

interface OnboardingModalProps {
  onComplete: () => void;
}

const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];
  
  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const handleSkip = () => {
    onComplete();
  };
  
  // Usar portal para renderizar fuera del contenedor scrolleable
  // Estilos completamente inline para máxima prioridad
  return ReactDOM.createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 999999,
        overflow: 'hidden',
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '400px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        className="animate-slideUp">
        {/* Progress */}
        <div className="flex gap-1 p-4">
          {TUTORIAL_STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 h-1 rounded-full transition-all ${
                i <= currentStep ? 'bg-gradient-to-r from-[#6161FF] to-[#00CA72]' : 'bg-[#E4E7EF]'
              }`}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
            <OnboardingIcon type={step.iconType} />
          </div>
          
          <h2 className="text-2xl font-bold text-[#181B34] text-center mb-1">{step.title}</h2>
          <p className="text-[#7C8193] text-center text-sm mb-4">{step.subtitle}</p>
          
          <div className="bg-[#F5F7FB] rounded-xl p-4 mb-6">
            <p className="text-[#434343] text-sm whitespace-pre-line">{step.content}</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleSkip}
              className="flex-1 py-3 text-[#7C8193] hover:text-[#181B34] transition text-sm"
            >
              Saltar tutorial
            </button>
            <button 
              onClick={handleNext}
              className="flex-1 py-3 bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              {currentStep < TUTORIAL_STEPS.length - 1 ? 'Siguiente' : '¡Comenzar!'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Modal de cambio de contraseña para primer login
const PasswordChangeModal = ({ onComplete, onSkip }: { onComplete: (newPass: string) => void; onSkip: () => void }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    onComplete(newPassword);
  };

  return ReactDOM.createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 999999,
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '400px',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        className="animate-slideUp"
      >
        <div className="p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FFCC00] to-[#FFE066] flex items-center justify-center text-3xl shadow-lg">
            🔐
          </div>
          <h2 className="text-xl font-bold text-[#181B34] text-center mb-2">¡Bienvenido/a a Tribu!</h2>
          <p className="text-[#7C8193] text-center text-sm mb-4">
            Por seguridad, te recomendamos cambiar tu contraseña
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF]"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF]"
                placeholder="Repite tu contraseña"
              />
            </div>
            
            {error && <p className="text-[#FB275D] text-sm text-center">{error}</p>}

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              Guardar nueva contraseña
            </button>
            <button
              onClick={onSkip}
              className="w-full py-2 text-[#7C8193] hover:text-[#181B34] text-sm transition"
            >
              Mantener TRIBU2026 por ahora
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// 7. Dashboard (Matches)
const Dashboard = () => {
  useSurveyGuard();
  const navigate = useNavigate();
  // Use current user profile for icon
  const myProfile = getMyProfile();
  // Generar matches usando usuarios REALES
  const matches = generateMockMatches(myProfile.category, myProfile.id);
  const tribeStats = getTribeStatsSnapshot(myProfile.category, myProfile.id);
  
  // Menú hamburguesa state
  const [showMenu, setShowMenu] = useState(false);
  
  // Onboarding state
  const currentUser = getCurrentUser();
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (!currentUser) return false;
    return !isOnboardingComplete(currentUser.id);
  });
  
  // Password change modal for first login
  const [showPasswordChange, setShowPasswordChange] = useState(() => {
    return localStorage.getItem('show_password_change') === 'true';
  });
  
  const handleOnboardingComplete = () => {
    if (currentUser) {
      updateOnboardingProgress(currentUser.id, 'viewedWelcome');
      updateOnboardingProgress(currentUser.id, 'viewedTribeExplainer');
      updateOnboardingProgress(currentUser.id, 'viewedChecklistTutorial');
      updateOnboardingProgress(currentUser.id, 'viewedProfileSetup');
      createReminder(currentUser.id, 'welcome');
    }
    setShowOnboarding(false);
  };
  
  const handlePasswordChange = async (newPassword: string) => {
    if (currentUser) {
      changeUserPassword(currentUser.id, newPassword);
      // Marcar que ya cambió su contraseña (nunca más mostrar el popup)
      localStorage.setItem(`password_changed_${currentUser.id}`, 'true');
      
      // Sincronizar con Firebase
      try {
        const { updateUserPassword } = await import('./services/firebaseService');
        await updateUserPassword(currentUser.id, newPassword);
      } catch (err) {
        console.log('⚠️ Contraseña guardada localmente');
      }
    }
    localStorage.removeItem('show_password_change');
    setShowPasswordChange(false);
  };
  
  const handleSkipPasswordChange = () => {
    if (currentUser) {
      markFirstLoginComplete(currentUser.id);
    }
    localStorage.removeItem('show_password_change');
    setShowPasswordChange(false);
  };

  return (
    <div className="pb-32 animate-fadeIn min-h-screen bg-[#F5F7FB]">
      {/* Password Change Modal (first login) */}
      {showPasswordChange && !showOnboarding && (
        <PasswordChangeModal onComplete={handlePasswordChange} onSkip={handleSkipPasswordChange} />
      )}
      
      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      
      {/* Banner de perfil incompleto */}
      {!showOnboarding && !showPasswordChange && (!currentUser?.scope || (!currentUser?.comuna && currentUser?.scope === 'LOCAL') || (!currentUser?.selectedRegions?.length && currentUser?.scope === 'REGIONAL')) && (
        <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-[#FF9500] to-[#FF6B00] rounded-xl shadow-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📍</span>
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm">¿Dónde está tu negocio?</h3>
              <p className="text-white/80 text-xs mt-1">
                Completa tu ubicación para que el algoritmo encuentre matches cercanos a ti.
              </p>
              <button 
                onClick={() => navigate('/my-profile')}
                className="mt-3 px-4 py-2 bg-white text-[#FF6B00] rounded-lg text-xs font-bold hover:bg-white/90 transition"
              >
                Completar perfil →
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Menú Hamburguesa Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          />
          {/* Menu Panel - Slides from LEFT like Santander */}
          <div className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl animate-slideIn">
            <div className="p-6 bg-gradient-to-r from-[#6161FF] to-[#00CA72]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Menú</h2>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <img 
                  src={myProfile.avatarUrl} 
                  alt="Me"
                  className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
                />
                <div>
                  <p className="text-white font-semibold">{myProfile.name}</p>
                  <p className="text-white/70 text-sm">{myProfile.companyName}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              {/* Alianzas y Beneficios */}
              <p className="text-xs font-bold text-[#7C8193] uppercase tracking-wide px-3 mb-2">Alianzas y Beneficios</p>
              
              <button 
                onClick={() => { setShowMenu(false); navigate('/beneficios'); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F7FB] transition"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6161FF] to-[#00CA72] flex items-center justify-center">
                  <Gift size={20} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-[#181B34]">Club de Bienestar</p>
                  <p className="text-xs text-[#7C8193]">Descuentos exclusivos para miembros</p>
                </div>
                <ChevronRight size={16} className="text-[#7C8193]" />
              </button>
              
              <button 
                onClick={() => { setShowMenu(false); navigate('/academia'); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F7FB] transition"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#EC0000] to-[#CC0000] flex items-center justify-center">
                  <span className="text-lg">🎓</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-[#181B34]">Santander Academia</p>
                  <p className="text-xs text-[#7C8193]">Cursos gratuitos para emprendedores</p>
                </div>
                <ChevronRight size={16} className="text-[#7C8193]" />
              </button>
              
              <div className="border-t border-[#E4E7EF] my-3" />
              
              {/* Navegación */}
              <p className="text-xs font-bold text-[#7C8193] uppercase tracking-wide px-3 mb-2">Navegación</p>
              
              <button 
                onClick={() => { setShowMenu(false); navigate('/tribe'); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F7FB] transition"
              >
                <div className="w-10 h-10 rounded-lg bg-[#6161FF]/10 flex items-center justify-center">
                  <Users size={20} className="text-[#6161FF]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-[#181B34]">Mi Tribu</p>
                  <p className="text-xs text-[#7C8193]">Checklist y asignaciones</p>
                </div>
              </button>
              
              <button 
                onClick={() => { setShowMenu(false); navigate('/my-profile'); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F7FB] transition"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FFCC00]/10 flex items-center justify-center">
                  <UserIcon size={20} className="text-[#FFCC00]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-[#181B34]">Mi Perfil</p>
                  <p className="text-xs text-[#7C8193]">Configuración y cuenta</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Liquid Glass iOS 26 with safe area */}
      <header className="px-5 pb-5 flex justify-between items-center sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-white/20"
        style={{
          paddingTop: 'max(20px, env(safe-area-inset-top, 20px))',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.5)'
        }}
      >
        {/* Hamburger menu button */}
        <button 
          onClick={() => setShowMenu(true)}
          className="w-10 h-10 rounded-xl bg-[#F5F7FB] flex items-center justify-center hover:bg-[#E4E7EF] transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#181B34" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold text-[#181B34]">Hola, {myProfile.name.split(' ')[0]}</h1>
          <p className="text-[#7C8193] text-sm">Tu comunidad de impulso</p>
        </div>
        
        <button 
          onClick={() => navigate('/my-profile')}
          className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#E4E7EF] hover:border-[#6161FF] transition-colors"
        >
           <img 
            src={myProfile.avatarUrl} 
            alt="Me"
            className="w-full h-full object-cover"
           />
        </button>
      </header>

      {/* Banner de recordatorio si perfil incompleto */}
      <ProfileReminderBanner />

      {/* Tip del Día */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-[#F5F7FB] to-white rounded-xl p-4 border border-[#E4E7EF]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFCC00]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">💡</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#7C8193] mb-1">TIP DEL DÍA</p>
              <p className="text-sm text-[#181B34] leading-relaxed">
                {(() => {
                  const tips = [
                    "Los emprendedores que comparten 3+ veces por semana crecen un 40% más rápido en redes.",
                    "Una story mencionando a otro emprendedor genera 2x más engagement que una publicación normal.",
                    "El mejor horario para compartir en Chile es entre 12:00 y 14:00 hrs.",
                    "Agregar una recomendación genuina al compartir aumenta la credibilidad de ambos.",
                    "Los emprendedores con checklist completo reciben 60% más shares de vuelta.",
                    "Responder stories de tu tribu fortalece la relación y genera reciprocidad.",
                    "Un mensaje de agradecimiento después de ser compartido genera conexiones duraderas."
                  ];
                  const dayIndex = new Date().getDate() % tips.length;
                  return tips[dayIndex];
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cómo Funciona - Onboarding Accesible */}
      <div className="px-4 mb-4">
        <details open className="bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-xl border border-[#6161FF]/20 overflow-hidden group">
          <summary className="p-4 cursor-pointer list-none flex items-center justify-between hover:bg-[#6161FF]/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6161FF] to-[#00CA72] flex items-center justify-center">
                <HelpCircle size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#181B34]">¿Cómo funciona Tribu Impulsa?</p>
                <p className="text-xs text-[#7C8193]">Guía rápida del sistema 10+10</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-[#7C8193] group-open:rotate-90 transition-transform" />
          </summary>
          <div className="px-4 pb-4 space-y-3 border-t border-[#E4E7EF]/50">
            <div className="pt-3 space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-[#6161FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-[#181B34]">Conoce tu Tribu</p>
                  <p className="text-xs text-[#7C8193]">Cada mes recibes 10 emprendedores asignados para impulsar</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-[#00CA72] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-[#181B34]">Comparte y Colabora</p>
                  <p className="text-xs text-[#7C8193]">Etiqueta y comparte a tus 10 asignados en tus redes sociales</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-[#FFCC00] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#181B34] text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-[#181B34]">Recibe Impulso</p>
                  <p className="text-xs text-[#7C8193]">Otros 10 emprendedores diferentes te compartirán a ti</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-[#E91E63] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-[#181B34]">Crece en Comunidad</p>
                  <p className="text-xs text-[#7C8193]">Mayor visibilidad, networking real y oportunidades de negocio</p>
                </div>
              </div>
            </div>
            <div className="bg-[#F5F7FB] rounded-lg p-3 mt-2">
              <p className="text-xs text-[#7C8193]">
                💡 <span className="font-medium">Tip:</span> Conéctate por WhatsApp con tu Tribu para coordinar cómo compartirse mutuamente. ¡La comunicación es clave!
              </p>
            </div>
          </div>
        </details>
      </div>

      {/* Logros y Gamificación */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#181B34]">Tus Logros</h2>
          <span className="text-xs text-[#7C8193]">Nivel {Math.min(5, Math.floor(tribeStats.completed / 4) + 1)}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-white rounded-xl p-4 border border-[#E4E7EF] mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#7C8193]">Progreso mensual</span>
            <span className="text-xs font-semibold text-[#6161FF]">{Math.round((tribeStats.completed / Math.max(tribeStats.total, 1)) * 100)}%</span>
          </div>
          <div className="h-2 bg-[#E4E7EF] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-full transition-all duration-500"
              style={{ width: `${(tribeStats.completed / Math.max(tribeStats.total, 1)) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-[#7C8193] mt-2">
            {tribeStats.total - tribeStats.completed > 0 
              ? `${tribeStats.total - tribeStats.completed} acciones más para completar este mes`
              : '¡Felicidades! Completaste todas las acciones'}
          </p>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Badge 1: Primera acción */}
          <div className={`flex flex-col items-center p-2 rounded-xl ${tribeStats.completed >= 1 ? 'bg-[#00CA72]/10' : 'bg-[#F5F7FB]'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${tribeStats.completed >= 1 ? 'bg-[#00CA72]' : 'bg-[#E4E7EF]'}`}>
              <span className="text-lg">{tribeStats.completed >= 1 ? '🚀' : '🔒'}</span>
            </div>
            <span className={`text-[9px] text-center ${tribeStats.completed >= 1 ? 'text-[#00CA72] font-semibold' : 'text-[#B3B8C6]'}`}>
              Primera acción
            </span>
          </div>
          
          {/* Badge 2: 5 shares */}
          <div className={`flex flex-col items-center p-2 rounded-xl ${tribeStats.completed >= 5 ? 'bg-[#6161FF]/10' : 'bg-[#F5F7FB]'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${tribeStats.completed >= 5 ? 'bg-[#6161FF]' : 'bg-[#E4E7EF]'}`}>
              <span className="text-lg">{tribeStats.completed >= 5 ? '⭐' : '🔒'}</span>
            </div>
            <span className={`text-[9px] text-center ${tribeStats.completed >= 5 ? 'text-[#6161FF] font-semibold' : 'text-[#B3B8C6]'}`}>
              5 shares
            </span>
          </div>
          
          {/* Badge 3: 10 shares */}
          <div className={`flex flex-col items-center p-2 rounded-xl ${tribeStats.completed >= 10 ? 'bg-[#E91E63]/10' : 'bg-[#F5F7FB]'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${tribeStats.completed >= 10 ? 'bg-[#E91E63]' : 'bg-[#E4E7EF]'}`}>
              <span className="text-lg">{tribeStats.completed >= 10 ? '🔥' : '🔒'}</span>
            </div>
            <span className={`text-[9px] text-center ${tribeStats.completed >= 10 ? 'text-[#E91E63] font-semibold' : 'text-[#B3B8C6]'}`}>
              En llamas
            </span>
          </div>
          
          {/* Badge 4: Tribu perfecta */}
          <div className={`flex flex-col items-center p-2 rounded-xl ${tribeStats.pending === 0 && tribeStats.completed >= 20 ? 'bg-[#FFCC00]/10' : 'bg-[#F5F7FB]'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${tribeStats.pending === 0 && tribeStats.completed >= 20 ? 'bg-[#FFCC00]' : 'bg-[#E4E7EF]'}`}>
              <span className="text-lg">{tribeStats.pending === 0 && tribeStats.completed >= 20 ? '👑' : '🔒'}</span>
            </div>
            <span className={`text-[9px] text-center ${tribeStats.pending === 0 && tribeStats.completed >= 20 ? 'text-[#FFCC00] font-semibold' : 'text-[#B3B8C6]'}`}>
              Tribu perfecta
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

// Componente de Administración de Membresías
const MembershipAdminTab = ({ users }: { users: Array<{id: string; name: string; email: string; companyName: string}> }) => {
  const [memberships, setMemberships] = useState<Record<string, {status: string; paymentDate?: string; expiresAt?: string; amount?: number}>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'miembro' | 'invitado'>('all');
  
  // Obtener precio desde configuración
  const config = getAppConfig();
  const MEMBERSHIP_PRICE = config.membershipPrice;

  // Cargar membresías - PRIORIDAD: Firebase > localStorage
  useEffect(() => {
    const loadMemberships = async () => {
      const membershipData: Record<string, {status: string; paymentDate?: string; expiresAt?: string; amount?: number}> = {};
      
      // Primero intentar cargar desde Firebase (fuente de verdad)
      let loadedFromFirebase = false;
      try {
        const { getFirestoreInstance } = await import('./services/firebaseService');
        const { collection, getDocs } = await import('firebase/firestore');
        const db = getFirestoreInstance();
        if (db) {
          const membershipsRef = collection(db, 'memberships');
          const snapshot = await getDocs(membershipsRef);
          snapshot.forEach(doc => {
            const data = doc.data();
            membershipData[doc.id] = {
              status: data.status || 'invitado',
              paymentDate: data.paymentDate,
              expiresAt: data.expiresAt,
              amount: data.amount
            };
            // Sincronizar a localStorage
            localStorage.setItem(`membership_status_${doc.id}`, data.status || 'invitado');
            if (data.status === 'miembro' || data.status === 'admin') {
              localStorage.setItem(`membership_payment_${doc.id}`, JSON.stringify({
                method: data.paymentMethod,
                amount: data.amount,
                date: data.paymentDate,
                expiresAt: data.expiresAt
              }));
            } else {
              localStorage.removeItem(`membership_payment_${doc.id}`);
            }
          });
          loadedFromFirebase = true;
          console.log('✅ Membresías cargadas desde Firebase:', Object.keys(membershipData).length);
        }
      } catch (err) {
        console.log('⚠️ Error cargando desde Firebase, usando localStorage:', err);
      }
      
      // Si no se pudo cargar desde Firebase, usar localStorage
      if (!loadedFromFirebase) {
        users.forEach(user => {
          const status = localStorage.getItem(`membership_status_${user.id}`);
          const paymentStr = localStorage.getItem(`membership_payment_${user.id}`);
          const payment = paymentStr ? JSON.parse(paymentStr) : {};
          
          membershipData[user.id] = {
            status: status || 'invitado',
            paymentDate: payment.date,
            expiresAt: payment.expiresAt,
            amount: payment.amount
          };
        });
      }
      
      // Asegurar que todos los usuarios tengan entrada
      users.forEach(user => {
        if (!membershipData[user.id]) {
          membershipData[user.id] = { status: 'invitado' };
        }
      });
      
      setMemberships(membershipData);
      setIsLoading(false);
    };
    
    loadMemberships();
  }, [users]);

  // Cambiar estado de membresía manualmente - SINCRONIZACIÓN COMPLETA
  const changeMembershipStatus = async (userId: string, newStatus: 'miembro' | 'invitado' | 'admin') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 1. ACTUALIZAR LOCALSTORAGE
    localStorage.setItem(`membership_status_${userId}`, newStatus);
    
    if (newStatus === 'miembro' || newStatus === 'admin') {
      const paymentData = {
        method: 'manual_admin',
        amount: MEMBERSHIP_PRICE,
        date: now,
        expiresAt: expiresAt
      };
      localStorage.setItem(`membership_payment_${userId}`, JSON.stringify(paymentData));
    } else {
      // REVOCAR: Limpiar datos de pago
      localStorage.removeItem(`membership_payment_${userId}`);
    }

    // 2. SINCRONIZAR CON FIREBASE + HISTORIAL DE PAGOS
    try {
      const { getFirestoreInstance } = await import('./services/firebaseService');
      const { doc, setDoc, collection, addDoc } = await import('firebase/firestore');
      const db = getFirestoreInstance();
      if (db) {
        const membershipDoc = {
          id: userId,
          email: user.email,
          status: newStatus,
          updatedBy: 'admin',
          updatedAt: now,
          // Solo incluir datos de pago si es miembro/admin
          ...(newStatus === 'miembro' || newStatus === 'admin' ? {
            paymentMethod: 'manual_admin',
            paymentDate: now,
            amount: MEMBERSHIP_PRICE,
            expiresAt: expiresAt
          } : {
            paymentMethod: null,
            paymentDate: null,
            amount: null,
            expiresAt: null
          })
        };
        await setDoc(doc(db, 'memberships', userId), membershipDoc);
        
        // REGISTRAR EN HISTORIAL DE PAGOS
        await addDoc(collection(db, 'payment_history'), {
          userId,
          userEmail: user.email,
          userName: user.name,
          companyName: user.companyName,
          action: newStatus === 'miembro' || newStatus === 'admin' ? 'membership_granted' : 'membership_revoked',
          newStatus,
          amount: newStatus === 'miembro' || newStatus === 'admin' ? MEMBERSHIP_PRICE : 0,
          timestamp: now,
          adminAction: true
        });
        
        console.log(`✅ Firebase actualizado + historial: ${user.name} → ${newStatus}`);
      }
    } catch (err) {
      console.log('⚠️ Error sincronizando membresía con Firebase:', err);
    }

    // 3. ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE
    setMemberships(prev => ({
      ...prev,
      [userId]: {
        status: newStatus,
        ...(newStatus === 'miembro' || newStatus === 'admin' ? {
          paymentDate: now,
          expiresAt: expiresAt,
          amount: MEMBERSHIP_PRICE
        } : {
          paymentDate: undefined,
          expiresAt: undefined,
          amount: undefined
        })
      }
    }));

    alert(`✅ ${user.name} ahora es ${newStatus.toUpperCase()}`);
  };

  // Estadísticas - USAR PRECIO DE CONFIGURACIÓN
  type MembershipData = {status: string; paymentDate?: string; expiresAt?: string; amount?: number};
  const membershipValues = Object.values(memberships) as MembershipData[];
  const stats = {
    total: users.length,
    miembros: membershipValues.filter(m => m.status === 'miembro').length,
    invitados: membershipValues.filter(m => m.status === 'invitado' || !m.status).length,
    admins: membershipValues.filter(m => m.status === 'admin').length,
    ingresos: membershipValues.filter(m => m.status === 'miembro' || m.status === 'admin').reduce((sum, m) => sum + (m.amount || MEMBERSHIP_PRICE), 0)
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const membership = memberships[user.id];
    if (filter === 'all') return true;
    if (filter === 'miembro') return membership?.status === 'miembro' || membership?.status === 'admin';
    return membership?.status === 'invitado' || !membership?.status;
  });

  const formatPrice = (amount: number) => 
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(amount);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6161FF] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#181B34]">Gestión de Membresías</h1>
        <div className="flex gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'miembro' | 'invitado')}
            className="bg-white border border-[#E4E7EF] rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Todos ({stats.total})</option>
            <option value="miembro">Miembros ({stats.miembros})</option>
            <option value="invitado">Invitados ({stats.invitados})</option>
          </select>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#E4E7EF] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-[#00CA72]"></div>
            <p className="text-[#7C8193] text-sm">Miembros Activos</p>
          </div>
          <p className="text-3xl font-bold text-[#181B34]">{stats.miembros}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E4E7EF] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-[#FFCC00]"></div>
            <p className="text-[#7C8193] text-sm">Invitados</p>
          </div>
          <p className="text-3xl font-bold text-[#181B34]">{stats.invitados}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E4E7EF] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-[#6161FF]"></div>
            <p className="text-[#7C8193] text-sm">Admins</p>
          </div>
          <p className="text-3xl font-bold text-[#181B34]">{stats.admins}</p>
        </div>
        <div className="bg-gradient-to-br from-[#00CA72]/10 to-[#00CA72]/5 rounded-xl p-5 border border-[#00CA72]/20">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard size={16} className="text-[#00CA72]" />
            <p className="text-[#00CA72] text-sm font-medium">Ingresos Totales</p>
          </div>
          <p className="text-3xl font-bold text-[#00CA72]">{formatPrice(stats.ingresos)}</p>
        </div>
      </div>

      {/* MercadoPago Config */}
      <div className="bg-gradient-to-r from-[#009EE3]/5 to-[#009EE3]/10 rounded-xl p-5 border border-[#009EE3]/20">
        <h3 className="text-[#009EE3] font-semibold mb-3 flex items-center gap-2">
          <CreditCard size={20} /> Configuración MercadoPago
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#7C8193] mb-1">Modo:</p>
            <span className="px-3 py-1 rounded-full bg-[#FFCC00]/20 text-[#9D6B00] font-medium">
              🧪 SANDBOX (Pruebas)
            </span>
          </div>
          <div>
            <p className="text-[#7C8193] mb-1">Public Key (Test):</p>
            <code className="text-xs bg-white/50 px-2 py-1 rounded">TEST-xxxxxxxx-xxxx-xxxx</code>
          </div>
        </div>
        <p className="text-xs text-[#7C8193] mt-3">
          Para producción, configura las credenciales reales en el archivo de configuración.
        </p>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-xl border border-[#E4E7EF] overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-[#F5F7FB]">
            <tr>
              <th className="text-left text-[#7C8193] text-sm font-medium px-4 py-3">Usuario</th>
              <th className="text-left text-[#7C8193] text-sm font-medium px-4 py-3">Email</th>
              <th className="text-center text-[#7C8193] text-sm font-medium px-4 py-3">Estado</th>
              <th className="text-center text-[#7C8193] text-sm font-medium px-4 py-3">Fecha Pago</th>
              <th className="text-right text-[#7C8193] text-sm font-medium px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E7EF]">
            {filteredUsers.map(user => {
              const membership = memberships[user.id];
              const isMember = membership?.status === 'miembro' || membership?.status === 'admin';
              
              return (
                <tr key={user.id} className="hover:bg-[#F5F7FB]/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-[#181B34] text-sm font-medium">{user.name}</p>
                      <p className="text-[#7C8193] text-xs">{user.companyName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#434343]">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      membership?.status === 'admin' ? 'bg-[#FFCC00]/20 text-[#9D6B00]' :
                      isMember ? 'bg-[#00CA72]/10 text-[#00CA72]' : 'bg-[#7C8193]/10 text-[#7C8193]'
                    }`}>
                      {membership?.status === 'admin' ? '👑 Admin' : isMember ? '✓ Miembro' : 'Invitado'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-[#434343]">
                    {membership?.paymentDate 
                      ? new Date(membership.paymentDate).toLocaleDateString('es-CL')
                      : '-'
                    }
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {!isMember && (
                        <button
                          onClick={() => changeMembershipStatus(user.id, 'miembro')}
                          className="text-xs bg-[#00CA72]/10 text-[#00CA72] px-2 py-1 rounded hover:bg-[#00CA72]/20"
                        >
                          Activar
                        </button>
                      )}
                      {isMember && membership?.status !== 'admin' && (
                        <>
                          <button
                            onClick={() => changeMembershipStatus(user.id, 'admin')}
                            className="text-xs bg-[#FFCC00]/10 text-[#9D6B00] px-2 py-1 rounded hover:bg-[#FFCC00]/20"
                          >
                            → Admin
                          </button>
                          <button
                            onClick={() => changeMembershipStatus(user.id, 'invitado')}
                            className="text-xs bg-[#FB275D]/10 text-[#FB275D] px-2 py-1 rounded hover:bg-[#FB275D]/20"
                          >
                            Revocar
                          </button>
                        </>
                      )}
                      {membership?.status === 'admin' && (
                        <button
                          onClick={() => changeMembershipStatus(user.id, 'miembro')}
                          className="text-xs bg-[#7C8193]/10 text-[#7C8193] px-2 py-1 rounded hover:bg-[#7C8193]/20"
                        >
                          → Miembro
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Componente de Configuración del Admin (FUNCIONAL)
const AdminSettingsTab = () => {
  // Cargar configuración guardada
  const savedConfig = JSON.parse(localStorage.getItem('tribu_admin_config') || '{}');
  
  const [config, setConfig] = useState({
    membershipPrice: savedConfig.membershipPrice || 20000,
    matchesPerUser: savedConfig.matchesPerUser || 10,
    whatsappSupport: savedConfig.whatsappSupport || '+56951776005',
    appName: savedConfig.appName || 'Tribu Impulsa',
    mercadopagoMode: savedConfig.mercadopagoMode || 'sandbox'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    // Guardar en localStorage
    localStorage.setItem('tribu_admin_config', JSON.stringify(config));

    // Sincronizar con Firebase usando función centralizada
    const synced = await syncAdminConfig(config);
    
    if (synced) {
      setSaveMessage('✅ Configuración guardada y sincronizada con Firebase');
    } else {
      setSaveMessage('✅ Guardado localmente (Firebase no disponible)');
    }

    setIsSaving(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#181B34]">Configuración</h1>
      
      {/* Configuración de Membresía */}
      <div className="bg-white rounded-xl p-6 border border-[#E4E7EF] shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-[#181B34] flex items-center gap-2">
          <CreditCard size={20} className="text-[#6161FF]" /> Membresía y Pagos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#434343] mb-1 font-medium">Precio mensual (CLP)</label>
            <input 
              type="number" 
              value={config.membershipPrice}
              onChange={(e) => setConfig({...config, membershipPrice: parseInt(e.target.value) || 0})}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30" 
            />
            <p className="text-xs text-[#7C8193] mt-1">Este precio se mostrará en la pantalla de pago</p>
          </div>
          <div>
            <label className="block text-sm text-[#434343] mb-1 font-medium">Modo MercadoPago</label>
            <select 
              value={config.mercadopagoMode}
              onChange={(e) => setConfig({...config, mercadopagoMode: e.target.value})}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
            >
              <option value="sandbox">🧪 Sandbox (Pruebas)</option>
              <option value="production">🚀 Producción (Real)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Configuración del Algoritmo */}
      <div className="bg-white rounded-xl p-6 border border-[#E4E7EF] shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-[#181B34] flex items-center gap-2">
          <Users size={20} className="text-[#00CA72]" /> Algoritmo de Matching
        </h3>
        <div>
          <label className="block text-sm text-[#434343] mb-1 font-medium">Matches por usuario (10+10)</label>
          <input 
            type="number" 
            value={config.matchesPerUser}
            onChange={(e) => setConfig({...config, matchesPerUser: parseInt(e.target.value) || 10})}
            className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30" 
          />
          <p className="text-xs text-[#7C8193] mt-1">Cuántas cuentas se asignan para compartir y recibir</p>
        </div>
      </div>

      {/* Configuración de Soporte */}
      <div className="bg-white rounded-xl p-6 border border-[#E4E7EF] shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-[#181B34] flex items-center gap-2">
          <HelpCircle size={20} className="text-[#A78BFA]" /> Soporte
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#434343] mb-1 font-medium">WhatsApp soporte</label>
            <input 
              type="text" 
              value={config.whatsappSupport}
              onChange={(e) => setConfig({...config, whatsappSupport: e.target.value})}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30" 
              placeholder="+56912345678"
            />
            <p className="text-xs text-[#7C8193] mt-1">Número que aparece en el botón de WhatsApp</p>
          </div>
          <div>
            <label className="block text-sm text-[#434343] mb-1 font-medium">Nombre de la App</label>
            <input 
              type="text" 
              value={config.appName}
              onChange={(e) => setConfig({...config, appName: e.target.value})}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30" 
            />
          </div>
        </div>
      </div>

      {/* Botón guardar */}
      <div className="flex items-center gap-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white px-6 py-3 rounded-lg hover:opacity-90 font-semibold transition disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save size={18} /> Guardar Cambios
            </>
          )}
        </button>
        {saveMessage && (
          <span className={`text-sm font-medium ${saveMessage.includes('✅') ? 'text-[#00CA72]' : 'text-[#FB275D]'}`}>
            {saveMessage}
          </span>
        )}
      </div>

      {/* Info de sincronización */}
      <div className="bg-[#F5F7FB] rounded-xl p-4 border border-[#E4E7EF]">
        <p className="text-xs text-[#7C8193]">
          <strong>Persistencia:</strong> Los cambios se guardan en localStorage y se sincronizan con Firebase.
          La configuración se aplica inmediatamente en toda la aplicación.
        </p>
      </div>
    </div>
  );
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
    tipo: 'Educación',
    descuento: 'GRATIS',
    color: 'from-[#EC0000] to-[#CC0000]',
    logo: '🎓',
    url: 'https://www.santanderopenacademy.com/',
    destacado: true
  },
  {
    id: 'lovework',
    nombre: 'Lovework',
    descripcion: 'Formalización y regularización empresarial. Asesoría para emprendedores.',
    tipo: 'Legal / Empresarial',
    descuento: '20% OFF',
    color: 'from-[#E91E63] to-[#C2185B]',
    logo: '💼',
    url: 'https://lovework.cl/',
    destacado: true
  },
  {
    id: 'soledad-mulati',
    nombre: 'Soledad Mulati',
    descripcion: 'Asesoría legal preferencial para miembros de Tribu Impulsa',
    tipo: 'Legal',
    descuento: '15% OFF',
    color: 'from-[#6161FF] to-[#4A4AE0]',
    logo: '⚖️',
    url: null,
    contacto: '+56 9 1234 5678'
  },
  {
    id: 'restaurantes',
    nombre: 'Red de Restaurantes',
    descripcion: 'Descuentos en restaurantes y cafeterías aliadas a la comunidad',
    tipo: 'Gastronomía',
    descuento: '10-15% OFF',
    color: 'from-[#FF9500] to-[#FF6B00]',
    logo: '🍽️',
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
    logo: '🏢',
    url: null,
    proximamente: true
  },
  {
    id: 'bienestar',
    nombre: 'Club de Bienestar',
    descripcion: 'Yoga, pilates, meditación y más con descuentos exclusivos',
    tipo: 'Bienestar',
    descuento: '20% OFF',
    color: 'from-[#A78BFA] to-[#8B5CF6]',
    logo: '🧘',
    url: null,
    proximamente: true
  }
];

const ClubBienestarView = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  const handleLinkClick = (alianza: typeof ALIANZAS_BENEFICIOS[0]) => {
    // Tracking: guardar que el usuario visitó esta alianza
    if (currentUser) {
      const key = `alianza_click_${currentUser.id}_${alianza.id}`;
      const clicks = JSON.parse(localStorage.getItem(key) || '[]');
      clicks.push({ timestamp: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(clicks));
      console.log(`📊 Tracking: ${currentUser.name} visitó ${alianza.nombre}`);
    }
    
    if (alianza.url) {
      window.open(alianza.url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6161FF] to-[#00CA72] pt-12 pb-8 px-4">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Volver</span>
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl">
              <Gift size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Club de Bienestar</h1>
            <p className="text-white/80 text-sm mt-1">Alianzas y beneficios exclusivos para miembros</p>
          </div>
        </div>
      </div>

      {/* Lista de Alianzas */}
      <div className="max-w-md mx-auto px-4 -mt-4">
        <div className="space-y-4">
          {ALIANZAS_BENEFICIOS.map((alianza) => (
            <div 
              key={alianza.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden border border-[#E4E7EF] ${alianza.proximamente ? 'opacity-70' : ''}`}
            >
              {/* Header de la tarjeta */}
              <div className={`bg-gradient-to-r ${alianza.color} p-4 flex items-center gap-4`}>
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl backdrop-blur-xl">
                  {alianza.logo}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-lg">{alianza.nombre}</h3>
                    {alianza.destacado && (
                      <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] text-white font-bold">⭐ DESTACADO</span>
                    )}
                  </div>
                  <p className="text-white/80 text-xs">{alianza.tipo}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-white text-[#181B34] rounded-full text-sm font-bold">
                    {alianza.descuento}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4">
                <p className="text-[#434343] text-sm mb-4">{alianza.descripcion}</p>
                
                {alianza.proximamente ? (
                  <div className="text-center py-2">
                    <span className="text-[#7C8193] text-sm">🔜 Próximamente</span>
                  </div>
                ) : alianza.url ? (
                  <button
                    onClick={() => handleLinkClick(alianza)}
                    className={`w-full py-3 rounded-xl bg-gradient-to-r ${alianza.color} text-white font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2`}
                  >
                    <Globe size={16} />
                    Visitar sitio web
                  </button>
                ) : alianza.contacto ? (
                  <a
                    href={`https://wa.me/${alianza.contacto.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Soy miembro de Tribu Impulsa y me interesa el beneficio de ${alianza.nombre}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    💬 Contactar por WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-8 p-4 bg-white/50 rounded-xl text-center">
          <p className="text-[#7C8193] text-xs">
            🤝 ¿Tienes un negocio y quieres ser aliado de Tribu Impulsa?
          </p>
          <a 
            href="https://wa.me/56951776005?text=Hola!%20Quiero%20ser%20aliado%20del%20Club%20de%20Bienestar%20de%20Tribu%20Impulsa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6161FF] text-xs font-semibold hover:underline"
          >
            Escríbenos para unirte →
          </a>
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
      setError('Credenciales inválidas');
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
  
  // Distribución por rubro
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
              <label className="block text-sm text-[#434343] mb-1 font-medium">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF]"
                placeholder="••••••••"
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
            ← Volver a la app
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
            { id: 'memberships', label: 'Membresías', icon: Crown },
            { id: 'compliance', label: 'Cumplimiento', icon: TrendingUp },
            { id: 'shares', label: 'Registros Share', icon: Share2 },
            { id: 'users', label: 'Usuarios', icon: Users },
            { id: 'reports', label: 'Reportes', icon: AlertTriangle },
            { id: 'settings', label: 'Config', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === item.id 
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
            <LogOut size={16} /> Cerrar Sesión
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
                { label: 'Reportes Pendientes', value: realReports.filter((r: Report | {status?: string}) => !r.status || r.status === 'pending').length, color: 'bg-[#FFCC00]' },
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
            
            {/* Distribución de cumplimiento */}
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
                    { label: 'Crítico (<30%)', value: complianceStats.critical, color: 'bg-[#FB275D]', textColor: 'text-[#FB275D]' },
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
              
              {/* Distribución por rubro */}
              <div className="bg-white rounded-xl p-5 border border-[#E4E7EF] shadow-sm">
                <h3 className="text-[#181B34] font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-[#A78BFA]" /> Distribución por Rubro
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
            
            {/* Acciones rápidas */}
            <div className="bg-white rounded-xl p-5 border border-[#E4E7EF] shadow-sm">
              <h3 className="text-[#181B34] font-semibold mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="bg-[#6161FF]/10 text-[#6161FF] p-3 rounded-lg hover:bg-[#6161FF]/20 text-sm font-medium transition">
                  Regenerar Tómbola
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
                    alert(`✅ Recordatorio enviado a ${count} usuarios activos`);
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
                <FolderSync size={20} className="text-[#6161FF]" /> Sincronización con Google Drive
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
                Abrir Google Drive →
              </a>
            </div>
          </div>
        )}
        
        {/* TAB DE MEMBRESÍAS */}
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
                      alert('⚠️ Ningún usuario tiene notificaciones push activas');
                      return;
                    }
                    const sent = sendPushToAll('📢 Recordatorio de Tribu', '¡No olvides completar tus 10+10 esta semana!');
                    alert(`✅ Push enviado a ${sent} usuarios`);
                  }}
                  className="bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white px-4 py-2 rounded-lg hover:opacity-90 text-sm font-medium transition flex items-center gap-2"
                >
                  <Zap size={16} /> Push Masivo ({countUsersWithPush()})
                </button>
                <button 
                  onClick={() => {
                    const count = sendBulkReminder('mid_month');
                    alert(`✅ Recordatorio in-app enviado a ${count} usuarios`);
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
                <p className="text-xs text-[#FB275D] font-medium mb-1">CRÍTICO</p>
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
                    <th className="text-right text-[#7C8193] text-sm font-medium px-4 py-3">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EF]">
                  {complianceData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[#7C8193]">
                        No hay datos de cumplimiento aún
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
                                className={`h-full rounded-full ${
                                  c.status === 'excellent' ? 'bg-[#00CA72]' :
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
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            c.status === 'excellent' ? 'bg-[#00CA72]/10 text-[#00CA72]' :
                            c.status === 'good' ? 'bg-[#6161FF]/10 text-[#6161FF]' :
                            c.status === 'warning' ? 'bg-[#FFCC00]/10 text-[#9D6B00]' :
                            'bg-[#FB275D]/10 text-[#FB275D]'
                          }`}>
                            {c.status === 'excellent' ? '⭐ Excelente' :
                             c.status === 'good' ? '👍 Bueno' :
                             c.status === 'warning' ? '⚠️ Advertencia' : '🚨 Crítico'}
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
              Aquí puedes ver todos los enlaces registrados por los usuarios cuando reportan haber compartido contenido o haberlo recibido.
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
                        No hay registros de compartidos aún. Los usuarios pueden registrar sus shares desde el checklist.
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
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                record.type === 'shared_to' 
                                  ? 'bg-[#6161FF]/10 text-[#6161FF]' 
                                  : 'bg-[#00CA72]/10 text-[#00CA72]'
                              }`}>
                                {record.type === 'shared_to' ? '📤 Compartió' : '📥 Recibió'}
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
              <h1 className="text-2xl font-bold text-[#181B34]">Gestión de Usuarios</h1>
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
                        No hay usuarios registrados aún
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
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.status === 'pending' ? 'bg-[#FFCC00]/10 text-[#9D6B00]' : 
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
                  {realReports.filter((r: Report | {status?: string}) => !r.status || r.status === 'pending').length} pendientes
                </span>
                <span className="px-3 py-1 rounded-full bg-[#A78BFA]/10 text-[#7C3AED]">
                  {realReports.filter((r: Report | {status?: string}) => r.status === 'in_review').length} en revisión
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              {realReports.length === 0 ? (
                <div className="bg-white rounded-xl p-8 border border-[#E4E7EF] shadow-sm text-center">
                  <CheckCircle size={48} className="mx-auto text-[#00CA72] mb-4" />
                  <p className="text-[#181B34] font-medium">¡Todo en orden!</p>
                  <p className="text-xs text-[#7C8193] mt-2">No hay reportes pendientes por revisar</p>
                </div>
              ) : (
                realReports.map((report: Report | {targetId?: string; targetUserId?: string; reason: string; timestamp?: string; createdAt?: string; status?: string; fromUserId?: string; id?: string; adminNotes?: string}, i: number) => {
                  const reportAny = report as {targetId?: string; targetUserId?: string; timestamp?: string; createdAt?: string; [key: string]: unknown};
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
                    pending: '⏳ Pendiente',
                    in_review: '🔍 En revisión',
                    resolved: '✅ Resuelto',
                    sanctioned: '🚫 Sancionado',
                    dismissed: '❌ Desestimado'
                  };
                  
                  return (
                    <div key={reportId} className={`bg-white rounded-xl p-5 border shadow-sm ${
                      status === 'pending' ? 'border-[#FFCC00]/30' : 
                      status === 'in_review' ? 'border-[#A78BFA]/30' : 'border-[#E4E7EF]'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[#181B34] font-semibold">
                            {fromUser?.companyName || 'Usuario'} → {targetUser?.name || targetUser?.companyName || 'Usuario'}
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
                                  showToast('📋 Reporte en revisión');
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
                              const notes = prompt('Notas de resolución (opcional):');
                              if (report.id) {
                                updateReportStatus(report.id, 'resolved', notes || null);
                                showToast('✅ Reporte marcado como resuelto');
                                refreshData();
                              }
                            }}
                            className="flex-1 bg-[#00CA72] text-white py-2 rounded-lg hover:bg-[#00B366] text-sm font-medium transition"
                          >
                            ✓ Resolver
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('¿Sancionar a este usuario? Se suspenderá su cuenta.')) {
                                const notes = prompt('Motivo de la sanción:');
                                if (report.id) {
                                  updateReportStatus(report.id, 'sanctioned', notes || null);
                                  showToast('🚫 Usuario sancionado y cuenta suspendida');
                                  refreshData();
                                }
                              }
                            }}
                            className="flex-1 bg-[#FB275D] text-white py-2 rounded-lg hover:bg-[#E01F50] text-sm font-medium transition"
                          >
                            🚫 Sancionar
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
          ⚠️ Recuerda completar tus datos
        </p>
        <p className="text-xs text-[#7C8193] mt-0.5">
          Faltan: {validation.missingFields.slice(0, 2).join(', ')}{validation.missingFields.length > 2 ? ` y ${validation.missingFields.length - 2} más` : ''}
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

// Componente de ruta protegida para miembros - SIN bloqueo por perfil incompleto
const MemberRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [isMember, setIsMember] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) {
        navigate('/');
        return;
      }
      
      // Ya NO bloqueamos por perfil incompleto - solo mostramos banner
      // El banner ProfileReminderBanner se muestra en el Dashboard
      
      // Verificar membresía
      const status = localStorage.getItem(`membership_status_${currentUser.id}`);
      if (status === 'miembro' || status === 'admin') {
        setIsMember(true);
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
            if (data.status === 'miembro' || data.status === 'admin') {
              localStorage.setItem(`membership_status_${currentUser.id}`, data.status);
              setIsMember(true);
              return;
            }
          }
        }
      } catch (err) {
        console.log('Error verificando membresía:', err);
      }
      
      // No es miembro, redirigir a membership
      setIsMember(false);
      navigate('/membership');
    };
    
    checkAccess();
  }, [currentUser, navigate]);
  
  if (isMember === null) {
    return <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#6161FF] border-t-transparent rounded-full animate-spin" />
    </div>;
  }
  
  return isMember ? <>{children}</> : null;
};

// ============================================
// PANTALLA DE COMPLETAR PERFIL OBLIGATORIO
// ============================================
const CompleteProfileScreen = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [validation, setValidation] = useState<ProfileValidation>({ isComplete: false, missingFields: [], completionPercent: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    companyName: currentUser?.companyName || '',
    category: currentUser?.category || '',
    affinity: currentUser?.affinity || '',
    scope: currentUser?.scope || '',
    phone: currentUser?.phone || currentUser?.whatsapp || '',
    comuna: currentUser?.comuna || '',
    selectedRegions: currentUser?.selectedRegions || [] as string[],
    revenue: currentUser?.revenue || ''
  });
  const [selectedRegionForComuna, setSelectedRegionForComuna] = useState('');

  useEffect(() => {
    if (currentUser && !isSaved && !isLoading) {
      const newValidation = validateUserProfile(currentUser);
      // Solo actualizar si cambió el estado de completado
      if (newValidation.isComplete !== validation.isComplete) {
        setValidation(newValidation);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, isSaved, isLoading]);

  // Si el perfil ya está completo Y no estamos en proceso de guardado, redirigir al dashboard
  useEffect(() => {
    if (validation.isComplete && !isSaved && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [validation.isComplete, navigate, isSaved, isLoading]);

  const comunasDeRegion = selectedRegionForComuna
    ? REGIONS.find(r => r.id === selectedRegionForComuna)?.comunas || []
    : [];

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    console.log('🔄 handleSave llamado');
    setSaveError(null);
    
    if (!currentUser) {
      console.error('❌ No hay usuario actual');
      setSaveError('Error: No hay sesión activa. Por favor recarga la página.');
      return;
    }
    
    // Validar campos antes de guardar
    if (!formData.name?.trim()) {
      setSaveError('Por favor ingresa tu nombre');
      return;
    }
    if (!formData.companyName?.trim()) {
      setSaveError('Por favor ingresa el nombre de tu emprendimiento');
      return;
    }
    if (!formData.phone?.trim()) {
      setSaveError('Por favor ingresa tu teléfono');
      return;
    }
    if (!formData.category) {
      setSaveError('Por favor selecciona tu giro/rubro');
      return;
    }
    if (!formData.affinity) {
      setSaveError('Por favor selecciona una afinidad');
      return;
    }
    if (!formData.revenue) {
      setSaveError('Por favor selecciona tu rango de facturación');
      return;
    }
    if (!formData.scope) {
      setSaveError('Por favor selecciona tu alcance geográfico');
      return;
    }
    if (formData.scope === 'LOCAL' && !formData.comuna) {
      setSaveError('Por favor selecciona tu comuna');
      return;
    }
    if (formData.scope === 'REGIONAL' && formData.selectedRegions.length === 0) {
      setSaveError('Por favor selecciona al menos una región');
      return;
    }
    
    setIsLoading(true);
    console.log('📝 Guardando datos:', formData);

    try {
      const updatedUser = {
        ...currentUser,
        name: formData.name.trim(),
        companyName: formData.companyName.trim(),
        category: formData.category,
        affinity: formData.affinity,
        scope: formData.scope as 'LOCAL' | 'REGIONAL' | 'NACIONAL',
        phone: formData.phone.trim(),
        whatsapp: formData.phone.trim(),
        comuna: formData.scope === 'LOCAL' ? formData.comuna : null,
        selectedRegions: formData.scope === 'REGIONAL' ? formData.selectedRegions : [],
        revenue: formData.revenue
      };

      // Actualizar en localStorage
      const result = updateUser(currentUser.id, updatedUser);
      console.log('💾 Usuario actualizado:', result);
      
      if (!result) {
        setSaveError('Error al guardar. Por favor intenta de nuevo.');
        setIsLoading(false);
        return;
      }
      
      setCurrentUser(currentUser.id);

      // Sincronizar con Firebase
      try {
        const { getFirestoreInstance } = await import('./services/firebaseService');
        const { doc, setDoc } = await import('firebase/firestore');
        const db = getFirestoreInstance();
        if (db) {
          await setDoc(doc(db, 'users', currentUser.id), updatedUser, { merge: true });
          console.log('✅ Perfil sincronizado con Firebase');
        }
      } catch (err) {
        console.log('⚠️ Error sincronizando:', err);
      }

      // Guardado exitoso - mostrar estado guardado y countdown
      console.log('🎉 Perfil guardado exitosamente');
      setIsLoading(false);
      setIsSaved(true);
      
      // Iniciar countdown 3...2...1...
      setCountdown(3);
      setTimeout(() => setCountdown(2), 1000);
      setTimeout(() => setCountdown(1), 2000);
      setTimeout(() => {
        console.log('🚀 Navegando a búsqueda de tribu');
        window.location.href = '/#/searching';
      }, 3000);
      return;
      
    } catch (err) {
      console.error('Error guardando perfil:', err);
      setSaveError('Error inesperado. Por favor intenta de nuevo.');
      setIsLoading(false);
    }
  };

  const handleRegionToggle = (regionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRegions: prev.selectedRegions.includes(regionId)
        ? prev.selectedRegions.filter(r => r !== regionId)
        : [...prev.selectedRegions, regionId]
    }));
  };

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6161FF] via-[#7B61FF] to-[#9D61FF] flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-6 px-6 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xl">
          <AlertTriangle size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">¡Completa tu perfil!</h1>
        <p className="text-white/80 text-sm">
          Para poder conectarte con tu Tribu, necesitamos algunos datos obligatorios
        </p>
        
        {/* Barra de progreso */}
        <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-[#00CA72] transition-all duration-500"
            style={{ width: `${validation.completionPercent}%` }}
          />
        </div>
        <p className="text-white/60 text-xs mt-2">{validation.completionPercent}% completado</p>
      </div>

      {/* Formulario */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 py-8 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-5">
          
          {/* Campos faltantes destacados */}
          {validation.missingFields.length > 0 && (
            <div className="bg-[#FFF3E6] border border-[#FF9500] rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-[#FF6B00] mb-2">📝 Te faltan estos datos:</p>
              <ul className="text-xs text-[#FF6B00]/80 space-y-1">
                {validation.missingFields.map((field, i) => (
                  <li key={i}>• {field}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-[#181B34] mb-2">
              Tu nombre <span className="text-[#FB275D]">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6161FF]"
              placeholder="Ej: María González"
            />
          </div>

          {/* Nombre emprendimiento */}
          <div>
            <label className="block text-sm font-semibold text-[#181B34] mb-2">
              Nombre de tu emprendimiento <span className="text-[#FB275D]">*</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6161FF]"
              placeholder="Ej: Dulces María"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-semibold text-[#181B34] mb-2">
              Teléfono / WhatsApp <span className="text-[#FB275D]">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6161FF]"
              placeholder="+56 9 1234 5678"
            />
          </div>

          {/* Categoría/Giro */}
          <div>
            <label className="block text-sm font-semibold text-[#181B34] mb-2">
              Giro / Rubro <span className="text-[#FB275D]">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6161FF]"
            >
              <option value="">Selecciona tu rubro</option>
              {[...TRIBE_CATEGORY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Afinidad */}
          <div>
            <label className="block text-sm font-semibold text-[#181B34] mb-2">
              Afinidad / Intereses <span className="text-[#FB275D]">*</span>
            </label>
            <select
              value={formData.affinity}
              onChange={(e) => setFormData(prev => ({ ...prev, affinity: e.target.value }))}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6161FF]"
            >
              <option value="">¿Con qué tipo de negocios quieres conectar?</option>
              {[...SURVEY_AFFINITY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map(aff => (
                <option key={aff} value={aff}>{aff}</option>
              ))}
            </select>
          </div>

          {/* Facturación Mensual */}
          <div>
            <label className="block text-sm font-semibold text-[#181B34] mb-2">
              Facturación mensual aproximada <span className="text-[#FB275D]">*</span>
            </label>
            <select
              value={formData.revenue}
              onChange={(e) => setFormData(prev => ({ ...prev, revenue: e.target.value }))}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6161FF]"
            >
              <option value="">Selecciona un rango</option>
              {SURVEY_REVENUE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Alcance */}
          <div>
            <label className="block text-sm font-semibold text-[#181B34] mb-2">
              Alcance geográfico <span className="text-[#FB275D]">*</span>
            </label>
            <select
              value={formData.scope}
              onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6161FF]"
            >
              <option value="">¿Dónde operas?</option>
              {SURVEY_SCOPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Comuna - solo si LOCAL */}
          {formData.scope === 'LOCAL' && (
            <div>
              <label className="block text-sm font-semibold text-[#181B34] mb-2">
                Tu comuna <span className="text-[#FB275D]">*</span>
              </label>
              <select
                value={selectedRegionForComuna}
                onChange={(e) => setSelectedRegionForComuna(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6161FF] mb-2"
              >
                <option value="">Primero selecciona tu región</option>
                {REGIONS.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {selectedRegionForComuna && (
                <select
                  value={formData.comuna}
                  onChange={(e) => setFormData(prev => ({ ...prev, comuna: e.target.value }))}
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6161FF]"
                >
                  <option value="">Selecciona tu comuna</option>
                  {comunasDeRegion.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Regiones - solo si REGIONAL */}
          {formData.scope === 'REGIONAL' && (
            <div>
              <label className="block text-sm font-semibold text-[#181B34] mb-2">
                Regiones donde operas <span className="text-[#FB275D]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-[#F5F7FB] rounded-xl p-3">
                {REGIONS.map(r => (
                  <label key={r.id} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.selectedRegions.includes(r.id)}
                      onChange={() => handleRegionToggle(r.id)}
                      className="rounded border-[#E4E7EF]"
                    />
                    <span className="truncate">{r.name}</span>
                  </label>
                ))}
              </div>
              {formData.selectedRegions.length > 0 && (
                <p className="text-xs text-[#00CA72] mt-2">
                  ✓ {formData.selectedRegions.length} región(es) seleccionada(s)
                </p>
              )}
            </div>
          )}

          {/* Mensaje de error */}
          {saveError && (
            <div className="bg-[#FFE6E6] border border-[#FB275D] rounded-xl p-4 mt-4">
              <p className="text-sm text-[#FB275D] font-medium">⚠️ {saveError}</p>
            </div>
          )}

          {/* Botón guardar */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isSaved}
            className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition mt-6 ${
              isSaved 
                ? 'bg-gradient-to-r from-[#00CA72] to-[#00B865] text-white' 
                : 'bg-gradient-to-r from-[#6161FF] to-[#7B61FF] text-white hover:shadow-xl disabled:opacity-50'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </span>
            ) : isSaved ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={20} />
                {countdown !== null ? `¡Guardado! Redirigiendo en ${countdown}...` : '¡Guardado!'}
              </span>
            ) : (
              '✓ Guardar y continuar'
            )}
          </button>

          <p className="text-center text-xs text-[#7C8193] mt-4">
            Estos datos son necesarios para el algoritmo de matching y para que tu Tribu pueda contactarte
          </p>

          {/* Botón para ir al perfil sin completar */}
          <button
            type="button"
            onClick={() => window.location.href = '/#/my-profile'}
            className="w-full py-3 rounded-xl font-medium text-sm text-[#7C8193] hover:text-[#6161FF] hover:bg-[#F5F7FB] transition mt-2"
          >
            Ir a mi perfil para editar después →
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Layout with Navigation
const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  // Verificar membresía para mostrar candados en navegación
  const [isMember, setIsMember] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      const status = localStorage.getItem(`membership_status_${currentUser.id}`);
      setIsMember(status === 'miembro' || status === 'admin');
    }
  }, [currentUser, location.pathname]);
  
  // Hide nav on login, register, survey, admin, membership and complete-profile pages
  const hiddenNavRoutes = ['/', '/register', '/survey', '/admin', '/membership', '/searching', '/complete-profile'];
  const showNav = !hiddenNavRoutes.includes(location.pathname) && !location.pathname.startsWith('/admin');
  const isDashboard = location.pathname.includes('/dashboard');
  const isActivity = location.pathname.includes('/activity');
  const isProfile = location.pathname.includes('/my-profile');
  const isTribe = location.pathname.includes('/tribe');
  const isDirectory = location.pathname.includes('/directory');

  // Función para navegar con verificación de membresía
  const navigateWithCheck = (path: string, requiresMembership: boolean) => {
    if (requiresMembership && !isMember) {
      navigate('/membership');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen w-full text-[#181B34] font-sans bg-[#F5F7FB]">
        <div>
            <Routes>
                <Route path="/" element={<LoginScreen />} />
                <Route path="/register" element={<RegisterScreen />} />
                <Route path="/searching" element={<SearchingScreen />} />
                <Route path="/survey" element={<SurveyScreen />} />
                <Route path="/membership" element={<MembershipScreen />} />
                <Route path="/complete-profile" element={<CompleteProfileScreen />} />
                {/* Rutas PROTEGIDAS - solo para MIEMBROS (requiere perfil completo) */}
                <Route path="/dashboard" element={<MemberRoute><Dashboard /></MemberRoute>} />
                <Route path="/tribe" element={<MemberRoute><TribeAssignmentsView /></MemberRoute>} />
                <Route path="/directory" element={<MemberRoute><DirectoryView /></MemberRoute>} />
                <Route path="/profile/:id" element={<MemberRoute><ProfileDetail /></MemberRoute>} />
                {/* Rutas LIBRES - para todos */}
                <Route path="/activity" element={<ActivityView />} />
                <Route path="/my-profile" element={<MyProfileView />} />
                <Route path="/admin" element={<AdminPanelInline />} />
                <Route path="/academia" element={<AcademiaViewWrapper />} />
                <Route path="/beneficios" element={<ClubBienestarView />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>

        {showNav && (
          <nav 
            className="fixed bottom-0 left-0 right-0 w-full backdrop-blur-xl bg-white/80 border-t border-white/30" 
            style={{ 
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              height: 'calc(70px + env(safe-area-inset-bottom, 0px))',
              zIndex: 9999,
              boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.8)'
            }}
          >
            <div className="h-[70px] px-2 flex justify-around items-center max-w-md mx-auto">
              {/* Inicio - BLOQUEADO para invitados */}
              <button 
                onClick={() => navigateWithCheck('/dashboard', true)}
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors relative ${
                  isDashboard ? 'text-[#6161FF]' : 
                  !isMember ? 'text-[#B3B8C6]' : 'text-[#7C8193] hover:text-[#181B34]'
                }`}
              >
                <Home size={22} strokeWidth={isDashboard ? 2.5 : 1.8} />
                <span className="text-[10px] mt-1 font-medium">Inicio</span>
                {!isMember && <Lock size={10} className="absolute top-1 right-1 text-[#FB275D]" />}
              </button>
              
              {/* Checklist / Mi Tribu - BLOQUEADO para invitados */}
              <button 
                onClick={() => navigateWithCheck('/tribe', true)}
                className="flex flex-col items-center justify-center -mt-4 relative"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-lg ${
                  !isMember ? 'bg-[#7C8193]/60' : 'bg-[#E91E63]/90'
                }`}
                  style={{
                    boxShadow: !isMember 
                      ? '0 4px 16px rgba(124, 129, 147, 0.2)'
                      : '0 8px 32px rgba(233, 30, 99, 0.35), inset 0 1px 1px rgba(255,255,255,0.3)'
                  }}
                >
                  {!isMember ? <Lock size={24} className="text-white" /> : <CheckCircle size={26} className="text-white" strokeWidth={2} />}
                </div>
                <span className={`text-[10px] mt-1 font-semibold ${
                  !isMember ? 'text-[#7C8193]' : 'text-[#E91E63]'
                }`}>Mi Tribu</span>
              </button>

              {/* Configuración/Perfil - LIBRE para todos */}
              <button 
                onClick={() => navigate('/my-profile')}
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors ${isProfile ? 'text-[#6161FF]' : 'text-[#7C8193] hover:text-[#181B34]'}`}
              >
                <Settings size={22} strokeWidth={isProfile ? 2.5 : 1.8} />
                <span className="text-[10px] mt-1 font-medium">Configuración</span>
              </button>
            </div>
          </nav>
        )}
        
        {showNav && <WhatsAppFloat />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default App;
