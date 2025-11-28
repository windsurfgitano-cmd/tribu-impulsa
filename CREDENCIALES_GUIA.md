# 🔐 GUÍA DE CREDENCIALES - TRIBU IMPULSA

> **IMPORTANTE:** Este archivo es una guía. Las credenciales REALES van en archivos `.env` que NO se suben a Git.

---

## 🤖 AZURE OPENAI (GPT-5.1)

```
Endpoint: [CONFIGURAR EN CONSOLA DEL NAVEGADOR]
API Key: [CONFIGURAR EN CONSOLA DEL NAVEGADOR]
Model: gpt-5.1-chat
```

**Configuración:** Abrir consola del navegador (F12) y ejecutar:
```javascript
configureAzureAI('TU_ENDPOINT', 'TU_API_KEY');
```

**Uso:** Algoritmo de matching inteligente (Fase 5)

---

## 📁 Estructura de Archivos Privados

```
Tribu Impulsa/
├── .env                    ← Credenciales de desarrollo (NO SE SUBE)
├── .env.production         ← Credenciales de producción (NO SE SUBE)
├── firebase-admin-key.json ← Clave de Firebase Admin (NO SE SUBE)
└── CREDENCIALES_GUIA.md    ← Este archivo (SÍ se sube, solo tiene instrucciones)
```

---

## 🔑 CREDENCIALES DE LA APP

### Admin Panel
```
URL: https://[tu-dominio]/admin
Email: admin@tribuimpulsa.cl
Password: admin123
```

### Usuarios de Prueba
```
Contraseña universal: TRIBU2026

Usuarios:
- dafnafinkelstein@gmail.com
- doraluz@terraflorpaisajismo.cl
- guille@elevatecreativo.com
```

---

## 🔥 FIREBASE (Notificaciones Push)

### Paso 1: Crear proyecto en Firebase
1. Ve a https://console.firebase.google.com/
2. Click "Agregar proyecto"
3. Nombre: `tribu-impulsa`
4. Desactiva Google Analytics (opcional)
5. Click "Crear proyecto"

### Paso 2: Registrar la app web
1. En el dashboard de Firebase, click en el icono `</>`  (Web)
2. Nombre de la app: `Tribu Impulsa PWA`
3. ✅ Marca "Configurar Firebase Hosting" (opcional)
4. Click "Registrar app"
5. **COPIA la configuración** que te da (la usaremos abajo)

### Paso 3: Habilitar Cloud Messaging
1. Ve a "Configuración del proyecto" (engranaje)
2. Pestaña "Cloud Messaging"
3. Genera un nuevo par de claves VAPID (Web Push certificates)
4. **COPIA la clave pública** (la necesitamos para el frontend)

### Paso 4: Crear archivo .env
Crea un archivo `.env` en la raíz del proyecto con:

```env
# Firebase Web Config
VITE_FIREBASE_API_KEY=tu-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=tribu-impulsa.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tribu-impulsa
VITE_FIREBASE_STORAGE_BUCKET=tribu-impulsa.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Cloud Messaging (VAPID Key)
VITE_FIREBASE_VAPID_KEY=tu-vapid-key-aqui
```

---

## 🌐 VERCEL (Hosting)

### Credenciales
```
Cuenta: windsurfgitano@gmail.com
Proyecto: tribu-impulsa
URL: https://tribu-impulsa.vercel.app
```

### Variables de Entorno en Vercel
1. Ve a https://vercel.com/dashboard
2. Selecciona el proyecto `tribu-impulsa`
3. Settings → Environment Variables
4. Agrega las mismas variables del `.env`

---

## 📱 GITHUB (Repositorio)

### Credenciales
```
Repositorio: https://github.com/windsurfgitano-cmd/tribu-impulsa
Usuario: windsurfgitano-cmd
```

---

## 📧 PARA TRANSFERIR A LAS FUNDADORAS

Cuando entregues el proyecto a Dafna y Doraluz:

1. **Envíales por correo seguro (no WhatsApp):**
   - El archivo `.env` completo
   - Acceso al proyecto de Firebase
   - Acceso al proyecto de Vercel
   - Acceso al repositorio de GitHub

2. **Transferir propiedad de Firebase:**
   - Firebase Console → Configuración → Usuarios y permisos
   - Agregar sus emails como "Propietario"

3. **Transferir propiedad de Vercel:**
   - Vercel Dashboard → Settings → Team
   - Invitarlas al team o transferir proyecto

4. **Transferir repositorio GitHub:**
   - Settings → Collaborators → Agregar sus usuarios
   - O transferir propiedad del repositorio

---

## 🆘 SOPORTE

Si hay problemas con las credenciales:
1. Regenerar API keys en Firebase Console
2. Actualizar variables en Vercel
3. Re-deployar la app

---

*Última actualización: 28-Nov-2025*
