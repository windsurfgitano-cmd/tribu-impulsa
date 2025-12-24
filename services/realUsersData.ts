// USUARIOS REALES de Tribu Impulsa - Importados del CSV oficial
// Contraseña universal: TRIBU2026
// Después del primer login se sugiere cambiar contraseña

import { UserProfile } from './databaseService';

// Contraseña universal para todos los usuarios registrados
export const UNIVERSAL_PASSWORD = 'TRIBU2026';

// Generar avatar con iniciales (Instagram bloquea hotlinking)
// Colores vibrantes basados en el nombre para variedad visual
const getAvatarUrl = (name: string, _instagram?: string): string => {
  // Colores vibrantes para avatares (basado en hash del nombre)
  const colors = ['6161FF', '00CA72', 'FF6B6B', 'FFD93D', '6BCB77', 'FF8E53', '4D96FF', 'FF6B9D'];
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=fff&size=200&bold=true&rounded=true`;
};

// Generar logo basado en empresa
const getLogoUrl = (companyName: string): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=00CA72&color=fff&size=100&bold=true`;
};

// Cover images temáticos por categoría
const getCoverUrl = (category: string): string => {
  const covers: Record<string, string> = {
    'Paisajismo': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
    'Marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    'Belleza': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    'Joyería': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
    'Pastelería': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
    'Arquitectura': 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800',
    'Turismo': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
    'Coaching': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    'Tecnología': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    'Eventos': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
    'Infantil': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800',
    'Salud': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    'Finanzas': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    'Construcción': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
    'default': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
  };

  for (const [key, url] of Object.entries(covers)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return url;
  }
  return covers.default;
};

// Interface extendida para usuarios con datos de primer login
export interface RealUser extends Omit<UserProfile, 'id' | 'createdAt'> {
  firstLogin: boolean; // true = debe sugerir cambio de contraseña
  rut?: string;
  razonSocial?: string;
  direccion?: string;
  tiempoEmprendimiento?: string;
  precioPromedio?: string;
  generoCliente?: string;
  rangoEtario?: string;
  nse?: string;
  intereses?: string;
  horariosRedes?: string;
  frecuenciaInstagram?: string;
  tipoContenido?: string;
  experienciaColab?: string;
  objetivos?: string;
  compromisoPublicaciones?: string;
}

