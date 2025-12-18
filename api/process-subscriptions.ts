// ===============================================
// VERCEL SERVERLESS FUNCTION: Procesar Suscripciones Pendientes
// ===============================================
// Endpoint: POST /api/process-subscriptions
// CRON JOB: Ejecutar diariamente para cobrar suscripciones vencidas
// 
// Para configurar en Vercel:
// vercel.json -> "crons": [{ "path": "/api/process-subscriptions", "schedule": "0 8 * * *" }]

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin
const initFirebaseAdmin = () => {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccount) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccount)),
        projectId: 'tribu-impulsa'
      });
    } else {
      initializeApp({ projectId: 'tribu-impulsa' });
    }
  }
  return getFirestore();
};

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const APP_URL = process.env.VITE_APP_URL || 'https://tribu-impulsa.vercel.app';

// Función para crear un cobro usando la API de MercadoPago
async function createPaymentLink(userId: string, email: string, amount: number, planId: string) {
  const preferenceData = {
    items: [{
      id: `renewal_${planId}`,
      title: `Renovación Tribu Impulsa - ${planId}`,
      description: `Renovación automática de membresía`,
      quantity: 1,
      currency_id: 'CLP',
      unit_price: amount
    }],
    payer: { email },
    external_reference: JSON.stringify({
      userId,
      planId,
      type: 'auto_renewal',
      timestamp: Date.now()
    }),
    back_urls: {
      success: `${APP_URL}/#/payment-result?status=success&type=renewal`,
      failure: `${APP_URL}/#/payment-result?status=failure`,
      pending: `${APP_URL}/#/payment-result?status=pending`
    },
    auto_return: 'approved',
    notification_url: `${APP_URL}/api/mercadopago-webhook`,
    statement_descriptor: 'TRIBU IMPULSA'
  };

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
    },
    body: JSON.stringify(preferenceData)
  });

  if (!response.ok) {
    throw new Error(`MercadoPago error: ${response.status}`);
  }

  const preference = await response.json();
  const isSandbox = MP_ACCESS_TOKEN?.startsWith('TEST-');
  return isSandbox ? preference.sandbox_init_point : preference.init_point;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Permitir GET para cron y POST para manual
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar autorización (opcional - para llamadas manuales)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Permitir llamadas de Vercel Cron (no tienen header)
    if (req.headers['x-vercel-cron'] !== '1' && req.method === 'POST') {
      console.log('⚠️ Llamada no autorizada');
      // No bloquear, solo logear
    }
  }

  if (!MP_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'MP_ACCESS_TOKEN not configured' });
  }

  try {
    const db = initFirebaseAdmin();
    const now = new Date();

    console.log('🔄 Iniciando procesamiento de suscripciones:', now.toISOString());

    // Buscar suscripciones pendientes cuya fecha de cobro ya pasó
    const pendingRef = db.collection('pending_subscriptions');
    const pendingSnapshot = await pendingRef
      .where('status', '==', 'pending_charge')
      .where('chargeDate', '<=', now.toISOString())
      .get();

    if (pendingSnapshot.empty) {
      console.log('ℹ️ No hay suscripciones pendientes de cobro');
      return res.status(200).json({ 
        processed: 0, 
        message: 'No pending subscriptions' 
      });
    }

    console.log(`📋 Encontradas ${pendingSnapshot.size} suscripciones a procesar`);

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      details: [] as any[]
    };

    for (const doc of pendingSnapshot.docs) {
      const subscription = doc.data();
      const { userId, userEmail, planId, chargeAmount, planTitle } = subscription;

      try {
        console.log(`💳 Procesando cobro para ${userId}:`, { planId, chargeAmount });

        // Crear link de pago para renovación
        const paymentLink = await createPaymentLink(userId, userEmail, chargeAmount, planId);

        // Enviar email/notificación al usuario con el link de pago
        // Por ahora, guardamos el link y marcamos como "payment_link_sent"
        await doc.ref.update({
          status: 'payment_link_sent',
          paymentLink,
          linkSentAt: now.toISOString(),
          updatedAt: now.toISOString()
        });

        // También podríamos enviar una notificación in-app
        await db.collection('notifications').add({
          userId,
          type: 'payment_reminder',
          title: '💳 Renovación de Membresía',
          message: `Tu período de prueba ha terminado. Renueva tu ${planTitle} para seguir disfrutando de Tribu Impulsa.`,
          paymentLink,
          amount: chargeAmount,
          read: false,
          createdAt: now.toISOString()
        });

        results.succeeded++;
        results.details.push({ userId, status: 'link_sent', paymentLink });

      } catch (error) {
        console.error(`❌ Error procesando ${userId}:`, error);
        
        await doc.ref.update({
          status: 'charge_failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: now.toISOString()
        });

        results.failed++;
        results.details.push({ 
          userId, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown' 
        });
      }

      results.processed++;
    }

    console.log('✅ Procesamiento completado:', results);

    return res.status(200).json({
      success: true,
      timestamp: now.toISOString(),
      results
    });

  } catch (error) {
    console.error('❌ Error en process-subscriptions:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
