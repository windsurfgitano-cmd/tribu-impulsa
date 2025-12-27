import { Match, MatchProfile, AFFINITY_OPTIONS, CATEGORY_MAPPING, ActivityItem, TribeAssignments } from '../types';
import { TRIBE_CATEGORY_OPTIONS } from '../data/tribeCategories';
import { getAllUsers, UserProfile, getUserNotifications } from './databaseService';
import { CATEGORIES, AFFINITIES, CATEGORY_GROUPS } from '../constants';
import { REGIONS } from '../constants/geography';

// ============================================
// ALGORITMO DE MATCHING MEJORADO v2.0
// ============================================

// Extraer grupo principal de una categoría del formulario
// Ej: "Moda Mujer Ropa  Jeans" → "Moda Mujer"
// Ej: "Belleza, Estética y Bienestar Peluquería" → "Belleza, Estética y Bienestar"
// ✅ Maneja tanto string como array (Supabase)
const extractCategoryGroup = (categoryInput: string | string[]): string => {
  if (!categoryInput) return 'Otro';
  
  // Si es array, usar el primer elemento
  const categoryString = Array.isArray(categoryInput) 
    ? (categoryInput[0] || '') 
    : categoryInput;
  
  if (!categoryString || typeof categoryString !== 'string') return 'Otro';
  
  // Buscar coincidencia con grupos conocidos
  for (const group of CATEGORY_GROUPS) {
    if (categoryString.startsWith(group)) {
      return group;
    }
  }
  
  // Fallback: tomar primera parte antes de doble espacio
  const parts = categoryString.split('  ');
  return parts[0]?.trim() || 'Otro';
};

// Extraer subcategoría
const extractSubCategory = (categoryString: string): string => {
  if (!categoryString) return 'General';
  const parts = categoryString.split('  ').filter(Boolean);
  return parts.length > 1 ? parts.slice(1).join(' / ') : 'General';
};

// Extraer grupo de afinidad
// Ej: "Bienestar y Salud  Nutrición / alimentación saludable" → "Bienestar y Salud"
const extractAffinityGroup = (affinityString: string): string => {
  if (!affinityString) return '';
  const parts = affinityString.split('  ');
  return parts[0]?.trim() || affinityString;
};

// Grupos de categorías que tienen SINERGIA entre sí - COMPLETO según CATEGORY_GROUPS
const SYNERGY_MAP: Record<string, string[]> = {
  'Moda Mujer': ['Belleza, Estética y Bienestar', 'Arte, Diseño y Creatividad', 'Eventos', 'Moda Hombre'],
  'Moda Hombre': ['Belleza, Estética y Bienestar', 'Arte, Diseño y Creatividad', 'Eventos', 'Moda Mujer'],
  'Belleza, Estética y Bienestar': ['Moda Mujer', 'Moda Hombre', 'Alimentos y Gastronomía', 'Eventos', 'Servicios Profesionales'],
  'Alimentos y Gastronomía': ['Eventos', 'Turismo', 'Belleza, Estética y Bienestar', 'Industria y Manufactura', 'Transporte y Logística'],
  'Eventos': ['Alimentos y Gastronomía', 'Arte, Diseño y Creatividad', 'Turismo', 'Transporte y Logística', 'Moda Mujer'],
  'Arte, Diseño y Creatividad': ['Moda Mujer', 'Moda Hombre', 'Tecnología y Desarrollo', 'Educación y Capacitación', 'Eventos'],
  'Tecnología y Desarrollo': ['Arte, Diseño y Creatividad', 'Educación y Capacitación', 'Servicios Profesionales', 'Negocio'],
  'Servicios Profesionales': ['Tecnología y Desarrollo', 'Educación y Capacitación', 'Negocio', 'Belleza, Estética y Bienestar'],
  'Educación y Capacitación': ['Servicios Profesionales', 'Arte, Diseño y Creatividad', 'Tecnología y Desarrollo'],
  'Turismo': ['Eventos', 'Alimentos y Gastronomía', 'Transporte y Logística', 'Arte, Diseño y Creatividad'],
  'Mascotas y Animales': ['Belleza, Estética y Bienestar', 'Alimentos y Gastronomía', 'Servicios Profesionales'],
  'Negocio': ['Servicios Profesionales', 'Tecnología y Desarrollo', 'Transporte y Logística', 'Industria y Manufactura'],
  'Industria y Manufactura': ['Negocio', 'Alimentos y Gastronomía', 'Transporte y Logística'],
  'Construcción y Mantención': ['Negocio', 'Oficio', 'Servicios Profesionales'],
  'Oficio': ['Construcción y Mantención', 'Negocio', 'Transporte y Logística'],
  'Transporte y Logística': ['Negocio', 'Eventos', 'Turismo', 'Alimentos y Gastronomía', 'Industria y Manufactura'],
  'Otro': ['Negocio', 'Servicios Profesionales', 'Tecnología y Desarrollo'],
};

