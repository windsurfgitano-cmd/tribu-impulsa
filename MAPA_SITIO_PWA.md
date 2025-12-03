# 🗺️ MAPA DEL SITIO - TRIBU IMPULSA PWA

**Última actualización:** 3 Dic 2024 02:30 AM

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
| Checklist | ⚠️ Revisar | Solo localStorage |

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
