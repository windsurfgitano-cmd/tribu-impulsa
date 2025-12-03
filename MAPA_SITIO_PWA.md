# 🗺️ MAPA DEL SITIO - TRIBU IMPULSA PWA

**Última actualización:** 3 Dic 2024 09:55 AM

---

## 🏆 LOGROS DE ESTA SESIÓN

| # | Logro | Impacto |
|---|-------|---------|
| 1 | **Firebase como fuente de verdad** | Usuarios ya no se sobreescriben |
| 2 | **Migración automática 108 usuarios** | 112 usuarios en Firebase |
| 3 | **WhatsApp links con teléfono real** | Tribu X envía al número correcto |
| 4 | **CRUD usuarios completo** | Crear, editar, eliminar persiste |
| 5 | **Notificaciones sync Firebase** | Llegan a todos los dispositivos |
| 6 | **Firebase Storage para fotos** | Avatar + banner con compresión |
| 7 | **Historial de pagos** | Revenue tracking en Firebase |
| 8 | **Precio membresía dinámico** | Configurable desde admin |
| 9 | **WhatsApp soporte configurable** | No más hardcoding |
| 10 | **Avatares con iniciales** | Sin dependencia de Instagram |
| 11 | **Checklist sync Firebase** | Progreso persiste entre dispositivos ✨ |
| 12 | **Config Admin sync Firebase** | Precio/WA accesible desde cualquier lado ✨ |
| 13 | **Asignaciones Tribu sync Firebase** | Los 10+10 en la nube ✨ |
| 14 | **IG Tribu Impulsa flotante** | Acceso directo al IG oficial 📱 |
| 15 | **Icono Instagram rosado gradiente** | Estilo oficial IG en perfiles 🎨 |
| 16 | **Explicaciones checklist mejoradas** | "Comparte en tu IG" / "Ellos comparten TU cuenta" 📝 |

---

## 📱 RUTAS Y PANTALLAS

```
/                    → LoginScreen          (Público)
/register            → RegisterScreen       (Público)  
/searching           → SearchingScreen      (Post-login)
/survey              → SurveyScreen         (Onboarding)
/membership          → MembershipScreen     (Pago membresía)
/dashboard           → Dashboard            (🔒 Solo miembros)
/tribe               → TribeAssignmentsView (🔒 Solo miembros)
/directory           → DirectoryView        (🔒 Solo miembros)
/profile/:id         → ProfileDetail        (🔒 Solo miembros) + Tribu X
/activity            → ActivityView         (Libre)
/my-profile          → MyProfileView        (Libre)
/admin               → AdminPanelInline     (Solo admin)
```

---

## 🔐 FLUJO DE USUARIO

```
┌─────────────────────────────────────────────────────────────┐
│  USUARIO NUEVO                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. /                   → Login (ingresa email)             │
│  2. Email no existe     → /register (crear cuenta)          │
│  3. /register           → Formulario completo               │
│  4. /searching          → Animación "buscando tribu"        │
│  5. /membership         → Pago de membresía                 │
│  6. /dashboard          → Panel principal (ya es miembro)   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  USUARIO EXISTENTE                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. /                   → Login (ingresa email)             │
│  2. Email existe        → Pide contraseña                   │
│  3. Contraseña OK       → /searching                        │
│  4. Es miembro?                                             │
│     ├── Sí → /dashboard                                     │
│     └── No → /membership                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 COMPONENTES PRINCIPALES

### Públicos (sin login)
| Componente | Ruta | Descripción |
|------------|------|-------------|
| `LoginScreen` | `/` | Login con email + contraseña |
| `RegisterScreen` | `/register` | Registro nuevo usuario |

### Post-Login
| Componente | Ruta | Descripción |
|------------|------|-------------|
| `SearchingScreen` | `/searching` | Animación de carga |
| `SurveyScreen` | `/survey` | Encuesta de categoría |
| `MembershipScreen` | `/membership` | Pago/activación |

### Miembros (protegidas)
| Componente | Ruta | Descripción |
|------------|------|-------------|
| `Dashboard` | `/dashboard` | Panel principal con checklist |
| `TribeAssignmentsView` | `/tribe` | Ver 10+10 asignaciones |
| `DirectoryView` | `/directory` | Red de emprendedores |
| `ProfileDetail` | `/profile/:id` | Perfil de otro usuario |

### Libres
| Componente | Ruta | Descripción |
|------------|------|-------------|
| `ActivityView` | `/activity` | Notificaciones |
| `MyProfileView` | `/my-profile` | Mi perfil editable |
| `AdminPanelInline` | `/admin` | Panel administrador |

---

## 🔧 SERVICIOS Y CONEXIONES

### Firebase (Firestore)
```
Colecciones:
├── users               → Perfiles de usuarios
├── memberships         → Estados de membresía
├── notifications       → Notificaciones
├── payment_history     → Historial de pagos
├── interactions        → Interacciones entre usuarios
└── reports             → Reportes de usuarios
```

### Firebase Storage
```
Carpetas:
└── profiles/
    └── {userId}/
        ├── avatar_{timestamp}.jpg
        └── cover_{timestamp}.jpg
```

### LocalStorage (caché)
```
Llaves:
├── tribu_users              → Lista de usuarios (caché)
├── tribu_notifications      → Notificaciones locales
├── tribu_admin_config       → Configuración admin
├── user_session             → Sesión actual
├── membership_status_{id}   → Estado membresía
├── tribe_assignments        → Asignaciones de tribu
└── tribu_migration_complete → Flag de migración
```

---

## 🧪 MATRIZ DE TESTS

### 1. AUTENTICACIÓN
| Test | Pasos | Resultado Esperado |
|------|-------|-------------------|
| Login existente | Email + pass correcta | Redirige a /dashboard |
| Login incorrecto | Email + pass incorrecta | Muestra error |
| Registro nuevo | Llenar formulario | Crea usuario en Firebase |
| Cambio contraseña | Mi perfil → Cambiar | Actualiza en Firebase |

### 2. PERFIL
| Test | Pasos | Resultado Esperado |
|------|-------|-------------------|
| Editar nombre | Mi perfil → Editar → Guardar | Persiste en Firebase |
| Subir foto | Mi perfil → Click avatar | Sube a Storage |
| Subir banner | Mi perfil → Cambiar banner | Sube a Storage |
| Ver otro perfil | Directorio → Click perfil | Muestra datos |

### 3. MEMBRESÍA
| Test | Pasos | Resultado Esperado |
|------|-------|-------------------|
| Otorgar membresía | Admin → Usuario → Miembro | Cambia estado |
| Revocar membresía | Admin → Usuario → Invitado | Bloquea acceso |
| Verificar bloqueo | Invitado → /dashboard | Redirige a /membership |

### 4. NOTIFICACIONES
| Test | Pasos | Resultado Esperado |
|------|-------|-------------------|
| Enviar recordatorio | Admin → Recordar | Usuario ve notif |
| Marcar leída | Click en notificación | Desaparece badge |
| Sync Firebase | Login otro dispositivo | Ve mismas notifs |

### 5. DIRECTORIO
| Test | Pasos | Resultado Esperado |
|------|-------|-------------------|
| Ver todos | /directory | Lista usuarios activos |
| Buscar | Escribir en búsqueda | Filtra resultados |
| WhatsApp | Click botón WA | Abre wa.me/{phone} |

### 6. TRIBU
| Test | Pasos | Resultado Esperado |
|------|-------|-------------------|
| Ver asignaciones | /tribe | 10 promover + 10 seguir |
| Marcar completado | Checkbox | Actualiza progreso |

### 7. ADMIN
| Test | Pasos | Resultado Esperado |
|------|-------|-------------------|
| Ver estadísticas | /admin | Muestra métricas |
| Cambiar precio | Config → Precio | Actualiza en config |
| Dar de baja | Usuario → Eliminar | Elimina de Firebase |

---

## 📊 FLUJO DE DATOS

```
┌──────────────────────────────────────────────────────────────────┐
│                        FIREBASE (Fuente de verdad)               │
│  ┌─────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  users  │  │ memberships │  │notifications│  │   storage   │  │
│  └────┬────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
│       │              │                │                │         │
└───────┼──────────────┼────────────────┼────────────────┼─────────┘
        │              │                │                │
        ▼              ▼                ▼                ▼
┌───────────────────────────────────────────────────────────────────┐
│                      APP (React)                                  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    LocalStorage (caché)                     │  │
│  │   tribu_users │ membership_status_* │ tribu_notifications   │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Componentes React                        │  │
│  │   Dashboard │ DirectoryView │ MyProfileView │ AdminPanel    │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

---

## ✅ ESTADO ACTUAL

| Módulo | Estado | Notas |
|--------|--------|-------|
| Autenticación | ✅ OK | Email + pass |
| Registro | ✅ OK | Guarda en Firebase |
| Membresías | ✅ OK | Sync bidireccional |
| Notificaciones | ✅ OK | Sync Firebase |
| Fotos/Banners | ✅ OK | Firebase Storage |
| Directorio | ✅ OK | Carga desde Firebase |
| Admin | ✅ OK | CRUD usuarios |
| Tribu X (IA) | ✅ OK | Azure GPT en producción |
| WhatsApp | ✅ OK | Usa phone del perfil |
| Tribu Asignaciones | ✅ OK | Algoritmo local |
| Checklist | ✅ OK | **Firebase sync bidireccional** |

