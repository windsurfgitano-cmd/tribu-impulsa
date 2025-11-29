import React, { useEffect, useState } from 'react';

interface CosmicLoadingAnimationProps {
  onComplete?: () => void;
  duration?: number;
}

// Mensajes de carga
const LOADING_MESSAGES = [
  'Conectando con tu tribu...',
  'Escaneando emprendedores...',
  'Analizando perfiles...',
  'Calculando afinidades...',
  'Formando conexiones...',
  'Optimizando tu tribu...',
  '¡Tu tribu está lista!'
];

export const CosmicLoadingAnimation: React.FC<CosmicLoadingAnimationProps> = ({ 
  onComplete, 
  duration = 6000 
}) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  // Efecto principal - progreso y mensajes
  useEffect(() => {
    const startTime = Date.now();
    const messageInterval = duration / LOADING_MESSAGES.length;
    
    // Actualizar progreso cada 30ms
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(newProgress);
      
      // Cambiar mensaje basado en progreso
      const newMessageIndex = Math.min(
        Math.floor(elapsed / messageInterval),
        LOADING_MESSAGES.length - 1
      );
      setMessageIndex(newMessageIndex);
      
      // Terminar cuando llegue al 100%
      if (elapsed >= duration) {
        clearInterval(progressTimer);
      }
    }, 30);

    // Fade out antes de completar
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 500);

    // Completar
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black">
      {/* Video de fondo - pantalla completa */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-70"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/tribuvideo.mp4" type="video/mp4" />
      </video>
      
      {/* UI en la parte inferior */}
      <div className="absolute inset-x-0 bottom-0 pb-24 px-6 flex flex-col items-center">
        {/* Barra de progreso */}
        <div className="w-full max-w-xs mb-4">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/40 text-xs text-center mt-2">
            {progress}%
          </p>
        </div>
        
        {/* Mensaje de estado */}
        <div className="bg-black/60 backdrop-blur-sm px-5 py-2.5 rounded-full">
          <p className="text-white/90 text-sm font-medium">
            {LOADING_MESSAGES[messageIndex]}
          </p>
        </div>
      </div>
      
      {/* Fade out final */}
      <div 
        className={`absolute inset-0 bg-[#F5F7FB] pointer-events-none transition-opacity duration-500 ${
          fadeOut ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export default CosmicLoadingAnimation;
