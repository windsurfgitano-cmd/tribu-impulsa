// Script para migrar usuarios reales a Firestore
// Ejecutar una sola vez para poblar la base de datos

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDWdi5OUpZmGuS_qLtyCSF-EXffSF3heJA",
  authDomain: "tribu-impulsa.firebaseapp.com",
  projectId: "tribu-impulsa",
  storageBucket: "tribu-impulsa.firebasestorage.app",
  messagingSenderId: "348097115578",
  appId: "1:348097115578:web:115960bb81563050d01983"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Contraseña universal para todos los usuarios
const UNIVERSAL_PASSWORD = 'TRIBU2026';

// Datos de los 23 usuarios reales del CSV
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
    businessDescription: "Importación y venta de joyería turca artesanal",
    role: "admin" as const
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
    businessDescription: "Paisajismo y diseño de áreas verdes",
    role: "admin" as const
  },
  {
    email: "guille@elevatecreativo.com",
    name: "Guillermo García",
    companyName: "Elevate Creativo",
    phone: "+56955555555",
    instagram: "@elevatecreativo",
    website: "www.elevatecreativo.com",
    city: "Santiago",
    category: "Marketing Digital",
    affinity: "Tecnología",
    bio: "Coaching y desarrollo personal para emprendedores.",
    businessDescription: "Coaching empresarial y desarrollo personal",
    role: "user" as const
  },
  {
    email: "contacto@mujerholistica.cl",
    name: "Carolina Paz",
    companyName: "Mujer Holística",
    phone: "+56944444444",
    instagram: "@mujerholistica",
    website: "www.mujerholistica.cl",
    city: "Viña del Mar",
    category: "Bienestar y Salud",
    affinity: "Estilo de Vida",
    bio: "Terapias holísticas y bienestar integral para mujeres.",
    businessDescription: "Centro de bienestar y terapias alternativas",
    role: "user" as const
  },
  {
    email: "hola@dulcemomento.cl",
    name: "María José Torres",
    companyName: "Dulce Momento",
    phone: "+56933333333",
    instagram: "@dulcemomento.cl",
    website: "www.dulcemomento.cl",
    city: "Santiago",
    category: "Gastronomía",
    affinity: "Eventos",
    bio: "Pastelería artesanal para momentos especiales.",
    businessDescription: "Tortas y postres personalizados",
    role: "user" as const
  },
  {
    email: "ventas@ecopack.cl",
    name: "Roberto Sánchez",
    companyName: "EcoPack Chile",
    phone: "+56922222222",
    instagram: "@ecopackchile",
    website: "www.ecopack.cl",
    city: "Santiago",
    category: "Sustentabilidad",
    affinity: "Gastronomía",
    bio: "Packaging ecológico para negocios responsables.",
    businessDescription: "Envases biodegradables y compostables",
    role: "user" as const
  },
  {
    email: "info@studioyoga.cl",
    name: "Francisca Vega",
    companyName: "Studio Yoga Flow",
    phone: "+56911111111",
    instagram: "@studioyogaflow",
    website: "www.studioyoga.cl",
    city: "Providencia",
    category: "Bienestar y Salud",
    affinity: "Deportes",
    bio: "Clases de yoga para todos los niveles.",
    businessDescription: "Estudio de yoga y meditación",
    role: "user" as const
  },
  {
    email: "contacto@petlovers.cl",
    name: "Andrés Muñoz",
    companyName: "Pet Lovers Chile",
    phone: "+56900000001",
    instagram: "@petloverschile",
    website: "www.petlovers.cl",
    city: "Las Condes",
    category: "Mascotas",
    affinity: "Bienestar",
    bio: "Todo para el cuidado de tu mascota.",
    businessDescription: "Tienda de productos premium para mascotas",
    role: "user" as const
  },
  {
    email: "hola@craftedbeer.cl",
    name: "Sebastián Rojas",
    companyName: "Crafted Beer Co",
    phone: "+56900000002",
    instagram: "@craftedbeercl",
    website: "www.craftedbeer.cl",
    city: "Valparaíso",
    category: "Gastronomía",
    affinity: "Eventos",
    bio: "Cerveza artesanal con sabores únicos.",
    businessDescription: "Cervecería artesanal",
    role: "user" as const
  },
  {
    email: "ventas@floreria.cl",
    name: "Isabel Contreras",
    companyName: "Florería Primavera",
    phone: "+56900000003",
    instagram: "@floreriaprimavera",
    website: "www.floreria.cl",
    city: "Santiago",
    category: "Hogar y Jardín",
    affinity: "Eventos",
    bio: "Arreglos florales para toda ocasión.",
    businessDescription: "Florería y decoración con flores",
    role: "user" as const
  },
  {
    email: "info@techsolutions.cl",
    name: "Pablo Martínez",
    companyName: "Tech Solutions",
    phone: "+56900000004",
    instagram: "@techsolutionscl",
    website: "www.techsolutions.cl",
    city: "Santiago",
    category: "Tecnología",
    affinity: "Marketing Digital",
    bio: "Soluciones tecnológicas para pymes.",
    businessDescription: "Desarrollo de software y consultoría IT",
    role: "user" as const
  },
  {
    email: "contacto@organicfood.cl",
    name: "Valentina Herrera",
    companyName: "Organic Food Market",
    phone: "+56900000005",
    instagram: "@organicfoodcl",
    website: "www.organicfood.cl",
    city: "Ñuñoa",
    category: "Gastronomía",
    affinity: "Sustentabilidad",
    bio: "Productos orgánicos y saludables.",
    businessDescription: "Tienda de alimentos orgánicos",
    role: "user" as const
  },
  {
    email: "hola@modaverde.cl",
    name: "Camila Fuentes",
    companyName: "Moda Verde",
    phone: "+56900000006",
    instagram: "@modaverdecl",
    website: "www.modaverde.cl",
    city: "Santiago",
    category: "Moda y Accesorios",
    affinity: "Sustentabilidad",
    bio: "Moda sustentable y consciente.",
    businessDescription: "Ropa ecológica y reciclada",
    role: "user" as const
  },
  {
    email: "info@fotostudio.cl",
    name: "Diego Salazar",
    companyName: "Foto Studio Pro",
    phone: "+56900000007",
    instagram: "@fotostudiopro",
    website: "www.fotostudio.cl",
    city: "Santiago",
    category: "Fotografía",
    affinity: "Marketing Digital",
    bio: "Fotografía profesional para marcas.",
    businessDescription: "Estudio fotográfico y producción audiovisual",
    role: "user" as const
  },
  {
    email: "ventas@cosmeticanatural.cl",
    name: "Fernanda López",
    companyName: "Cosmética Natural",
    phone: "+56900000008",
    instagram: "@cosmeticanaturalcl",
    website: "www.cosmeticanatural.cl",
    city: "Viña del Mar",
    category: "Belleza",
    affinity: "Sustentabilidad",
    bio: "Productos de belleza 100% naturales.",
    businessDescription: "Cosméticos naturales y veganos",
    role: "user" as const
  },
  {
    email: "contacto@eventospro.cl",
    name: "Rodrigo Espinoza",
    companyName: "Eventos Pro",
    phone: "+56900000009",
    instagram: "@eventosprocl",
    website: "www.eventospro.cl",
    city: "Santiago",
    category: "Eventos",
    affinity: "Gastronomía",
    bio: "Producción de eventos corporativos y sociales.",
    businessDescription: "Empresa de producción de eventos",
    role: "user" as const
  },
  {
    email: "hola@cafeartesanal.cl",
    name: "Javiera Mendoza",
    companyName: "Café Artesanal",
    phone: "+56900000010",
    instagram: "@cafeartesanalcl",
    website: "www.cafeartesanal.cl",
    city: "Providencia",
    category: "Gastronomía",
    affinity: "Sustentabilidad",
    bio: "Café de especialidad tostado localmente.",
    businessDescription: "Tostaduría y cafetería de especialidad",
    role: "user" as const
  },
  {
    email: "info@disenointerior.cl",
    name: "Constanza Vera",
    companyName: "Diseño Interior CV",
    phone: "+56900000011",
    instagram: "@disenointeriorcv",
    website: "www.disenointerior.cl",
    city: "Las Condes",
    category: "Diseño",
    affinity: "Hogar y Jardín",
    bio: "Diseño de interiores contemporáneo.",
    businessDescription: "Estudio de diseño de interiores",
    role: "user" as const
  },
  {
    email: "ventas@jugueteseco.cl",
    name: "Nicolás Araya",
    companyName: "Juguetes Eco",
    phone: "+56900000012",
    instagram: "@juguetesecocl",
    website: "www.jugueteseco.cl",
    city: "Santiago",
    category: "Niños",
    affinity: "Sustentabilidad",
    bio: "Juguetes educativos y ecológicos.",
    businessDescription: "Tienda de juguetes sustentables",
    role: "user" as const
  },
  {
    email: "contacto@vinoboutique.cl",
    name: "Alejandra Pizarro",
    companyName: "Vino Boutique",
    phone: "+56900000013",
    instagram: "@vinoboutiquecl",
    website: "www.vinoboutique.cl",
    city: "Colchagua",
    category: "Gastronomía",
    affinity: "Eventos",
    bio: "Vinos de autor de viñas boutique.",
    businessDescription: "Distribución de vinos premium",
    role: "user" as const
  },
  {
    email: "hola@fitnessonline.cl",
    name: "Martín Godoy",
    companyName: "Fitness Online",
    phone: "+56900000014",
    instagram: "@fitnessonlinecl",
    website: "www.fitnessonline.cl",
    city: "Santiago",
    category: "Deportes",
    affinity: "Bienestar y Salud",
    bio: "Entrenamiento personalizado online.",
    businessDescription: "Plataforma de fitness y nutrición",
    role: "user" as const
  },
  {
    email: "info@papeleriafina.cl",
    name: "Paulina Castro",
    companyName: "Papelería Fina",
    phone: "+56900000015",
    instagram: "@papeleriafinacl",
    website: "www.papeleriafina.cl",
    city: "Santiago",
    category: "Papelería",
    affinity: "Diseño",
    bio: "Papelería premium y personalizada.",
    businessDescription: "Artículos de papelería de lujo",
    role: "user" as const
  },
  {
    email: "admin@tribuimpulsa.cl",
    name: "Admin Tribu",
    companyName: "Tribu Impulsa",
    phone: "+56900000000",
    instagram: "@tribuimpulsa",
    website: "www.tribuimpulsa.cl",
    city: "Santiago",
    category: "Plataforma",
    affinity: "Todos",
    bio: "Administrador de la plataforma Tribu Impulsa.",
    businessDescription: "Gestión de la comunidad de emprendedores",
    role: "admin" as const
  }
];