---

## 🔬 BIOPSIA COMPLETA - CONEXIONES

### 📁 ARQUITECTURA DE ARCHIVOS

```
tribu-impulsa/
├── App.tsx                    # Componente principal (6363 líneas)
│   ├── LoginScreen            # Líneas 440-680
│   ├── RegisterScreen         # Líneas 680-900
│   ├── Dashboard              # Líneas 1200-1800
│   ├── TribeAssignmentsView   # Líneas 2100-2500
│   ├── DirectoryView          # Líneas 4350-4600
│   ├── ProfileDetail          # Líneas 3840-4100
│   ├── MyProfileView          # Líneas 2550-3100
│   ├── MatchAnalysisSection   # Líneas 3615-3840 (Tribu X)
│   └── AdminPanelInline       # Líneas 5400-6200
│
├── services/
│   ├── firebaseService.ts     # Firebase init + Storage upload
│   ├── databaseService.ts     # CRUD localStorage + notificaciones
│   ├── realUsersData.ts       # 108 usuarios + migración Firebase
│   ├── matchService.ts        # Matching + userToMatchProfile
│   ├── membershipService.ts   # Gestión membresías
│   ├── aiMatchingService.ts   # Azure OpenAI GPT-5.1
│   ├── tribeAlgorithm.ts      # Asignación 10+10
│   └── dataPersistence.ts     # Auto-backup + integridad
│
├── types.ts                   # Interfaces TypeScript
├── .env.local                 # Variables locales (dev)
└── .env.example               # Template variables
```

---

### 🔗 MAPA DE CONEXIONES POR SERVICIO

#### 1. `firebaseService.ts` → NÚCLEO
```
firebaseService.ts
    ├── initializeFirebase()      → App.tsx (línea 69)
    ├── getFirestoreInstance()    → realUsersData.ts, databaseService.ts
    ├── uploadProfileImage()      → App.tsx (MyProfileView)
    ├── compressImage()           → Interno
    └── Firebase Config           → tribu-impulsa.firebasestorage.app
        
Conecta con:
    → Firebase Firestore (users, memberships, notifications)
    → Firebase Storage (profiles/{userId}/)
    → Firebase Cloud Messaging (notificaciones push)
```

#### 2. `realUsersData.ts` → USUARIOS
```
realUsersData.ts
    ├── REAL_USERS[108]           → Datos base hardcodeados (fallback)
    ├── forceReloadRealUsers()    → App.tsx (línea 78)
    │   └── loadUsersFromFirebase()
    │   └── migrateUsersToFirebase()
    ├── registerNewUser()         → RegisterScreen
    ├── validateCredentials()     → LoginScreen
    ├── changeUserPassword()      → MyProfileView
    ├── deleteUser()              → AdminPanelInline
    ├── updateUserInFirebase()    → MyProfileView
    └── syncUsersFromFirebase()   → Al cargar app

Conecta con:
    → Firebase Firestore (colección 'users')
    → localStorage ('tribu_users')
    → databaseService.ts (getAllUsers)
```

#### 3. `databaseService.ts` → CRUD LOCAL
```
databaseService.ts
    ├── getAllUsers()             → matchService.ts, DirectoryView
    ├── getUserById()             → ProfileDetail
    ├── updateUser()              → MyProfileView
    ├── createNotification()      → Notificaciones + Firebase sync
    ├── syncNotificationsFromFirebase() → App.tsx (login)
    ├── getMembershipStatus()     → MembershipScreen
    └── getAllReports()           → AdminPanelInline

Conecta con:
    → localStorage (tribu_users, tribu_notifications)
    → Firebase Firestore (notifications)
```

#### 4. `matchService.ts` → MATCHING
```
matchService.ts
    ├── userToMatchProfile()      → Convierte UserProfile → MatchProfile
    │   └── Incluye: phone, email, whatsapp ← ARREGLADO HOY
    ├── generateTribeAssignments()→ TribeAssignmentsView
    ├── getProfileById()          → ProfileDetail
    ├── getMyProfile()            → MatchAnalysisSection
    └── getRealUserProfiles()     → DirectoryView

Conecta con:
    → databaseService.ts (getAllUsers)
    → types.ts (MatchProfile interface)
    → App.tsx (múltiples componentes)
```

#### 5. `aiMatchingService.ts` → TRIBU X (IA)
```
aiMatchingService.ts
    ├── getAzureConfig()          → Lee VITE_AZURE_OPENAI_*
    ├── isAzureConfigured()       → Verifica si hay API key
    ├── analyzeCompatibility()    → MatchAnalysisSection
    │   └── Si Azure OK → GPT-5.1 análisis
    │   └── Si no → Fallback local inteligente
    └── generateMatchInsight()    → Prompt engineering

Conecta con:
    → Azure OpenAI (GPT-5.1-chat) en PRODUCCIÓN
    → Variables Vercel (VITE_AZURE_OPENAI_ENDPOINT/KEY)
    → App.tsx líneas 3706-3740
```

#### 6. `membershipService.ts` → MEMBRESÍAS
```
membershipService.ts
    ├── getMembershipPrice()      → Dinámico desde admin config
    ├── checkMembershipStatus()   → MemberRoute (protección)
    ├── saveMembershipPayment()   → MembershipScreen
    └── getMembershipStatus()     → Dashboard, AdminPanel

Conecta con:
    → localStorage (membership_status_{id})
    → Firebase Firestore (memberships, payment_history)
    → tribu_admin_config (precio dinámico)
```

---

### 📞 FLUJO WHATSAPP (ARREGLADO)

```
Antes (roto):
ProfileDetail → MatchAnalysisSection → getWhatsAppUrl()
    └── profileData.phone = undefined ❌
    └── wa.me/?text=... (sin número)

Ahora (arreglado):
ProfileDetail → MatchAnalysisSection → getWhatsAppUrl()
    └── matchService.ts → userToMatchProfile()
        └── phone: user.phone || user.whatsapp ✅
    └── wa.me/56912345678?text=... (con número)
```

---

### 🔐 FLUJO AUTENTICACIÓN

```
Usuario ingresa email
    │
    ▼
LoginScreen → validateCredentials()
    │         (realUsersData.ts)
    │
    ├── Email no existe → /register
    │   └── registerNewUser() → Firebase + localStorage
    │
    └── Email existe → Pide password
        │
        ├── Password OK → completeLogin()
        │   ├── setCurrentUser() (localStorage)
        │   ├── syncNotificationsFromFirebase()
        │   └── Redirige según membresía:
        │       ├── Es miembro → /dashboard
        │       └── No miembro → /membership
        │
        └── Password MAL → "Credenciales incorrectas"
```

---

### 📸 FLUJO UPLOAD IMÁGENES

```
MyProfileView → Click avatar/banner
    │
    ▼
handlePhotoUpload() / handleBannerUpload()
    │
    ├── Validar: < 2MB, tipo imagen
    │
    ├── Comprimir: max 500x500, 80% JPEG
    │   └── compressImage() (firebaseService.ts)
    │
    ├── Subir a Firebase Storage
    │   └── profiles/{userId}/avatar_{timestamp}.jpg
    │
    ├── Obtener URL pública
    │
    └── Actualizar perfil:
        ├── localStorage (tribu_users)
        └── Firebase Firestore (users/{userId})
```

---

### 🔔 FLUJO NOTIFICACIONES

```
Admin envía recordatorio
    │
    ▼
createNotification() (databaseService.ts)
    │
    ├── Guarda en localStorage (tribu_notifications)
    │
    └── Guarda en Firebase Firestore (notifications)
        
Usuario abre app en otro dispositivo
    │
    ▼
completeLogin() → syncNotificationsFromFirebase()
    │
    └── Merge notificaciones Firebase + localStorage
        │
        └── Usuario ve TODAS sus notificaciones
```

---

### 💳 FLUJO MEMBRESÍA

```
/membership → MembershipScreen
    │
    ├── getMembershipPrice() → Desde tribu_admin_config
    │   └── Default: $20.000 CLP
    │
    ├── Click "Pagar" → Genera código único
    │
    └── Admin aprueba → handleMembershipChange()
        │
        ├── Actualiza localStorage (membership_status_{id})
        ├── Actualiza Firebase (memberships)
        └── Registra en payment_history (revenue tracking)
```

---

### 🌐 VARIABLES DE ENTORNO

| Variable | Local | Producción (Vercel) |
|----------|-------|---------------------|
| `VITE_AZURE_OPENAI_ENDPOINT` | ❌ No | ✅ Configurado |
| `VITE_AZURE_OPENAI_KEY` | ❌ No | ✅ Configurado |
| Firebase Config | Hardcoded | Hardcoded |

**Nota:** Azure solo funciona en producción. En localhost usa fallback local.

---

### 📊 MÉTRICAS FIREBASE

```
Firestore:
├── users: 112 documentos
├── memberships: ~50 documentos
├── notifications: ~200 documentos
└── payment_history: ~30 documentos

Storage:
└── profiles/: ~20 archivos (avatars + banners)
```

---

## 📂 INVENTARIO COMPLETO DE ARCHIVOS

### 🎯 ARCHIVOS PRINCIPALES