// Rangos de facturación ordenados para comparación
const REVENUE_LEVELS: Record<string, number> = {
  'Menos de $500.000': 1,
  '$500.000 - $2.000.000': 2,
  '$2.000.000 - $5.000.000': 3,
  '$5.000.000 - $10.000.000': 4,
  'Más de $10.000.000': 5,
};

// Verificar compatibilidad por facturación
const checkRevenueCompatibility = (
  revenue1: string | undefined,
  revenue2: string | undefined
): { bonus: number; reason?: string } => {
  if (!revenue1 || !revenue2) {
    return { bonus: 0 }; // Sin datos, no penalizar ni bonificar
  }
  
  const level1 = REVENUE_LEVELS[revenue1] || 0;
  const level2 = REVENUE_LEVELS[revenue2] || 0;
  
  if (level1 === 0 || level2 === 0) {
    return { bonus: 0 }; // Valor no reconocido
  }
  
  const diff = Math.abs(level1 - level2);
  
  if (diff === 0) {
    // Mismo rango = muy compatible
    return { bonus: 10, reason: 'Mismo nivel de negocio' };
  } else if (diff === 1) {
    // Rango adyacente = compatible
    return { bonus: 5, reason: 'Nivel de negocio similar' };
  } else if (diff >= 3) {
    // Muy diferentes = penalizar un poco
    return { bonus: -5 };
  }
  
  return { bonus: 0 };
};

// Inferir región desde ciudad o comuna
const inferRegionFromCity = (city: string | undefined): string | null => {
  if (!city) return null;
  const cityLower = city.toLowerCase().trim();
  
  // Buscar en qué región está esta ciudad/comuna
  for (const region of REGIONS) {
    // Verificar si es la comuna exacta
    if (region.comunas.some(c => c.toLowerCase() === cityLower)) {
      return region.id;
    }
    // Verificar si contiene el nombre de la región
    if (cityLower.includes(region.shortName.toLowerCase()) || 
        region.shortName.toLowerCase().includes(cityLower)) {
      return region.id;
    }
  }
  
  // Casos especiales comunes
  if (cityLower.includes('santiago') || cityLower.includes('providencia') || 
      cityLower.includes('las condes') || cityLower.includes('ñuñoa') ||
      cityLower.includes('vitacura') || cityLower.includes('la florida')) {
    return 'metropolitana';
  }
  if (cityLower.includes('viña') || cityLower.includes('valparaíso') || cityLower.includes('valparaiso')) {
    return 'valparaiso';
  }
  if (cityLower.includes('concepción') || cityLower.includes('concepcion')) {
    return 'biobio';
  }
  
  return null;
};

// Inferir comuna desde ciudad
const inferComunaFromCity = (city: string | undefined): string | null => {
  if (!city) return null;
  const cityLower = city.toLowerCase().trim();
  
  for (const region of REGIONS) {
    const comuna = region.comunas.find(c => c.toLowerCase() === cityLower);
    if (comuna) return comuna;
  }
  
  return null;
};

// Verificar si una comuna pertenece a una región
const isComunaInRegion = (comuna: string, regionId: string): boolean => {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) return false;
  return region.comunas.some(c => c.toLowerCase() === comuna.toLowerCase());
};

// Obtener región de una comuna
const getRegionOfComuna = (comuna: string): string | null => {
  for (const region of REGIONS) {
    if (region.comunas.some(c => c.toLowerCase() === comuna.toLowerCase())) {
      return region.id;
    }
  }
  return null;
};

// ============================================
// MATCHING GEOGRÁFICO ESTRICTO
// ============================================
// LOCAL solo con LOCAL de la misma comuna
// REGIONAL solo con REGIONAL de mismas regiones  
// NACIONAL con todos

