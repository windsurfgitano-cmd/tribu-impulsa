// ===============================================
// VERCEL SERVERLESS FUNCTION: Webhook MercadoPago
// ===============================================
// Endpoint: POST /api/mercadopago-webhook
// Recibe notificaciones de pago y activa membresías en Firestore
// Maneja tanto pagos únicos como suscripciones con trial de $1

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Planes de suscripción (mismos que en create-subscription.ts)
const SUBSCRIPTION_PLANS: Record<string, { price: number; frequency: number; title: string }> = {
  mensual: { price: 19990, frequency: 1, title: 'Plan Mensual' },
  semestral: { price: 99990, frequency: 6, title: 'Plan Semestral' },
  anual: { price: 179990, frequency: 12, title: 'Plan Anual' }
};

// Inicializar Firebase Admin (solo una vez)
const initFirebaseAdmin = () => {
  if (getApps().length === 0) {
    // En producción, usar service account desde env var
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccount) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccount)),
        projectId: 'tribu-impulsa'
      });
    } else {
      // Fallback para desarrollo (usa Application Default Credentials)
      initializeApp({
        projectId: 'tribu-impulsa'
      });
    }
  }
  return getFirestore();
};

// MercadoPago Access Token
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // MercadoPago envía GET para verificación y POST para notificaciones
  if (req.method === 'GET') {
    // Verificación de endpoint - responder OK
    return res.status(200).send('OK');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Webhook recibido:', JSON.stringify(req.body));

    const { type, data } = req.body;

    // Solo procesar notificaciones de pago
    if (type !== 'payment') {
      console.log('ℹ️ Notificación ignorada (no es payment):', type);
      return res.status(200).json({ received: true, processed: false });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      console.log('⚠️ Notificación sin payment ID');
      return res.status(200).json({ received: true, processed: false });
    }

    // Obtener detalles del pago desde MercadoPago
    console.log('🔍 Consultando pago:', paymentId);

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
        }
      }
    );

    if (!paymentResponse.ok) {
      console.error('❌ Error obteniendo pago:', await paymentResponse.text());
      return res.status(200).json({ received: true, processed: false, error: 'Payment fetch failed' });
    }

    const payment = await paymentResponse.json();

    console.log('📋 Estado del pago:', {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference
    });

    // Solo procesar pagos aprobados
    if (payment.status !== 'approved') {
      console.log('ℹ️ Pago no aprobado, estado:', payment.status);
      return res.status(200).json({ 
        received: true, 
        processed: false, 
        status: payment.status 
      });
    }

    // Parsear external_reference para obtener userId y plan
    let referenceData;
    try {
      referenceData = JSON.parse(payment.external_reference);
    } catch {
      console.error('❌ Error parseando external_reference:', payment.external_reference);
      return res.status(200).json({ received: true, processed: false, error: 'Invalid reference' });
    }

    const { userId, planId, type: paymentType, nextChargeAmount, nextChargeDate, subscriptionPlan } = referenceData;

    if (!userId) {
      console.error('❌ userId no encontrado en external_reference');
      return res.status(200).json({ received: true, processed: false, error: 'No userId' });
    }

    // Inicializar Firestore
    const db = initFirebaseAdmin();
    const now = new Date();

    // Verificar idempotencia
    const membershipRef = db.collection('memberships').doc(userId);
    const existingMembership = await membershipRef.get();
    if (existingMembership.exists) {
      const data = existingMembership.data();
      if (data?.lastPaymentId === String(paymentId)) {
        console.log('ℹ️ Pago ya procesado:', paymentId);
        return res.status(200).json({ received: true, processed: false, reason: 'Already processed' });
      }
    }

    // =============================================
    // CASO 1: Pago de trial $1 (inicio de suscripción)
    // =============================================
    if (paymentType === 'promo_trial_1_peso') {
      console.log('🎁 Procesando pago de trial $1:', { userId, planId });

      const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.mensual;
      const trialEndDate = new Date(now);
      trialEndDate.setDate(trialEndDate.getDate() + 30);

      // Guardar membresía con trial activo
      await membershipRef.set({
        id: userId,
        email: payment.payer?.email || '',
        status: 'miembro',
        membershipType: 'trial',
        lastPaymentId: String(paymentId),
        trialStartDate: now.toISOString(),
        trialEndDate: trialEndDate.toISOString(),
        expiresAt: trialEndDate.toISOString(),
        // Info de la suscripción futura
        subscriptionPlan: planId,
        subscriptionPrice: plan.price,
        subscriptionFrequency: plan.frequency,
        nextChargeDate: trialEndDate.toISOString(),
        nextChargeAmount: plan.price,
        autoRenew: true,
        // Tracking
        trialPaymentAmount: payment.transaction_amount,
        createdAt: existingMembership.exists ? existingMembership.data()?.createdAt : now.toISOString(),
        updatedAt: now.toISOString()
      }, { merge: true });

      // Guardar en colección de suscripciones pendientes (para cron job)
      const subscriptionRef = db.collection('pending_subscriptions').doc(userId);
      await subscriptionRef.set({
        userId,
        userEmail: payment.payer?.email || '',
        planId,
        planTitle: plan.title,
        chargeAmount: plan.price,
        chargeDate: trialEndDate.toISOString(),
        trialPaymentId: String(paymentId),
        status: 'pending_charge',
        createdAt: now.toISOString()
      });

      // Guardar registro del pago trial
      await db.collection('payments').doc(String(paymentId)).set({
        id: String(paymentId),
        userId,
        userEmail: payment.payer?.email || '',
        amount: payment.transaction_amount,
        type: 'trial',
        planId,
        status: 'approved',
        provider: 'mercadopago',
        createdAt: now.toISOString()
      });

      console.log('✅ Trial $1 activado:', {
        userId,
        planId,
        nextCharge: trialEndDate.toISOString(),
        nextAmount: plan.price
      });

      return res.status(200).json({
        received: true,
        processed: true,
        type: 'trial_activated',
        userId,
        trialEnds: trialEndDate.toISOString(),
        nextCharge: { date: trialEndDate.toISOString(), amount: plan.price }
      });
    }

    // =============================================
    // CASO 2: Pago regular de suscripción/renovación
    // =============================================
    console.log('💳 Procesando pago regular:', { userId, planId });

    const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.mensual;
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + plan.frequency);

    // Actualizar membresía
    await membershipRef.set({
      id: userId,
      email: payment.payer?.email || '',
      status: 'miembro',
      membershipType: 'paid',
      lastPaymentId: String(paymentId),
      paymentDate: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      plan: planId,
      amount: payment.transaction_amount,
      currency: payment.currency_id,
      autoRenew: true,
      nextChargeDate: expiresAt.toISOString(),
      nextChargeAmount: plan.price,
      createdAt: existingMembership.exists ? existingMembership.data()?.createdAt : now.toISOString(),
      updatedAt: now.toISOString()
    }, { merge: true });

    // Eliminar de pending_subscriptions si existe (ya pagó)
    await db.collection('pending_subscriptions').doc(userId).delete().catch(() => {});

    // Guardar registro del pago
    await db.collection('payments').doc(String(paymentId)).set({
      id: String(paymentId),
      userId,
      userEmail: payment.payer?.email || '',
      amount: payment.transaction_amount,
      type: 'subscription',
      planId,
      status: 'approved',
      provider: 'mercadopago',
      createdAt: now.toISOString()
    });

    console.log('✅ Membresía activada:', {
      userId,
      plan: planId,
      expiresAt: expiresAt.toISOString()
    });

    return res.status(200).json({
      received: true,
      processed: true,
      type: 'membership_activated',
      userId,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('❌ Error en webhook:', error);
    // Siempre responder 200 para que MercadoPago no reintente
    return res.status(200).json({ 
      received: true, 
      processed: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
