# 🚀 Guía Rápida: Actualizar Credenciales en Vercel

## ⚠️ URGENTE: Credenciales Comprometidas

Las credenciales de Firebase estuvieron en el historial de Git. Aunque ya están protegidas, **DEBES regenerarlas**.

---

## 🔥 PASO 1: Regenerar Firebase Admin SDK

### 1.1 Ir a Firebase Console

```
https://console.firebase.google.com/u/0/project/tribu-impulsa/settings/serviceaccounts/adminsdk
```

### 1.2 Generar Nueva Clave

1. Click en **"Generar nueva clave privada"**
2. Descargar el archivo JSON
3. Guardar en: `C:\Users\Ozymandias\Documents\TribuImpulsa\INTERNO\credenciales\`
4. Renombrar a: `firebase-admin-key-NEW-2025-12-25.json`

### 1.3 Revocar Clave Anterior

1. En la misma página, buscar claves existentes
2. Click en **"..."** (3 puntos) de la clave vieja
3. Click **"Eliminar"**
4. Confirmar eliminación

---

## 🔑 PASO 2: Regenerar API Keys de Firebase

### 2.1 Ir a Configuración General

```
https://console.firebase.google.com/u/0/project/tribu-impulsa/settings/general
```

### 2.2 Regenerar Claves (Si es posible)

Firebase Web API Keys **NO se pueden regenerar** directamente, pero puedes:

**Opción A: Restricciones de API Key**
1. Ir a Google Cloud Console → API & Services → Credentials
2. Buscar la API Key de Firebase
3. Agregar **restricciones de dominio**:
   - `www.tribuimpulsa.cl`
   - `tribuimpulsa.vercel.app`
   - `localhost` (solo para desarrollo)

**Opción B: Nuevo Proyecto Firebase (Extremo)**
- Solo si la filtración fue muy grave
- Requiere migrar toda la data

---

## ☁️ PASO 3: Actualizar Variables en Vercel

### 3.1 Ir al Dashboard de Vercel

```
https://vercel.com/windsurfgitano-cmds-projects/tribu-impulsa/settings/environment-variables
```

O navegar manualmente:
1. https://vercel.com/dashboard
2. Seleccionar proyecto: **tribu-impulsa**
3. Click **"Settings"** (⚙️)
4. Click **"Environment Variables"**

### 3.2 Variables a Actualizar

Debes actualizar TODAS estas variables:

#### Variables de Firebase

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=tribu-impulsa.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tribu-impulsa
VITE_FIREBASE_STORAGE_BUCKET=tribu-impulsa.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=
```

#### Variables de Admin SDK (Backend)

```env
FIREBASE_ADMIN_SDK_JSON=
```

**⚠️ IMPORTANTE:** El archivo JSON completo debe ir en una sola línea:

```bash
# Convertir JSON a una línea (desde PowerShell):
Get-Content INTERNO\credenciales\firebase-admin-key-NEW-2025-12-25.json | ConvertTo-Json -Compress
```

### 3.3 Actualizar Cada Variable

Para cada variable:

1. **Buscar la variable** en la lista
2. Click en **"..."** (3 puntos) → **"Edit"**
3. Pegar el **nuevo valor**
4. Seleccionar entornos:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
5. Click **"Save"**

### 3.4 Verificar MercadoPago (Si aplica)

Si usas MercadoPago:

```env
VITE_MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_ACCESS_TOKEN=
```

1. Ir a: https://www.mercadopago.cl/developers/panel/app
2. Regenerar credenciales de producción
3. Actualizar en Vercel

---

## 🔄 PASO 4: Re-Deploy la Aplicación

### 4.1 Forzar Nuevo Deploy

**Opción A: Desde Dashboard Web**

1. Ir a: https://vercel.com/windsurfgitano-cmds-projects/tribu-impulsa
2. Pestaña **"Deployments"**
3. Click en el último deployment
4. Click **"..."** (3 puntos) → **"Redeploy"**
5. ✅ Marcar **"Use existing build cache"** → **Desmarcarlo**
6. Click **"Redeploy"**

**Opción B: Desde Git (Recomendado)**

```powershell
# Commit vacío para forzar deploy
git commit --allow-empty -m "chore: Force redeploy con nuevas credenciales"
git push origin main
```

### 4.2 Monitorear el Deploy

```
https://vercel.com/windsurfgitano-cmds-projects/tribu-impulsa/deployments
```

Esperar a que muestre:
- ✅ **"Ready"** (verde)
- Tiempo: ~2-3 minutos

---

## ✅ PASO 5: Verificar que Funciona

### 5.1 Abrir la App

```
https://www.tribuimpulsa.cl
```

### 5.2 Verificar Consola del Navegador (F12)

Debe mostrar:
```
✅ Firebase inicializado
✅ Firestore inicializado
```

### 5.3 Probar Login

1. Intentar registrarse o loguearse
2. Verificar que NO hay errores de Firebase
3. Verificar que los datos se guardan en Firestore

---

## 🚨 Si Algo Falla

### Error: "Firebase: Error (auth/invalid-api-key)"

**Causa:** API Key incorrecta o no actualizada

**Solución:**
1. Verificar que la variable `VITE_FIREBASE_API_KEY` en Vercel es correcta
2. Copiarla de Firebase Console → Settings → General → Web API Key
3. Re-deployar

### Error: "Firebase Admin SDK not initialized"

**Causa:** JSON del Admin SDK mal formateado

**Solución:**
```powershell
# Comprimir JSON correctamente:
$json = Get-Content INTERNO\credenciales\firebase-admin-key-NEW-2025-12-25.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress -Depth 100
Set-Clipboard -Value $json
Write-Host "JSON copiado al portapapeles. Pegalo en Vercel."
```

### Error: "Too many requests"

**Causa:** Firebase está bloqueando por exceso de uso

**Solución:**
1. Esperar 1 hora
2. Implementar rate limiting en el código

---

## 📋 Checklist Final

```
[ ] Nueva clave Admin SDK descargada
[ ] Clave antigua revocada en Firebase
[ ] Restricciones de API Key configuradas
[ ] Variables actualizadas en Vercel (todas)
[ ] Re-deploy forzado
[ ] App funciona correctamente
[ ] Login funciona
[ ] Datos se guardan en Firestore
[ ] No hay errores en consola
```

---

## 🔐 Seguridad Post-Actualización

### Rotar Credenciales Regularmente

```
Frecuencia recomendada:
- Admin SDK: Cada 6 meses
- API Keys: Revisar restricciones cada 3 meses
- Passwords: Cada 3 meses
```

### Monitoreo

```
Revisar semanalmente:
- Firebase Console → Authentication → Usage
- Firebase Console → Firestore → Usage
- Vercel → Analytics
```

### Alertas

Configurar en Firebase Console:

1. **Budget Alerts** (previene gastos excesivos)
2. **Usage Alerts** (detecta uso anormal)
3. **Security Alerts** (intentos de acceso sospechosos)

---

## 📞 Soporte

**Firebase:**
- Console: https://console.firebase.google.com
- Soporte: https://firebase.google.com/support

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Soporte: https://vercel.com/support
- Docs: https://vercel.com/docs/environment-variables

---

**Creado:** 25 Diciembre 2024  
**Versión:** v0.9.1  
**Urgencia:** 🔴 CRÍTICA - Hacer HOY

