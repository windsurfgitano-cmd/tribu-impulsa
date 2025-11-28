// USUARIOS REALES de Tribu Impulsa - Importados del CSV oficial
// Este archivo contiene datos REALES de emprendedores chilenos

import { UserProfile } from './databaseService';

// Mapeo de rubros del CSV a categorías legibles
const RUBRO_MAP: Record<number, string> = {
  6: 'Coaching y Bienestar',
  11: 'Eventos y Celebraciones',
  19: 'Arquitectura y Diseño Interior',
  30: 'Joyería y Accesorios',
  35: 'Productos Infantiles',
  38: 'Belleza y Estética',
  40: 'Cosméticos y Skincare',
  41: 'Manicure y Pedicure',
  46: 'Consultoría de Negocios',
  47: 'Construcción y Obras',
  48: 'Marketing Digital',
  52: 'Consultoría Estratégica',
  55: 'Tecnología y Desarrollo',
  74: 'Paisajismo y Jardinería',
  88: 'Pastelería y Repostería',
  115: 'Turismo y Viajes',
  117: 'Salud y Kinesiología'
};

// Mapeo de familia a afinidad
const FAMILIA_MAP: Record<number, string> = {
  1: 'Tradicional/Familiar',
  2: 'Gastronomía',
  3: 'Naturaleza',
  4: 'Moda y Estilo',
  5: 'Bienestar',
  6: 'Negocios',
  7: 'Tecnología',
  8: 'Educación',
  9: 'Hogar y Jardín',
  11: 'Eventos',
  12: 'Viajes',
  13: 'Maternidad'
};

// Generar avatar placeholder basado en nombre
const getAvatarUrl = (name: string): string => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6161FF&color=fff&size=200&bold=true`;
};

// Generar logo placeholder basado en empresa
const getLogoUrl = (companyName: string): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=00CA72&color=fff&size=100&bold=true&format=svg`;
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
    'default': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
  };
  
  for (const [key, url] of Object.entries(covers)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return url;
  }
  return covers.default;
};

