
import {
    doc,
    getDoc,
    updateDoc
} from 'firebase/firestore';
// Definición explícita para romper ciclo con tribes.ts
export interface UserProfile {
    id: string;
    email: string;
    name: string;
    category: string;
    affinity: string;
    instagram: string;
    city: string;
    // Campos opcionales
    companyName?: string;
    avatarUrl?: string;
    followers?: number;
    website?: string;
    about?: string;
    phone?: string;
    scope?: 'LOCAL' | 'REGIONAL' | 'NACIONAL';
    comuna?: string;
    regions?: string[];
    role?: 'admin' | 'member';
    surveyCompleted?: boolean;
    createdAt?: string;
}

// NOTA: Asegúrate que 'db' esté exportado en auth.ts o crea un firebase.ts común
// Por ahora, asumimos que auth.ts exporta 'db'
import { getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';

const getDb = () => getFirestore(getApp());

export const UserService = {
    // Obtener perfil completo
    getUserProfile: async (userId: string) => {
        try {
            const docRef = doc(getDb(), 'users', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as any;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    // Actualizar perfil
    updateProfile: async (userId: string, data: Partial<any>) => {
        try {
            const docRef = doc(getDb(), 'users', userId);
            await updateDoc(docRef, data);
            return { success: true };
        } catch (error) {
            console.error('Error updating profile:', error);
            return { success: false, error };
        }
    },

    // Obtener TODOS los usuarios (para matchmaking)
    getAllUsers: async (): Promise<UserProfile[]> => {
        // TODO: En producción real, usar Firestore query con paginación o función Cloud
        // Por ahora, usamos los datos locales de realUsersData.ts para asegurar que haya datos
        // Importamos dinámicamente para evitar ciclos
        const { REAL_USERS } = await import('../../data/mockUsers');

        return REAL_USERS.map((u: any) => ({
            id: u.email, // Usamos email como ID temporalmente para coincidir con Auth
            email: u.email,
            name: u.name,
            category: u.category,
            instagram: u.instagram,
            city: u.city,
            affinity: u.affinity,
            followers: u.followers
        }));
    },

    // Obtener usuario por Email (Prioridad: LocalStorage > Mock > Firestore)
    getUserByEmail: async (email: string) => {
        if (!email) return null;

        // 1. Check LocalStorage override
        const key = `v3_user_${email}`;
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);

        // 2. Check Mock Data
        const { REAL_USERS } = await import('../../data/mockUsers');
        const found = REAL_USERS.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

        return found || null;
    },

    // Actualizar usuario por Email (Persistencia Local)
    updateUserByEmail: async (email: string, data: Partial<any>) => {
        const key = `v3_user_${email}`;
        // Circular ref handling: Use local method directly
        const current = await UserService.getUserByEmail(email) || {};
        const updated = { ...current, ...data };
        localStorage.setItem(key, JSON.stringify(updated));
        return { success: true };
    },

    // Registrar nuevo usuario (Mock + LocalStorage)
    registerUser: async (data: { email: string; password?: string; displayName?: string; userData: any }) => {
        // En V3 real debería usar createUserWithEmailAndPassword
        // Aquí simulamos creando el registro en local
        const key = `v3_user_${data.email}`;

        const newUser = {
            id: data.email, // ID temporal
            ...data.userData,
            surveyCompleted: true, // Asumimos survey completada al registrarse por este wizard
            createdAt: new Date().toISOString()
        };

        localStorage.setItem(key, JSON.stringify(newUser));

        // También actualizar el "current user" simulado
        // Esto debería ser manejado por AuthContext pero aquí forzamos la data
        return newUser;
    }
};
