// components/auth/PasswordChangeModal.tsx
// Modal de cambio de contraseña para primer login

import React, { useState } from 'react';
import ReactDOM from 'react-dom';

interface PasswordChangeModalProps {
  onComplete: (newPass: string) => void;
  onSkip: () => void;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ onComplete, onSkip }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    onComplete(newPassword);
  };

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 999999,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '400px',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        className="animate-slideUp"
      >
        <div className="p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FFCC00] to-[#FFE066] flex items-center justify-center text-3xl shadow-lg">
            🔐
          </div>
          <h2 className="text-xl font-bold text-[#181B34] text-center mb-2">¡Bienvenido/a a Tribu!</h2>
          <p className="text-[#7C8193] text-center text-sm mb-4">
            Por seguridad, te recomendamos cambiar tu contraseña
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF]"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF]"
                placeholder="Repite tu contraseña"
              />
            </div>

            {error && <p className="text-[#FB275D] text-sm text-center">{error}</p>}

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              Guardar nueva contraseña
            </button>
            <button
              onClick={onSkip}
              className="w-full py-2 text-[#7C8193] hover:text-[#181B34] text-sm transition"
            >
              Omitir por ahora
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PasswordChangeModal;

