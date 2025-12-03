import React, { useState } from 'react';
import { MessageCircle, Instagram, Sparkles, X } from 'lucide-react';

// Helper para obtener configuración global
const getWhatsAppNumber = () => {
  try {
    const config = localStorage.getItem('tribu_admin_config');
    if (config) {
      const parsed = JSON.parse(config);
      return (parsed.whatsappSupport || '+56951776005').replace(/[^0-9]/g, '');
    }
  } catch {}
  return '56951776005';
};

const TRIBU_INSTAGRAM = 'tribuimpulsachile';

export const WhatsAppFloat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const whatsappNumber = getWhatsAppNumber();
  
  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Opciones expandidas */}
      <div className={`flex flex-col gap-3 mb-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {/* Instagram */}
        <a
          href={`https://instagram.com/${TRIBU_INSTAGRAM}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 group"
          aria-label="Instagram Tribu Impulsa"
        >
          <span className="bg-white/95 backdrop-blur-sm text-[#181B34] text-xs font-medium px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Síguenos
          </span>
          <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-[#E91E63] via-[#C13584] to-[#F77737] rounded-full shadow-lg hover:scale-110 transition-transform">
            <Instagram size={20} className="text-white" />
          </div>
        </a>
        
        {/* WhatsApp */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('¡Hola Tribu Impulsa! 👋')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 group"
          aria-label="WhatsApp Tribu Impulsa"
        >
          <span className="bg-white/95 backdrop-blur-sm text-[#181B34] text-xs font-medium px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Escríbenos
          </span>
          <div className="flex items-center justify-center w-11 h-11 bg-emerald-500 rounded-full shadow-lg hover:scale-110 transition-transform">
            <MessageCircle size={20} className="text-white" />
          </div>
        </a>
      </div>
      
      {/* Botón principal - FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 ${
          isOpen 
            ? 'bg-[#434343] rotate-0' 
            : 'bg-gradient-to-br from-[#6161FF] to-[#00CA72]'
        }`}
        aria-label={isOpen ? 'Cerrar menú' : 'Contactar Tribu'}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Sparkles size={24} className="text-white animate-pulse" />
        )}
      </button>
      
      {/* Label discreto cuando está cerrado */}
      {!isOpen && (
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full">
          <span className="bg-white/90 backdrop-blur-sm text-[#6161FF] text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm whitespace-nowrap">
            ¿Ayuda?
          </span>
        </div>
      )}
    </div>
  );
};