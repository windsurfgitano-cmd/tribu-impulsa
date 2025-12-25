# 🚀 Guía de Despliegue - Tribu Impulsa PWA

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial](#configuración-inicial)
3. [Variables de Entorno](#variables-de-entorno)
4. [Despliegue en Vercel](#despliegue-en-vercel)
5. [Configuración de Firebase](#configuración-de-firebase)
6. [Configuración de Dominios](#configuración-de-dominios)
7. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
8. [Rollback y Recuperación](#rollback-y-recuperación)

---

## 1. Requisitos Previos

### Software Necesario

```bash
# Node.js (v18 o superior)
node --version  # Debe ser >= 18.0.0

# npm (v9 o superior)
npm --version   # Debe ser >= 9.0.0

# Git
git --version

# Firebase CLI (opcional, para testing local)
npm install -g firebase-tools
```

### Cuentas Requeridas

- ✅ Cuenta de GitHub (para repositorio)
- ✅ Cuenta de Vercel (para hosting)
- ✅ Cuenta de Firebase (para backend)
- ✅ Cuenta de Stripe/MercadoPago (para pagos)
- ✅ Cuenta de Azure (opcional, para IA)

---

## 2. Configuración Inicial

### Paso 1: Clonar el Repositorio

```bash
# Clonar el proyecto
git clone https://github.com/tu-usuario/tribu-impulsa.git
cd tribu-impulsa

# Instalar dependencias
npm install

# Verificar que no hay errores
npm run build
```

### Paso 2: Estructura de Archivos

```
TribuImpulsa/
├── .env                  ← Crear este archivo (NO subir a Git)
├── .env.example          ← Plantilla de ejemplo
├── .gitignore            ← Asegurar que incluye .env
├── package.json
├── vite.config.ts
├── vercel.json           ← Configuración de Vercel
├── firebase.json         ← Configuración de Firebase
└── src/
    └── ... código fuente
```

---

## 3. Variables de Entorno

### Paso 1: Crear archivo `.env`

```bash
# En la raíz del proyecto
cp .env.example .env
```

### Paso 2: Llenar variables

```env
# ==================================================
# FIREBASE CONFIGURATION
# ==================================================
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=tribu-impulsa.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tribu-impulsa
VITE_FIREBASE_STORAGE_BUCKET=tribu-impulsa.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_VAPID_KEY=BXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# ==================================================
# AZURE OPENAI (Opcional - para matching IA)
# ==================================================
VITE_AZURE_OPENAI_ENDPOINT=https://tu-endpoint.openai.azure.com/
VITE_AZURE_OPENAI_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ==================================================
# MERCADOPAGO (Para pagos en Chile)
# ==================================================
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx-xxxxx-xxxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx-xxxxx-xxxxx

# ==================================================
# STRIPE (Alternativa para pagos)
# ==================================================
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx

# ==================================================
# ANALYTICS
# ==================================================
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FB_PIXEL_ID=123456789012345

# ==================================================
# VERCEL (Automático en deploy)
# ==================================================
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxx
VERCEL_ORG_ID=team_xxxxxxxxxxxxx
```

### Paso 3: Verificar configuración

```bash
# Probar en desarrollo
npm run dev

# Abrir http://localhost:3001
# Verificar consola del navegador (F12)
# Debe mostrar: "✅ Firebase inicializado"
```

---

## 4. Despliegue en Vercel

### Opción A: Deploy desde GitHub (Recomendado)

#### Paso 1: Push a GitHub

```bash
# Asegurar que .gitignore está correcto
cat .gitignore | grep ".env"  # Debe aparecer

# Commit inicial
git add .
git commit -m "feat: Setup inicial para producción"
git push origin main
```

#### Paso 2: Conectar con Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Selecciona tu repositorio `tribu-impulsa`
4. Click "Import"

#### Paso 3: Configurar el proyecto

```
Project Name: tribu-impulsa
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### Paso 4: Agregar Variables de Entorno

1. En Vercel Dashboard → Settings → Environment Variables
2. Copiar TODAS las variables del archivo `.env` local
3. ⚠️ **IMPORTANTE:** Seleccionar todos los entornos (Production, Preview, Development)
4. Click "Save"

#### Paso 5: Deploy

```
1. Click "Deploy"
2. Esperar build (~2-3 minutos)
3. Ver logs en tiempo real
4. ✅ Deploy exitoso → URL generada
```

### Opción B: Deploy desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# O directo a producción
vercel --prod

# Ver logs
vercel logs
```

---

## 5. Configuración de Firebase

### Paso 1: Crear Proyecto en Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Agregar proyecto"
3. Nombre: `tribu-impulsa`
4. Desactiva Google Analytics (opcional)
5. Click "Crear proyecto"

### Paso 2: Registrar App Web

1. En el dashboard, click icono `</>` (Web)
2. Nombre: `Tribu Impulsa PWA`
3. ✅ Marca "Configurar Firebase Hosting"
4. Click "Registrar app"
5. **Copiar configuración** → usar en `.env`

### Paso 3: Habilitar Servicios

#### Authentication

```
1. Panel izquierdo → Authentication → Get Started
2. Sign-in method → Email/Password → Enable
3. Authorized domains → Agregar:
   - localhost (para desarrollo)
   - tu-dominio.vercel.app
   - www.tribuimpulsa.cl
```

#### Firestore Database

```
1. Panel izquierdo → Firestore Database → Create database
2. Start in production mode
3. Location: southamerica-east1 (São Paulo)
4. Click "Enable"
```

#### Cloud Messaging (Notificaciones Push)

```
1. Configuración proyecto (engranaje) → Cloud Messaging
2. Web Push certificates → Generate key pair
3. Copiar VAPID key → usar como VITE_FIREBASE_VAPID_KEY
```

### Paso 4: Configurar Reglas de Seguridad

#### Firestore Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios: solo lectura para autenticados
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Notificaciones: solo el dueño
    match /notifications/{notifId} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
    }
    
    // Sistema: solo lectura
    match /system_stats/{docId} {
      allow read: if true;
      allow write: if false; // Solo Cloud Functions
    }
    
    // Tribe assignments: lectura autenticados
    match /tribe_assignments/{assignmentId} {
      allow read: if request.auth != null;
      allow write: if false; // Solo Cloud Functions
    }
  }
}
```

#### Desplegar reglas:

```bash
# Desde la raíz del proyecto
firebase deploy --only firestore:rules
```

---

## 6. Configuración de Dominios

### Paso 1: Comprar Dominio

```
Opciones recomendadas:
- Namecheap.com
- GoDaddy
- NIC Chile (.cl domains)

Dominio sugerido: www.tribuimpulsa.cl
```

### Paso 2: Conectar con Vercel

#### En Vercel:

```
1. Dashboard → tu proyecto → Settings → Domains
2. Click "Add Domain"
3. Ingresar: tribuimpulsa.cl
4. Click "Add"
5. Vercel mostrará registros DNS a configurar
```

#### Registros DNS requeridos:

```
Tipo: A
Nombre: @
Valor: 76.76.21.21

Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
```

#### En tu proveedor de dominios:

```
1. Panel de control → DNS Management
2. Agregar registros A y CNAME
3. Guardar cambios
4. Esperar propagación (24-48 horas)
```

### Paso 3: Configurar HTTPS

```
Vercel configura SSL automáticamente con Let's Encrypt
- Esperar ~10 minutos después de configurar DNS
- Verificar en: https://www.tribuimpulsa.cl
- Debe mostrar 🔒 candado verde
```

---

## 7. Monitoreo y Mantenimiento

### Herramientas de Monitoreo

#### Vercel Analytics

```
1. Dashboard → Analytics
2. Ver:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics
```

#### Firebase Console

```
1. Authentication → Users
   - Total users
   - Sign-in methods
   - Activity

2. Firestore → Data
   - Ver colecciones
   - Queries en tiempo real
   
3. Performance Monitoring (opcional)
   - Instalar SDK de Performance
   - Ver métricas de carga
```

#### Logs en tiempo real

```bash
# Ver logs de Vercel
vercel logs --follow

# Ver logs de Firebase Functions (si aplica)
firebase functions:log
```

### Health Checks

#### Endpoint de salud

```typescript
// api/health.ts
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  })
}
```

#### Verificar:

```bash
curl https://www.tribuimpulsa.cl/api/health
# Debe retornar: {"status":"ok","timestamp":"...","version":"..."}
```

### Alertas

```javascript
// Configurar en Firebase Console
// Monitoring → Alerting

