import React, { useState, useEffect } from 'react';
import { Share2, Users, Flame, Clock, Trophy, Zap } from 'lucide-react';
import { useProfilesProgress } from '../hooks/useProfilesProgress';

type ProgressBannerProps = {
  tone?: 'light' | 'dark';
  className?: string;
  showFomo?: boolean;
};

export const ProgressBanner = ({ tone = 'light', className, showFomo = true }: ProgressBannerProps) => {
  const { current, target, percent, remaining, nextMilestone, loading } = useProfilesProgress();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Pulse animation cada 5 segundos para llamar la atención
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const inviteMessage = `Vamos ${current}/${target} perfiles completos en Tribu Impulsa 🚀. Únete → ${typeof window !== 'undefined' ? window.location.origin : 'https://tribuimpulsa.com'}`;

  const wrapperClass = className ?? 'px-4 mb-4';
  const isTargetReached = current >= target;
  const isCloseToMilestone = nextMilestone - current <= 10;
  
  // Colores según el progreso
  const getProgressColor = () => {
    if (isTargetReached) return 'from-emerald-500 to-green-400';
    if (percent >= 75) return 'from-violet-500 to-purple-400';
    if (percent >= 50) return 'from-blue-500 to-indigo-400';
    if (percent >= 25) return 'from-cyan-500 to-blue-400';
    return 'from-indigo-500 to-violet-400';
  };

  const gradient =
    tone === 'dark'
      ? 'from-[#0F172A] via-[#111827] to-[#1E293B]'
      : 'from-[#F0F9FF] via-[#ECFDF5] to-[#EEF2FF]';
  const textPrimary = tone === 'dark' ? 'text-white' : 'text-[#0F172A]';
  const textMuted = tone === 'dark' ? 'text-white/70' : 'text-[#475569]';
  const borderClass = tone === 'dark' ? 'border-white/10' : 'border-white/80';

  // Calcular días hasta Navidad (deadline)
  const now = new Date();
  const christmas = new Date(now.getFullYear(), 11, 25);
  if (now > christmas) christmas.setFullYear(christmas.getFullYear() + 1);
  const daysUntilChristmas = Math.ceil((christmas.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Tribu Impulsa',
          text: inviteMessage,
          url: typeof window !== 'undefined' ? window.location.origin : 'https://tribuimpulsa.com'
        });
        setFeedback('¡Gracias por compartir! 💜');
        setTimeout(() => setFeedback(null), 2500);
        return;
      }
    } catch (error) {
      console.warn('Share cancelado o no soportado:', error);
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteMessage);
        setFeedback('Mensaje copiado. Pégalo en tus redes ✨');
        setTimeout(() => setFeedback(null), 2500);
        return;
      }
    } catch (error) {
      console.warn('No se pudo copiar al portapapeles:', error);
    }

    setFeedback('Comparte este texto manualmente 🙌');
    setTimeout(() => setFeedback(null), 2500);
  };

  if (loading) {
    return (
      <div className={wrapperClass}>
        <div className="h-36 rounded-2xl bg-white/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div className={`rounded-2xl p-4 shadow-lg border ${borderClass} bg-gradient-to-br ${gradient} ${pulseAnimation ? 'ring-2 ring-indigo-400 ring-opacity-50' : ''} transition-all duration-300`}>
        {/* Header con stats principales */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <Trophy className={`w-4 h-4 ${isTargetReached ? 'text-emerald-500' : 'text-indigo-500'}`} />
              <p className={`text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
                Rally 1.000 Perfiles
              </p>
            </div>
            <p className={`text-xl font-bold mt-1 ${textPrimary}`}>
              {isTargetReached ? '🎉 ¡Meta alcanzada!' : '🚀 Vamos por los 1.000'}
            </p>
            <p className={`text-sm mt-1 ${textMuted}`}>
              {isTargetReached
                ? 'Tribu 10+10 activado globalmente'
                : `Faltan ${remaining} perfiles. Próximo hito: ${nextMilestone}`}
            </p>
          </div>
          
          {/* Contador grande animado */}
          <div className={`flex flex-col items-center min-w-[120px] p-3 rounded-xl ${tone === 'dark' ? 'bg-white/10' : 'bg-gradient-to-br from-indigo-500/10 to-violet-500/10'}`}>
            <div className={`text-3xl font-black ${textPrimary} tabular-nums`}>
              {current}
              <span className="text-base font-semibold opacity-60">/{target}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Users className="w-3 h-3 text-indigo-500" />
              <span className={`text-xs ${textMuted}`}>Perfiles</span>
            </div>
          </div>
        </div>

        {/* Barra de progreso gamificada con hitos */}
        <div className="mt-4 space-y-2">
          <div className="relative h-4 rounded-full bg-white/30 overflow-hidden">
            {/* Marcadores de hitos */}
            {[250, 500, 750].map((milestone) => (
              <div
                key={milestone}
                className="absolute top-0 h-full w-0.5 bg-white/50"
                style={{ left: `${(milestone / target) * 100}%` }}
              />
            ))}
            
            {/* Barra de progreso con gradiente */}
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-1000 ease-out relative overflow-hidden`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            >
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
            
            {/* Indicador de posición */}
            {percent > 0 && percent < 100 && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg border-2 border-indigo-500"
                style={{ left: `calc(${percent}% - 6px)` }}
              />
            )}
          </div>
          
          {/* Labels de hitos */}
          <div className="flex justify-between text-[10px] opacity-60">
            <span>0</span>
            <span>250</span>
            <span>500</span>
            <span>750</span>
            <span>1000</span>
          </div>
        </div>

        {/* Sección FOMO */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {/* Indicadores FOMO */}
          {showFomo && !isTargetReached && (
            <div className="flex flex-wrap gap-2">
              {/* Cupos restantes */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${tone === 'dark' ? 'bg-red-500/20 text-red-300' : 'bg-red-50 text-red-600'} text-xs font-medium`}>
                <Flame className="w-3.5 h-3.5" />
                <span>{remaining} cupos restantes</span>
              </div>
              
              {/* Deadline */}
              {daysUntilChristmas <= 30 && (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${tone === 'dark' ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-600'} text-xs font-medium`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{daysUntilChristmas} días para Navidad</span>
                </div>
              )}
              
              {/* Indicador de cercanía a hito */}
              {isCloseToMilestone && (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${tone === 'dark' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'} text-xs font-medium animate-pulse`}>
                  <Zap className="w-3.5 h-3.5" />
                  <span>¡{nextMilestone - current} para el hito!</span>
                </div>
              )}
            </div>
          )}

          {/* Botón de compartir simple */}
          <div className="flex flex-col items-end gap-1 ml-auto">
            <button
              onClick={handleShare}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                tone === 'dark' 
                  ? 'bg-white/20 text-white hover:bg-white/30' 
                  : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 shadow-lg hover:shadow-xl'
              }`}
            >
              <Share2 size={16} />
              Compartir
            </button>
            {feedback && <span className={`text-[10px] ${textMuted}`}>{feedback}</span>}
          </div>
        </div>

        {/* Mensaje motivacional */}
        {!isTargetReached && percent > 0 && (
          <div className={`mt-3 text-center text-xs ${textMuted} border-t ${tone === 'dark' ? 'border-white/10' : 'border-black/5'} pt-3`}>
            💪 ¡Vamos! Cada nuevo perfil nos acerca al matching 10+10
          </div>
        )}
      </div>
    </div>
  );
};
