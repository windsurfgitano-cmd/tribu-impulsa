import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, CheckCircle, Gift, User as UserIcon } from 'lucide-react';
import { 
  setCurrentUser, 
  syncNotificationsFromFirebase
} from '../../services/databaseService';
import {
  getUserByEmail,
  validateCredentials,
  getUserFromFirebaseByEmail
} from '../../services/realUsersData';
import { 
  getStoredSession, 
  setStoredSession, 
  AUTH_SESSION_KEY, 
  UserSession 
} from '../../utils/storage';
import { hasCompletedSurvey, SURVEY_STORAGE_KEY } from '../../services/surveyService';
import { fetchMembershipFromCloud, syncMembershipToLocalCache } from '../../services/membershipCache';
import { SearchableSelect } from '../../components/SearchableSelect';
import { CATEGORY_SELECT_OPTIONS, AFFINITY_SELECT_OPTIONS_WITH_GROUP } from '../../utils/selectOptions';
import { REGIONS } from '../../constants/geography';
import { SURVEY_AFFINITY_OPTIONS } from '../../constants';

// Funciones helper para autoformateo de campos
const autoFormatInstagram = (value: string): string => {
  const cleaned = value.trim();
  if (!cleaned) return '';
  return cleaned.startsWith('@') ? cleaned : `@${cleaned}`;
};

const autoFormatWebsite = (value: string): string => {
  const cleaned = value.trim();
  if (!cleaned) return '';
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) return cleaned;
  return `https://${cleaned}`;
};

const autoFormatPhone = (value: string): string => {
  const cleaned = value.replace(/\s/g, '').trim();
  if (!cleaned) return '';
  return cleaned.startsWith('+569') ? cleaned : `+569${cleaned}`;
};

