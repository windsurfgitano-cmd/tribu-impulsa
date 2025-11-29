
import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Activity, Users, Settings, LogOut, User as UserIcon, CheckCircle, ArrowRight, Briefcase, Sparkles, MapPin, Globe, Instagram, Calendar, ArrowLeft, Bell, Edit2, Save, X, Share2, Download, FolderSync, TrendingUp, AlertTriangle, Clock, Send, HelpCircle, ChevronRight, BarChart3, RefreshCw, Zap } from 'lucide-react';
import { GlassCard } from './components/GlassCard';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { AFFINITY_OPTIONS, CATEGORY_MAPPING, MatchProfile, TribeAssignments } from './types';
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
  Report
} from './services/databaseService';
import { loadRealUsers, validateCredentials, getUserByEmail, changeUserPassword, markFirstLoginComplete, UNIVERSAL_PASSWORD, forceReloadRealUsers } from './services/realUsersData';
import { ensureTribeAssignments, getUserTribeWithProfiles } from './services/tribeAlgorithm';
import { enableAutoBackup, downloadBackup, checkDataIntegrity } from './services/dataPersistence';
import { initializeFirebase, requestNotificationPermission, onForegroundMessage, getNotificationStatus, sendLocalNotification, saveUserFCMToken, sendPushToAll, countUsersWithPush } from './services/firebaseService';
import { ensureInitialized } from './services/productionInit';

// ============================================
// INICIALIZACIÓN DE PRODUCCIÓN
// ============================================

// Inicializar Firebase y Firestore automáticamente
initializeFirebase();

// Inicializar producción (crea usuarios y config en Firestore si no existen)
ensureInitialized().then(() => {
  console.log('✅ Producción inicializada');
}).catch(console.error);

// Cargar usuarios REALES al iniciar (fallback local)
forceReloadRealUsers();

// Generar asignaciones de tribu si es necesario
ensureTribeAssignments();

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

console.log('🚀 Tribu Impulsa v2.0 - 23 Emprendedores Reales');
console.log('📊 Integridad de datos:', checkDataIntegrity());
console.log('🔔 Estado notificaciones:', getNotificationStatus());

const SURVEY_CATEGORY_OPTIONS = [
  "Moda Mujer Ropa  Jeans",
  "Moda Mujer Ropa  Ropa de mujer",
  "Moda Mujer Ropa  Vestidos de fiesta",
  "Moda Mujer Ropa  Todo ropa mujer",
  "Moda Mujer Ropa  bikinis",
  "Moda Mujer Ropa  Ropa deportiva",
  "Moda Mujer Accesorios Joyas / bijouterie",
  "Moda Mujer Accesorios Relojes",
  "Moda Mujer Accesorios Pañuelos",
  "Moda Mujer Accesorios Cinturones",
  "Moda Mujer Accesorios Todo Accesorios",
  "Moda Mujer Zapatos y Carteras Zapatos",
  "Moda Mujer Zapatos y Carteras Zapatillas",
  "Moda Mujer Zapatos y Carteras Carteras",
  "Moda Mujer Zapatos y Carteras Zapatos y Carteras",
  "Moda Mujer Cosmética y perfumería Cosmeticos y skincare",
  "Moda Cosmética y perfumería Perfumes",
  "Moda Anteojos moda Anteojos moda",
  "Moda Hombre Ropa  Todo ropa hombre",
  "Moda Hombre Accesorios Todo accesorio hombres",
  "Moda Hombre Zapatos y zapatillas Todo zapatos y zapatillas hombre",
  "Negocio Artículos de hogar y decoración Menaje",
  "Negocio Artículos de hogar y decoración Ropa de cama",
  "Negocio Artículos de hogar y decoración Decoración y diseño",
  "Negocio Artículos de hogar y decoración Cocina",
  "Negocio Artículos de hogar y decoración Todo artículos de hogar y decoración",
  "Negocio Artículos deportivos Artículos de deporte",
  "Negocio Artículos ópticos Lentes ópticos",
  "Negocio",
  "Negocio Artículos de packaging Cajas, bolsas y packaging",
  "Negocio Insumos oficinas (facility) toallas de papel, papel higiéncio, limpieza, vasos",
  "Negocio Imprentas o artículos publicitarios Impresión y branding",
  "Negocio Tecnología y electrónicos Arregla celulares",
  "Negocio Tecnología y electrónicos Accesorios celulares",
  "Negocio Tecnología y electrónicos Venta de electrodomésticos",
  "Negocio Librería, papelería  Articulos de librería",
  "Negocio Librería Libros",
  "Negocio Mueblería Muebles",
  "Negocio Supermercado o minimarket Supermercado o minimarket",
  "Negocio Comercio internacional (importación/exportación)",
  "Alimentos y Gastronomía Restaurante o café",
  "Alimentos y Gastronomía Alimentos saludables Comida y Snacks saludables",
  "Alimentos y Gastronomía Delivery comida preparada Comida preparada a domicilio",
  "Alimentos y Gastronomía Pastelería o repostería Tortas y repostería",
  "Alimentos y Gastronomía Panadería artesanal Panadería",
  "Alimentos y Gastronomía Catering y banquetería Catering y banquetería",
  "Alimentos y Gastronomía Productos gourmet  Productos gourmet",
  "Alimentos y Gastronomía Productos congelados Mariscos",
  "Alimentos y Gastronomía Productos congelados Productos congelados",
  "Alimentos y Gastronomía Productos congelados y gourmet Todo productos gourmet y congelados",
  "Alimentos y Gastronomía Verdulería y frutería Frutas y verduras",
  "Alimentos y Gastronomía Bebidas y jugos artesanales",
  "Alimentos y Gastronomía Alimentos fermentados Alimentos fermentados",
  "Alimentos y Gastronomía Conservas  Alimentos en conserva",
  "Belleza, Estética y Bienestar Peluquería y barbería Peluquería y barbería",
  "Belleza, Estética y Bienestar Cejas / pestañas Cejas y pestañas",
  "Belleza, Estética y Bienestar Manicure/pedicure Manicure y pedicure",
  "Belleza, Estética y Bienestar Centro depilación con cera Depilación con cera",
  "Todo Belleza Todo belleza",
  "Belleza, Estética y Bienestar Centros de estética o depilación laser Centro de estética",
  "Belleza, Estética y Bienestar Centros de estética o depilación laser Depilación láser",
  "Belleza, Estética y Bienestar Maasoterapia y masajes reductivos Maasoterapia y masajes reductivos",
  "Belleza, Estética y Bienestar Servicios de maquillaje Maquilladores",
  "Belleza, Estética y Bienestar Terapias alternativas (reiki, flores de Bach, etc.) Terapias alternativas (reiki, flores de Bach, etc.)",
  "Belleza, Estética y Bienestar Nutrición y suplementación",
  "Belleza, Estética y Bienestar Entrenamiento personal o fitness Perosonal Trainners",
  "Servicios Profesionales Abogados Abogados",
  "Servicios Profesionales Contadores y auditores Contadores y auditores",
  "Servicios Profesionales Arquitectos Arquitectura",
  "Servicios Profesionales Psicólogos  Psicología adulto",
  "Servicios Profesionales Psicólogos  Psicología infantil",
  "Servicios Profesionales Psicólogos  Todo psicología",
  "Servicios Profesionales Coaches Coaching",
  "Servicios Profesionales Traductores Traductores idiomas",
  "Servicios Profesionales Dentistas Servicios dentales",
  "Servicios Profesionales Estéticos y Dentistas Servicios estéticos",
  "Servicios Profesionales Kinesiologos Kinesología",
  "Servicios Profesionales Seguros Corredores de seguros",
  "Servicios Profesionales Corredores de propiedades  Corredores de propiedades",
  "Educación y Capacitación Clases particulares o reforzamiento escolar Clases particulares o reforzamiento escolar",
  "Educación y Capacitación Cursos de idiomas Cursos de idiomas",
  "Educación y Capacitación Talleres de arte, música o manualidades Clases de arte",
  "Educación y Capacitación Talleres de arte, música o manualidades Clases de música",
  "Educación y Capacitación Coaching y mentoring",
  "Educación y Capacitación Educación financiera o empresarial",
  "Educación y Capacitación Plataforma educativa online",
  "Educación y Capacitación Servicios de tutoría o preparación PSU",
  "Arte, Diseño y Creatividad Fotografía y video",
  "Arte, Diseño y Creatividad Diseño gráfico y branding",
  "Arte, Diseño y Creatividad Producción audiovisual",
  "Arte, Diseño y Creatividad Ilustración y arte digital",
  "Arte, Diseño y Creatividad Pintura, cerámica, escultura",
  "Arte, Diseño y Creatividad Servicios de impresión",
  "Arte, Diseño y Creatividad Marketing digital o community management",
  "Construcción y Mantención",
  "Construcción y Mantención Construcción y remodelación",
  "Construcción y Mantención Paisajismo y jardinería Paisajista",
  "Construcción y Mantención Construcción Piscinas Construcción de piscinas",
  "Construcción y Mantención Instalación de paneles solares Paneles solares",
  "Construcción y Mantención Fumigación Fumigadores",
  "Tecnología y Desarrollo Soluciones tecnológicas Desarrollo de softwares y soluciones tecnólogicas",
  "Tecnología y Desarrollo",
  "Tecnología y Desarrollo Servicios de hosting o dominio Hosting y dominios web",
  "Tecnología y Desarrollo Soporte técnico",
  "Tecnología y Desarrollo Automatización o robótica",
  "Tecnología y Desarrollo E-commerce (tiendas online)",
  "Tecnología y Desarrollo Ciberseguridad y análisis de datos",
  "Turismo  Agencias de viaje Agencia y agente de viajes",
  "Turismo  Guías turísticos Guías",
  "Turismo  Hoteles, hostales, cabañas Hotelería",
  "Eventos Arriendo de espacios para eventos Centro de Eventos",
  "Eventos Organización de matrimonios o celebraciones Producción de matrimonios",
  "Eventos Producción de eventos y ferias Producción para ferias y eventos",
  "Eventos Producción de eventos Todo Producción",
  "Eventos Djs Djs",
  "Eventos Food truck Carros de comida",
  "Eventos Organización de cumpleaños Fiesta de cumpleaños",
  "Eventos Globos Armado de globos",
  "Transporte y Logística Transporte de pasajeros Transporte de pasajeros",
  "Transporte y Logística Transporte de pasajeros Furgon escolar",
  "Transporte y Logística Transporte de carga Mudanzas",
  "Transporte y Logística Transporte y delivery Delivery para emprendedores",
  "Transporte y Logística Arriendo de vehículos",
  "Transporte y Logística Servicios de logística y almacenamiento",
  "Transporte y Logística Mudanzas y fletes Mudanzas y Fletes",
  "Mascotas y Animales Peluquería canina o felina Peluquería mascotas",
  "Mascotas y Animales Alimentos para mascotas Alimento para mascotas",
  "Mascotas y Animales Accesorios para mascotas Accesorios para mascotas",
  "Alimentos y Accesorios para mascotas Todo Alimento y accesorios para mascotas",
  "Mascotas y Animales Paseo y entrenamiento de perros",
  "Mascotas y Animales Veterinaria y servicios médicos Veterinaria",
  "Mascotas y Animales Crematorio de mascotas Cremación de mascotas",
  "Mascotas y Animales Guarderías o hoteles para mascotas Hoteles de mascotas",
  "Industria y Manufactura",
  "Industria y Manufactura Elaboración de jabones artesanales Jabones artesanales",
  "Industria y Manufactura Elaboración de productos de limpieza Productos de limpieza hogar",
  "Industria y Manufactura Producción de envases  Envases",
  "Oficio Carpintería Carpintero",
  "Oficio Mantención de piscinas Piscinero",
  "Oficio Jardin Jardinero",
  "Oficio Electricidad Electricista",
  "Oficio Aseo y mantención Limpieza de casas",
  "Oficio Taller mecánico Mecánico",
  "Oficio Servicios de asistencia Servicio de grúa",
  "Oficio Servicios de asistencia Vulcanización",
  "Oficio Servicios de asistencia Todo asistencia",
  "Oficio Arreglo zapatos y maletas Zapatero",
  "Oficio Modista Arreglo de ropa",
  "Otro"
];

