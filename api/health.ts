// ===============================================
// VERCEL SERVERLESS FUNCTION: Health Check
// ===============================================
// Endpoint: GET /api/health
// Verifica que las variables de entorno estén configuradas

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Permitir GET y OPTIONS (para CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar variables de entorno
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  const FIREBASE_SERVICE_ACCOUNT_KEY = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const VITE_APP_URL = process.env.VITE_APP_URL;

  const mpConfigured = !!MP_ACCESS_TOKEN;
  const firebaseConfigured = !!FIREBASE_SERVICE_ACCOUNT_KEY;
  const isSandbox = MP_ACCESS_TOKEN?.startsWith('TEST-');

  // Estado general
  const allOk = mpConfigured && firebaseConfigured;

  return res.status(200).json({
    status: allOk ? 'healthy' : 'warning',
    timestamp: new Date().toISOString(),
    environment: {
      MP_ACCESS_TOKEN: mpConfigured ? '✅ Configurado' : '❌ NO configurado',
      MP_MODE: isSandbox ? '🧪 Sandbox (TEST)' : '🚀 Producción (LIVE)',
      FIREBASE_SERVICE_ACCOUNT_KEY: firebaseConfigured ? '✅ Configurado' : '❌ NO configurado',
      VITE_APP_URL: VITE_APP_URL || '(usando default: https://tribu-impulsa.vercel.app)'
    },
    endpoints: {
      create_preference: '/api/create-preference',
      mercadopago_webhook: '/api/mercadopago-webhook',
      health: '/api/health'
    },
    recommendations: allOk 
      ? [] 
      : [
          !mpConfigured && 'Configura MP_ACCESS_TOKEN en Vercel → Settings → Environment Variables',
          !firebaseConfigured && 'Configura FIREBASE_SERVICE_ACCOUNT_KEY en Vercel',
          'Haz Redeploy después de agregar variables de entorno'
        ].filter(Boolean)
  });
}

