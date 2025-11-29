// USUARIOS REALES de Tribu Impulsa - Importados del CSV oficial
// Contraseña universal: TRIBU2026
// Después del primer login se sugiere cambiar contraseña

import { UserProfile } from './databaseService';

// Contraseña universal para todos los usuarios registrados
export const UNIVERSAL_PASSWORD = 'TRIBU2026';

// Generar avatar - Primero intenta usar foto local descargada, sino unavatar.io
// Las fotos locales están en /avatars/{handle}.jpg
const getAvatarUrl = (name: string, instagram?: string): string => {
  if (instagram) {
    const handle = instagram.replace('@', '').trim();
    // Usar foto local descargada (más rápido y confiable)
    // Si no existe, el navegador mostrará error y se puede usar onerror para fallback
    return `/avatars/${handle}.jpg`;
  }
  // Fallback con iniciales para usuarios sin Instagram
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6161FF&color=fff&size=200&bold=true`;
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
// USUARIOS REALES DEL CSV - DATOS COMPLETOS
// ===============================================
export const REAL_USERS: RealUser[] = [
  {
    email: 'abraham@lofwork.cl',
    name: 'Abraham Lazo',
    companyName: 'Lofwork',
    instagram: '@lofwork',
    phone: '+56979982663',
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
    followers: 10000,
    firstLogin: true,
    tiempoEmprendimiento: 'Más de 5 años',
    precioPromedio: '+$500.000',
    generoCliente: 'Mixto',
    rangoEtario: 'Mixto',
    nse: 'C2-C3',
    intereses: 'Emprendimiento',
    horariosRedes: 'Variable',
    frecuenciaInstagram: '3-4 por semana',
    tipoContenido: 'Stories',
    experienciaColab: 'Ocasional',
    objetivos: 'Ventas'
  },
  {
    email: 'agenciamenfis@gmail.com',
    name: 'Mario Ramirez Arriagada',
    companyName: 'Agencia Menfis',
    instagram: '@agenciamenfis',
    phone: '+56985935460',
    website: 'https://agenciamenfis.cl/',
    facebook: 'https://www.facebook.com/AgenciaMenfis',
    tiktok: 'https://www.tiktok.com/@agenciamenfis',
    whatsapp: '+56985935460',
    category: 'Marketing Digital',
    affinity: 'Tecnología',
    bio: 'Páginas web, impresiones, diseño digital, logotipos.',
    businessDescription: 'Menfis es la primera Agencia Boutique de Marketing Digital del sur de Chile. Ofrecemos estrategias personalizadas, diseño exclusivo y acompañamiento cercano.',
    city: 'Puerto Montt',
    avatarUrl: getAvatarUrl('Mario Ramirez'),
    companyLogoUrl: getLogoUrl('Agencia Menfis'),
    coverUrl: getCoverUrl('Marketing'),
    status: 'active',
    followers: 5000,
    firstLogin: true,
    rut: '776615692',
    razonSocial: 'EMPRESAS WEGNER SPA',
    direccion: 'LAS HERAS 827',
    tiempoEmprendimiento: 'Más de 5 años',
    precioPromedio: '$500.000',
    intereses: 'Bienestar, Moda, Gastronomía, Decoración, Tecnología, Familia, Deportes, Viajes, Arte, Emprendimiento, Sustentabilidad, Mascotas',
    horariosRedes: 'Mañana - Tarde',
    frecuenciaInstagram: '1-2 por semana',
    tipoContenido: 'Todos',
    experienciaColab: 'Frecuente',
    objetivos: 'Seguidores, Ventas, Visibilidad, Networking, Colaboraciones'
  },
  {
    email: 'akuschel@dtpingenieria.cl',
    name: 'Alejandra Kuschel',
    companyName: 'Centro Elysia',
    instagram: '@elysia_cl',
    phone: '+56994513299',
    category: 'Manicure y Pedicure',
    affinity: 'Bienestar',
    bio: 'Servicios de Manicure y Pedicure',
    businessDescription: 'Enfocados en autocuidado y bienestar.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Alejandra Kuschel'),
    companyLogoUrl: getLogoUrl('Centro Elysia'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 500,
    firstLogin: true,
    rut: '78098333-7',
    razonSocial: 'Centro Elysia Spa',
    direccion: 'Hochstetter 1002 of 510',
    tiempoEmprendimiento: 'Menos de 6 meses',
    precioPromedio: '$30.000',
    generoCliente: 'Mujeres',
    rangoEtario: '36-45',
    nse: 'C1-C2',
    intereses: 'Bienestar, Tecnología, Familia, Emprendimiento',
    horariosRedes: 'Tarde - Noche',
    frecuenciaInstagram: 'Diario',
    tipoContenido: 'Posts, Stories, Reels, Lives',
    experienciaColab: 'Frecuente',
    objetivos: 'Ventas, Visibilidad, Networking, Colaboraciones'
  },
  {
    email: 'clau7552@gmail.com',
    name: 'Claudia Suárez',
    companyName: 'GroB Pastelería',
    instagram: '@grobpasteleriacl',
    phone: '+56977918833',
    tiktok: 'grobpasteleria',
    category: 'Pastelería y Repostería',
    affinity: 'Gastronomía',
    bio: 'Pastelería con productos únicos e innovadores',
    businessDescription: 'En Pastelería GroB creamos productos únicos e innovadores, elaborados con ingredientes de alta calidad y un toque creativo que no encontrarás en ninguna otra pastelería.',
    city: 'Las Condes',
    avatarUrl: getAvatarUrl('Claudia Suárez'),
    companyLogoUrl: getLogoUrl('GroB Pastelería'),
    coverUrl: getCoverUrl('Pastelería'),
    status: 'active',
    followers: 10000,
    firstLogin: true,
    rut: '12.537.022-5',
    razonSocial: 'Grob Pastelería',
    direccion: 'Luis Matte Larrain 10185, Las Condes',
    tiempoEmprendimiento: '6 meses',
    precioPromedio: '$30.000',
    generoCliente: 'Mixto',
    intereses: 'Gastronomía, Tecnología, Familia, Emprendimiento',
    horariosRedes: 'Tarde',
    frecuenciaInstagram: 'Diario',
    tipoContenido: 'Posts, Stories, Reels',
    experienciaColab: 'Aprender',
    objetivos: 'Ventas, Visibilidad'
  },
  {
    email: 'contacto@globalkidschile.cl',
    name: 'Daniela Peña Lisperguier',
    companyName: 'Global Kids Chile',
    instagram: '@Global_Kids_Chile',
    phone: '+56968592280',
    website: 'http://www.globalkidschile.cl',
    facebook: 'Global Kids Chile',
    category: 'Productos Infantiles',
    affinity: 'Maternidad',
    bio: 'Tienda colaborativa de productos infantiles',
    businessDescription: 'Tu mundo maternal e infantil en un solo lugar.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Daniela Peña'),
    companyLogoUrl: getLogoUrl('Global Kids'),
    coverUrl: getCoverUrl('Infantil'),
    status: 'active',
    followers: 5000,
    firstLogin: true,
    rut: '78246758-1',
    razonSocial: 'Global Kids Chile SpA',
    direccion: 'Los Conquistadores 1640 dpto 303 D',
    tiempoEmprendimiento: '6 meses',
    precioPromedio: '$30.000',
    generoCliente: 'Mujeres',
    rangoEtario: '26-35',
    nse: 'C3-D',
    intereses: 'Familia, Emprendimiento',
    horariosRedes: 'Tarde',
    frecuenciaInstagram: '1-2 por semana',
    tipoContenido: 'Posts, Stories, Reels',
    experienciaColab: 'Ocasional',
    objetivos: 'Visibilidad, Colaboraciones'
  },
  {
    email: 'cristobal.baier@gmail.com',
    name: 'Cristobal Baier',
    companyName: 'BAW Arquitectura',
    instagram: '@baw_arquitectos',
    phone: '+56987271997',
    category: 'Arquitectura y Diseño',
    affinity: 'Negocios',
    bio: 'Diseñamos espacios que inspiran y mejoran la vida de las personas',
    businessDescription: 'Unimos arquitectura, interiorismo y estrategia inmobiliaria para crear espacios que trascienden la estética: proyectos con identidad, equilibrio y alto valor de reventa.',
    city: 'Temuco',
    avatarUrl: getAvatarUrl('Cristobal Baier'),
    companyLogoUrl: getLogoUrl('BAW Arquitectura'),
    coverUrl: getCoverUrl('Arquitectura'),
    status: 'active',
    followers: 500,
    firstLogin: true,
    rut: '9.791.819-8',
    direccion: 'Holandesa 0445 depto 106, Temuco',
    tiempoEmprendimiento: '2 años',
    precioPromedio: '+$500.000',
    generoCliente: 'Mixto',
    rangoEtario: '36-45',
    nse: 'C1-C2',
    intereses: 'Moda, Decoración, Tecnología, Viajes, Arte',
    horariosRedes: 'Tarde - Variable',
    frecuenciaInstagram: '1-2 por semana',
    tipoContenido: 'Todos',
    experienciaColab: 'Aprender',
    objetivos: 'Ventas, Networking'
  },
  {
    email: 'cuncoaguasclaras@gmail.com',
    name: 'Waldo Lillo Parra',
    companyName: 'Turismo Aguas Claras',
    instagram: '@Turismo.aguasclaras',
    phone: '+56941210352',
    facebook: 'turismo aguas claras',
    whatsapp: '+56941210352',
    category: 'Turismo y Viajes',
    affinity: 'Viajes',
    bio: 'Agencia de viajes, tour operador y transporte de turistas',
    businessDescription: 'Espacios de salud mental en espacios naturales.',
    city: 'Cunco',
    avatarUrl: getAvatarUrl('Waldo Lillo'),
    companyLogoUrl: getLogoUrl('Aguas Claras'),
    coverUrl: getCoverUrl('Turismo'),
    status: 'active',
    followers: 1000,
    firstLogin: true,
    rut: '77.262.358-5',
    razonSocial: 'Aguas Claras SpA',
    direccion: 'Llaima 932',
    tiempoEmprendimiento: 'Más de 5 años',
    precioPromedio: '$50.000',
    intereses: 'Bienestar, Gastronomía, Familia, Deportes, Viajes, Arte, Emprendimiento',
    horariosRedes: 'Variable',
    tipoContenido: 'Todos',
    experienciaColab: 'Ocasional',
    objetivos: 'Ventas, Networking, Marketing'
  },
  {
    email: 'dafnafinkelstein@gmail.com',
    name: 'Dafna Finkelstein',
    companyName: 'By Turquía',
    instagram: '@byturquia',
    phone: '+56992767707',
    website: 'https://www.byturquia.com',
    facebook: 'By Turquia',
    whatsapp: '+56992767707',
    category: 'Joyería y Accesorios',
    affinity: 'Moda y Estilo',
    bio: 'Joyas de plata 925 enchapadas en oro de 18 quilates y piedras semipreciosas',
    businessDescription: 'Joyas pensadas en mujeres fuertes, que pueden tener la joya que se merecen a un precio accesible.',
    city: 'Las Condes',
    avatarUrl: getAvatarUrl('Dafna Finkelstein'),
    companyLogoUrl: getLogoUrl('By Turquía'),
    coverUrl: getCoverUrl('Joyería'),
    status: 'active',
    followers: 10000,
    firstLogin: true,
    rut: '76414014-1',
    razonSocial: 'Comercializadora By Turquia SPA',
    direccion: 'Colina del sur 9779 las condes',
    tiempoEmprendimiento: 'Más de 5 años',
    precioPromedio: '$100.000',
    generoCliente: 'Mujeres',
    rangoEtario: '46-55',
    nse: 'C1-C2',
    intereses: 'Bienestar, Moda, Emprendimiento',
    horariosRedes: 'Variable',
    frecuenciaInstagram: 'Diario',
    tipoContenido: 'Posts, Stories, Reels',
    experienciaColab: 'Frecuente',
    objetivos: 'Seguidores, Ventas, Visibilidad, Colaboraciones'
  },
  {
    email: 'doraluz@terraflorpaisajismo.cl',
    name: 'Doraluz Galleguillos',
    companyName: 'Terraflor Paisajismo',
    instagram: '@Terraflorpaisajismochile',
    phone: '+56976160566',
    website: 'https://www.terraflorpaisajismo.cl',
    category: 'Paisajismo y Jardinería',
    affinity: 'Hogar y Jardín',
    bio: 'Servicios de paisajismo, diseño y construcción de jardines y sistemas de riego',
    businessDescription: 'En Terraflor embellecemos tus proyectos con paisajismo inteligente y sustentable, creando entornos vivos que respetan el agua, promueven la biodiversidad y mejoran la calidad de vida.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Doraluz Galleguillos'),
    companyLogoUrl: getLogoUrl('Terraflor'),
    coverUrl: getCoverUrl('Paisajismo'),
    status: 'active',
    followers: 5000,
    firstLogin: true,
    rut: '770480663',
    razonSocial: 'Terra Paisajismo SpA',
    direccion: 'Valle Notro 02777',
    tiempoEmprendimiento: 'Más de 5 años',
    precioPromedio: '+$500.000',
    generoCliente: 'Mixto',
    nse: 'C1-C2',
    intereses: 'Bienestar, Decoración, Emprendimiento, Sustentabilidad',
    horariosRedes: 'Variable',
    frecuenciaInstagram: 'Ocasional',
    tipoContenido: 'Stories, Reels, Lives',
    experienciaColab: 'Ocasional',
    objetivos: 'Ventas, Visibilidad, Networking'
  },
  {
    email: 'ergoguillermogarcia@gmail.com',
    name: 'Guillermo García',
    companyName: 'Pausa Coaching',
    instagram: '@pausacoaching',
    phone: '+56979777906',
    category: 'Coaching y Bienestar',
    affinity: 'Bienestar',
    bio: 'Coaching para personas o grupos de personas',
    businessDescription: 'Coaching con tiempo de duración definido.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Guillermo García'),
    companyLogoUrl: getLogoUrl('Pausa Coaching'),
    coverUrl: getCoverUrl('Coaching'),
    status: 'active',
    followers: 1000,
    firstLogin: true,
    tiempoEmprendimiento: '1 año',
    precioPromedio: '$100.000',
    rangoEtario: '26-35',
    nse: 'C2-C3',
    intereses: 'Bienestar',
    horariosRedes: 'Mañana - Tarde',
    frecuenciaInstagram: 'Ocasional',
    tipoContenido: 'Stories',
    objetivos: 'Ventas'
  },
  {
    email: 'erwin.madrid.c@gmail.com',
    name: 'Erwin Madrid',
    companyName: 'Garden Smart',
    instagram: '@garden_smartspa',
    phone: '+56962288803',
    category: 'Paisajismo y Jardinería',
    affinity: 'Hogar y Jardín',
    bio: 'Venta y distribución de pasto natural en rollo',
    businessDescription: 'Mezcla especialmente diseñada para resistir alto tráfico y mantener su verdor todo el año.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Erwin Madrid'),
    companyLogoUrl: getLogoUrl('Garden Smart'),
    coverUrl: getCoverUrl('Paisajismo'),
    status: 'active',
    followers: 500,
    firstLogin: true,
    tiempoEmprendimiento: '6 meses',
    precioPromedio: '$10.000',
    generoCliente: 'Mixto',
    rangoEtario: '36-45',
    nse: 'C2-C3',
    intereses: 'Bienestar, Gastronomía, Decoración, Familia, Deportes',
    horariosRedes: 'Mañana',
    frecuenciaInstagram: '1-2 por semana',
    tipoContenido: 'Stories',
    experienciaColab: 'Aprender',
    objetivos: 'Ventas, Networking'
  },
  {
    email: 'franvergaraeventos@gmail.com',
    name: 'María Francisca Vergara',
    companyName: 'Francisca Vergara Eventos',
    instagram: '@Franciscavergaraeventos',
    phone: '+56998304686',
    category: 'Eventos y Celebraciones',
    affinity: 'Eventos',
    bio: 'Servicio de calidad e innovador para eventos',
    businessDescription: 'Producción de eventos de alta calidad.',
    city: 'Las Condes',
    avatarUrl: getAvatarUrl('Francisca Vergara'),
    companyLogoUrl: getLogoUrl('FV Eventos'),
    coverUrl: getCoverUrl('Eventos'),
    status: 'active',
    followers: 5000,
    firstLogin: true,
    rut: '15.311.709-8',
    razonSocial: 'FRAN VERGARA EVENTOS',
    direccion: 'MONTECASSINO 924, LAS CONDES',
    tiempoEmprendimiento: 'Más de 5 años',
    precioPromedio: '+$500.000',
    generoCliente: 'Mixto',
    rangoEtario: '46-55',
    nse: 'C1-C2',
    intereses: 'Gastronomía',
    horariosRedes: 'Variable',
    frecuenciaInstagram: '1-2 por semana',
    tipoContenido: 'Posts, Stories, Reels',
    experienciaColab: 'Ocasional',
    objetivos: 'Seguidores, Ventas'
  },
  {
    email: 'ghsilva.henriquez@gmail.com',
    name: 'Hayde Silva',
    companyName: 'Natura Hayde',
    instagram: '@natura_hayde',
    phone: '+56985854375',
    website: 'http://www.natura.cl/consultoria/hayde',
    category: 'Cosméticos y Skincare',
    affinity: 'Bienestar',
    bio: 'Productos de Belleza, perfumería y cuidado del cuerpo y rostro',
    businessDescription: 'Productos Natura fabricados con materias primas de la Amazonia Brasilera, una experiencia de belleza saludable para las personas y el planeta.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Hayde Silva'),
    companyLogoUrl: getLogoUrl('Natura Hayde'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 5000,
    firstLogin: true,
    rut: '16121194-K',
    tiempoEmprendimiento: 'Más de 5 años',
    precioPromedio: '$30.000',
    generoCliente: 'Mujeres',
    rangoEtario: '36-45',
    nse: 'C2-C3',
    intereses: 'Bienestar, Moda, Familia, Emprendimiento, Sustentabilidad',
    frecuenciaInstagram: 'Diario',
    tipoContenido: 'Todos',
    experienciaColab: 'Frecuente',
    objetivos: 'Networking, Colaboraciones'
  },
  {
    email: 'guille@elevatecreativo.com',
    name: 'Guillermo García',
    companyName: 'Elevate Agencia de Marketing',
    instagram: '@elevate.agencia',
    phone: '+56979777906',
    website: 'https://elevatecreativo.com',
    facebook: 'Linkedin',
    category: 'Marketing Digital',
    affinity: 'Negocios',
    bio: 'Agencia de marketing y asesoría comercial',
    businessDescription: 'Aprendemos del negocio del cliente para hacer acciones que realmente impacten las ventas.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Guillermo García E'),
    companyLogoUrl: getLogoUrl('Elevate'),
    coverUrl: getCoverUrl('Marketing'),
    status: 'active',
    followers: 5000,
    firstLogin: true,
    tiempoEmprendimiento: '2 años',
    precioPromedio: '$500.000',
    rangoEtario: '36-45',
    intereses: 'Emprendimiento',
    horariosRedes: 'Mañana',
    frecuenciaInstagram: '1-2 por semana',
    tipoContenido: 'Stories, Reels, Lives',
    experienciaColab: 'Frecuente',
    objetivos: 'Ventas'
  },
  {
    email: 'klga.aranguiz@gmail.com',
    name: 'Katherine Aránguiz',
    companyName: 'Kinesióloga Katherine',
    instagram: '@Kinekatherinearanguiz',
    phone: '+56981298763',
    category: 'Salud y Kinesiología',
    affinity: 'Bienestar',
    bio: 'Kinesiología a domicilio musculoesquelética y quiropraxia',
    businessDescription: 'Rehabilitación personalizada y efectiva en la comodidad del hogar, con enfoque integral para recuperar movilidad, aliviar dolor y mejorar calidad de vida.',
    city: 'Las Condes',
    avatarUrl: getAvatarUrl('Katherine Aránguiz'),
    companyLogoUrl: getLogoUrl('Kine Katherine'),
    coverUrl: getCoverUrl('Salud'),
    status: 'active',
    followers: 500,
    firstLogin: true,
    rut: '16.384.389-7',
    razonSocial: 'Servicios kinesiología independiente',
    direccion: 'Paul Harris Sur 1111, Las Condes',
    tiempoEmprendimiento: 'Menos de 6 meses',
    precioPromedio: '$100.000',
    nse: 'C2-C3',
    intereses: 'Bienestar, Deportes',
    horariosRedes: 'Variable',
    frecuenciaInstagram: 'Ocasional',
    tipoContenido: 'Todos',
    experienciaColab: 'Aprender',
    objetivos: 'Ventas, Networking'
  },
  {
    email: 'leeda.gonzalez@gmail.com',
    name: 'Keeda González Pinczower',
    companyName: 'Fundación Bienestar Financiero',
    instagram: '@f_bienestarfinanciero',
    phone: '+56934225832',
    website: 'https://www.bienestarfinanciero.org',
    tiktok: 'Tik Tok',
    category: 'Educación Financiera',
    affinity: 'Educación',
    bio: 'Transformamos vidas a través de la educación emocional financiera',
    businessDescription: 'Somos la única organización dedicada a cambiar creencias y hábitos relacionados con nuestra relación con el dinero.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Keeda González'),
    companyLogoUrl: getLogoUrl('Bienestar Financiero'),
    coverUrl: getCoverUrl('Finanzas'),
    status: 'active',
    followers: 500,
    firstLogin: true,
    rut: '65258088-2',
    razonSocial: 'FUNDACIÓN PARA LA EDUCACIÓN Y EL BIENESTAR FINANCIERO',
    direccion: 'GRAL CAROL URZUA 7030 EDIF B DP B-205 PS 2',
    tiempoEmprendimiento: 'Menos de 6 meses',
    precioPromedio: '$500.000',
    generoCliente: 'Mujeres',
    rangoEtario: '46-55',
    nse: 'C2-C3',
    intereses: 'Bienestar',
    horariosRedes: 'Tarde - Noche - Variable',
    frecuenciaInstagram: 'Diario',
    tipoContenido: 'Todos',
    experienciaColab: 'Aprender',
    objetivos: 'Seguidores, Ventas, Visibilidad, Networking, Marketing, Colaboraciones'
  },
  {
    email: 'lperez@demetra.cl',
    name: 'Leonardo Pérez',
    companyName: 'Demetra',
    instagram: '@demetraspa.cl',
    phone: '+56976143908',
    website: 'https://www.demetra.cl',
    category: 'Construcción',
    affinity: 'Negocios',
    bio: 'Empresa Constructora',
    businessDescription: 'Solución integral en obras en el espacio público.',
    city: 'Santiago',
    avatarUrl: getAvatarUrl('Leonardo Pérez'),
    companyLogoUrl: getLogoUrl('Demetra'),
    coverUrl: getCoverUrl('Construcción'),
    status: 'active',
    followers: 500,
    firstLogin: true,
    rut: '766129579',
    razonSocial: 'Demetra SpA',
    direccion: 'Los Jardines 976',
    tiempoEmprendimiento: 'Más de 5 años',
    precioPromedio: '+$500.000',
    horariosRedes: 'Variable',
    frecuenciaInstagram: '1-2 por semana',
    tipoContenido: 'Posts, Stories',
    experienciaColab: 'Ocasional',
    objetivos: 'Seguidores, Visibilidad, Networking'
  },
  {
    email: 'pablo.gonzalez@madsupport.cl',
    name: 'Pablo Gonzalez',
    companyName: 'Mad Support',
    instagram: '@madsupport',
    phone: '+56984590309',
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
    followers: 500,
    firstLogin: true,
    tiempoEmprendimiento: '6 meses',
    precioPromedio: '+$500.000',
    intereses: 'Tecnología, Emprendimiento',
    horariosRedes: 'Variable',
    frecuenciaInstagram: 'Ocasional',
    tipoContenido: 'Todos',
    experienciaColab: 'Aprender',
    objetivos: 'Visibilidad, Networking'
  },
  {
    email: 'palmahidalgof@gmail.com',
    name: 'Fernando Palma',
    companyName: 'Cross Marketing',
    instagram: '@ferr.fit',
    phone: '+56931149349',
    whatsapp: '+56931149349',
    category: 'Marketing Digital',
    affinity: 'Negocios',
    bio: 'Marketing Digital para Clínicas Estéticas',
    businessDescription: 'Atraer pacientes que agenden con resultados en el primer mes.',
    city: 'Vitacura',
    avatarUrl: getAvatarUrl('Fernando Palma'),
    companyLogoUrl: getLogoUrl('Cross Marketing'),
    coverUrl: getCoverUrl('Marketing'),
    status: 'active',
    followers: 5000,
    firstLogin: true,
    rut: '78019459-6',
    razonSocial: 'Cross Marketing SpA',
    direccion: 'Av. Presidente Kennedy 5600, Oficina 507, Vitacura',
    tiempoEmprendimiento: 'Menos de 6 meses',
    precioPromedio: '+$500.000',
    generoCliente: 'Mixto',
    rangoEtario: '36-45',
    nse: 'C2-C3',
    intereses: 'Bienestar',
    horariosRedes: 'Tarde',
    frecuenciaInstagram: 'Ocasional',
    tipoContenido: 'Stories, Reels',
    experienciaColab: 'Ocasional',
    objetivos: 'Networking, Colaboraciones'
  },
  {
    email: 'pamelareyesrivera@gmail.com',
    name: 'Pamela Reyes',
    companyName: 'Luna Enfermería Dermoestética',
    instagram: '@luna_enfermeria_dermoestetica',
    phone: '+56999309948',
    tiktok: 'Tik Tok',
    category: 'Belleza y Estética',
    affinity: 'Bienestar',
    bio: 'Servicio de Dermoestética Integral',
    businessDescription: 'Servicios especializados de dermoestética.',
    city: 'Temuco',
    avatarUrl: getAvatarUrl('Pamela Reyes'),
    companyLogoUrl: getLogoUrl('Luna Dermoestética'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 5000,
    firstLogin: true,
    rut: '15.243.405-7',
    razonSocial: 'Pamela Reyes Rivera',
    direccion: 'San Ernesto 990 Depto. 902, Temuco',
    tiempoEmprendimiento: 'Menos de 6 meses',
    precioPromedio: '$30.000',
    generoCliente: 'Mujeres',
    rangoEtario: '36-45',
    nse: 'C2-C3',
    intereses: 'Bienestar',
    horariosRedes: 'Mañana - Tarde - Noche - Variable',
    frecuenciaInstagram: 'Diario',
    tipoContenido: 'Posts, Stories, Reels',
    experienciaColab: 'Ocasional',
    objetivos: 'Ventas, Marketing'
  },
  {
    email: 'patricio.leguia@midirectoriopyme.cl',
    name: 'Patricio Leguia',
    companyName: 'Mi Directorio PyME',
    instagram: '@midirectoriopyme',
    phone: '+56926011422',
    website: 'https://midirectoriopyme.cl/',
    whatsapp: '+56926011422',
    category: 'Consultoría Estratégica',
    affinity: 'Negocios',
    bio: 'Consultoría en Estrategia y Finanzas para PyMEs',
    businessDescription: 'Apoyamos a dueños y socios a lograr mejores resultados financieros con Diagnósticos, Directorios, Tableros de Control y Planes Estratégicos.',
    city: 'Colina',
    avatarUrl: getAvatarUrl('Patricio Leguia'),
    companyLogoUrl: getLogoUrl('Mi Directorio PyME'),
    coverUrl: getCoverUrl('Coaching'),
    status: 'active',
    followers: 500,
    firstLogin: true,
    rut: '77.795.127-0',
    razonSocial: 'Euzkadi SpA',
    direccion: 'Hacienda Chacabuco, parcela F47, Colina',
    tiempoEmprendimiento: '1 año',
    precioPromedio: '+$500.000',
    generoCliente: 'Mixto',
    nse: 'C1-C2',
    intereses: 'Bienestar, Gastronomía, Tecnología, Familia, Deportes, Viajes, Emprendimiento',
    horariosRedes: 'Variable',
    frecuenciaInstagram: '1-2 por semana',
    tipoContenido: 'Stories, Lives',
    experienciaColab: 'Aprender',
    objetivos: 'Seguidores, Ventas, Visibilidad, Networking'
  },
  {
    email: 'silvamancilla.camila@gmail.com',
    name: 'Camila Silva Mancilla',
    companyName: 'Paisajismo Locas de Patio',
    instagram: '@paisajismolocasdepatio',
    phone: '+56963094950',
    category: 'Paisajismo y Jardinería',
    affinity: 'Hogar y Jardín',
    bio: 'Servicio de paisajismo y mantención de jardines',
    businessDescription: 'Paisajismo creativo y mantención profesional.',
    city: 'Temuco',
    avatarUrl: getAvatarUrl('Camila Silva'),
    companyLogoUrl: getLogoUrl('Locas de Patio'),
    coverUrl: getCoverUrl('Paisajismo'),
    status: 'active',
    followers: 10000,
    firstLogin: true,
    rut: '778020823',
    razonSocial: 'Doña Lorenza SpA',
    direccion: 'Av Pablo Neruda 02361 Temuco',
    tiempoEmprendimiento: '2 años',
    precioPromedio: '$10.000',
    generoCliente: 'Mujeres',
    rangoEtario: '36-45',
    nse: 'C1-C2',
    intereses: 'Decoración, Arte, Sustentabilidad',
    horariosRedes: 'Mañana - Tarde - Noche',
    frecuenciaInstagram: 'Diario',
    tipoContenido: 'Posts, Stories, Reels, Lives, Todos',
    experienciaColab: 'Ocasional',
    objetivos: 'Ventas, Visibilidad'
  },
  {
    email: 'y.alejandramontilla@gmail.com',
    name: 'Alejandra Montilla',
    companyName: 'Bella Vita Estética',
    instagram: '@bella.vitaestetica',
    phone: '+56930540146',
    tiktok: 'Bella.vitaestetica',
    whatsapp: '+56930540146',
    category: 'Belleza y Estética',
    affinity: 'Bienestar',
    bio: 'Clínica boutique de belleza integral en Providencia',
    businessDescription: 'Bella Vita transforma la estética en una experiencia sensorial de bienestar y empoderamiento. Combinamos tecnología estética avanzada, atención personalizada y un ambiente elegante.',
    city: 'Providencia',
    avatarUrl: getAvatarUrl('Alejandra Montilla'),
    companyLogoUrl: getLogoUrl('Bella Vita'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 10000,
    firstLogin: true,
    rut: '771667686',
    razonSocial: 'Princess Nails SpA',
    direccion: 'Luis Thayer Ojeda 0180 ofic 1404, Providencia',
    tiempoEmprendimiento: 'Más de 5 años',
    precioPromedio: '$30.000',
    generoCliente: 'Mixto',
    rangoEtario: '26-35',
    nse: 'C2-C3',
    intereses: 'Bienestar, Moda',
    horariosRedes: 'Variable',
    frecuenciaInstagram: '1-2 por semana',
    tipoContenido: 'Todos',
    experienciaColab: 'Ocasional',
    objetivos: 'Ventas, Visibilidad, Networking'
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

// Obtener usuario por email
export const getUserByEmail = (email: string): (UserProfile & { firstLogin?: boolean }) | null => {
  const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
  return users.find((u: UserProfile) => u.email.toLowerCase() === email.toLowerCase()) || null;
};

// Validar credenciales (contraseña universal TRIBU2026)
export const validateCredentials = (email: string, password: string): (UserProfile & { firstLogin?: boolean }) | null => {
  const user = getUserByEmail(email);
  if (!user) return null;
  
  // Verificar contraseña universal o la personalizada del usuario
  if (password === UNIVERSAL_PASSWORD || password === (user as UserProfile & {password?: string}).password) {
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

// Forzar recarga de usuarios reales (útil para debugging)
export const forceReloadRealUsers = (): void => {
  localStorage.removeItem('tribu_users');
  loadRealUsers();
  console.log('🔄 Usuarios reales recargados');
};

export default REAL_USERS;