const checkGeographicCompatibility = (
  user1Scope: string | undefined,
  user1Comuna: string | undefined,
  user1Regions: string[] | undefined,
  user2Scope: string | undefined,
  user2Comuna: string | undefined,
  user2Regions: string[] | undefined,
  // Campos adicionales para inferencia
  user1City?: string,
  user2City?: string
): { compatible: boolean; bonus: number; reason?: string } => {
  
  // Inferir datos faltantes desde city
  const comuna1 = user1Comuna || inferComunaFromCity(user1City);
  const comuna2 = user2Comuna || inferComunaFromCity(user2City);
  const region1 = user1Regions?.length ? user1Regions : 
    (comuna1 ? [getRegionOfComuna(comuna1)].filter(Boolean) as string[] : 
    (user1City ? [inferRegionFromCity(user1City)].filter(Boolean) as string[] : []));
  const region2 = user2Regions?.length ? user2Regions :
    (comuna2 ? [getRegionOfComuna(comuna2)].filter(Boolean) as string[] : 
    (user2City ? [inferRegionFromCity(user2City)].filter(Boolean) as string[] : []));
  
  // Si alguno es NACIONAL, matchea con todos
  if (user1Scope === 'NACIONAL' || user2Scope === 'NACIONAL') {
    return { compatible: true, bonus: 0, reason: 'Alcance nacional' };
  }
  
  // LOCAL solo con LOCAL de la MISMA COMUNA
  if (user1Scope === 'LOCAL' && user2Scope === 'LOCAL') {
    if (comuna1 && comuna2 && comuna1.toLowerCase() === comuna2.toLowerCase()) {
      return { compatible: true, bonus: 15, reason: 'Misma comuna' };
    }
    return { compatible: false, bonus: 0, reason: 'Solo matchea con su comuna' };
  }
  
  // LOCAL NO matchea con REGIONAL (regla estricta)
  if ((user1Scope === 'LOCAL' && user2Scope === 'REGIONAL') ||
      (user1Scope === 'REGIONAL' && user2Scope === 'LOCAL')) {
    return { compatible: false, bonus: 0, reason: 'LOCAL no matchea con REGIONAL' };
  }
  
  // REGIONAL solo con REGIONAL de mismas regiones
  if (user1Scope === 'REGIONAL' && user2Scope === 'REGIONAL') {
    if (region1.length === 0 || region2.length === 0) {
      // Si no tienen regiones definidas, usar inferencia
      return { compatible: region1.length > 0 && region2.length > 0, bonus: 0 };
    }
    
    const sharedRegions = region1.filter(r => region2.includes(r));
    if (sharedRegions.length > 0) {
      return { compatible: true, bonus: 10, reason: 'Regiones compartidas' };
    }
    return { compatible: false, bonus: 0, reason: 'Sin regiones en común' };
  }
  
  // Si no tienen scope definido, inferir desde city y ser permisivos
  if (!user1Scope || !user2Scope) {
    // Usuarios sin scope definido: intentar inferir compatibilidad
    if (region1.length > 0 && region2.length > 0) {
      const shared = region1.filter(r => region2.includes(r));
      if (shared.length > 0) {
        return { compatible: true, bonus: 5, reason: 'Misma región (inferido)' };
      }
    }
    // Sin datos geográficos, asumir NACIONAL
    return { compatible: true, bonus: 0, reason: 'Sin datos geográficos' };
  }
  
  return { compatible: true, bonus: 0 };
};