const LoginScreen = () => {
  const navigate = useNavigate();
  // Estados del flujo - ahora incluye 'landing' como primera pantalla
  const [step, setStep] = useState<'landing' | 'email' | 'password' | 'register' | 'forgot'>('landing');
  const [userIntent, setUserIntent] = useState<'login' | 'register'>('register'); // Intención del usuario
  const [resetSent, setResetSent] = useState(false);
  const [resetClicks, setResetClicks] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  
  // Contador dinámico de perfiles desde Supabase
  const [profilesCount, setProfilesCount] = useState(0);
  
  useEffect(() => {
    let subscription: any;
    
    const setupListener = async () => {
      const { subscribeToSystemStats, getSystemStats } = await import('../../services/supabaseService');
      
      // Obtener valor inicial
      const stats = await getSystemStats();
      if (stats) {
        setProfilesCount(stats.profiles_completed || 0);
      }
      
      // Suscripción en tiempo real al contador
      subscription = subscribeToSystemStats((stats) => {
        setProfilesCount(stats.profiles_completed || 0);
      });
    };
    
    setupListener();
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Datos de registro (si es usuario nuevo) - TODOS los campos obligatorios
  const [registerData, setRegisterData] = useState({
    name: '',
    companyName: '',
    instagram: '',
    phone: '',
    category: [] as string[],  // Categorías múltiples
    subcategory: '',
    affinity: '',
    password: '',
    confirmPassword: '',
    // Campos adicionales obligatorios
    scope: '' as '' | 'NACIONAL' | 'REGIONAL' | 'LOCAL',
    city: '',
    comuna: '',
    selectedRegion: '', // Para LOCAL y REGIONAL
    selectedRegions: [] as string[],
    bio: '',
    businessDescription: '',
    revenue: '',
    termsAccepted: false,
    // RRSS opcionales
    website: '',
    linkedin: '',
    tiktok: ''
  });

  // Check existing session AND sync user data from Firebase if needed
  useEffect(() => {
    const syncAndNavigate = async () => {
      const session = getStoredSession();
      if (session?.isLoggedIn && session.email) {
        // Verificar si el usuario existe en localStorage
        let localUser = getUserByEmail(session.email);

        // Si no existe localmente, sincronizar desde Firebase
        if (!localUser) {
          console.log('🔄 Sesión activa pero usuario no en localStorage, sincronizando desde Firebase...');
          localUser = await getUserFromFirebaseByEmail(session.email);
          if (localUser) {
            console.log('✅ Usuario sincronizado desde Firebase:', localUser.name);
            setCurrentUser(localUser.id);
          } else {
            console.log('⚠️ Usuario no encontrado en Firebase, limpiando sesión');
            localStorage.removeItem(AUTH_SESSION_KEY);
            return; // No navegar, mostrar login
          }
        }

        if (hasCompletedSurvey()) navigate('/dashboard');
        else navigate('/survey');
      }
    };

    syncAndNavigate();
  }, [navigate]);

  // Paso 1: Verificar email
  const handleEmailCheck = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    setIsLoading(true);

    // Verificar si el email existe localmente
    let existingUser = getUserByEmail(email);

    // Si no está local, buscar en Firebase y sincronizar
    if (!existingUser) {
      console.log('🔍 Usuario no encontrado localmente, buscando en Firebase...');
      existingUser = await getUserFromFirebaseByEmail(email);
    }

    setIsLoading(false);

    // Lógica basada en la intención del usuario
    if (userIntent === 'login') {
      // Usuario quiere INICIAR SESIÓN
      if (existingUser) {
        // ✅ Usuario existe → pedir contraseña
        setStep('password');
      } else {
        // ❌ Usuario NO existe → mostrar error
        setError('Este email no está registrado. ¿Quieres crear una cuenta?');
      }
    } else {
      // Usuario quiere REGISTRARSE
      if (existingUser) {
        // ❌ Usuario YA existe → mostrar error
        setError('Este email ya está registrado. ¿Quieres iniciar sesión?');
      } else {
        // ✅ Usuario NO existe → mostrar registro
        setStep('register');
      }
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
    
    console.log(`🔐 [LOGIN] Iniciando login para: ${email}`);
    console.log('[DEBUG] Password en login (length):', password?.length);
    console.log('[DEBUG] Password tiene espacios:', password?.includes(' '));

    try {
      // Validar credenciales usando Firebase Authentication
      const user = await validateCredentials(email, password);

      if (user) {
        console.log(`✅ [LOGIN] Login exitoso: ${user.email}`);
        completeLogin(user);
      } else {
        console.error(`❌ [LOGIN] Credenciales inválidas`);
        setError('Email o contraseña incorrectos. Verifica tus datos e intenta de nuevo.');
      }
    } catch (error: any) {
      console.error(`❌ [LOGIN] Error durante login:`, error);
      setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
    }

    setIsLoading(false);
  };

  // Paso 2b: Registro de nuevo usuario - CON TODOS LOS CAMPOS
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Verificar si el email ya existe (IMPORTANTE: emails deben ser únicos)
    const emailLower = email.toLowerCase().trim();
    let existingUser = getUserByEmail(emailLower);
    if (!existingUser) {
      // Verificar en Firebase también
      existingUser = await getUserFromFirebaseByEmail(emailLower);
    }
    
    if (existingUser) {
      setError('Este email ya está registrado. Por favor inicia sesión o usa otro email.');
      setView('initial'); // Volver a la pantalla inicial
      return;
    }

    // Validar TODOS los campos obligatorios
    if (!registerData.name || !registerData.companyName || !registerData.instagram || !registerData.phone || registerData.category.length === 0) {
      setError('Por favor completa TODOS los campos obligatorios');
      return;
    }

    // Validar alcance geográfico
    if (!registerData.scope) {
      setError('Por favor selecciona tu alcance geográfico');
      return;
    }

    // Validación según alcance geográfico
    if (registerData.scope === 'NACIONAL') {
      // NACIONAL: No requiere NADA más geográficamente
      console.log('✅ NACIONAL: Sin validaciones geográficas adicionales');
    } else if (registerData.scope === 'LOCAL') {
      // LOCAL: Solo requiere comuna (la región está implícita en la comuna)
      if (!registerData.comuna) {
        setError('Por favor selecciona tu comuna');
        return;
      }
      console.log('✅ LOCAL: Comuna seleccionada');
    } else if (registerData.scope === 'REGIONAL') {
      // REGIONAL: Solo requiere regiones seleccionadas
      if (registerData.selectedRegions.length === 0) {
        setError('Por favor selecciona al menos una región');
        return;
      }
      console.log('✅ REGIONAL: Regiones seleccionadas');
    }

    // Validar biografía y descripción
    if (registerData.bio.length < 50) {
      setError('Tu biografía debe tener al menos 50 caracteres');
      return;
    }

    if (registerData.businessDescription.length < 60) {
      setError('La descripción de tu negocio debe tener al menos 60 caracteres');
      return;
    }

    // Validar facturación
    if (!registerData.revenue) {
      setError('Por favor indica tu rango de ingresos');
      return;
    }

    // Validar términos
    if (!registerData.termsAccepted) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    // Validar contraseña
    if (!registerData.password || registerData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar formato de Instagram
    const instagramHandle = registerData.instagram.startsWith('@') ? registerData.instagram : `@${registerData.instagram}`;

    // Usar la categoría seleccionada directamente
    const fullCategory = registerData.category;

    setIsLoading(true);

    try {
      const { registerNewUser } = await import('../../services/realUsersData');
      const newUser = await registerNewUser({
        email,
        name: registerData.name,
        companyName: registerData.companyName,
        instagram: instagramHandle,
        phone: registerData.phone,
        category: fullCategory,
        affinity: registerData.affinity || (registerData.category[0] || ''),
        password: registerData.password,
        // Campos adicionales completos
        scope: registerData.scope,
        city: registerData.city,
        comuna: registerData.comuna,
        selectedRegions: registerData.selectedRegions,
        bio: registerData.bio,
        businessDescription: registerData.businessDescription,
        revenue: registerData.revenue,
        termsAccepted: registerData.termsAccepted,
        // RRSS opcionales
        website: registerData.website,
        linkedin: registerData.linkedin,
        tiktok: registerData.tiktok,
        // Marcar perfil como completo desde el inicio
        profileComplete: true,
        onboardingComplete: true,
        status: 'active'
      });

      if (newUser) {
        console.log('✅ Nuevo usuario registrado con perfil COMPLETO:', newUser.name, fullCategory);
        // 🎉 Marcar para confeti de bienvenida
        localStorage.setItem('tribu_new_registration', 'true');
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

    try {
      const membershipData = await fetchMembershipFromCloud(loggedUser.id);
      if (membershipData) {
        syncMembershipToLocalCache(loggedUser.id, membershipData);
        const status = membershipData.status;
        if (status === 'miembro' || status === 'admin') {
          navigate('/searching');
          return;
        }
        if (status === 'trial') {
          navigate('/searching');
          return;
        }
      }
    } catch (error) {
      console.log('⚠️ Error obteniendo membresía al iniciar sesión:', error);
    }

    navigate('/membership');
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
      <div className="mb-4 flex justify-center relative">
        <img
          src="/NuevoLogo.png"
          alt="Tribu Impulsa"
          className="w-[90%] max-w-[380px] object-contain"
          onClick={() => {
            setResetClicks(prev => prev + 1);
            setTimeout(() => setResetClicks(0), 2000); // Reset counter después de 2s
            
            if (resetClicks >= 4) { // 5 clicks totales
              // 🔒 SEGURIDAD: Requiere contraseña admin
              const password = window.prompt('🔒 ACCESO RESTRINGIDO\n\nIngresa la contraseña de administrador:');
              
              if (password === 'TRIBU2026RESET') {
                const confirmed = window.confirm('🗑️ ¿LIMPIAR TODO EL SISTEMA?\n\nEsto borrará:\n- Todas las cuentas locales\n- Datos de sesión\n- Cache de onboarding\n- Estadísticas de Firebase\n\n⚠️ NO SE PUEDE DESHACER');
                
                if (confirmed) {
                  (async () => {
                    console.log('🗑️ Limpiando sistema completo...');
                    
                    // 1. Limpiar localStorage y sessionStorage
                    localStorage.clear();
                    sessionStorage.clear();
                    console.log('✅ LocalStorage y sessionStorage limpiados');
                    
                    // 2. Resetear contador de Firebase
                    try {
                      const db = getFirestoreInstance();
                      if (db) {
                        const { doc, setDoc } = await import('firebase/firestore');
                        await setDoc(doc(db, 'system_stats', 'global'), {
                          profilesCompleted: 0,
                          lastUpdated: new Date().toISOString()
                        });
                        console.log('✅ Contador de Firebase reseteado a 0');
                      }
                    } catch (error) {
                      console.error('⚠️ Error reseteando contador:', error);
                    }
                    
                    console.log('✅ Sistema limpiado');
                    alert('✅ Sistema limpiado completamente\n\nContador: 0\nLa página se recargará.');
                    window.location.reload();
                  })();
                }
              } else if (password !== null) {
                alert('❌ Contraseña incorrecta\n\nAcceso denegado.');
              }
              setResetClicks(0);
            }
          }}
          style={{ cursor: resetClicks > 0 ? 'pointer' : 'default' }}
        />
        {resetClicks > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
            {resetClicks}/5
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-[#E4E7EF]">

        {/* PASO 0: Landing / Bienvenida - RALLY 1000 MEJORADO */}
        {step === 'landing' && (
          <div className="space-y-5">
            {/* Badge Rally 1000 con urgencia */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer" />
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="relative">🚀 RALLY 1000 - ¡Últimos cupos!</span>
              </div>
            </div>

            {/* Headline potente */}
            <div className="text-center">
              <h2 className="text-2xl font-black text-[#181B34] leading-tight mb-2">
                Tu red de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6161FF] to-[#00CA72]">10 + 10 emprendedores</span> que se impulsan todos los meses
              </h2>
              <p className="text-sm text-gray-500">El sistema de crecimiento colaborativo #1 en Chile</p>
            </div>
            
            {/* Contador de progreso MEJORADO */}
            <div className="relative bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 rounded-2xl p-4 border border-indigo-100 overflow-hidden">
              {/* Efecto brillo */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-pulse" style={{ animationDuration: '3s' }} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Rally Activo</span>
                  </div>
                  <span className="text-xs text-red-500 font-semibold animate-pulse">⏰ Cierra pronto</span>
                </div>
                
                {/* Barra de progreso animada */}
                <div className="h-4 bg-white/80 rounded-full overflow-hidden shadow-inner mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-full transition-all duration-1000 relative"
                    style={{ width: `${Math.max((profilesCount / 1000) * 100, 0.5)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 animate-shimmer" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-700">
                    <span className="font-black text-xl text-indigo-600">{profilesCount}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="font-bold">1000</span>
                    <span className="text-gray-500 ml-1">inscritos</span>
                  </p>
                  <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                    {1000 - profilesCount} cupos 🔥
                  </div>
                </div>
              </div>
            </div>

            {/* Beneficios compactos MEJORADOS */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-3 border border-indigo-100">
                <div className="text-2xl mb-1">🎯</div>
                <p className="text-[10px] font-bold text-indigo-700">10+10</p>
                <p className="text-[9px] text-gray-500">Matching IA</p>
              </div>
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-3 border border-violet-100">
                <div className="text-2xl mb-1">📈</div>
                <p className="text-[10px] font-bold text-violet-700">2x</p>
                <p className="text-[9px] text-gray-500">Más alcance</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-3 border border-emerald-100">
                <div className="text-2xl mb-1">🤝</div>
                <p className="text-[10px] font-bold text-emerald-700">100%</p>
                <p className="text-[9px] text-gray-500">Garantizado</p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              {/* CTA Principal - Nuevo usuario */}
              <button
                onClick={() => {
                  setUserIntent('register');
                  setStep('email');
                  setError('');
                }}
                className="w-full bg-gradient-to-r from-[#6161FF] via-[#7B5EFF] to-[#8B5CF6] text-white py-4 rounded-xl font-bold text-lg hover:shadow-[0_8px_25px_rgba(97,97,255,0.45)] transition-all shadow-xl flex items-center justify-center gap-3 group relative overflow-hidden transform hover:scale-[1.02]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 animate-shimmer" />
                <Gift size={22} className="relative animate-bounce" style={{ animationDuration: '2s' }} />
                <span className="relative">¡Crear mi cuenta GRATIS!</span>
                <ArrowRight size={20} className="relative group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Botón secundario - Ya tengo cuenta */}
              <button
                onClick={() => {
                  setUserIntent('login');
                  setStep('email');
                  setError('');
                }}
                className="w-full bg-white border-2 border-[#6161FF] text-[#6161FF] py-3 rounded-xl font-semibold hover:bg-[#6161FF]/5 transition-all flex items-center justify-center gap-2"
              >
                <UserIcon size={18} />
                Ya tengo cuenta - Ingresar
              </button>
            </div>
          </div>
        )}

        {/* PASO 1: Email */}
        {step === 'email' && (
          <>
            <p className="text-[#7C8193] mb-6 text-sm text-center -mt-2">
              {userIntent === 'login' ? (
                <>Ingresa tu email para <span className="text-[#6161FF] font-semibold">iniciar sesión</span></>
              ) : (
                <>Conecta, colabora y crece con el <span className="text-[#6161FF] font-semibold">Algoritmo Tribal</span></>
              )}
            </p>
            <form onSubmit={handleEmailCheck} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(''); // Limpiar error al escribir
                  }}
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3.5 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                  placeholder="tu@email.com"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-[#FFF0F5] border border-[#FB275D]/30 rounded-lg p-3 text-sm">
                  <p className="text-[#FB275D] font-medium">{error}</p>
                  {userIntent === 'register' && error.includes('ya está registrado') && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserIntent('login');
                        setError('');
                        handleEmailCheck({ preventDefault: () => {} } as FormEvent);
                      }}
                      className="mt-2 text-[#6161FF] font-semibold hover:underline"
                    >
                      → Ir a iniciar sesión
                    </button>
                  )}
                  {userIntent === 'login' && error.includes('no está registrado') && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserIntent('register');
                        setError('');
                        setStep('register');
                      }}
                      className="mt-2 text-[#6161FF] font-semibold hover:underline"
                    >
                      → Crear cuenta nueva
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#6161FF] to-[#8B8BFF] text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-[0_8px_20px_rgba(97,97,255,0.35)] transition-all shadow-md flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                {isLoading ? 'Verificando...' : 'Continuar'}
                {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>

              <button
                type="button"
                onClick={() => setStep('landing')}
                className="w-full text-[#7C8193] text-sm hover:text-[#6161FF] transition-colors"
              >
                ← Volver
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3.5 pr-12 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                  placeholder="Tu contraseña"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C8193] hover:text-[#6161FF] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="text-[#FB275D] text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#00CA72] to-[#4AE698] text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-[0_8px_20px_rgba(0,202,114,0.35)] transition-all shadow-md flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
              {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); setPassword(''); }}
                className="text-[#7C8193] hover:text-[#6161FF] text-sm transition-colors"
              >
                ← Cambiar email
              </button>
              <button
                type="button"
                onClick={() => { setStep('forgot'); setError(''); setResetSent(false); }}
                className="text-[#6161FF] hover:text-[#5050DD] text-sm font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        )}

        {/* PASO: Recuperar contraseña */}
        {step === 'forgot' && (
          <div className="space-y-4 text-left">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-[#6161FF]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock size={28} className="text-[#6161FF]" />
              </div>
              <h3 className="text-lg font-bold text-[#181B34]">Recuperar contraseña</h3>
              <p className="text-[#7C8193] text-sm mt-1">Te enviaremos un email para restablecer tu contraseña</p>
            </div>

            {!resetSent ? (
              <>
                <div className="bg-[#F5F7FB] rounded-xl p-3 text-sm text-[#434343]">
                  📧 {email}
                </div>

                {error && <p className="text-[#FB275D] text-sm text-center">{error}</p>}

                <button
                  onClick={async () => {
                    setIsLoading(true);
                    setError('');
                    try {
                      const { sendPasswordResetEmail } = await import('../../services/supabaseService');
                      await sendPasswordResetEmail(email);
                      setResetSent(true);
                    } catch (err: any) {
                      console.error('Error enviando email:', err);
                      if (err.message?.includes('User not found')) {
                        setError('No hay cuenta con este email. ¿Quieres registrarte?');
                      } else {
                        setError('Error enviando el email. Intenta de nuevo.');
                      }
                    }
                    setIsLoading(false);
                  }}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#6161FF] to-[#8B8BFF] text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-[0_8px_20px_rgba(97,97,255,0.35)] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'Enviando...' : 'Enviar email de recuperación'}
                </button>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-[#E6FFF3] border border-[#00CA72]/30 rounded-xl p-4">
                  <CheckCircle size={32} className="text-[#00CA72] mx-auto mb-2" />
                  <p className="text-[#008A4E] font-medium">¡Email enviado!</p>
                  <p className="text-[#008A4E]/80 text-sm mt-1">
                    Revisa tu bandeja de entrada y sigue las instrucciones
                  </p>
                </div>
                <p className="text-[#7C8193] text-xs">
                  ¿No llegó? Revisa tu carpeta de spam o solicita otro email
                </p>
                <button
                  onClick={() => setResetSent(false)}
                  className="text-[#6161FF] hover:text-[#5050DD] text-sm font-medium transition-colors"
                >
                  Reenviar email
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => { setStep('password'); setError(''); }}
              className="w-full text-[#7C8193] hover:text-[#6161FF] text-sm transition-colors"
            >
              ← Volver a ingresar contraseña
            </button>
          </div>
        )}

        {/* PASO 2b: Registro (usuario nuevo) - FORMULARIO COMPLETO - continúa en el siguiente mensaje debido al límite de caracteres */}
        {step === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-left">
            <div className="bg-gradient-to-r from-[#6161FF]/10 to-[#00CA72]/10 border border-[#6161FF]/30 rounded-xl p-3 mb-2">
              <p className="text-[#6161FF] text-sm font-medium">🎉 ¡Bienvenido/a a la Tribu!</p>
              <p className="text-[#6161FF]/80 text-xs">Completa tus datos para que podamos asignarte tu grupo 10+10</p>
              <div className="mt-2 flex items-center gap-2 bg-[#00CA72]/20 rounded-lg px-2 py-1.5">
                <span className="text-[#00CA72] text-lg">🆓</span>
                <div>
                  <p className="text-[#00873C] text-[0.65rem] font-bold">PRIMER MES 100% GRATIS</p>
                  <p className="text-[#00873C]/70 text-[0.55rem]">Sin tarjeta • Sin compromiso • Cancela cuando quieras</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F7FB] rounded-xl p-2.5 text-sm text-[#434343]">
              📧 {email}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Tu nombre completo *</label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
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
                onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                placeholder="Mi Empresa"
                required
              />
            </div>

            {/* Rubro principal - Selección múltiple con checkboxes */}
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">
                Rubros principales * <span className="text-[#7C8193] font-normal">(Selecciona hasta 5)</span>
              </label>
              <p className="text-[0.5625rem] text-[#7C8193] mb-2">
                {registerData.category.length === 0 ? 'Selecciona al menos 1 categoría' : `${registerData.category.length} de 5 seleccionadas`}
              </p>
              <div className="bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-4 max-h-[400px] overflow-y-auto">
                {/* Agrupar categorías por group */}
                {(() => {
                  const grouped = CATEGORY_SELECT_OPTIONS.reduce((acc, opt) => {
                    const group = opt.group || 'Otros';
                    if (!acc[group]) acc[group] = [];
                    acc[group].push(opt);
                    return acc;
                  }, {} as Record<string, typeof CATEGORY_SELECT_OPTIONS>);
                  
                  return Object.entries(grouped).map(([groupName, options]) => (
                    <div key={groupName} className="mb-4 last:mb-0">
                      <h4 className="font-bold text-[#181B34] mb-2 text-sm">{groupName}</h4>
                      <div className="space-y-1.5 pl-2">
                        {options.map((opt) => {
                          const isSelected = registerData.category.includes(opt.value);
                          const canSelect = registerData.category.length < 5 || isSelected;
                          
                          return (
                            <label 
                              key={opt.value}
                              className={`flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/50 transition-colors ${!canSelect ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={!canSelect}
                                onChange={() => {
                                  if (isSelected) {
                                    // Deseleccionar
                                    setRegisterData({
                                      ...registerData,
                                      category: registerData.category.filter(c => c !== opt.value)
                                    });
                                  } else if (registerData.category.length < 5) {
                                    // Seleccionar (si no ha llegado al límite)
                                    setRegisterData({
                                      ...registerData,
                                      category: [...registerData.category, opt.value]
                                    });
                                  }
                                }}
                                className="mt-0.5 h-4 w-4 text-[#6161FF] border-gray-300 rounded focus:ring-[#6161FF]"
                              />
                              <span className="text-sm text-[#434343] leading-tight">
                                {opt.label}
                                {opt.description && <span className="text-xs text-[#7C8193] block">{opt.description}</span>}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Afinidad / Estilo de vida - SearchableSelect */}
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Afinidad / Estilo de vida</label>
              <SearchableSelect
                value={registerData.affinity}
                onChange={(val) => setRegisterData({ ...registerData, affinity: val })}
                options={AFFINITY_SELECT_OPTIONS_WITH_GROUP}
                placeholder="🔍 ¿Con qué te identificas? (opcional)"
                helperText="Ayuda al algoritmo a conectarte mejor"
                emptyStateText="No encontramos esa afinidad."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Instagram *</label>
                <input
                  type="text"
                  value={registerData.instagram}
                  onChange={(e) => setRegisterData({ ...registerData, instagram: e.target.value })}
                  onBlur={(e) => setRegisterData({ ...registerData, instagram: autoFormatInstagram(e.target.value) })}
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                  placeholder="usuario (@ automático)"
                  required
                />
                <p className="text-[0.5625rem] text-[#7C8193] mt-0.5">⚠️ Debe ser público • @ se agrega automáticamente</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Teléfono *</label>
                <input
                  type="tel"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  onBlur={(e) => setRegisterData({ ...registerData, phone: autoFormatPhone(e.target.value) })}
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                  placeholder="912345678 (+569 automático)"
                  required
                />
                <p className="text-[0.5625rem] text-[#7C8193] mt-0.5">+569 se agrega automáticamente</p>
              </div>
            </div>

            {/* RRSS Opcionales */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[0.6rem] font-medium text-[#7C8193] mb-1">Web</label>
                <input
                  type="text"
                  value={registerData.website}
                  onChange={(e) => setRegisterData({ ...registerData, website: e.target.value })}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      setRegisterData({ ...registerData, website: autoFormatWebsite(e.target.value) });
                    }
                  }}
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-2 text-xs text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-1 focus:ring-[#6161FF]/30"
                  placeholder="miweb.cl"
                />
                <p className="text-[0.45rem] text-[#7C8193] mt-0.5">https:// automático</p>
              </div>
              <div>
                <label className="block text-[0.6rem] font-medium text-[#7C8193] mb-1">LinkedIn</label>
                <input
                  type="text"
                  value={registerData.linkedin}
                  onChange={(e) => setRegisterData({ ...registerData, linkedin: e.target.value })}
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-2 text-xs text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-1 focus:ring-[#6161FF]/30"
                  placeholder="/in/usuario"
                />
              </div>
              <div>
                <label className="block text-[0.6rem] font-medium text-[#7C8193] mb-1">TikTok</label>
                <input
                  type="text"
                  value={registerData.tiktok}
                  onChange={(e) => setRegisterData({ ...registerData, tiktok: e.target.value })}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      setRegisterData({ ...registerData, tiktok: autoFormatInstagram(e.target.value) });
                    }
                  }}
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-2 text-xs text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-1 focus:ring-[#6161FF]/30"
                  placeholder="usuario"
                />
                <p className="text-[0.45rem] text-[#7C8193] mt-0.5">@ automático</p>
              </div>
            </div>

            {/* Alcance geográfico */}
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">¿Dónde ofreces tus servicios? *</label>
              <div className="grid grid-cols-3 gap-2">
                {(['NACIONAL', 'REGIONAL', 'LOCAL'] as const).map(scope => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => setRegisterData({ ...registerData, scope, selectedRegions: [], selectedRegion: '', city: '', comuna: '' })}
                    className={`p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                      registerData.scope === scope
                        ? 'border-[#6161FF] bg-[#6161FF]/10 text-[#6161FF]'
                        : 'border-[#E4E7EF] bg-[#F5F7FB] text-[#7C8193] hover:border-[#6161FF]/50'
                    }`}
                  >
                    {scope === 'NACIONAL' && '🌎 Nacional'}
                    {scope === 'REGIONAL' && '📍 Regional'}
                    {scope === 'LOCAL' && '🏠 Local'}
                  </button>
                ))}
              </div>
            </div>

            {/* LOCAL: Región + Comuna */}
            {registerData.scope === 'LOCAL' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Región *</label>
                  <select
                    value={registerData.selectedRegion}
                    onChange={(e) => {
                      const region = REGIONS.find(r => r.id === e.target.value);
                      setRegisterData({ 
                        ...registerData, 
                        selectedRegion: e.target.value,
                        city: region?.shortName || '',
                        comuna: ''
                      });
                    }}
                    className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                    required
                  >
                    <option value="">Selecciona región</option>
                    {REGIONS.map(region => (
                      <option key={region.id} value={region.id}>{region.shortName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Comuna *</label>
                  <select
                    value={registerData.comuna}
                    onChange={(e) => setRegisterData({ ...registerData, comuna: e.target.value })}
                    className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                    required
                    disabled={!registerData.selectedRegion}
                  >
                    <option value="">Selecciona comuna</option>
                    {registerData.selectedRegion && REGIONS.find(r => r.id === registerData.selectedRegion)?.comunas.map(comuna => (
                      <option key={comuna} value={comuna}>{comuna}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* REGIONAL: Solo checkboxes de regiones */}
            {registerData.scope === 'REGIONAL' && (
              <div>
                <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Regiones donde operas *</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto bg-[#F5F7FB] rounded-xl p-2">
                  {REGIONS.map(region => (
                    <label key={region.id} className="flex items-center gap-1.5 text-xs text-[#434343] cursor-pointer hover:text-[#6161FF]">
                      <input
                        type="checkbox"
                        checked={registerData.selectedRegions.includes(region.shortName)}
                        onChange={(e) => {
                          const newRegions = e.target.checked
                            ? [...registerData.selectedRegions, region.shortName]
                            : registerData.selectedRegions.filter(r => r !== region.shortName);
                          setRegisterData({ ...registerData, selectedRegions: newRegions });
                        }}
                        className="w-3.5 h-3.5 rounded border-[#E4E7EF] text-[#6161FF] focus:ring-[#6161FF]/30"
                      />
                      {region.shortName}
                    </label>
                  ))}
                </div>
                <p className="text-[0.45rem] text-[#7C8193] mt-1">Selecciona todas las regiones donde ofreces tu servicio</p>
              </div>
            )}

            {/* Facturación mensual */}
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Rango de ingresos mensual *</label>
              <select
                value={registerData.revenue}
                onChange={(e) => setRegisterData({ ...registerData, revenue: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                required
              >
                <option value="">Selecciona un rango</option>
                <option value="0-500k">$0 - $500.000</option>
                <option value="500k-1M">$500.000 - $1.000.000</option>
                <option value="1M-3M">$1.000.000 - $3.000.000</option>
                <option value="3M-5M">$3.000.000 - $5.000.000</option>
                <option value="5M-10M">$5.000.000 - $10.000.000</option>
                <option value="10M+">Más de $10.000.000</option>
              </select>
              <p className="text-[0.5rem] text-[#9CA3B3] mt-0.5">🔒 Esta información es privada y ayuda al matching</p>
            </div>

            {/* Biografía */}
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">
                Tu biografía corta * <span className="text-[#9CA3B3] font-normal">({registerData.bio.length}/50 mín.)</span>
              </label>
              <textarea
                value={registerData.bio}
                onChange={(e) => setRegisterData({ ...registerData, bio: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all resize-none"
                placeholder="Cuéntanos brevemente quién eres y qué te apasiona..."
                rows={2}
                required
                minLength={50}
              />
            </div>

            {/* Descripción del negocio */}
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">
                Descripción de tu negocio * <span className="text-[#9CA3B3] font-normal">({registerData.businessDescription.length}/60 mín.)</span>
              </label>
              <textarea
                value={registerData.businessDescription}
                onChange={(e) => setRegisterData({ ...registerData, businessDescription: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all resize-none"
                placeholder="Describe qué hace tu negocio, qué productos/servicios ofreces y qué te diferencia..."
                rows={3}
                required
                minLength={60}
              />
            </div>

            {/* Términos y condiciones */}
            <label className="flex items-start gap-2 cursor-pointer bg-[#F5F7FB] rounded-xl p-3">
              <input
                type="checkbox"
                checked={registerData.termsAccepted}
                onChange={(e) => setRegisterData({ ...registerData, termsAccepted: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded border-[#E4E7EF] text-[#6161FF] focus:ring-[#6161FF]/30"
                required
              />
              <span className="text-xs text-[#434343]">
                Acepto los <a href="/terminosycondiciones.pdf" target="_blank" rel="noopener noreferrer" className="text-[#6161FF] underline">términos y condiciones</a> y la <a href="/politicasdeprivacidad.pdf" target="_blank" rel="noopener noreferrer" className="text-[#6161FF] underline">política de privacidad</a> de Tribu Impulsa
              </span>
            </label>

            {/* Crear contraseña */}
            <div className="pt-2 border-t border-[#E4E7EF]">
              <p className="text-xs text-[#6161FF] font-semibold mb-3 flex items-center gap-2">
                🔐 Crea tu contraseña
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Contraseña *</label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 pr-10 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                      placeholder="••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C8193] hover:text-[#6161FF] transition-colors"
                    >
                      {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">Confirmar *</label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 pr-10 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
                      placeholder="••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C8193] hover:text-[#6161FF] transition-colors"
                    >
                      {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[0.5625rem] text-[#7C8193] mt-1">Mínimo 6 caracteres</p>
            </div>

            {error && <p className="text-[#FB275D] text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={
                isLoading || 
                !registerData.name || 
                !registerData.companyName || 
                registerData.category.length === 0 || 
                !registerData.instagram || 
                !registerData.phone || 
                !registerData.scope ||
                (registerData.scope === 'LOCAL' && (!registerData.selectedRegion || !registerData.comuna)) ||
                (registerData.scope === 'REGIONAL' && registerData.selectedRegions.length === 0) ||
                !registerData.revenue ||
                registerData.bio.length < 50 ||
                registerData.businessDescription.length < 60 ||
                !registerData.termsAccepted ||
                !registerData.password || 
                registerData.password !== registerData.confirmPassword ||
                registerData.password.length < 6
              }
              className="w-full bg-gradient-to-r from-[#00CA72] to-[#4AE698] text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-[0_8px_20px_rgba(0,202,114,0.35)] transition-all shadow-md flex items-center justify-center gap-3 group disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Registrando...' : '¡Unirme a la Tribu GRATIS!'}
              {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>

            <button
              type="button"
              onClick={() => { setStep('email'); setError(''); }}
              className="w-full text-[#7C8193] hover:text-[#6161FF] text-sm transition-colors"
            >
              ← Cambiar email
            </button>
          </form>
        )}

        {/* Menú protegido para uso interno - Solo visible en desarrollo */}
        {import.meta.env.DEV && (
          !devMode ? (
            <div className="mt-4 flex items-center gap-2">
              <input
                type="password"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    if (devPassword === 'TRIBU2026') {
                      // Acceso directo al dashboard con TRIBU2026
                      const firstUser = getCurrentUser();
                      if (firstUser) {
                        navigate('/dashboard');
                      } else {
                        // Si no hay usuario actual, usar el primero disponible
                        const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
                        if (users.length > 0) {
                          setCurrentUser(users[0].id);
                          navigate('/dashboard');
                        }
                      }
                    } else if (devPassword === '1234') {
                      setDevMode(true);
                    }
                  }
                }}
                placeholder="PIN"
                className="w-16 text-center text-xs bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg px-2 py-1.5"
              />
              <button
                onClick={() => {
                  if (devPassword === 'TRIBU2026') {
                    // Acceso directo al dashboard con TRIBU2026
                    const firstUser = getCurrentUser();
                    if (firstUser) {
                      navigate('/dashboard');
                    } else {
                      // Si no hay usuario actual, usar el primero disponible
                      const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
                      if (users.length > 0) {
                        setCurrentUser(users[0].id);
                        navigate('/dashboard');
                      }
                    }
                  } else if (devPassword === '1234') {
                    setDevMode(true);
                  }
                }}
                className="text-[0.625rem] text-[#B3B8C6] hover:text-[#7C8193] transition"
              >
                ⚙️
              </button>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-xl border border-[#E4E7EF]">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[0.625rem] text-[#6161FF] uppercase tracking-wide font-bold">🔐 Modo Desarrollo</p>
                <button onClick={() => setDevMode(false)} className="text-[0.625rem] text-[#7C8193] hover:text-[#FB275D]">✕</button>
              </div>
              <p className="text-[0.625rem] text-[#7C8193] mb-2">Usuarios de prueba (acceso directo)</p>
              <div className="space-y-1 text-xs text-left">
                <button
                  onClick={() => { setEmail('dafnafinkelstein@gmail.com'); setStep('password'); }}
                  className="block w-full text-left px-2 py-1.5 hover:bg-white rounded text-[#181B34] hover:text-[#6161FF] transition"
                >
                  👉 Dafna - By Turquía
                </button>
                <button
                  onClick={() => { setEmail('doraluz@terraflorpaisajismo.cl'); setStep('password'); }}
                  className="block w-full text-left px-2 py-1.5 hover:bg-white rounded text-[#181B34] hover:text-[#6161FF] transition"
                >
                  👉 Doraluz - Terraflor
                </button>
                <button
                  onClick={() => { setEmail('guille@elevatecreativo.com'); setStep('password'); }}
                  className="block w-full text-left px-2 py-1.5 hover:bg-white rounded text-[#181B34] hover:text-[#6161FF] transition"
                >
                  👉 Guillermo - Elevate
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
