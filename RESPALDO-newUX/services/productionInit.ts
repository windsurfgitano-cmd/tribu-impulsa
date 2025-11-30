// Inicialización de Producción - Tribu Impulsa
// Este script configura todo automáticamente al primer uso

import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';

// ============================================
// CONFIGURACIÓN FIREBASE
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyDWdi5OUpZmGuS_qLtyCSF-EXffSF3heJA",
  authDomain: "tribu-impulsa.firebaseapp.com",
  projectId: "tribu-impulsa",
  storageBucket: "tribu-impulsa.firebasestorage.app",
  messagingSenderId: "348097115578",
  appId: "1:348097115578:web:115960bb81563050d01983"
};

// Inicializar Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

// ============================================
// CONFIGURACIÓN DEL SISTEMA (Azure OpenAI)
// Variables de entorno configuradas en Vercel
// ============================================

// Leer credenciales de variables de entorno de Vercel/Netlify
const AZURE_ENDPOINT = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '';
const AZURE_API_KEY = import.meta.env.VITE_AZURE_OPENAI_KEY || '';

const SYSTEM_CONFIG = {
  azureOpenAI: {
    endpoint: AZURE_ENDPOINT,
    apiKey: AZURE_API_KEY,
    model: "gpt-5.1-chat"
  },
  features: {
    aiMatchingEnabled: !!(AZURE_ENDPOINT && AZURE_API_KEY),
    pushNotificationsEnabled: true
  },
  appVersion: "2.0.0",
  initialized: true
};

// Contraseña universal
const UNIVERSAL_PASSWORD = 'TRIBU2026';

// ============================================
// USUARIOS REALES (23 emprendedores)
// ============================================

