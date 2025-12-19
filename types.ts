
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

// Afinidades - SINCRONIZADO con constants/affinities.ts AFFINITY_GROUPS
export const AFFINITY_OPTIONS = [
  "Bienestar y Salud",
  "Diseño y Creatividad",
  "Digital y Tecnología",
  "Economía y Negocios",
  "Educación y Desarrollo",
  "Estilo de Vida",
  "Eventos y Celebraciones",
  "Familia y Hogar",
  "Gastronomía y Alimentación",
  "Impacto y Propósito",
  "Servicios Profesionales"
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