// ===============================================
// USUARIOS REALES - 9 CLIENTES AUTORIZADOS
// ===============================================
export const REAL_USERS: RealUser[] = [
  {
    email: 'guille@elevatecreativo.com',
    name: 'Guillermo García',
    companyName: 'Elevate Agencia de Marketing',
    instagram: '@elevate.agencia',
    phone: '+56979777906',
    whatsapp: '+56979777906',
    website: 'https://elevatecreativo.com',
    category: 'Servicios Profesionales',
    affinity: 'Negocios',
    bio: 'Somos una empresa de servicios de agencia de marketing y asesoría comercial',
    businessDescription: 'Aprendemos del negocio del cliente para poder hacer acciones que realmente impactan las ventas.',
    city: 'Santiago',
    scope: 'NACIONAL',
    revenue: '500000',
    avatarUrl: getAvatarUrl('Guillermo García'),
    companyLogoUrl: getLogoUrl('Elevate Agencia de Marketing'),
    coverUrl: getCoverUrl('Servicios Profesionales'),
    status: 'active',
    followers: 5000,
    firstLogin: false,
    password: UNIVERSAL_PASSWORD,
    surveyCompleted: true,
    tribeAssigned: true,
    onboardingComplete: true,
    termsAccepted: true
  },
  {
    email: 'rincondeoz@gmail.com',
    name: 'Oscar Zambrano',
    companyName: 'El Rey de las Páginas',
    instagram: '@rincondeoz',
    phone: '+56912345678',
    whatsapp: '+56912345678',
    website: 'https://rincondeoz.com',
    category: 'Servicios Profesionales',
    affinity: 'Digital y Tecnología',
    bio: 'Desarrollo web y soluciones digitales para emprendedores',
    businessDescription: 'Creamos páginas web profesionales y soluciones digitales que ayudan a los emprendedores a crecer online.',
    city: 'Santiago',
    scope: 'NACIONAL',
    revenue: '300000',
    avatarUrl: getAvatarUrl('Oscar Zambrano'),
    companyLogoUrl: getLogoUrl('El Rey de las Páginas'),
    coverUrl: getCoverUrl('Servicios Profesionales'),
    status: 'active',
    followers: 2000,
    firstLogin: false,
    password: UNIVERSAL_PASSWORD,
    surveyCompleted: true,
    tribeAssigned: true,
    onboardingComplete: true,
    termsAccepted: true
  },
  {
    email: 'windsurfgitano@gmail.com',
    name: 'Oscar Zambrano',
    companyName: 'Zambrano Ztudios',
    instagram: '@zambranoz',
    phone: '+56987654321',
    whatsapp: '+56987654321',
    website: '',
    category: 'Arte, Diseño y Creatividad',
    affinity: 'Diseño y Creatividad',
    bio: 'Estudio creativo especializado en diseño gráfico y branding',
    businessDescription: 'Transformamos ideas en identidades visuales únicas que conectan con tu audiencia y destacan tu marca.',
    city: 'Santiago',
    scope: 'REGIONAL',
    selectedRegions: ['Metropolitana'],
    revenue: '200000',
    avatarUrl: getAvatarUrl('Oscar Zambrano'),
    companyLogoUrl: getLogoUrl('Zambrano Ztudios'),
    coverUrl: getCoverUrl('Arte, Diseño y Creatividad'),
    status: 'active',
    followers: 1500,
    firstLogin: false,
    password: UNIVERSAL_PASSWORD,
    surveyCompleted: true,
    tribeAssigned: true,
    onboardingComplete: true,
    termsAccepted: true
  },
  {
    email: 'doraluz@terraflorpaisajismo.cl',
    name: 'Doraluz Galleguillos',
    companyName: 'Terraflor Paisajismo',
    instagram: '@terraflorpaisajismochile',
    phone: '+56976160566',
    whatsapp: '+56976160566',
    website: 'https://www.terraflorpaisajismo.cl',
    category: 'Construcción y Mantención',
    affinity: 'Impacto y Propósito',
    bio: 'Diseño de jardines y paisajismo sustentable',
    businessDescription: 'En Terraflor embellecemos tus proyectos con paisajismo inteligente y sustentable.',
    city: 'Santiago',
    scope: 'REGIONAL',
    selectedRegions: ['Metropolitana'],
    revenue: '500000',
    avatarUrl: getAvatarUrl('Doraluz Galleguillos'),
    companyLogoUrl: getLogoUrl('Terraflor Paisajismo'),
    coverUrl: getCoverUrl('Construcción y Mantención'),
    status: 'active',
    followers: 5000,
    firstLogin: false,
    password: UNIVERSAL_PASSWORD,
    surveyCompleted: true,
    tribeAssigned: true,
    role: 'admin'
  },
  {
    email: 'admin@tribuimpulsa.cl',
    name: 'Admin Tribu',
    companyName: 'Tribu Impulsa',
    instagram: '@tribuimpulsa',
    phone: '+56900000000',
    whatsapp: '+56900000000',
    website: 'https://tribuimpulsa.cl',
    category: 'Plataforma',
    affinity: 'Todos',
    bio: 'Administrador de la plataforma Tribu Impulsa',
    businessDescription: 'Plataforma que conecta emprendedores para impulsar sus negocios mediante colaboración mutua.',
    city: 'Santiago',
    scope: 'NACIONAL',
    revenue: '0',
    avatarUrl: getAvatarUrl('Admin Tribu'),
    companyLogoUrl: getLogoUrl('Tribu Impulsa'),
    coverUrl: getCoverUrl('Plataforma'),
    status: 'active',
    followers: 1000,
    firstLogin: false,
    password: UNIVERSAL_PASSWORD,
    surveyCompleted: true,
    tribeAssigned: true,
    role: 'admin'
  },
  {
    email: 'dafnafinkelstein@gmail.com',
    name: 'Dafna Finkelstein',
    companyName: 'By Turquía',
    instagram: '@byturquia',
    phone: '+56992767707',
    whatsapp: '+56992767707',
    website: 'https://www.byturquia.com',
    category: 'Moda Mujer',
    affinity: 'Diseño y Creatividad',
    bio: 'Joyería artesanal inspirada en Turquía. Piezas únicas con historia.',
    businessDescription: 'Joyas de plata 925 enchapadas en oro de 18 quilates y piedras semipreciosas. Joyas pensadas en mujeres fuertes.',
    city: 'Santiago',
    scope: 'NACIONAL',
    revenue: '100000',
    avatarUrl: getAvatarUrl('Dafna Finkelstein'),
    companyLogoUrl: getLogoUrl('By Turquía'),
    coverUrl: getCoverUrl('Moda Mujer'),
    status: 'active',
    followers: 10000,
    firstLogin: false,
    password: UNIVERSAL_PASSWORD,
    surveyCompleted: true,
    tribeAssigned: true,
    role: 'admin'
  },
  {
    email: 'qa_dummy@tribuimpulsa.cl',
    name: 'QA Dummy',
    companyName: 'QA Tribu Labs',
    instagram: '@qatribu',
    phone: '+56999999999',
    whatsapp: '+56999999999',
    website: '',
    category: 'Tecnología',
    affinity: 'Digital y Tecnología',
    bio: 'Usuario de prueba para QA y testing de la plataforma',
    businessDescription: 'Perfil de prueba utilizado para verificar funcionalidades y flujos de la plataforma Tribu Impulsa.',
    city: 'Santiago',
    scope: 'LOCAL',
    comuna: 'Santiago',
    revenue: '50000',
    avatarUrl: getAvatarUrl('QA Dummy'),
    companyLogoUrl: getLogoUrl('QA Tribu Labs'),
    coverUrl: getCoverUrl('Tecnología'),
    status: 'inactive',
    followers: 100,
    firstLogin: true,
    password: '123123',
    surveyCompleted: false,
    tribeAssigned: false
  },
  {
    email: 'ergoguillermogarcia@gmail.com',
    name: 'Guillermo García',
    companyName: 'Pausa Coaching',
    instagram: '@pausacoaching',
    phone: '+56979777906',
    whatsapp: '+56979777906',
    website: '',
    category: 'Servicios Profesionales',
    affinity: 'Bienestar y Salud',
    bio: 'Coaching para personas o grupos de personas',
    businessDescription: 'Coaching con tiempo de duración específico para ayudarte a alcanzar tus objetivos personales y profesionales.',
    city: 'Santiago',
    scope: 'REGIONAL',
    selectedRegions: ['Metropolitana'],
    revenue: '100000',
    avatarUrl: getAvatarUrl('Guillermo García'),
    companyLogoUrl: getLogoUrl('Pausa Coaching'),
    coverUrl: getCoverUrl('Servicios Profesionales'),
    status: 'active',
    followers: 1000,
    firstLogin: false,
    password: UNIVERSAL_PASSWORD,
    surveyCompleted: false,
    tribeAssigned: true
  },
  {
    email: 'chileimpresiones3d@gmail.com',
    name: 'Oscar Zambrano',
    companyName: 'Chile Impresiones 3D',
    instagram: '@chileimpresiones3d',
    phone: '+56912345678',
    whatsapp: '+56912345678',
    website: '',
    category: 'Tecnología',
    affinity: 'Digital y Tecnología',
    bio: 'Impresión 3D profesional para proyectos personales y empresariales',
    businessDescription: 'Servicio de impresión 3D de alta calidad.',
    city: 'Santiago',
    scope: 'NACIONAL',
    revenue: '150000',
    avatarUrl: getAvatarUrl('Oscar Zambrano'),
    companyLogoUrl: getLogoUrl('Chile Impresiones 3D'),
    coverUrl: getCoverUrl('Tecnología'),
    status: 'active',
    followers: 800,
    firstLogin: false,
    password: UNIVERSAL_PASSWORD,
    surveyCompleted: false,
    tribeAssigned: true
  }
];

