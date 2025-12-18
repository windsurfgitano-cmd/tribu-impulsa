// ===============================================
// VERCEL SERVERLESS FUNCTION: Crear Suscripción MercadoPago
// ===============================================
// Endpoint: POST /api/create-subscription
// Crea una suscripción con $1 inicial y cobro recurrente después

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Planes disponibles para suscripción
const SUBSCRIPTION_PLANS = {
  mensual: {
    id: 'mensual',
    title: 'Tribu Impulsa - Plan Mensual',
    price: 19990,
    frequency: 1, // cada 1 mes
    frequency_type: 'months',
    description: 'Membresía mensual con acceso completo al Algoritmo Tribal 10+10'
  },
  semestral: {
    id: 'semestral',
    title: 'Tribu Impulsa - Plan Semestral',
    price: 99990,
    frequency: 6, // cada 6 meses
    frequency_type: 'months',
    description: 'Membresía semestral - ¡Ahorra 1 mes!'
  },
  anual: {
    id: 'anual',
    title: 'Tribu Impulsa - Plan Anual',
    price: 179990,
    frequency: 12, // cada 12 meses
    frequency_type: 'months',
    description: 'Membresía anual - ¡Ahorra 3 meses!'
  }
};

// URLs
const APP_URL = process.env.VITE_APP_URL || 'https://tribu-impulsa.vercel.app';
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!MP_ACCESS_TOKEN) {
    console.error('❌ MP_ACCESS_TOKEN no configurado');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  try {
    const { userId, userEmail, userName, planId = 'mensual' } = req.body;

    if (!userId || !userEmail) {
      return res.status(400).json({ error: 'userId and userEmail are required' });
    }

    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan. Use: mensual, semestral, or anual' });
    }

    // Calcular fecha de inicio del cobro real (30 días después)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    // Crear Preapproval (Suscripción) en MercadoPago
    // Docs: https://www.mercadopago.cl/developers/es/docs/subscriptions/integration-configuration/subscription-no-associated-plan
    const preapprovalData = {
      reason: plan.title,
      external_reference: JSON.stringify({
        userId,
        planId: plan.id,
        type: 'subscription_promo',
        createdAt: new Date().toISOString()
      }),
      payer_email: userEmail,
      auto_recurring: {
        frequency: plan.frequency,
        frequency_type: plan.frequency_type,
        transaction_amount: plan.price,
        currency_id: 'CLP',
        // Primer cobro de $1
        start_date: trialEndDate.toISOString(),
        // Fecha final: sin límite (suscripción indefinida)
        end_date: null
      },
      // Cobro inicial de $1 para validar tarjeta
      init_point: `${APP_URL}/#/payment-result`,
      back_url: `${APP_URL}/#/payment-result`,
      // Pago inicial de verificación
      first_invoice_offset: 30, // días hasta el primer cobro real
    };

    console.log('📤 Creando suscripción MercadoPago:', {
      userId,
      plan: plan.id,
      price: plan.price,
      trialEnd: trialEndDate.toISOString()
    });

    // Para cobrar $1 inicial, usamos checkout con preferencia especial
    // y luego creamos la suscripción
    const preferenceData = {
      items: [
        {
          id: 'promo_trial',
          title: 'Suscripción Promocional Tribu Impulsa',
          description: `Mes de prueba + Plan ${plan.title} (${plan.frequency} ${plan.frequency_type})`,
          quantity: 1,
          currency_id: 'CLP',
          unit_price: 1 // $1 CLP
        }
      ],
      payer: {
        email: userEmail,
        name: userName || 'Usuario'
      },
      external_reference: JSON.stringify({
        userId,
        planId: plan.id,
        type: 'promo_trial_1_peso',
        nextChargeAmount: plan.price,
        nextChargeDate: trialEndDate.toISOString(),
        subscriptionPlan: plan
      }),
      back_urls: {
        success: `${APP_URL}/#/payment-result?status=success&type=subscription&plan=${plan.id}`,
        failure: `${APP_URL}/#/payment-result?status=failure`,
        pending: `${APP_URL}/#/payment-result?status=pending`
      },
      auto_return: 'approved',
      notification_url: `${APP_URL}/api/mercadopago-webhook`,
      statement_descriptor: 'TRIBU IMPULSA',
      // Importante: guardar tarjeta para cobros futuros
      binary_mode: true,
      // Metadata para identificar que es suscripción
      metadata: {
        subscription: true,
        plan_id: plan.id,
        plan_price: plan.price,
        plan_frequency: plan.frequency,
        trial_end: trialEndDate.toISOString(),
        user_id: userId
      }
    };

    // Crear preferencia de pago inicial ($1)
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(preferenceData)
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json();
      console.error('❌ Error de MercadoPago:', errorData);
      return res.status(mpResponse.status).json({ 
        error: 'Error creating subscription preference',
        details: errorData 
      });
    }

    const preference = await mpResponse.json();
    const isSandbox = MP_ACCESS_TOKEN.startsWith('TEST-');

    console.log('✅ Preferencia de suscripción creada:', preference.id);

    return res.status(200).json({
      success: true,
      preferenceId: preference.id,
      initPoint: isSandbox ? preference.sandbox_init_point : preference.init_point,
      plan: {
        id: plan.id,
        title: plan.title,
        trialPrice: 1,
        regularPrice: plan.price,
        frequency: plan.frequency,
        frequencyType: plan.frequency_type,
        trialEndDate: trialEndDate.toISOString()
      },
      message: `Pagarás $1 hoy. Después de 30 días, tu plan ${plan.title} se activará por $${plan.price.toLocaleString('es-CL')}`
    });

  } catch (error) {
    console.error('❌ Error en create-subscription:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
