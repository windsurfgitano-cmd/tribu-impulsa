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
