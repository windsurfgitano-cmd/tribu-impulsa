// ===============================================
// PANTALLA DE PAGO - MEMBRESÍA TRIBU IMPULSA
// ===============================================
// Integración real con MercadoPago Checkout Pro

import React, { useState } from 'react';
import { Crown, CreditCard, CheckCircle, Shield, Users, Zap, ArrowRight, Loader, Star, Gift } from 'lucide-react';

// Planes de membresía
const MEMBERSHIP_PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Mensual',
    price: 19990,
    originalPrice: 19990,
    duration: '1 mes',
    savings: null,
    popular: false
  },
  semester: {
    id: 'semester',
    name: '6 Meses',
    price: 99990,
    originalPrice: 119940, // 6 × 19990
    duration: '6 meses',
    savings: '¡Paga 5, llévate 6!',
    popular: true
  },
  annual: {
    id: 'annual',
    name: '12 Meses',
    price: 179910,
    originalPrice: 239880, // 12 × 19990
    duration: '1 año',
    savings: '¡Paga 9, llévate 12!',
    popular: false
  }
};

interface PaywallScreenProps {
  userId: string;
  userEmail: string;
  userName: string;
  onPaymentSuccess: () => void;
  onClose?: () => void;
}

export const PaywallScreen: React.FC<PaywallScreenProps> = ({
  userId,
  userEmail,
  userName,
  onPaymentSuccess,
  onClose
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'semester' | 'annual'>('semester');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formatear precio chileno
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Manejar pago con MercadoPago (real)
  const handleMercadoPago = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('🛒 Iniciando pago MercadoPago:', { userId, plan: selectedPlan });
      
      // Llamar al endpoint del backend para crear la preferencia
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          userEmail,
          planId: selectedPlan
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creando preferencia de pago');
      }

      console.log('✅ Preferencia creada:', data.preferenceId);
      
      // Guardar info del pago pendiente en localStorage
      localStorage.setItem('pending_payment', JSON.stringify({
        preferenceId: data.preferenceId,
        userId,
        planId: selectedPlan,
        timestamp: Date.now()
      }));

      // Redirigir a MercadoPago Checkout
      window.location.href = data.initPoint;
      
    } catch (err) {
      console.error('❌ Error en pago:', err);
      setError(err instanceof Error ? err.message : 'Error procesando el pago');
      setIsProcessing(false);
    }
  };

  // Pantalla de éxito
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6161FF] via-[#8B8BFF] to-[#00CA72] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-[#00CA72] rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#181B34] mb-2">¡Bienvenido/a a la Tribu!</h2>
          <p className="text-[#7C8193] mb-4">Tu membresía está activa</p>
          <div className="flex items-center justify-center gap-2 text-[#6161FF]">
            <Crown size={20} />
            <span className="font-semibold">MIEMBRO ACTIVO</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#6161FF] via-[#8B8BFF] to-[#A5A5FF] text-white pt-10 pb-12 px-6 text-center">
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <Crown size={28} className="text-white" />
        </div>
        <h1 className="text-xl font-bold mb-1">¡Hola {userName.split(' ')[0]}!</h1>
        <p className="text-white/80 text-sm">
          Elige tu plan y accede al<br />
          <span className="font-semibold text-white">Algoritmo Tribal 10+10</span>
        </p>
      </div>

      {/* Contenido */}
      <div className="flex-1 px-4 -mt-6 pb-6">
        {/* Selector de planes */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <p className="text-center text-sm font-medium text-[#181B34] mb-3">Elige tu plan</p>
          <div className="space-y-2">
            {Object.values(MEMBERSHIP_PLANS).map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id as 'monthly' | 'semester' | 'annual')}
                className={`w-full p-3 rounded-xl border-2 transition-all relative ${
                  selectedPlan === plan.id
                    ? 'border-[#6161FF] bg-[#6161FF]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2 right-3 bg-[#00CA72] text-white text-[0.6rem] px-2 py-0.5 rounded-full font-semibold">
                    MÁS POPULAR
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === plan.id ? 'border-[#6161FF] bg-[#6161FF]' : 'border-gray-300'
                    }`}>
                      {selectedPlan === plan.id && (
                        <CheckCircle size={12} className="text-white" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#181B34] text-sm">{plan.name}</p>
                      {plan.savings && (
                        <p className="text-[#00CA72] text-xs flex items-center gap-1">
                          <Gift size={10} /> {plan.savings}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#181B34]">{formatPrice(plan.price)}</p>
                    {plan.originalPrice > plan.price && (
                      <p className="text-[#7C8193] text-xs line-through">
                        {formatPrice(plan.originalPrice)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Beneficios compactos */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2">
              <div className="w-8 h-8 bg-[#6161FF]/10 rounded-full flex items-center justify-center mx-auto mb-1">
                <Users size={14} className="text-[#6161FF]" />
              </div>
              <p className="text-xs font-medium text-[#181B34]">Matching 10+10</p>
            </div>
            <div className="p-2">
              <div className="w-8 h-8 bg-[#00CA72]/10 rounded-full flex items-center justify-center mx-auto mb-1">
                <Zap size={14} className="text-[#00CA72]" />
              </div>
              <p className="text-xs font-medium text-[#181B34]">Algoritmo IA</p>
            </div>
            <div className="p-2">
              <div className="w-8 h-8 bg-[#FFCC00]/10 rounded-full flex items-center justify-center mx-auto mb-1">
                <Shield size={14} className="text-[#FFCC00]" />
              </div>
              <p className="text-xs font-medium text-[#181B34]">Comunidad</p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Botón de pago */}
        <button
          onClick={handleMercadoPago}
          disabled={isProcessing}
          className="w-full bg-[#009EE3] hover:bg-[#0088C9] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg mb-3"
        >
          {isProcessing ? (
            <>
              <Loader size={20} className="animate-spin" />
              Redirigiendo a MercadoPago...
            </>
          ) : (
            <>
              <CreditCard size={20} />
              Pagar {formatPrice(MEMBERSHIP_PLANS[selectedPlan].price)}
            </>
          )}
        </button>

        {/* Info adicional */}
        <div className="text-center text-xs text-[#7C8193] space-y-2 pb-8">
          <p>✅ Pago 100% seguro</p>
          <p>📧 Recibirás confirmación a {userEmail}</p>
          <p className="text-[0.625rem]">Al pagar aceptas los términos y condiciones de Tribu Impulsa</p>
        </div>
      </div>
    </div>
  );
};

export default PaywallScreen;
