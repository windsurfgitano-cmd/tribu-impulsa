import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, X, Users, Target, Share2, Trophy, Gift, CheckCircle } from 'lucide-react';

interface TutorialStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
  tip?: string;
}

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    icon: <Gift className="w-12 h-12 text-indigo-500" />,
    title: '¡Bienvenido/a a Tribu Impulsa!',
    description: 'La comunidad donde emprendedores se impulsan mutuamente. Te guiaremos paso a paso.',
    highlight: 'Sistema único 10+10',
    tip: 'Cada mes recibes una nueva Tribu personalizada'
  },
  {
    icon: <Users className="w-12 h-12 text-violet-500" />,
    title: 'Tu Tribu Mensual',
    description: 'Cada mes recibes 10 emprendedores para impulsar y otros 10 diferentes te impulsan a ti.',
    highlight: '10 + 10 = 20 conexiones/mes',
    tip: 'El algoritmo te conecta con negocios complementarios, nunca competencia directa'
  },
  {
    icon: <Share2 className="w-12 h-12 text-emerald-500" />,
    title: 'Cómo Impulsar',
    description: 'Comparte a tus 10 asignados en tus redes: stories, posts, menciones. Ellos harán lo mismo por ti.',
    highlight: 'Impulso mutuo garantizado',
    tip: 'Una story mencionando genera 2x más engagement que una publicación normal'
  },
  {
    icon: <Target className="w-12 h-12 text-blue-500" />,
    title: 'Completa tu Perfil',
    description: 'Mientras más completo tu perfil, mejor el matching. Incluye tu categoría, afinidades y redes.',
    highlight: 'Perfil 100% = Mejor matching',
    tip: 'Los perfiles completos aparecen primero en las búsquedas'
  },
  {
    icon: <Trophy className="w-12 h-12 text-amber-500" />,
    title: '¡Gana Recompensas!',
    description: 'Invita amigos y ambos ganan 1 mes gratis. Cuantos más invites, más meses gratis acumulas.',
    highlight: 'Sistema de referidos',
    tip: 'Usa tu código único para invitar desde el panel de progreso'
  }
];

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const step = TUTORIAL_STEPS[currentStep];
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirst = currentStep === 0;

  const goNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setDirection('next');
      setCurrentStep(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (!isFirst) {
      setDirection('prev');
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header con progreso */}
        <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {TUTORIAL_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'w-6 bg-white' 
                      : index < currentStep 
                        ? 'w-3 bg-white/70' 
                        : 'w-3 bg-white/30'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={onSkip}
              className="text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              Saltar
            </button>
          </div>
          <p className="text-white/80 text-xs mt-2">
            Paso {currentStep + 1} de {TUTORIAL_STEPS.length}
          </p>
        </div>

        {/* Contenido */}
        <div 
          className={`p-6 text-center transition-all duration-300 ${
            direction === 'next' ? 'animate-slideInRight' : 'animate-slideInLeft'
          }`}
          key={currentStep}
        >
          {/* Icono */}
          <div className="mb-4 flex justify-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg">
              {step.icon}
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {step.title}
          </h2>

          {/* Highlight */}
          {step.highlight && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-full mb-4">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">{step.highlight}</span>
            </div>
          )}

          {/* Descripción */}
          <p className="text-gray-600 mb-4 leading-relaxed">
            {step.description}
          </p>

          {/* Tip */}
          {step.tip && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
              <p className="text-xs text-amber-800">
                <span className="font-bold">💡 Tip:</span> {step.tip}
              </p>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="px-6 pb-6 flex gap-3">
          {!isFirst && (
            <button
              onClick={goPrev}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft size={18} />
              Anterior
            </button>
          )}
          <button
            onClick={goNext}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              isLast
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-lg'
                : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:shadow-lg'
            }`}
          >
            {isLast ? (
              <>
                ¡Comenzar!
                <Trophy size={18} />
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook para manejar el tutorial
export const useOnboardingTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  
  const checkAndShowTutorial = (userId: string) => {
    const hasSeenTutorial = localStorage.getItem(`tutorial_completed_${userId}`);
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  };

  const completeTutorial = (userId: string) => {
    localStorage.setItem(`tutorial_completed_${userId}`, 'true');
    setShowTutorial(false);
  };

  const skipTutorial = (userId: string) => {
    localStorage.setItem(`tutorial_completed_${userId}`, 'skipped');
    setShowTutorial(false);
  };

  return {
    showTutorial,
    setShowTutorial,
    checkAndShowTutorial,
    completeTutorial,
    skipTutorial
  };
};

export default OnboardingTutorial;