// ===============================================
// FUNCIONES DE AUTENTICACIÓN Y GESTIÓN
// ===============================================

// Cargar usuarios reales en localStorage
export const loadRealUsers = (): void => {
  const existingUsers = JSON.parse(localStorage.getItem('tribu_users') || '[]');

  // Verificar si ya hay usuarios reales cargados
  const realEmails = REAL_USERS.map(u => u.email.toLowerCase());
  const existingRealUsers = existingUsers.filter((u: UserProfile) =>
    realEmails.includes(u.email.toLowerCase())
  );

  if (existingRealUsers.length >= REAL_USERS.length) {
    console.log('✅ Usuarios reales ya cargados');
    return;
  }

  // Limpiar usuarios anteriores y cargar los nuevos
  const usersWithIds: (UserProfile & { firstLogin: boolean })[] = REAL_USERS.map((user, index) => ({
    ...user,
    id: `real_user_${index + 1}`,
    createdAt: new Date().toISOString(),
    password: UNIVERSAL_PASSWORD,
    surveyCompleted: true, // Ya tienen datos, no necesitan encuesta
    tribeAssigned: true,
    // Actualizar avatarUrl con foto real de Instagram si existe
    avatarUrl: getAvatarUrl(user.name, user.instagram)
  }));

  localStorage.setItem('tribu_users', JSON.stringify(usersWithIds));
  console.log(`✅ ${REAL_USERS.length} usuarios REALES cargados con avatares de Instagram`);
};

