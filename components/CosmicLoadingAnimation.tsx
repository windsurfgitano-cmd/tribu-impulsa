import React, { useEffect, useRef, useState } from 'react';

interface CosmicLoadingAnimationProps {
  onComplete?: () => void;
  duration?: number;
}

export const CosmicLoadingAnimation: React.FC<CosmicLoadingAnimationProps> = ({ 
  onComplete, 
  duration = 8000 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [statusText, setStatusText] = useState('Conectando con tu tribu...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const TOTAL_TIME = duration;
    const startTime = Date.now();

    // Mensajes de estado
    const statusMessages = [
      { time: 0, text: 'Conectando con tu tribu...', progress: 0 },
      { time: 1000, text: 'Escaneando emprendedores...', progress: 15 },
      { time: 2000, text: 'Analizando perfiles...', progress: 30 },
      { time: 3500, text: 'Calculando afinidades...', progress: 50 },
      { time: 5000, text: 'Formando conexiones...', progress: 70 },
      { time: 6500, text: 'Optimizando tu tribu...', progress: 85 },
      { time: 7500, text: '¡Tu tribu está lista!', progress: 100 },
    ];

    let lastMessageIndex = -1;

    const tick = () => {
      const elapsed = Date.now() - startTime;

      // Actualizar mensajes y progreso
      for (let i = statusMessages.length - 1; i >= 0; i--) {
        if (elapsed >= statusMessages[i].time && i !== lastMessageIndex) {
          setStatusText(statusMessages[i].text);
          setProgress(statusMessages[i].progress);
          lastMessageIndex = i;
          break;
        }
      }

      // Fade out cerca del final
      if (elapsed > TOTAL_TIME - 1000) {
        setFadeOut(true);
      }

      // Completar
      if (elapsed >= TOTAL_TIME) {
        if (onComplete) onComplete();
        return;
      }

      requestAnimationFrame(tick);
    };

    // Iniciar video
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay bloqueado, continuar sin video
      });
    }

    requestAnimationFrame(tick);
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black overflow-hidden">
      {/* Video de fondo - fullscreen cover */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="/tribuvideo.mp4"
        muted
        playsInline
        autoPlay
        loop
        preload="auto"
      />
      
      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* UI Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 pointer-events-none">
        {/* Logo y título */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            <span className="bg-gradient-to-r from-[#6161FF] to-[#00CA72] bg-clip-text text-transparent">
              Algoritmo Tribal X
            </span>
          </h1>
          <p className="text-white/70 text-sm mt-1 tracking-wider uppercase drop-shadow">
            Inteligencia de Conexión
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="w-72 mb-4">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(97,97,255,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/50 text-xs text-center mt-2">{progress}%</p>
        </div>
        
        {/* Status text */}
        <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
          <p className="text-white text-sm font-medium">
            {statusText}
          </p>
        </div>
      </div>
      
      {/* Fade overlay a pantalla clara */}
      <div 
        className={`absolute inset-0 bg-[#F5F7FB] pointer-events-none transition-opacity duration-700 ${
          fadeOut ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export default CosmicLoadingAnimation;
