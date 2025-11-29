# 🗺️ MAPA FUNCIONAL - TRIBU IMPULSA

> Arquitectura completa del sistema de cross-promotion para emprendedores

---

## 📊 ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     App.tsx (Router)                      │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │  │
│  │  │ Login   │ │Dashboard│ │ Tribu   │ │    Mi Perfil    │ │  │
│  │  │  View   │ │  View   │ │  View   │ │      View       │ │  │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────────┬────────┘ │  │
│  └───────┼──────────┼──────────┼────────────────┼───────────┘  │
│          │          │          │                │               │
│  ┌───────▼──────────▼──────────▼────────────────▼───────────┐  │
│  │                    CAPA DE SERVICIOS                      │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐ │  │
│  │  │firestoreService│  │  aiMatching    │  │  firebase   │ │  │
│  │  │    (Cloud)     │  │   Service      │  │   Service   │ │  │
│  │  └───────┬────────┘  └───────┬────────┘  └──────┬──────┘ │  │
│  └──────────┼───────────────────┼──────────────────┼────────┘  │
└─────────────┼───────────────────┼──────────────────┼────────────┘
              │                   │                  │
              ▼                   ▼                  ▼
┌─────────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Firebase Firestore │  │  Azure OpenAI   │  │  Firebase FCM   │
│   (Base de Datos)   │  │   (GPT-5.1)     │  │ (Notificaciones)│
└─────────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
Tribu Impulsa/
├── 📄 App.tsx                    # Componente principal + Router
├── 📄 index.html                 # HTML base
├── 📄 vite.config.ts             # Configuración Vite
├── 📄 tailwind.config.js         # Configuración Tailwind
│
├── 📂 components/
│   ├── GlassCard.tsx             # Card con efecto glass
│   └── WhatsAppFloat.tsx         # Botón flotante WhatsApp
│
├── 📂 services/
│   ├── firestoreService.ts       # 🔥 CRUD Firestore + Auth
│   ├── aiMatchingService.ts      # 🤖 Matching con GPT-5.1
│   ├── firebaseService.ts        # 📲 Push notifications
│   ├── databaseService.ts        # 💾 [LEGACY] localStorage
│   ├── matchService.ts           # 👥 Generación de matches
│   ├── tribeAlgorithm.ts         # 🔄 Algoritmo tribal
│   ├── realUsersData.ts          # 📋 Datos usuarios CSV
│   ├── dataPersistence.ts        # 💿 Backup/Export
│   └── seedFirestore.ts          # 🌱 Migración inicial
│
├── 📂 public/
│   ├── firebase-messaging-sw.js  # Service Worker FCM
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # Iconos PWA
│
├── 📂 types/
│   └── index.ts                  # TypeScript types
│
└── 📂 docs/
    ├── CHECKLIST_PRODUCCION.md   # Checklist de producción
    ├── MAPA_FUNCIONAL.md         # Este archivo
    ├── CREDENCIALES_GUIA.md      # Guía de credenciales
    └── Planymejoras.md           # Documentación general
```

---

## 🔐 FLUJO DE AUTENTICACIÓN

```
┌──────────────────────────────────────────────────────────────────┐
│                         FLUJO DE LOGIN                           │
└──────────────────────────────────────────────────────────────────┘

┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────┐
│ Usuario │────▶│ LoginView   │────▶│ Firebase    │────▶│Firestore│
│         │     │             │     │ Auth        │     │ Users   │
└─────────┘     └─────────────┘     └─────────────┘     └─────────┘
     │                │                   │                  │
     │    email/pass  │                   │                  │
     │───────────────▶│                   │                  │
     │                │ signInWithEmail() │                  │
     │                │──────────────────▶│                  │
     │                │                   │ Validar          │
     │                │                   │──────────────────▶
     │                │                   │                  │
     │                │                   │◀── userData ─────│
     │                │◀── userCredential─│                  │
     │◀── Dashboard ──│                   │                  │
     │                │                   │                  │

PRIMER LOGIN:
- Contraseña universal: TRIBU2026
- Al primer login, se pide cambiar contraseña
- Se marca firstLogin = false en Firestore
```

---

## 🔄 ALGORITMO DE ASIGNACIÓN TRIBAL

```
┌──────────────────────────────────────────────────────────────────┐
│                    ALGORITMO 10+10 TRIBAL                        │
└──────────────────────────────────────────────────────────────────┘

ENTRADA: Usuario A (categoría: Moda, afinidad: Diseño)