// Calcular score de compatibilidad entre dos usuarios
const calculateCompatibilityScore = (
  user1Category: string,
  user1Affinity: string,
  user2Category: string,
  user2Affinity: string,
  // Parámetros de geografía opcionales (incluye city para inferencia)
  user1Geo?: { scope?: string; comuna?: string; regions?: string[]; city?: string },
  user2Geo?: { scope?: string; comuna?: string; regions?: string[]; city?: string },
  // Parámetros de facturación opcionales
  user1Revenue?: string,
  user2Revenue?: string
): { score: number; reason: string } => {
  let score = 50; // Base score
  let reasons: string[] = [];
  
  const group1 = extractCategoryGroup(user1Category);
  const group2 = extractCategoryGroup(user2Category);
  const affGroup1 = extractAffinityGroup(user1Affinity);
  const affGroup2 = extractAffinityGroup(user2Affinity);
  
  // 0. Verificar compatibilidad geográfica primero
  if (user1Geo && user2Geo) {
    const geoCompat = checkGeographicCompatibility(
      user1Geo.scope, user1Geo.comuna, user1Geo.regions,
      user2Geo.scope, user2Geo.comuna, user2Geo.regions,
      user1Geo.city, user2Geo.city  // Para inferir ubicación desde city
    );
    
    if (!geoCompat.compatible) {
      // Si no son geográficamente compatibles, score muy bajo
      return { score: 25, reason: geoCompat.reason || 'Incompatibilidad geográfica' };
    }
    
    score += geoCompat.bonus;
    if (geoCompat.reason && geoCompat.bonus > 0) {
      reasons.push(geoCompat.reason);
    }
  }
  
  // 0.5 Si alguno no tiene categoría, ser permisivo pero no penalizar
  const hasCategory1 = user1Category && user1Category !== 'General' && user1Category.trim() !== '';
  const hasCategory2 = user2Category && user2Category !== 'General' && user2Category.trim() !== '';
  
  if (!hasCategory1 || !hasCategory2) {
    // Usuario sin categoría definida: matchear por afinidad si existe
    if (affGroup1 && affGroup2 && affGroup1 === affGroup2) {
      score += 15;
      reasons.push('Intereses compartidos');
    } else if (affGroup1 && affGroup2) {
      score += 5;
      reasons.push('Potencial de colaboración');
    }
    // No penalizar, dejar score base
  }
  // 1. Misma categoría exacta = EXCLUIR (competencia directa - NO MATCHEAN)
  else if (user1Category === user2Category) {
    // Competencia directa = EXCLUIR COMPLETAMENTE
    return { score: 15, reason: 'Competencia directa - No compatible' };
  }
  // 2. Mismo grupo pero diferente subcategoría = BUENO (cross-promotion)
  else if (group1 === group2) {
    score += 15;
    reasons.push('Cross-promotion en mismo rubro');
  }
  // 3. Grupos con sinergia = MUY BUENO
  else if (SYNERGY_MAP[group1]?.includes(group2)) {
    score += 25;
    reasons.push('Audiencias complementarias');
  }
  // 4. Grupos sin relación = NEUTRAL a MALO
  else {
    // Verificar si tienen alguna relación indirecta
    const hasIndirectRelation = Object.entries(SYNERGY_MAP).some(([key, values]) => 
      (key === group1 || values.includes(group1)) && 
      (key === group2 || values.includes(group2))
    );
    
    if (hasIndirectRelation) {
      score += 5;
      reasons.push('Nuevas oportunidades de negocio');
    } else {
      score -= 10; // Reducir penalización para dar más variedad
      reasons.push('Amplía tu red de contactos');
    }
  }
  
  // 5. Compatibilidad por facturación
  if (user1Revenue && user2Revenue) {
    const revenueCompat = checkRevenueCompatibility(user1Revenue, user2Revenue);
    score += revenueCompat.bonus;
    if (revenueCompat.reason && revenueCompat.bonus > 0) {
      reasons.push(revenueCompat.reason);
    }
  }
  
  // 6. Misma afinidad = BONUS
  if (affGroup1 && affGroup2 && affGroup1 === affGroup2) {
    score += 20;
    reasons.push('Comparten valores e intereses');
  }
  // 7. Afinidades relacionadas
  else if (affGroup1 && affGroup2) {
    const affinityRelations: Record<string, string[]> = {
      'Bienestar y Salud': ['Diseño y Estilo', 'Estilo de Vida y Experiencias'],
      'Diseño y Estilo': ['Bienestar y Salud', 'Digital y Tecnología'],
      'Digital y Tecnología': ['Educación y Desarrollo', 'Economía y Negocios'],
      'Sustentabilidad': ['Bienestar y Salud', 'Conciencia y Propósito'],
      'Estilo de Vida y Experiencias': ['Bienestar y Salud', 'Diseño y Estilo'],
    };
    
    if (affinityRelations[affGroup1]?.includes(affGroup2)) {
      score += 10;
      reasons.push('Afinidades relacionadas');
    }
  }
  
  // Clamp score entre 30 y 98
  score = Math.max(30, Math.min(98, score));
  
  // Seleccionar la razón más relevante
  const reason = reasons.length > 0 
    ? reasons[0] 
    : 'Potencial de colaboración';
  
  return { score, reason };
};

// Verificar si dos usuarios son compatibles (score mínimo)
const areUsersCompatible = (
  user1Category: string,
  user1Affinity: string,
  user2Category: string,
  user2Affinity: string,
  minScore: number = 45
): boolean => {
  const { score } = calculateCompatibilityScore(user1Category, user1Affinity, user2Category, user2Affinity);
  return score >= minScore;
};

// Gender-separated names for realistic avatars
const MALE_NAMES = ["Carlos", "Felipe", "Jorge", "Diego", "Luis", "Javier", "Ricardo", "Matias", "Pablo", "Andres", "Jose", "Manuel", "Cristian", "Nicolas", "Fernando"];
const FEMALE_NAMES = ["Ana", "Maria", "Sofia", "Valentina", "Camila", "Fernanda", "Isabel", "Gabriela", "Daniela", "Constanza", "Carolina", "Francisca", "Catalina", "Javiera", "Paula"];
const LAST_NAMES = ["Gonzalez", "Muñoz", "Rojas", "Diaz", "Perez", "Soto", "Contreras", "Silva", "Martinez", "Sepulveda", "Morales", "Rodriguez", "Lopez", "Fuentes", "Hernandez", "Torres", "Araya", "Flores", "Espinoza", "Valenzuela"];

