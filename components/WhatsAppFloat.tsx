import React, { useState } from 'react';
import { MessageCircle, Instagram } from 'lucide-react';

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

// Estilos de animación blob
const blobStyles = `
  @keyframes blob-wobble {
    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
    50% { border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%; }
    75% { border-radius: 60% 40% 60% 30% / 60% 30% 50% 60%; }
  }
  @keyframes blob-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes mitosis {
    0% { transform: scale(1) translateY(0); opacity: 0; }
    50% { transform: scale(1.2) translateY(-10px); opacity: 0.5; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  .blob-main {
    animation: blob-wobble 8s ease-in-out infinite, blob-pulse 3s ease-in-out infinite;
  }
  .blob-child {
    animation: blob-wobble 6s ease-in-out infinite reverse;
  }
  .mitosis-enter {
    animation: mitosis 0.4s ease-out forwards;
  }
`;

export const WhatsAppFloat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const whatsappNumber = getWhatsAppNumber();
  
  return (
    <>
      <style>{blobStyles}</style>
      
      {/* Contenedor pegado al borde derecho */}
      <div className="fixed bottom-28 right-0 z-50 flex flex-col items-end">
        
        {/* Blobs hijos - aparecen con mitosis */}
        <div className={`flex flex-col gap-2 mb-2 transition-all duration-400 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Instagram Blob */}
          <a
            href={`https://instagram.com/${TRIBU_INSTAGRAM}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center ${isOpen ? 'mitosis-enter' : ''}`}
            style={{ animationDelay: '0.1s' }}
            aria-label="Instagram Tribu Impulsa"
          >
            <span className="bg-white/95 backdrop-blur-sm text-[#181B34] text-[10px] font-semibold px-2 py-1 rounded-l-lg shadow-md mr-0 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
              Síguenos
            </span>
            <div 
              className="blob-child flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#E91E63] via-[#C13584] to-[#F77737] shadow-lg hover:scale-110 transition-transform"
              style={{ borderRadius: '50% 30% 50% 40% / 40% 50% 30% 50%' }}
            >
              <Instagram size={20} className="text-white" />
            </div>
          </a>
          
          {/* WhatsApp Blob */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('¡Hola Tribu Impulsa! 👋')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center ${isOpen ? 'mitosis-enter' : ''}`}
            style={{ animationDelay: '0.2s' }}
            aria-label="WhatsApp Tribu Impulsa"
          >
            <span className="bg-white/95 backdrop-blur-sm text-[#181B34] text-[10px] font-semibold px-2 py-1 rounded-l-lg shadow-md mr-0 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
              Escríbenos
            </span>
            <div 
              className="blob-child flex items-center justify-center w-12 h-12 bg-emerald-500 shadow-lg hover:scale-110 transition-transform"
              style={{ borderRadius: '40% 50% 40% 50% / 50% 40% 50% 40%' }}
            >
              <MessageCircle size={20} className="text-white" />
            </div>
          </a>
        </div>
        
        {/* Blob principal - pegado al borde */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`blob-main flex items-center justify-center w-14 h-14 shadow-xl transition-all duration-300 ${
            isOpen 
              ? 'bg-[#434343]' 
              : 'bg-gradient-to-br from-[#6161FF] to-[#00CA72]'
          }`}
          style={{ 
            borderRadius: isOpen ? '50% 20% 50% 30% / 30% 50% 20% 50%' : '60% 30% 50% 40% / 40% 50% 30% 60%',
            marginRight: '-7px' // Pegado al borde
          }}
          aria-label={isOpen ? 'Cerrar' : 'Contactar'}
        >
          {isOpen ? (
            <span className="text-white text-xl font-light">×</span>
          ) : (
            <span className="text-white text-lg">💬</span>
          )}
        </button>
        
      </div>
    </>
  );
};