const SURVEY_AFFINITY_OPTIONS = [
  "Bienestar y Salud  Bienestar emocional / espiritualidad / terapias alternativas",
  "Bienestar y Salud  Nutrición / alimentación saludable",
  "Bienestar y Salud  Fitness /wellness / suplementos alimenticios",
  "Bienestar y Salud  Aire libre / naturaleza",
  "Bienestar y Salud  Medicina preventiva / longevidad / medicina estética",
  "Diseño y Estilo Diseño / arte / decoración",
  "Diseño y Estilo Fotografía / cine / teatro",
  "Diseño y Estilo Moda",
  "Diseño y Estilo Lujo",
  "Digital y Tecnología Negocios digitales",
  "Digital y Tecnología Marketing digital / RRSS/ contenido",
  "Sustentabilidad Proyectos sustentables / economía circular",
  "Conciencia y Propósito Diversidad / inclusión",
  "Estilo de Vida y Experiencias Viajes",
  "Estilo de Vida y Experiencias Gastronomía",
  "Estilo de Vida y Experiencias Cultura",
  "Estilo de Vida y Experiencias Mascotas / pet friendly",
  "Educación y Desarrollo Formación / cursos / educación",
  "Educación y Desarrollo Coaching / mentorías",
  "Economía y Negocios Finanzas /"
];

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
  localStorage.setItem(TRIBE_SYNC_KEY, new Date().toLocaleString('es-CL'));
};

const getTribeSyncedAt = (): string => {
  if (typeof window === 'undefined') return new Date().toLocaleString('es-CL');
  return localStorage.getItem(TRIBE_SYNC_KEY) ?? new Date().toLocaleString('es-CL');
};

const getStoredTribeAssignments = (category: string): TribeAssignments => {
  if (typeof window === 'undefined') {
    return generateTribeAssignments(category);
  }

  const raw = localStorage.getItem(TRIBE_ASSIGNMENTS_KEY);
  if (!raw) {
    const generated = generateTribeAssignments(category);
    localStorage.setItem(TRIBE_ASSIGNMENTS_KEY, JSON.stringify(generated));
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
    const fallback = generateTribeAssignments(category);
    localStorage.setItem(TRIBE_ASSIGNMENTS_KEY, JSON.stringify(fallback));
    stampTribeSync();
    return fallback;
  }
};

const persistTribeAssignments = (data: TribeAssignments) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRIBE_ASSIGNMENTS_KEY, JSON.stringify(data));
};

