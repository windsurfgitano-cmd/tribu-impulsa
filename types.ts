
export interface UserProfile {
  id: string;
  name: string;
  companyName: string;
  email: string;
  category: string;
  subCategory: string;
  description: string;
  stage: 'Idea' | 'MVP' | 'Growth' | 'Scale';
  matches: Match[];
}

export interface Match {
  id: string;
  targetProfile: MatchProfile;
  affinityScore: number; // 0-100 (Heatmap logic)
  reason: string; // "Criterio de Afinidad"
  status: 'New' | 'Contacted' | 'Connected';
}

export interface MatchProfile {
  id: string;
  name: string;
  companyName: string;
  category: string;
  subCategory: string;
  avatarUrl: string;
  companyLogoUrl: string; // New: Abstract company logo
  coverUrl: string;       // New: Category-based background image
  whatsapp: string;
  phone?: string;         // Teléfono para WhatsApp
  location: string;
  website: string;
  bio: string;
  tags: string[];
  foundingYear: number;
  instagram: string;
  email?: string;         // Email de contacto
}

export interface ActivityItem {
  id: string;
  type: 'match' | 'system' | 'view' | 'update';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

export interface TribeAssignments {
  toShare: MatchProfile[];
  shareWithMe: MatchProfile[];
}

// Afinidades COMPLETAS - SINCRONIZADO con constants/affinities.ts AFFINITIES (41 opciones)
export const AFFINITY_OPTIONS = [
  // Bienestar y Salud (5)
  "Bienestar y Salud - Aire libre / naturaleza / outdoor",
  "Bienestar y Salud - Bienestar emocional / espiritualidad",
  "Bienestar y Salud - Fitness / deporte / wellness",
  "Bienestar y Salud - Medicina preventiva / estética / longevidad",
  "Bienestar y Salud - Nutrición / alimentación saludable",
  // Diseño y Creatividad (5)
  "Diseño y Creatividad - Arquitectura / interiorismo",
  "Diseño y Creatividad - Arte / manualidades / artesanía",
  "Diseño y Creatividad - Diseño gráfico / branding",
  "Diseño y Creatividad - Fotografía / video / audiovisual",
  "Diseño y Creatividad - Moda / tendencias / lujo",
  // Digital y Tecnología (4)
  "Digital y Tecnología - E-commerce / ventas online",
  "Digital y Tecnología - Marketing digital / RRSS / contenido",
  "Digital y Tecnología - Software / apps / desarrollo",
  "Digital y Tecnología - Tecnología / innovación / IA",
  // Economía y Negocios (4)
  "Economía y Negocios - Emprendimiento / startups",
  "Economía y Negocios - Finanzas / inversiones / seguros",
  "Economía y Negocios - Importación / exportación / comercio",
  "Economía y Negocios - Legal / contabilidad / tributario",
  // Educación y Desarrollo (4)
  "Educación y Desarrollo - Capacitación / talleres / cursos",
  "Educación y Desarrollo - Coaching / mentorías / liderazgo",
  "Educación y Desarrollo - Desarrollo personal / profesional",
  "Educación y Desarrollo - Educación infantil / reforzamiento",
  // Estilo de Vida (4)
  "Estilo de Vida - Cultura / arte / entretenimiento",
  "Estilo de Vida - Mascotas / pet friendly",
  "Estilo de Vida - Turismo / viajes / experiencias",
  "Estilo de Vida - Vida al aire libre / aventura",
  // Eventos y Celebraciones (3)
  "Eventos y Celebraciones - Bodas / matrimonios",
  "Eventos y Celebraciones - Eventos corporativos / ferias",
  "Eventos y Celebraciones - Fiestas / cumpleaños / celebraciones",
  // Familia y Hogar (3)
  "Familia y Hogar - Hogar / decoración / organización",
  "Familia y Hogar - Maternidad / bebés / niños",
  "Familia y Hogar - Vida familiar / parenting",
  // Gastronomía y Alimentación (3)
  "Gastronomía y Alimentación - Gastronomía / restaurantes / café",
  "Gastronomía y Alimentación - Productos gourmet / artesanales",
  "Gastronomía y Alimentación - Vinos / bebidas / sommelier",
  // Impacto y Propósito (3)
  "Impacto y Propósito - Diversidad / inclusión / comunidad",
  "Impacto y Propósito - Impacto social / ONGs / voluntariado",
  "Impacto y Propósito - Sustentabilidad / economía circular",
  // Servicios Profesionales (3)
  "Servicios Profesionales - Consultoría / asesoría empresarial",
  "Servicios Profesionales - RRHH / selección / talento",
  "Servicios Profesionales - Servicios B2B / corporativos"
];

// Categorías principales - SINCRONIZADO con constants/categories.ts CATEGORY_GROUPS
export const CATEGORY_MAPPING: Record<string, string[]> = {
  "Moda Mujer": ["Ropa", "Joyas", "Zapatos", "Carteras", "Cosméticos", "Accesorios"],
  "Moda Hombre": ["Ropa", "Zapatos", "Accesorios"],
  "Belleza, Estética y Bienestar": ["Peluquería", "Manicure", "Estética", "Maquillaje", "Terapias", "Personal Trainer"],
  "Alimentos y Gastronomía": ["Restaurante", "Pastelería", "Catering", "Delivery", "Gourmet", "Food truck"],
  "Negocio": ["Decoración", "Tecnología", "Librería", "Importación"],
  "Servicios Profesionales": ["Abogados", "Contadores", "Arquitectos", "Psicólogos", "Coaching", "Dentistas"],
  "Educación y Capacitación": ["Clases", "Idiomas", "Talleres", "Capacitación"],
  "Arte, Diseño y Creatividad": ["Fotografía", "Diseño", "Marketing", "Audiovisual"],
  "Tecnología y Desarrollo": ["Software", "E-commerce", "Soporte", "Ciberseguridad", "IA"],
  "Turismo": ["Agencia viajes", "Hotelería", "Guías"],
  "Eventos": ["Matrimonios", "Cumpleaños", "Corporativos", "DJs"],
  "Transporte y Logística": ["Delivery", "Mudanzas", "Rent a Car"],
  "Mascotas y Animales": ["Peluquería", "Veterinaria", "Accesorios"],
  "Industria y Manufactura": ["Jabones", "Limpieza", "Envases", "Bebidas"],
  "Construcción y Mantención": ["Remodelación", "Paisajismo", "Piscinas"],
  "Oficio": ["Carpintero", "Electricista", "Mecánico", "Jardinero"]
};