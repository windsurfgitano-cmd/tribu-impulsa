# 🔍 Diagnóstico y Solución MercadoPago

## 📋 Estado Actual

La integración de MercadoPago está implementada con:
- ✅ Serverless functions en Vercel (`/api/create-preference`, `/api/mercadopago-webhook`)
- ✅ Checkout Pro (no suscripciones recurrentes automáticas)
- ✅ Webhook para procesar pagos
- ⚠️ **REPORTADO CON FALLAS**

---

## 🚨 Problemas Comunes y Soluciones

### 1. **Variables de Entorno NO Configuradas en Vercel**

#### Síntomas:
- Error 500 al hacer clic en "Pagar con MercadoPago"
- Mensaje: `Payment service not configured`
- El botón se queda en "Procesando..." y nada pasa

#### Causa:
Las variables de entorno **NO están configuradas en Vercel**.

#### Solución:
Ve a Vercel Dashboard → Tu proyecto → Settings → Environment Variables y agrega:

```bash
# MercadoPago (OBLIGATORIO)
MP_ACCESS_TOKEN=TEST-xxxx-xxxx-xxxx-xxxx  # Tu access token de MercadoPago

# Firebase Admin (OBLIGATORIO para webhook)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"tribu-impulsa",...}

# URL de la app (OPCIONAL, tiene default)
VITE_APP_URL=https://tribu-impulsa.vercel.app
```