| Archivo | Tamaño | Función |
|---------|--------|---------|
| `App.tsx` | 289 KB | Componente principal (6363 líneas) |
| `index.html` | 3 KB | HTML base con meta PWA |
| `index.css` | 11 KB | Estilos globales Tailwind |
| `types.ts` | 2.8 KB | Interfaces TypeScript |
| `vite.config.ts` | 580 B | Configuración Vite |
| `vercel.json` | 536 B | Configuración deploy |
| `firestore.rules` | 1.2 KB | Reglas seguridad Firebase |

---

### 🔧 SERVICIOS (13 archivos)

| Servicio | Tamaño | Función Principal |
|----------|--------|-------------------|
| `realUsersData.ts` | 96 KB | 108 usuarios + migración Firebase |
| `firestoreService.ts` | 24 KB | CRUD Firestore completo |
| `databaseService.ts` | 22 KB | CRUD localStorage + sync |
| `firebaseService.ts` | 17 KB | Init Firebase + Storage upload |
| `matchService.ts` | 17 KB | Matching + userToMatchProfile |
| `productionInit.ts` | 16 KB | Inicialización producción |
| `seedFirestore.ts` | 14 KB | Seed inicial (legacy) |
| `aiMatchingService.ts` | 13 KB | Azure OpenAI GPT-5.1 |
| `membershipService.ts` | 10 KB | Gestión membresías |
| `seedData.ts` | 9.9 KB | Datos seed (legacy) |
| `tribeAlgorithm.ts` | 9.5 KB | Algoritmo 10+10 |
| `cloudBridge.ts` | 9 KB | Puente local/cloud |
| `dataPersistence.ts` | 7 KB | Backup + integridad |

---

### 🎨 COMPONENTES (6 archivos)

| Componente | Tamaño | Uso |
|------------|--------|-----|
| `TribalLoadingAnimation.tsx` | 11.6 KB | Animación carga tribu |
| `TribalAnimation.tsx` | 9.5 KB | Animaciones generales |
| `PaywallScreen.tsx` | 8.6 KB | Pantalla pago membresía |
| `CosmicLoadingAnimation.tsx` | 3.5 KB | Animación cósmica |
| `WhatsAppFloat.tsx` | 1.2 KB | Botón flotante WA |
| `GlassCard.tsx` | 766 B | Card con efecto glass |

---

### 📱 PWA ASSETS

```
public/
├── manifest.json          → Configuración PWA
├── sw.js                  → Service Worker (cache)
├── firebase-messaging-sw.js → Push notifications
├── favicon.png            → Favicon
├── tribulogo.png          → Logo (442 KB)
├── tribuvideo.mp4         → Video intro (1.4 MB)
└── icons/
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-192.png
    ├── icon-384.png
    └── icon-512.png
```

---

### 📚 DOCUMENTACIÓN (15 archivos)

| Documento | Propósito |
|-----------|-----------|
| `MADRE.md` | Documento maestro del proyecto |
| `MAPA_SITIO_PWA.md` | Este archivo - mapa completo |
| `MAPA_CONEXIONES.md` | Diagrama conexiones |
| `MAPA_FUNCIONAL.md` | Funcionalidades detalladas |
| `ANALISIS_HARDCODING.md` | Análisis datos hardcodeados |
| `CHECKLIST_ENTREGA_V1.md` | Checklist entrega |
| `CHECKLIST_PRODUCCION.md` | Checklist producción |
| `CREDENCIALES_GUIA.md` | Guía credenciales |
| `PROBLEMAS_IDENTIFICADOS.md` | Bugs conocidos |
| `PRUEBAS_LOG.md` | Log de pruebas |
| `USO.md` | Manual de uso |
| `plan.md` | Plan de desarrollo |
| `Planymejoras.md` | Mejoras futuras |
| `elevatorpitch.md` | Pitch comercial |
| `whoiam.md` | Identidad marca |

---

## 🔌 CONFIGURACIÓN PWA

### manifest.json
```json
{
  "name": "Tribu Impulsa",
  "short_name": "Tribu",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#F5F7FB",
  "theme_color": "#00CA72",
  "categories": ["business", "social"],
  "lang": "es-CL"
}
```

### Service Worker (sw.js)
```
Funciones:
├── Cache de assets estáticos
├── Offline fallback
├── Background sync (pendiente)
└── Cache de API responses
```

### Firebase Messaging SW
```
Funciones:
├── Recibir push notifications
├── Mostrar notificación nativa
└── Manejo de clicks en notif
```

---

## 🗄️ ESTRUCTURA LOCALSTORAGE COMPLETA

| Key | Tipo | Descripción |
|-----|------|-------------|
| `tribu_users` | Array | Cache usuarios (112+) |
| `tribu_notifications` | Array | Notificaciones locales |
| `tribu_interactions` | Array | Interacciones usuario |
| `tribu_reports` | Array | Reportes enviados |
| `tribu_assignments` | Object | Asignaciones tribu |
| `tribu_assignments_updated` | String | Timestamp última actualización |
| `tribu_checklists` | Object | Estado checklists |
| `tribu_onboarding` | Object | Estado onboarding |
| `tribu_admin_config` | Object | Config admin (precio, WA) |
| `tribu_current_user` | String | ID usuario logueado |
| `tribu_migration_complete` | Boolean | Flag migración Firebase |
| `user_session` | Object | Datos sesión |
| `tribe_survey_complete` | Boolean | Encuesta completada |
| `membership_status_{id}` | Object | Estado membresía |
| `membership_payment_{id}` | Object | Datos pago |
| `tribeReportsLog` | Array | Log reportes (legacy) |
| `tribe_session` | Object | Sesión legacy |

---

## 🔒 FIRESTORE RULES

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Perfiles - lectura pública
    match /profiles/{profileId} {
      allow read: if true;
      allow write: if true; // Producción: auth != null
    }
    
    // Progreso checklist - solo usuario
    match /progress/{userId} {
      allow read, write: if true; // Producción: auth.uid == userId
    }
    
    // Interacciones - lectura pública
    match /interactions/{interactionId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Config - solo lectura
    match /config/{configId} {
      allow read: if true;
      allow write: if false; // Solo admin
    }
  }
}
```

---

## 🎯 ALGORITMO TRIBU (tribeAlgorithm.ts)

### Grupos de Competencia (NO se asignan entre sí)
```javascript
COMPETITION_GROUPS = [
  ['Joyería y Accesorios', 'Moda y Estilo'],
  ['Paisajismo y Jardinería', 'Hogar y Jardín'],
  ['Marketing Digital', 'Tecnología y Desarrollo'],
  ['Belleza y Estética', 'Cosméticos y Skincare', 'Manicure'],
  ['Coaching y Bienestar', 'Salud y Kinesiología'],
  ['Consultoría de Negocios', 'Consultoría Estratégica']
]
```

### Afinidades Complementarias (SE benefician)
```javascript
COMPLEMENTARY_AFFINITIES = {
  'Moda y Estilo': ['Belleza', 'Eventos', 'Fotografía'],
  'Bienestar': ['Gastronomía', 'Deportes', 'Naturaleza'],
  'Negocios': ['Tecnología', 'Educación', 'Marketing'],
  'Hogar y Jardín': ['Arquitectura', 'Decoración', 'Construcción'],
  'Gastronomía': ['Eventos', 'Turismo', 'Bienestar'],
  'Eventos': ['Gastronomía', 'Fotografía', 'Moda'],
  'Maternidad': ['Educación', 'Bienestar', 'Familia'],
  'Tecnología': ['Negocios', 'Educación', 'Marketing']
}
```

### Lógica de Asignación
```
Para cada usuario:
  1. Obtener todos los demás usuarios
  2. Filtrar competidores directos
  3. Priorizar afinidades complementarias
  4. Seleccionar 10 para "Yo comparto a ellos"
  5. Seleccionar 10 para "Ellos me comparten"
  6. Evitar duplicados
  7. Guardar asignación mensual
```

---

## 🤖 TRIBU X - ANÁLISIS IA

### Flujo Completo
```
Usuario ve perfil → Click "Analizar Compatibilidad"
    │
    ▼
handleGenerateAnalysis()
    │
    ├── Mostrar TribalLoadingAnimation (3-5 seg)
    │
    ├── Intentar Azure OpenAI
    │   │
    │   ├── Si Azure OK:
    │   │   └── analyzeCompatibility() → GPT-5.1
    │   │       ├── Prompt personalizado
    │   │       ├── Insight de compatibilidad
    │   │       ├── 3 oportunidades concretas
    │   │       └── Mensaje icebreaker
    │   │
    │   └── Si Azure FAIL:
    │       └── generateSmartAnalysis() → Fallback local
    │           ├── Análisis basado en categorías
    │           ├── Oportunidades genéricas
    │           └── Icebreaker template
    │
    └── Mostrar resultado + Botón WhatsApp
        │
        └── getWhatsAppUrl()
            └── wa.me/{phone}?text={icebreaker}
```

### Prompt GPT-5.1
```
Eres el "Algoritmo Tribal X" de Tribu Impulsa.

CONTEXTO:
- Plataforma de cross-promotion para emprendedores chilenos
- Objetivo: identificar sinergias entre negocios

USUARIO ACTUAL: {myProfile}
PERFIL ANALIZADO: {targetProfile}

