
// Algoritmo Tribal - Tribu Impulsa V3
// Genera asignaciones 10+10 REALES basadas en categoría, afinidad y evitando competencia

import { UserService, UserProfile } from './api/users';

export interface TribeAssignment {
    userId: string;
    iShareTo: string[];     // 10 cuentas que ESTE usuario debe compartir
    theyShareToMe: string[]; // 10 cuentas que comparten A este usuario
    assignedAt: string;
    month: string;          // "2025-11"
    version: number;
}

// Categorías que son competencia directa
const COMPETITION_GROUPS: string[][] = [
    ['Moda Mujer', 'Moda Hombre'],
    ['Peluquería', 'Barbería', 'Estética'],
    ['Marketing digital', 'Diseño gráfico', 'Branding'],
    ['Coaching', 'Consultoría', 'Mentoring'],
    ['Desarrollo software', 'E-commerce', 'Tecnología'],
    ['Pastelería', 'Repostería', 'Panadería'],
    ['Abogados', 'Contadores'],
    ['Psicólogos', 'Coaching'],
];

// Afinidades complementarias
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

// Verificar competencia
const areCompetitors = (user1: UserProfile, user2: UserProfile): boolean => {
    for (const group of COMPETITION_GROUPS) {
        const cat1 = user1.category?.toLowerCase() || '';
        const cat2 = user2.category?.toLowerCase() || '';

        const cat1InGroup = group.some(ctx => cat1.includes(ctx.toLowerCase()));
        const cat2InGroup = group.some(ctx => cat2.includes(ctx.toLowerCase()));

        if (cat1InGroup && cat2InGroup) return true;
    }
    return false;
};

// Score de compatibilidad (0-100)
const calculateCompatibilityScore = (user1: UserProfile, user2: UserProfile): number => {
    let score = 50;

    if (areCompetitors(user1, user2)) return -100; // Bloqueo total

    // Afinidad complementaria
    const affinity = user1.affinity || '';
    const category2 = user2.category || '';
    const complements = COMPLEMENTARY_AFFINITIES[affinity] || [];

    if (complements.some(c => category2.toLowerCase().includes(c.toLowerCase()))) {
        score += 30;
    }

    // Misma ciudad
    if (user1.city && user2.city && user1.city.trim().toLowerCase() === user2.city.trim().toLowerCase()) {
        score += 15;
    }

    // Pequeña variación random
    score += Math.random() * 10;

    return score;
};

// Generar para un usuario
const generateAssignmentsForUser = (
    userId: string,
    allUsers: UserProfile[],
    existingAssignments: Map<string, Set<string>> // userId -> set of assigned IDs
): { iShareTo: string[]; theyShareToMe: string[] } => {

    const currentUser = allUsers.find(u => u.id === userId);
    if (!currentUser) return { iShareTo: [], theyShareToMe: [] };

    // Filtrar elegibles
    const eligible = allUsers.filter(u => u.id !== userId); // && u.status === 'active' si existiera status

    // Calcular scores
    const scored = eligible.map(u => ({
        user: u,
        score: calculateCompatibilityScore(currentUser, u)
    })).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

    const iShareTo: string[] = [];
    const theyShareToMe: string[] = [];

    // 1. Llenar "Yo comparto" (top compatibles)
    for (const s of scored) {
        if (iShareTo.length >= 10) break;
        // Evitar sobrecargar al destino (idealmente) pero priorizamos cubrir los 10
        iShareTo.push(s.user.id);
    }

    // 2. Llenar "Me comparten" (top compatibles que no estén en iShareTo idealmente, o repetir si es nec)
    for (const s of scored) {
        if (theyShareToMe.length >= 10) break;
        if (!iShareTo.includes(s.user.id)) {
            theyShareToMe.push(s.user.id);
        }
    }

    // Relleno si falta
    if (theyShareToMe.length < 10) {
        const remaining = scored.filter(s => !theyShareToMe.includes(s.user.id));
        for (const s of remaining) {
            if (theyShareToMe.length >= 10) break;
            theyShareToMe.push(s.user.id);
        }
    }

    return { iShareTo, theyShareToMe };
};

export const TribeAlgorithm = {
    // Generar o recuperar asignaciones
    ensureAssignments: async (userId: string): Promise<TribeAssignment | null> => {
        // 1. Buscar en localStorage primero
        const saved = localStorage.getItem(`tribu_v3_assignment_${userId}`);
        const currentMonth = new Date().toISOString().slice(0, 7);

        if (saved) {
            const parsed = JSON.parse(saved) as TribeAssignment;
            if (parsed.month === currentMonth) {
                return parsed;
            }
        }

        // 2. Generar nuevas
        const allUsers = await UserService.getAllUsers();
        const { iShareTo, theyShareToMe } = generateAssignmentsForUser(userId, allUsers, new Map());

        const newAssignment: TribeAssignment = {
            userId,
            iShareTo,
            theyShareToMe,
            assignedAt: new Date().toISOString(),
            month: currentMonth,
            version: 1
        };

        // 3. Guardar
        localStorage.setItem(`tribu_v3_assignment_${userId}`, JSON.stringify(newAssignment));
        return newAssignment;
    },

    // Obtener perfiles completos de la tribu
    getTribeProfiles: async (userId: string) => {
        const assignment = await TribeAlgorithm.ensureAssignments(userId);
        if (!assignment) return { iShareTo: [], theyShareToMe: [] };

        const allUsers = await UserService.getAllUsers();

        const iShareToProfiles = allUsers.filter(u => assignment.iShareTo.includes(u.id));
        const theyShareToMeProfiles = allUsers.filter(u => assignment.theyShareToMe.includes(u.id));

        return { iShareTo: iShareToProfiles, theyShareToMe: theyShareToMeProfiles };
    }
};