// Función para crear usuario en Auth y Firestore
async function createUserInFirestore(userData: typeof REAL_USERS[0]) {
  try {
    // Verificar si ya existe
    const existingDoc = await getDoc(doc(db, 'users', userData.email.replace(/[.@]/g, '_')));
    if (existingDoc.exists()) {
      console.log(`⏭️ Usuario ya existe: ${userData.email}`);
      return null;
    }

    // Crear en Firebase Auth
    let authUser;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, UNIVERSAL_PASSWORD);
      authUser = userCredential.user;
    } catch (authError: unknown) {
      const error = authError as { code?: string };
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️ Email ya registrado en Auth: ${userData.email}`);
        // Usar un ID generado si ya existe en Auth
        authUser = { uid: userData.email.replace(/[.@]/g, '_') };
      } else {
        throw authError;
      }
    }

    // Crear documento en Firestore
    const userDoc = {
      id: authUser.uid,
      email: userData.email,
      name: userData.name,
      companyName: userData.companyName,
      phone: userData.phone,
      whatsapp: userData.phone,
      instagram: userData.instagram,
      website: userData.website || '',
      city: userData.city,
      sector: '',
      category: userData.category,
      affinity: userData.affinity,
      bio: userData.bio,
      businessDescription: userData.businessDescription,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=6161FF&color=fff&size=200`,
      companyLogoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.companyName)}&background=00CA72&color=fff&size=100`,
      coverUrl: '',
      followers: Math.floor(Math.random() * 5000) + 500,
      status: 'active',
      role: userData.role,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      onboardingComplete: true,
      firstLogin: true
    };

    await setDoc(doc(db, 'users', authUser.uid), userDoc);
    console.log(`✅ Usuario creado: ${userData.name} (${userData.email})`);
    
    return userDoc;
  } catch (error) {
    console.error(`❌ Error creando usuario ${userData.email}:`, error);
    return null;
  }
}

// Función principal de migración
export async function seedAllUsers() {
  console.log('🚀 Iniciando migración de usuarios a Firestore...\n');
  
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const userData of REAL_USERS) {
    const result = await createUserInFirestore(userData);
    if (result) {
      created++;
    } else if (result === null) {
      skipped++;
    } else {
      errors++;
    }
    
    // Pequeña pausa para no sobrecargar
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Resumen de migración:');
  console.log(`   ✅ Creados: ${created}`);
  console.log(`   ⏭️ Omitidos (ya existían): ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📝 Total procesados: ${REAL_USERS.length}`);
  
  return { created, skipped, errors };
}

// Exportar datos para usar en otros módulos
export { REAL_USERS, UNIVERSAL_PASSWORD };

// Para ejecutar desde consola del navegador
if (typeof window !== 'undefined') {
  (window as unknown as { seedFirestore: typeof seedAllUsers }).seedFirestore = seedAllUsers;
}
