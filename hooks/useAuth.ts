// hooks/useAuth.ts
// Hook para gestión de autenticación y sesión

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getStoredSession, 
  setStoredSession, 
  clearStoredSession,
  UserSession 
} from '../utils/storage';
import { 
  getCurrentUser, 
  setCurrentUser, 
  UserProfile 
} from '../services/databaseService';
import { 
  validateCredentials, 
  getUserByEmail, 
  getUserFromFirebaseByEmail 
} from '../services/realUsersData';

export type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  session: UserSession | null;
};

export type AuthActions = {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkSession: () => void;
};

/**
 * Hook para gestión de autenticación
 */
export const useAuth = (): AuthState & AuthActions => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<UserSession | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Verificar sesión al montar
  const checkSession = useCallback(() => {
    const storedSession = getStoredSession();
    if (storedSession?.isLoggedIn) {
      setSession(storedSession);
      const currentUser = getCurrentUser();
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Login
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Primero buscar en local
      let foundUser = getUserByEmail(email);
      
      // Si no existe localmente, buscar en Firebase
      if (!foundUser) {
        foundUser = await getUserFromFirebaseByEmail(email);
      }

      if (!foundUser) {
        setIsLoading(false);
        return { success: false, error: 'Usuario no encontrado' };
      }

      // Validar credenciales
      const isValid = validateCredentials(email, password);
      if (!isValid) {
        setIsLoading(false);
        return { success: false, error: 'Contraseña incorrecta' };
      }

      // Crear sesión
      const newSession: UserSession = {
        email: foundUser.email,
        name: foundUser.name,
        isLoggedIn: true
      };

      setStoredSession(newSession);
      setCurrentUser(foundUser.id);
      setSession(newSession);
      setUser(foundUser);
      setIsLoading(false);
      
      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      setIsLoading(false);
      return { success: false, error: 'Error al iniciar sesión' };
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    clearStoredSession();
    localStorage.removeItem('tribu_current_user');
    setSession(null);
    setUser(null);
    navigate('/');
  }, [navigate]);

  return {
    isAuthenticated: Boolean(session?.isLoggedIn),
    isLoading,
    user,
    session,
    login,
    logout,
    checkSession
  };
};

