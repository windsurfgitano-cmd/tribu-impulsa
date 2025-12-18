// ===============================================
// VERCEL SERVERLESS FUNCTION: Crear Preferencia MercadoPago
// ===============================================
// Endpoint: POST /api/create-preference
// Crea una preferencia de Checkout Pro y retorna el init_point

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Planes de membresía disponibles
const MEMBERSHIP_PLANS = {
  monthly: {
    id: 'monthly',
    title: 'Membresía Tribu Impulsa - Mensual',
    price: 19990,
    duration_months: 1,
    description: 'Acceso completo al Algoritmo Tribal 10+10 por 1 mes'
  },
  semester: {
    id: 'semester',
    title: 'Membresía Tribu Impulsa - 6 Meses (Paga 5)',
    price: 99990, // 5 meses al precio de 6
    duration_months: 6,
    description: 'Acceso completo por 6 meses - ¡Ahorra 1 mes!'
  },
  annual: {
    id: 'annual',
    title: 'Membresía Tribu Impulsa - 12 Meses (Paga 9)',
    price: 179910, // 9 meses al precio de 12
    duration_months: 12,
    description: 'Acceso completo por 1 año - ¡Ahorra 3 meses!'
  }
};

// URL base de la app (se configura en Vercel env vars)
const APP_URL = process.env.VITE_APP_URL || 'https://tribu-impulsa.vercel.app';

// MercadoPago Access Token (desde env vars de Vercel)
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar que tenemos el access token configurado
  if (!MP_ACCESS_TOKEN) {
    console.error('❌ MP_ACCESS_TOKEN no configurado en variables de entorno');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  try {
    const { userId, userEmail, planId = 'monthly' } = req.body;

    // Validar datos requeridos
    if (!userId || !userEmail) {
      return res.status(400).json({ error: 'userId and userEmail are required' });
    }

    // Obtener plan seleccionado
    const plan = MEMBERSHIP_PLANS[planId as keyof typeof MEMBERSHIP_PLANS];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan. Use: monthly, semester, or annual' });
    }

    // Crear external_reference para identificar el pago
    const externalReference = JSON.stringify({
      userId,
      planId: plan.id,
      durationMonths: plan.duration_months,
      timestamp: Date.now()
    });

    // Crear preferencia en MercadoPago
    const preferenceData = {
      items: [
        {
          id: plan.id,
          title: plan.title,
          description: plan.description,
          quantity: 1,
          currency_id: 'CLP',
          unit_price: plan.price
        }
      ],
      payer: {
        email: userEmail
      },
      external_reference: externalReference,
      back_urls: {
        success: `${APP_URL}/#/payment-result?status=success`,
        failure: `${APP_URL}/#/payment-result?status=failure`,
        pending: `${APP_URL}/#/payment-result?status=pending`
      },
      auto_return: 'approved',
      notification_url: `${APP_URL}/api/mercadopago-webhook`,
      statement_descriptor: 'TRIBU IMPULSA',
      expires: false
    };

    console.log('📤 Creando preferencia MercadoPago:', {
      userId,
      plan: plan.id,
      price: plan.price
    });

    // Llamar a la API de MercadoPago
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
        error: 'Error creating payment preference',
        details: errorData 
      });
    }

    const preference = await mpResponse.json();

    console.log('✅ Preferencia creada:', preference.id);

    // Retornar URLs de checkout
    // En sandbox usar sandbox_init_point, en producción usar init_point
    const isSandbox = MP_ACCESS_TOKEN.startsWith('TEST-');
    
    return res.status(200).json({
      success: true,
      preferenceId: preference.id,
      initPoint: isSandbox ? preference.sandbox_init_point : preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      plan: {
        id: plan.id,
        title: plan.title,
        price: plan.price,
        durationMonths: plan.duration_months
      }
    });

  } catch (error) {
    console.error('❌ Error en create-preference:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
