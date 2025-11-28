
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
  location: string;
  website: string;
  bio: string;
  tags: string[];
  foundingYear: number;
  instagram: string;
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

// Based on PDF "Afinidad" and "Categoría" columns
export const AFFINITY_OPTIONS = [
  "Bienestar y Salud",
  "Diseño y Estilo",
  "Digital y Tecnología",
  "Sustentabilidad",
  "Conciencia y Propósito",
  "Estilo de Vida y Experiencias",
  "Educación y Desarrollo",
  "Economía y Negocios",
  "Servicios Profesionales",
  "Industria y Manufactura",
  "Oficio"
];

// Detailed mapping based on PDF pages
export const CATEGORY_MAPPING: Record<string, string[]> = {
  "Bienestar y Salud": ["Nutrición", "Fitness", "Medicina Preventiva", "Terapias Alternativas", "Psicología", "Suplementos"],
  "Diseño y Estilo": ["Moda Mujer", "Moda Hombre", "Decoración", "Arte", "Joyería", "Zapatos y Carteras", "Cosmética"],
  "Digital y Tecnología": ["Desarrollo Software", "Marketing Digital", "E-commerce", "Ciberseguridad", "Automatización", "Soporte Técnico"],
  "Sustentabilidad": ["Economía Circular", "Reciclaje", "Energías Renovables", "Productos Eco-friendly"],
  "Servicios Profesionales": ["Abogados", "Contadores", "Arquitectos", "Consultoría", "Coaching", "Corretaje", "Seguros"],
  "Estilo de Vida y Experiencias": ["Gastronomía", "Turismo", "Eventos", "Mascotas", "Hotelería", "Viajes"],
  "Industria y Manufactura": ["Envases", "Limpieza", "Alimentos Procesados", "Jabones Artesanales"],
  "Oficio": ["Carpintería", "Electricidad", "Mecánica", "Confección", "Jardinería", "Gasfitería"],
  "Educación y Desarrollo": ["Idiomas", "Clases Particulares", "Talleres de Arte", "Capacitación Empresas"],
  "Economía y Negocios": ["Inversiones", "Fintech", "Asesoría Financiera", "Comercio Exterior"]
};