const COMPANY_SUFFIXES = ["SpA", "Ltda", "Consultores", "Studio", "Lab", "Creativos", "Chile", "Group", "Solutions", "Design", "Eco", "Tech", "Global", "Market"];
const COMPANY_PREFIXES = ["Nova", "Impulsa", "Eco", "Crea", "Visual", "Smart", "Bio", "Tecno", "Innova", "Tribu", "Alpha", "Omega", "Red", "Blue", "Green", "Aura", "Zen", "Vital"];
const CITIES = ["Santiago", "Valparaíso", "Concepción", "La Serena", "Temuco", "Antofagasta", "Puerto Varas", "Viña del Mar", "Providencia", "Las Condes", "Vitacura", "Ñuñoa"];

const BIO_TEMPLATES = [
  "Ayudamos a nuestros clientes a conectar con su propósito a través de productos de {subcategory} de alta calidad.",
  "Somos una empresa líder en {category} enfocada en soluciones innovadoras para el mercado chileno.",
  "Dedicados a la excelencia en {subcategory}, buscamos alianzas estratégicas para expandir nuestro impacto.",
  "Transformamos el sector de {category} con un enfoque sustentable y centrado en el usuario.",
  "Expertos en {subcategory} con más de 5 años de experiencia en el ecosistema emprendedor.",
  "Creando el futuro de {subcategory} desde Chile para el mundo."
];

// Unsplash Image IDs mapped by category for pretty covers - Updated for Emerald/Nature/Gold feel
const COVER_IMAGES: Record<string, string[]> = {
  "Bienestar y Salud": ["1502082553048-f009c37129b9", "1544367563-121cf674e6cd", "1498837167922-9dd653618197"], // Nature, Forest, Spa
  "Diseño y Estilo": ["1507652319164-999906626d17", "1496293455970-f8581aae0e3c", "1550614000-4b9519e02eb3"], // Texture, Cloth, Gold
  "Digital y Tecnología": ["1451187580459-43490279c0fa", "1518770660439-4636190af475", "1550751827-4bd374c3f58b"], // Circuit, Dark tech
  "Sustentabilidad": ["1470058869958-2a77ade41c02", "1500382017468-9049fed747ef", "1466692476868-aef1dfb1e735"], // Leaves, Forest, Green
  "Servicios Profesionales": ["1486406146926-c627a92ad1ab", "1497215728101-856f4ea42174", "1454165804606-c3d57bc86b40"], // Architecture, Office
  "Estilo de Vida y Experiencias": ["1542204165-65bf26472b9b", "1533174072545-a8f67f0c536c", "1516455594145-63344849c22d"], // Hiking, Travel, Food
  "default": ["1518531933871-296adeb54dd0", "1475924156734-496f6cac6ec1", "1550684848-fac1c5b4e853"] // Forest mist, textures
};

const randomFrom = <T,>(collection: T[]): T => collection[Math.floor(Math.random() * collection.length)];

const getRandomCover = (category: string): string => {
  const ids = COVER_IMAGES[category] || COVER_IMAGES["default"];
  const id = randomFrom(ids);
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;
};

const parseCategoryEntry = (entry: string) => {
  const normalized = entry.replace(/\s+/g, ' ').trim();
  const parts = entry.split('  ').filter(Boolean);
  if (parts.length === 0) {
    return { category: normalized || 'General', subCategory: 'General' };
  }
  const [category, ...rest] = parts;
  const subCategory = rest.join(' / ').trim() || 'General';
  return { category: category.trim(), subCategory };
};

const generateMockProfile = (index: number): MatchProfile => {
  const entry = randomFrom(TRIBE_CATEGORY_OPTIONS);
  const { category, subCategory } = parseCategoryEntry(entry);
  const isFemale = Math.random() > 0.5;
  const firstName = randomFrom(isFemale ? FEMALE_NAMES : MALE_NAMES);
  const lastName = randomFrom(LAST_NAMES);
  const companyName = `${randomFrom(COMPANY_PREFIXES)} ${randomFrom(COMPANY_SUFFIXES)}`;
  const bioTemplate = randomFrom(BIO_TEMPLATES);
  const bio = bioTemplate.replace("{category}", category).replace("{subcategory}", subCategory);

  const avatarUrl = `https://randomuser.me/api/portraits/${isFemale ? 'women' : 'men'}/${Math.floor(Math.random() * 70)}.jpg`;
  const companyLogoUrl = `https://api.dicebear.com/9.x/shapes/svg?seed=${companyName.replace(/\s/g, '')}&backgroundColor=transparent`;

  const slug = companyName.toLowerCase().replace(/\s+/g, '');

  return {
    id: `profile-${index + 1}`,
    name: `${firstName} ${lastName}`,
    companyName,
    category,
    subCategory,
    avatarUrl,
    companyLogoUrl,
    coverUrl: getRandomCover(category),
    whatsapp: `569${Math.floor(Math.random() * 90000000 + 10000000)}`,
    location: randomFrom(CITIES),
    website: `www.${slug}.cl`,
    bio,
    tags: [category.split(' ')[0], subCategory, 'Chile', 'Emprendimiento'].slice(0, 3),
    foundingYear: 2014 + Math.floor(Math.random() * 10),
    instagram: `@${slug}`
  };
};

