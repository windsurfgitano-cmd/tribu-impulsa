
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { AuthService } from '../services/api/auth';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    login: typeof AuthService.login;
    register: typeof AuthService.register;
    logout: typeof AuthService.logout;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🔄 AuthProvider mounted, subscribing...');

        // 1. Check for "Impersonation" / Mock User (Admin "Login As" or Local Register)
        const storedUser = localStorage.getItem('v3_current_user');
        if (storedUser) {
            console.log('👤 Local Impersonation/Mock User Detected');
            const parsed = JSON.parse(storedUser);
            // Mocking Firebase User shape partially
            const mockUser = {
                uid: parsed.id || parsed.email,
                email: parsed.email,
                displayName: parsed.name,
                emailVerified: true
            } as User;
            setCurrentUser(mockUser);
            setLoading(false);
            return; // Don't subscribe to Firebase if using override
        }

        try {
            // Suscribirse a cambios de auth
            const unsubscribe = AuthService.onStateChange((user) => {
                console.log('👤 Auth State Changed:', user ? user.email : 'No User');
                setCurrentUser(user);
                setLoading(false);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error('❌ AuthProvider Error:', error);
            setLoading(false);
        }
    }, []);

    const value = {
        currentUser,
        loading,
        login: AuthService.login,
        register: AuthService.register,
        logout: AuthService.logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