// USUARIOS REALES PARSEADOS DEL CSV
export const REAL_USERS: Omit<UserProfile, 'id' | 'createdAt'>[] = [
  {
    email: 'abraham@lofwork.cl',
    name: 'Abraham Lazo',
    companyName: 'Lofwork',
    instagram: '@lofwork',
    phone: '56979982663',
    website: 'https://www.lofwork.cl',
    category: 'Consultoría de Negocios',
    affinity: 'Negocios',
    bio: 'En 4 semanas ordeno tu modelo, foco comercial y números. Detecto fugas de dinero, corrijo precios, acelero ventas.',
    businessDescription: 'Hago que tu negocio pase de caos a crecimiento medible en 4 semanas, con plan claro, ejecución guiada y garantía de resultados.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Abraham Lazo'),
    companyLogoUrl: getLogoUrl('Lofwork'),
    coverUrl: getCoverUrl('Coaching'),
    status: 'active',
    followers: 10000
  },
  {
    email: 'agenciamenfis@gmail.com',
    name: 'Mario Ramirez Arriagada',
    companyName: 'Agencia Menfis',
    instagram: '@agenciamenfis',
    phone: '56985935460',
    website: 'https://agenciamenfis.cl/',
    category: 'Marketing Digital',
    affinity: 'Tecnología',
    bio: 'Páginas web, impresiones, diseño digital, logotipos.',
    businessDescription: 'Menfis es la primera Agencia Boutique de Marketing Digital del sur de Chile. Ofrecemos estrategias personalizadas y diseño exclusivo.',
    city: 'Puerto Montt',
    avatarUrl: getAvatarUrl('Mario Ramirez'),
    companyLogoUrl: getLogoUrl('Menfis'),
    coverUrl: getCoverUrl('Marketing'),
    status: 'active',
    followers: 5000
  },
  {
    email: 'akuschel@dtpingenieria.cl',
    name: 'Alejandra Kuschel',
    companyName: 'Centro Elysia',
    instagram: '@elysia_cl',
    phone: '994513299',
    category: 'Manicure y Pedicure',
    affinity: 'Bienestar',
    bio: 'Servicios de Manicure y Pedicure',
    businessDescription: 'Enfocados en autocuidado y bienestar.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Alejandra Kuschel'),
    companyLogoUrl: getLogoUrl('Centro Elysia'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 500
  },
  {
    email: 'clau7552@gmail.com',
    name: 'Claudia Suárez',
    companyName: 'GroB Pastelería',
    instagram: '@grobpasteleriacl',
    phone: '977918833',
    category: 'Pastelería y Repostería',
    affinity: 'Gastronomía',
    bio: 'Pastelería con productos únicos e innovadores',
    businessDescription: 'En Pastelería GroB creamos productos únicos e innovadores, elaborados con ingredientes de alta calidad y un toque creativo.',
    city: 'Las Condes',
    avatarUrl: getAvatarUrl('Claudia Suárez'),
    companyLogoUrl: getLogoUrl('GroB Pastelería'),
    coverUrl: getCoverUrl('Pastelería'),
    status: 'active',
    followers: 10000
  },
  {
    email: 'contacto@globalkidschile.cl',
    name: 'Daniela Peña Lisperguier',
    companyName: 'Global Kids Chile',
    instagram: '@Global_Kids_Chile',
    phone: '56968592280',
    website: 'http://www.globalkidschile.cl',
    category: 'Productos Infantiles',
    affinity: 'Maternidad',
    bio: 'Tienda colaborativa de productos infantiles',
    businessDescription: 'Tu mundo maternal e infantil en un solo lugar.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Daniela Peña'),
    companyLogoUrl: getLogoUrl('Global Kids'),
    coverUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800',
    status: 'active',
    followers: 5000
  },
  {
    email: 'cristobal.baier@gmail.com',
    name: 'Cristobal Baier',
    companyName: 'BAW Arquitectura',
    instagram: '@baw_arquitectos',
    phone: '56987271997',
    category: 'Arquitectura y Diseño Interior',
    affinity: 'Negocios',
    bio: 'Diseñamos espacios que inspiran y mejoran la vida de las personas',
    businessDescription: 'Unimos arquitectura, interiorismo y estrategia inmobiliaria para crear espacios que trascienden la estética.',
    city: 'Temuco',
    avatarUrl: getAvatarUrl('Cristobal Baier'),
    companyLogoUrl: getLogoUrl('BAW'),
    coverUrl: getCoverUrl('Arquitectura'),
    status: 'active',
    followers: 500
  },
  {
    email: 'cuncoaguasclaras@gmail.com',
    name: 'Waldo Lillo Parra',
    companyName: 'Turismo Aguas Claras',
    instagram: '@Turismo.aguasclaras',
    phone: '56941210352',
    category: 'Turismo y Viajes',
    affinity: 'Viajes',
    bio: 'Agencia de viajes, tour operador y transporte de turistas',
    businessDescription: 'Espacios de salud mental en espacios naturales.',
    city: 'Cunco',
    avatarUrl: getAvatarUrl('Waldo Lillo'),
    companyLogoUrl: getLogoUrl('Aguas Claras'),
    coverUrl: getCoverUrl('Turismo'),
    status: 'active',
    followers: 1000
  },
  {
    email: 'dafnafinkelstein@gmail.com',
    name: 'Dafna Finkelstein',
    companyName: 'By Turquía',
    instagram: '@byturquia',
    phone: '56992767707',
    website: 'https://www.byturquia.com',
    category: 'Joyería y Accesorios',
    affinity: 'Moda y Estilo',
    bio: 'Joyas de plata 925 enchapadas en oro de 18 quilates y piedras semipreciosas',
    businessDescription: 'Joyas pensadas en mujeres fuertes, que pueden tener la joya que se merecen a un precio accesible.',
    city: 'Las Condes',
    avatarUrl: getAvatarUrl('Dafna Finkelstein'),
    companyLogoUrl: getLogoUrl('By Turquía'),
    coverUrl: getCoverUrl('Joyería'),
    status: 'active',
    followers: 10000
  },
  {
    email: 'doraluz@terraflorpaisajismo.cl',
    name: 'Doraluz Galleguillos',
    companyName: 'Terraflor Paisajismo',
    instagram: '@Terraflorpaisajismochile',
    phone: '56976160566',
    website: 'https://www.terraflorpaisajismo.cl',
    category: 'Paisajismo y Jardinería',
    affinity: 'Hogar y Jardín',
    bio: 'Servicios de paisajismo, diseño y construcción de jardines',
    businessDescription: 'En Terraflor embellecemos tus proyectos con paisajismo inteligente y sustentable.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Doraluz Galleguillos'),
    companyLogoUrl: getLogoUrl('Terraflor'),
    coverUrl: getCoverUrl('Paisajismo'),
    status: 'active',
    followers: 5000
  },
  {
    email: 'ergoguillermogarcia@gmail.com',
    name: 'Guillermo García',
    companyName: 'Pausa Coaching',
    instagram: '@pausacoaching',
    phone: '56979777906',
    category: 'Coaching y Bienestar',
    affinity: 'Bienestar',
    bio: 'Coaching para personas o grupos de personas',
    businessDescription: 'Coaching con tiempo de duración definido.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Guillermo García'),
    companyLogoUrl: getLogoUrl('Pausa'),
    coverUrl: getCoverUrl('Coaching'),
    status: 'active',
    followers: 1000
  },
  {
    email: 'erwin.madrid.c@gmail.com',
    name: 'Erwin Madrid',
    companyName: 'Garden Smart',
    instagram: '@garden_smartspa',
    phone: '56962288803',
    category: 'Paisajismo y Jardinería',
    affinity: 'Hogar y Jardín',
    bio: 'Venta y distribución de pasto natural en rollo',
    businessDescription: 'Mezcla especialmente diseñada para resistir alto tráfico y mantener su verdor todo el año.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Erwin Madrid'),
    companyLogoUrl: getLogoUrl('Garden Smart'),
    coverUrl: getCoverUrl('Paisajismo'),
    status: 'active',
    followers: 500
  },
  {
    email: 'franvergaraeventos@gmail.com',
    name: 'María Francisca Vergara',
    companyName: 'Francisca Vergara Eventos',
    instagram: '@Franciscavergaraeventos',
    phone: '56998304686',
    category: 'Eventos y Celebraciones',
    affinity: 'Eventos',
    bio: 'Servicio de calidad e innovador para eventos',
    businessDescription: 'Producción de eventos de alta calidad.',
    city: 'Las Condes',
    avatarUrl: getAvatarUrl('Francisca Vergara'),
    companyLogoUrl: getLogoUrl('FV Eventos'),
    coverUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
    status: 'active',
    followers: 5000
  },
  {
    email: 'ghsilva.henriquez@gmail.com',
    name: 'Hayde Silva',
    companyName: 'Natura Hayde',
    instagram: '@natura_hayde',
    phone: '56985854375',
    website: 'http://www.natura.cl/consultoria/hayde',
    category: 'Cosméticos y Skincare',
    affinity: 'Bienestar',
    bio: 'Productos de Belleza, perfumería y cuidado del cuerpo y rostro',
    businessDescription: 'Productos Natura fabricados con materias primas de la Amazonia Brasilera.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Hayde Silva'),
    companyLogoUrl: getLogoUrl('Natura'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 5000
  },
  {
    email: 'guille@elevatecreativo.com',
    name: 'Guillermo García',
    companyName: 'Elevate Agencia de Marketing',
    instagram: '@elevate.agencia',
    phone: '56979777906',
    website: 'https://elevatecreativo.com',
    category: 'Marketing Digital',
    affinity: 'Negocios',
    bio: 'Agencia de marketing y asesoría comercial',
    businessDescription: 'Aprendemos del negocio del cliente para hacer acciones que realmente impacten las ventas.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Guillermo García E'),
    companyLogoUrl: getLogoUrl('Elevate'),
    coverUrl: getCoverUrl('Marketing'),
    status: 'active',
    followers: 5000
  },
  {
    email: 'klga.aranguiz@gmail.com',
    name: 'Katherine Aránguiz',
    companyName: 'Kinesióloga Katherine',
    instagram: '@Kinekatherinearanguiz',
    phone: '56981298763',
    category: 'Salud y Kinesiología',
    affinity: 'Bienestar',
    bio: 'Kinesiología a domicilio musculoesquelética y quiropraxia',
    businessDescription: 'Rehabilitación personalizada y efectiva en la comodidad del hogar.',
    city: 'Las Condes',
    avatarUrl: getAvatarUrl('Katherine Aránguiz'),
    companyLogoUrl: getLogoUrl('Kine K'),
    coverUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    status: 'active',
    followers: 500
  },
  {
    email: 'leeda.gonzalez@gmail.com',
    name: 'Keeda González Pinczower',
    companyName: 'Fundación Bienestar Financiero',
    instagram: '@f_bienestarfinanciero',
    phone: '934225832',
    website: 'https://www.bienestarfinanciero.org',
    category: 'Educación Financiera',
    affinity: 'Educación',
    bio: 'Transformamos vidas a través de la educación emocional financiera',
    businessDescription: 'Somos la única organización dedicada a cambiar creencias y hábitos relacionados con nuestra relación con el dinero.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Keeda González'),
    companyLogoUrl: getLogoUrl('Bienestar Fin'),
    coverUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    status: 'active',
    followers: 500
  },
  {
    email: 'lperez@demetra.cl',
    name: 'Leonardo Pérez',
    companyName: 'Demetra',
    instagram: '@demetraspa.cl',
    phone: '56976143908',
    website: 'https://www.demetra.cl',
    category: 'Construcción',
    affinity: 'Negocios',
    bio: 'Empresa Constructora',
    businessDescription: 'Ofrecer solución integral en obras en el espacio público.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Leonardo Pérez'),
    companyLogoUrl: getLogoUrl('Demetra'),
    coverUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
    status: 'active',
    followers: 500
  },
  {
    email: 'pablo.gonzalez@madsupport.cl',
    name: 'Pablo Gonzalez',
    companyName: 'Mad Support',
    instagram: '@madsupport',
    phone: '56984590309',
    website: 'https://madsupport.cl',
    category: 'Tecnología y Desarrollo',
    affinity: 'Tecnología',
    bio: 'Desarrollo de apps y Diseño Web',
    businessDescription: 'Enfocado en la experiencia y ser un partner tecnológico.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Pablo Gonzalez'),
    companyLogoUrl: getLogoUrl('Mad Support'),
    coverUrl: getCoverUrl('Tecnología'),
    status: 'active',
    followers: 500
  },
  {
    email: 'palmahidalgof@gmail.com',
    name: 'Fernando Palma',
    companyName: 'Cross Marketing',
    instagram: '@ferr.fit',
    phone: '56931149349',
    category: 'Marketing Digital',
    affinity: 'Negocios',
    bio: 'Marketing Digital para Clínicas Estéticas',
    businessDescription: 'Atraer pacientes que agenden con resultados en el primer mes.',
    city: 'Vitacura',
    avatarUrl: getAvatarUrl('Fernando Palma'),
    companyLogoUrl: getLogoUrl('Cross Marketing'),
    coverUrl: getCoverUrl('Marketing'),
    status: 'active',
    followers: 5000
  },
  {
    email: 'pamelareyesrivera@gmail.com',
    name: 'Pamela Reyes',
    companyName: 'Luna Enfermería Dermoestética',
    instagram: '@luna_enfermeria_dermoestetica',
    phone: '56999309948',
    category: 'Belleza y Estética',
    affinity: 'Bienestar',
    bio: 'Servicio de Dermoestética Integral',
    businessDescription: 'Servicios especializados de dermoestética.',
    city: 'Temuco',
    avatarUrl: getAvatarUrl('Pamela Reyes'),
    companyLogoUrl: getLogoUrl('Luna'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 5000
  },
  {
    email: 'patricio.leguia@midirectoriopyme.cl',
    name: 'Patricio Leguia',
    companyName: 'Mi Directorio PyME',
    instagram: '@midirectoriopyme',
    phone: '56926011422',
    website: 'https://midirectoriopyme.cl/',
    category: 'Consultoría Estratégica',
    affinity: 'Negocios',
    bio: 'Consultoría en Estrategia y Finanzas para PyMEs',
    businessDescription: 'Apoyamos a dueños y socios a lograr mejores resultados financieros.',
    city: 'Colina',
    avatarUrl: getAvatarUrl('Patricio Leguia'),
    companyLogoUrl: getLogoUrl('Mi Dir PyME'),
    coverUrl: getCoverUrl('Coaching'),
    status: 'active',
    followers: 500
  },
  {
    email: 'silvamancilla.camila@gmail.com',
    name: 'Camila Silva Mancilla',
    companyName: 'Paisajismo Locas de Patio',
    instagram: '@paisajismolocasdepatio',
    phone: '963094950',
    category: 'Paisajismo y Jardinería',
    affinity: 'Hogar y Jardín',
    bio: 'Servicio de paisajismo y mantención de jardines',
    businessDescription: 'Paisajismo creativo y mantención profesional.',
    city: 'Temuco',
    avatarUrl: getAvatarUrl('Camila Silva'),
    companyLogoUrl: getLogoUrl('Locas Patio'),
    coverUrl: getCoverUrl('Paisajismo'),
    status: 'active',
    followers: 10000
  },
  {
    email: 'y.alejandramontilla@gmail.com',
    name: 'Alejandra Montilla',
    companyName: 'Bella Vita Estética',
    instagram: '@bella.vitaestetica',
    phone: '56930540146',
    category: 'Belleza y Estética',
    affinity: 'Bienestar',
    bio: 'Clínica boutique de belleza integral en Providencia',
    businessDescription: 'Bella Vita transforma la estética en una experiencia sensorial de bienestar y empoderamiento.',
    city: 'Providencia',
    avatarUrl: getAvatarUrl('Alejandra Montilla'),
    companyLogoUrl: getLogoUrl('Bella Vita'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 10000
  }
];

// Función para cargar usuarios reales en la base de datos
export const loadRealUsers = (): void => {
  const existingUsers = JSON.parse(localStorage.getItem('tribu_users') || '[]');
  
  // Solo cargar si no hay usuarios reales ya cargados
  const realEmails = REAL_USERS.map(u => u.email.toLowerCase());
  const hasRealUsers = existingUsers.some((u: UserProfile) => 
    realEmails.includes(u.email.toLowerCase())
  );
  
  if (hasRealUsers) {
    console.log('✅ Usuarios reales ya cargados');
    return;
  }
  
  // Agregar usuarios reales
  const usersWithIds: UserProfile[] = REAL_USERS.map((user, index) => ({
    ...user,
    id: `real_${Date.now()}_${index}`,
    createdAt: new Date().toISOString(),
    // Password temporal para testing (email sin dominio)
    password: user.email.split('@')[0] + '123'
  }));
  
  const allUsers = [...existingUsers, ...usersWithIds];
  localStorage.setItem('tribu_users', JSON.stringify(allUsers));
  
  console.log(`✅ ${REAL_USERS.length} usuarios REALES cargados en la base de datos`);
};

// Función para resetear y cargar solo usuarios reales (para producción)
export const resetToRealUsers = (): void => {
  const usersWithIds: UserProfile[] = REAL_USERS.map((user, index) => ({
    ...user,
    id: `real_${Date.now()}_${index}`,
    createdAt: new Date().toISOString(),
    password: user.email.split('@')[0] + '123'
  }));
  
  localStorage.setItem('tribu_users', JSON.stringify(usersWithIds));
  localStorage.removeItem('tribu_notifications');
  localStorage.removeItem('tribu_interactions');
  localStorage.removeItem('tribeReportsLog');
  localStorage.removeItem('tribu_reports');
  
  console.log(`🔄 Base de datos reseteada con ${REAL_USERS.length} usuarios REALES`);
};

// Obtener usuario por email (para login)
export const getUserByEmail = (email: string): UserProfile | null => {
  const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
  return users.find((u: UserProfile) => u.email.toLowerCase() === email.toLowerCase()) || null;
};

// Validar credenciales
export const validateCredentials = (email: string, password: string): UserProfile | null => {
  const user = getUserByEmail(email);
  if (!user) return null;
  
  // Para usuarios reales, el password es: [parte antes del @]123
  const expectedPassword = email.split('@')[0] + '123';
  if (password === expectedPassword || password === (user as UserProfile & {password?: string}).password) {
    return user;
  }
  
  return null;
};

export default REAL_USERS;
