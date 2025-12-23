// utils/validation.ts
// Funciones de validación de perfil de usuario

import { UserProfile, updateUser, setCurrentUser } from '../services/databaseService';

export type ProfileValidation = {
  isComplete: boolean;
  missingFields: string[];
  completionPercent: number;
};

export const BASE_PROFILE_REQUIREMENTS = [
  'Nombre',
  'Nombre de tu emprendimiento',
  'Giro / Rubro',
  'Afinidad / Intereses',
  'Alcance geográfico',
  'Teléfono / WhatsApp',
  'Ciudad',
  'Biografía (mín. 50 caracteres)',
  'Descripción del negocio (mín. 60 caracteres)',
  'Canal principal (Instagram / sitio / otro)',
  'Facturación mensual',
  'Foto o avatar del perfil',
  'Aceptar términos y condiciones',
  'Estado de cuenta activo'
];

export const MIN_BIO_LENGTH = 50;
export const MIN_BUSINESS_DESC_LENGTH = 60;

/**
 * Valida si un perfil de usuario está completo
 * Retorna información detallada sobre campos faltantes
 */
export const validateUserProfile = (user: UserProfile | null): ProfileValidation => {
  if (!user) {
    return { isComplete: false, missingFields: BASE_PROFILE_REQUIREMENTS, completionPercent: 0 };
  }

  const hasChannel = Boolean(
    user.instagram?.trim() ||
    user.website?.trim() ||
    (user as Partial<UserProfile> & { otherChannel?: string }).otherChannel?.trim()
  );

  const validationChecks = [
    { valid: Boolean(user.name?.trim()), label: 'Nombre' },
    { valid: Boolean(user.companyName?.trim()), label: 'Nombre de tu emprendimiento' },
    { valid: Boolean(user.category?.trim()), label: 'Giro / Rubro' },
    { valid: Boolean(user.affinity?.trim()), label: 'Afinidad / Intereses' },
    { valid: Boolean(user.scope), label: 'Alcance geográfico' },
    { valid: Boolean(user.phone?.trim() || user.whatsapp?.trim()), label: 'Teléfono / WhatsApp' },
    { valid: Boolean(user.city?.trim()), label: 'Ciudad' },
    { valid: Boolean(user.bio?.trim() && user.bio.trim().length >= MIN_BIO_LENGTH), label: 'Biografía (mín. 50 caracteres)' },
    { valid: Boolean(user.businessDescription?.trim() && user.businessDescription.trim().length >= MIN_BUSINESS_DESC_LENGTH), label: 'Descripción del negocio (mín. 60 caracteres)' },
    { valid: hasChannel, label: 'Canal principal (Instagram / sitio / otro)' },
    { valid: Boolean(user.revenue?.trim()), label: 'Facturación mensual' },
    {
      valid: user.scope === 'LOCAL' ? Boolean(user.comuna?.trim()) : true,
      label: 'Comuna (requerida para alcance LOCAL)'
    },
    {
      valid: user.scope === 'REGIONAL' ? Boolean(user.selectedRegions && user.selectedRegions.length > 0) : true,
      label: 'Regiones (requeridas para alcance REGIONAL)'
    },
    { valid: Boolean(user.avatarUrl?.trim()), label: 'Foto o avatar del perfil' },
    { valid: user.status === 'active', label: 'Estado de cuenta activo' },
    { valid: user.termsAccepted !== false, label: 'Aceptar términos y condiciones' }
  ];

  const missingFields = validationChecks
    .filter(check => !check.valid)
    .map(check => check.label);

  const completionPercent = Math.round(
    ((validationChecks.length - missingFields.length) / validationChecks.length) * 100
  );

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercent
  };
};

/**
 * Verifica si un perfil está completo (wrapper simple)
 */
export const isProfileComplete = (user: UserProfile | null): boolean => {
  return validateUserProfile(user).isComplete;
};

/**
 * Sincroniza el estado de completitud del perfil con Firebase
 * Actualiza el contador global de perfiles completos
 */
export const syncProfileCompletionState = async (user: UserProfile, isComplete: boolean): Promise<void> => {
  if (!user) return;

  const updates: Partial<UserProfile> = {};
  let profileStatusChanged = false;

  if (user.profileComplete !== isComplete) {
    updates.profileComplete = isComplete;
    profileStatusChanged = true;
  }

  if (isComplete && !user.onboardingComplete) {
    updates.onboardingComplete = true;
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  updateUser(user.id, updates);
  setCurrentUser(user.id);

  try {
    const { getFirestoreInstance } = await import('../services/firebaseService');
    const { doc, setDoc, getDoc, updateDoc, increment } = await import('firebase/firestore');
    const db = getFirestoreInstance();
    if (db) {
      await setDoc(doc(db, 'users', user.id), updates, { merge: true });
      
      // 📊 Actualizar contador global cuando el perfil cambia de estado
      if (profileStatusChanged) {
        const statsRef = doc(db, 'system_stats', 'global');
        const statsDoc = await getDoc(statsRef);
        
        if (statsDoc.exists()) {
          if (isComplete) {
            // Perfil pasó de incompleto a completo
            await updateDoc(statsRef, {
              profilesCompleted: increment(1)
            });
            console.log('📊 Contador de perfiles completos incrementado (+1) tras completar perfil');
          } else if (user.profileComplete === true) {
            // ✅ SOLO decrementar si el perfil REALMENTE pasó de true a false
            // NO decrementar si era undefined o ya era false
            await updateDoc(statsRef, {
              profilesCompleted: increment(-1)
            });
            console.log('📊 Contador de perfiles completos decrementado (-1) tras marcar incompleto');
          } else {
            console.log('📊 Perfil ya estaba incompleto, no se decrementa el contador');
          }
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ No se pudo sincronizar el estado de perfil completo con Firestore:', error);
  }
};

