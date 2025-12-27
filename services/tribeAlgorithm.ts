// Algoritmo Tribal - Tribu Impulsa
// Genera asignaciones 10+10 REALES basadas en categoría, afinidad y evitando competencia

import { UserProfile, getAllUsers } from './databaseService';

export interface TribeAssignment {
  userId: string;
  // 10 cuentas que ESTE usuario debe compartir
  iShareTo: string[];
  // 10 cuentas que comparten A este usuario
  theyShareToMe: string[];
  // Metadata
  assignedAt: string;
  month: string; // "2025-11" formato año-mes
  version: number;
}

// Categorías que son competencia directa (no deben asignarse entre sí)
// ACTUALIZADO según CATEGORY_GROUPS de constants/categories.ts
const COMPETITION_GROUPS: string[][] = [
  ['Moda Mujer', 'Moda Hombre'], // Competencia en moda
  ['Peluquería', 'Barbería', 'Estética'], // Competencia en belleza
  ['Marketing digital', 'Diseño gráfico', 'Branding'], // Competencia en marketing
  ['Coaching', 'Consultoría', 'Mentoring'], // Competencia en asesoría
  ['Desarrollo software', 'E-commerce', 'Tecnología'], // Competencia en tech
  ['Pastelería', 'Repostería', 'Panadería'], // Competencia en dulces
  ['Abogados', 'Contadores'], // Servicios profesionales similares
  ['Psicólogos', 'Coaching'], // Servicios de desarrollo personal
];

// Afinidades complementarias (se benefician mutuamente)
// ACTUALIZADO según AFFINITY_GROUPS de constants/affinities.ts
const COMPLEMENTARY_AFFINITIES: Record<string, string[]> = {
  'Moda Mujer': ['Belleza', 'Eventos', 'Fotografía', 'Arte'],
  'Moda Hombre': ['Belleza', 'Eventos', 'Fotografía', 'Deportes'],
  'Belleza, Estética y Bienestar': ['Moda', 'Eventos', 'Gastronomía', 'Salud'],
  'Bienestar y Salud': ['Gastronomía', 'Deportes', 'Naturaleza', 'Educación'],
  'Economía y Negocios': ['Tecnología', 'Educación', 'Marketing', 'Servicios'],
  'Negocio': ['Servicios Profesionales', 'Tecnología', 'Transporte'],
  'Alimentos y Gastronomía': ['Eventos', 'Turismo', 'Bienestar', 'Industria'],
  'Eventos': ['Gastronomía', 'Fotografía', 'Moda', 'Transporte', 'Arte'],
  'Familia y Hogar': ['Educación', 'Bienestar', 'Mascotas', 'Construcción'],
  'Tecnología y Desarrollo': ['Negocios', 'Educación', 'Marketing', 'Arte'],
  'Turismo': ['Gastronomía', 'Eventos', 'Transporte', 'Arte'],
  'Mascotas y Animales': ['Belleza', 'Gastronomía', 'Veterinaria'],
  'Educación y Capacitación': ['Tecnología', 'Negocios', 'Arte', 'Servicios'],
  'Arte, Diseño y Creatividad': ['Moda', 'Eventos', 'Tecnología', 'Educación'],
};

// Verificar si dos usuarios son competencia directa
const areCompetitors = (user1: UserProfile, user2: UserProfile): boolean => {
  // ✅ Manejar category como array o string
  const cat1Str = Array.isArray(user1.category) ? user1.category.join(' ') : (user1.category || '');
  const cat2Str = Array.isArray(user2.category) ? user2.category.join(' ') : (user2.category || '');
  
  for (const group of COMPETITION_GROUPS) {
    const cat1InGroup = group.some(cat => 
      cat1Str.toLowerCase().includes(cat.toLowerCase())
    );
    const cat2InGroup = group.some(cat => 
      cat2Str.toLowerCase().includes(cat.toLowerCase())
    );
    if (cat1InGroup && cat2InGroup) return true;
  }
  return false;
};

// Calcular score de compatibilidad entre dos usuarios
const calculateCompatibilityScore = (user1: UserProfile, user2: UserProfile): number => {
  let score = 50; // Base score
  
  // Penalizar competencia directa
  if (areCompetitors(user1, user2)) {
    score -= 100; // Eliminar de consideración
    return score;
  }
  
  // Bonus por afinidad complementaria
  const user1Affinity = user1.affinity || '';
  // ✅ Manejar category como array o string
  const user2Category = Array.isArray(user2.category) ? user2.category.join(' ') : (user2.category || '');
  const complementary = COMPLEMENTARY_AFFINITIES[user1Affinity] || [];
  if (complementary.some(c => user2Category.toLowerCase().includes(c.toLowerCase()))) {
    score += 30;
  }
  
  // Bonus por misma ciudad (colaboración local)
  if (user1.city && user2.city && user1.city.toLowerCase() === user2.city.toLowerCase()) {
    score += 15;
  }
  
  // Bonus por rango de seguidores similar (equilibrio)
  const followers1 = user1.followers || 1000;
  const followers2 = user2.followers || 1000;
  const ratio = Math.min(followers1, followers2) / Math.max(followers1, followers2);
  if (ratio > 0.5) {
    score += 10; // Audiencias similares
  }
  
  // Pequeña variación random para diversidad
  score += Math.random() * 10;
  
  return score;
};