PASO 1: Obtener todos los usuarios activos
        └─▶ 23 usuarios disponibles

PASO 2: Filtrar al usuario actual
        └─▶ 22 candidatos

PASO 3: Calcular compatibilidad con cada candidato
        ┌─────────────────────────────────────────┐
        │ SCORING DE COMPATIBILIDAD:              │
        │                                         │
        │ [-50] Misma categoría exacta (competencia)│
        │ [+30] Afinidad coincide con categoría   │
        │ [+15] Misma ciudad                      │
        │ [+20] Randomización                     │
        └─────────────────────────────────────────┘

PASO 4: Ordenar por score
        └─▶ Top 20 candidatos

PASO 5: Dividir en 10+10
        ┌─────────────────────────────────────────┐
        │ toShare (Top 1-10):                     │
        │   Usuarios que YO debo promocionar      │
        │                                         │
        │ shareWithMe (Top 11-20):                │
        │   Usuarios que ME deben promocionar     │
        └─────────────────────────────────────────┘

PASO 6 (CON AI): Si Azure OpenAI está configurado
        ┌─────────────────────────────────────────┐
        │ GPT-5.1 analiza:                        │
        │ - Bios y descripciones de negocio       │
        │ - Sinergias semánticas no obvias        │
        │ - Potencial de colaboración real        │
        │                                         │
        │ Mejora el scoring básico con NLP        │
        └─────────────────────────────────────────┘

SALIDA: TribeAssignments {
          month: "2025-11"
          userId: "user_a_id"
          toShare: ["id1", "id2", ..., "id10"]
          shareWithMe: ["id11", "id12", ..., "id20"]
        }
```

---

## 📊 MODELO DE DATOS (Firestore)

```
┌──────────────────────────────────────────────────────────────────┐
│                    COLECCIONES FIRESTORE                         │
└──────────────────────────────────────────────────────────────────┘

📁 users/
├── {userId}
│   ├── id: string
│   ├── email: string
│   ├── name: string
│   ├── companyName: string
│   ├── phone: string
│   ├── whatsapp: string
│   ├── instagram: string
│   ├── website: string
│   ├── city: string
│   ├── category: string          # "Moda y Accesorios"
│   ├── affinity: string          # "Diseño y Estilo"
│   ├── bio: string
│   ├── businessDescription: string
│   ├── avatarUrl: string
│   ├── companyLogoUrl: string
│   ├── coverUrl: string
│   ├── followers: number
│   ├── status: "active" | "suspended" | "pending"
│   ├── role: "user" | "admin"
│   ├── fcmToken: string          # Para push notifications
│   ├── onboardingComplete: boolean
│   ├── firstLogin: boolean
│   ├── createdAt: Timestamp
│   ├── updatedAt: Timestamp
│   └── lastLoginAt: Timestamp

📁 assignments/
├── {assignmentId}
│   ├── id: string
│   ├── month: string             # "2025-11"
│   ├── userId: string
│   ├── toShare: string[]         # IDs de usuarios (10)
│   ├── shareWithMe: string[]     # IDs de usuarios (10)
│   ├── aiReasons: Record<string, string>  # Explicaciones AI
│   └── createdAt: Timestamp

📁 checklists/
├── {checklistId}
│   ├── id: string
│   ├── month: string
│   ├── userId: string
│   ├── toShare: Record<string, boolean>     # userId -> completed
│   ├── shareWithMe: Record<string, boolean>
│   └── updatedAt: Timestamp

📁 reports/
├── {reportId}
│   ├── id: string
│   ├── reporterId: string        # Quien reporta
│   ├── targetUserId: string      # Reportado
│   ├── reason: string
│   ├── note: string
│   ├── status: "pending" | "in_review" | "resolved" | "sanctioned" | "dismissed"
│   ├── adminNote: string
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp

📁 notifications/
├── {notificationId}
│   ├── id: string
│   ├── userId: string
│   ├── type: "welcome" | "reminder" | "report" | "assignment" | "system"
│   ├── title: string
│   ├── message: string
│   ├── read: boolean
│   └── createdAt: Timestamp

📁 config/
└── system
    ├── azureOpenAI: {
    │     endpoint: string
    │     apiKey: string
    │     model: string
    │   }
    ├── features: {
    │     aiMatchingEnabled: boolean
    │     pushNotificationsEnabled: boolean
    │   }
    └── updatedAt: Timestamp
