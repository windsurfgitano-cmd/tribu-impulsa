// TribalAnimation.tsx - Animación épica Canvas 2D para loading LLM

import React, { useEffect, useRef, useState } from 'react';

interface TribalLoadingProps {
  isLoading: boolean;
  duration?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  angle: number;
  radius: number;
  speed: number;
  trail: { x: number; y: number }[];
}

const COLORS = ['#6161FF', '#00CA72', '#FFCC00', '#FB275D', '#00D4FF'];

export const TribalLoadingAnimation: React.FC<TribalLoadingProps> = ({ 
  isLoading, 
  duration = 4500 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const startTimeRef = useRef<number>(0);
  const [phase, setPhase] = useState<'chaos' | 'converging' | 'crystallizing' | 'complete'>('chaos');
  const [statusText, setStatusText] = useState('Conectando con la tribu...');

  useEffect(() => {
    if (!isLoading) {
      setPhase('chaos');
      setStatusText('Conectando con la tribu...');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const particleCount = 150;
    particlesRef.current = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * Math.max(width, height) * 0.5;
      
      particlesRef.current.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: Math.random() * 3 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.5 + 0.5,
        angle: Math.random() * Math.PI * 2,
        radius: radius,
        speed: Math.random() * 0.02 + 0.01,
        trail: [],
      });
    }

    startTimeRef.current = Date.now();

    const textTimeouts = [
      setTimeout(() => setStatusText('Analizando perfiles...'), duration * 0.2),
      setTimeout(() => setStatusText('Buscando sinergias...'), duration * 0.4),
      setTimeout(() => setStatusText('Identificando oportunidades...'), duration * 0.6),
      setTimeout(() => setStatusText('Cristalizando insights...'), duration * 0.8),
    ];

    const phaseTimeouts = [
      setTimeout(() => setPhase('converging'), duration * 0.3),
      setTimeout(() => setPhase('crystallizing'), duration * 0.6),
      setTimeout(() => setPhase('complete'), duration * 0.95),
    ];

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      ctx.fillStyle = 'rgba(10, 10, 26, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const glowRadius = 40 + Math.sin(elapsed * 0.003) * 10;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius * (0.5 + progress * 0.5));
      gradient.addColorStop(0, `rgba(97, 97, 255, ${0.3 + progress * 0.4})`);
      gradient.addColorStop(0.5, `rgba(0, 202, 114, ${0.1 + progress * 0.2})`);
      gradient.addColorStop(1, 'rgba(10, 10, 26, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      particlesRef.current.forEach((p, i) => {
        if (progress > 0.3) {
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 8) p.trail.shift();
        }

        if (progress < 0.3) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -0.9;
          if (p.y < 0 || p.y > height) p.vy *= -0.9;
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          p.x = centerX + dx * Math.cos(0.002) - dy * Math.sin(0.002);
          p.y = centerY + dx * Math.sin(0.002) + dy * Math.cos(0.002);
        } else if (progress < 0.6) {
          const tornadoProgress = (progress - 0.3) / 0.3;
          p.angle += p.speed * (1 + tornadoProgress * 2);
          p.radius *= (1 - tornadoProgress * 0.015);
          const spiralX = centerX + Math.cos(p.angle) * p.radius;
          const spiralY = centerY + Math.sin(p.angle) * p.radius * (1 - tornadoProgress * 0.3);
          p.x += (spiralX - p.x) * 0.08;
          p.y += (spiralY - p.y) * 0.08;
          p.y += Math.sin(elapsed * 0.01 + i) * 2 * tornadoProgress;
        } else {
          const crystalProgress = (progress - 0.6) / 0.4;
          const crystalAngle = (i / particlesRef.current.length) * Math.PI * 2;
          const crystalRadius = 30 * (1 - crystalProgress * 0.7);
          const layers = Math.floor(i / 50);
          const targetX = centerX + Math.cos(crystalAngle + layers * 0.5) * crystalRadius * (1 + layers * 0.3);
          const targetY = centerY + Math.sin(crystalAngle + layers * 0.5) * crystalRadius * (1 + layers * 0.3);
          p.x += (targetX - p.x) * 0.1;
          p.y += (targetY - p.y) * 0.1;
        }

        if (p.trail.length > 1 && progress > 0.3) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let j = 1; j < p.trail.length; j++) {
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
          }
          ctx.strokeStyle = p.color + '20';
          ctx.lineWidth = p.size * 0.5;
          ctx.stroke();
        }

        const glowSize = p.size * (1 + Math.sin(elapsed * 0.005 + i) * 0.3);
        const particleGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize * 3);
        particleGlow.addColorStop(0, p.color);
        particleGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = particleGlow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      if (progress > 0.7) {
        const crystalAlpha = (progress - 0.7) / 0.3;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(elapsed * 0.001);
        const size = 25 * crystalAlpha;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * size;
          const y = Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        const crystalGradient = ctx.createLinearGradient(-size, -size, size, size);
        crystalGradient.addColorStop(0, `rgba(97, 97, 255, ${crystalAlpha * 0.8})`);
        crystalGradient.addColorStop(0.5, `rgba(0, 202, 114, ${crystalAlpha * 0.6})`);
        crystalGradient.addColorStop(1, `rgba(255, 204, 0, ${crystalAlpha * 0.8})`);
        ctx.fillStyle = crystalGradient;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${crystalAlpha * 0.8})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      textTimeouts.forEach(clearTimeout);
      phaseTimeouts.forEach(clearTimeout);
    };
  }, [isLoading, duration]);

  if (!isLoading) return null;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: '220px' }}>
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 100%)' }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 pointer-events-none">
        <div className="text-center px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-[#6161FF] rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-semibold">Tribu X</span>
            <div className="w-2 h-2 bg-[#00CA72] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
          <p className="text-white/70 text-xs">{statusText}</p>
        </div>
      </div>
      <div className="absolute top-3 right-3 flex gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${phase === 'chaos' ? 'bg-[#FFCC00] scale-150' : 'bg-white/20'}`} />
        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${phase === 'converging' ? 'bg-[#6161FF] scale-150' : 'bg-white/20'}`} />
        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${phase === 'crystallizing' || phase === 'complete' ? 'bg-[#00CA72] scale-150' : 'bg-white/20'}`} />
      </div>
    </div>
  );
};

export default TribalLoadingAnimation;