// Generar asignaciones para un usuario específico
const generateAssignmentsForUser = (
  userId: string, 
  allUsers: UserProfile[],
  existingAssignments: Map<string, Set<string>>
): { iShareTo: string[]; theyShareToMe: string[] } => {
  const currentUser = allUsers.find(u => u.id === userId);
  if (!currentUser) return { iShareTo: [], theyShareToMe: [] };
  
  // Filtrar usuarios elegibles (activos, no el mismo usuario)
  const eligibleUsers = allUsers.filter(u => 
    u.id !== userId && 
    u.status === 'active'
  );
  
  // Calcular scores de compatibilidad
  const scoredUsers = eligibleUsers.map(u => ({
    user: u,
    score: calculateCompatibilityScore(currentUser, u)
  })).filter(s => s.score > 0);
  
  // Ordenar por score (mejor primero)
  scoredUsers.sort((a, b) => b.score - a.score);
  
  // Seleccionar top 10 para "Yo comparto"
  const iShareTo: string[] = [];
  for (const scored of scoredUsers) {
    if (iShareTo.length >= 10) break;
    // Evitar asignaciones duplicadas si ya fue asignado
    const userAssignments = existingAssignments.get(scored.user.id);
    if (!userAssignments || userAssignments.size < 10) {
      iShareTo.push(scored.user.id);
    }
  }
  
  // Para "Me comparten", buscar usuarios que aún no tienen 10 asignaciones
  const theyShareToMe: string[] = [];
  for (const scored of scoredUsers) {
    if (theyShareToMe.length >= 10) break;
    if (!iShareTo.includes(scored.user.id)) {
      const userAssignments = existingAssignments.get(scored.user.id);
      if (!userAssignments || userAssignments.size < 10) {
        theyShareToMe.push(scored.user.id);
      }
    }
  }
  
  // Si no hay suficientes, completar con los más compatibles disponibles
  while (iShareTo.length < 10 && scoredUsers.length > iShareTo.length) {
    const next = scoredUsers.find(s => !iShareTo.includes(s.user.id));
    if (next) iShareTo.push(next.user.id);
    else break;
  }
  
  while (theyShareToMe.length < 10 && scoredUsers.length > theyShareToMe.length) {
    const next = scoredUsers.find(s => 
      !theyShareToMe.includes(s.user.id) && !iShareTo.includes(s.user.id)
    );
    if (next) theyShareToMe.push(next.user.id);
    else break;
  }
  
  return { iShareTo, theyShareToMe };
};

// Generar asignaciones para TODOS los usuarios
export const generateAllTribeAssignments = (): Map<string, TribeAssignment> => {
  const allUsers = getAllUsers().filter(u => u.status === 'active');
  const assignments = new Map<string, TribeAssignment>();
  const existingAssignments = new Map<string, Set<string>>();
  
  const currentMonth = new Date().toISOString().slice(0, 7); // "2025-11"
  
  for (const user of allUsers) {
    const { iShareTo, theyShareToMe } = generateAssignmentsForUser(
      user.id, 
      allUsers, 
      existingAssignments
    );
    
    const assignment: TribeAssignment = {
      userId: user.id,
      iShareTo,
      theyShareToMe,
      assignedAt: new Date().toISOString(),
      month: currentMonth,
      version: 1
    };
    
    assignments.set(user.id, assignment);
    
    // Actualizar tracking de asignaciones existentes
    existingAssignments.set(user.id, new Set(iShareTo));
  }
  
  return assignments;
};

// Guardar asignaciones en localStorage Y Firebase
export const saveTribeAssignments = (assignments: Map<string, TribeAssignment>): void => {
  const obj = Object.fromEntries(assignments);
  const timestamp = new Date().toISOString();
  
  // Guardar localmente
  localStorage.setItem('tribu_assignments', JSON.stringify(obj));
  localStorage.setItem('tribu_assignments_updated', timestamp);
  
  // 🔥 SINCRONIZAR A FIREBASE
  syncAssignmentsToFirebase(obj, timestamp).catch(err =>
    console.error('⚠️ Error sincronizando asignaciones a Firebase:', err)
  );
};