// Obtener usuario por email (primero localStorage, luego Firebase)
export const getUserByEmail = (email: string): (UserProfile & { firstLogin?: boolean }) | null => {
  const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
  return users.find((u: UserProfile) => u.email.toLowerCase() === email.toLowerCase()) || null;
};

// NUEVA: Obtener usuario desde Firebase y sincronizar a localStorage
export const getUserFromFirebaseByEmail = async (email: string): Promise<(UserProfile & { firstLogin?: boolean }) | null> => {
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const db = getFirestoreInstance();

    if (!db) return null;

    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const userData = querySnapshot.docs[0].data();
    const userId = querySnapshot.docs[0].id;

    // Convertir datos de Firebase a formato UserProfile
    const userProfile: UserProfile & { firstLogin?: boolean; password?: string } = {
      id: userId,
      email: userData.email || email,
      name: userData.name || '',
      companyName: userData.companyName || '',
      instagram: userData.instagram || '',
      phone: userData.phone || '',
      whatsapp: userData.whatsapp || userData.phone || '',
      category: userData.category || 'General',
      affinity: userData.affinity || userData.subCategory || userData.category || 'Emprendimiento',
      bio: userData.bio || '',
      businessDescription: userData.businessDescription || '',
      city: userData.city || userData.location || 'Chile',
      avatarUrl: userData.avatarUrl || '',
      companyLogoUrl: userData.companyLogoUrl || '',
      coverUrl: userData.coverUrl || '',
      status: userData.status || 'active',
      followers: userData.followers || 0,
      createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      surveyCompleted: userData.surveyCompleted ?? true,
      tribeAssigned: userData.tribeAssigned ?? false,
      // Campos de matching
      scope: userData.scope || 'NACIONAL',
      comuna: userData.comuna || null,
      selectedRegions: userData.selectedRegions || [],
      revenue: userData.revenue || '',
      // Campos adicionales
      firstLogin: userData.firstLogin ?? false,
      password: userData.password || UNIVERSAL_PASSWORD
    };

    // Sincronizar a localStorage para futuras sesiones
    const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
    const existingIndex = users.findIndex((u: UserProfile) => u.id === userId || u.email.toLowerCase() === email.toLowerCase());

    if (existingIndex >= 0) {
      // Actualizar usuario existente con datos de Firebase (Firebase es la fuente de verdad)
      users[existingIndex] = { ...users[existingIndex], ...userProfile };
    } else {
      // Agregar usuario nuevo
      users.push(userProfile);
    }

    localStorage.setItem('tribu_users', JSON.stringify(users));
    console.log('☁️ Usuario cargado desde Firebase y sincronizado:', email);

    return userProfile;
  } catch (error) {
    console.error('❌ Error cargando usuario desde Firebase:', error);
    return null;
  }
};

// Validar credenciales (contraseña universal TRIBU2026)
export const validateCredentials = (email: string, password: string): (UserProfile & { firstLogin?: boolean }) | null => {
  const user = getUserByEmail(email);
  if (!user) return null;

  // Verificar contraseña universal o la personalizada del usuario
  if (password === UNIVERSAL_PASSWORD || password === (user as UserProfile & { password?: string }).password) {
    return user;
  }

  return null;
};

// Marcar que el usuario ya hizo su primer login
export const markFirstLoginComplete = (userId: string): void => {
  const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
  const index = users.findIndex((u: UserProfile) => u.id === userId);
  if (index !== -1) {
    users[index].firstLogin = false;
    localStorage.setItem('tribu_users', JSON.stringify(users));
  }
};

// Cambiar contraseña del usuario
export const changeUserPassword = (userId: string, newPassword: string): boolean => {
  const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
  const index = users.findIndex((u: UserProfile) => u.id === userId);
  if (index !== -1) {
    users[index].password = newPassword;
    users[index].firstLogin = false;
    localStorage.setItem('tribu_users', JSON.stringify(users));
    return true;
  }
  return false;
};

