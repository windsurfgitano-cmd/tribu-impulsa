import React from 'react';
import { X, ExternalLink, AlertCircle } from 'lucide-react';

interface ExitAppModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  courseName?: string;
  destinationName?: string;
}

export const ExitAppModal: React.FC<ExitAppModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  courseName,
  destinationName = 'Santander Open Academy'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-slideDown">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-[#666]" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#ec0000]/10 rounded-full flex items-center justify-center">
            <AlertCircle size={32} className="text-[#ec0000]" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[#181B34] text-center mb-2">
          Salir de la App
        </h3>

        {/* Message */}
        <p className="text-[#666] text-center mb-6 leading-relaxed">
          {courseName ? (
            <>
              Estás abandonando la App de Tribu Impulsa para acceder a{' '}
              <strong className="text-[#181B34]">{courseName}</strong> en{' '}
              {destinationName}. ¿Deseas continuar?
            </>
          ) : (
            <>
              Estás abandonando la App de Tribu Impulsa para acceder a{' '}
              {destinationName}. ¿Deseas continuar?
            </>
          )}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-gray-100 text-[#181B34] font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            No, quedarse
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#ec0000] to-[#cc0000] text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink size={18} />
            Sí, continuar
          </button>
        </div>
      </div>
    </div>
  );
};