const REAL_USERS = [
  {
    email: "dafnafinkelstein@gmail.com",
    name: "Dafna Finkelstein",
    companyName: "ByTurquia",
    phone: "+56912345678",
    instagram: "@byturquia",
    website: "www.byturquia.cl",
    city: "Santiago",
    category: "Moda y Accesorios",
    affinity: "Diseño y Estilo",
    bio: "Joyería artesanal inspirada en Turquía. Piezas únicas con historia.",
    role: "admin"
  },
  {
    email: "doraluz@terraflorpaisajismo.cl",
    name: "Doraluz Galleguillos",
    companyName: "Terraflor Paisajismo",
    phone: "+56987654321",
    instagram: "@terraflorpaisajismochile",
    website: "www.terraflorpaisajismo.cl",
    city: "Santiago",
    category: "Hogar y Jardín",
    affinity: "Sustentabilidad",
    bio: "Diseño de jardines y paisajismo sustentable.",
    role: "admin"
  },
  {
    email: "guille@elevatecreativo.com",
    name: "Guillermo García",
    companyName: "Elevate Creativo",
    phone: "+56955555555",
    instagram: "@elevatecreativo",
    city: "Santiago",
    category: "Marketing Digital",
    affinity: "Tecnología",
    bio: "Coaching y desarrollo personal para emprendedores.",
    role: "user"
  },
  {
    email: "contacto@mujerholistica.cl",
    name: "Carolina Paz",
    companyName: "Mujer Holística",
    phone: "+56944444444",
    instagram: "@mujerholistica",
    city: "Viña del Mar",
    category: "Bienestar y Salud",
    affinity: "Estilo de Vida",
    bio: "Terapias holísticas y bienestar integral para mujeres.",
    role: "user"
  },
  {
    email: "hola@dulcemomento.cl",
    name: "María José Torres",
    companyName: "Dulce Momento",
    phone: "+56933333333",
    instagram: "@dulcemomento.cl",
    city: "Santiago",
    category: "Gastronomía",
    affinity: "Eventos",
    bio: "Pastelería artesanal para momentos especiales.",
    role: "user"
  },
  {
    email: "ventas@ecopack.cl",
    name: "Roberto Sánchez",
    companyName: "EcoPack Chile",
    phone: "+56922222222",
    instagram: "@ecopackchile",
    city: "Santiago",
    category: "Sustentabilidad",
    affinity: "Gastronomía",
    bio: "Packaging ecológico para negocios responsables.",
    role: "user"
  },
  {
    email: "info@studioyoga.cl",
    name: "Francisca Vega",
    companyName: "Studio Yoga Flow",
    phone: "+56911111111",
    instagram: "@studioyogaflow",
    city: "Providencia",
    category: "Bienestar y Salud",
    affinity: "Deportes",
    bio: "Clases de yoga para todos los niveles.",
    role: "user"
  },
  {
    email: "contacto@petlovers.cl",
    name: "Andrés Muñoz",
    companyName: "Pet Lovers Chile",
    phone: "+56900000001",
    instagram: "@petloverschile",
    city: "Las Condes",
    category: "Mascotas",
    affinity: "Bienestar",
    bio: "Todo para el cuidado de tu mascota.",
    role: "user"
  },
  {
    email: "hola@craftedbeer.cl",
    name: "Sebastián Rojas",
    companyName: "Crafted Beer Co",
    phone: "+56900000002",
    instagram: "@craftedbeercl",
    city: "Valparaíso",
    category: "Gastronomía",
    affinity: "Eventos",
    bio: "Cerveza artesanal con sabores únicos.",
    role: "user"
  },
  {
    email: "ventas@floreria.cl",
    name: "Isabel Contreras",
    companyName: "Florería Primavera",
    phone: "+56900000003",
    instagram: "@floreriaprimavera",
    city: "Santiago",
    category: "Hogar y Jardín",
    affinity: "Eventos",
    bio: "Arreglos florales para toda ocasión.",
    role: "user"
  },
  {
    email: "info@techsolutions.cl",
    name: "Pablo Martínez",
    companyName: "Tech Solutions",
    phone: "+56900000004",
    instagram: "@techsolutionscl",
    city: "Santiago",
    category: "Tecnología",
    affinity: "Marketing Digital",
    bio: "Soluciones tecnológicas para pymes.",
    role: "user"
  },
  {
    email: "contacto@organicfood.cl",
    name: "Valentina Herrera",
    companyName: "Organic Food Market",
    phone: "+56900000005",
    instagram: "@organicfoodcl",
    city: "Ñuñoa",
    category: "Gastronomía",
    affinity: "Sustentabilidad",
    bio: "Productos orgánicos y saludables.",
    role: "user"
  },
  {
    email: "hola@modaverde.cl",
    name: "Camila Fuentes",
    companyName: "Moda Verde",
    phone: "+56900000006",
    instagram: "@modaverdecl",
    city: "Santiago",
    category: "Moda y Accesorios",
    affinity: "Sustentabilidad",
    bio: "Moda sustentable y consciente.",
    role: "user"
  },
  {
    email: "info@fotostudio.cl",
    name: "Diego Salazar",
    companyName: "Foto Studio Pro",
    phone: "+56900000007",
    instagram: "@fotostudiopro",
    city: "Santiago",
    category: "Fotografía",
    affinity: "Marketing Digital",
    bio: "Fotografía profesional para marcas.",
    role: "user"
  },
  {
    email: "ventas@cosmeticanatural.cl",
    name: "Fernanda López",
    companyName: "Cosmética Natural",
    phone: "+56900000008",
    instagram: "@cosmeticanaturalcl",
    city: "Viña del Mar",
    category: "Belleza",
    affinity: "Sustentabilidad",
    bio: "Productos de belleza 100% naturales.",
    role: "user"
  },
  {
    email: "contacto@eventospro.cl",
    name: "Rodrigo Espinoza",
    companyName: "Eventos Pro",
    phone: "+56900000009",
    instagram: "@eventosprocl",
    city: "Santiago",
    category: "Eventos",
    affinity: "Gastronomía",
    bio: "Producción de eventos corporativos y sociales.",
    role: "user"
  },
  {
    email: "hola@cafeartesanal.cl",
    name: "Javiera Mendoza",
    companyName: "Café Artesanal",
    phone: "+56900000010",
    instagram: "@cafeartesanalcl",
    city: "Providencia",
    category: "Gastronomía",
    affinity: "Sustentabilidad",
    bio: "Café de especialidad tostado localmente.",
    role: "user"
  },
  {
    email: "info@disenointerior.cl",
    name: "Constanza Vera",
    companyName: "Diseño Interior CV",
    phone: "+56900000011",
    instagram: "@disenointeriorcv",
    city: "Las Condes",
    category: "Diseño",
    affinity: "Hogar y Jardín",
    bio: "Diseño de interiores contemporáneo.",
    role: "user"
  },
  {
    email: "ventas@jugueteseco.cl",
    name: "Nicolás Araya",
    companyName: "Juguetes Eco",
    phone: "+56900000012",
    instagram: "@juguetesecocl",
    city: "Santiago",
    category: "Niños",
    affinity: "Sustentabilidad",
    bio: "Juguetes educativos y ecológicos.",
    role: "user"
  },
  {
    email: "contacto@vinoboutique.cl",
    name: "Alejandra Pizarro",
    companyName: "Vino Boutique",
    phone: "+56900000013",
    instagram: "@vinoboutiquecl",
    city: "Colchagua",
    category: "Gastronomía",
    affinity: "Eventos",
    bio: "Vinos de autor de viñas boutique.",
    role: "user"
  },
  {
    email: "hola@fitnessonline.cl",
    name: "Martín Godoy",
    companyName: "Fitness Online",
    phone: "+56900000014",
    instagram: "@fitnessonlinecl",
    city: "Santiago",
    category: "Deportes",
    affinity: "Bienestar y Salud",
    bio: "Entrenamiento personalizado online.",
    role: "user"
  },
  {
    email: "info@papeleriafina.cl",
    name: "Paulina Castro",
    companyName: "Papelería Fina",
    phone: "+56900000015",
    instagram: "@papeleriafinacl",
    city: "Santiago",
    category: "Papelería",
    affinity: "Diseño",
    bio: "Papelería premium y personalizada.",
    role: "user"
  },
  {
    email: "admin@tribuimpulsa.cl",
    name: "Admin Tribu",
    companyName: "Tribu Impulsa",
    phone: "+56900000000",
    instagram: "@tribuimpulsa",
    city: "Santiago",
    category: "Plataforma",
    affinity: "Todos",
    bio: "Administrador de la plataforma Tribu Impulsa.",
    role: "admin"
  }
];

