// components/common/FallbackLoader.tsx
// Loader de fallback simple con barra de progreso

import React, { useState, useEffect } from 'react';

interface FallbackLoaderProps {
  onComplete: () => void;
  duration: number;
}

export const FallbackLoader: React.FC<FallbackLoaderProps> = ({ onComplete, duration }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);
    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <>
      <div className="w-full bg-[#2D3154] rounded-full h-3 mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[#6161FF] font-mono">{progress}%</p>
    </>
  );
};

export default FallbackLoader;