const getStoredChecklistState = (assignments: TribeAssignments): AssignmentChecklist => {
  if (typeof window === 'undefined') {
    return buildChecklistFromAssignments(assignments);
  }

  const raw = localStorage.getItem(TRIBE_CHECKLIST_KEY);
  if (!raw) {
    const initial = buildChecklistFromAssignments(assignments);
    localStorage.setItem(TRIBE_CHECKLIST_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = buildChecklistFromAssignments(assignments, parsed);
    localStorage.setItem(TRIBE_CHECKLIST_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    console.warn('Error reading checklist', error);
    const fallback = buildChecklistFromAssignments(assignments);
    localStorage.setItem(TRIBE_CHECKLIST_KEY, JSON.stringify(fallback));
    return fallback;
  }
};

const persistChecklistState = (data: AssignmentChecklist) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRIBE_CHECKLIST_KEY, JSON.stringify(data));
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
  return (localStorage.getItem(TRIBE_STATUS_KEY) as TribeStatus) ?? 'PENDIENTE';
};

const persistTribeStatus = (status: TribeStatus) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRIBE_STATUS_KEY, status);
};

const resetTribeStorage = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TRIBE_ASSIGNMENTS_KEY);
  localStorage.removeItem(TRIBE_CHECKLIST_KEY);
  localStorage.removeItem(TRIBE_STATUS_KEY);
  localStorage.removeItem(TRIBE_REPORTS_KEY);
};

const getStoredReports = (): TribeReport[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(TRIBE_REPORTS_KEY);
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
  localStorage.setItem(TRIBE_REPORTS_KEY, JSON.stringify(next));
};