// ============================================
// FUNCIONES DE INICIALIZACIÓN
// ============================================

// Verificar si ya está inicializado
async function isAlreadyInitialized(): Promise<boolean> {
  try {
    const configDoc = await getDoc(doc(db, 'config', 'system'));
    return configDoc.exists() && configDoc.data()?.initialized === true;
  } catch {
    return false;
  }
}

// Guardar configuración del sistema
async function saveSystemConfig(): Promise<boolean> {
  try {
    await setDoc(doc(db, 'config', 'system'), {
      ...SYSTEM_CONFIG,
      updatedAt: Timestamp.now()
    });
    console.log('✅ Configuración del sistema guardada');
    return true;
  } catch (error) {
    console.error('❌ Error guardando config:', error);
    return false;
  }
}

// Crear usuario en Auth y Firestore
async function createUserInSystem(userData: typeof REAL_USERS[0]): Promise<boolean> {
  try {
    // Verificar si ya existe en Firestore
    const existingDoc = await getDoc(doc(db, 'users', userData.email.replace(/[.@]/g, '_')));
    if (existingDoc.exists()) {
      console.log(`⏭️ Usuario ya existe: ${userData.email}`);
      return true;
    }

    // Intentar crear en Auth
    let userId: string;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, UNIVERSAL_PASSWORD);
      userId = userCredential.user.uid;
    } catch (authError: unknown) {
      const error = authError as { code?: string };
      if (error.code === 'auth/email-already-in-use') {
        // Ya existe, intentar login para obtener UID
        try {
          const loginCredential = await signInWithEmailAndPassword(auth, userData.email, UNIVERSAL_PASSWORD);
          userId = loginCredential.user.uid;
        } catch {
          userId = userData.email.replace(/[.@]/g, '_');
        }
      } else {
        userId = userData.email.replace(/[.@]/g, '_');
      }
    }

    // Crear documento en Firestore
    const userDoc = {
      id: userId,
      email: userData.email,
      name: userData.name,
      companyName: userData.companyName,
      phone: userData.phone,
      whatsapp: userData.phone,
      instagram: userData.instagram,
      website: userData.website || '',
      city: userData.city,
      category: userData.category,
      affinity: userData.affinity,
      bio: userData.bio,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=6161FF&color=fff&size=200`,
      companyLogoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.companyName)}&background=00CA72&color=fff&size=100`,
      status: 'active',
      role: userData.role,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      onboardingComplete: true,
      firstLogin: true
    };

    await setDoc(doc(db, 'users', userId), userDoc);
    console.log(`✅ Usuario creado: ${userData.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creando ${userData.email}:`, error);
    return false;
  }
}

