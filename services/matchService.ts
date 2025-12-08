import { Match, MatchProfile, AFFINITY_OPTIONS, CATEGORY_MAPPING, ActivityItem, TribeAssignments } from '../types';
import { TRIBE_CATEGORY_OPTIONS } from '../data/tribeCategories';
import { getAllUsers, UserProfile, getUserNotifications } from './databaseService';
import { CATEGORIES, AFFINITIES, CATEGORY_GROUPS } from '../constants';

// ============================================
// ALGORITMO DE MATCHING MEJORADO v2.0
// ============================================

// Extraer grupo principal de una categoría del formulario
// Ej: "Moda Mujer Ropa  Jeans" → "Moda Mujer"
// Ej: "Belleza, Estética y Bienestar Peluquería" → "Belleza, Estética y Bienestar"
const extractCategoryGroup = (categoryString: string): string => {
  if (!categoryString) return 'Otro';
  
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

// Grupos de categorías que tienen SINERGIA entre sí
const SYNERGY_MAP: Record<string, string[]> = {
  'Moda Mujer': ['Belleza, Estética y Bienestar', 'Arte, Diseño y Creatividad', 'Eventos'],
  'Moda Hombre': ['Belleza, Estética y Bienestar', 'Arte, Diseño y Creatividad', 'Eventos'],
  'Belleza, Estética y Bienestar': ['Moda Mujer', 'Moda Hombre', 'Alimentos y Gastronomía', 'Eventos'],
  'Alimentos y Gastronomía': ['Eventos', 'Turismo', 'Belleza, Estética y Bienestar'],
  'Eventos': ['Alimentos y Gastronomía', 'Arte, Diseño y Creatividad', 'Turismo', 'Transporte y Logística'],
  'Arte, Diseño y Creatividad': ['Moda Mujer', 'Moda Hombre', 'Tecnología y Desarrollo', 'Educación y Capacitación'],
  'Tecnología y Desarrollo': ['Arte, Diseño y Creatividad', 'Educación y Capacitación', 'Servicios Profesionales'],
  'Servicios Profesionales': ['Tecnología y Desarrollo', 'Educación y Capacitación', 'Negocio'],
  'Educación y Capacitación': ['Servicios Profesionales', 'Arte, Diseño y Creatividad', 'Tecnología y Desarrollo'],
  'Turismo': ['Eventos', 'Alimentos y Gastronomía', 'Transporte y Logística'],
  'Mascotas y Animales': ['Belleza, Estética y Bienestar', 'Alimentos y Gastronomía'],
  'Negocio': ['Servicios Profesionales', 'Tecnología y Desarrollo', 'Transporte y Logística'],
  'Industria y Manufactura': ['Negocio', 'Alimentos y Gastronomía'],
  'Construcción y Mantención': ['Negocio', 'Oficio'],
  'Oficio': ['Construcción y Mantención', 'Negocio'],
  'Transporte y Logística': ['Negocio', 'Eventos', 'Turismo'],
};

// Calcular score de compatibilidad entre dos usuarios
const calculateCompatibilityScore = (
  user1Category: string,
  user1Affinity: string,
  user2Category: string,
  user2Affinity: string
): { score: number; reason: string } => {
  let score = 50; // Base score
  let reasons: string[] = [];
  
  const group1 = extractCategoryGroup(user1Category);
  const group2 = extractCategoryGroup(user2Category);
  const affGroup1 = extractAffinityGroup(user1Affinity);
  const affGroup2 = extractAffinityGroup(user2Affinity);
  
  // 1. Misma categoría exacta = MALO (competencia directa)
  if (user1Category === user2Category) {
    score -= 20;
    reasons.push('Competencia directa');
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
      reasons.push('Potencial sinergia indirecta');
    } else {
      score -= 15;
      reasons.push('Rubros sin relación clara');
    }
  }
  
  // 5. Misma afinidad = BONUS
  if (affGroup1 && affGroup2 && affGroup1 === affGroup2) {
    score += 20;
    reasons.push('Comparten valores e intereses');
  }
  // 6. Afinidades relacionadas
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

const DUMMY_DATABASE: MatchProfile[] = Array.from({ length: 50 }, (_, index) => generateMockProfile(index));

// Convierte un UserProfile de la DB real a MatchProfile para la UI
const userToMatchProfile = (user: UserProfile): MatchProfile => {
  const slug = user.companyName.toLowerCase().replace(/\s+/g, '');
  
  // Usar datos REALES del perfil, no generar placeholders
  const mainCategory = user.category || 'General';
  const subCategory = user.affinity || 'General';
  
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
const FILLER_EMAILS = [
  'dafnafinkelstein@gmail.com',      // By Turquía - Dafna
  'doraluz@terraflorpaisajismo.cl',  // Terraflor Paisajismo - Doraluz  
  'guille@elevatecreativo.com'       // Elevate Agencia - Guillermo
];

export const generateTribeAssignments = (userCategory: string, currentUserId?: string, userAffinity?: string): TribeAssignments => {
  // Primero intentar con usuarios reales
  const realUsers = getAllUsers();
  const currentUser = realUsers.find(u => u.id === currentUserId);
  const myCategory = currentUser?.category || userCategory;
  const myAffinity = currentUser?.affinity || userAffinity || '';
  
  if (realUsers.length >= 10) {
    // Usar usuarios reales
    let pool = realUsers
      .filter(u => u.id !== currentUserId) // Excluir al usuario actual
      .map(userToMatchProfile);
    
    // Si faltan personas, agregar los perfiles de relleno (máx 3)
    if (pool.length < 20) {
      const fillerProfiles = realUsers
        .filter(u => FILLER_EMAILS.includes(u.email.toLowerCase()) && u.id !== currentUserId)
        .map(userToMatchProfile);
      
      // Agregar solo los que no estén ya en el pool
      const existingIds = new Set(pool.map(p => p.id));
      const fillersToAdd = fillerProfiles.filter(f => !existingIds.has(f.id)).slice(0, 3);
      pool = [...pool, ...fillersToAdd];
      
      if (fillersToAdd.length > 0) {
        console.log(`📌 Agregados ${fillersToAdd.length} perfiles de relleno`);
      }
    }
    
    // NUEVO: Calcular compatibilidad y ordenar por score
    const poolWithScores = pool.map(profile => {
      const otherUser = realUsers.find(u => u.id === profile.id);
      const otherCategory = otherUser?.category || profile.category;
      const otherAffinity = otherUser?.affinity || '';
      
      const { score, reason } = calculateCompatibilityScore(
        myCategory,
        myAffinity,
        otherCategory,
        otherAffinity
      );
      
      return { profile, score, reason };
    });
    
    // Filtrar usuarios con score muy bajo (incompatibles)
    const compatible = poolWithScores.filter(p => p.score >= 40);
    
    // Ordenar por score descendente
    compatible.sort((a, b) => b.score - a.score);
    
    console.log(`🎯 Matching: ${compatible.length} compatibles de ${pool.length} usuarios`);
    
    // Mezclar de forma DETERMINÍSTICA pero respetando prioridad por score
    const seed = currentUserId || 'default-seed';
    
    // Dividir en grupos por score para dar variedad
    const highScore = compatible.filter(p => p.score >= 70);
    const mediumScore = compatible.filter(p => p.score >= 50 && p.score < 70);
    const lowScore = compatible.filter(p => p.score >= 40 && p.score < 50);
    
    // Mezclar cada grupo
    const shuffledHigh = seededShuffle(highScore, seed);
    const shuffledMedium = seededShuffle(mediumScore, seed + '-med');
    const shuffledLow = seededShuffle(lowScore, seed + '-low');
    
    // Combinar: mayoría alta compatibilidad, algo de media
    const finalList = [
      ...shuffledHigh.slice(0, 8),
      ...shuffledMedium.slice(0, 6),
      ...shuffledLow.slice(0, 4),
      ...shuffledHigh.slice(8),
      ...shuffledMedium.slice(6),
    ].map(p => p.profile);
    
    const toShare = finalList.slice(0, Math.min(10, finalList.length));
    const remaining = finalList.slice(10);
    const shareWithMe = remaining.slice(0, Math.min(10, remaining.length));
    
    console.log(`✅ Tribu generada para ${seed}: ${toShare.length} a impulsar + ${shareWithMe.length} que impulsan`);
    
    return { toShare, shareWithMe };
  }
  
  // Fallback a datos mock si no hay suficientes usuarios reales
  console.log('⚠️ Usando datos mock (menos de 10 usuarios reales)');
  const pool = [...DUMMY_DATABASE.slice(1)];
  const safePool = pool.filter(profile => profile.category !== userCategory);
  const prioritized = safePool.length >= 20 ? safePool : pool;
  const seed = currentUserId || 'default-seed';
  const shuffled = seededShuffle(prioritized, seed);

  const toShare = shuffled.slice(0, 10);
  const remaining = shuffled.slice(10).filter(profile => !toShare.find(item => item.id === profile.id));
  const shareWithMe = remaining.slice(0, 10);

  return { toShare, shareWithMe };
};

export const getProfileById = (id: string): MatchProfile | undefined => {
  // Primero buscar en usuarios reales
  const realUsers = getAllUsers();
  const realUser = realUsers.find(u => u.id === id);
  if (realUser) {
    return userToMatchProfile(realUser);
  }
  // Fallback a mock
  return DUMMY_DATABASE.find(p => p.id === id);
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
  // Primero intentar con usuarios REALES
  const realUsers = getAllUsers();
  const currentUser = realUsers.find(u => u.id === currentUserId);
  const myCategory = currentUser?.category || userCategory;
  const myAffinity = currentUser?.affinity || userAffinity || '';
  
  if (realUsers.length >= 5) {
    // Usar usuarios reales - excluir al usuario actual
    const pool = realUsers.filter(u => u.id !== currentUserId);
    
    // Calcular compatibilidad REAL para cada usuario
    const matchesWithScores = pool.map(user => {
      const profile = userToMatchProfile(user);
      const { score, reason } = calculateCompatibilityScore(
        myCategory,
        myAffinity,
        user.category || '',
        user.affinity || ''
      );
      
      return { profile, score, reason };
    });
    
    // Filtrar incompatibles y ordenar por score
    const compatible = matchesWithScores
      .filter(m => m.score >= 40)
      .sort((a, b) => b.score - a.score);
    
    // Tomar los mejores 8
    const selectedMatches = compatible.slice(0, Math.min(8, compatible.length));
    
    return selectedMatches.map(({ profile, score, reason }) => ({
      id: `match-${profile.id}`,
      targetProfile: profile,
      affinityScore: score,
      reason: reason,
      status: 'New' as const
    }));
  }
  
  // Fallback a mock si no hay suficientes usuarios reales
  const numberOfMatches = Math.floor(Math.random() * 5) + 8; 
  const shuffled = [...DUMMY_DATABASE.slice(1)].sort(() => 0.5 - Math.random());
  const selectedProfiles = shuffled.slice(0, numberOfMatches);

  return selectedProfiles.map(profile => {
    const reason = "Sinergia comercial potencial";
    const score = Math.floor(Math.random() * (99 - 70) + 70);

    return {
      id: `match-${profile.id}`,
      targetProfile: profile,
      affinityScore: score,
      reason: reason,
      status: 'New' as const
    };
  });
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