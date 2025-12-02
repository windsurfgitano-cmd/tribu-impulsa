import React from 'react';
import { MessageCircle } from 'lucide-react';

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
  return '56951776005';
};

export const WhatsAppFloat: React.FC = () => {
  const whatsappNumber = getWhatsAppNumber();
  
  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-50 group"
      aria-label="Contactar por WhatsApp"
    >
      <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75 group-hover:opacity-100"></div>
      <div className="relative flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-amber-400/30 hover:bg-emerald-500 transition-all duration-300 transform group-hover:scale-110">
        <MessageCircle size={30} className="text-white fill-white/20" />
      </div>
    </a>
  );
};