```

---

## 🖥️ VISTAS Y COMPONENTES

```
┌──────────────────────────────────────────────────────────────────┐
│                         VISTAS (Routes)                          │
└──────────────────────────────────────────────────────────────────┘

/                    → LoginView
                       ├── Email input
                       ├── Password input
                       ├── Botón login
                       └── Redirect a /dashboard si autenticado

/dashboard           → DashboardView
                       ├── Saludo personalizado
                       ├── Stats rápidos
                       ├── Actividad reciente
                       └── Accesos rápidos

/tribe               → TribeAssignmentsView
                       ├── Lista "Yo Comparto" (10)
                       │   └── Checkbox para marcar completado
                       ├── Lista "Me Comparten" (10)
                       │   └── Checkbox para marcar completado
                       ├── Progreso visual
                       └── Botón "Reportar" por usuario

/profile             → MyProfileView
                       ├── Foto de perfil + cover
                       ├── Datos de empresa
                       ├── Botón editar
                       ├── Botón notificaciones push
                       └── Botón cerrar sesión

/profile/:id         → ProfileDetail (otros usuarios)
                       ├── Perfil completo
                       ├── Botón compartir en Instagram
                       ├── Botón compartir en WhatsApp
                       └── Links a redes

/admin               → AdminPanel (solo admins)
                       ├── Tab: Dashboard
                       │   ├── Stats generales
                       │   └── Gráficos
                       ├── Tab: Usuarios
                       │   ├── Lista de usuarios
                       │   └── Acciones por usuario
                       ├── Tab: Cumplimiento
                       │   ├── Tabla de cumplimiento
                       │   ├── Botón push masivo
                       │   └── Botón recordatorio
                       └── Tab: Reportes
                           ├── Lista de reportes
                           └── Acciones admin

/survey              → SurveyView (onboarding)
                       └── Wizard de 3 pasos
```

---

## 🔔 SISTEMA DE NOTIFICACIONES

```
┌──────────────────────────────────────────────────────────────────┐
│                    FLUJO DE NOTIFICACIONES                       │
└──────────────────────────────────────────────────────────────────┘

1. ACTIVACIÓN POR USUARIO:
   
   Usuario → "Activar Notificaciones" → requestPermission()
                                              │
                                              ▼
                                        FCM Token
                                              │
                                              ▼
                                   Guardar en Firestore
                                   users/{userId}.fcmToken

2. ENVÍO DESDE ADMIN:

   Admin → "Push Masivo" → Obtener todos los tokens
                                    │
                                    ▼
                           Para cada token:
                           POST a FCM API
                                    │
                                    ▼
                           Notificación en dispositivo

3. TRIGGERS AUTOMÁTICOS:

   ┌────────────────────────────────────────────────────┐
   │ Evento                  │ Notificación             │
   ├────────────────────────────────────────────────────┤
   │ Nuevo usuario           │ "¡Bienvenido a Tribu!"  │
   │ Nuevas asignaciones     │ "Tu tribu de Nov está"  │
   │ Mitad de mes            │ "¿Ya completaste 10+10?"│
   │ Fin de mes              │ "Último día para..."    │
   │ Reporte recibido        │ "Fuiste reportado"      │
   │ Reporte resuelto        │ "Tu reporte fue..."     │
   └────────────────────────────────────────────────────┘
```

---

## 🤖 INTEGRACIÓN AI (Azure OpenAI)

```
┌──────────────────────────────────────────────────────────────────┐
│                      FLUJO DE AI MATCHING                        │
└──────────────────────────────────────────────────────────────────┘

1. Verificar si AI está habilitado:
   config/system.features.aiMatchingEnabled === true

2. Obtener credenciales de Firestore:
   config/system.azureOpenAI.{endpoint, apiKey}

3. Preparar prompt con datos de usuarios:
   - Nombre, empresa, categoría
   - Bio, descripción de negocio
   - Ciudad, afinidad

4. Llamar a Azure OpenAI:
   POST {endpoint}
   Headers: { "api-key": apiKey }
   Body: {
     messages: [
       { role: "system", content: MATCHING_PROMPT },
       { role: "user", content: USERS_DATA }
     ]
   }

5. Parsear respuesta JSON:
   {
     "matches": [
       { "userId": "...", "score": 85, "reason": "...", "synergies": [...] }
     ],
     "insights": "Análisis general..."
   }

6. Guardar en assignments con aiReasons