// ===============================================
// MIGRACIÓN A FIREBASE - EJECUTAR UNA SOLA VEZ
// ===============================================

// Migrar los 108 usuarios base a Firebase (solo si no existen)
export const migrateUsersToFirebase = async (): Promise<{ migrated: number; existing: number }> => {
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { doc, setDoc, getDoc, collection } = await import('firebase/firestore');
    const db = getFirestoreInstance();

    if (!db) {
      console.log('⚠️ Firebase no disponible para migración');
      return { migrated: 0, existing: 0 };
    }

    let migrated = 0;
    let existing = 0;

    for (let i = 0; i < REAL_USERS.length; i++) {
      const user = REAL_USERS[i];
      const id = `real_user_${i + 1}`;

      // Verificar si ya existe
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        existing++;
        continue;
      }

      // Crear documento en Firebase
      const userData = {
        id,
        email: user.email.toLowerCase(),
        name: user.name,
        companyName: user.companyName,
        instagram: user.instagram || '',
        phone: user.phone || '',
        category: user.category || 'General',
        subCategory: user.affinity || user.category || 'Emprendimiento',
        location: user.city || 'Chile',
        bio: user.bio || '',
        businessDescription: user.businessDescription || '',
        avatarUrl: getAvatarUrl(user.name, user.instagram),
        coverUrl: getCoverUrl(user.category || 'default'),
        status: 'active',
        createdAt: new Date().toISOString(),
        source: 'initial_migration',
        password: UNIVERSAL_PASSWORD,
        firstLogin: true
      };

      await setDoc(docRef, userData);
      migrated++;
    }

    // Marcar migración como completa
    localStorage.setItem('tribu_migration_complete', 'true');
    console.log(`✅ Migración completa: ${migrated} nuevos, ${existing} ya existían`);

    return { migrated, existing };
  } catch (error) {
    console.error('❌ Error en migración:', error);
    return { migrated: 0, existing: 0 };
  }
};

// ===============================================
// CARGA DE USUARIOS - FIREBASE ES LA FUENTE DE VERDAD
// ===============================================

const ENABLE_FIRESTORE_USERS = true; // Feature Flag: E2P2 Step 1.3

export const forceReloadRealUsers = async (): Promise<void> => {
  console.log('🔄 Sincronizando usuarios desde Firebase...');

    try {
      const firebaseUsers = await loadUsersFromFirebase();

    // Usar Firebase como única fuente de verdad
      if (firebaseUsers.length > 0) {
      console.log(`✅ ${firebaseUsers.length} usuarios cargados desde Firestore.`);
        localStorage.setItem('tribu_users', JSON.stringify(firebaseUsers));
      } else {
      console.warn('⚠️ No hay usuarios en Firestore. localStorage vacío.');
      localStorage.setItem('tribu_users', JSON.stringify([]));
      }
    } catch (error) {
      console.error('❌ Error leyendo Firestore:', error);
    console.warn('⚠️ No se pudo cargar usuarios. localStorage vacío.');
    localStorage.setItem('tribu_users', JSON.stringify([]));
  }
};

// Cargar usuarios desde Firebase
const loadUsersFromFirebase = async (): Promise<(UserProfile & { password: string; firstLogin: boolean })[]> => {
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { collection, getDocs } = await import('firebase/firestore');
    const db = getFirestoreInstance();

    if (!db) return [];

    const snapshot = await getDocs(collection(db, 'users'));
    if (snapshot.empty) return [];

    const users: (UserProfile & { password: string; firstLogin: boolean })[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        email: data.email || '',
        name: data.name || '',
        companyName: data.companyName || data.name || '',
        instagram: data.instagram || '',
        phone: data.phone || '',
        category: data.category || 'General',
        affinity: data.subCategory || data.category || 'Emprendimiento',
        bio: data.bio || '',
        businessDescription: data.businessDescription || '',
        city: data.location || 'Chile',
        avatarUrl: data.avatarUrl || getAvatarUrl(data.name || '', data.instagram || ''),
        companyLogoUrl: getLogoUrl(data.companyName || ''),
        coverUrl: data.coverUrl || getCoverUrl('default'),
        status: data.status || 'active',
        followers: data.followers || 500,
        password: data.password || UNIVERSAL_PASSWORD,
        firstLogin: data.firstLogin !== false,
        createdAt: data.createdAt || new Date().toISOString(),
        surveyCompleted: true,
        tribeAssigned: true
      });
    });

    return users;
  } catch (error) {
    console.log('⚠️ Error cargando desde Firebase:', error);
    return [];
  }
};