// ⚠️ DUMMY_DATABASE ELIMINADO - Solo usuarios reales de Firebase
const DUMMY_DATABASE: MatchProfile[] = [];

// Convierte un UserProfile de la DB real a MatchProfile para la UI
const userToMatchProfile = (user: UserProfile): MatchProfile => {
  const slug = user.companyName.toLowerCase().replace(/\s+/g, '');
  
  // ✅ Manejar category como array (Supabase) o string (legacy)
  let mainCategory = 'General';
  let categoryParts: string[] = [];
  
  if (Array.isArray(user.category)) {
    // category es un array en Supabase
    mainCategory = user.category[0] || 'General';
    categoryParts = user.category;
  } else if (typeof user.category === 'string') {
    // category es un string (legacy) - formato: "Grupo Principal  Subcategoría"
    categoryParts = (user.category || 'General').split('  ').filter(Boolean);
    mainCategory = categoryParts[0] || 'General';
  }
  
  // subCategory: usar segunda parte de category, o sector, o extraer de affinity
  const subCategory = categoryParts.length > 1 
    ? categoryParts.slice(1).join(' / ') 
    : (user.sector || extractAffinityGroup(user.affinity) || 'General');
  
  // Usar avatar real del perfil o generar uno basado en el nombre
  const avatarUrl = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6161FF&color=fff&size=200&bold=true`;
  
  // Usar logo real o generar uno
  const companyLogoUrl = user.companyLogoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.companyName)}&background=00CA72&color=fff&size=100`;
  
  // Usar cover real o generar uno
  const coverUrl = user.coverUrl || getRandomCover(mainCategory);
  
  // Usar bio real del perfil
  const bio = user.bio || user.businessDescription || `${user.companyName} - Especialistas en ${mainCategory}.`;
  
  return {
    id: user.id,
    name: user.name,
    companyName: user.companyName,
    category: mainCategory,
    subCategory: subCategory,
    avatarUrl,
    companyLogoUrl,
    coverUrl,
    whatsapp: user.whatsapp || user.phone || '',
    phone: user.phone || user.whatsapp || '',  // Para WhatsApp directo en Tribu X
    location: user.city + (user.sector ? `, ${user.sector}` : ''),
    website: user.website || '',
    bio,
    tags: [mainCategory.split(' ')[0], subCategory.split(' ')[0], user.city].filter(Boolean).slice(0, 3),
    foundingYear: 2020,
    instagram: user.instagram,
    email: user.email || ''
  };
};

// Obtiene todos los usuarios reales como MatchProfile
export const getRealUserProfiles = (): MatchProfile[] => {
  const users = getAllUsers();
  return users.map(userToMatchProfile);
};

// Función para generar número pseudo-aleatorio determinístico basado en seed
const seededRandom = (seed: string, index: number): number => {
  const hash = seed.split('').reduce((acc, char, i) => {
    return acc + char.charCodeAt(0) * (i + 1) * (index + 1);
  }, 0);
  return (Math.sin(hash) * 10000) % 1;
};

// Mezclar array de forma determinística basada en userId
const seededShuffle = <T>(array: T[], seed: string): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.abs(seededRandom(seed, i)) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// IDs de perfiles de relleno (byturquia, terraflor, elevate)
// ⚠️ FILLER_EMAILS ELIMINADO - No usamos usuarios de relleno
const FILLER_EMAILS: string[] = [];

