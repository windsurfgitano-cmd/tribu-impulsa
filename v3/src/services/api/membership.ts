
import type { UserProfile } from './users';

export type MembershipStatus = 'active' | 'expired' | 'none';

export const MembershipService = {
    // Verificar estado de membresía
    checkStatus: (user: UserProfile): MembershipStatus => {
        if (!user.trialStartDate) return 'none'; // Nunca activó trial

        const now = new Date();
        const end = new Date(user.trialEndDate || '');

        if (now > end) return 'expired';
        return 'active';
    },

    // Activar periodo de prueba (30 días)
    activateTrial: async (user: UserProfile): Promise<UserProfile> => {
        const now = new Date();
        const end = new Date();
        end.setDate(now.getDate() + 30); // 30 días de prueba

        const updates = {
            trialStartDate: now.toISOString(),
            trialEndDate: end.toISOString(),
            status: 'active' as const
        };

        // Persistir (usando UserService indirectamente o localStorage directo por ahora)
        // Idealmente UserService.updateUserByEmail
        const { UserService } = await import('./users');
        await UserService.updateUserByEmail(user.email, updates);

        return { ...user, ...updates };
    },

    // Días restantes
    getDaysRemaining: (user: UserProfile): number => {
        if (!user.trialEndDate) return 0;
        const now = new Date();
        const end = new Date(user.trialEndDate);
        const diff = end.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    }
};