// Sincronizar usuarios desde Firebase (nuevos registros de otros dispositivos)
export const syncUsersFromFirebase = async (): Promise<void> => {
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { collection, getDocs } = await import('firebase/firestore');
    const db = getFirestoreInstance();

    if (!db) {
      console.log('⚠️ Firebase no disponible para sync de usuarios');
      return;
    }

    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    if (snapshot.empty) {
      console.log('📭 No hay usuarios en Firebase');
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('tribu_users') || '[]');
    const existingEmails = existingUsers.map((u: UserProfile) => u.email.toLowerCase());

    let addedCount = 0;

    snapshot.forEach(doc => {
      const firebaseUser = doc.data();
      const email = (firebaseUser.email || '').toLowerCase();

      // Si el usuario no existe localmente, agregarlo
      if (email && !existingEmails.includes(email)) {
        const newUser: UserProfile & { firstLogin: boolean; password: string } = {
          id: doc.id,
          email: email,
          name: firebaseUser.name || firebaseUser.companyName || 'Usuario',
          companyName: firebaseUser.companyName || firebaseUser.name || 'Emprendimiento',
          instagram: firebaseUser.instagram || '',
          phone: firebaseUser.phone || '',
          category: firebaseUser.category || 'General',
          affinity: firebaseUser.subCategory || firebaseUser.category || 'Emprendimiento',
          bio: firebaseUser.bio || '',
          businessDescription: '',
          city: firebaseUser.location || 'Chile',
          avatarUrl: firebaseUser.avatarUrl || getAvatarUrl(firebaseUser.name || '', firebaseUser.instagram || ''),
          companyLogoUrl: getLogoUrl(firebaseUser.companyName || ''),
          coverUrl: firebaseUser.coverUrl || getCoverUrl('default'),
          status: 'active',
          followers: 500,
          firstLogin: false,
          password: UNIVERSAL_PASSWORD,
          createdAt: firebaseUser.createdAt || new Date().toISOString(),
          surveyCompleted: true,
          tribeAssigned: true
        };

        existingUsers.push(newUser);
        existingEmails.push(email);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      localStorage.setItem('tribu_users', JSON.stringify(existingUsers));
      console.log(`☁️ ${addedCount} usuarios sincronizados desde Firebase. Total: ${existingUsers.length}`);
    } else {
      console.log('✅ Usuarios ya sincronizados con Firebase');
    }
  } catch (error) {
    console.log('⚠️ Error sincronizando usuarios desde Firebase:', error);
  }
};

// ===============================================
// REGISTRO DE NUEVOS USUARIOS
// ===============================================

export interface NewUserData {
  email: string;
  name: string;
  companyName: string;
  instagram: string;
  phone: string;
  category?: string;
  affinity?: string;
  password?: string; // Contraseña creada por el usuario
  // Campos de ubicación
  scope?: 'NACIONAL' | 'REGIONAL' | 'LOCAL';
  city?: string;
  comuna?: string;
  selectedRegions?: string[];
  // Campos de perfil completo
  bio?: string;
  businessDescription?: string;
  revenue?: string;
  termsAccepted?: boolean;
  // RRSS opcionales
  website?: string;
  linkedin?: string;
  tiktok?: string;
  // Estado del perfil
  profileComplete?: boolean;
  onboardingComplete?: boolean;
  status?: 'active' | 'inactive' | 'pending';
}

// Verificar si un email ya existe
export const emailExists = (email: string): boolean => {
  const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
  return users.some((u: UserProfile) => u.email.toLowerCase() === email.toLowerCase());
};

// Registrar nuevo usuario
export const registerNewUser = async (userData: NewUserData): Promise<UserProfile | null> => {
  // Verificar si el email ya existe
  if (emailExists(userData.email)) {
    console.log('⚠️ Email ya registrado');
    return null;
  }

  const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
  const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const newUser: UserProfile & { firstLogin: boolean; password: string } = {
    id: newId,
    email: userData.email.toLowerCase(),
    name: userData.name,
    companyName: userData.companyName,
    instagram: userData.instagram.startsWith('@') ? userData.instagram : `@${userData.instagram}`,
    phone: userData.phone,
    category: userData.category || 'General',
    affinity: userData.affinity || userData.category || 'Emprendimiento',
    // Campos de ubicación
    scope: userData.scope || 'NACIONAL',
    city: userData.city || 'Chile',
    comuna: userData.comuna || '',
    selectedRegions: userData.selectedRegions || [],
    // Campos de perfil completo
    bio: userData.bio || '',
    businessDescription: userData.businessDescription || '',
    revenue: userData.revenue || '',
    termsAccepted: userData.termsAccepted || false,
    // RRSS opcionales
    website: userData.website || '',
    linkedin: userData.linkedin || '',
    tiktok: userData.tiktok || '',
    // Visual
    avatarUrl: getAvatarUrl(userData.name, userData.instagram),
    companyLogoUrl: getLogoUrl(userData.companyName),
    coverUrl: getCoverUrl(userData.category || 'default'),
    // Estado
    status: userData.status || 'active',
    profileComplete: userData.profileComplete || false,
    onboardingComplete: userData.onboardingComplete || false,
    followers: 500,
    firstLogin: !userData.password,
    password: userData.password || UNIVERSAL_PASSWORD,
    createdAt: new Date().toISOString(),
    surveyCompleted: true,
    tribeAssigned: true
  };

  users.push(newUser);
  localStorage.setItem('tribu_users', JSON.stringify(users));

  // Sincronizar con Firebase - GUARDAR TODOS LOS DATOS COMPLETOS
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { doc, setDoc } = await import('firebase/firestore');
    const db = getFirestoreInstance();

    if (db) {
      // Guardar usuario completo en Firebase con TODOS los campos
      await setDoc(doc(db, 'users', newUser.id), {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        companyName: newUser.companyName,
        instagram: newUser.instagram,
        phone: newUser.phone,
        category: newUser.category,
        affinity: newUser.affinity,
        subCategory: newUser.affinity,
        // Ubicación
        scope: newUser.scope,
        city: newUser.city,
        location: newUser.city,
        comuna: newUser.comuna,
        selectedRegions: newUser.selectedRegions,
        // Perfil completo
        bio: newUser.bio,
        businessDescription: newUser.businessDescription,
        revenue: newUser.revenue,
        termsAccepted: newUser.termsAccepted,
        // RRSS
        website: newUser.website,
        linkedin: newUser.linkedin,
        tiktok: newUser.tiktok,
        // Visual
        avatarUrl: newUser.avatarUrl,
        coverUrl: newUser.coverUrl,
        // Estado
        status: newUser.status,
        profileComplete: newUser.profileComplete,
        onboardingComplete: newUser.onboardingComplete,
        password: newUser.password,
        createdAt: newUser.createdAt,
        source: 'app_registration'
      });
      console.log('☁️ Nuevo usuario guardado en Firebase:', newUser.email);

      // 📊 Actualizar contador global de perfiles
      const { getDoc, updateDoc, increment } = await import('firebase/firestore');
      const statsRef = doc(db, 'system_stats', 'global');
      const statsDoc = await getDoc(statsRef);
      
      if (statsDoc.exists()) {
        // ✅ Solo incrementar profilesCompleted si el perfil está completo
        const updateData: any = {
          membersActive: increment(1)
        };
        
        if (newUser.profileComplete === true) {
          updateData.profilesCompleted = increment(1);
          console.log('📊 Contador de perfiles completos actualizado (+1)');
        } else {
          console.log('📊 Usuario registrado pero perfil incompleto, contador no incrementado');
        }
        
        await updateDoc(statsRef, updateData);
        console.log('📊 Contador de miembros activos actualizado (+1)');
      } else {
        // Crear documento si no existe
        await setDoc(statsRef, {
          profilesCompleted: newUser.profileComplete === true ? 1 : 0,
          membersActive: 1,
          profilesTarget: 1000
        });
        console.log('📊 Documento system_stats creado');
      }
    }
  } catch (error) {
    console.log('⚠️ Error sincronizando con Firebase:', error);
  }

  console.log(`✅ Nuevo usuario registrado: ${userData.email}`);
  return newUser;
};