export const generateTribeAssignments = (userCategory: string, currentUserId?: string, userAffinity?: string): TribeAssignments => {
  const realUsers = getAllUsers();
  const currentUser = realUsers.find(u => u.id === currentUserId);
  const myCategory = currentUser?.category || userCategory;
  const myAffinity = currentUser?.affinity || userAffinity || '';
  
  // Datos geográficos del usuario actual (incluye city para inferencia)
  const myGeo = currentUser ? {
    scope: currentUser.scope,
    comuna: currentUser.comuna,
    regions: currentUser.selectedRegions,
    city: currentUser.city  // Para inferir ubicación si faltan datos
  } : undefined;
  
  if (realUsers.length >= 10) {
    let pool = realUsers
      .filter(u => u.id !== currentUserId)
      .map(userToMatchProfile);
    
    // Calcular compatibilidad CON GEOGRAFÍA
    const poolWithScores = pool.map(profile => {
      const otherUser = realUsers.find(u => u.id === profile.id);
      const otherCategory = otherUser?.category || profile.category;
      const otherAffinity = otherUser?.affinity || '';
      
      // Datos geográficos del otro usuario (incluye city para inferencia)
      const otherGeo = otherUser ? {
        scope: otherUser.scope,
        comuna: otherUser.comuna,
        regions: otherUser.selectedRegions,
        city: otherUser.city  // Para inferir ubicación si faltan datos
      } : undefined;
      
      // ✅ Convertir category a string si es array para calculateCompatibilityScore
      const myCategoryStr = Array.isArray(myCategory) ? myCategory[0] || 'General' : myCategory;
      const otherCategoryStr = Array.isArray(otherCategory) ? otherCategory[0] || 'General' : otherCategory;
      const { score, reason } = calculateCompatibilityScore(
        myCategoryStr,
        myAffinity,
        otherCategoryStr,
        otherAffinity,
        myGeo,
        otherGeo,
        currentUser?.revenue,  // Facturación usuario actual
        otherUser?.revenue     // Facturación otro usuario
      );
      
      return { profile, score, reason };
    });
    
    // Filtrar incompatibles
    const compatible = poolWithScores.filter(p => p.score >= 40);
    compatible.sort((a, b) => b.score - a.score);
    
    console.log(`🎯 Matching: ${compatible.length} compatibles de ${pool.length} usuarios`);
    
    const seed = currentUserId || 'default-seed';
    const highScore = compatible.filter(p => p.score >= 70);
    const mediumScore = compatible.filter(p => p.score >= 50 && p.score < 70);
    const lowScore = compatible.filter(p => p.score >= 40 && p.score < 50);
    
    const shuffledHigh = seededShuffle(highScore, seed);
    const shuffledMedium = seededShuffle(mediumScore, seed + '-med');
    const shuffledLow = seededShuffle(lowScore, seed + '-low');
    
    // IMPORTANTE: Eliminar duplicados - un perfil NO puede aparecer 2 veces en la misma categoría
    const seenIds = new Set<string>();
    const finalList = [
      ...shuffledHigh.slice(0, 8),
      ...shuffledMedium.slice(0, 6),
      ...shuffledLow.slice(0, 4),
      ...shuffledHigh.slice(8),
      ...shuffledMedium.slice(6),
    ]
      .map(p => p.profile)
      .filter(profile => {
        if (seenIds.has(profile.id)) return false;
        seenIds.add(profile.id);
        return true;
      });
    
    // Solo usuarios reales - sin relleno ni mock
    let allProfiles = [...finalList];
    
    // Dividir en 2 grupos SIN duplicados dentro de cada grupo
    const toShare = allProfiles.slice(0, 10);
    const shareWithMe = allProfiles.slice(10, 20);
    
    console.log(`✅ Tribu generada: ${toShare.length} a impulsar + ${shareWithMe.length} que impulsan (${finalList.length} reales)`);
    
    return { toShare, shareWithMe };
  }
  
  // Fallback: Menos de 10 usuarios reales - usar solo los que hay
  console.log('⚠️ Pocos usuarios reales, usando solo usuarios disponibles...');
  
  // Convertir usuarios reales a perfiles (excluyendo actual)
  const realProfiles = realUsers
    .filter(u => u.id !== currentUserId)
    .map(userToMatchProfile);
  
  // Solo usuarios reales - sin relleno ni mock
  const allProfiles = [...realProfiles];
  
  // Mezclar para variedad
  const mockSeed = currentUserId || 'default-seed';
  const shuffled = seededShuffle(allProfiles, mockSeed);

  // Dividir lo que haya disponible
  const half = Math.ceil(shuffled.length / 2);
  const toShare = shuffled.slice(0, half);
  const shareWithMe = shuffled.slice(half);
  
  console.log(`✅ Tribu con usuarios reales: ${toShare.length} a impulsar + ${shareWithMe.length} que impulsan`);

  return { toShare, shareWithMe };
};

export const getProfileById = (id: string): MatchProfile | undefined => {
  const realUsers = getAllUsers();
  const realUser = realUsers.find(u => u.id === id);
  if (realUser) {
    return userToMatchProfile(realUser);
  }
  // Solo usuarios reales - sin mock
  return undefined;
};