GENERA:
1. Insight de compatibilidad (2-3 oraciones)
2. 3 oportunidades concretas de colaboración
3. Mensaje icebreaker para WhatsApp
```

---

## 📊 CATEGORÍAS DISPONIBLES (157 opciones)

### Macro-categorías
```
├── Moda Mujer (17 subcategorías)
├── Moda Hombre (3 subcategorías)
├── Negocio (15 subcategorías)
├── Alimentos y Gastronomía (12 subcategorías)
├── Belleza, Estética y Bienestar (20 subcategorías)
├── Eventos y Producción (8 subcategorías)
├── Hogar y Jardín (10 subcategorías)
├── Educación y Formación (8 subcategorías)
├── Tecnología y Desarrollo (6 subcategorías)
├── Servicios Profesionales (15 subcategorías)
├── Mascotas (5 subcategorías)
├── Deportes y Fitness (6 subcategorías)
└── Otros (32 subcategorías)
```

---

## 🚀 DEPLOY VERCEL

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    }
  ]
}
```

### Variables Vercel
```
VITE_AZURE_OPENAI_ENDPOINT = https://...cognitiveservices.azure.com/...
VITE_AZURE_OPENAI_KEY = sk-...
```

---

## 📱 COMPONENTES UI EN App.tsx

### Por Líneas (aproximado)
```
App.tsx (6363 líneas)
│
├── [1-100]     Imports + Inicialización
├── [100-400]   Helpers + Funciones globales
├── [400-680]   LoginScreen
├── [680-900]   RegisterScreen
├── [900-1200]  SearchingScreen + SurveyScreen
├── [1200-1800] Dashboard
├── [1800-2100] MembershipScreen
├── [2100-2500] TribeAssignmentsView
├── [2500-3100] MyProfileView
├── [3100-3600] ProfileDetail (parte 1)
├── [3600-3840] MatchAnalysisSection (Tribu X)
├── [3840-4100] ProfileDetail (parte 2)
├── [4100-4350] ActivityView
├── [4350-4600] DirectoryView
├── [4600-5400] Modales + Helpers
├── [5400-6200] AdminPanelInline
└── [6200-6363] Router + Exports
```

---

## 🧬 INTERFACES TYPESCRIPT

### UserProfile (databaseService.ts)
```typescript
interface UserProfile {
  // Identificación
  id: string;
  createdAt: string;
  updatedAt?: string;
  
  // Datos personales
  name: string;
  email: string;
  phone: string;
  password?: string;
  
  // Emprendimiento
  companyName: string;
  city: string;
  sector?: string;
  bio?: string;
  businessDescription?: string;
  
  // Redes sociales
  instagram: string;
  facebook?: string;
  tiktok?: string;
  website?: string;
  whatsapp?: string;
  
  // Clasificación
  category: string;    // Giro/Rubro
  affinity: string;    // Con quién conectar
  scope?: 'LOCAL' | 'REGIONAL' | 'NACIONAL';
  
  // Visual
  avatarUrl?: string;
  companyLogoUrl?: string;
  coverUrl?: string;
  
  // Métricas
  followers?: number;
  revenue?: string;
  
  // Estado
  status: 'pending' | 'active' | 'suspended';
  surveyCompleted?: boolean;
  tribeAssigned?: boolean;
}
```

### MatchProfile (types.ts)
```typescript
interface MatchProfile {
  id: string;
  name: string;
  companyName: string;
  category: string;
  subCategory: string;
  avatarUrl: string;
  companyLogoUrl: string;
  coverUrl: string;
  whatsapp: string;
  phone?: string;      // ← ARREGLADO HOY
  email?: string;      // ← ARREGLADO HOY
  location: string;
  website: string;
  bio: string;
  tags: string[];
  foundingYear: number;
  instagram: string;
}
```