Alertas recomendadas:
- CPU > 80%
- Errores > 100/hora
- Database writes > 10000/día
- Auth failures > 50/hora
```

---

## 8. Rollback y Recuperación

### Rollback en Vercel

```bash
# Ver deployments
vercel ls

# Rollback a deployment anterior
vercel rollback [deployment-url]

# O desde dashboard web:
# Deployments → ... (3 puntos) → Promote to Production
```

### Backup de Firestore

```bash
# Backup manual
gcloud firestore export gs://tu-bucket/backups/$(date +%Y%m%d)

# Restaurar
gcloud firestore import gs://tu-bucket/backups/20241225
```

### Plan de Recuperación de Desastres

```markdown
## Escenario 1: App caída

1. Verificar Vercel status (status.vercel.com)
2. Revisar logs: vercel logs
3. Rollback si es necesario
4. Notificar usuarios en redes sociales

## Escenario 2: Firebase caído

1. Verificar Firebase status (status.firebase.google.com)
2. App seguirá funcionando con localStorage (offline-first)
3. Datos se sincronizarán automáticamente al recuperarse

## Escenario 3: Pérdida de datos

1. Restaurar desde backup más reciente
2. Revisar Firestore audit logs
3. Notificar usuarios afectados
4. Investigar causa raíz

