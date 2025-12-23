// utils/storage.ts
// Funciones de almacenamiento local y gestión de sesión

export const AUTH_SESSION_KEY = 'tribuUserSession';

export type UserSession = {
  email: string;
  name: string;
  isLoggedIn: boolean;
};

/**
 * Genera una clave de storage única por usuario
 */
export const getUserStorageKey = (baseKey: string): string => {
  const userId = localStorage.getItem('tribu_current_user') || 'guest';
  return `${baseKey}_${userId}`;
};

/**
 * Obtiene la sesión almacenada del usuario actual
 */
export const getStoredSession = (): UserSession | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;
  try { 
    return JSON.parse(raw); 
  } catch { 
    return null; 
  }
};

/**
 * Guarda la sesión del usuario
 */
export const setStoredSession = (session: UserSession): void => {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};

/**
 * Limpia la sesión del usuario
 */
export const clearStoredSession = (): void => {
  localStorage.removeItem(AUTH_SESSION_KEY);
};

/**
 * Obtiene la configuración global de la app
 */
export const getAppConfig = () => {
  const savedConfig = localStorage.getItem('tribu_admin_config');
  const defaults = {
    membershipPrice: 20000,
    matchesPerUser: 10,
    whatsappSupport: '+56951776005',
    appName: 'Tribu Impulsa',
    mercadopagoMode: 'sandbox'
  };
  if (!savedConfig) return defaults;
  try {
    return { ...defaults, ...JSON.parse(savedConfig) };
  } catch {
    return defaults;
  }
};

/**
 * Guarda configuración de admin
 */
export const setAppConfig = (config: Record<string, unknown>): void => {
  localStorage.setItem('tribu_admin_config', JSON.stringify(config));
};

