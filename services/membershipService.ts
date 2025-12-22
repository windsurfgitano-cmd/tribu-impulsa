// ===============================================
// SERVICIO DE MEMBRESÍAS - TRIBU IMPULSA
// ===============================================
// Gestiona estados: 'invitado' | 'miembro' | 'admin'
// Integración con pasarelas de pago

import { getFirestoreInstance } from './firebaseService';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Tipos de membresía
export type MembershipStatus = 'invitado' | 'trial' | 'miembro' | 'admin';

export interface UserMembership {
  id: string;
  email: string;
  status: MembershipStatus;
  paymentId?: string;
  paymentDate?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  membershipType?: 'trial' | 'paid' | 'admin' | string;
  paymentMethod?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  nextPlanId?: string;
  autoRenew?: boolean;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  provider: 'mercadopago' | 'fintoc' | 'manual';
  externalId?: string;
  createdAt: string;
  completedAt?: string;
}

// Precio de membresía DINÁMICO (desde config del admin)
export const getMembershipPrice = () => {
  const savedConfig = localStorage.getItem('tribu_admin_config');
  const defaultPrice = 20000; // $20.000 CLP por defecto
  
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      return config.membershipPrice || defaultPrice;
    } catch {
      return defaultPrice;
    }
  }
  return defaultPrice;
};

// Activar trial gratuito (30 días sin cobro)
export const activateTrialMembership = async (
  userId: string,
  email: string,
  selectedPlan: 'mensual' | 'semestral' | 'anual' = 'mensual'
): Promise<UserMembership | null> => {
  const db = getFirestoreInstance();
  if (!db) return null;

  try {
    const membershipRef = doc(db, 'memberships', userId);
    const existingSnapshot = await getDoc(membershipRef);
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 30);

    const payload: Partial<UserMembership> = {
      id: userId,
      email: email.toLowerCase(),
      status: 'trial',
      membershipType: 'trial_free',
      paymentMethod: 'trial_free',
      paymentId: `trial_${Date.now()}`,
      paymentDate: now.toISOString(),
      trialStartDate: now.toISOString(),
      trialEndDate: trialEnd.toISOString(),
      expiresAt: trialEnd.toISOString(),
      nextPlanId: selectedPlan,
      autoRenew: false,
      updatedAt: now.toISOString()
    };

    const existingData = existingSnapshot.exists() 
      ? (existingSnapshot.data() as UserMembership) 
      : null;
    const createdAt = existingData?.createdAt || now.toISOString();

    await setDoc(
      membershipRef,
      {
        ...payload,
        createdAt
      },
      { merge: true }
    );

    return {
      ...(existingSnapshot.data() as UserMembership | undefined),
      ...payload,
      createdAt
    } as UserMembership;
  } catch (error) {
    console.error('Error activando trial gratuito:', error);
    return null;
  }
};

// Para compatibilidad con código existente
export const MEMBERSHIP_PRICE = {
  get amount() { return getMembershipPrice(); },
  currency: 'CLP',
  description: 'Membresía Tribu Impulsa - Acceso completo al Algoritmo Tribal 10+10'
};

// ===============================================
// FUNCIONES DE MEMBRESÍA
// ===============================================