### Notification
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'tribe_assigned' | 'report_received' | 'match_new' | 'reminder' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}
```

### UserMembership
```typescript
interface UserMembership {
  id: string;
  email: string;
  status: 'invitado' | 'miembro' | 'admin';
  paymentId?: string;
  paymentDate?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## ⚙️ SERVICE WORKERS

### sw.js (Cache Principal)
```javascript
CACHE_NAME = 'tribu-impulsa-v1'

STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
]

Eventos:
├── install    → Cache assets estáticos
├── activate   → Limpiar caches viejos
└── fetch      → Network first, cache fallback
```

### firebase-messaging-sw.js (Push Notifications)
```javascript
Eventos:
├── onBackgroundMessage → Mostrar notificación nativa
└── notificationclick   → Abrir/enfocar app

Opciones notificación:
├── icon: '/icons/icon-192.png'
├── badge: '/icons/icon-72.png'
├── tag: 'tribu-notification'
└── actions: ['Ver', 'Cerrar']
```

---

## 🔌 FUNCIONES AZURE OPENAI

### analyzeCompatibility()
```
Input:
├── user1: UserProfile (quien busca)
└── user2: UserProfile (potencial match)

Output (JSON):
├── score: number (70-98)
├── analysis: string (insight 2-3 oraciones)
├── opportunities: string[] (3 acciones concretas)
└── icebreaker: string (mensaje WA <280 chars)
```

### generateShareSuggestions()
```
Input:
├── sharer: UserProfile (quien comparte)
└── target: UserProfile (a quien promociona)

Output:
└── suggestions: string[] (3 ideas de contenido)
```

### getAIMatches()
```
Input:
├── targetUser: UserProfile
├── candidates: UserProfile[]
└── topN: number (cuántos retornar)

Output:
├── matches: MatchResult[]
│   ├── userId: string
│   ├── score: number
│   ├── reason: string
│   └── synergies: string[]
├── insights: string
└── processingTime: number (ms)
```

---

## 📊 FIREBASE CONFIG

### Proyecto
```
Project ID:       tribu-impulsa
Storage Bucket:   tribu-impulsa.firebasestorage.app
Messaging ID:     348097115578
App ID:           1:348097115578:web:115960bb81563050d01983
Region:           us-central1 (default)
Plan:             Blaze (pay-as-you-go)
```

### Colecciones Firestore
```
/users/{userId}
  ├── id, email, name, companyName
  ├── phone, instagram, category
  ├── avatarUrl, coverUrl
  ├── status, createdAt
  └── source: 'initial_migration' | 'app_registration'

/memberships/{userId}
  ├── id, email, status
  ├── paymentId, paymentDate
  └── createdAt, updatedAt

/notifications/{notifId}
  ├── userId, type, title, message
  ├── read, createdAt
  └── data (metadata)

/payment_history/{paymentId}
  ├── userId, userEmail, amount
  ├── action: 'approved' | 'revoked'
  ├── adminId, reason
  └── timestamp, revenue

/interactions/{interactionId}
  ├── fromUserId, toUserId
  ├── type, status
  └── createdAt, note
```

### Storage Structure
```
/profiles/{userId}/
  ├── avatar_{timestamp}.jpg  (max 500x500, 80% JPEG)
  └── cover_{timestamp}.jpg   (max 500x500, 80% JPEG)
```

---

## 🛡️ SEGURIDAD Y VALIDACIONES

### Validación Upload Imágenes
```javascript
validateImageFile(file):
├── Tamaño máximo: 2 MB
├── Tipos permitidos: image/jpeg, image/png, image/gif, image/webp
└── Error: Muestra toast con mensaje

compressImage(file):
├── Dimensión máxima: 500x500 px
├── Calidad: 80% JPEG
└── Output: Blob comprimido
```

### Validación Registro
```javascript
registerNewUser(userData):
├── Email único (verifica en localStorage + Firebase)
├── Nombre requerido
├── Instagram requerido
├── Categoría requerida
└── Password default: 'tribu2024'
```

### Protección Rutas
```javascript
MemberRoute component:
├── Verifica membresía activa
├── Si no miembro → /membership
└── Si miembro → render children
```

---

## 📈 MÉTRICAS ADMIN PANEL

### Dashboard Stats
```javascript
getDashboardStats():
├── totalUsers: number
├── activeMembers: number
├── invitados: number
├── totalRevenue: number (calculado)
├── conversionRate: string (%)
└── categoryDistribution: array
```

### Compliance Stats
```javascript
getComplianceStats():
├── onTrack: number (>80% completado)
├── needsAttention: number (50-80%)
├── atRisk: number (<50%)
└── averageProgress: number
```

---

## 🎨 PALETA DE COLORES

```css
/* Primarios */
--tribu-purple: #6161FF    /* Botones, acentos */
--tribu-green: #00CA72     /* Éxito, WhatsApp */

/* Secundarios */
--tribu-dark: #181B34      /* Textos principales */
--tribu-gray: #434343      /* Textos secundarios */
--tribu-light-gray: #7C8193 /* Subtextos */

/* Backgrounds */
--bg-main: #F5F7FB         /* Fondo principal */
--bg-white: #FFFFFF        /* Cards */
--bg-card: #E4E7EF         /* Bordes */

/* Estados */
--success: #00CA72
--warning: #F59E0B
--error: #EF4444
--info: #3B82F6

/* WhatsApp */
--whatsapp: #25D366
--whatsapp-hover: #20BA5C
```

---

## 📦 DEPENDENCIAS PRINCIPALES

### package.json
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "firebase": "^10.x",
    "lucide-react": "^0.x",
    "tailwindcss": "^3.x (CDN)"
  },
  "devDependencies": {
    "vite": "^5.x",
    "typescript": "^5.x",
    "@types/react": "^18.x"
  }
}
```

### Tamaño Bundle (dist/)
```
Total:           ~1.1 MB (gzip: ~275 KB)
├── index.js     1,084 KB (gzip: 274 KB)
├── index.css    8.3 KB (gzip: 2 KB)
└── ai-service   2.5 KB (gzip: 1.4 KB)
```

---

## 🎨 SISTEMA DE COLORES COMPLETO (index.css)

### Danger (Rojo) - Alertas
```css
--color-danger-050: #FFF0F5;
--color-danger-100: #FFD5E1;
--color-danger-300: #FF8EA9;
--color-danger-500: #FB275D;  /* Principal */
--color-danger-700: #C11243;
--color-danger-900: #7A0F2C;
```

### Warning (Amarillo) - Working
```css
--color-warning-050: #FFF8E1;
--color-warning-100: #FFEDB3;
--color-warning-300: #FFE066;
--color-warning-500: #FFCC00;  /* Principal */
--color-warning-700: #E0A800;
--color-warning-900: #8C6400;
```

### Success (Verde) - Done
```css
--color-success-050: #E6FFF3;
--color-success-100: #C1F8DF;
--color-success-300: #4AE698;
--color-success-500: #00CA72;  /* Principal */
--color-success-700: #008C4F;
--color-success-900: #005432;
```

### Accent (Purple) - Tribu
```css
--color-accent-050: #F3F3FF;
--color-accent-100: #DCDCFD;
--color-accent-300: #A4A4FF;
--color-accent-500: #6161FF;  /* Principal */
--color-accent-700: #2C2CA0;
--color-accent-900: #1B1B66;
```

### Lila Pastel - Especiales
```css
--color-lila-050: #FAF5FF;
--color-lila-100: #E8D5FF;
--color-lila-300: #C9A8FF;
--color-lila-500: #A78BFA;  /* Principal */
--color-lila-700: #7C3AED;
--color-lila-900: #5B21B6;
```

### Fucsia Pastel - Highlights
```css
--color-fucsia-050: #FDF2F8;
--color-fucsia-100: #FFD5E5;
--color-fucsia-300: #FF9EC4;
--color-fucsia-500: #EC4899;  /* Principal */
--color-fucsia-700: #BE185D;
--color-fucsia-900: #831843;
```

### Neutrales
```css
--neutral-000: #FFFFFF;   /* Cards */
--neutral-050: #F5F7FB;   /* Background */
--neutral-100: #E4E7EF;   /* Borders light */
--neutral-300: #B3B8C6;   /* Borders */
--neutral-500: #7C8193;   /* Text secondary */
--neutral-700: #434343;   /* Text primary */
--neutral-900: #181B34;   /* Dark */
```

### Gradientes
```css
--gradient-tribe: linear-gradient(135deg, #181B34 0%, #1B1B66 45%, #6161FF 100%);
--gradient-hero: linear-gradient(160deg, #181B34 0%, #1B1B66 55%, #6161FF 100%);
--gradient-success: linear-gradient(135deg, #005432 0%, #00CA72 100%);
--gradient-cta: linear-gradient(135deg, #00CA72 0%, #4AE698 100%);
```

---

## 📱 SAFE AREAS iOS

```css
/* Clases utilitarias para iPhone notch */
.pt-safe { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
.pl-safe { padding-left: env(safe-area-inset-left); }
.pr-safe { padding-right: env(safe-area-inset-right); }
.px-safe { padding-left/right: env(safe-area-inset-*); }
.py-safe { padding-top/bottom: env(safe-area-inset-*); }
.p-safe  { padding: env(safe-area-inset-*); }
.safe-area-container { min-height: 100vh; all safe areas; }
```

---

## 🛠️ SCRIPTS DE UTILIDAD

### scripts/
| Script | Función |
|--------|---------|
| `generateIcons.cjs` | Genera iconos PWA en múltiples tamaños |
| `downloadAvatars.cjs` | Descarga avatares de usuarios |
| `parseCSVUsers.cjs` | Parsea CSV de usuarios a JSON/TS |
| `generated_users.ts` | Usuarios generados automáticamente |

### generateIcons.cjs
```javascript
Input: Logo 512x512
Output:
├── icon-72.png
├── icon-96.png
├── icon-128.png
├── icon-144.png
├── icon-152.png
├── icon-192.png
├── icon-384.png
└── icon-512.png
```

### parseCSVUsers.cjs
```javascript
Input: export_vista_usuario_pyme_full.csv
Process:
├── Lee CSV con encoding UTF-8
├── Parsea columnas: nombre, email, empresa, categoría
├── Normaliza teléfonos (+56)
├── Genera IDs únicos
└── Output: generated_users.ts
```

---

## 📋 CONVENCIONES DE CÓDIGO

### Naming
```
Componentes:    PascalCase    (LoginScreen, DirectoryView)
Funciones:      camelCase     (handleLogin, getUserById)
Constantes:     UPPER_SNAKE   (CACHE_NAME, DB_KEYS)
Archivos TS:    camelCase     (matchService.ts)
Archivos CSS:   kebab-case    (index.css)
```

### Estructura Componentes
```typescript
// 1. Imports
import React from 'react';
import { Icon } from 'lucide-react';

// 2. Interfaces
interface Props { ... }

// 3. Componente
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // 4. Estado
  const [state, setState] = useState();
  
  // 5. Effects
  useEffect(() => { ... }, []);
  
  // 6. Handlers
  const handleClick = () => { ... };
  
  // 7. Render helpers
  const renderItem = () => { ... };
  
  // 8. Return JSX
  return <div>...</div>;
};

export default MyComponent;
```

### Logging
```javascript
// Éxito
console.log('✅ Acción completada');

// Warning
console.log('⚠️ Advertencia');

// Error
console.error('❌ Error:', error);

// Info
console.log('📊 Data:', data);
console.log('🔄 Cargando...');
console.log('☁️ Firebase sync');
console.log('🚀 Iniciando...');
```

---

## 🔄 FLUJO DE DESARROLLO

### Comandos
```bash
npm run dev      # Desarrollo (localhost:3000)
npm run build    # Build producción (dist/)
npm run preview  # Preview build local
npm run lint     # Verificar errores TS
```

### Deploy
```bash
git add -A
git commit -m "tipo: descripción"
git push
# Vercel deploya automáticamente
```

### Commits (Conventional)
```
feat:     Nueva funcionalidad
fix:      Corrección de bug
docs:     Documentación
style:    Formato, no afecta código
refactor: Refactorización
test:     Tests
chore:    Mantenimiento
```

---

## 📊 ESTADÍSTICAS DEL PROYECTO

### Líneas de Código (aproximado)
```
App.tsx:              6,363 líneas
realUsersData.ts:     2,864 líneas
services/ (total):    ~8,000 líneas
components/:          ~1,200 líneas
styles:               ~500 líneas
─────────────────────────────────
TOTAL:               ~18,000+ líneas
```

### Archivos por Tipo
```
TypeScript (.ts/.tsx):  25 archivos
JavaScript (.js/.cjs):   6 archivos
CSS:                     1 archivo
JSON:                    5 archivos
Markdown:               15 archivos
─────────────────────────────────
TOTAL:                  52+ archivos
```

---

## ✅ CHECKLIST - PERSISTENCIA FIREBASE

### Flujo Completo
```
Usuario abre /tribe
    │
    ▼
TribeAssignmentsView monta
    │
    ▼
useEffect → loadChecklistFromFirebase(userId)
    │
    ├── GET Firestore: /progress/{userId}
    │
    ├── Si existe:
    │   ├── Lee: { completed, total, items }
    │   ├── Merge con checklist local
    │   └── setChecklist(merged)
    │
    └── Si no existe:
        └── Usa checklist local (inicial)

Usuario marca checkbox
    │
    ▼
handleToggle(list, profileId)
    │
    ├── Actualiza estado local
    ├── persistChecklistState(next)      → localStorage
    └── syncChecklistToCloud(userId, next) → Firebase
        │
        └── SET Firestore: /progress/{userId}
            ├── completed: number
            ├── total: number
            ├── items: { [profileId]: boolean }
            └── updatedAt: serverTimestamp()
```

### Estructura Firestore
```
/progress/{userId}
├── completed: 12          # Items marcados
├── total: 20              # Total items
├── items: {
│   "real_user_5": true,
│   "real_user_12": false,
│   "real_user_23": true,
│   ...
│ }
└── updatedAt: Timestamp   # Última actualización
```

### Funciones
```typescript
// Guardar progreso
syncChecklistProgress(userId, {
  completed: number,
  total: number,
  items: Record<string, boolean>
}) → Promise<boolean>

// Cargar progreso
loadChecklistFromFirebase(userId) → Promise<{
  completed: number,
  total: number,
  items: Record<string, boolean>
} | null>
```

---

## 📊 RESUMEN PERSISTENCIA COMPLETA

| Dato | Local | Firebase | Sync |
|------|-------|----------|------|
| Usuarios | ✅ | ✅ | Bidireccional |
| Membresías | ✅ | ✅ | Bidireccional |
| Notificaciones | ✅ | ✅ | Bidireccional |
| Checklist | ✅ | ✅ | Bidireccional |
| Fotos/Banner | ❌ | ✅ | Solo Firebase |
| Pagos | ❌ | ✅ | Solo Firebase |
| Config Admin | ✅ | ✅ | **Bidireccional** ✨ |
| Asignaciones | ✅ | ✅ | **Bidireccional** ✨ |

### ✅ TODO SINCRONIZADO A FIREBASE
- ✅ `tribu_admin_config` → `/config/admin`
- ✅ `tribe_assignments` → `/tribe_assignments/{userId}`

---

## 🔥 COLECCIONES FIREBASE ACTUALIZADAS

```
Firestore Database
├── /users/{userId}              # Perfiles usuarios
├── /memberships/{email}         # Estados membresía  
├── /notifications/{notifId}     # Notificaciones
├── /payment_history/{payId}     # Historial pagos
├── /interactions/{intId}        # Logs interacciones
├── /progress/{userId}           # ✨ Checklist progreso
├── /config/admin                # ✨ Config admin global
└── /tribe_assignments/{userId}  # ✨ Asignaciones 10+10
```

### /config/admin
```typescript
{
  membershipPrice: 20000,
  matchesPerUser: 10,
  whatsappSupport: '+56951776005',
  appName: 'Tribu Impulsa',
  mercadopagoMode: 'sandbox',
  updatedAt: Timestamp
}
```

### /tribe_assignments/{userId}
```typescript
{
  toShareIds: ['real_user_5', 'real_user_12', ...],     // 10 IDs
  shareWithMeIds: ['real_user_8', 'real_user_23', ...], // 10 IDs
  month: '2025-01',
  updatedAt: Timestamp
}
```

---

## 🔄 FUNCIONES FIREBASE SYNC

| Función | Guarda | Carga |
|---------|--------|-------|
| Checklist | `syncChecklistProgress()` | `loadChecklistFromFirebase()` |
| Config Admin | `syncAdminConfig()` | `loadAdminConfig()` |
| Asignaciones | `syncTribeAssignments()` | `loadTribeAssignments()` |
| Perfiles | `syncProfileToCloud()` | `getProfileFromCloud()` |
| Membresías | `saveMembership()` | `getMembership()` |

---

## 🎨 COMPONENTES UI DETALLADOS

### TribalLoadingAnimation.tsx (327 líneas)
```
Animación Canvas 2D para Tribu X (análisis IA)

Fases:
├── chaos         → Partículas dispersas
├── converging    → Se acercan al centro
├── crystallizing → Forman patrón tribal
└── complete      → Análisis listo

Mensajes:
├── "Conectando con la tribu..."
├── "Analizando perfiles..."
├── "Calculando sinergias..."
└── "¡Análisis completo!"

Colores: #6161FF, #00CA72, #FFCC00, #FB275D, #00D4FF
```

### CosmicLoadingAnimation.tsx (116 líneas)
```
Animación CSS para búsqueda inicial

Mensajes rotativos:
├── "Conectando con tu tribu..."
├── "Escaneando emprendedores..."
├── "Analizando perfiles..."
├── "Calculando afinidades..."
├── "Formando conexiones..."
├── "Optimizando tu tribu..."
└── "¡Tu tribu está lista!"

Duración: 6000ms (configurable)
```

### GlassCard.tsx (34 líneas)
```
Componente glassmorphism reutilizable

Estilos:
├── bg-white/10
├── backdrop-blur-xl
├── border-white/20
├── shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
└── rounded-2xl

Props:
├── children: ReactNode
├── className?: string
└── padding?: string (default "p-6")
```

### WhatsAppFloat.tsx (34 líneas)
```
Botón flotante de soporte WhatsApp

Posición: fixed bottom-20 right-4
Color: #25D366 (WhatsApp green)
Número: Carga de localStorage ('tribu_admin_config')
Fallback: +56951776005
```

### PaywallScreen.tsx (300+ líneas)
```
Pantalla de pago membresía

Flujo:
├── Muestra precio (desde membershipService)
├── Simula pago MercadoPago/Fintoc
├── Valida campos (email, nombre)
├── onPaymentSuccess() → actualiza membresía
└── Redirige a /dashboard

Precio formateado: $20.000 CLP
```

---

## 🔢 CONTADORES Y MÉTRICAS

### Admin Dashboard
```
Usuarios totales:     count(users)
Miembros activos:     count(memberships where status='miembro')
Invitados:            count(memberships where status='invitado')
Revenue total:        sum(payment_history.amount)
Conversión:           (miembros / total) * 100
```

### Compliance Tribu
```
On Track (>80%):      count(progress where completion>80)
Needs Attention:      count(progress where completion 50-80)
At Risk (<50%):       count(progress where completion<50)
Promedio:             avg(progress.completion)
```

### Por Usuario
```
Checklist:            completed / total items
Interacciones:        count(interactions where userId)
Reportes:             count(reports where userId)
Asignaciones:         toShare.length + shareWithMe.length
```

---

## 📂 CATEGORÍAS DE NEGOCIO (157 opciones)

### Resumen por Rubro Principal
```
Moda Mujer:              22 subcategorías
Moda Hombre:              3 subcategorías
Negocio:                 16 subcategorías
Alimentos y Gastronomía: 14 subcategorías
Belleza y Bienestar:     14 subcategorías
Servicios Profesionales: 16 subcategorías
Educación:                8 subcategorías
Arte y Creatividad:       7 subcategorías
Construcción:             7 subcategorías
Tecnología:               7 subcategorías
Turismo:                  3 subcategorías
Eventos:                  9 subcategorías
Transporte:               7 subcategorías
Mascotas:                 8 subcategorías
Industria:                4 subcategorías
Oficios:                 12 subcategorías
```

### Archivo: data/tribeCategories.ts
```typescript
export const TRIBE_CATEGORY_OPTIONS = [
  "Moda Mujer Ropa Jeans",
  "Moda Mujer Ropa Vestidos de fiesta",
  ...
  "Alimentos y Gastronomía Restaurante o café",
  "Alimentos y Gastronomía Delivery comida preparada",
  ...
  "Tecnología y Desarrollo Desarrollo de softwares",
  ...
  "Oficio Carpintería Carpintero",
  "Otro"
];
// Total: 157 categorías
```

---

## 🔗 DIAGRAMA DE CONEXIONES FINAL

```
┌─────────────────────────────────────────────────────────────────┐
│                        TRIBU IMPULSA PWA                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │
│  │   Usuario   │ ──── │    React    │ ──── │   Firebase  │     │
│  │   (PWA)     │      │   App.tsx   │      │  Firestore  │     │
│  └─────────────┘      └─────────────┘      └─────────────┘     │
│         │                    │                    │             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │
│  │ localStorage│ ◄──► │  Services   │ ◄──► │   Storage   │     │
│  │   (cache)   │      │   Layer     │      │  (images)   │     │
│  └─────────────┘      └─────────────┘      └─────────────┘     │
│                              │                                  │
│                              ▼                                  │
│                       ┌─────────────┐                          │
│                       │ Azure OpenAI│                          │
│                       │  (Tribu X)  │                          │
│                       └─────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Flujo de datos:
1. Usuario → React → Firebase (write)
2. Firebase → React → localStorage (cache)
3. Usuario → React → Azure OpenAI (Tribu X)
4. Usuario → WhatsApp (mensajes directos)
```

---

## 📋 CHECKLIST DE COMPLETITUD

### ✅ Documentado
- [x] Rutas y pantallas
- [x] Flujos de usuario
- [x] Servicios y funciones
- [x] Componentes UI
- [x] Interfaces TypeScript
- [x] Service Workers
- [x] Firebase colecciones
- [x] Algoritmo Tribu
- [x] Azure OpenAI
- [x] LocalStorage keys
- [x] Colores y estilos
- [x] Scripts utilidades
- [x] Categorías negocio
- [x] Métricas y stats

### 📊 Estadísticas Finales
```
Líneas de código:     ~20,000+
Archivos:             52+
Colecciones Firebase: 8
Funciones sync:       10
Componentes UI:       6
Categorías negocio:   157
Usuarios migrados:    112
Logros esta sesión:   16
```

---

## 🎯 ALGORITMO TRIBAL DETALLADO

### Archivo: services/tribeAlgorithm.ts (273 líneas)

### Grupos de Competencia (NO se asignan entre sí)
```typescript
const COMPETITION_GROUPS = [
  ['Joyería y Accesorios', 'Moda y Estilo'],
  ['Paisajismo y Jardinería', 'Hogar y Jardín'],
  ['Marketing Digital', 'Tecnología y Desarrollo'],
  ['Belleza y Estética', 'Cosméticos y Skincare', 'Manicure y Pedicure'],
  ['Coaching y Bienestar', 'Salud y Kinesiología'],
  ['Consultoría de Negocios', 'Consultoría Estratégica', 'Educación Financiera'],
];
```

### Afinidades Complementarias (BONUS)
```typescript
const COMPLEMENTARY_AFFINITIES = {
  'Moda y Estilo':    ['Belleza', 'Eventos', 'Fotografía'],
  'Bienestar':        ['Gastronomía', 'Deportes', 'Naturaleza'],
  'Negocios':         ['Tecnología', 'Educación', 'Marketing'],
  'Hogar y Jardín':   ['Arquitectura', 'Decoración', 'Construcción'],
  'Gastronomía':      ['Eventos', 'Turismo', 'Bienestar'],
  'Eventos':          ['Gastronomía', 'Fotografía', 'Moda'],
  'Maternidad':       ['Educación', 'Bienestar', 'Familia'],
  'Tecnología':       ['Negocios', 'Educación', 'Marketing'],
};
```

### Cálculo de Score de Compatibilidad
```
Base score:                  50 puntos
─────────────────────────────────────────
Si son competidores:        -100 puntos  → ELIMINADO
Afinidad complementaria:    +30 puntos
Misma ciudad:               +15 puntos
Seguidores similares:       +10 puntos
Variación random:           +0-10 puntos
─────────────────────────────────────────
Score final:                0-115 puntos
```

### Proceso de Asignación
```
1. Filtrar usuarios activos (status === 'active')
2. Calcular score para cada par
3. Eliminar competidores (score < 0)
4. Ordenar por score descendente
5. Seleccionar top 10 para "Yo comparto"
6. Seleccionar otros 10 para "Me comparten"
7. Evitar duplicados y balance
8. Guardar en localStorage + Firebase
```

---

## ⚙️ CONFIGURACIÓN VITE

### vite.config.ts
```typescript
{
  server: {
    port: 3000,
    host: '0.0.0.0'  // Acceso desde red local
  },
  plugins: [react()],
  define: {
    'process.env.GEMINI_API_KEY': env.GEMINI_API_KEY
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  }
}
```

### Scripts package.json
```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext ts,tsx"
}
```

---

## 🔐 VARIABLES DE ENTORNO

### Desarrollo (.env.local)
```bash
# No configurado localmente (usa fallbacks)
```

### Producción (Vercel)
```bash
VITE_AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/...
VITE_AZURE_OPENAI_KEY=xxx
VITE_AZURE_DEPLOYMENT=gpt-51-chat
# Firebase ya hardcodeado en código
```

### Detección de Entorno
```typescript
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

// Azure solo funciona en producción
if (isProduction && azureConfig.endpoint && azureConfig.key) {
  // Usar Azure OpenAI
} else {
  // Usar fallback local
}
```

---

## 📱 PWA MANIFEST COMPLETO

### public/manifest.json
```json
{
  "name": "Tribu Impulsa",
  "short_name": "Tribu",
  "description": "Tu tribu de emprendedores",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#6161FF",
  "background_color": "#F5F7FB",
  "categories": ["business", "social"],
  "lang": "es-CL",
  "icons": [
    { "src": "/icons/icon-72.png",  "sizes": "72x72" },
    { "src": "/icons/icon-96.png",  "sizes": "96x96" },
    { "src": "/icons/icon-128.png", "sizes": "128x128" },
    { "src": "/icons/icon-144.png", "sizes": "144x144" },
    { "src": "/icons/icon-152.png", "sizes": "152x152" },
    { "src": "/icons/icon-192.png", "sizes": "192x192" },
    { "src": "/icons/icon-384.png", "sizes": "384x384" },
    { "src": "/icons/icon-512.png", "sizes": "512x512" }
  ],
  "screenshots": [
    { "src": "/screenshots/home.png", "sizes": "1080x1920" },
    { "src": "/screenshots/tribe.png", "sizes": "1080x1920" }
  ]
}
```

---

## 🔧 SCRIPTS DE MIGRACIÓN

### seedFirestore.ts
```typescript
// Migración única de usuarios base a Firebase
const UNIVERSAL_PASSWORD = 'TRIBU2026';

// 23 usuarios fundadores
const REAL_USERS = [
  { email: "dafna@...", role: "admin", ... },
  { email: "doraluz@...", role: "admin", ... },
  ...
];

// Proceso:
1. Crear usuario en Firebase Auth
2. Crear documento en /users/{id}
3. Crear membresía en /memberships/{email}
```

### realUsersData.ts - Migración Automática
```typescript
// Se ejecuta si Firebase tiene < 100 usuarios
if (firebaseUsers.length < 100) {
  await migrateBaseUsersToFirebase();
}

// Combina:
├── 108 usuarios hardcodeados
├── Usuarios de Firebase
└── Deduplica por email
```

---

## 🛡️ SEGURIDAD ACTUAL

### Autenticación
```
Método:           Email + Password (localStorage)
Password default: 'tribu2024' (nuevos usuarios)
Admin password:   Verificado contra lista de admins
Sesión:           localStorage (tribu_auth_session)
Expiración:       No implementada
```

### Firebase Rules (firestore.rules)
```javascript
// DESARROLLO - Permisivo
allow read: if true;
allow write: if true;

// PRODUCCIÓN (recomendado)
allow read: if request.auth != null;
allow write: if request.auth.uid == userId;
```

### Protección de Rutas
```typescript
// MemberRoute wrapper
if (!isMember) {
  return <Navigate to="/membership" />;
}

// AdminRoute wrapper  
if (!isAdmin) {
  return <Navigate to="/dashboard" />;
}
```

---

## 📈 ANALYTICS Y TRACKING

### Interacciones Logueadas
```typescript
logInteraction(userId, action, details):
├── 'profile_view'     → Ver perfil
├── 'share_completed'  → Completar compartida
├── 'report_sent'      → Enviar reporte
├── 'whatsapp_click'   → Click en WhatsApp
├── 'ai_analysis'      → Generar análisis IA
└── 'membership_paid'  → Pagar membresía
```

### Métricas Calculables
```
Desde Firebase:
├── Usuarios activos por mes
├── Tasa de conversión invitado→miembro
├── Revenue mensual
├── Progreso promedio checklist
├── Categorías más populares
└── Interacciones por usuario
```

---

## 🚀 ROADMAP SUGERIDO

### Corto Plazo
- [ ] Implementar expiración de sesión
- [ ] Mejorar Firebase Rules para producción
- [ ] Agregar verificación de email
- [ ] Dashboard de analytics real

### Mediano Plazo
- [ ] Integración real MercadoPago/Fintoc
- [ ] Notificaciones push programadas
- [ ] Chat entre usuarios
- [ ] Gamificación (badges, puntos)

### Largo Plazo
- [ ] App nativa (React Native)
- [ ] IA personalizada por usuario
- [ ] Marketplace de servicios
- [ ] Eventos presenciales integrados

---

## 📦 DEPENDENCIAS EXACTAS

### package.json
```json
{
  "name": "tribu-impulsa-mvp",
  "version": "0.0.0",
  "type": "module",
  
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.9.6",
    "firebase": "^12.6.0",
    "lucide-react": "^0.554.0",
    "three": "^0.181.2",
    "@types/three": "^0.181.0"
  },
  
  "devDependencies": {
    "vite": "^6.2.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "@types/node": "^22.14.0",
    "sharp": "^0.34.5"
  }
}
```

### Versiones Clave
```
React:            19.2.0   (última estable)
React Router:     7.9.6    (v7 con hooks)
Firebase:         12.6.0   (v12 modular)
Vite:             6.2.0    (bundler rápido)
TypeScript:       5.8.2    (tipos estrictos)
Lucide:           0.554.0  (iconos SVG)
Three.js:         0.181.2  (animaciones 3D)
Sharp:            0.34.5   (procesamiento imágenes)
```

---

## ⚙️ TSCONFIG

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "isolatedModules": true,
    "noEmit": true,
    "allowJs": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Características Habilitadas
```
ES2022:               Módulos nativos, top-level await
DOM:                  APIs del navegador
JSX React:            Sin import React explícito
Path aliases:         @/ mapea a raíz del proyecto
No emit:              Vite maneja el build
```

---

## 🔍 ICONOS LUCIDE USADOS

### Navegación
```
Home, Users, Activity, User, Settings, LogOut
```

### Acciones
```
Plus, Check, X, Edit, Trash2, Search, Filter
MessageCircle, Phone, Mail, ExternalLink, Copy
```

### Estados
```
CheckCircle, AlertCircle, Clock, Star, Heart
Award, TrendingUp, TrendingDown
```

### Redes Sociales
```
Instagram, Facebook, Globe, MessageSquare (WhatsApp)
```

### Admin
```
Shield, Lock, CreditCard, BarChart3, PieChart
UserCheck, UserX, RefreshCw, Download, Upload
```

---

## 📱 RESPONSIVE BREAKPOINTS

### Tailwind (usado via CDN)
```css
sm:   640px    /* Móviles grandes */
md:   768px    /* Tablets */
lg:   1024px   /* Laptops */
xl:   1280px   /* Desktop */
2xl:  1536px   /* Pantallas grandes */
```

### Uso Común en App
```jsx
// Grid responsivo
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// Padding responsivo
className="p-4 md:p-6 lg:p-8"

// Texto responsivo
className="text-lg md:text-xl lg:text-2xl"

// Ocultar en móvil
className="hidden md:block"
```

---

## 🔊 LOGS DE CONSOLA

### Emojis por Tipo
```
✅  Éxito           console.log('✅ Usuario guardado')
❌  Error           console.error('❌ Error:', err)
⚠️  Warning         console.warn('⚠️ Sin conexión')
☁️  Firebase        console.log('☁️ Sync completado')
📊  Data            console.log('📊 Stats:', data)
🔄  Loading         console.log('🔄 Cargando...')
🚀  Inicio          console.log('🚀 App iniciada')
🔐  Auth            console.log('🔐 Login exitoso')
💰  Pagos           console.log('💰 Pago procesado')
🎯  Tribu           console.log('🎯 Asignación generada')
```

### Ejemplo Real
```javascript
console.log('🚀 Tribu Impulsa v1.0.5 - Producción');
console.log('☁️ Firebase inicializado');
console.log('📊 Usuarios cargados:', users.length);
console.log('✅ App lista');
```

---

## 📄 ARCHIVOS README

### README.md (principal)
```markdown
# Tribu Impulsa PWA

Red de networking para emprendedores chilenos.

## Stack
- React 19 + TypeScript
- Firebase (Firestore + Storage + Auth)
- Azure OpenAI (Tribu X)
- Vite + Vercel

## Desarrollo
npm install
npm run dev

## Deploy
git push → Vercel autodeploy
```

---

## 🎉 RESUMEN FINAL

### MAPA_SITIO_PWA.md
```
📄 Líneas totales:    2,200+
📋 Secciones:         30+
🏆 Logros sesión:     13
✅ Todo documentado:  SÍ
```

### PWA Completa
```
👥 Usuarios:          112 activos
💳 Membresías:        Sync Firebase
📱 PWA:               Instalable
🤖 IA:                Azure GPT-5.1
📊 Analytics:         Firebase
🔒 Seguridad:         Básica (mejorable)
```

### Firebase 100% Sync
```
/users              ✅
/memberships        ✅
/notifications      ✅
/payment_history    ✅
/interactions       ✅
/progress           ✅
/config/admin       ✅
/tribe_assignments  ✅
```

---

## 🖼️ ICONOS PWA

### public/icons/
```
Archivo                    Tamaño      Uso
────────────────────────────────────────────────
icon-72.png                3.7 KB      Android pequeño
icon-96.png                5.7 KB      Android mediano
icon-128.png               8.8 KB      Desktop
icon-144.png               10.9 KB     Android grande
icon-152.png               11.9 KB     iPad
icon-192.png               17.5 KB     Android maskable
icon-384.png               59.9 KB     Splash screen
icon-512.png               99.8 KB     Store / Splash
────────────────────────────────────────────────
apple-touch-icon.png       15.4 KB     iOS home
apple-touch-icon-120.png   7.9 KB      iPhone
apple-touch-icon-152.png   11.9 KB     iPad
apple-touch-icon-167.png   14.1 KB     iPad Pro
```

### Total Assets
```
Iconos totales:     12 archivos
Peso total:         ~268 KB
Formato:            PNG optimizado
Color principal:    #6161FF (púrpura)
```

---

## 📝 FORMULARIOS DE LA APP

### Login (LoginScreen)
```
Campo               Validación
────────────────────────────────
Email              required, email format
Password           required, min 4 chars
```

### Registro (RegisterScreen)
```
Campo               Validación
────────────────────────────────
Email              pre-llenado
Nombre             required
Empresa            required
Teléfono           required, +56...
Instagram          required, @...
Ciudad             required
Categoría          required (select)
Afinidad           required (select)
Bio                optional, max 200
```

### Editar Perfil (MyProfileView)
```
Campo               Validación
────────────────────────────────
Nombre             required
Empresa            required
Teléfono           required
Instagram          required
Ciudad             required
Bio                max 200 chars
Website            optional, URL
Facebook           optional, @...
TikTok             optional, @...
Avatar             image, max 2MB
Cover              image, max 2MB
```

### Pago Membresía (PaywallScreen)
```
Campo               Validación
────────────────────────────────
Email              required, email
Nombre tarjeta     required
Número tarjeta     required, 16 digits (simulated)
Expiry             required, MM/YY
CVV                required, 3-4 digits
```

---

## 🎭 ESTADOS DE UI

### Botones
```css
/* Normal */
bg-[#6161FF] text-white

/* Hover */
hover:shadow-[0_8px_20px_rgba(97,97,255,0.35)]

/* Disabled */
disabled:opacity-50 disabled:cursor-not-allowed

/* Loading */
opacity-50 + spinner

/* Success (verde) */
bg-gradient-to-r from-[#00CA72] to-[#4AE698]

/* Danger (rojo) */
bg-[#FB275D] hover:bg-[#C11243]
```

### Cards
```css
/* Normal */
bg-white rounded-xl border border-[#E4E7EF] p-4

/* Hover */
hover:shadow-md hover:border-[#6161FF]/30

/* Selected */
border-2 border-[#6161FF] bg-[#6161FF]/5

/* Glassmorphism */
bg-white/10 backdrop-blur-xl border-white/20
```

### Inputs
```css
/* Normal */
bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3

/* Focus */
focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF]

/* Error */
border-[#FB275D] bg-[#FFF0F5]

/* Disabled */
bg-[#E4E7EF] cursor-not-allowed
```

### Badges/Tags
```css
/* Categoría */
bg-[#6161FF]/10 text-[#6161FF] px-2 py-1 rounded-full text-xs

/* Status Active */
bg-[#E6FFF3] text-[#008A4E] border-[#00CA72]

/* Status Pending */
bg-[#FFF8E6] text-[#9D6B00] border-[#FFCC00]

/* Status Error */
bg-[#FFF0F5] text-[#C11243] border-[#FB275D]
```

---

## 🔔 TOASTS Y ALERTAS

### Tipos
```typescript
showToast({
  type: 'success',  // Verde con ✅
  type: 'error',    // Rojo con ❌
  type: 'warning',  // Amarillo con ⚠️
  type: 'info',     // Azul con ℹ️
  message: string,
  duration: 3000    // ms
});
```

### Implementación
```jsx
// Toast state
const [toast, setToast] = useState<{type, message} | null>(null);

// Mostrar toast
setToast({ type: 'success', message: '¡Guardado!' });
setTimeout(() => setToast(null), 3000);

// Render
{toast && (
  <div className="fixed bottom-20 left-1/2 -translate-x-1/2 
                  bg-white shadow-lg rounded-xl px-4 py-3 
                  flex items-center gap-2 z-50">
    {toast.type === 'success' && <CheckCircle className="text-[#00CA72]" />}
    {toast.message}
  </div>
)}
```

---

## 📊 ESTRUCTURA ESTADO GLOBAL

### localStorage Keys Summary
```
AUTH:
├── tribu_auth_session          → Usuario actual
├── tribu_current_user_id       → ID usuario

DATOS:
├── tribu_users                 → Cache usuarios
├── tribu_memberships           → Cache membresías
├── tribu_notifications         → Cache notificaciones

TRIBU:
├── tribeAssignmentsData_{id}   → Asignaciones 10+10
├── tribeAssignmentsChecklist_{id} → Progreso checklist
├── tribeAssignmentStatus_{id}  → Estado tribu
├── tribeReportsLog_{id}        → Reportes enviados

CONFIG:
├── tribu_admin_config          → Configuración admin
├── tribu_onboarding_{email}    → Survey completado
├── tribu_fcm_token             → Token push
```

### React State (App.tsx)
```typescript
// Global
const [currentUser, setCurrentUser] = useState<UserProfile | null>();

// TribeAssignmentsView
const [assignments, setAssignments] = useState<TribeAssignments>();
const [checklist, setChecklist] = useState<AssignmentChecklist>();
const [status, setStatus] = useState<TribeStatus>();

// AdminPanel
const [users, setUsers] = useState<UserProfile[]>();
const [memberships, setMemberships] = useState<Membership[]>();
const [stats, setStats] = useState<DashboardStats>();
```

---

## 🌐 URLs Y ENDPOINTS

### Internos (React Router)
```
/                    → Login
/register            → Registro (redirect)
/searching           → Loading cósmico
/survey              → Onboarding
/membership          → Paywall
/dashboard           → Home miembro
/tribe               → Asignaciones 10+10
/directory           → Directorio usuarios
/profile/:id         → Perfil + Tribu X
/activity            → Actividad
/my-profile          → Mi perfil
/admin               → Panel admin
```

### Externos
```
Firebase Firestore:
https://firestore.googleapis.com/v1/projects/tribu-impulsa/...

Firebase Storage:
https://firebasestorage.googleapis.com/v0/b/tribu-impulsa.firebasestorage.app/...

Azure OpenAI:
https://{resource}.openai.azure.com/openai/deployments/gpt-51-chat/...

WhatsApp:
https://wa.me/{phone}?text={encoded_message}

Instagram:
https://instagram.com/{username}
```

---

## 📅 TIMESTAMPS

### Formatos Usados
```typescript
// ISO (almacenamiento)
new Date().toISOString()
// "2025-01-03T06:30:00.000Z"

// Mes (asignaciones)
new Date().toISOString().slice(0, 7)
// "2025-01"

// Display Chile
new Date().toLocaleString('es-CL')
// "03-01-2025 03:30"

// Relative
"Hace 2 horas"
"Ayer"
"3 días atrás"
```

---

## ✅ DOCUMENTO COMPLETO

```
📄 MAPA_SITIO_PWA.md
├── 2,500+ líneas
├── 40+ secciones
├── 100% documentado
└── Actualizado: 3 Dic 2024 03:40 AM

🏆 Logros sesión: 16
🔥 Firebase: 8 colecciones sync
📱 PWA: Completa e instalable
🤖 IA: Azure GPT-5.1 integrado
```
