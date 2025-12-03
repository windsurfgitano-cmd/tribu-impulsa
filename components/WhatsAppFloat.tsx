import React from 'react';
import { MessageCircle, Instagram } from 'lucide-react';

// Helper para obtener configuración global
const getWhatsAppNumber = () => {
  try {
    const config = localStorage.getItem('tribu_admin_config');
    if (config) {
      const parsed = JSON.parse(config);
      // Limpiar el número (solo dígitos)
      return (parsed.whatsappSupport || '+56951776005').replace(/[^0-9]/g, '');
    }
  } catch {}
  return '56951776005'; // WhatsApp oficial Tribu Impulsa
};

// Instagram oficial de Tribu Impulsa
const TRIBU_INSTAGRAM = 'tribuimpulsachile';

export const WhatsAppFloat: React.FC = () => {
  const whatsappNumber = getWhatsAppNumber();
  
  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-3">
      {/* Botón Instagram Tribu Impulsa */}
      <a
        href={`https://instagram.com/${TRIBU_INSTAGRAM}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group"
        aria-label="Instagram Tribu Impulsa"
      >
        <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#E91E63] via-[#C13584] to-[#F77737] rounded-full shadow-lg hover:scale-110 transition-all duration-300">
          <Instagram size={24} className="text-white" />
        </div>
      </a>
      
      {/* Botón WhatsApp */}
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group"
        aria-label="Contactar por WhatsApp"
      >
        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75 group-hover:opacity-100"></div>
        <div className="relative flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-amber-400/30 hover:bg-emerald-500 transition-all duration-300 transform group-hover:scale-110">
          <MessageCircle size={30} className="text-white fill-white/20" />
        </div>
      </a>
    </div>
  );
};