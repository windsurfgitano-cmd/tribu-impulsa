// components/common/ProfileReminderBanner.tsx
// Banner de recordatorio de perfil incompleto

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { getCurrentUser } from '../../services/databaseService';
import { validateUserProfile } from '../../utils/validation';

export const ProfileReminderBanner: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [dismissed, setDismissed] = useState(false);

  if (!currentUser || dismissed) return null;

  const validation = validateUserProfile(currentUser);
  // Debug logging (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log('🔍 Validación de perfil:', {
      isComplete: validation.isComplete,
      missingFields: validation.missingFields,
      user: {
        name: currentUser?.name,
        companyName: currentUser?.companyName,
        scope: currentUser?.scope,
        comuna: currentUser?.comuna,
        selectedRegions: currentUser?.selectedRegions,
        bio: currentUser?.bio?.length,
        businessDescription: currentUser?.businessDescription?.length,
        revenue: currentUser?.revenue,
        avatarUrl: currentUser?.avatarUrl ? '✅' : '❌',
        onboardingComplete: currentUser?.onboardingComplete
      }
    });
  }

  if (validation.isComplete) return null;

  // Mapear mensajes técnicos a user-friendly
  const friendlyMessages: Record<string, string> = {
    'Comuna (requerida para alcance LOCAL)': 'Comuna',
    'Regiones (requeridas para alcance REGIONAL)': 'Regiones',
    'Canal principal (Instagram / sitio / otro)': 'Instagram',
    'Teléfono / WhatsApp': 'Teléfono',
    'Giro / Rubro': 'Rubro',
    'Afinidad / Intereses': 'Afinidad',
    'Biografía (mín. 50 caracteres)': 'Biografía',
    'Descripción del negocio (mín. 60 caracteres)': 'Descripción del negocio',
    'Foto o avatar del perfil': 'Foto de perfil',
    'Facturación mensual': 'Facturación mensual',
    'Aceptar términos y condiciones': 'Términos y condiciones',
    'Estado de cuenta activo': 'Estado de cuenta',
    'Nombre': 'Nombre',
    'Nombre de tu emprendimiento': 'Nombre de tu emprendimiento',
    'Alcance geográfico': 'Alcance geográfico',
    'Ciudad': 'Ciudad'
  };

  const missingFieldsDisplay = validation.missingFields.map(field => 
    friendlyMessages[field] || field
  );

  return (
    <div className="profile-reminder-banner animate-slideDown">
      <div className="w-10 h-10 bg-[#FFCC00] rounded-full flex items-center justify-center flex-shrink-0">
        <AlertCircle size={20} className="text-[#181B34]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#181B34]">
          ⚠️ Recuerda completar tus datos
        </p>
        <p className="text-xs text-[#7C8193] mt-0.5">
          Faltan: {missingFieldsDisplay.slice(0, 2).join(', ')}{missingFieldsDisplay.length > 2 ? ` y ${missingFieldsDisplay.length - 2} más` : ''}
        </p>
      </div>
      <button
        onClick={() => navigate('/my-profile')}
        className="px-3 py-1.5 bg-[#FFCC00] text-[#181B34] rounded-lg text-xs font-semibold hover:bg-[#E0A800] transition flex-shrink-0"
      >
        Completar
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-[#7C8193] hover:text-[#181B34] transition flex-shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
};
