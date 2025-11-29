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
  const [textVisible, setTextVisible] = useState(true);

  // EFECTO 1: Reproducir video
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        console.log('Autoplay bloqueado');
      });
    }
  }, []);

  // EFECTO 2: Progreso continuo (independiente de mensajes)
  useEffect(() => {
    const TOTAL_TIME = duration;
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(Math.round((elapsed / TOTAL_TIME) * 100), 100);
      setProgress(newProgress);
      
      if (elapsed >= TOTAL_TIME) {
        clearInterval(progressInterval);
      }
    }, 50); // Actualizar cada 50ms para animación suave

    return () => clearInterval(progressInterval);
  }, [duration]);

  // EFECTO 3: Mensajes con fade (independiente del progreso)
  useEffect(() => {
    const TOTAL_TIME = duration;
    const timeouts: NodeJS.Timeout[] = [];

    // Mensajes de estado con tiempos específicos
    const statusMessages = [
      { time: 0, text: 'Conectando con tu tribu...' },
      { time: 1200, text: 'Escaneando emprendedores...' },
      { time: 2400, text: 'Analizando perfiles...' },
      { time: 3600, text: 'Calculando afinidades...' },
      { time: 4800, text: 'Formando conexiones...' },
      { time: 6000, text: 'Optimizando tu tribu...' },
      { time: 7200, text: '¡Tu tribu está lista!' },
    ];

    statusMessages.forEach((msg) => {
      if (msg.time === 0) {
        // Primer mensaje inmediato
        setStatusText(msg.text);
        setTextVisible(true);
      } else {
        const timeout = setTimeout(() => {
          // Fade out
          setTextVisible(false);
          // Cambiar texto y fade in
          setTimeout(() => {
            setStatusText(msg.text);
            setTextVisible(true);
          }, 200);
        }, msg.time);
        timeouts.push(timeout);
      }
    });

    // Fade out final
    const fadeTimeout = setTimeout(() => {
      setFadeOut(true);
    }, TOTAL_TIME - 800);
    timeouts.push(fadeTimeout);

    // Completar
    const completeTimeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, TOTAL_TIME);
    timeouts.push(completeTimeout);

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
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
      
      {/* Overlay oscuro mate para el video en segundo plano */}
      <div className="absolute inset-0 bg-black/50" />
      
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
        
        {/* Status text con animación */}
        <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
          <p className={`text-white text-sm font-medium transition-opacity duration-200 ${textVisible ? 'opacity-100' : 'opacity-0'}`}>
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
