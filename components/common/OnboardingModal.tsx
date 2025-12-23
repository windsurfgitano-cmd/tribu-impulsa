// components/common/OnboardingModal.tsx
// Modal de onboarding para nuevos usuarios

import React, { useState } from 'react';
import { createPortal } from 'react-dom';

// Tutorial Steps Component - Sin emojis, iconos profesionales
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: '¡Conoce a tu Tribu!',
    subtitle: 'Bienvenido/a a la comunidad de emprendedores',
    content: '🎯 Tribu Impulsa es una red de apoyo mutuo donde emprendedores se impulsan entre sí.\n\nCada mes recibes TU TRIBU: un grupo de emprendedores seleccionados especialmente para ti.',
    iconType: 'zap',
    color: 'from-[#6161FF] to-[#00CA72]'
  },
  {
    id: 'howItWorks',
    title: '¿Cómo funciona?',
    subtitle: 'Es simple: dar y recibir',
    content: '📤 YO DOY: Compartes el contenido de 10 emprendedores en tus redes sociales (historias, posts, etc.)\n\n📥 YO RECIBO: 10 emprendedores diferentes comparten TU contenido en sus redes\n\n¡Así todos ganamos exposición!',
    iconType: 'users',
    color: 'from-[#00CA72] to-[#4AE698]'
  },
  {
    id: 'matching',
    title: 'Matching Inteligente',
    subtitle: 'El algoritmo trabaja por ti',
    content: '🧠 Nuestro algoritmo te conecta con emprendedores:\n\n✓ Complementarios a tu negocio (no competencia)\n✓ De la zona geográfica que tú hayas elegido\n✓ Con intereses y afinidades similares\n\nEl 1° de cada mes recibes una NUEVA Tribu.',
    iconType: 'zap',
    color: 'from-[#A78BFA] to-[#C9A8FF]'
  },
  {
    id: 'checklist',
    title: 'Tu Checklist Mensual',
    subtitle: 'Mantén el control de tus colaboraciones',
    content: '✅ Paso 1: Ve a "Checklist" en el menú\n✅ Paso 2: Revisa tus 10+10 asignaciones\n✅ Paso 3: Comparte y marca "Ya compartí"\n✅ Paso 4: Escríbeles por WhatsApp\n\nSi alguien no cumple, puedes reportarlo.',
    iconType: 'check',
    color: 'from-[#FFCC00] to-[#FFE066]'
  },
  {
    id: 'start',
    title: '¡Listo para empezar!',
    subtitle: 'Tu Tribu te está esperando',
    content: '🚀 Ya tienes todo lo que necesitas:\n\n1. Revisa tu Tribu del mes\n2. Comparte a tus 10 asignados\n3. Conéctate por WhatsApp\n4. ¡Crece junto a la comunidad!\n\n¿Empezamos?',
    iconType: 'user',
    color: 'from-[#E91E63] to-[#FF6B9D]'
  }
];

// Iconos SVG para el onboarding (más profesionales que emojis)
const OnboardingIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    zap: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  };
  return icons[type] || icons.zap;
};

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Usar portal para renderizar fuera del contenedor scrolleable
  // Estilos completamente inline para máxima prioridad
  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 999999,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '400px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        className="animate-slideUp">
        {/* Progress */}
        <div className="flex gap-1 p-4">
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all ${i <= currentStep ? 'bg-gradient-to-r from-[#6161FF] to-[#00CA72]' : 'bg-[#E4E7EF]'
                }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
            <OnboardingIcon type={step.iconType} />
          </div>

          <h2 className="text-2xl font-bold text-[#181B34] text-center mb-1">{step.title}</h2>
          <p className="text-[#7C8193] text-center text-sm mb-4">{step.subtitle}</p>

          <div className="bg-[#F5F7FB] rounded-xl p-4 mb-6">
            <p className="text-[#434343] text-sm whitespace-pre-line">{step.content}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 text-[#7C8193] hover:text-[#181B34] transition text-sm"
            >
              Saltar tutorial
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              {currentStep < TUTORIAL_STEPS.length - 1 ? 'Siguiente' : '¡Comenzar!'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
