// components/routing/MemberRoute.tsx
// Componente de ruta protegida para miembros - solo valida sesión + membresía activa

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/databaseService';
import { validateUserProfile, syncProfileCompletionState } from '../../utils/validation';
import { syncMembershipToLocalCache, CloudMembership } from '../../services/membershipCache';

interface MemberRouteProps {
  children: React.ReactNode;
}

export const MemberRoute: React.FC<MemberRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) {
        navigate('/');
        return;
      }

      setAccessGranted(false);

      // Mantener actualizado el flag de perfil completo (no bloquea navegación)
      const validation = validateUserProfile(currentUser);
      await syncProfileCompletionState(currentUser, validation.isComplete);

      // Verificar membresía
      const status = localStorage.getItem(`membership_status_${currentUser.id}`);
      const paymentMetaRaw = localStorage.getItem(`membership_payment_${currentUser.id}`);

      const trialIsValid = () => {
        if (!paymentMetaRaw) return false;
        try {
          const meta = JSON.parse(paymentMetaRaw);
          return meta.expiresAt ? new Date(meta.expiresAt) > new Date() : false;
        } catch {
          return false;
        }
      };

      if (status === 'miembro' || status === 'admin' || (status === 'trial' && trialIsValid())) {
        setAccessGranted(true);
        return;
      }

      // Verificar en Firebase
      try {
        const { getFirestoreInstance } = await import('../../services/firebaseService');
        const { doc, getDoc } = await import('firebase/firestore');
        const db = getFirestoreInstance();
        if (db) {
          const membershipDoc = await getDoc(doc(db, 'memberships', currentUser.id));
          if (membershipDoc.exists()) {
            const data = membershipDoc.data();
            const isActive = data.status === 'miembro' || data.status === 'admin' || (
              data.status === 'trial' &&
              data.expiresAt &&
              new Date(data.expiresAt) > new Date()
            );

            if (isActive) {
              syncMembershipToLocalCache(currentUser.id, data as CloudMembership);
              setAccessGranted(true);
              return;
            }
          }
        }
      } catch (err) {
        console.log('Error verificando membresía:', err);
      }

      // No es miembro, redirigir a membership
      navigate('/membership');
    };

    checkAccess();
  }, [currentUser, navigate]);

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#6161FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default MemberRoute;

