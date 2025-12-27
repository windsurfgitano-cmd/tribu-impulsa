import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, CheckCircle, CreditCard, Crown } from 'lucide-react';
import { getCurrentUser } from '../../services/databaseService';
import { getStoredSession } from '../../utils/storage';
import { fetchMembershipFromCloud, syncMembershipToLocalCache } from '../../services/membershipCache';
import { activateTrialMembership } from '../../services/membershipService';
import { ProgressBanner } from '../../components/ProgressBanner';

export const MembershipScreen = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'mensual' | 'semestral' | 'anual'>('mensual');
  const currentUser = getCurrentUser();
  const session = getStoredSession();

  // Fecha límite para promoción $1: 31 de diciembre 2025 a las 23:59:59
  const BETA_END_DATE = new Date('2025-12-31T23:59:59');
  const isBetaActive = new Date() <= BETA_END_DATE;

  // Planes disponibles
  const PLANS: Record<string, { name: string; price: number; period: string; desc: string; badge?: string }> = {
    mensual: { name: 'Mensual', price: 19990, period: 'mes', desc: 'Renovación automática' },
    semestral: { name: 'Semestral', price: 99990, period: '6 meses', desc: '¡Ahorra 1 mes!', badge: '🔥 Popular' },
    anual: { name: 'Anual', price: 179990, period: '12 meses', desc: '¡Ahorra 3 meses!', badge: '💎 Mejor valor' }
  };

  // Verificar si ya es miembro (consultar siempre a Firebase)
  // Si ya es miembro, ir directamente al dashboard SIN video de loading
  useEffect(() => {
    const checkMembership = async () => {
      if (!currentUser?.id) return;
      
      // No redirigir si el usuario viene desde ajustes
      const fromSettings = sessionStorage.getItem('from_settings');
      if (fromSettings === 'true') {
        sessionStorage.removeItem('from_settings');
        return;
      }
      
      const membershipData = await fetchMembershipFromCloud(currentUser.id);
      if (membershipData) {
        syncMembershipToLocalCache(currentUser.id, membershipData);
        const isActive = membershipData.status === 'miembro' || membershipData.status === 'admin' || (
          membershipData.status === 'trial' &&
          membershipData.expiresAt &&
          new Date(membershipData.expiresAt) > new Date()
        );

        if (isActive) {
          // Dar tiempo para ver la página antes de redirigir
          setTimeout(() => {
            navigate('/searching'); // 🎥 Mostrar video de carga
          }, 1500);
        }
      }
    };
    checkMembership();
  }, [currentUser, navigate]);

  const activateFreeTrial = async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    try {
      // Siempre usar plan mensual según reunión 26/12
      const membership = await activateTrialMembership(currentUser.id, currentUser.email, 'mensual');
      setIsProcessing(false);
      if (membership) {
        syncMembershipToLocalCache(currentUser.id, membership);
        localStorage.setItem(`trial_used_${currentUser.id}`, 'true');
        // 🎥 Mostrar video de carga antes de ir al dashboard
        navigate('/searching');
      } else {
        alert('No se pudo activar el trial. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error activando trial gratis:', error);
      alert('Error de conexión. Intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  return isBetaActive ? (
    <div className="min-h-screen bg-gradient-to-br from-[#6161FF] via-[#8B5CF6] to-[#C026D3] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <ProgressBanner tone="dark" />
        <div className="bg-white rounded-3xl p-6 w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FFCC00] to-[#FF9500] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Gift size={32} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#181B34] mb-1">
            🎉 ¡Oferta Exclusiva Beta!
          </h1>
          <p className="text-[#7C8193] text-sm">
            Hola <span className="font-semibold text-[#6161FF]">{session?.name?.split(' ')[0] || 'Emprendedor/a'}</span>
          </p>
        </div>

        {/* Promoción Trial Gratis */}
        <div className="bg-gradient-to-r from-[#00CA72]/10 to-[#6161FF]/10 rounded-2xl p-4 mb-4 border border-[#00CA72]/30 text-center">
          <p className="text-3xl font-black text-[#00CA72] mb-1">Gratis</p>
          <p className="text-sm text-[#434343]">
            <strong>30 días de acceso completo</strong>
          </p>
          <p className="text-xs text-[#7C8193] mt-1">
            No pedimos tarjeta ahora. Evalúa con calma y decide después.
          </p>
        </div>

        {/* Plan único mensual - Simplificado según reunión 26/12 */}
        <div className="mb-5">
          <div className="bg-gradient-to-r from-[#6161FF]/10 to-[#8B5CF6]/10 rounded-2xl p-4 border border-[#6161FF]/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#181B34] text-sm">Plan Mensual</p>
                <p className="text-xs text-[#7C8193]">Renovación automática</p>
              </div>
              <p className="font-bold text-[#181B34]">$19.990<span className="text-xs text-[#7C8193] font-normal">/mes</span></p>
            </div>
            <p className="text-xs text-[#7C8193] mt-2 text-center">
              El cobro se ejecutará al finalizar tu mes de prueba gratuito
            </p>
          </div>
        </div>

        {/* Beneficios */}
        <div className="space-y-2 mb-5 text-left">
          <div className="flex items-center gap-2 text-xs text-[#434343]">
            <CheckCircle size={14} className="text-[#00CA72]" />
            <span>Acceso completo al <strong>Algoritmo Tribal 10+10</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#434343]">
            <CheckCircle size={14} className="text-[#00CA72]" />
            <span>Conexiones con <strong>emprendedores verificados</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#434343]">
            <CheckCircle size={14} className="text-[#00CA72]" />
            <span>Cancela cuando quieras, <strong>sin penalización</strong></span>
          </div>
        </div>

        {/* Botón de activar trial */}
        <button
          onClick={activateFreeTrial}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-[#00CA72] to-[#00B366] hover:from-[#00B366] hover:to-[#009A56] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard size={20} />
              Activar mes gratis
            </>
          )}
        </button>

          <p className="text-[10px] text-[#7C8193] mt-3 text-center leading-relaxed">
            Te avisaremos antes de que termine el periodo gratuito. Después se cobrará automáticamente el plan <strong>Mensual</strong> ($19.990/mes).
          </p>
        </div>
      </div>
    </div>
  ) : (
    // Vista cuando la Beta ya terminó (después del 31 dic 2025)
    <div className="min-h-screen bg-gradient-to-br from-[#6161FF] via-[#8B5CF6] to-[#C026D3] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <ProgressBanner tone="dark" />
        <div className="bg-white rounded-3xl p-8 w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-gradient-to-br from-[#6161FF] to-[#8B5CF6] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Crown size={40} className="text-white" />
        </div>

        <h1 className="text-2xl font-bold text-[#181B34] mb-2">
          ¡Únete a Tribu Impulsa!
        </h1>
        <p className="text-[#7C8193] text-sm mb-6">
          Selecciona el plan que mejor se adapte a tu negocio
        </p>

        {/* Planes de pago */}
        <div className="space-y-3 mb-6">
          {[
            { id: 'mensual', name: 'Mensual', price: 19990, desc: 'Renovación mes a mes', badge: null },
            { id: 'semestral', name: 'Semestral', price: 99990, desc: '¡1 mes gratis!', badge: '🔥 Popular', original: 119940 },
            { id: 'anual', name: 'Anual', price: 179990, desc: '¡3 meses gratis!', badge: '💎 Mejor valor', original: 239880 }
          ].map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-4 text-left ${plan.badge ? 'border-[#6161FF] bg-[#6161FF]/5' : 'border-[#E4E7EF]'}`}
            >
              {plan.badge && (
                <span className="absolute -top-2 right-3 bg-[#6161FF] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  {plan.badge}
                </span>
              )}
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-[#181B34]">{plan.name}</p>
                  <p className="text-xs text-[#7C8193]">{plan.desc}</p>
                </div>
                <div className="text-right">
                  {plan.original && (
                    <p className="text-xs text-[#7C8193] line-through">${plan.original.toLocaleString('es-CL')}</p>
                  )}
                  <p className="font-bold text-[#181B34]">${plan.price.toLocaleString('es-CL')}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    console.log('🔍 Iniciando pago MercadoPago:', {
                      userId: currentUser?.id,
                      userEmail: currentUser?.email,
                      planId: plan.id
                    });

                    const response = await fetch('/api/create-preference', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: currentUser?.id,
                        userEmail: currentUser?.email,
                        planId: plan.id
                      })
                    });

                    console.log('📥 Response status:', response.status, response.statusText);
                    const data = await response.json();
                    console.log('📦 Response data:', data);

                    if (!response.ok) {
                      console.error('❌ Error en respuesta:', data);
                      alert(`Error: ${data.error || 'Error desconocido'}\n${data.details ? JSON.stringify(data.details, null, 2) : ''}`);
                      setIsProcessing(false);
                      return;
                    }

                    if (data.initPoint) {
                      console.log('✅ Redirigiendo a MercadoPago:', data.initPoint);
                      window.location.href = data.initPoint;
                    } else {
                      console.error('❌ No se recibió initPoint:', data);
                      alert('Error: No se pudo crear el pago. Intenta de nuevo o contacta soporte.');
                    }
                  } catch (error) {
                    console.error('❌ Error de conexión:', error);
                    alert(`Error de conexión: ${error instanceof Error ? error.message : 'Desconocido'}. Verifica tu internet y vuelve a intentar.`);
                  }
                  setIsProcessing(false);
                }}
                disabled={isProcessing}
                className="w-full mt-3 py-2.5 rounded-lg bg-gradient-to-r from-[#6161FF] to-[#8B5CF6] text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Procesando...' : 'Pagar con MercadoPago'}
              </button>
            </div>
          ))}
        </div>

          <p className="text-xs text-[#7C8193]">
            Pagos seguros con MercadoPago • Cancela cuando quieras
          </p>
        </div>
      </div>
    </div>
  );
};