**⚠️ IMPORTANTE:**
- `MP_ACCESS_TOKEN`: Obtenerlo desde [MercadoPago Developers](https://www.mercadopago.cl/developers/panel/app)
- `FIREBASE_SERVICE_ACCOUNT_KEY`: El contenido COMPLETO del archivo JSON (una sola línea)
- Después de agregar variables, hacer **Redeploy** en Vercel

---

### 2. **Access Token Inválido o Vencido**

#### Síntomas:
- Error 401 o 403 al crear preferencia
- Mensaje: `Error creating payment preference`

#### Causa:
El token de MercadoPago es inválido, vencido o tiene permisos incorrectos.

#### Solución:
1. Ve a [MercadoPago Developers](https://www.mercadopago.cl/developers/panel/app)
2. Crea una nueva aplicación o usa una existente
3. Copia el **Access Token** (modo TEST o PRODUCTION)
4. Actualízalo en Vercel → Environment Variables → `MP_ACCESS_TOKEN`
5. Redeploy

**Nota:** El código detecta automáticamente si el token es TEST (muestra `sandbox_init_point`) o PRODUCTION (muestra `init_point`).

---

### 3. **Webhook NO Recibe Notificaciones**

#### Síntomas:
- El pago se realiza en MercadoPago pero la membresía NO se activa
- El usuario ve "Pago exitoso" en MercadoPago pero sigue sin acceso

#### Causa:
MercadoPago no puede enviar notificaciones al webhook porque:
- La URL del webhook es incorrecta
- El webhook no está configurado en MercadoPago
- Vercel bloquea las peticiones

#### Solución:

**Opción A: Configurar webhook en MercadoPago Dashboard**
1. Ve a [MercadoPago Developers](https://www.mercadopago.cl/developers/panel/app)
2. Selecciona tu aplicación
3. Ve a "Webhooks"
4. Agrega: `https://tribu-impulsa.vercel.app/api/mercadopago-webhook`
5. Eventos a escuchar: **payment**

**Opción B: El código ya incluye `notification_url`**
El código actual ya envía `notification_url` en la preferencia:
```typescript
notification_url: `${APP_URL}/api/mercadopago-webhook`
```

**Verificar:**
- Ve a Vercel → Deployments → Functions → `/api/mercadopago-webhook`
- Verifica que la función se haya deployado correctamente
- Revisa los logs de Vercel para ver si llegan peticiones

---

### 4. **CORS o Rutas Incorrectas**

#### Síntomas:
- Error en consola del navegador: `Failed to fetch`
- Network error al hacer clic en pagar

#### Causa:
Las rutas de API no están bien configuradas en Vercel o hay problemas de CORS.

#### Solución:
El `vercel.json` actual tiene:
```json
"rewrites": [
  { "source": "/api/(.*)", "destination": "/api/$1" }
]
```

**Esto está CORRECTO**. Si el problema persiste:
1. Verifica que los archivos en `/api/*.ts` se hayan deployado
2. Ve a Vercel → Functions y confirma que existen:
   - `api/create-preference`
   - `api/mercadopago-webhook`

---

### 5. **Error en Desarrollo Local (Localhost)**

#### Síntomas:
- MercadoPago funciona en producción pero NO en localhost

#### Causa:
Las serverless functions de Vercel NO funcionan en `npm run dev` (Vite local).

#### Solución:
**Usar Vercel CLI para desarrollo:**
```bash
npm install -g vercel
vercel dev
```

Esto simulará el entorno de Vercel localmente con las funciones API.

**O usar ngrok/tunnelmole para exponer localhost:**
```bash
npx tunnelmole 3000
```

---

## 🛠️ Cómo Debuggear

### 1. Ver logs del frontend:
Abre la consola del navegador (F12) y revisa:
- ¿La petición a `/api/create-preference` se hace?
- ¿Qué status code devuelve? (200, 500, 404?)
- ¿Qué dice el JSON de respuesta?

### 2. Ver logs de Vercel:
1. Ve a Vercel Dashboard → Tu proyecto → Logs
2. Filtra por "Function Logs"
3. Busca errores en:
   - `/api/create-preference`
   - `/api/mercadopago-webhook`

### 3. Probar el webhook manualmente:
```bash
curl -X GET https://tribu-impulsa.vercel.app/api/mercadopago-webhook
```

Debería responder: `OK`

---

## 📝 Mejoras Recomendadas

### 1. Agregar mejor logging en el frontend:

```typescript
const response = await fetch('/api/create-preference', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: currentUser?.id,
    userEmail: currentUser?.email,
    planId: plan.id
  })
});

console.log('🔍 Response status:', response.status);
const data = await response.json();
console.log('🔍 Response data:', data);

if (!response.ok) {
  console.error('❌ Error MP:', data);
  alert(`Error: ${data.error || 'Error desconocido'}\n${JSON.stringify(data.details || {}, null, 2)}`);
  return;
}

if (data.initPoint) {
  console.log('✅ Redirigiendo a MercadoPago:', data.initPoint);
  window.location.href = data.initPoint;
} else {
  console.error('❌ No se recibió initPoint:', data);
  alert('Error: No se pudo crear el pago. Intenta de nuevo.');
}
```

### 2. Agregar endpoint de health check:

Crear `/api/health.ts`:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  const FIREBASE_SERVICE_ACCOUNT_KEY = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  return res.status(200).json({
    status: 'ok',
    environment: {
      MP_ACCESS_TOKEN: MP_ACCESS_TOKEN ? '✅ Configurado' : '❌ NO configurado',
      FIREBASE_SERVICE_ACCOUNT_KEY: FIREBASE_SERVICE_ACCOUNT_KEY ? '✅ Configurado' : '❌ NO configurado',
      VITE_APP_URL: process.env.VITE_APP_URL || '(default)'
    }
  });
}
```

Luego probar: `https://tribu-impulsa.vercel.app/api/health`

---

## ✅ Checklist de Verificación

Antes de reportar como "NO funciona", verificar:

- [ ] `MP_ACCESS_TOKEN` está configurado en Vercel
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` está configurado en Vercel
- [ ] Hiciste **Redeploy** después de agregar variables
- [ ] El access token de MercadoPago es válido (no vencido)
- [ ] La aplicación de MercadoPago está en modo TEST o PRODUCTION (según lo que usas)
- [ ] El webhook está configurado en MercadoPago Dashboard
- [ ] Los logs de Vercel NO muestran errores 500
- [ ] En el navegador, la petición a `/api/create-preference` devuelve 200

---

## 🎯 Próximos Pasos

1. **Verificar variables de entorno en Vercel** (paso más importante)
2. **Agregar logging mejorado** en el frontend
3. **Crear endpoint `/api/health`** para diagnóstico rápido
4. **Probar en modo TEST** primero con tarjetas de prueba de MercadoPago
5. **Verificar webhook** en logs de Vercel cuando se haga un pago

---

**¿Necesitas ayuda?**
- [Documentación MercadoPago Checkout Pro](https://www.mercadopago.cl/developers/es/docs/checkout-pro/landing)
- [Tarjetas de prueba MercadoPago](https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/test-cards)
- Logs de Vercel: https://vercel.com/tu-proyecto/logs