// Obtener total de usuarios
export const getTotalUsersCount = (): number => {
  const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
  return users.length;
};

// ===============================================
// GESTIÓN DE USUARIOS - CRUD COMPLETO
// ===============================================

// Dar de baja un usuario (eliminar de Firebase y localStorage)
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // Eliminar de localStorage
    const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
    const filteredUsers = users.filter((u: UserProfile) => u.id !== userId);
    localStorage.setItem('tribu_users', JSON.stringify(filteredUsers));

    // Eliminar de Firebase
    const { getFirestoreInstance } = await import('./firebaseService');
    const { doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestoreInstance();

    if (db) {
      await deleteDoc(doc(db, 'users', userId));
      console.log(`🗑️ Usuario ${userId} eliminado de Firebase`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error eliminando usuario:', error);
    return false;
  }
};

// Eliminar todos los perfiles incompletos del sistema
export const cleanupIncompleteProfiles = async (): Promise<{ deleted: number; errors: string[] }> => {
  try {
    const { validateUserProfile } = await import('../utils/validation');
    const users = JSON.parse(localStorage.getItem('tribu_users') || '[]') as UserProfile[];
    
    let deletedCount = 0;
    const errors: string[] = [];
    
    console.log('🧹 Iniciando limpieza de perfiles incompletos...');
    
    for (const user of users) {
      const validation = validateUserProfile(user);
      
      // Si el perfil está incompleto, eliminarlo
      if (!validation.isComplete) {
        console.log(`🗑️ Eliminando perfil incompleto: ${user.email} (${user.name})`);
        console.log(`   Campos faltantes: ${validation.missingFields.join(', ')}`);
        
        const success = await deleteUser(user.id);
        if (success) {
          deletedCount++;
        } else {
          errors.push(`Error eliminando ${user.email}`);
        }
      }
    }
    
    console.log(`✅ Limpieza completada: ${deletedCount} perfiles eliminados`);
    
    return { deleted: deletedCount, errors };
  } catch (error) {
    console.error('Error en limpieza de perfiles:', error);
    return { deleted: 0, errors: [String(error)] };
  }
};

// Actualizar usuario en Firebase y localStorage
export const updateUserInFirebase = async (userId: string, updates: Partial<UserProfile>): Promise<boolean> => {
  try {
    // Actualizar localStorage
    const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
    const index = users.findIndex((u: UserProfile) => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem('tribu_users', JSON.stringify(users));
    }

    // Actualizar Firebase
    const { getFirestoreInstance } = await import('./firebaseService');
    const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    const db = getFirestoreInstance();

    if (db) {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log(`✏️ Usuario ${userId} actualizado en Firebase`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);
    return false;
  }
};

// Cambiar estado de usuario (activo/inactivo/baja)
export const setUserStatus = async (userId: string, status: 'active' | 'inactive' | 'deleted'): Promise<boolean> => {
  return await updateUserInFirebase(userId, { status });
};

// DIAGNÓSTICO: Ver estado de usuarios
export const diagnoseUsers = async (): Promise<{
  local: number;
  firebase: number;
  base: number;
  nuevos: { id: string; email: string; name: string }[];
}> => {
  const localUsers = JSON.parse(localStorage.getItem('tribu_users') || '[]');
  const baseEmails = REAL_USERS.map(u => u.email.toLowerCase());

  // Usuarios nuevos (no están en la base de 108)
  const nuevos = localUsers
    .filter((u: UserProfile) => !baseEmails.includes((u.email || '').toLowerCase()))
    .map((u: UserProfile) => ({ id: u.id, email: u.email, name: u.name }));

  // Contar en Firebase
  let firebaseCount = 0;
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { collection, getDocs } = await import('firebase/firestore');
    const db = getFirestoreInstance();
    if (db) {
      const snapshot = await getDocs(collection(db, 'users'));
      firebaseCount = snapshot.size;
    }
  } catch (e) {
    console.log('Error contando Firebase:', e);
  }

  const result = {
    local: localUsers.length,
    firebase: firebaseCount,
    base: REAL_USERS.length,
    nuevos
  };

  console.log('📊 DIAGNÓSTICO USUARIOS:');
  console.log(`   Base hardcodeados: ${result.base}`);
  console.log(`   En localStorage: ${result.local}`);
  console.log(`   En Firebase: ${result.firebase}`);
  console.log(`   Nuevos registrados: ${result.nuevos.length}`);
  console.log('   Lista nuevos:', result.nuevos);

  return result;
};

export default REAL_USERS;
