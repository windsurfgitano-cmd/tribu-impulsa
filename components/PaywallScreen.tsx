// ===============================================
// PANTALLA DE PAGO - MEMBRESÍA TRIBU IMPULSA
// ===============================================

import React, { useState } from 'react';
import { Crown, CreditCard, CheckCircle, Shield, Users, Zap, ArrowRight, Loader } from 'lucide-react';
import { MEMBERSHIP_PRICE, simulateSuccessfulPayment } from '../services/membershipService';

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
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'fintoc' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Formatear precio chileno
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Manejar pago con MercadoPago
  const handleMercadoPago = async () => {
    setPaymentMethod('mercadopago');
    setIsProcessing(true);
    
    try {
      // En producción: redirigir a checkout de MercadoPago
      // Por ahora simulamos el pago exitoso
      const success = await simulateSuccessfulPayment(userId, userEmail);
      
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          onPaymentSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error('Error en pago:', error);
      alert('Error procesando el pago. Intenta de nuevo.');
    }
    
    setIsProcessing(false);
  };

  // Manejar pago con Fintoc
  const handleFintoc = async () => {
    setPaymentMethod('fintoc');
    setIsProcessing(true);
    
    try {
      // En producción: usar Fintoc Widget
      const success = await simulateSuccessfulPayment(userId, userEmail);
      
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          onPaymentSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error('Error en pago:', error);
      alert('Error procesando el pago. Intenta de nuevo.');
    }
    
    setIsProcessing(false);
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
      <div className="bg-gradient-to-br from-[#6161FF] via-[#8B8BFF] to-[#A5A5FF] text-white pt-12 pb-16 px-6 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">¡Hola {userName.split(' ')[0]}!</h1>
        <p className="text-white/80 text-sm">
          Activa tu membresía para acceder al<br />
          <span className="font-semibold text-white">Algoritmo Tribal 10+10</span>
        </p>
      </div>

      {/* Contenido */}
      <div className="flex-1 px-4 -mt-8">
        {/* Card de precio */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-[#7C8193] text-sm mb-1">Membresía anual</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-[#181B34]">
                {formatPrice(MEMBERSHIP_PRICE.amount)}
              </span>
              <span className="text-[#7C8193]">/año</span>
            </div>
            <p className="text-[#00CA72] text-xs mt-1">
              Solo {formatPrice(Math.round(MEMBERSHIP_PRICE.amount / 12))}/mes
            </p>
          </div>

          {/* Beneficios */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#6161FF]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Users size={16} className="text-[#6161FF]" />
              </div>
              <div>
                <p className="font-medium text-[#181B34] text-sm">Matching 10+10</p>
                <p className="text-[#7C8193] text-xs">10 cuentas para impulsar, 10 que te impulsan</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#00CA72]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap size={16} className="text-[#00CA72]" />
              </div>
              <div>
                <p className="font-medium text-[#181B34] text-sm">Algoritmo de Afinidad</p>
                <p className="text-[#7C8193] text-xs">Matches basados en tu rubro e intereses</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#FFCC00]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield size={16} className="text-[#FFCC00]" />
              </div>
              <div>
                <p className="font-medium text-[#181B34] text-sm">Comunidad Verificada</p>
                <p className="text-[#7C8193] text-xs">Solo emprendedores comprometidos</p>
              </div>
            </div>
          </div>

          {/* Botones de pago */}
          <div className="space-y-3">
            <button
              onClick={handleMercadoPago}
              disabled={isProcessing}
              className="w-full bg-[#009EE3] hover:bg-[#0088C9] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-md"
            >
              {isProcessing && paymentMethod === 'mercadopago' ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Pagar con MercadoPago
                </>
              )}
            </button>
            
            <button
              onClick={handleFintoc}
              disabled={isProcessing}
              className="w-full bg-[#181B34] hover:bg-[#2A2E4A] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-md"
            >
              {isProcessing && paymentMethod === 'fintoc' ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                  Pagar con Transferencia (Fintoc)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info adicional */}
        <div className="text-center text-xs text-[#7C8193] space-y-2 pb-8">
          <p>✅ Pago 100% seguro</p>
          <p>📧 Recibirás confirmación a {userEmail}</p>
          <p className="text-[10px]">Al pagar aceptas los términos y condiciones de Tribu Impulsa</p>
        </div>
      </div>
    </div>
  );
};

export default PaywallScreen;