const getTribeStatsSnapshot = (userCategory: string) => {
  const assignments = getStoredTribeAssignments(userCategory);
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

// 1. Login / Landing with User + Pass
const LoginScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check existing session
  useEffect(() => {
    const session = getStoredSession();
    if (session?.isLoggedIn) {
      if (hasCompletedSurvey()) navigate('/dashboard');
      else navigate('/survey');
    }
  }, [navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    
    // Autenticación REAL con contraseña universal TRIBU2026
    setTimeout(() => {
      const user = validateCredentials(email, password);
      
      if (user) {
        // Usuario encontrado y autenticado
        const session: UserSession = {
          email: user.email,
          name: user.name,
          isLoggedIn: true
        };
        setStoredSession(session);
        setCurrentUser(user.id);
        
        // Marcar survey como completado para usuarios reales (ya tienen todos sus datos)
        const surveyData = {
          email: user.email,
          name: user.name,
          phone: user.phone || '',
          instagram: user.instagram || '',
          city: user.city || '',
          category: user.category || '',
          affinity: user.affinityChoices?.[0] || user.category || '',
          scope: 'NACIONAL'
        };
        localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(surveyData));
        
        // Guardar flag de primer login para mostrar modal después
        if ((user as { firstLogin?: boolean }).firstLogin) {
          localStorage.setItem('show_password_change', 'true');
        }
        
        // Usuario real pasa por animación del algoritmo (rápida si ya lo vio)
        navigate('/searching');
      } else {
        // Verificar si el email existe
        const existingUser = getUserByEmail(email);
        if (existingUser) {
          setError('Contraseña incorrecta. Usa: TRIBU2026');
        } else {
          // Usuario NO existe - mostrar error y ofrecer registro
          setError('Usuario no encontrado. ¿Quieres registrarte?');
        }
      }
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative bg-[#F5F7FB]">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#6161FF]/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#00CA72]/10 blur-[100px]" />
        <div className="absolute top-[30%] left-[20%] w-[200px] h-[200px] rounded-full bg-[#FFCC00]/10 blur-[60px]" />
      </div>

      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-[#E4E7EF]">
        <div className="mb-6 flex justify-center">
          <img 
            src="/tribulogo.png" 
            alt="Tribu Impulsa" 
            className="w-24 h-24 object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-[#181B34]">Tribu Impulsa</h1>
        <p className="text-[#7C8193] mb-8 text-sm">
          Conecta, colabora y crece con el <span className="text-[#6161FF] font-semibold">Algoritmo Tribal</span>.
        </p>
        
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3.5 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3.5 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
              placeholder="••••••••"
            />
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
        </form>

        <div className="mt-6 pt-4 border-t border-[#E4E7EF]">
          <button 
            onClick={() => navigate('/register')}
            className="text-[#7C8193] hover:text-[#6161FF] text-sm transition-colors"
          >
            ¿No tienes cuenta? <span className="font-semibold">Regístrate</span>
          </button>
        </div>
        
        {/* Acceso rápido para usuarios registrados */}
        <div className="mt-4 p-3 bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-xl border border-[#E4E7EF]">
          <p className="text-[10px] text-[#6161FF] uppercase tracking-wide mb-2 font-bold">🔐 Contraseña universal: TRIBU2026</p>
          <div className="space-y-1 text-xs text-left">
            <button 
              onClick={() => { setEmail('dafnafinkelstein@gmail.com'); setPassword('TRIBU2026'); }}
              className="block w-full text-left px-2 py-1.5 hover:bg-white rounded text-[#181B34] hover:text-[#6161FF] transition"
            >
              👉 Dafna Finkelstein - <span className="text-[#7C8193]">By Turquía (Joyería)</span>
            </button>
            <button 
              onClick={() => { setEmail('doraluz@terraflorpaisajismo.cl'); setPassword('TRIBU2026'); }}
              className="block w-full text-left px-2 py-1.5 hover:bg-white rounded text-[#181B34] hover:text-[#6161FF] transition"
            >
              👉 Doraluz Galleguillos - <span className="text-[#7C8193]">Terraflor (Paisajismo)</span>
            </button>
            <button 
              onClick={() => { setEmail('guille@elevatecreativo.com'); setPassword('TRIBU2026'); }}
              className="block w-full text-left px-2 py-1.5 hover:bg-white rounded text-[#181B34] hover:text-[#6161FF] transition"
            >
              👉 Guillermo García - <span className="text-[#7C8193]">Elevate (Marketing)</span>
            </button>
          </div>
        </div>
        
        <p className="mt-4 text-[10px] text-[#00CA72] uppercase tracking-widest font-semibold">✓ 23 Emprendedores Verificados</p>
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
    // Paso 2: Emprendimiento
    companyName: '',
    city: '',
    sector: '',
    // Paso 3: Giro/Rubro
    category: '',
    // Paso 4: Afinidad
    affinity: '',
    scope: 'NACIONAL' as 'LOCAL' | 'REGIONAL' | 'NACIONAL',
    // Paso 5: Redes
    instagram: '',
    facebook: '',
    tiktok: '',
    website: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 5;

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Requerido';
      if (!formData.email.trim()) newErrors.email = 'Requerido';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
      if (!formData.phone.trim()) newErrors.phone = 'Requerido';
    } else if (step === 2) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Requerido';
      if (!formData.city.trim()) newErrors.city = 'Requerido';
    } else if (step === 3) {
      if (!formData.category) newErrors.category = 'Selecciona un giro';
    } else if (step === 4) {
      if (!formData.affinity) newErrors.affinity = 'Selecciona una afinidad';
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
      // Guardar en databaseService (DB real)
      const newUser = createUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        city: formData.city,
        sector: formData.sector || undefined,
        instagram: formData.instagram,
        facebook: formData.facebook || undefined,
        tiktok: formData.tiktok || undefined,
        website: formData.website || undefined,
        category: formData.category,
        affinity: formData.affinity,
        scope: formData.scope
      });
      
      // También guardar en formato antiguo para compatibilidad
      const surveyData = {
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
              <img src="/tribulogo.png" alt="Tribu Impulsa" className="w-16 h-16 mx-auto mb-3 object-contain" />
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
              <div className="animate-fadeIn">
                <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Comuna/Sector</label>
                <input 
                  type="text" 
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                  placeholder="Ej. Providencia"
                  value={formData.sector}
                  onChange={(e) => setFormData({...formData, sector: e.target.value})}
                />
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
                  {SURVEY_CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
                  {SURVEY_AFFINITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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

// 2b. Pantalla de Búsqueda "Algoritmo Tribal X"
const SearchingScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Iniciando Algoritmo Tribal X...');
  
  // Detectar si es primera vez o login posterior
  const isFirstTime = !localStorage.getItem('algorithm_seen');
  const totalDuration = isFirstTime ? 10000 : 3000; // 10s primera vez, 3s después
  
  const messagesFirst = [
    'Iniciando Algoritmo Tribal X...',
    'Conectando con la red de emprendedores...',
    'Analizando tu perfil de negocio...',
    'Escaneando el ecosistema emprendedor...',
    'Identificando afinidades potenciales...',
    'Evaluando compatibilidad empresarial...',
    'Calculando sinergias estratégicas...',
    'Generando matches personalizados...',
    'Optimizando tu tribu 10+10...',
    'Preparando recomendaciones...',
    '¡Tu tribu está lista! 🎉'
  ];
  
  const messagesQuick = [
    'Actualizando tu tribu...',
    'Sincronizando datos...',
    'Verificando conexiones...',
    '¡Listo! 🎉'
  ];
  
  const messages = isFirstTime ? messagesFirst : messagesQuick;
  const intervalTime = totalDuration / 50; // 50 pasos para llegar a 100%

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 2;
        const messageIndex = Math.floor((next / 100) * (messages.length - 1));
        setMessage(messages[Math.min(messageIndex, messages.length - 1)]);
        
        if (next >= 100) {
          clearInterval(interval);
          // Marcar que ya vio el algoritmo
          localStorage.setItem('algorithm_seen', 'true');
          setTimeout(() => navigate('/dashboard'), 500);
        }
        return Math.min(next, 100);
      });
    }, intervalTime);
    
    return () => clearInterval(interval);
  }, [navigate, intervalTime, messages]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#181B34] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6161FF]/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00CA72]/20 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="relative z-10 text-center max-w-md">
        {/* Logo animado */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-full animate-spin" style={{animationDuration: '3s'}}></div>
            <div className="absolute inset-2 bg-[#181B34] rounded-full flex items-center justify-center">
              <Sparkles className="text-white" size={48} />
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Algoritmo Tribal X</h1>
        <p className="text-[#7C8193] mb-8">{message}</p>
        
        {/* Progress bar */}
        <div className="w-full bg-[#2D3154] rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-full transition-all duration-300 ease-out"
            style={{width: `${progress}%`}}
          ></div>
        </div>
        <p className="text-[#6161FF] font-mono text-lg">{progress}%</p>
        
        {/* Floating particles effect */}
        <div className="mt-12 flex justify-center gap-4">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="w-3 h-3 bg-[#00CA72] rounded-full animate-bounce"
              style={{animationDelay: `${i * 0.2}s`}}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. Survey Form (Required)
const SurveyScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SurveyFormState>(() => getStoredSurveyResponse() ?? EMPTY_SURVEY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiredFields: (keyof SurveyFormState)[] = ['email', 'name', 'phone', 'city', 'category', 'affinity', 'scope'];

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
            <img src="/tribulogo.png" alt="Tribu Impulsa" className="w-20 h-20 mx-auto mb-4 object-contain" />
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
                    {SURVEY_CATEGORY_OPTIONS.map(opt => (
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
                    {SURVEY_AFFINITY_OPTIONS.map(opt => (
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
                <label className="text-sm font-semibold text-[#434343]">Sector (si es local)</label>
                <input
                  className="w-full mt-2 rounded-xl bg-[#F5F7FB] border border-[#E4E7EF] p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                  placeholder="Ej. Providencia"
                  value={formData.sector}
                  onChange={(e) => handleChange('sector', e.target.value)}
                />
                <p className="text-xs text-[#7C8193] mt-1">Solo completa si marcaste alcance LOCAL.</p>
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

// 4. Tribe Assignments View
const TribeAssignmentsView = () => {
  useSurveyGuard();
  const navigate = useNavigate();
  const myProfile = useMemo(() => getMyProfile(), []);
  const [assignments, setAssignments] = useState<TribeAssignments>(() => getStoredTribeAssignments(myProfile.category));
  const [checklist, setChecklist] = useState<AssignmentChecklist>(() => getStoredChecklistState(assignments));
  const [status, setStatus] = useState<TribeStatus>(() => getStoredTribeStatus());
  const [lastSynced, setLastSynced] = useState<string>(() => new Date().toLocaleString('es-CL'));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reports, setReports] = useState<TribeReport[]>(() => getStoredReports());
  const [reportingProfile, setReportingProfile] = useState<MatchProfile | null>(null);
  const [reportNote, setReportNote] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    persistTribeAssignments(assignments);
  }, [assignments]);

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

  const statusThemes: Record<TribeStatus, string> = {
    'PENDIENTE': 'bg-[#FFF8E6] text-[#9D6B00] border-[#FFCC00]',
    'EN PROCESO': 'bg-[#E6F7FF] text-[#0066B3] border-[#6161FF]',
    'COMPLETADO': 'bg-[#E6FFF3] text-[#008A4E] border-[#00CA72]'
  };

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
      return next;
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      resetTribeStorage();
      const nextAssignments = getStoredTribeAssignments(myProfile.category);
      const nextChecklist = getStoredChecklistState(nextAssignments);
      setAssignments(nextAssignments);
      setChecklist(nextChecklist);
      setStatus('PENDIENTE');
      setLastSynced(new Date().toLocaleString('es-CL'));
      setIsRefreshing(false);
    }, 600);
  };

  const renderList = (title: string, subtitle: string, list: MatchProfile[], key: keyof AssignmentChecklist) => (
    <div key={title} className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-[#E4E7EF]">
      <header className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[#6161FF] mb-1 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-[#181B34] flex items-center gap-2">
          <Share2 size={18} className="text-[#00CA72]" /> {list.length} cuentas
        </h3>
        <p className="text-[#7C8193] text-sm">{subtitle}</p>
      </header>
      <div className="space-y-3">
        {list.map(profile => (
          <div key={profile.id} className="flex items-start gap-3 p-4 rounded-xl bg-[#F5F7FB] border border-[#E4E7EF] hover:border-[#6161FF]/40 transition">
            <input
              type="checkbox"
              className="mt-1 accent-[#00CA72] w-5 h-5"
              checked={checklist[key][profile.id] ?? false}
              onChange={() => handleToggle(key, profile.id)}
            />
            <button
              type="button"
              onClick={() => navigate(`/profile/${profile.id}`)}
              className="flex-1 text-left"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[#181B34]">{profile.companyName}</p>
                <span className="text-xs text-[#7C8193] bg-[#E4E7EF] px-2 py-0.5 rounded-full">{profile.category}</span>
              </div>
              <p className="text-sm text-[#434343]">{profile.name} · {profile.subCategory}</p>
              <p className="text-xs text-[#7C8193]">{profile.location}</p>
              <span className="text-[10px] text-[#6161FF] font-medium">Ver perfil y compartir →</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setReportingProfile(profile);
                setReportNote('');
              }}
              className="text-[10px] px-3 py-1.5 rounded-full border border-[#FB275D]/40 text-[#FB275D] hover:bg-[#FB275D]/10 transition"
            >
              Reportar
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pb-32 animate-fadeIn min-h-screen bg-[#F5F7FB]">
      <header className="px-6 py-6 sticky top-0 z-30 backdrop-blur-xl bg-white/90 border-b border-[#E4E7EF] flex flex-col gap-2 md:flex-row md:items-center md:justify-between shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#6161FF] font-medium">Mi red tribal</p>
          <h1 className="text-3xl font-bold text-[#181B34]">Checklist de Reciprocidad</h1>
          <p className="text-[#7C8193] text-sm">Última sincronización: {lastSynced}</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusThemes[status]}`}>{status}</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TribeStatus)}
            className="bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl px-3 py-2 text-sm text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
          >
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN PROCESO">En proceso</option>
            <option value="COMPLETADO">Completado</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-white border border-[#E4E7EF] text-[#434343] px-4 py-2 rounded-xl hover:border-[#6161FF] hover:text-[#6161FF] transition disabled:opacity-40 shadow-sm"
          >
            <Share2 size={16} /> {isRefreshing ? 'Generando...' : 'Regenerar tribu'}
          </button>
        </div>
      </header>

      <section className="px-6 py-6 space-y-6">
        <div className="bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/80 font-medium">Avance mensual</p>
              <h2 className="text-5xl font-bold">{completion}%</h2>
              <p className="text-white/80 text-sm">{Object.values(checklist.toShare).filter(Boolean).length} de {assignments.toShare.length} acciones realizadas</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 rounded-xl bg-white text-[#6161FF] font-semibold hover:bg-white/90 transition shadow-md"
              >
                Ver recomendaciones
              </button>
              <button
                onClick={() => window.open('https://wa.me/56912345678', '_blank')}
                className="px-5 py-2.5 rounded-xl border-2 border-white/30 text-white hover:bg-white/10 transition font-medium"
              >
                Soporte WhatsApp
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderList('Cuentas que debo impulsar', 'Publica su contenido y etiquétalas antes del día 20.', assignments.toShare, 'toShare')}
          {renderList('Cuentas que me comparten', 'Coordinación para que me etiqueten y reportar si no cumplen.', assignments.shareWithMe, 'shareWithMe')}
        </div>
        {reports.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E4E7EF]">
            <h3 className="text-sm font-semibold text-[#434343] mb-3 tracking-wide uppercase">Reportes enviados</h3>
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
                    href={`https://wa.me/56912345678?text=${encodeURIComponent(`🚨 REPORTE TRIBU IMPULSA\n\nEmprendimiento: ${report.targetName || 'N/A'}\nResponsable: ${report.targetOwner || 'N/A'}\nMotivo: ${report.reason}\nFecha: ${report.timestamp}`)}`}
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
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Manejar upload de foto
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      try {
        setSaveMessage('📷 Procesando imagen...');
        const compressed = await compressImage(file, 400);
        setProfile({...profile, avatarUrl: compressed});
        setSaveMessage('✅ Foto lista para guardar');
        setTimeout(() => setSaveMessage(null), 2000);
      } catch {
        setSaveMessage('❌ Error al procesar imagen');
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

    const handleSave = () => {
        if (!currentUser) return;
        setIsSaving(true);
        
        // Guardar cambios en la base de datos
        const updated = updateUser(currentUser.id, {
            name: profile.name,
            companyName: profile.companyName,
            bio: profile.bio,
            instagram: profile.instagram,
            website: profile.website,
            city: profile.location?.split(',')[0]?.trim() || '',
            avatarUrl: profile.avatarUrl,
        });
        
        if (updated) {
            setSaveMessage('✅ Perfil actualizado');
            setTimeout(() => setSaveMessage(null), 3000);
        } else {
            setSaveMessage('❌ Error al guardar');
            setTimeout(() => setSaveMessage(null), 3000);
        }
        
        setIsSaving(false);
        setIsEditing(false);
    };

    return (
        <div className="pb-32 animate-fadeIn min-h-screen bg-[#F5F7FB]">
            {/* Header with Cover */}
            <div className="h-72 w-full relative">
                <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#F5F7FB]"></div>
                
                {/* Top Navigation Actions */}
                <div className="absolute top-6 left-6 z-30 flex items-center gap-4 w-full pr-12">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[#181B34] hover:bg-white transition-colors border border-[#E4E7EF] flex items-center gap-2 shadow-md"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm font-medium">Volver</span>
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
                          accept="image/*"
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
                        
                        {/* Categoría */}
                        <div className="flex justify-center gap-2 mt-4 flex-wrap">
                            <span className="text-xs font-semibold bg-[#6161FF]/10 border border-[#6161FF]/30 text-[#6161FF] px-4 py-1.5 rounded-full">
                                {profile.category}
                            </span>
                        </div>
                        
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

        {/* Redes sociales editables */}
        {isEditing && (
          <div className="w-full mb-6 space-y-3">
            <div>
              <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Instagram</label>
              <input 
                value={profile.instagram}
                onChange={(e) => setProfile({...profile, instagram: e.target.value})}
                placeholder="@tu_instagram"
                className="w-full bg-[#F5F7FB] text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Sitio Web</label>
              <input 
                value={profile.website}
                onChange={(e) => setProfile({...profile, website: e.target.value})}
                placeholder="www.tusitio.cl"
                className="w-full bg-[#F5F7FB] text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Ubicación</label>
              <input 
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
                placeholder="Santiago, Chile"
                className="w-full bg-[#F5F7FB] text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
              />
            </div>
          </div>
        )}

        {!isEditing && profile && (
          <div className="flex flex-wrap gap-3 w-full mb-6">
            <a
              href={`https://www.instagram.com/${profile.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5F7FB] border border-[#E4E7EF] text-[#434343] hover:border-[#6161FF] hover:text-[#6161FF] transition"
            >
              <Instagram size={16} /> Compartir en Instagram
            </a>
            <a
              href={`https://wa.me/56912345678?text=${encodeURIComponent(`Conoce a ${profile.companyName} (${profile.category}). Mira su perfil en Tribu Impulsa.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00CA72] text-white font-semibold hover:bg-[#00B366] transition shadow-md"
            >
              <Share2 size={16} /> Enviar por WhatsApp
            </a>
          </div>
        )}

        {/* Details */}
        <div className="space-y-8 w-full text-left">
                        <div>
                            <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">Biografía</h3>
                            {isEditing ? (
                                <textarea 
                                    value={profile.bio}
                                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                    rows={4}
                                    className="w-full bg-[#F5F7FB] text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF] focus:ring-2 focus:ring-[#6161FF]/20"
                                />
                            ) : (
                                <p className="text-[#434343] leading-relaxed text-lg">
                                    {profile.bio}
                                </p>
                            )}
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
                            <div className="bg-[#00CA72]/10 p-2 rounded-lg text-[#00CA72]"><Globe size={20} /></div>
                            <div className="text-sm">
                                <span className="block text-[#7C8193] text-[10px] mb-0.5 uppercase tracking-wide">Web</span>
                                <span className="font-medium text-[#181B34] truncate w-20">{profile.website}</span>
                            </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">Etiquetas</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.tags.map(tag => (
                                <span key={tag} className="text-sm bg-[#F5F7FB] border border-[#E4E7EF] px-4 py-2 rounded-lg text-[#434343] hover:border-[#6161FF] hover:text-[#6161FF] transition-colors flex items-center gap-2">
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
                        
                        {/* Botón de Notificaciones Push */}
                        <NotificationButton />
                        
                        <div className="pt-6 border-t border-[#E4E7EF]">
                            <button 
                                onClick={() => {
                                  // Limpiar toda la sesión
                                  clearStoredSession();
                                  localStorage.removeItem('tribu_session');
                                  localStorage.removeItem('algorithm_seen');
                                  navigate('/');
                                }} 
                                className="w-full py-3 rounded-xl border border-[#FB275D]/30 text-[#FB275D] hover:bg-[#FB275D]/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                            >
                                <LogOut size={16} /> Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente para activar notificaciones push
const NotificationButton = () => {
  const [status, setStatus] = useState(getNotificationStatus());
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = getCurrentUser();

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    const token = await requestNotificationPermission();
    if (token) {
      // Guardar token asociado al usuario para poder enviarle push después
      if (currentUser) {
        saveUserFCMToken(currentUser.id, token);
      }
      sendLocalNotification('¡Notificaciones activadas!', 'Recibirás alertas de tu tribu');
    }
    setStatus(getNotificationStatus());
    setIsLoading(false);
  };

  if (!status.supported) {
    return (
      <div className="p-4 bg-[#F5F7FB] rounded-xl border border-[#E4E7EF] text-center">
        <p className="text-sm text-[#7C8193]">Tu navegador no soporta notificaciones</p>
      </div>
    );
  }

  if (status.permission === 'granted' && status.hasToken) {
    return (
      <div className="p-4 bg-[#E6FFF3] rounded-xl border border-[#00CA72]/30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#00CA72] flex items-center justify-center text-white">
          <Bell size={20} />
        </div>
        <div>
          <p className="font-semibold text-[#008A4E] text-sm">Notificaciones activas</p>
          <p className="text-xs text-[#00CA72]">Recibirás alertas de tu tribu</p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnableNotifications}
      disabled={isLoading}
      className="w-full p-4 bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-xl text-white flex items-center justify-center gap-3 hover:opacity-90 transition disabled:opacity-50"
    >
      <Bell size={20} />
      <span className="font-semibold">
        {isLoading ? 'Activando...' : 'Activar Notificaciones Push'}
      </span>
    </button>
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

const MatchAnalysisSection = ({ profileId, profileData }: { profileId: string; profileData: MatchProfile }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const myProfile = getMyProfile();
  
  // Verificar si ya existe análisis guardado al montar
  useEffect(() => {
    const stored = getStoredAnalysis(profileId);
    if (stored) {
      setAnalysis(stored.analysis);
      setHasGenerated(true);
    }
  }, [profileId]);
  
  // Fallback sin LLM - genera análisis inteligente basado en datos
  const generateFallbackAnalysis = (me: MatchProfile, target: MatchProfile) => {
    const parts = [];
    
    // Complementariedad de rubros
    if (me.category !== target.category) {
      parts.push(`${target.companyName} está en ${target.category} mientras tú estás en ${me.category}, lo que significa que no compiten directamente y pueden referirse clientes mutuamente.`);
    } else {
      parts.push(`Ambos están en ${me.category}, lo que permite colaboraciones estratégicas dentro del mismo sector.`);
    }
    
    // Ubicación
    if (me.location && target.location) {
      if (me.location === target.location) {
        parts.push(`Al estar ambos en ${me.location}, pueden organizar eventos conjuntos o colaborar presencialmente.`);
      }
    }
    
    // Audiencia complementaria
    parts.push(`Los seguidores de ${target.companyName} podrían estar interesados en tus productos/servicios de ${me.companyName}, creando oportunidades de cross-promotion efectiva.`);
    
    return parts.join(' ');
  };

  // Función para generar análisis
  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    
    try {
      // Intentar usar Azure OpenAI
      const { analyzeCompatibility } = await import('./services/aiMatchingService');
      const userProfile = {
        id: myProfile.id,
        name: myProfile.name,
        email: '',
        phone: '',
        companyName: myProfile.companyName,
        city: myProfile.location || '',
        category: myProfile.category,
        affinity: myProfile.category,
        instagram: myProfile.instagram || '',
        status: 'active' as const,
        createdAt: new Date().toISOString()
      };
      const targetUserProfile = {
        id: profileData.id,
        name: profileData.name,
        email: '',
        phone: '',
        companyName: profileData.companyName,
        city: profileData.location || '',
        category: profileData.category,
        affinity: profileData.category,
        instagram: profileData.instagram || '',
        status: 'active' as const,
        createdAt: new Date().toISOString()
      };
      
      const result = await analyzeCompatibility(userProfile, targetUserProfile);
      
      if (result && result.analysis) {
        setAnalysis(result.analysis);
        saveAnalysis(profileId, result.analysis);
      } else {
        throw new Error('No result from LLM');
      }
    } catch (err) {
      // Usar fallback inteligente
      console.log('Usando análisis local (LLM no disponible)');
      const fallbackAnalysis = generateFallbackAnalysis(myProfile, profileData);
      setAnalysis(fallbackAnalysis);
      saveAnalysis(profileId, fallbackAnalysis);
    } finally {
      setIsLoading(false);
      setHasGenerated(true);
    }
  };
  
  // Estado de carga
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-2xl p-5 border border-[#6161FF]/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <span className="text-sm font-semibold text-[#6161FF]">Tribu X está pensando...</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-[#E4E7EF] rounded animate-pulse w-full"></div>
          <div className="h-3 bg-[#E4E7EF] rounded animate-pulse w-4/5"></div>
          <div className="h-3 bg-[#E4E7EF] rounded animate-pulse w-3/5"></div>
        </div>
      </div>
    );
  }
  
  // Ya tiene análisis guardado
  if (analysis) {
    return (
      <div className="bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-2xl p-5 border border-[#6161FF]/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wide text-[#6161FF]">¿Por qué podrían hacer match?</span>
        </div>
        <p className="text-sm text-[#434343] leading-relaxed">{analysis}</p>
      </div>
    );
  }
  
  // Botón para generar análisis
  return (
    <div className="bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-2xl p-5 border border-[#6161FF]/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wide text-[#6161FF]">Análisis de compatibilidad</span>
      </div>
      <p className="text-sm text-[#7C8193] mb-4">Descubre por qué podrías hacer match con este emprendedor.</p>
      <button
        onClick={handleGenerateAnalysis}
        className="w-full py-3 bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
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
           
           {/* Avatar & Logo Composition - Standard Block */}
           <div className="relative -mt-20 mb-6 z-20">
              <div className="relative">
                <img 
                    src={profile.avatarUrl} 
                    alt={profile.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md">
                    <img 
                        src={profile.companyLogoUrl} 
                        alt="Logo"
                        className="w-10 h-10 rounded-full bg-white border border-[#E4E7EF]"
                    />
                </div>
             </div>
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
                  <a href="#" className="flex items-center gap-4 text-[#434343] hover:text-[#6161FF] transition-colors bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EF] group hover:border-[#6161FF]">
                    <Globe size={20} className="text-[#6161FF] group-hover:scale-110 transition-transform"/> 
                    <span className="font-medium text-sm">{profile.website}</span>
                  </a>
                  <a href="#" className="flex items-center gap-4 text-[#434343] hover:text-[#E91E63] transition-colors bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EF] group hover:border-[#E91E63]">
                    <Instagram size={20} className="text-[#E91E63] group-hover:scale-110 transition-transform"/> 
                    <span className="font-medium text-sm">{profile.instagram}</span>
                  </a>
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

const generateSampleActivities = (): ActivityItem[] => {
  const now = new Date();
  return [
    {
      id: '1',
      type: 'welcome',
      title: '¡Bienvenido/a a Tribu Impulsa!',
      description: 'Tu comunidad de emprendedores te espera. Revisa tu tribu 10+10 y comienza a compartir.',
      timestamp: 'Hoy',
      isRead: false,
      icon: '🎉',
      color: 'bg-[#00CA72]/10 text-[#00CA72]',
      actionUrl: '/tribe'
    },
    {
      id: '2',
      type: 'share_reminder',
      title: 'Evita que te reporten',
      description: 'Recuerda compartir contenido de tu tribu. Llevas 3/10 este mes.',
      timestamp: 'Hace 2h',
      isRead: false,
      icon: '📤',
      color: 'bg-[#FFCC00]/10 text-[#9D6B00]',
      actionUrl: '/tribe'
    },
    {
      id: '3',
      type: 'thanks_received',
      title: '¡Alguien te envió un Gracias!',
      description: 'María de Dulce Momento agradeció tu compartida.',
      timestamp: 'Hace 5h',
      isRead: true,
      icon: '💜',
      color: 'bg-[#6161FF]/10 text-[#6161FF]'
    },
    {
      id: '4',
      type: 'shared_you',
      title: 'Te compartieron en Instagram',
      description: 'Roberto de EcoPack compartió tu última publicación.',
      timestamp: 'Ayer',
      isRead: true,
      icon: '🔄',
      color: 'bg-[#00CA72]/10 text-[#00CA72]'
    },
    {
      id: '5',
      type: 'new_assignment',
      title: 'Nueva tribu de Noviembre',
      description: 'Tu tribu 10+10 ha sido actualizada. ¡Revisa tus nuevas asignaciones!',
      timestamp: 'Nov 1',
      isRead: true,
      icon: '🎯',
      color: 'bg-[#6161FF]/10 text-[#6161FF]',
      actionUrl: '/tribe'
    },
    {
      id: '6',
      type: 'tip',
      title: 'Consejo del día',
      description: 'Comparte historias, no solo posts. Las historias tienen más alcance.',
      timestamp: 'Nov 15',
      isRead: true,
      icon: '💡',
      color: 'bg-[#FFCC00]/10 text-[#9D6B00]'
    }
  ];
};

const ActivityView = () => {
  useSurveyGuard();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>(() => generateSampleActivities());
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const filteredActivities = filter === 'unread' 
    ? activities.filter(a => !a.isRead)
    : activities;
  
  const unreadCount = activities.filter(a => !a.isRead).length;
  
  const markAsRead = (id: string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };
  
  const markAllAsRead = () => {
    setActivities(prev => prev.map(a => ({ ...a, isRead: true })));
  };
  
  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="pb-32 animate-fadeIn min-h-screen bg-[#F5F7FB]">
      <header className="px-6 py-4 sticky top-0 z-30 backdrop-blur-xl bg-white/90 border-b border-[#E4E7EF] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold flex items-center gap-2 text-[#181B34]">
            <Bell className="text-[#6161FF]" /> Actividad
            {unreadCount > 0 && (
              <span className="bg-[#FB275D] text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-sm text-[#6161FF] hover:underline"
            >
              Marcar todo leído
            </button>
          )}
        </div>
        
        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'all' ? 'bg-[#6161FF] text-white' : 'bg-[#F5F7FB] text-[#7C8193]'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'unread' ? 'bg-[#6161FF] text-white' : 'bg-[#F5F7FB] text-[#7C8193]'
            }`}
          >
            Sin leer ({unreadCount})
          </button>
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
              className={`bg-white p-4 rounded-2xl flex gap-4 items-start group hover:shadow-md transition-all border ${
                item.isRead ? 'border-[#E4E7EF]' : 'border-[#6161FF]/30 bg-[#6161FF]/5'
              } ${item.actionUrl ? 'cursor-pointer' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                markAsRead(item.id);
                // Solo navegar si hay actionUrl definido
                if (item.actionUrl && item.actionUrl.trim() !== '') {
                  navigate(item.actionUrl);
                }
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
                {item.actionUrl && (
                  <span className="text-[10px] text-[#6161FF] mt-1 inline-block">Tocar para ir →</span>
                )}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteActivity(item.id); }}
                className="opacity-0 group-hover:opacity-100 text-[#7C8193] hover:text-[#FB275D] transition p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Tutorial Steps Component
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: '¡Bienvenido/a a Tribu Impulsa! 🎉',
    subtitle: 'Tu comunidad de emprendedores para crecer juntos',
    content: 'Tribu Impulsa te conecta con otros emprendedores para hacer cross-promotion: tú compartes su contenido y ellos comparten el tuyo. ¡Crecemos juntos!',
    icon: '👋',
    color: 'from-[#6161FF] to-[#00CA72]'
  },
  {
    id: 'tribe',
    title: 'Tu Tribu 10 + 10',
    subtitle: 'Cada mes recibirás nuevas asignaciones',
    content: '• 10 cuentas a las que TÚ compartes\n• 10 cuentas que te comparten A TI\n\nEl algoritmo te asigna matches complementarios, evitando competencia directa.',
    icon: '🤝',
    color: 'from-[#00CA72] to-[#4AE698]'
  },
  {
    id: 'checklist',
    title: 'Checklist de Reciprocidad',
    subtitle: 'Marca lo que vas completando',
    content: '1. Ve a "Mi Tribu" en el menú inferior\n2. Revisa tus 10+10 asignaciones\n3. Marca ✓ cuando compartas algo\n4. Si alguien no cumple, usa "Reportar"',
    icon: '✅',
    color: 'from-[#FFCC00] to-[#FFE066]'
  },
  {
    id: 'profile',
    title: 'Tu Perfil Profesional',
    subtitle: 'Preséntate ante la comunidad',
    content: 'Tu perfil muestra tu emprendimiento a otros miembros. Asegúrate de tener:\n• Foto de perfil\n• Instagram actualizado\n• Descripción atractiva',
    icon: '📱',
    color: 'from-[#A78BFA] to-[#C9A8FF]'
  }
];

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
          <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-4xl shadow-lg`}>
            {step.icon}
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
  const matches = generateMockMatches("Bienestar y Salud"); 
  // Use current user profile for icon
  const myProfile = getMyProfile();
  const tribeStats = getTribeStatsSnapshot(myProfile.category);
  
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
  
  const handlePasswordChange = (newPassword: string) => {
    if (currentUser) {
      changeUserPassword(currentUser.id, newPassword);
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
      
      {/* Header */}
      <header className="px-6 py-6 flex justify-between items-center bg-white/80 sticky top-0 z-30 backdrop-blur-md border-b border-[#E4E7EF]">
        <div>
          <h1 className="text-2xl font-bold text-[#181B34] tracking-tight">Hola, {myProfile.name.split(' ')[0]}</h1>
          <p className="text-[#7C8193] text-sm">Tus conexiones activas para hoy</p>
        </div>
        <div 
          onClick={() => navigate('/my-profile')}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6161FF] to-[#00CA72] p-[2px] cursor-pointer hover:scale-105 transition-transform shadow-lg"
        >
           <img 
            src={myProfile.avatarUrl} 
            alt="Me"
            className="w-full h-full rounded-full object-cover border-2 border-white"
           />
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 mb-8 mt-4">
        <div className="bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-2xl p-6 shadow-lg text-white">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/70 mb-1">Acciones completas</p>
              <p className="text-3xl font-bold">{tribeStats.completed}/{tribeStats.total}</p>
              <span className="text-xs text-white/70">Pendientes: {tribeStats.pending}</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/70 mb-1">Reportes enviados</p>
              <p className="text-3xl font-bold text-[#FFCC00]">{tribeStats.reports}</p>
              <span className="text-xs text-white/70">"Acusete" activos</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/70 mb-1">Match rate</p>
              <p className="text-3xl font-bold">85%</p>
              <span className="text-xs text-white/70">{matches.length} recomendaciones</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/70 mb-1">Última sincronización</p>
              <p className="text-sm font-semibold">{tribeStats.syncedAt}</p>
              <button
                onClick={() => navigate('/tribe')}
                className="mt-2 text-xs px-4 py-2 rounded-full bg-white text-[#6161FF] font-bold hover:shadow-lg transition"
              >
                Ir a Mi Tribu (10 + 10)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-[#181B34]">
          <Sparkles size={18} className="text-[#FFCC00]"/> 
          Tus Matches Recomendados
        </h2>
        
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-[#E4E7EF] hover:border-[#6161FF]/30">
              <div className="p-5">
                <div className="flex gap-4 mb-4">
                    {/* Avatar simple */}
                    <img 
                      src={match.targetProfile.avatarUrl} 
                      alt={match.targetProfile.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-lg leading-tight text-[#181B34] truncate pr-2">{match.targetProfile.companyName}</h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                                match.affinityScore > 90 ? 'bg-[#00CA72]/10 text-[#00CA72]' : 'bg-[#FFCC00]/10 text-[#9D6B00]'
                            }`}>
                            {match.affinityScore}%
                            </span>
                        </div>
                        <p className="text-sm text-[#7C8193] truncate mb-2">{match.targetProfile.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] bg-[#6161FF]/10 px-2 py-0.5 rounded text-[#6161FF] truncate max-w-[120px]">
                                {match.targetProfile.category}
                            </span>
                            <span className="text-[10px] bg-[#00CA72]/10 px-2 py-0.5 rounded text-[#00CA72] truncate max-w-[120px]">
                                {match.targetProfile.subCategory}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="pt-4 border-t border-[#E4E7EF] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#7C8193] text-xs">
                        <Briefcase size={14} />
                        <span className="italic">{match.reason}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/profile/${match.targetProfile.id}`)}
                      className="text-xs font-bold bg-[#6161FF] text-white px-4 py-2 rounded-lg hover:bg-[#5050DD] transition-colors shadow-md flex items-center gap-1"
                    >
                      Ver Perfil <ArrowRight size={12}/>
                    </button>
                </div>
              </div>
            </div>
          ))}
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
  
  // Reportes REALES (nuevo sistema mejorado + legacy)
  const legacyReports = JSON.parse(localStorage.getItem('tribeReportsLog') || '[]');
  const newReports = getAllReports();
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
            { id: 'compliance', label: 'Cumplimiento', icon: TrendingUp },
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
                    <div key={cat.category} className="flex items-center gap-2">
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
              <h1 className="text-2xl font-bold text-[#181B34]">Reportes "Acusete"</h1>
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
                                  window.location.reload();
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
                                updateReportStatus(report.id, 'resolved', notes || undefined);
                                alert('✅ Reporte marcado como resuelto');
                                window.location.reload();
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
                                  updateReportStatus(report.id, 'sanctioned', notes || undefined);
                                  alert('🚫 Usuario sancionado y cuenta suspendida');
                                  window.location.reload();
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
                                updateReportStatus(report.id, 'dismissed', notes || undefined);
                                alert('Reporte desestimado');
                                window.location.reload();
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
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#181B34]">Configuración</h1>
            <div className="bg-white rounded-xl p-6 border border-[#E4E7EF] shadow-sm space-y-4">
              <div>
                <label className="block text-sm text-[#434343] mb-1 font-medium">Precio mensual (CLP)</label>
                <input type="number" defaultValue={20000} className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30" />
              </div>
              <div>
                <label className="block text-sm text-[#434343] mb-1 font-medium">Matches por usuario</label>
                <input type="number" defaultValue={10} className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30" />
              </div>
              <div>
                <label className="block text-sm text-[#434343] mb-1 font-medium">WhatsApp soporte</label>
                <input type="text" defaultValue="+56912345678" className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30" />
              </div>
              <button className="bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white px-6 py-3 rounded-lg hover:opacity-90 font-semibold transition">
                Guardar Cambios
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Main Layout with Navigation
const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Hide nav on login, register, survey, and admin pages
  const hiddenNavRoutes = ['/', '/register', '/survey', '/admin'];
  const showNav = !hiddenNavRoutes.includes(location.pathname) && !location.pathname.startsWith('/admin');
  const isDashboard = location.pathname.includes('/dashboard');
  const isActivity = location.pathname.includes('/activity');
  const isProfile = location.pathname.includes('/my-profile');
  const isTribe = location.pathname.includes('/tribe');

  return (
    <div className="min-h-screen w-full text-[#434343] font-sans relative bg-[#F5F7FB]">
        {/* Ambient Background - Soft gradients */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-[#6161FF]/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[20%] w-[600px] h-[600px] bg-[#00CA72]/5 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="relative z-10">
            <Routes>
                <Route path="/" element={<LoginScreen />} />
                <Route path="/register" element={<RegisterScreen />} />
                <Route path="/searching" element={<SearchingScreen />} />
                <Route path="/survey" element={<SurveyScreen />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tribe" element={<TribeAssignmentsView />} />
                <Route path="/activity" element={<ActivityView />} />
                <Route path="/profile/:id" element={<ProfileDetail />} />
                <Route path="/my-profile" element={<MyProfileView />} />
                <Route path="/admin" element={<AdminPanelInline />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>

        {showNav && (
          <nav className="fixed bottom-0 left-0 w-full backdrop-blur-xl border-t border-[#A8E6CF]/50 py-2 px-6 flex justify-around items-end z-40 pb-safe h-[72px] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" style={{ backgroundColor: 'rgba(232, 245, 233, 0.95)' }}>
            
            {/* Dashboard Button */}
            <button 
              onClick={() => navigate('/dashboard')}
              className={`flex flex-col items-center transition-all duration-300 w-16 pb-1 ${isDashboard ? 'text-[#00CA72] scale-105' : 'text-[#5D6B74] hover:text-[#00CA72]'}`}
            >
              <Users size={22} strokeWidth={isDashboard ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium">Inicio</span>
            </button>
            
            {/* Center Action Button – Shortcut to 10+10 checklist */}
            <button 
              onClick={() => navigate('/tribe')}
              className={`flex flex-col items-center transition-all duration-300 w-16 pb-1`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${isTribe ? 'bg-gradient-to-br from-[#00CA72] to-[#4AE698]' : 'bg-gradient-to-br from-[#6161FF] to-[#00CA72]'}`}>
                <Share2 size={22} className="text-white" />
              </div>
              <span className={`text-[10px] mt-1 font-semibold ${isTribe ? 'text-[#00CA72]' : 'text-[#5D6B74]'}`}>Tribu</span>
            </button>

            {/* Activity Button */}
            <button 
              onClick={() => navigate('/activity')}
              className={`flex flex-col items-center transition-all duration-300 w-16 pb-1 ${isActivity ? 'text-[#00CA72] scale-105' : 'text-[#5D6B74] hover:text-[#00CA72]'}`}
            >
              <Bell size={22} strokeWidth={isActivity ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium">Actividad</span>
            </button>

            {/* Profile Button */}
            <button 
              onClick={() => navigate('/my-profile')}
              className={`flex flex-col items-center transition-all duration-300 w-16 pb-1 ${isProfile ? 'text-[#00CA72] scale-105' : 'text-[#5D6B74] hover:text-[#00CA72]'}`}
            >
              <Settings size={22} strokeWidth={isProfile ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium">Perfil</span>
            </button>
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