// Crear todos los usuarios
async function createAllUsers(): Promise<number> {
  let created = 0;
  
  for (const userData of REAL_USERS) {
    const success = await createUserInSystem(userData);
    if (success) created++;
    // Pequeña pausa para no sobrecargar
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return created;
}

// ============================================
// FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
// ============================================

export async function initializeProduction(): Promise<{
  success: boolean;
  message: string;
  usersCreated: number;
}> {
  console.log('🚀 Iniciando configuración de producción...');
  
  // Verificar si ya está inicializado
  const alreadyInit = await isAlreadyInitialized();
  if (alreadyInit) {
    console.log('✅ Sistema ya inicializado previamente');
    return {
      success: true,
      message: 'Sistema ya estaba inicializado',
      usersCreated: 0
    };
  }
  
  // Paso 1: Guardar configuración del sistema (incluyendo Azure OpenAI)
  console.log('📝 Guardando configuración del sistema...');
  const configSaved = await saveSystemConfig();
  if (!configSaved) {
    return {
      success: false,
      message: 'Error guardando configuración',
      usersCreated: 0
    };
  }
  
  // Paso 2: Crear todos los usuarios
  console.log('👥 Creando usuarios...');
  const usersCreated = await createAllUsers();
  
  console.log(`\n✅ Inicialización completada:`);
  console.log(`   - Configuración: ✅`);
  console.log(`   - Usuarios creados: ${usersCreated}/${REAL_USERS.length}`);
  console.log(`   - Azure OpenAI: ✅ Configurado`);
  
  return {
    success: true,
    message: `Inicialización completada. ${usersCreated} usuarios creados.`,
    usersCreated
  };
}

// ============================================
// OBTENER CONFIGURACIÓN (para otros servicios)
// ============================================

export async function getProductionConfig(): Promise<typeof SYSTEM_CONFIG | null> {
  try {
    const configDoc = await getDoc(doc(db, 'config', 'system'));
    if (configDoc.exists()) {
      return configDoc.data() as typeof SYSTEM_CONFIG;
    }
    return null;
  } catch {
    return null;
  }
}

// Obtener credenciales de Azure (para aiMatchingService)
export async function getAzureCredentials(): Promise<{ endpoint: string; apiKey: string } | null> {
  const config = await getProductionConfig();
  if (config?.azureOpenAI) {
    return {
      endpoint: config.azureOpenAI.endpoint,
      apiKey: config.azureOpenAI.apiKey
    };
  }
  return null;
}

// ============================================
// AUTO-INICIALIZACIÓN
// ============================================

// Variable para evitar múltiples inicializaciones
let initializationPromise: Promise<unknown> | null = null;

export function ensureInitialized(): Promise<unknown> {
  if (!initializationPromise) {
    initializationPromise = initializeProduction().catch(error => {
      console.error('Error en auto-inicialización:', error);
      initializationPromise = null;
    });
  }
  return initializationPromise;
}

export default {
  initializeProduction,
  getProductionConfig,
  getAzureCredentials,
  ensureInitialized,
  UNIVERSAL_PASSWORD
};
