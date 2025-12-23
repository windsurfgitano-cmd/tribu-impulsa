// components/common/NotificationButton.tsx
// Componente Toggle de Notificaciones Push

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { 
  getNotificationStatus, 
  requestNotificationPermission, 
  sendLocalNotification, 
  saveUserFCMToken, 
  clearFCMToken 
} from '../../services/firebaseService';
import { getCurrentUser } from '../../services/databaseService';

export const NotificationButton: React.FC = () => {
  const [status, setStatus] = useState(getNotificationStatus());
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const currentUser = getCurrentUser();

  const isEnabled = status.permission === 'granted' && status.hasToken;

  const handleToggle = async () => {
    if (isEnabled) {
      // Desactivar - limpiar token
      setIsLoading(true);
      if (currentUser) {
        clearFCMToken();
        // También podríamos remover de la DB
      }
      setShowToast('Notificaciones desactivadas');
      setTimeout(() => setShowToast(null), 3000);
      setStatus(getNotificationStatus());
      setIsLoading(false);
    } else {
      // Activar
      setIsLoading(true);
      const token = await requestNotificationPermission();
      if (token) {
        if (currentUser) {
          saveUserFCMToken(currentUser.id, token);
        }
        sendLocalNotification('¡Notificaciones activadas!', 'Recibirás alertas de tu tribu');
        setShowToast('¡Notificaciones activadas!');
      } else {
        setShowToast('No se pudieron activar las notificaciones');
      }
      setTimeout(() => setShowToast(null), 3000);
      setStatus(getNotificationStatus());
      setIsLoading(false);
    }
  };

  if (!status.supported) {
    return (
      <div className="p-4 bg-[#F5F7FB] rounded-xl border border-[#E4E7EF] text-center">
        <p className="text-sm text-[#7C8193]">Tu navegador no soporta notificaciones</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toast notification */}
      {showToast && (
        <div className="absolute -top-12 left-0 right-0 bg-[#181B34] text-white text-sm py-2 px-4 rounded-lg text-center animate-fadeIn">
          {showToast}
        </div>
      )}

      <div className={`p-4 rounded-xl border flex items-center justify-between ${isEnabled
        ? 'bg-[#E6FFF3] border-[#00CA72]/30'
        : 'bg-[#F5F7FB] border-[#E4E7EF]'
        }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEnabled ? 'bg-[#00CA72] text-white' : 'bg-[#E4E7EF] text-[#7C8193]'
            }`}>
            <Bell size={20} />
          </div>
          <div>
            <p className={`font-semibold text-sm ${isEnabled ? 'text-[#008A4E]' : 'text-[#181B34]'}`}>
              {isEnabled ? 'Notificaciones activas' : 'Notificaciones'}
            </p>
            <p className={`text-xs ${isEnabled ? 'text-[#00CA72]' : 'text-[#7C8193]'}`}>
              {isEnabled ? 'Recibirás alertas de tu tribu' : 'Activa para recibir alertas'}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${isEnabled ? 'bg-[#00CA72]' : 'bg-[#E4E7EF]'
            } ${isLoading ? 'opacity-50' : ''}`}
        >
          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
        </button>
      </div>
    </div>
  );
};
