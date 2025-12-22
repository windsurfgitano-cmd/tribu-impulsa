
import { TribeAlgorithm } from '../tribeAlgorithm';
import type { UserProfile } from './users';

// Re-export types for compatibility
export interface TribeAssignment {
    userId: string;
    iShareTo: string[];
    theyShareToMe: string[];
    assignedAt: string;
    month: string;
}

export type UserProfileStub = UserProfile;

export const TribeService = {
    // Calcular asignaciones (Delegado a Algorithm Service)
    calculateAssignments: (_currentUser: UserProfileStub, _candidates: UserProfileStub[]) => {
        // Esta función era interna, ahora usamos TribeAlgorithm
        console.warn('TribeService.calculateAssignments is deprecated. Use TribeAlgorithm directly.');
        return { iShareTo: [] };
    },

    // Obtener asignaciones 10+10 (Conectado al Algoritmo Real)
    getAssignments: async (currentUser: UserProfileStub): Promise<{ tribe: UserProfileStub[], discovery: UserProfileStub[] }> => {
        // Usar el algoritmo robusto portado de V2
        const { iShareTo, theyShareToMe } = await TribeAlgorithm.getTribeProfiles(currentUser.id);

        // Mapear al formato esperado por la UI
        // En V2:
        // - "Mi Tribu" (Checklist) son los que YO comparto (iShareTo) + los que ME comparten (theyShareToMe)
        // - El sistema 10+10 original de V2 separaba "Asignados" vs "Discovery"
        // - TribeAlgorithm.getTribeProfiles ya devuelve los perfiles completos.

        // Para mantener compatibilidad con ChecklistScreen que espera { tribe, discovery }
        // Asumiremos:
        // tribe = iShareTo (Mis asignados principales)
        // discovery = theyShareToMe (Quienes me comparten - o "Discovery" dependiendo de la terminología del usuario)

        return {
            tribe: iShareTo,
            discovery: theyShareToMe
        };
    },

    // Checklist Persistence (Mantenemos igual por ahora)
    getChecklist: (userId: string): Record<string, boolean> => {
        const key = `v3_checklist_${userId}`;
        return JSON.parse(localStorage.getItem(key) || '{}');
    },

    saveChecklist: (userId: string, checklist: Record<string, boolean>) => {
        const key = `v3_checklist_${userId}`;
        localStorage.setItem(key, JSON.stringify(checklist));
    }
};

