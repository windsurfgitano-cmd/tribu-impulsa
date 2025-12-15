// ============================================
// AFINIDADES - TRIBU IMPULSA
// ============================================
// Intereses y valores que conectan emprendedores

export interface Affinity {
  id: string;
  label: string;
  group: string;
}

export const AFFINITY_GROUPS = [
  'Bienestar y Salud',
  'Diseño y Estilo',
  'Digital y Tecnología',
  'Sustentabilidad',
  'Conciencia y Propósito',
  'Estilo de Vida y Experiencias',
  'Educación y Desarrollo',
  'Economía y Negocios',
  'Familia y Hogar',
  'Belleza y Cuidado Personal',
  'Servicios Profesionales',
  'Eventos y Celebraciones',
  'Emprendimiento y Comunidad'
] as const;

export type AffinityGroup = typeof AFFINITY_GROUPS[number];

export const AFFINITIES: Affinity[] = [
  // ========== BIENESTAR Y SALUD ==========
  { id: 'bienestar-emocional', label: 'Bienestar emocional / espiritualidad / terapias alternativas', group: 'Bienestar y Salud' },
  { id: 'nutricion', label: 'Nutrición / alimentación saludable', group: 'Bienestar y Salud' },
  { id: 'fitness', label: 'Fitness / wellness / suplementos alimenticios', group: 'Bienestar y Salud' },
  { id: 'aire-libre', label: 'Aire libre / naturaleza', group: 'Bienestar y Salud' },
  { id: 'medicina-preventiva', label: 'Medicina preventiva / longevidad / medicina estética', group: 'Bienestar y Salud' },
  
  // ========== DISEÑO Y ESTILO ==========
  { id: 'diseno-arte', label: 'Diseño / arte / decoración', group: 'Diseño y Estilo' },
  { id: 'fotografia-cine', label: 'Fotografía / cine / teatro', group: 'Diseño y Estilo' },
  { id: 'moda', label: 'Moda', group: 'Diseño y Estilo' },
  { id: 'lujo', label: 'Lujo', group: 'Diseño y Estilo' },
  
  // ========== DIGITAL Y TECNOLOGÍA ==========
  { id: 'negocios-digitales', label: 'Negocios digitales', group: 'Digital y Tecnología' },
  { id: 'marketing-digital', label: 'Marketing digital / RRSS / contenido', group: 'Digital y Tecnología' },
  
  // ========== SUSTENTABILIDAD ==========
  { id: 'sustentabilidad', label: 'Proyectos sustentables / economía circular', group: 'Sustentabilidad' },
  
  // ========== CONCIENCIA Y PROPÓSITO ==========
  { id: 'diversidad', label: 'Diversidad / inclusión', group: 'Conciencia y Propósito' },
  
  // ========== ESTILO DE VIDA Y EXPERIENCIAS ==========
  { id: 'viajes', label: 'Viajes', group: 'Estilo de Vida y Experiencias' },
  { id: 'gastronomia', label: 'Gastronomía', group: 'Estilo de Vida y Experiencias' },
  { id: 'cultura', label: 'Cultura', group: 'Estilo de Vida y Experiencias' },
  { id: 'mascotas', label: 'Mascotas / pet friendly', group: 'Estilo de Vida y Experiencias' },
  
  // ========== EDUCACIÓN Y DESARROLLO ==========
  { id: 'formacion', label: 'Formación / cursos / educación', group: 'Educación y Desarrollo' },
  { id: 'coaching-mentorias', label: 'Coaching / mentorías', group: 'Educación y Desarrollo' },
  
  // ========== ECONOMÍA Y NEGOCIOS ==========
  { id: 'finanzas', label: 'Finanzas / inversiones / seguros', group: 'Economía y Negocios' },
  { id: 'legal-contable', label: 'Legal / contabilidad / tributario', group: 'Economía y Negocios' },
  { id: 'importacion-exportacion', label: 'Importación / exportación / comercio exterior', group: 'Economía y Negocios' },
  
  // ========== FAMILIA Y HOGAR ==========
  { id: 'maternidad-bebes', label: 'Maternidad / bebés / niños', group: 'Familia y Hogar' },
  { id: 'hogar-decoracion', label: 'Hogar / decoración / organización', group: 'Familia y Hogar' },
  { id: 'mascotas-animales', label: 'Mascotas / productos animales', group: 'Familia y Hogar' },
  
  // ========== BELLEZA Y CUIDADO PERSONAL ==========
  { id: 'cosmetica-skincare', label: 'Cosmética / skincare / maquillaje', group: 'Belleza y Cuidado Personal' },
  { id: 'peluqueria-estetica', label: 'Peluquería / estética / spa', group: 'Belleza y Cuidado Personal' },
  { id: 'moda-accesorios', label: 'Moda / accesorios / joyería', group: 'Belleza y Cuidado Personal' },
  
  // ========== SERVICIOS PROFESIONALES ==========
  { id: 'consultoria-asesoria', label: 'Consultoría / asesoría empresarial', group: 'Servicios Profesionales' },
  { id: 'rrhh-talento', label: 'Recursos humanos / selección de talento', group: 'Servicios Profesionales' },
  { id: 'arquitectura-construccion', label: 'Arquitectura / construcción / inmobiliaria', group: 'Servicios Profesionales' },
  
  // ========== EVENTOS Y CELEBRACIONES ==========
  { id: 'bodas-matrimonios', label: 'Bodas / matrimonios', group: 'Eventos y Celebraciones' },
  { id: 'eventos-corporativos', label: 'Eventos corporativos / conferencias', group: 'Eventos y Celebraciones' },
  { id: 'catering-banqueteria', label: 'Catering / banquetería / producción', group: 'Eventos y Celebraciones' },
  
  // ========== EMPRENDIMIENTO Y COMUNIDAD ==========
  { id: 'startups-innovacion', label: 'Startups / innovación / tecnología', group: 'Emprendimiento y Comunidad' },
  { id: 'impacto-social', label: 'Impacto social / ONGs / fundaciones', group: 'Emprendimiento y Comunidad' },
  { id: 'networking-comunidades', label: 'Networking / comunidades / coworking', group: 'Emprendimiento y Comunidad' },
];

// Función helper para obtener afinidades por grupo
export const getAffinitiesByGroup = (group: AffinityGroup): Affinity[] => {
  return AFFINITIES.filter(aff => aff.group === group);
};

// Función helper para obtener afinidades agrupadas
export const getAffinitiesGrouped = (): Record<string, Affinity[]> => {
  return AFFINITIES.reduce((acc, aff) => {
    if (!acc[aff.group]) acc[aff.group] = [];
    acc[aff.group].push(aff);
    return acc;
  }, {} as Record<string, Affinity[]>);
};

// Función para buscar afinidades
export const searchAffinities = (query: string): Affinity[] => {
  const q = query.toLowerCase();
  return AFFINITIES.filter(aff => 
    aff.label.toLowerCase().includes(q) ||
    aff.group.toLowerCase().includes(q)
  );
};

// Calcular score de afinidad entre dos usuarios
export const calculateAffinityScore = (userAffinities: string[], otherAffinities: string[]): number => {
  if (!userAffinities.length || !otherAffinities.length) return 0;
  
  const matches = userAffinities.filter(a => otherAffinities.includes(a));
  const totalUnique = new Set([...userAffinities, ...otherAffinities]).size;
  
  // Score basado en coincidencias / total posible
  return Math.round((matches.length / totalUnique) * 100);
};