## Escenario 4: Credenciales comprometidas

1. Revocar credenciales inmediatamente en Firebase Console
2. Generar nuevas credenciales
3. Actualizar variables en Vercel
4. Re-deployar app
5. Investigar logs de acceso
```

---

## 9. Checklist de Despliegue

```markdown
### Pre-Deploy

- [ ] Código revisado y testeado
- [ ] Tests pasando (npm run test)
- [ ] Linter sin errores (npm run lint)
- [ ] Build exitoso (npm run build)
- [ ] Variables de entorno configuradas
- [ ] Firebase reglas actualizadas
- [ ] .gitignore correcto (no sube .env)

### Deploy

- [ ] Push a GitHub
- [ ] Vercel build exitoso
- [ ] URL de preview funciona
- [ ] Merge a main
- [ ] Deploy a producción exitoso
- [ ] SSL configurado
- [ ] Dominio funciona

### Post-Deploy

- [ ] Verificar login funciona
- [ ] Verificar registro funciona
- [ ] Verificar notificaciones push
- [ ] Verificar Firebase sync
- [ ] Probar en móvil (iOS + Android)
- [ ] Verificar analytics funcionando
- [ ] Documentar cambios en CHANGELOG
- [ ] Notificar al equipo

### Monitoreo (primeras 24h)

- [ ] Revisar logs cada 2 horas
- [ ] Monitorear errores en Sentry/Firebase
- [ ] Verificar métricas de performance
- [ ] Responder feedback de usuarios
```

---

## 10. Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Servidor local
npm run build                  # Build producción
npm run preview               # Preview del build

# Testing
npm run test                   # Correr tests
npm run test:watch            # Tests en watch mode
npm run test:coverage         # Coverage report

# Linting
npm run lint                   # Revisar código
npm run lint:fix              # Auto-fix errores

# Vercel
vercel                        # Deploy preview
vercel --prod                 # Deploy producción
vercel logs                   # Ver logs
vercel env ls                 # Listar env vars
vercel env add [NAME]         # Agregar env var
vercel domains                # Ver dominios

# Firebase
firebase login                # Login
firebase deploy               # Deploy reglas/functions
firebase serve                # Emulador local
firebase functions:log        # Ver logs

# Git
git status                    # Ver cambios
git log --oneline             # Historial
git diff                      # Ver diferencias
git stash                     # Guardar cambios temporalmente
```

---

## 11. Troubleshooting Común

### Error: "Failed to fetch"

```javascript
// Causa: CORS o Firebase no configurado
// Solución:
1. Verificar variables de entorno en Vercel
2. Agregar dominio a Firebase Authorized domains
3. Verificar reglas de Firestore
```

### Error: "Service Worker registration failed"

```javascript
// Causa: HTTPS requerido para SW
// Solución:
1. Verificar SSL está configurado
2. Limpiar cache del navegador
3. Hard reload (Ctrl+Shift+R)
```

### Error: "Module not found"

```bash
# Causa: Dependencia faltante
# Solución:
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Build exitoso pero app no funciona

```bash
# Verificar variables de entorno
vercel env ls

# Comparar con .env local
diff <(cat .env | sort) <(vercel env pull .env.vercel && cat .env.vercel | sort)

# Re-deploy forzando
vercel --prod --force
```

---

## 12. Contactos de Soporte

```
Firebase Support: 
https://firebase.google.com/support

Vercel Support:
https://vercel.com/support

GitHub Issues:
https://github.com/tu-usuario/tribu-impulsa/issues

Documentación:
- Firebase: https://firebase.google.com/docs
- Vercel: https://vercel.com/docs
- React: https://react.dev
- Vite: https://vitejs.dev
```

---

**Documento creado:** Diciembre 2024  
**Versión:** v0.9.1  
**Autor:** DevOps Team Tribu Impulsa  
**Última actualización:** 25 Dic 2024

