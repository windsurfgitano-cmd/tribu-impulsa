// Hook de autenticación con Firebase
import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  onAuthChange, 
  loginWithEmail, 
  logout as firebaseLogout,
  getUserById,
  CloudUser,
  initializeSystemConfig
} from '../services/firestoreService';

interface AuthState {
  user: CloudUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export const useFirebaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null
  });

  // Escuchar cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Usuario autenticado, obtener datos de Firestore
        const userData = await getUserById(firebaseUser.uid);
        setAuthState({
          user: userData,
          firebaseUser,
          loading: false,
          error: null
        });
      } else {
        // No autenticado
        setAuthState({
          user: null,
          firebaseUser: null,
          loading: false,
          error: null
        });
      }
    });

    // Inicializar config del sistema
    initializeSystemConfig();

    return () => unsubscribe();
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const user = await loginWithEmail(email, password);
      
      if (user) {
        setAuthState({
          user,
          firebaseUser: null, // Se actualizará por el listener
          loading: false,
          error: null
        });
        return true;
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Credenciales incorrectas'
        }));
        return false;
      }
    } catch (err) {
      const error = err as Error;
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error de autenticación'
      }));
      return false;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await firebaseLogout();
    setAuthState({
      user: null,
      firebaseUser: null,
      loading: false,
      error: null
    });
  }, []);

  // Verificar si es admin
  const isAdmin = authState.user?.role === 'admin';

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    isAdmin,
    login,
    logout
  };
};

export default useFirebaseAuth;
