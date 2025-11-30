// Seed Data - Usuarios reales para Tribu Impulsa
// Basado en emprendedores chilenos reales

import { UserProfile } from './databaseService';

export const SEED_USERS: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'surveyCompleted' | 'tribeAssigned'>[] = [
  {
    name: "Carolina Mendoza",
    email: "carolina@ecobeauty.cl",
    phone: "+56912345001",
    companyName: "EcoBeauty Chile",
    city: "Santiago",
    sector: "Providencia",
    instagram: "@ecobeautychile",
    facebook: "ecobeautychile",
    website: "www.ecobeauty.cl",
    category: "Belleza, Estética y Bienestar Centros de estética o depilación laser Centro de estética",
    affinity: "Bienestar y Salud  Nutrición / alimentación saludable",
    scope: "REGIONAL"
  },
  {
    name: "Felipe Contreras",
    email: "felipe@techsolutions.cl",
    phone: "+56912345002",
    companyName: "TechSolutions SpA",
    city: "Santiago",
    sector: "Las Condes",
    instagram: "@techsolutionscl",
    website: "www.techsolutions.cl",
    category: "Tecnología y Desarrollo Soluciones tecnológicas Desarrollo de softwares y soluciones tecnólogicas",
    affinity: "Digital y Tecnología Negocios digitales",
    scope: "NACIONAL"
  },
  {
    name: "María José Fuentes",
    email: "mariajose@dulcesartesanales.cl",
    phone: "+56912345003",
    companyName: "Dulces Artesanales MJ",
    city: "Valparaíso",
    instagram: "@dulcesmj",
    tiktok: "@dulcesmj",
    category: "Alimentos y Gastronomía Pastelería o repostería Tortas y repostería",
    affinity: "Estilo de Vida y Experiencias Gastronomía",
    scope: "REGIONAL"
  },
  {
    name: "Andrés Villalobos",
    email: "andres@fitcoach.cl",
    phone: "+56912345004",
    companyName: "FitCoach Pro",
    city: "Santiago",
    sector: "Ñuñoa",
    instagram: "@fitcoachpro",
    tiktok: "@fitcoachpro",
    website: "www.fitcoachpro.cl",
    category: "Belleza, Estética y Bienestar Entrenamiento personal o fitness Perosonal Trainners",
    affinity: "Bienestar y Salud  Fitness /wellness / suplementos alimenticios",
    scope: "NACIONAL"
  },
  {
    name: "Constanza Rojas",
    email: "constanza@modacl.cl",
    phone: "+56912345005",
    companyName: "Moda CL",
    city: "Santiago",
    sector: "Vitacura",
    instagram: "@modacl",
    facebook: "modacl",
    website: "www.modacl.cl",
    category: "Moda Mujer Ropa  Todo ropa mujer",
    affinity: "Diseño y Estilo Moda",
    scope: "NACIONAL"
  },
  {
    name: "Diego Sepúlveda",
    email: "diego@fotografiacreativa.cl",
    phone: "+56912345006",
    companyName: "Fotografía Creativa",
    city: "Concepción",
    instagram: "@fotocreativacl",
    website: "www.fotografiacreativa.cl",
    category: "Arte, Diseño y Creatividad Fotografía y video",
    affinity: "Diseño y Estilo Fotografía / cine / teatro",
    scope: "REGIONAL"
  },
  {
    name: "Valentina Torres",
    email: "valentina@nutrilife.cl",
    phone: "+56912345007",
    companyName: "NutriLife Consultoría",
    city: "Santiago",
    sector: "Providencia",
    instagram: "@nutrilifecl",
    category: "Belleza, Estética y Bienestar Nutrición y suplementación",
    affinity: "Bienestar y Salud  Nutrición / alimentación saludable",
    scope: "NACIONAL"
  },
  {
    name: "Sebastián Muñoz",
    email: "sebastian@eventospro.cl",
    phone: "+56912345008",
    companyName: "Eventos Pro Chile",
    city: "Santiago",
    instagram: "@eventosprocl",
    facebook: "eventospro",
    website: "www.eventospro.cl",
    category: "Eventos Producción de eventos y ferias Producción para ferias y eventos",
    affinity: "Estilo de Vida y Experiencias Cultura",
    scope: "NACIONAL"
  },
  {
    name: "Francisca Araya",
    email: "francisca@joyas.cl",
    phone: "+56912345009",
    companyName: "Joyas Artesanales FA",
    city: "La Serena",
    instagram: "@joyasfa",
    tiktok: "@joyasfa",
    category: "Moda Mujer Accesorios Joyas / bijouterie",
    affinity: "Diseño y Estilo Diseño / arte / decoración",
    scope: "NACIONAL"
  },
  {
    name: "Matías González",
    email: "matias@marketingdigital.cl",
    phone: "+56912345010",
    companyName: "MD Marketing Digital",
    city: "Santiago",
    sector: "Las Condes",
    instagram: "@mdmarketingcl",
    website: "www.mdmarketing.cl",
    category: "Arte, Diseño y Creatividad Marketing digital o community management",
    affinity: "Digital y Tecnología Marketing digital / RRSS/ contenido",
    scope: "NACIONAL"
  },
  {
    name: "Camila Herrera",
    email: "camila@yogastudio.cl",
    phone: "+56912345011",
    companyName: "Yoga Studio Zen",
    city: "Viña del Mar",
    instagram: "@yogazencl",
    website: "www.yogastudiozen.cl",
    category: "Belleza, Estética y Bienestar Terapias alternativas (reiki, flores de Bach, etc.) Terapias alternativas (reiki, flores de Bach, etc.)",
    affinity: "Bienestar y Salud  Bienestar emocional / espiritualidad / terapias alternativas",
    scope: "LOCAL"
  },
  {
    name: "Pablo Morales",
    email: "pablo@cafeteria.cl",
    phone: "+56912345012",
    companyName: "Café Morales",
    city: "Santiago",
    sector: "Bellavista",
    instagram: "@cafemorales",
    category: "Alimentos y Gastronomía Restaurante o café",
    affinity: "Estilo de Vida y Experiencias Gastronomía",
    scope: "LOCAL"
  },
  {
    name: "Javiera López",
    email: "javiera@disenointerior.cl",
    phone: "+56912345013",
    companyName: "JL Diseño Interior",
    city: "Santiago",
    sector: "Providencia",
    instagram: "@jldisenocl",
    website: "www.jldisenoint.cl",
    category: "Negocio Artículos de hogar y decoración Decoración y diseño",
    affinity: "Diseño y Estilo Diseño / arte / decoración",
    scope: "REGIONAL"
  },
  {
    name: "Ricardo Soto",
    email: "ricardo@legalconsult.cl",
    phone: "+56912345014",
    companyName: "Legal Consult SpA",
    city: "Santiago",
    instagram: "@legalconsultcl",
    website: "www.legalconsult.cl",
    category: "Servicios Profesionales Abogados Abogados",
    affinity: "Educación y Desarrollo Coaching / mentorías",
    scope: "NACIONAL"
  },
  {
    name: "Daniela Espinoza",
    email: "daniela@petshop.cl",
    phone: "+56912345015",
    companyName: "Happy Pets Store",
    city: "Santiago",
    sector: "Ñuñoa",
    instagram: "@happypetscl",
    tiktok: "@happypetscl",
    category: "Mascotas y Animales Accesorios para mascotas Accesorios para mascotas",
    affinity: "Estilo de Vida y Experiencias Mascotas / pet friendly",
    scope: "REGIONAL"
  },
  {
    name: "Nicolás Fernández",
    email: "nicolas@carpinteria.cl",
    phone: "+56912345016",
    companyName: "Carpintería Artesanal NF",
    city: "Temuco",
    instagram: "@carpinterianf",
    category: "Oficio Carpintería Carpintero",
    affinity: "Diseño y Estilo Diseño / arte / decoración",
    scope: "REGIONAL"
  },
  {
    name: "Isabel Díaz",
    email: "isabel@coaching.cl",
    phone: "+56912345017",
    companyName: "ID Coaching Empresarial",
    city: "Santiago",
    instagram: "@idcoachingcl",
    website: "www.idcoaching.cl",
    category: "Servicios Profesionales Coaches Coaching",
    affinity: "Educación y Desarrollo Coaching / mentorías",
    scope: "NACIONAL"
  },
  {
    name: "Fernando Valdés",
    email: "fernando@delivery.cl",
    phone: "+56912345018",
    companyName: "Express Delivery Chile",
    city: "Santiago",
    instagram: "@expressdelivcl",
    category: "Transporte y Logística Transporte y delivery Delivery para emprendedores",
    affinity: "Digital y Tecnología Negocios digitales",
    scope: "REGIONAL"
  },
  {
    name: "Catalina Bravo",
    email: "catalina@skincare.cl",
    phone: "+56912345019",
    companyName: "Glow Skincare",
    city: "Santiago",
    sector: "Vitacura",
    instagram: "@glowskincarecl",
    tiktok: "@glowskincare",
    website: "www.glowskincare.cl",
    category: "Moda Mujer Cosmética y perfumería Cosmeticos y skincare",
    affinity: "Bienestar y Salud  Medicina preventiva / longevidad / medicina estética",
    scope: "NACIONAL"
  },
  {
    name: "José Miguel Reyes",
    email: "josemiguel@contadores.cl",
    phone: "+56912345020",
    companyName: "JMR Contadores",
    city: "Santiago",
    instagram: "@jmrcontadores",
    website: "www.jmrcontadores.cl",
    category: "Servicios Profesionales Contadores y auditores Contadores y auditores",
    affinity: "Economía y Negocios Finanzas /",
    scope: "NACIONAL"
  }
];

// Función para cargar los usuarios seed en localStorage
export const loadSeedUsers = (): void => {
  const existingUsers = JSON.parse(localStorage.getItem('tribu_users') || '[]');
  
  // Solo cargar si no hay usuarios
  if (existingUsers.length === 0) {
    const seededUsers = SEED_USERS.map((userData, index) => ({
      ...userData,
      id: `user_seed_${index + 1}`,
      createdAt: new Date(Date.now() - (index * 86400000)).toISOString(), // Días anteriores
      updatedAt: new Date().toISOString(),
      status: 'active' as const,
      surveyCompleted: true,
      tribeAssigned: true
    }));
    
    localStorage.setItem('tribu_users', JSON.stringify(seededUsers));
    console.log(`✅ ${seededUsers.length} usuarios seed cargados`);
  } else {
    console.log(`ℹ️ Ya existen ${existingUsers.length} usuarios en la DB`);
  }
};

// Función para resetear y recargar seed (para desarrollo)
export const resetAndLoadSeed = (): void => {
  localStorage.removeItem('tribu_users');
  localStorage.removeItem('tribu_notifications');
  localStorage.removeItem('tribu_interactions');
  loadSeedUsers();
  console.log('🔄 DB reseteada y seed cargado');
};