FUNCIONES DISPONIBLES:
┌────────────────────────────────────────────────────────┐
│ getAIMatches()           → Matching inteligente        │
│ generateAITribeAssignments() → Generar 10+10 con AI   │
│ analyzeCompatibility()   → Score entre 2 usuarios     │
│ generateShareSuggestions() → Ideas de contenido       │
│ checkAIAvailability()    → Verificar conexión         │
└────────────────────────────────────────────────────────┘
```

---

## 📱 PWA (Progressive Web App)

```
┌──────────────────────────────────────────────────────────────────┐
│                        CONFIGURACIÓN PWA                         │
└──────────────────────────────────────────────────────────────────┘

manifest.json:
├── name: "Tribu Impulsa"
├── short_name: "Tribu"
├── start_url: "/"
├── display: "standalone"
├── theme_color: "#6161FF"
├── background_color: "#F5F7FB"
└── icons: [192x192, 512x512]

Service Worker (firebase-messaging-sw.js):
├── Push notifications en background
├── Cache de assets
└── Offline support

Meta tags (index.html):
├── apple-touch-icon
├── apple-mobile-web-app-capable
├── apple-mobile-web-app-status-bar-style
└── theme-color
```

---

## 🔒 REGLAS DE SEGURIDAD (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios: solo pueden leer/escribir su propio perfil
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Asignaciones: solo lectura del propio usuario
    match /assignments/{doc} {
      allow read: if request.auth != null 
                  && resource.data.userId == request.auth.uid;
      allow write: if false; // Solo desde backend
    }
    
    // Checklists: usuario propio
    match /checklists/{doc} {
      allow read, write: if request.auth != null 
                         && resource.data.userId == request.auth.uid;
    }
    
    // Reportes: crear cualquiera, leer solo admins
    match /reports/{doc} {
      allow create: if request.auth != null;
      allow read, update: if isAdmin();
    }
    
    // Notificaciones: usuario propio
    match /notifications/{doc} {
      allow read, update: if request.auth != null 
                          && resource.data.userId == request.auth.uid;
    }
    
    // Config: solo admins
    match /config/{doc} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 📈 FLUJO MENSUAL

```
┌──────────────────────────────────────────────────────────────────┐
│                     CICLO MENSUAL DE LA APP                      │
└──────────────────────────────────────────────────────────────────┘

DÍA 1 DEL MES:
├── Cloud Function ejecuta algoritmo tribal
├── Se generan asignaciones 10+10 para todos
├── Se envía push: "Tu nueva tribu está lista"
└── Usuarios ven nuevas asignaciones

DÍA 1-15:
├── Usuarios van compartiendo contenido
├── Marcan checkbox al completar
└── Admin monitorea cumplimiento

DÍA 15 (MITAD DE MES):
├── Push automático de recordatorio
├── Admin puede enviar recordatorio manual
└── Dashboard muestra progreso

DÍA 25-30:
├── Push de último recordatorio
├── Usuarios completan pendientes
└── Admin prepara para siguiente mes

FIN DE MES:
├── Se calculan estadísticas
├── Se identifican incumplidores
├── Se procesan reportes pendientes
└── Se prepara siguiente ciclo
```

---

## 🛠️ COMANDOS DE DESARROLLO

```bash
# Desarrollo
npm run dev           # Servidor local en http://localhost:5173

# Build
npm run build         # Genera /dist para producción

# Deploy
git push              # Auto-deploy en Vercel/Netlify

# Migración de datos
# En consola del navegador:
seedFirestore()       # Sube 23 usuarios a Firestore

# Configurar AI
# En consola del navegador:
configureAzureAI('endpoint', 'apiKey')
```

---

## 📊 MÉTRICAS Y KPIs

```
┌──────────────────────────────────────────────────────────────────┐
│                      MÉTRICAS DISPONIBLES                        │
└──────────────────────────────────────────────────────────────────┘

USUARIOS:
├── Total registrados
├── Activos este mes
├── Nuevos esta semana
└── Por categoría

CUMPLIMIENTO:
├── % promedio de cumplimiento
├── Usuarios excelentes (>80%)
├── Usuarios en riesgo (<30%)
└── Tendencia vs mes anterior

ENGAGEMENT:
├── Logins por día
├── Tiempo promedio en app
├── Acciones por usuario
└── Notificaciones enviadas/leídas

REPORTES:
├── Total reportes
├── Pendientes
├── Resueltos
└── Sanciones aplicadas
```

---

*Última actualización: 28-Nov-2025*
