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
  'Diseño y Creatividad',
  'Digital y Tecnología',
  'Economía y Negocios',
  'Educación y Desarrollo',
  'Estilo de Vida',
  'Eventos y Celebraciones',
  'Familia y Hogar',
  'Gastronomía y Alimentación',
  'Impacto y Propósito',
  'Servicios Profesionales'
] as const;

export type AffinityGroup = typeof AFFINITY_GROUPS[number];

export const AFFINITIES: Affinity[] = [
  // ========== BIENESTAR Y SALUD (5) ==========
  { id: 'aire-libre', label: 'Aire libre / naturaleza / outdoor', group: 'Bienestar y Salud' },
  { id: 'bienestar-emocional', label: 'Bienestar emocional / espiritualidad', group: 'Bienestar y Salud' },
  { id: 'fitness', label: 'Fitness / deporte / wellness', group: 'Bienestar y Salud' },
  { id: 'medicina-estetica', label: 'Medicina preventiva / estética / longevidad', group: 'Bienestar y Salud' },
  { id: 'nutricion', label: 'Nutrición / alimentación saludable', group: 'Bienestar y Salud' },
  
  // ========== DISEÑO Y CREATIVIDAD (5) ==========
  { id: 'arquitectura', label: 'Arquitectura / interiorismo', group: 'Diseño y Creatividad' },
  { id: 'arte-manualidades', label: 'Arte / manualidades / artesanía', group: 'Diseño y Creatividad' },
  { id: 'diseno-grafico', label: 'Diseño gráfico / branding', group: 'Diseño y Creatividad' },
  { id: 'fotografia', label: 'Fotografía / video / audiovisual', group: 'Diseño y Creatividad' },
  { id: 'moda-tendencias', label: 'Moda / tendencias / lujo', group: 'Diseño y Creatividad' },
  
  // ========== DIGITAL Y TECNOLOGÍA (4) ==========
  { id: 'ecommerce', label: 'E-commerce / ventas online', group: 'Digital y Tecnología' },
  { id: 'marketing-digital', label: 'Marketing digital / RRSS / contenido', group: 'Digital y Tecnología' },
  { id: 'software', label: 'Software / apps / desarrollo', group: 'Digital y Tecnología' },
  { id: 'tecnologia-innovacion', label: 'Tecnología / innovación / IA', group: 'Digital y Tecnología' },
  
  // ========== ECONOMÍA Y NEGOCIOS (4) ==========
  { id: 'emprendimiento', label: 'Emprendimiento / startups', group: 'Economía y Negocios' },
  { id: 'finanzas', label: 'Finanzas / inversiones / seguros', group: 'Economía y Negocios' },
  { id: 'importacion', label: 'Importación / exportación / comercio', group: 'Economía y Negocios' },
  { id: 'legal-contable', label: 'Legal / contabilidad / tributario', group: 'Economía y Negocios' },
  
  // ========== EDUCACIÓN Y DESARROLLO (4) ==========
  { id: 'capacitacion', label: 'Capacitación / talleres / cursos', group: 'Educación y Desarrollo' },
  { id: 'coaching', label: 'Coaching / mentorías / liderazgo', group: 'Educación y Desarrollo' },
  { id: 'desarrollo-personal', label: 'Desarrollo personal / profesional', group: 'Educación y Desarrollo' },
  { id: 'educacion-ninos', label: 'Educación infantil / reforzamiento', group: 'Educación y Desarrollo' },
  
  // ========== ESTILO DE VIDA (4) ==========
  { id: 'cultura', label: 'Cultura / arte / entretenimiento', group: 'Estilo de Vida' },
  { id: 'mascotas', label: 'Mascotas / pet friendly', group: 'Estilo de Vida' },
  { id: 'turismo', label: 'Turismo / viajes / experiencias', group: 'Estilo de Vida' },
  { id: 'vida-outdoor', label: 'Vida al aire libre / aventura', group: 'Estilo de Vida' },
  
  // ========== EVENTOS Y CELEBRACIONES (3) ==========
  { id: 'bodas', label: 'Bodas / matrimonios', group: 'Eventos y Celebraciones' },
  { id: 'eventos-corporativos', label: 'Eventos corporativos / ferias', group: 'Eventos y Celebraciones' },
  { id: 'fiestas', label: 'Fiestas / cumpleaños / celebraciones', group: 'Eventos y Celebraciones' },
  
  // ========== FAMILIA Y HOGAR (3) ==========
  { id: 'hogar', label: 'Hogar / decoración / organización', group: 'Familia y Hogar' },
  { id: 'maternidad', label: 'Maternidad / bebés / niños', group: 'Familia y Hogar' },
  { id: 'vida-familiar', label: 'Vida familiar / parenting', group: 'Familia y Hogar' },
  
  // ========== GASTRONOMÍA Y ALIMENTACIÓN (3) ==========
  { id: 'gastronomia', label: 'Gastronomía / restaurantes / café', group: 'Gastronomía y Alimentación' },
  { id: 'productos-gourmet', label: 'Productos gourmet / artesanales', group: 'Gastronomía y Alimentación' },
  { id: 'vinos-bebidas', label: 'Vinos / bebidas / sommelier', group: 'Gastronomía y Alimentación' },
  
  // ========== IMPACTO Y PROPÓSITO (3) ==========
  { id: 'diversidad', label: 'Diversidad / inclusión / comunidad', group: 'Impacto y Propósito' },
  { id: 'impacto-social', label: 'Impacto social / ONGs / voluntariado', group: 'Impacto y Propósito' },
  { id: 'sustentabilidad', label: 'Sustentabilidad / economía circular', group: 'Impacto y Propósito' },
  
  // ========== SERVICIOS PROFESIONALES (3) ==========
  { id: 'consultoria', label: 'Consultoría / asesoría empresarial', group: 'Servicios Profesionales' },
  { id: 'rrhh', label: 'RRHH / selección / talento', group: 'Servicios Profesionales' },
  { id: 'servicios-b2b', label: 'Servicios B2B / corporativos', group: 'Servicios Profesionales' },
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
