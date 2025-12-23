// screens/loading/SearchingScreen.tsx
// Pantalla de Búsqueda "Algoritmo Tribal X" con animación 3D épica

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { FallbackLoader } from '../../components/common/FallbackLoader';
import { CosmicLoadingAnimation } from '../../components/CosmicLoadingAnimation';

export const SearchingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [useThreeJS, setUseThreeJS] = useState(true);

  // Detectar si es primera vez o login posterior
  const isFirstTime = !localStorage.getItem('algorithm_seen');
  const totalDuration = isFirstTime ? 8000 : 4000; // 8s primera vez, 4s después

  const handleComplete = () => {
    localStorage.setItem('algorithm_seen', 'true');
    navigate('/dashboard');
  };

  // Fallback si Three.js falla
  useEffect(() => {
    // Check if WebGL is available
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setUseThreeJS(false);
    } catch {
      setUseThreeJS(false);
    }
  }, []);

  // Fallback simple para dispositivos sin WebGL
  if (!useThreeJS) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#181B34] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6161FF]/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00CA72]/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
              <div className="absolute inset-2 bg-[#181B34] rounded-full flex items-center justify-center">
                <Sparkles className="text-white" size={48} />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Algoritmo Tribal X</h1>
          <p className="text-[#7C8193] mb-8 animate-pulse">Preparando tu tribu...</p>
          <FallbackLoader onComplete={handleComplete} duration={totalDuration} />
        </div>
      </div>
    );
  }

  // Animación 3D épica
  return <CosmicLoadingAnimation onComplete={handleComplete} duration={totalDuration} />;
};

export default SearchingScreen;

