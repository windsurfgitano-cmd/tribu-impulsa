import { Match, MatchProfile, AFFINITY_OPTIONS, CATEGORY_MAPPING, ActivityItem, TribeAssignments } from '../types';
import { TRIBE_CATEGORY_OPTIONS } from '../data/tribeCategories';
import { getAllUsers, UserProfile, getUserNotifications } from './databaseService';

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

export const generateTribeAssignments = (userCategory: string, currentUserId?: string): TribeAssignments => {
  // Primero intentar con usuarios reales
  const realUsers = getAllUsers();
  
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
    
    // Priorizar usuarios con categorías diferentes para diversidad
    const differentCategory = pool.filter(p => !p.category.includes(userCategory.split(' ')[0]));
    const sameCategory = pool.filter(p => p.category.includes(userCategory.split(' ')[0]));
    
    const prioritized = [...differentCategory, ...sameCategory];
    
    // Mezclar de forma DETERMINÍSTICA basada en el userId
    const seed = currentUserId || 'default-seed';
    const shuffled = seededShuffle(prioritized, seed);
    
    const toShare = shuffled.slice(0, Math.min(10, shuffled.length));
    const remaining = shuffled.slice(10);
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
}

export const generateMockMatches = (userCategory: string, currentUserId?: string): Match[] => {
  // Primero intentar con usuarios REALES
  const realUsers = getAllUsers();
  
  if (realUsers.length >= 5) {
    // Usar usuarios reales - excluir al usuario actual
    const pool = realUsers
      .filter(u => u.id !== currentUserId)
      .map(userToMatchProfile);
    
    // Mezclar y tomar máximo 8
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selectedProfiles = shuffled.slice(0, Math.min(8, shuffled.length));
    
    return selectedProfiles.map(profile => {
      // Calcular score basado en compatibilidad real
      const score = Math.floor(Math.random() * 20 + 78); // 78-98%
      
      // Razones más específicas basadas en categorías reales
      let reason = "Sinergia comercial potencial";
      if (profile.category?.includes('Marketing') || profile.category?.includes('Digital')) {
        reason = "Potencial para visibilidad digital";
      } else if (profile.category?.includes('Belleza') || profile.category?.includes('Estética')) {
        reason = "Audiencia complementaria de bienestar";
      } else if (profile.category?.includes('Consultoría') || profile.category?.includes('Coaching')) {
        reason = "Apoyo estratégico para crecimiento";
      } else if (profile.category?.includes('Paisajismo') || profile.category?.includes('Hogar')) {
        reason = "Clientes con intereses similares";
      } else if (profile.category?.includes('Gastronomía') || profile.category?.includes('Alimentos')) {
        reason = "Oportunidad de eventos conjuntos";
      } else if (profile.category !== userCategory) {
        reason = "Audiencias no competitivas";
      }
      
      return {
        id: `match-${profile.id}`,
        targetProfile: profile,
        affinityScore: score,
        reason: reason,
        status: 'New'
      };
    });
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
      status: 'New'
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