// Obtener membresía de usuario desde Firebase
export const getUserMembership = async (userId: string): Promise<UserMembership | null> => {
  const db = getFirestoreInstance();
  if (!db) return null;
  
  try {
    const membershipRef = doc(db, 'memberships', userId);
    const membershipDoc = await getDoc(membershipRef);
    
    if (membershipDoc.exists()) {
      return membershipDoc.data() as UserMembership;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo membresía:', error);
    return null;
  }
};

// Crear membresía inicial (invitado)
export const createInitialMembership = async (userId: string, email: string): Promise<UserMembership> => {
  const now = new Date().toISOString();
  const membership: UserMembership = {
    id: userId,
    email: email.toLowerCase(),
    status: 'invitado',
    createdAt: now,
    updatedAt: now
  };
  
  const db = getFirestoreInstance();
  
  try {
    if (!db) throw new Error('Firebase no disponible');
    const membershipRef = doc(db, 'memberships', userId);
    await setDoc(membershipRef, membership);
    console.log('✅ Membresía inicial creada:', email);
    return membership;
  } catch (error) {
    console.error('Error creando membresía:', error);
    // Guardar localmente como fallback
    localStorage.setItem(`membership_${userId}`, JSON.stringify(membership));
    return membership;
  }
};

// Actualizar estado de membresía a "miembro"
export const upgradeMembership = async (userId: string, paymentId: string): Promise<boolean> => {
  const db = getFirestoreInstance();
  if (!db) return false;
  
  try {
    const membershipRef = doc(db, 'memberships', userId);
    const now = new Date().toISOString();
    
    // Membresía válida por 1 año
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    
    await updateDoc(membershipRef, {
      status: 'miembro',
      paymentId,
      paymentDate: now,
      expiresAt: expiresAt.toISOString(),
      updatedAt: now
    });
    
    console.log('✅ Membresía actualizada a MIEMBRO:', userId);
    return true;
  } catch (error) {
    console.error('Error actualizando membresía:', error);
    return false;
  }
};

// Verificar si usuario es miembro activo
export const isMemberActive = async (userId: string): Promise<boolean> => {
  const membership = await getUserMembership(userId);
  
  if (!membership) return false;
  if (membership.status === 'admin') return true;
  if (membership.status !== 'miembro') return false;
  
  // Verificar si no ha expirado
  if (membership.expiresAt) {
    const expiry = new Date(membership.expiresAt);
    if (expiry < new Date()) {
      // Membresía expirada
      return false;
    }
  }
  
  return true;
};

// ===============================================
// FUNCIONES DE PAGO
// ===============================================

// Crear registro de pago pendiente
export const createPaymentRecord = async (userId: string, userEmail: string): Promise<PaymentRecord> => {
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const payment: PaymentRecord = {
    id: paymentId,
    userId,
    userEmail,
    amount: MEMBERSHIP_PRICE.amount,
    currency: MEMBERSHIP_PRICE.currency,
    status: 'pending',
    provider: 'mercadopago',
    createdAt: now
  };
  
  const db = getFirestoreInstance();
  
  try {
    if (!db) throw new Error('Firebase no disponible');
    const paymentRef = doc(db, 'payments', paymentId);
    await setDoc(paymentRef, payment);
    console.log('📝 Pago pendiente creado:', paymentId);
    return payment;
  } catch (error) {
    console.error('Error creando pago:', error);
    return payment;
  }
};

// Completar pago y actualizar membresía
export const completePayment = async (paymentId: string, externalId?: string): Promise<boolean> => {
  const db = getFirestoreInstance();
  if (!db) return false;
  
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentDoc = await getDoc(paymentRef);
    
    if (!paymentDoc.exists()) {
      console.error('Pago no encontrado:', paymentId);
      return false;
    }
    
    const payment = paymentDoc.data() as PaymentRecord;
    const now = new Date().toISOString();
    
    // Actualizar registro de pago
    await updateDoc(paymentRef, {
      status: 'approved',
      externalId,
      completedAt: now
    });
    
    // Actualizar membresía del usuario
    const upgraded = await upgradeMembership(payment.userId, paymentId);
    
    if (upgraded) {
      console.log('✅ Pago completado y membresía activada:', paymentId);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error completando pago:', error);
    return false;
  }
};

// ===============================================
// MERCADOPAGO INTEGRATION
// ===============================================

// Configuración de MercadoPago (Chile)
export const MERCADOPAGO_CONFIG = {
  // Public Key para checkout (frontend)
  publicKey: 'APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // REEMPLAZAR con tu Public Key
  // Access Token para backend (NO exponer en frontend)
  // accessToken se maneja en backend/cloud function
};

// Generar link de pago MercadoPago
export const generateMercadoPagoLink = async (userId: string, userEmail: string): Promise<string | null> => {
  // Crear registro de pago pendiente
  const payment = await createPaymentRecord(userId, userEmail);
  
  // En producción, esto debería llamar a tu backend/Cloud Function
  // que genera el preference de MercadoPago con el Access Token
  
  // Por ahora, retornamos un link de ejemplo
  // En producción, usar: https://www.mercadopago.cl/checkout/v1/redirect?pref_id=XXXXX
  
  const checkoutUrl = `https://www.mercadopago.cl/checkout/v1/redirect?pref_id=${payment.id}`;
  
  console.log('🔗 Link de pago generado:', checkoutUrl);
  
  // Guardar en localStorage para referencia
  localStorage.setItem('pending_payment', JSON.stringify({
    paymentId: payment.id,
    userId,
    timestamp: Date.now()
  }));
  
  return checkoutUrl;
};

// ===============================================
// SIMULACIÓN DE PAGO (PARA DESARROLLO)
// ===============================================

// Simular pago exitoso (solo para testing)
export const simulateSuccessfulPayment = async (userId: string, userEmail: string): Promise<boolean> => {
  console.log('🧪 Simulando pago exitoso para:', userEmail);
  
  // Crear registro de pago
  const payment = await createPaymentRecord(userId, userEmail);
  
  // Completar pago inmediatamente
  const success = await completePayment(payment.id, 'SIMULATED_' + Date.now());
  
  return success;
};

// ===============================================
// SINCRONIZACIÓN LOCAL/CLOUD
// ===============================================

// Sincronizar membresía con localStorage (fallback offline)
export const syncMembershipLocal = (membership: UserMembership): void => {
  localStorage.setItem(`membership_${membership.id}`, JSON.stringify(membership));
};

// Obtener membresía local (fallback)
export const getLocalMembership = (userId: string): UserMembership | null => {
  const data = localStorage.getItem(`membership_${userId}`);
  return data ? JSON.parse(data) : null;
};

// Verificar membresía (cloud primero, local como fallback)
export const checkMembership = async (userId: string): Promise<MembershipStatus> => {
  // Intentar obtener de Firebase
  let membership = await getUserMembership(userId);
  
  // Si no existe en cloud, buscar local
  if (!membership) {
    membership = getLocalMembership(userId);
  }
  
  // Si no existe en ningún lado, es invitado
  if (!membership) {
    return 'invitado';
  }
  
  // Sincronizar local
  syncMembershipLocal(membership);
  
  return membership.status;
};

export default {
  getUserMembership,
  createInitialMembership,
  upgradeMembership,
  isMemberActive,
  createPaymentRecord,
  completePayment,
  generateMercadoPagoLink,
  simulateSuccessfulPayment,
  checkMembership,
  MEMBERSHIP_PRICE
};