// 🔥 Función para sincronizar asignaciones a Firebase
const syncAssignmentsToFirebase = async (
  assignments: Record<string, TribeAssignment>,
  timestamp: string
): Promise<void> => {
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const db = getFirestoreInstance();

    if (!db) {
      console.warn('⚠️ Firestore no disponible, asignaciones solo guardadas localmente');
      return;
    }

    // Guardar todas las asignaciones en un solo documento
    await setDoc(doc(db, 'tribe_assignments', 'current'), {
      assignments,
      updatedAt: serverTimestamp(),
      localTimestamp: timestamp,
      month: new Date().toISOString().slice(0, 7)
    }, { merge: true });

    console.log('✅ Asignaciones de Tribu sincronizadas a Firebase');
  } catch (error) {
    console.error('❌ Error en sincronización de asignaciones:', error);
    throw error;
  }
};

// Cargar asignaciones desde localStorage
export const loadTribeAssignments = (): Map<string, TribeAssignment> => {
  const stored = localStorage.getItem('tribu_assignments');
  if (!stored) return new Map();
  
  try {
    const obj = JSON.parse(stored);
    return new Map(Object.entries(obj));
  } catch {
    return new Map();
  }
};

// Obtener asignación de un usuario específico
export const getUserTribeAssignment = (userId: string): TribeAssignment | null => {
  const assignments = loadTribeAssignments();
  return assignments.get(userId) || null;
};

// Obtener usuarios asignados con datos completos
export const getUserTribeWithProfiles = (userId: string): {
  iShareTo: UserProfile[];
  theyShareToMe: UserProfile[];
} => {
  const assignment = getUserTribeAssignment(userId);
  if (!assignment) {
    // Si no hay asignación, generar una nueva
    const allAssignments = generateAllTribeAssignments();
    saveTribeAssignments(allAssignments);
    const newAssignment = allAssignments.get(userId);
    if (!newAssignment) return { iShareTo: [], theyShareToMe: [] };
    return getUserTribeWithProfiles(userId);
  }
  
  const allUsers = getAllUsers();
  const userMap = new Map(allUsers.map(u => [u.id, u]));
  
  const iShareTo = assignment.iShareTo
    .map(id => userMap.get(id))
    .filter((u): u is UserProfile => u !== undefined);
    
  const theyShareToMe = assignment.theyShareToMe
    .map(id => userMap.get(id))
    .filter((u): u is UserProfile => u !== undefined);
  
  return { iShareTo, theyShareToMe };
};

// Verificar si las asignaciones necesitan regenerarse (nuevo mes)
export const shouldRegenerateTribe = (): boolean => {
  const lastUpdate = localStorage.getItem('tribu_assignments_updated');
  if (!lastUpdate) return true;
  
  const lastMonth = lastUpdate.slice(0, 7);
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  return lastMonth !== currentMonth;
};

// Obtener la Tribu del mes anterior (para evitar repetir)
export const getPreviousMonthTribe = (userId: string): Set<string> => {
  const stored = localStorage.getItem('tribu_previous_month');
  if (!stored) return new Set();
  
  try {
    const obj = JSON.parse(stored);
    const userPrevious = obj[userId];
    if (!userPrevious) return new Set();
    return new Set([...userPrevious.iShareTo || [], ...userPrevious.theyShareToMe || []]);
  } catch {
    return new Set();
  }
};

// Guardar Tribu actual como "anterior" antes de rotar
const archivePreviousMonth = (): void => {
  const current = localStorage.getItem('tribu_assignments');
  if (current) {
    localStorage.setItem('tribu_previous_month', current);
  }
};

// Regenerar si es necesario - ROTACIÓN MENSUAL
export const ensureTribeAssignments = (): void => {
  if (shouldRegenerateTribe()) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    console.log(`🔄 ROTACIÓN MENSUAL: Generando nueva Tribu para ${currentMonth}...`);
    
    // Archivar la Tribu actual antes de regenerar
    archivePreviousMonth();
    
    // Generar nuevas asignaciones
    const assignments = generateAllTribeAssignments();
    saveTribeAssignments(assignments);
    
    console.log(`✅ ${assignments.size} asignaciones generadas para ${currentMonth}`);
    console.log('📅 La próxima rotación será el 1° del próximo mes');
  }
};

// Forzar regeneración manual (admin)
export const forceRegenerateTribe = (): void => {
  console.log('⚠️ Forzando regeneración de Tribu...');
  archivePreviousMonth();
  const assignments = generateAllTribeAssignments();
  saveTribeAssignments(assignments);
  console.log(`✅ ${assignments.size} asignaciones regeneradas`);
};

export default {
  generateAllTribeAssignments,
  saveTribeAssignments,
  loadTribeAssignments,
  getUserTribeAssignment,
  getUserTribeWithProfiles,
  ensureTribeAssignments
};
