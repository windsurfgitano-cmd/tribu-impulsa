// ===============================================
// PANTALLA DE RESULTADO DE PAGO
// ===============================================
// Maneja el retorno desde MercadoPago (success/pending/failure)

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, Crown, ArrowRight, RefreshCw, Home } from 'lucide-react';
import { getCurrentUser } from '../services/databaseService';

type PaymentStatus = 'success' | 'pending' | 'failure' | 'loading';

export const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const currentUser = getCurrentUser();

  useEffect(() => {
    // Obtener estado del pago desde URL params
    const statusParam = searchParams.get('status');
    const collectionStatus = searchParams.get('collection_status');
    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');

    console.log('📥 Retorno de MercadoPago:', { statusParam, collectionStatus, paymentId });

    // Determinar estado del pago
    if (statusParam === 'success' || collectionStatus === 'approved') {
      setStatus('success');
      
      // Actualizar localStorage con membresía activa
      // El webhook ya debería haber actualizado Firestore
      if (currentUser) {
        localStorage.setItem(`membership_status_${currentUser.id}`, 'miembro');
      }
      
      // Limpiar pago pendiente
      localStorage.removeItem('pending_payment');
      
    } else if (statusParam === 'pending' || collectionStatus === 'pending' || collectionStatus === 'in_process') {
      setStatus('pending');
      
    } else if (statusParam === 'failure' || collectionStatus === 'rejected') {
      setStatus('failure');
      
    } else {
      // Estado desconocido - verificar pago pendiente
      const pendingPayment = localStorage.getItem('pending_payment');
      if (pendingPayment) {
        setStatus('pending');
      } else {
        setStatus('failure');
      }
    }
  }, [searchParams, currentUser]);

  // Ir al dashboard
  const goToDashboard = () => {
    navigate('/dashboard');
  };

  // Reintentar pago
  const retryPayment = () => {
    navigate('/membership');
  };

  // Ir a inicio
  const goHome = () => {
    navigate('/');
  };

  // Pantalla de carga
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={40} className="text-[#6161FF] animate-spin mx-auto mb-4" />
          <p className="text-[#7C8193]">Verificando pago...</p>
        </div>
      </div>
    );
  }

  // Pago exitoso
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6161FF] via-[#8B8BFF] to-[#00CA72] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-24 h-24 bg-[#00CA72] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-[#181B34] mb-2">
            ¡Pago exitoso!
          </h1>
          
          <p className="text-[#7C8193] mb-6">
            Tu membresía está activa. Ya puedes acceder a todos los beneficios de la Tribu.
          </p>
          
          <div className="bg-[#6161FF]/10 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-[#6161FF]">
              <Crown size={24} />
              <span className="font-bold text-lg">MIEMBRO ACTIVO</span>
            </div>
          </div>
          
          <button
            onClick={goToDashboard}
            className="w-full bg-[#6161FF] hover:bg-[#5050DD] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            Ir al Dashboard
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Pago pendiente
  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFCC00] via-[#FFD633] to-[#FFE066] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-24 h-24 bg-[#FFCC00] rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={48} className="text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-[#181B34] mb-2">
            Pago en proceso
          </h1>
          
          <p className="text-[#7C8193] mb-6">
            Tu pago está siendo procesado. Recibirás un email de confirmación cuando se complete.
          </p>
          
          <div className="bg-[#FFCC00]/10 rounded-xl p-4 mb-6">
            <p className="text-[#7C8193] text-sm">
              Si pagaste con transferencia o efectivo, puede tomar hasta 24-48 horas en acreditarse.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={goHome}
              className="w-full bg-[#181B34] hover:bg-[#2A2E4A] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Home size={20} />
              Volver al inicio
            </button>
            
            <button
              onClick={retryPayment}
              className="w-full bg-white border-2 border-[#181B34] text-[#181B34] py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:bg-gray-50"
            >
              <RefreshCw size={20} />
              Intentar otro método de pago
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pago fallido
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF4444] via-[#FF6666] to-[#FF8888] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-24 h-24 bg-[#FF4444] rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={48} className="text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-[#181B34] mb-2">
          Pago no completado
        </h1>
        
        <p className="text-[#7C8193] mb-6">
          No pudimos procesar tu pago. Por favor intenta nuevamente o usa otro método de pago.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={retryPayment}
            className="w-full bg-[#6161FF] hover:bg-[#5050DD] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <RefreshCw size={20} />
            Intentar de nuevo
          </button>
          
          <button
            onClick={goHome}
            className="w-full bg-white border-2 border-[#181B34] text-[#181B34] py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:bg-gray-50"
          >
            <Home size={20} />
            Volver al inicio
          </button>
        </div>
        
        <p className="text-xs text-[#7C8193] mt-6">
          ¿Problemas con el pago? Escríbenos por WhatsApp para ayudarte.
        </p>
      </div>
    </div>
  );
};

export default PaymentResult;