// Obtiene el perfil del usuario actual desde la DB real
export const getMyProfile = (): MatchProfile => {
  const currentUserId = localStorage.getItem('tribu_current_user');
  if (currentUserId) {
    const realUsers = getAllUsers();
    const currentUser = realUsers.find(u => u.id === currentUserId);
    if (currentUser) {
      return userToMatchProfile(currentUser);
    }
  }
  
  // Si hay survey guardado, usar esos datos
  const surveyData = localStorage.getItem('surveyResponses');
  if (surveyData) {
    const survey = JSON.parse(surveyData);
    return {
      id: 'current-user',
      name: survey.name || 'Usuario',
      companyName: survey.companyName || 'Mi Empresa',
      category: survey.category?.split('  ')[0] || 'General',
      subCategory: survey.category?.split('  ').slice(1).join(' / ') || 'General',
      avatarUrl: 'https://randomuser.me/api/portraits/lego/1.jpg',
      companyLogoUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=miempresa&backgroundColor=transparent',
      coverUrl: getRandomCover('default'),
      whatsapp: survey.phone || '',
      location: survey.city || 'Chile',
      website: survey.website || '',
      bio: `${survey.companyName || 'Mi Empresa'} - Buscando conexiones en ${survey.affinity?.split('  ')[0] || 'diversos rubros'}`,
      tags: ['Emprendedor', survey.city || 'Chile'],
      foundingYear: 2024,
      instagram: survey.instagram || ''
    };
  }
  
  // Fallback
  const profile = DUMMY_DATABASE[0];
  return {
    ...profile,
    name: "Usuario Demo",
    companyName: "Mi Empresa",
    bio: "Perfil de demostración",
    category: "General"
  };
};

export const generateMockMatches = (userCategory: string, currentUserId?: string, userAffinity?: string): Match[] => {
  // ✅ MATCHES FIJOS: Siempre mostrar los 4 usuarios del equipo (preview del sistema 10+10)
  const FIXED_USER_EMAILS = [
    'doraluz@terraflorpaisajismo.cl',      // Doraluz - Terraflor Paisajismo
    'dafnafinkelstein@gmail.com',          // Dafna - ByTurquia
    'guille@elevatecreativo.com',          // Guillermo - Elevate Creativo
    'rincondeoz@gmail.com'                 // Oscar
  ];

  // Buscar los 4 usuarios fijos por email usando getAllUsers
  const allUsers = getAllUsers();
  const fixedUsers = FIXED_USER_EMAILS
    .map(email => allUsers.find(u => u.email.toLowerCase() === email.toLowerCase()))
    .filter((user): user is UserProfile => user !== undefined);
  
  // Excluir al usuario actual si es uno de los 4
  const filteredUsers = currentUserId 
    ? fixedUsers.filter(u => u.id !== currentUserId)
    : fixedUsers;
  
  if (filteredUsers.length === 0) {
    console.log('⚠️ No se encontraron usuarios fijos para matches');
    return [];
  }
  
  // Convertir a MatchProfile y crear Match objects
  const matches = filteredUsers.map(user => {
    const profile = userToMatchProfile(user);
    return {
      id: `match-${profile.id}`,
      targetProfile: profile,
      affinityScore: 85, // Score fijo alto para estos usuarios
      reason: 'Miembro del equipo Tribu Impulsa',
      status: 'New' as const
    };
  });
  
  console.log(`✅ ${matches.length} matches fijos generados (preview del sistema 10+10)`);
  return matches;
};

export const getMockActivity = (userId?: string): ActivityItem[] => {
  // Si hay userId, intentar obtener notificaciones reales
  if (userId) {
    const notifications = getUserNotifications(userId);
    if (notifications.length > 0) {
      return notifications.map(n => ({
        id: n.id,
        type: n.type === 'tribe_assigned' ? 'system' : 
              n.type === 'match_new' ? 'match' : 
              n.type === 'report_received' ? 'update' : 'system',
        title: n.title,
        description: n.message,
        timestamp: formatTimestamp(n.createdAt),
        isRead: n.read
      }));
    }
  }
  
  // Fallback con actividad por defecto
  return [
    {
      id: 'welcome-1',
      type: 'system',
      title: '¡Bienvenido a Tribu Impulsa!',
      description: 'Tu perfil está activo. El Algoritmo Tribal está buscando conexiones.',
      timestamp: 'Ahora',
      isRead: false
    },
    {
      id: 'tip-1',
      type: 'update',
      title: 'Consejo Tribal',
      description: 'Completa tu checklist semanal para maximizar tu visibilidad.',
      timestamp: 'Hoy',
      isRead: false
    }
  ];
};

// Helper para formatear timestamps
const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-CL');
};