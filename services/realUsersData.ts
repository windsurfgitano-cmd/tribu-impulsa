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
  },
  // ===============================================
  // USUARIOS CON DATOS MÍNIMOS (Completarán después)
  // ===============================================
  {
    email: 'afischerb@icloud.com',
    name: 'Aline Fischer',
    companyName: 'Alda Accesorios',
    instagram: '@Aldaaccesorios.cl',
    phone: '+56981615098',
    category: 'Accesorios',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Aline Fischer', '@Aldaaccesorios.cl'),
    companyLogoUrl: getLogoUrl('Alda Accesorios'),
    coverUrl: getCoverUrl('Moda'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'agua.karu@gmail.com',
    name: 'Agua Viko',
    companyName: 'Viko',
    instagram: '@Viko.cl',
    phone: '+56976139832',
    category: 'Bebidas',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Agua Viko', '@Viko.cl'),
    companyLogoUrl: getLogoUrl('Viko'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'akrassnoff@gmail.com',
    name: 'Andrea Krassnoff',
    companyName: 'Aysualix',
    instagram: '@aysualix',
    phone: '+56995400941',
    category: 'General',
    affinity: 'Emprendimiento',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Andrea Krassnoff', '@aysualix'),
    companyLogoUrl: getLogoUrl('Aysualix'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'alekuscheld@gmail.com',
    name: 'Alejandra Kuschel',
    companyName: 'Alekuscheld',
    instagram: '@alekuscheld',
    phone: '+56994513299',
    category: 'General',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Alejandra Kuschel', '@alekuscheld'),
    companyLogoUrl: getLogoUrl('Alekuscheld'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'andrea.schaffer@4everesthetic.cl',
    name: 'Andrea Schäffer',
    companyName: '4Ever Esthetic',
    instagram: '@4everesthetic',
    phone: '+56975188738',
    category: 'Belleza y Estética',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Andrea Schäffer', '@4everesthetic'),
    companyLogoUrl: getLogoUrl('4Ever Esthetic'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'bucalfight01@gmail.com',
    name: 'Omar Melgarejo',
    companyName: 'Bucal Fight',
    instagram: '@bucalfight',
    phone: '+56967441465',
    category: 'Deportes',
    affinity: 'Deportes',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Omar Melgarejo', '@bucalfight'),
    companyLogoUrl: getLogoUrl('Bucal Fight'),
    coverUrl: getCoverUrl('Deportes'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'c.rivera.monasterio@gmail.com',
    name: 'Carla Rivera',
    companyName: 'Creaciones Kapenken',
    instagram: '@creaciones__kapenken',
    phone: '+56962416687',
    category: 'Artesanía',
    affinity: 'Arte',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Carla Rivera', '@creaciones__kapenken'),
    companyLogoUrl: getLogoUrl('Creaciones Kapenken'),
    coverUrl: getCoverUrl('Arte'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'ca.estudiosur@gmail.com',
    name: 'Carolina Aguilera',
    companyName: 'CA Estudio Sur',
    instagram: '@Ca.estudiosur',
    phone: '+56977930959',
    category: 'Diseño',
    affinity: 'Arte',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Carolina Aguilera', '@Ca.estudiosur'),
    companyLogoUrl: getLogoUrl('CA Estudio Sur'),
    coverUrl: getCoverUrl('Arte'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'camilagajardoabogada@gmail.com',
    name: 'Camila Gajardo Alegria',
    companyName: 'Abogada Camila Gajardo',
    instagram: '@abogadacamila_gajardo_alegria',
    phone: '+56944808420',
    category: 'Servicios Legales',
    affinity: 'Negocios',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Camila Gajardo', '@abogadacamila_gajardo_alegria'),
    companyLogoUrl: getLogoUrl('Abogada Camila'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'carmen.melimang@gmail.com',
    name: 'Carmen Gloria Melimán',
    companyName: 'Ps. Carmen Gloria Melimán',
    instagram: '@ps.carmengloriameliman',
    phone: '+56989699411',
    category: 'Psicología',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Carmen Gloria Melimán', '@ps.carmengloriameliman'),
    companyLogoUrl: getLogoUrl('Ps Carmen Gloria'),
    coverUrl: getCoverUrl('Salud'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'carolinaberoiza4@gmail.com',
    name: 'Carolina Beroíza',
    companyName: 'Vanidiosas Cosmética Natural',
    instagram: '@vanidiosas_cosmetica_natural',
    phone: '+56965673002',
    category: 'Cosmética Natural',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Carolina Beroíza', '@vanidiosas_cosmetica_natural'),
    companyLogoUrl: getLogoUrl('Vanidiosas'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'carolinasm_72@hotmail.com',
    name: 'Carolina Subiabre',
    companyName: 'Caro Biogreen Temuco',
    instagram: '@Caro.biogreen.temuco',
    phone: '+56944470382',
    category: 'Productos Naturales',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Temuco',
    avatarUrl: getAvatarUrl('Carolina Subiabre', '@Caro.biogreen.temuco'),
    companyLogoUrl: getLogoUrl('Caro Biogreen'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'cemmendoza37@gmail.com',
    name: 'Carolina Mella',
    companyName: 'Carito Mella Joyas',
    instagram: '@Caritomella.joyas',
    phone: '+56999440613',
    category: 'Joyería',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Carolina Mella', '@Caritomella.joyas'),
    companyLogoUrl: getLogoUrl('Carito Mella Joyas'),
    coverUrl: getCoverUrl('Joyería'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'coni.growthmind@gmail.com',
    name: 'Constanza Aguilar',
    companyName: 'Coni Impulsa',
    instagram: '@coniimpulsaa',
    phone: '+56944335676',
    category: 'Coaching',
    affinity: 'Emprendimiento',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Constanza Aguilar', '@coniimpulsaa'),
    companyLogoUrl: getLogoUrl('Coni Impulsa'),
    coverUrl: getCoverUrl('Coaching'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'contacto.natyschreiber@gmail.com',
    name: 'Natalia Schreiber',
    companyName: 'Naty Schreiber',
    instagram: '@natyschreiber',
    phone: '+56992340299',
    category: 'General',
    affinity: 'Emprendimiento',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Natalia Schreiber', '@natyschreiber'),
    companyLogoUrl: getLogoUrl('Naty Schreiber'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'contacto@infinitaboutique.cl',
    name: 'Paloma Fernandez',
    companyName: 'Infinita Boutique Chile',
    instagram: '@Infinitaboutiquechile',
    phone: '+56978546773',
    category: 'Moda',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Paloma Fernandez', '@Infinitaboutiquechile'),
    companyLogoUrl: getLogoUrl('Infinita Boutique'),
    coverUrl: getCoverUrl('Moda'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'contacto@letslearn.cl',
    name: 'Felipe Mery',
    companyName: 'Lets Learn Chile',
    instagram: '@letslearnchile',
    phone: '+56962108042',
    category: 'Educación',
    affinity: 'Familia',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Felipe Mery', '@letslearnchile'),
    companyLogoUrl: getLogoUrl('Lets Learn'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'contactocafebitte@gmail.com',
    name: 'Javiera Suarez',
    companyName: 'Café Bitte',
    instagram: '@cafe.bitte',
    phone: '+56981782368',
    category: 'Gastronomía',
    affinity: 'Gastronomía',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Javiera Suarez', '@cafe.bitte'),
    companyLogoUrl: getLogoUrl('Café Bitte'),
    coverUrl: getCoverUrl('Gastronomía'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'contreras.andrea@live.com',
    name: 'Andrea Contreras Villagrán',
    companyName: 'Joyas Tu Sueño Dorado',
    instagram: '@joyas_tu_sueno_dorado',
    phone: '+56932656582',
    category: 'Joyería',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Andrea Contreras', '@joyas_tu_sueno_dorado'),
    companyLogoUrl: getLogoUrl('Joyas Tu Sueño'),
    coverUrl: getCoverUrl('Joyería'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'coolfood.temuco@gmail.com',
    name: 'Claudia Suárez',
    companyName: 'Richok',
    instagram: '@richok_cl',
    phone: '+56989223332',
    category: 'Gastronomía',
    affinity: 'Gastronomía',
    bio: '',
    businessDescription: '',
    city: 'Temuco',
    avatarUrl: getAvatarUrl('Claudia Suárez', '@richok_cl'),
    companyLogoUrl: getLogoUrl('Richok'),
    coverUrl: getCoverUrl('Gastronomía'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'creyesm65@gmail.com',
    name: 'Carolina Reyes',
    companyName: 'By Carolina Reyes',
    instagram: '@bycarolinareyescl',
    phone: '+56952248570',
    category: 'Moda',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Carolina Reyes', '@bycarolinareyescl'),
    companyLogoUrl: getLogoUrl('By Carolina Reyes'),
    coverUrl: getCoverUrl('Moda'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'cristobal@vegy.cl',
    name: 'Cristobal Esparza',
    companyName: 'Vegy',
    instagram: '@vegy.cl',
    phone: '+56975281298',
    category: 'Alimentación Saludable',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Cristobal Esparza', '@vegy.cl'),
    companyLogoUrl: getLogoUrl('Vegy'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'cuerosfelis@gmail.com',
    name: 'Paulina Jaramillo Felis',
    companyName: 'Cueros Felis',
    instagram: '@cueros_felis',
    phone: '+56976165151',
    category: 'Moda',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Paulina Jaramillo', '@cueros_felis'),
    companyLogoUrl: getLogoUrl('Cueros Felis'),
    coverUrl: getCoverUrl('Moda'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'danielacorcuera.aguilera@gmail.com',
    name: 'Daniela Corcuera',
    companyName: 'Lecualab',
    instagram: '@Lecualab',
    phone: '+56965917106',
    category: 'General',
    affinity: 'Emprendimiento',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Daniela Corcuera', '@Lecualab'),
    companyLogoUrl: getLogoUrl('Lecualab'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'devachan2025@gmail.com',
    name: 'Alejandra Riquelme',
    companyName: 'Devachan Coffee & Therapy',
    instagram: '@devachan.coffeeandtherapy',
    phone: '+56958750677',
    category: 'Café y Terapia',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Alejandra Riquelme', '@devachan.coffeeandtherapy'),
    companyLogoUrl: getLogoUrl('Devachan'),
    coverUrl: getCoverUrl('Gastronomía'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'dloeffm@gmail.com',
    name: 'Denise Loeff Mirelman',
    companyName: 'By Denise Joyas',
    instagram: '@bydenisejoyas',
    phone: '+56994892370',
    category: 'Joyería',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Denise Loeff', '@bydenisejoyas'),
    companyLogoUrl: getLogoUrl('By Denise Joyas'),
    coverUrl: getCoverUrl('Joyería'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'dolcetrinidadcoffeebreak@gmail.com',
    name: 'Dolce Trinidad',
    companyName: 'Dolce Trinidad Coffee Break',
    instagram: '@dolcetrinidadcoffeebreak',
    phone: '+56942700759',
    category: 'Gastronomía',
    affinity: 'Gastronomía',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Dolce Trinidad', '@dolcetrinidadcoffeebreak'),
    companyLogoUrl: getLogoUrl('Dolce Trinidad'),
    coverUrl: getCoverUrl('Gastronomía'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'dorishuillipanestilista@gmail.com',
    name: 'Doris Huillipan',
    companyName: 'Doris Huillipan Estilista',
    instagram: '@dorishuillipan',
    phone: '+56990515435',
    category: 'Belleza',
    affinity: 'Belleza',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Doris Huillipan', '@dorishuillipan'),
    companyLogoUrl: getLogoUrl('Doris Estilista'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'drapaz.geriatra@gmail.com',
    name: 'Carolina Paz Muñoz',
    companyName: 'Dra. Carolina Paz Geriatra',
    instagram: '@dracarolinapazgeriatra',
    phone: '+56998422165',
    category: 'Salud',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Carolina Paz Muñoz', '@dracarolinapazgeriatra'),
    companyLogoUrl: getLogoUrl('Dra Carolina Paz'),
    coverUrl: getCoverUrl('Salud'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'eme.ventasquijano@gmail.com',
    name: 'Margarita Quijano',
    companyName: 'Margarita Elena Joyería',
    instagram: '@margaritaelena_joyeria',
    phone: '+56997967736',
    category: 'Joyería',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Margarita Quijano', '@margaritaelena_joyeria'),
    companyLogoUrl: getLogoUrl('Margarita Elena'),
    coverUrl: getCoverUrl('Joyería'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'emily.cifuentes.ca@gmail.com',
    name: 'Emily Cifuentes Cantero',
    companyName: 'Accesorios CA',
    instagram: '@Accesorios_ca_',
    phone: '+56972204517',
    category: 'Accesorios',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Emily Cifuentes', '@Accesorios_ca_'),
    companyLogoUrl: getLogoUrl('Accesorios CA'),
    coverUrl: getCoverUrl('Moda'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'emyaguayoretamal@gmail.com',
    name: 'Emy Aguayo',
    companyName: 'Primrose English Academy',
    instagram: '@Primrose.englishacademy',
    phone: '+56941699322',
    category: 'Educación',
    affinity: 'Familia',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Emy Aguayo', '@Primrose.englishacademy'),
    companyLogoUrl: getLogoUrl('Primrose Academy'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'fcampbellsills@gmail.com',
    name: 'Francie Campbell',
    companyName: 'Francie Campbell Sills',
    instagram: '@Francie_campbell_sills',
    phone: '+56998792803',
    category: 'General',
    affinity: 'Emprendimiento',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Francie Campbell', '@Francie_campbell_sills'),
    companyLogoUrl: getLogoUrl('Francie Campbell'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'fernanda.mohr2023@gmail.com',
    name: 'Fernanda Mohr Rosas',
    companyName: 'Deep Clean Temuco',
    instagram: '@deepcleantemuco',
    phone: '+56973242215',
    category: 'Servicios de Limpieza',
    affinity: 'Hogar',
    bio: '',
    businessDescription: '',
    city: 'Temuco',
    avatarUrl: getAvatarUrl('Fernanda Mohr', '@deepcleantemuco'),
    companyLogoUrl: getLogoUrl('Deep Clean'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'franvergaraeventos@gmail.com',
    name: 'María Francisca Vergara',
    companyName: 'Francisca Vergara Eventos',
    instagram: '@Franciscavergaraeventos',
    phone: '+56998304686',
    category: 'Eventos',
    affinity: 'Eventos',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('María Francisca Vergara', '@Franciscavergaraeventos'),
    companyLogoUrl: getLogoUrl('Francisca Eventos'),
    coverUrl: getCoverUrl('Eventos'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'fuentesvivianpaola@gmail.com',
    name: 'Vivian Fuentes Doñez',
    companyName: 'Vitrofusión Villarrica',
    instagram: '@vitrofusion_villarrica',
    phone: '+56974954266',
    category: 'Artesanía',
    affinity: 'Arte',
    bio: '',
    businessDescription: '',
    city: 'Villarrica',
    avatarUrl: getAvatarUrl('Vivian Fuentes', '@vitrofusion_villarrica'),
    companyLogoUrl: getLogoUrl('Vitrofusión'),
    coverUrl: getCoverUrl('Arte'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'gonzalezaguileraconstanza21@gmail.com',
    name: 'Constanza González',
    companyName: 'Besos Mojados Chile',
    instagram: '@besos_mojadoschile',
    phone: '+56994583551',
    category: 'General',
    affinity: 'Emprendimiento',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Constanza González', '@besos_mojadoschile'),
    companyLogoUrl: getLogoUrl('Besos Mojados'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'greciarussa87@gmail.com',
    name: 'Grecia Alejandra Acuña Russa',
    companyName: 'Empire of Nails',
    instagram: '@Empireofnails',
    phone: '+56937481874',
    category: 'Belleza',
    affinity: 'Belleza',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Grecia Acuña', '@Empireofnails'),
    companyLogoUrl: getLogoUrl('Empire of Nails'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'guinanosnely@gmail.com',
    name: 'Osnely Guiñan',
    companyName: 'Go Nails Temuco',
    instagram: '@gonails.temuco',
    phone: '+56946820383',
    category: 'Belleza',
    affinity: 'Belleza',
    bio: '',
    businessDescription: '',
    city: 'Temuco',
    avatarUrl: getAvatarUrl('Osnely Guiñan', '@gonails.temuco'),
    companyLogoUrl: getLogoUrl('Go Nails'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'irmaq6@gmail.com',
    name: 'Irma Quiñenir',
    companyName: 'Triuke Kollam',
    instagram: '@triukekollam',
    phone: '+56946422077',
    category: 'Artesanía',
    affinity: 'Arte',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Irma Quiñenir', '@triukekollam'),
    companyLogoUrl: getLogoUrl('Triuke Kollam'),
    coverUrl: getCoverUrl('Arte'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'isabelyanezventas@gmail.com',
    name: 'Isabel Yañez',
    companyName: 'Kidstore Chile',
    instagram: '@Kidstorechile',
    phone: '+56981571850',
    category: 'Infantil',
    affinity: 'Familia',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Isabel Yañez', '@Kidstorechile'),
    companyLogoUrl: getLogoUrl('Kidstore'),
    coverUrl: getCoverUrl('Infantil'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'j.correa02@ufromail.cl',
    name: 'Javiera Correa Villagra',
    companyName: 'Fluye Ecotienda',
    instagram: '@fluye.ecotienda',
    phone: '+56940617260',
    category: 'Productos Eco',
    affinity: 'Sustentabilidad',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Javiera Correa', '@fluye.ecotienda'),
    companyLogoUrl: getLogoUrl('Fluye Ecotienda'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'jodazapatos@gmail.com',
    name: 'María José Gatica',
    companyName: 'Joda Zapatos',
    instagram: '@joda_zapatos',
    phone: '+56994375980',
    category: 'Calzado',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('María José Gatica', '@joda_zapatos'),
    companyLogoUrl: getLogoUrl('Joda Zapatos'),
    coverUrl: getCoverUrl('Moda'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'joyasinsectum@gmail.com',
    name: 'María Fernanda Bahamondes',
    companyName: 'Joyas Insectum',
    instagram: '@joyas_insectum',
    phone: '+56930699196',
    category: 'Joyería',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('María Fernanda Bahamondes', '@joyas_insectum'),
    companyLogoUrl: getLogoUrl('Joyas Insectum'),
    coverUrl: getCoverUrl('Joyería'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'lawalspa@gmail.com',
    name: 'Elizabeth Gutiérrez',
    companyName: 'Lawal Store',
    instagram: '@lawalstore',
    phone: '+56934089755',
    category: 'Moda',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Elizabeth Gutiérrez', '@lawalstore'),
    companyLogoUrl: getLogoUrl('Lawal Store'),
    coverUrl: getCoverUrl('Moda'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'leiby.za@gmail.com',
    name: 'Leiby Zambrano',
    companyName: 'LZ Cuidado Estético',
    instagram: '@lz.cuidadoestetico',
    phone: '+56958340363',
    category: 'Belleza y Estética',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Leiby Zambrano', '@lz.cuidadoestetico'),
    companyLogoUrl: getLogoUrl('LZ Cuidado'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'm.fermontecinos@gmail.com',
    name: 'María Fernanda Montecinos',
    companyName: 'Tu Aroma Tu Huella Tu Estilo',
    instagram: '@Tu_aroma_tu_huella_tu_estilo',
    phone: '+56938798214',
    category: 'Perfumería',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('María Fernanda Montecinos', '@Tu_aroma_tu_huella_tu_estilo'),
    companyLogoUrl: getLogoUrl('Tu Aroma'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'marciasepulvedar@gmail.com',
    name: 'Marcia Sepúlveda',
    companyName: 'Inspirada y Atrevida',
    instagram: '@inspiradayatrevida',
    phone: '+56996155010',
    category: 'General',
    affinity: 'Emprendimiento',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Marcia Sepúlveda', '@inspiradayatrevida'),
    companyLogoUrl: getLogoUrl('Inspirada y Atrevida'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'mariafnb29@gmail.com',
    name: 'María Fernanda Nuñez',
    companyName: 'Perfect Nails',
    instagram: '@__Perfect_nails.__',
    phone: '+56979724519',
    category: 'Belleza',
    affinity: 'Belleza',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('María Fernanda Nuñez', '@__Perfect_nails.__'),
    companyLogoUrl: getLogoUrl('Perfect Nails'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'mario.ruiz.online@gmail.com',
    name: 'Mario Ruiz',
    companyName: 'Superbellas Temuco',
    instagram: '@Superbellas.temuco',
    phone: '+56987628795',
    category: 'Belleza',
    affinity: 'Belleza',
    bio: '',
    businessDescription: '',
    city: 'Temuco',
    avatarUrl: getAvatarUrl('Mario Ruiz', '@Superbellas.temuco'),
    companyLogoUrl: getLogoUrl('Superbellas'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'matakuri.bisuteria@gmail.com',
    name: 'Glendy Contreras',
    companyName: 'Matakuri Bisutería',
    instagram: '@Matakuribisuteria',
    phone: '+56976002946',
    category: 'Bisutería',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Glendy Contreras', '@Matakuribisuteria'),
    companyLogoUrl: getLogoUrl('Matakuri'),
    coverUrl: getCoverUrl('Joyería'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'matices.ecocosmetica@gmail.com',
    name: 'Matices Ecocosmetica',
    companyName: 'Matices Ecocosmética',
    instagram: '@matices_ecocosmetica',
    phone: '+56983988404',
    category: 'Cosmética Natural',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Matices', '@matices_ecocosmetica'),
    companyLogoUrl: getLogoUrl('Matices'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'mercadito.hilda@gmail.com',
    name: 'Pilar Valenzuela',
    companyName: 'Mercadito Hilda',
    instagram: '@mercadito.hilda',
    phone: '+56973466096',
    category: 'Tienda',
    affinity: 'Emprendimiento',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Pilar Valenzuela', '@mercadito.hilda'),
    companyLogoUrl: getLogoUrl('Mercadito Hilda'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'milena@growthsystem.cl',
    name: 'Milena Ayala',
    companyName: 'Growth System',
    instagram: '@Growth_System_',
    phone: '+56954283101',
    category: 'Consultoría',
    affinity: 'Negocios',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Milena Ayala', '@Growth_System_'),
    companyLogoUrl: getLogoUrl('Growth System'),
    coverUrl: getCoverUrl('Tecnología'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'noesunajoya@gmail.com',
    name: 'Paula Díaz',
    companyName: 'Joyera CL',
    instagram: '@joyera.cl',
    phone: '+56965791493',
    category: 'Joyería',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Paula Díaz', '@joyera.cl'),
    companyLogoUrl: getLogoUrl('Joyera CL'),
    coverUrl: getCoverUrl('Joyería'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'paisajistauniversal@gmail.com',
    name: 'Camila Olea',
    companyName: 'Paisajista del Multiverso',
    instagram: '@paisajista_del_multiverso',
    phone: '+56971968496',
    category: 'Paisajismo',
    affinity: 'Decoración',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Camila Olea', '@paisajista_del_multiverso'),
    companyLogoUrl: getLogoUrl('Paisajista'),
    coverUrl: getCoverUrl('Paisajismo'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'paogarcia058@gmail.com',
    name: 'Paola García Torres',
    companyName: 'Pao Salon Spa',
    instagram: '@paosalonspa',
    phone: '+56988087515',
    category: 'Spa',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Paola García', '@paosalonspa'),
    companyLogoUrl: getLogoUrl('Pao Salon Spa'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'paulinamacarenamezameza@gmail.com',
    name: 'Paulina Meza',
    companyName: 'Pau Iconic',
    instagram: '@pau_iconic',
    phone: '+56998750674',
    category: 'Moda',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Paulina Meza', '@pau_iconic'),
    companyLogoUrl: getLogoUrl('Pau Iconic'),
    coverUrl: getCoverUrl('Moda'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'perfumeria.mau@yahoo.com',
    name: 'Alejandra Coc',
    companyName: 'Perfumes Mau',
    instagram: '@perfumes.mau',
    phone: '+56993825255',
    category: 'Perfumería',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Alejandra Coc', '@perfumes.mau'),
    companyLogoUrl: getLogoUrl('Perfumes Mau'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'pinillaandrademakarena@gmail.com',
    name: 'Makarena Pinilla',
    companyName: 'Algavital Chile',
    instagram: '@algavital_chile',
    phone: '+56949094069',
    category: 'Productos Naturales',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Makarena Pinilla', '@algavital_chile'),
    companyLogoUrl: getLogoUrl('Algavital'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'plussport2007@gmail.com',
    name: 'Sandra Margarita Garcés Ibarra',
    companyName: 'Plus Sport CL',
    instagram: '@plussportcl',
    phone: '+56971418979',
    category: 'Deportes',
    affinity: 'Deportes',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Sandra Garcés', '@plussportcl'),
    companyLogoUrl: getLogoUrl('Plus Sport'),
    coverUrl: getCoverUrl('Deportes'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'psic.yohannaarancibiav@gmail.com',
    name: 'Yohanna Arancibia',
    companyName: 'Thrive',
    instagram: '@Thrive_',
    phone: '+56942606245',
    category: 'Psicología',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Yohanna Arancibia', '@Thrive_'),
    companyLogoUrl: getLogoUrl('Thrive'),
    coverUrl: getCoverUrl('Salud'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'pzamoraj@gmail.com',
    name: 'Paulina Zamora',
    companyName: 'Pipa Little Cards',
    instagram: '@pipalittlecards',
    phone: '+56997799786',
    category: 'Papelería',
    affinity: 'Arte',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Paulina Zamora', '@pipalittlecards'),
    companyLogoUrl: getLogoUrl('Pipa Little Cards'),
    coverUrl: getCoverUrl('Arte'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 's.delvalle.medina@gmail.com',
    name: 'Sintya del Valle',
    companyName: 'Nuestro Nido Creativo',
    instagram: '@nuestronidocreativo',
    phone: '+56961587503',
    category: 'Infantil',
    affinity: 'Familia',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Sintya del Valle', '@nuestronidocreativo'),
    companyLogoUrl: getLogoUrl('Nuestro Nido'),
    coverUrl: getCoverUrl('Infantil'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'sattvamasoterapia@gmail.com',
    name: 'Marcela Matamala',
    companyName: 'Sattva Masoterapia',
    instagram: '@sattvamasoterapia',
    phone: '+56920192416',
    category: 'Masoterapia',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Marcela Matamala', '@sattvamasoterapia'),
    companyLogoUrl: getLogoUrl('Sattva'),
    coverUrl: getCoverUrl('Salud'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'seguroskarina.alarcon@gmail.com',
    name: 'Karina Alarcón',
    companyName: 'Corredora de Seguros K',
    instagram: '@corredora_de_seguros_k',
    phone: '+56965641097',
    category: 'Seguros',
    affinity: 'Negocios',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Karina Alarcón', '@corredora_de_seguros_k'),
    companyLogoUrl: getLogoUrl('Corredora K'),
    coverUrl: getCoverUrl('Finanzas'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'somosmilacl@gmail.com',
    name: 'Ordelis Guiñan',
    companyName: 'Mila Studio CL',
    instagram: '@Milastudio_cl',
    phone: '+56965960751',
    category: 'Belleza',
    affinity: 'Belleza',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Ordelis Guiñan', '@Milastudio_cl'),
    companyLogoUrl: getLogoUrl('Mila Studio'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'taniaarevalo@gmail.com',
    name: 'Tania Arévalo',
    companyName: 'Colibrí Efecto',
    instagram: '@colibri.efecto',
    phone: '+56952255951',
    category: 'General',
    affinity: 'Emprendimiento',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Tania Arévalo', '@colibri.efecto'),
    companyLogoUrl: getLogoUrl('Colibrí Efecto'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'tienda@bycarolinareyes.com',
    name: 'Carolina Reyes',
    companyName: 'Aurum Home CL',
    instagram: '@aurumhomecl',
    phone: '+56961149263',
    category: 'Decoración',
    affinity: 'Decoración',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Carolina Reyes', '@aurumhomecl'),
    companyLogoUrl: getLogoUrl('Aurum Home'),
    coverUrl: getCoverUrl('Decoración'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'victoria.floresq@gmail.com',
    name: 'Victoria Flores',
    companyName: 'Sensory Play Temuco',
    instagram: '@sensoryplay.temuco',
    phone: '+56953265806',
    category: 'Infantil',
    affinity: 'Familia',
    bio: '',
    businessDescription: '',
    city: 'Temuco',
    avatarUrl: getAvatarUrl('Victoria Flores', '@sensoryplay.temuco'),
    companyLogoUrl: getLogoUrl('Sensory Play'),
    coverUrl: getCoverUrl('Infantil'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'victoriapaztv@gmail.com',
    name: 'Victoria Toro',
    companyName: 'One by One CL',
    instagram: '@onebyone.cl',
    phone: '+56985978485',
    category: 'General',
    affinity: 'Emprendimiento',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Victoria Toro', '@onebyone.cl'),
    companyLogoUrl: getLogoUrl('One by One'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  // ===============================================
  // USUARIOS ADICIONALES DEL CSV (Faltantes)
  // ===============================================
  {
    email: 'akuschel@dtpingenieria.cl',
    name: 'Alejandra Kuschel',
    companyName: 'Centro Elysia',
    instagram: '@elysia_cl',
    phone: '+56994513299',
    category: 'Manicure y Pedicure',
    affinity: 'Bienestar',
    bio: 'Enfocados en autocuidado y bienestar.',
    businessDescription: 'Servicios de Manicure y Pedicure',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Alejandra Kuschel', '@elysia_cl'),
    companyLogoUrl: getLogoUrl('Centro Elysia'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 500,
    firstLogin: true,
    rut: '78098333-7',
    razonSocial: 'Centro Elysia Spa',
    direccion: 'Hochstetter 1002 of 510'
  },
  {
    email: 'clau7552@gmail.com',
    name: 'Claudia Suárez',
    companyName: 'GroB Pastelería',
    instagram: '@grobpasteleriacl',
    phone: '+56977918833',
    category: 'Pastelería',
    affinity: 'Gastronomía',
    bio: 'En Pastelería GroB creamos productos únicos e innovadores, elaborados con ingredientes de alta calidad.',
    businessDescription: 'Pastelería',
    city: 'Las Condes',
    avatarUrl: getAvatarUrl('Claudia Suárez', '@grobpasteleriacl'),
    companyLogoUrl: getLogoUrl('GroB Pastelería'),
    coverUrl: getCoverUrl('Gastronomía'),
    status: 'active',
    followers: 10000,
    firstLogin: true,
    rut: '12.537.022-5',
    razonSocial: 'Grob Pastelería',
    direccion: 'Luis Matte Larrain 10185, Las Condes'
  },
  {
    email: 'cristobal.baier@gmail.com',
    name: 'Cristobal Baier',
    companyName: 'BAW Arquitectura',
    instagram: '@baw_arquitectos',
    phone: '+56987271997',
    category: 'Arquitectura',
    affinity: 'Diseño',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Cristobal Baier', '@baw_arquitectos'),
    companyLogoUrl: getLogoUrl('BAW Arquitectura'),
    coverUrl: getCoverUrl('Arte'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'emedinapaez@gmail.com',
    name: 'Emiliano Medina',
    companyName: 'Lion',
    instagram: '@emilianolion',
    phone: '+56961399990',
    category: 'General',
    affinity: 'Emprendimiento',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Emiliano Medina', '@emilianolion'),
    companyLogoUrl: getLogoUrl('Lion'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'fmolinab21@gmail.com',
    name: 'Felipe Nicolás Molina Bustos',
    companyName: 'Nutrifit Chile',
    instagram: '@Nutrifitchile.cl',
    phone: '+56913100000',
    category: 'Nutrición',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Felipe Molina', '@Nutrifitchile.cl'),
    companyLogoUrl: getLogoUrl('Nutrifit Chile'),
    coverUrl: getCoverUrl('Salud'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'jcrisostomol@gmail.com',
    name: 'Jorge Crisostomo',
    companyName: 'Vortex33',
    instagram: '@jorgecl.fotos',
    phone: '+56975870149',
    category: 'Fotografía',
    affinity: 'Arte',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Jorge Crisostomo', '@jorgecl.fotos'),
    companyLogoUrl: getLogoUrl('Vortex33'),
    coverUrl: getCoverUrl('Arte'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'jorge@itvis.cl',
    name: 'Jorge Crisostomo',
    companyName: 'ITVIS SpA',
    instagram: '@grupovis.io',
    phone: '+56975870149',
    category: 'Tecnología',
    affinity: 'Tecnología',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Jorge Crisostomo', '@grupovis.io'),
    companyLogoUrl: getLogoUrl('ITVIS'),
    coverUrl: getCoverUrl('Tecnología'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'klga.aranguiz@gmail.com',
    name: 'Katherine Aránguiz',
    companyName: 'Kinesióloga Katherine',
    instagram: '@Kinekatherinearanguiz',
    phone: '+56981298763',
    category: 'Kinesiología',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Katherine Aránguiz', '@Kinekatherinearanguiz'),
    companyLogoUrl: getLogoUrl('Kinesióloga'),
    coverUrl: getCoverUrl('Salud'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'lionskill@gmail.com',
    name: 'Emiliano Lion',
    companyName: 'Lion Skills',
    instagram: '@lion',
    phone: '+56961399990',
    category: 'General',
    affinity: 'Emprendimiento',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Emiliano', '@lion'),
    companyLogoUrl: getLogoUrl('Lion Skills'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'murua.mauricio@gmail.com',
    name: 'Mauricio Murúa',
    companyName: 'Proyecto Escala',
    instagram: '@proyectoescalatemuco',
    phone: '+56942558204',
    category: 'Consultoría',
    affinity: 'Negocios',
    bio: '',
    businessDescription: '',
    city: 'Temuco',
    avatarUrl: getAvatarUrl('Mauricio Murúa', '@proyectoescalatemuco'),
    companyLogoUrl: getLogoUrl('Proyecto Escala'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'nicolasfuentes35@gmail.com',
    name: 'Nicolás Fuentes',
    companyName: 'Nicofvivallo22',
    instagram: '@Nicofvivallo22',
    phone: '+56992493070',
    category: 'General',
    affinity: 'Emprendimiento',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Nicolás Fuentes', '@Nicofvivallo22'),
    companyLogoUrl: getLogoUrl('Nicofvivallo'),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'pablo.gonzalez@madsupport.cl',
    name: 'Pablo Gonzalez',
    companyName: 'MAD Support',
    instagram: '@madsupport',
    phone: '+56984590309',
    category: 'Tecnología',
    affinity: 'Tecnología',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Pablo Gonzalez', '@madsupport'),
    companyLogoUrl: getLogoUrl('MAD Support'),
    coverUrl: getCoverUrl('Tecnología'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'pamelareyesrivera@gmail.com',
    name: 'Pamela Reyes',
    companyName: 'Luna Enfermería Dermoestética',
    instagram: '@luna_enfermeria_dermoestetica',
    phone: '+56999309948',
    category: 'Dermoestética',
    affinity: 'Bienestar',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Pamela Reyes', '@luna_enfermeria_dermoestetica'),
    companyLogoUrl: getLogoUrl('Luna Enfermería'),
    coverUrl: getCoverUrl('Belleza'),
    status: 'active',
    followers: 500,
    firstLogin: true
  },
  {
    email: 'ryaropa.accesorios@gmail.com',
    name: 'Juliette Poblete',
    companyName: 'R.A Ropa y Accesorios',
    instagram: '@r.a_ropayaccesorios',
    phone: '+56999516249',
    category: 'Moda',
    affinity: 'Moda',
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl('Juliette Poblete', '@r.a_ropayaccesorios'),
    companyLogoUrl: getLogoUrl('RA Ropa'),
    coverUrl: getCoverUrl('Moda'),
    status: 'active',
    followers: 500,
    firstLogin: true
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

export const forceReloadRealUsers = async (): Promise<void> => {
  console.log('🔄 Cargando usuarios...');
  
  // PASO 1: Intentar cargar TODO desde Firebase
  const firebaseUsers = await loadUsersFromFirebase();
  
  if (firebaseUsers.length > 0) {
    // Firebase tiene datos - usar esos
    localStorage.setItem('tribu_users', JSON.stringify(firebaseUsers));
    console.log(`✅ ${firebaseUsers.length} usuarios cargados desde Firebase`);
    return;
  }
  
  // PASO 2: Firebase vacío - verificar si necesita migración
  const migrationDone = localStorage.getItem('tribu_migration_complete');
  
  if (!migrationDone) {
    console.log('📤 Ejecutando migración inicial a Firebase...');
    await migrateUsersToFirebase();
    
    // Recargar desde Firebase después de migrar
    const usersAfterMigration = await loadUsersFromFirebase();
    if (usersAfterMigration.length > 0) {
      localStorage.setItem('tribu_users', JSON.stringify(usersAfterMigration));
      console.log(`✅ ${usersAfterMigration.length} usuarios migrados y cargados`);
      return;
    }
  }
  
  // PASO 3: Fallback - usar datos hardcodeados (solo si todo falla)
  console.log('⚠️ Usando fallback local (Firebase no disponible)');
  const usersWithIds = REAL_USERS.map((user, index) => ({
    ...user,
    id: `real_user_${index + 1}`,
    createdAt: new Date().toISOString(),
    password: UNIVERSAL_PASSWORD,
    surveyCompleted: true,
    tribeAssigned: true,
    avatarUrl: getAvatarUrl(user.name, user.instagram)
  }));
  localStorage.setItem('tribu_users', JSON.stringify(usersWithIds));
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
    bio: '',
    businessDescription: '',
    city: 'Chile',
    avatarUrl: getAvatarUrl(userData.name, userData.instagram),
    companyLogoUrl: getLogoUrl(userData.companyName),
    coverUrl: getCoverUrl('default'),
    status: 'active',
    followers: 500,
    firstLogin: true,
    password: UNIVERSAL_PASSWORD,
    createdAt: new Date().toISOString(),
    surveyCompleted: true,
    tribeAssigned: true
  };
  
  users.push(newUser);
  localStorage.setItem('tribu_users', JSON.stringify(users));
  
  // Sincronizar con Firebase - GUARDAR TODOS LOS DATOS
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { doc, setDoc } = await import('firebase/firestore');
    const db = getFirestoreInstance();
    
    if (db) {
      // Guardar usuario completo en Firebase
      await setDoc(doc(db, 'users', newUser.id), {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        companyName: newUser.companyName,
        instagram: newUser.instagram,
        phone: newUser.phone,
        category: newUser.category,
        subCategory: newUser.affinity,
        location: newUser.city,
        bio: newUser.bio,
        avatarUrl: newUser.avatarUrl,
        coverUrl: newUser.coverUrl,
        status: 'active',
        createdAt: newUser.createdAt,
        source: 'app_registration'
      });
      console.log('☁️ Nuevo usuario guardado en Firebase:', newUser.email);
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
