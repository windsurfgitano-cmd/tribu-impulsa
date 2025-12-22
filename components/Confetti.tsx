import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
}

const COLORS = [
  '#6161FF', // Indigo
  '#00CA72', // Verde
  '#FF6B6B', // Rojo
  '#FFD93D', // Amarillo
  '#6BCB77', // Verde claro
  '#4D96FF', // Azul
  '#FF9F45', // Naranja
  '#C780FA', // Violeta
  '#F97B7B', // Rosa
];

export const Confetti: React.FC<ConfettiProps> = ({ 
  active, 
  duration = 3000, 
  particleCount = 50,
  onComplete 
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (active) {
      // Generar piezas de confeti
      const newPieces: ConfettiPiece[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 360,
      }));
      
      setPieces(newPieces);
      setIsVisible(true);

      // Ocultar después de la duración
      const timer = setTimeout(() => {
        setIsVisible(false);
        setPieces([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, particleCount, onComplete]);

  if (!isVisible || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999999] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size * 0.6}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            borderRadius: '2px',
          }}
        />
      ))}
      
      {/* Estrellas brillantes */}
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={`star-${i}`}
          className="absolute animate-confetti-star"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${20 + Math.random() * 60}%`,
            animationDelay: `${Math.random() * 1}s`,
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

// Hook para usar confeti fácilmente
export const useConfetti = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerConfetti = () => {
    setShowConfetti(true);
  };

  const ConfettiComponent = () => (
    <Confetti 
      active={showConfetti} 
      onComplete={() => setShowConfetti(false)} 
    />
  );

  return { triggerConfetti, ConfettiComponent, showConfetti };
};

export default Confetti;

