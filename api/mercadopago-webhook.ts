// ===============================================
// VERCEL SERVERLESS FUNCTION: Webhook MercadoPago
// ===============================================
// Endpoint: POST /api/mercadopago-webhook
// Recibe notificaciones de pago y activa membresías en Firestore

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

    const { userId, planId, durationMonths } = referenceData;

    if (!userId) {
      console.error('❌ userId no encontrado en external_reference');
      return res.status(200).json({ received: true, processed: false, error: 'No userId' });
    }

    console.log('👤 Activando membresía para:', { userId, planId, durationMonths });

    // Inicializar Firestore y actualizar membresía
    const db = initFirebaseAdmin();

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + (durationMonths || 1));

    // Actualizar membresía del usuario
    const membershipRef = db.collection('memberships').doc(userId);
    
    // Verificar idempotencia - no procesar el mismo pago dos veces
    const existingMembership = await membershipRef.get();
    if (existingMembership.exists) {
      const data = existingMembership.data();
      if (data?.paymentId === String(paymentId)) {
        console.log('ℹ️ Pago ya procesado anteriormente:', paymentId);
        return res.status(200).json({ received: true, processed: false, reason: 'Already processed' });
      }
    }

    // Guardar/actualizar membresía
    await membershipRef.set({
      id: userId,
      status: 'miembro',
      paymentId: String(paymentId),
      paymentDate: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      plan: planId || 'monthly',
      amount: payment.transaction_amount,
      currency: payment.currency_id,
      updatedAt: now.toISOString()
    }, { merge: true });

    // Guardar registro del pago
    const paymentRef = db.collection('payments').doc(String(paymentId));
    await paymentRef.set({
      id: String(paymentId),
      mpPaymentId: payment.id,
      userId,
      userEmail: payment.payer?.email || '',
      amount: payment.transaction_amount,
      currency: payment.currency_id,
      status: 'approved',
      provider: 'mercadopago',
      plan: planId || 'monthly',
      durationMonths: durationMonths || 1,
      externalReference: payment.external_reference,
      createdAt: now.toISOString(),
      completedAt: now.toISOString(),
      rawPayment: payment // Guardar datos completos para referencia
    });

    console.log('✅ Membresía activada exitosamente:', {
      userId,
      plan: planId,
      expiresAt: expiresAt.toISOString()
    });

    return res.status(200).json({
      received: true,
      processed: true,
      userId,
      status: 'membership_activated',
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
