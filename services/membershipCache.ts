// services/membershipCache.ts
// Funciones para cachear y sincronizar membresías

export type CloudMembership = {
  status?: string;
  paymentMethod?: string;
  paymentDate?: string;
  expiresAt?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  membershipType?: string;
  amount?: number;
};

export const fetchMembershipFromCloud = async (userId: string): Promise<CloudMembership | null> => {
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { doc, getDoc } = await import('firebase/firestore');
    const db = getFirestoreInstance();
    if (!db) return null;
    const membershipDoc = await getDoc(doc(db, 'memberships', userId));
    return membershipDoc.exists() ? (membershipDoc.data() as CloudMembership) : null;
  } catch (error) {
    console.log('⚠️ Error obteniendo membresía desde Firebase:', error);
    return null;
  }
};

export const syncMembershipToLocalCache = (userId: string, membership: CloudMembership | null): void => {
  if (!membership) return;
  const status = membership.status || 'invitado';
  localStorage.setItem(`membership_status_${userId}`, status);
  if (status === 'miembro' || status === 'admin' || status === 'trial') {
    localStorage.setItem(
      `membership_payment_${userId}`,
      JSON.stringify({
        method: membership.paymentMethod,
        amount: membership.amount,
        date: membership.paymentDate || membership.trialStartDate,
        expiresAt: membership.expiresAt || membership.trialEndDate
      })
    );
  } else {
    localStorage.removeItem(`membership_payment_${userId}`);
  }
};

export const getMembershipStatus = (userId: string): string | null => {
  return localStorage.getItem(`membership_status_${userId}`);
};

export const getMembershipPayment = (userId: string): { method?: string; amount?: number; date?: string; expiresAt?: string } | null => {
  const raw = localStorage.getItem(`membership_payment_${userId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

