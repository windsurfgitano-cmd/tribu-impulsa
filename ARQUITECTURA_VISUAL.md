# 🎨 Arquitectura Visual - Tribu Impulsa PWA

## 📊 Diagramas Completos del Sistema

---

## 1. 🏗️ Arquitectura de Alto Nivel

```mermaid
graph TB
    subgraph Frontend[Frontend - React PWA]
        UI[Componentes UI]
        State[Estado React]
        Router[React Router]
        Cache[localStorage Cache]
    end
    
    subgraph Services[Servicios]
        Auth[authService]
        DB[databaseService]
        Firebase[firebaseService]
        Match[matchService]
        Tribe[tribeService]
    end
    
    subgraph Backend[Backend - Firebase]
        FAuth[Firebase Auth]
        Firestore[Firestore DB]
        FCM[Cloud Messaging]
        Functions[Cloud Functions]
    end
    
    subgraph External[Servicios Externos]
        Stripe[Stripe Payments]
        Azure[Azure OpenAI]
        Analytics[Google Analytics]
    end
    
    UI --> State
    State --> Router
    Router --> Services
    Services --> Cache
    
    Auth --> FAuth
    DB --> Firestore
    Firebase --> FCM
    Match --> Azure
    Tribe --> Firestore
    
    Services --> External
    
    FAuth -.Credenciales.-> Frontend
    Firestore -.Datos.-> Frontend
    FCM -.Notificaciones Push.-> Frontend
```

---

## 2. 🗂️ Estructura de Carpetas del Proyecto

```mermaid
graph LR
    Root[TribuImpulsa/]
    
    Root --> Prod[PRODUCCIÓN]
    Root --> Int[INTERNO]
    
    Prod --> Src[src/]
    Prod --> Comp[components/]
    Prod --> Screens[screens/]
    Prod --> Services[services/]
    Prod --> Public[public/]
    Prod --> Config[config files]
    
    Src --> Types[types.ts]
    Src --> Index[index.tsx]
    Src --> App[App.tsx]
    
    Comp --> Auth[auth/]
    Comp --> Layout[layout/]
    Comp --> Common[common/]
    Comp --> Profile[profile/]
    
    Screens --> AuthScreens[auth/]
    Screens --> Dashboard[dashboard/]
    Screens --> ProfileScreens[profile/]
    Screens --> Activity[activity/]
    Screens --> Tribe[tribe/]
    
    Services --> AuthService[authService.ts]
    Services --> DBService[databaseService.ts]
    Services --> FirebaseService[firebaseService.ts]
    Services --> MatchService[matchService.ts]
    
    Public --> Assets[assets/]
    Public --> Icons[icons/]
    Public --> Videos[videos/]
    Public --> Docs[docs/]
    
    Int --> Reuniones[reuniones/]
    Int --> Backups[backups/]
    Int --> Creds[credenciales/]
    Int --> Scripts[scripts-admin/]
    Int --> DocsInt[docs-internos/]
    
    style Int fill:#ff6b6b,stroke:#c92a2a,color:#fff
    style Prod fill:#51cf66,stroke:#2f9e44,color:#fff
```

---

## 3. 🔄 Flujo de Datos Completo

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as React UI
    participant L as localStorage
    participant S as Services
    participant FA as Firebase Auth
    participant FS as Firestore
    participant FCM as Cloud Messaging
    
    Note over U,FCM: REGISTRO DE USUARIO
    
    U->>UI: Ingresa datos registro
    UI->>S: registerNewUser(data)
    S->>FA: createUserWithEmailAndPassword()
    FA-->>S: userCredential (UID)
    S->>FS: setDoc(users/{uid}, profileData)
    S->>FS: updateDoc(system_stats/global, +1)
    S->>L: Guardar usuario en cache
    FS-->>S: Confirmación
    S-->>UI: Usuario creado
    UI-->>U: Redirigir a Dashboard
    
    Note over U,FCM: LOGIN DE USUARIO
    
    U->>UI: Ingresa email/password
    UI->>L: getUserByEmail(email)
    alt Usuario en cache
        L-->>UI: userData
    else Usuario NO en cache
        UI->>S: getUserFromFirebaseByEmail()
        S->>FS: getDocs(where email == ...)
        FS-->>S: userData
        S->>L: Sincronizar cache
        L-->>UI: userData
    end
    
    UI->>S: validateCredentials(email, password)
    S->>FA: signInWithEmailAndPassword()
    FA-->>S: userCredential
    S->>FS: getDoc(users/{uid})
    FS-->>S: Perfil completo
    S->>L: Actualizar cache
    S-->>UI: Login exitoso
    UI-->>U: Redirigir a Dashboard
    
    Note over U,FCM: ACTUALIZACIÓN DE PERFIL
    
    U->>UI: Edita perfil
    UI->>S: updateUser(uid, changes)
    S->>L: Actualizar localStorage
    S->>FS: setDoc(users/{uid}, data, {merge: true})
    FS-->>S: Confirmación
    S-->>UI: Perfil actualizado
    UI-->>U: Mostrar éxito
    
    Note over U,FCM: NOTIFICACIONES
    
    FS->>FCM: Evento trigger
    FCM->>UI: Push notification
    UI->>U: Mostrar notificación
    U->>UI: Click en notificación
    UI->>S: markNotificationAsRead(id)
    S->>FS: updateDoc(notifications/{id})
    UI->>UI: Navegar a contexto
```

---

## 4. 🧩 Diagrama de Componentes

```mermaid
graph TD
    App[App.tsx]
    
    App --> AppLayout[AppLayout]
    App --> Router[React Router]
    
    Router --> Login[LoginScreen]
    Router --> Register[RegisterScreen]
    Router --> Loading[SearchingScreen]
    Router --> Dashboard[Dashboard]
    Router --> Activity[ActivityView]
    Router --> Directory[DirectoryView]
    Router --> MyProfile[MyProfileView]
    Router --> ProfileDetail[ProfileDetail]
    Router --> Membership[MembershipScreen]
    Router --> Benefits[ClubBienestarView]
    Router --> Tribe[TribeAssignmentsView]
    
    AppLayout --> BottomNav[Bottom Navigation]
    AppLayout --> RallyCounter[Rally Counter]
    
    Dashboard --> StatsCard[Stats Card]
    Dashboard --> FeaturedProfile[Featured Profile]
    Dashboard --> ActivityFeed[Activity Feed Preview]
    Dashboard --> OnboardingModal[Onboarding Modal]
    
    Activity --> NotificationList[Notification List]
    Activity --> NotificationCard[Notification Card]
    
    Directory --> SearchBar[Search Bar]
    Directory --> FilterPanel[Filter Panel]
    Directory --> ProfileGrid[Profile Grid]
    Directory --> ProfileCard[Profile Card]
    
    MyProfile --> ProfileHeader[Profile Header]
    MyProfile --> BioSection[Bio Section]
    MyProfile --> SocialLinks[Social Links]
    MyProfile --> LocationInfo[Location Info]
    MyProfile --> EditModal[Edit Modal]
    MyProfile --> SettingsSection[Settings Section]
    
    ProfileDetail --> ProfileView[Profile View]
    ProfileDetail --> MatchAnalysis[Match Analysis]
    ProfileDetail --> ConnectButton[Connect Button]
    
    Tribe --> ProgressCard[Progress Card]
    Tribe --> TribeMemberGrid[Tribe Member Grid]
    Tribe --> TaskChecklist[Task Checklist]
    
    Membership --> PricingCards[Pricing Cards]
    Membership --> Testimonials[Testimonials]
    Membership --> FAQ[FAQ Section]
    
    Benefits --> BenefitCategories[Benefit Categories]
    Benefits --> BenefitCard[Benefit Card]
    Benefits --> ClaimModal[Claim Modal]
    
    style App fill:#228be6,stroke:#1971c2,color:#fff
    style AppLayout fill:#40c057,stroke:#2f9e44,color:#fff
    style Router fill:#fab005,stroke:#f59f00,color:#fff
```

---

## 5. 🗄️ Modelo de Datos Firestore

```mermaid
erDiagram
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ TRIBE_ASSIGNMENTS : "assigned to"
    USERS ||--o{ TRIBE_TASKS : completes
    USERS ||--o{ INTERACTIONS : "interacts with"
    SYSTEM_STATS ||--|| GLOBAL : "tracks"
    
    USERS {
        string id PK
        string email UK
        string password
        string name
        string companyName
        string category
        string affinity
        string scope
        string city
        string comuna
        array selectedRegions
        string bio
        string businessDescription
        string instagram
        string website
        string phone
        number revenue
        string avatarUrl
        string coverUrl
        boolean profileComplete
        timestamp createdAt
        timestamp updatedAt
    }
    
    NOTIFICATIONS {
        string id PK
        string userId FK
        string fromUserId FK
        string type
        string title
        string message
        boolean read
        boolean archived
        object metadata
        timestamp createdAt
    }
    
    TRIBE_ASSIGNMENTS {
        string id PK
        string userId FK
        string month
        array assignedUsers
        timestamp createdAt
        timestamp expiresAt
    }
    
    TRIBE_TASKS {
        string id PK
        string userId FK
        string targetUserId FK
        string taskType
        boolean completed
        number points
        timestamp completedAt
    }
    
    INTERACTIONS {
        string id PK
        string fromUserId FK
        string toUserId FK
        string type
        string status
        object metadata
        timestamp createdAt
    }
    
    SYSTEM_STATS {
        string id PK
        number profilesCompleted
        number membersActive
        number profilesTarget
        timestamp lastUpdated
    }
    
    GLOBAL {
        number profilesCompleted
        number membersActive
        number profilesTarget
    }
```

---

## 6. 🔐 Flujo de Autenticación y Permisos

```mermaid
graph TB
    Start[Usuario accede a ruta]
    
    Start --> CheckAuth{¿Autenticado?}
    
    CheckAuth -->|NO| Login[Redirigir a Login]
    CheckAuth -->|SÍ| CheckRoute{Tipo de ruta}
    
    CheckRoute -->|Pública| Allow[Permitir acceso]
    CheckRoute -->|Protegida| CheckProfile{¿Perfil completo?}
    CheckRoute -->|Premium| CheckMembership{¿Es miembro?}
    CheckRoute -->|Rally| CheckRally{¿Rally >= 1000?}
    
    CheckProfile -->|NO| CompleteProfile[Completar perfil]
    CheckProfile -->|SÍ| Allow
    
    CheckMembership -->|NO| Membership[Redirigir a Membership]
    CheckMembership -->|SÍ| Allow
    
    CheckRally -->|NO| Alert[Mostrar alert + Redirigir]
    CheckRally -->|SÍ| CheckMembership
    
    Login --> LoginForm[Formulario Login]
    LoginForm --> ValidateCredentials[Validar credenciales]
    ValidateCredentials -->|OK| SetSession[Establecer sesión]
    ValidateCredentials -->|ERROR| ShowError[Mostrar error]
    SetSession --> CheckProfile
    
    CompleteProfile --> UpdateProfile[Actualizar perfil]
    UpdateProfile --> SetComplete[Marcar completo]
    SetComplete --> Allow
    
    Membership --> SelectPlan[Seleccionar plan]
    SelectPlan --> ProcessPayment[Procesar pago]
    ProcessPayment --> UpdateMembership[Actualizar estado]
    UpdateMembership --> Allow
    
    Alert --> Dashboard[Dashboard]
    
    Allow --> RenderPage[Renderizar página]
    
    style Start fill:#228be6,stroke:#1971c2,color:#fff
    style Allow fill:#40c057,stroke:#2f9e44,color:#fff
    style Login fill:#fa5252,stroke:#e03131,color:#fff
    style Membership fill:#fab005,stroke:#f59f00,color:#fff
```

---

## 7. 📱 Flujo de Usuario Completo

```mermaid
journey
    title Viaje del Usuario en Tribu Impulsa
    section Descubrimiento
      Encuentra la app: 5: Usuario
      Abre la PWA: 5: Usuario
    section Registro
      Ve pantalla login: 4: Usuario
      Click "Crear cuenta": 5: Usuario
      Completa formulario (5 pasos): 3: Usuario
      Acepta términos: 4: Usuario
      Registro exitoso: 5: Usuario, Sistema
    section Onboarding
      Ve video loading: 4: Usuario
      Llega al dashboard: 5: Usuario
      Ve tutorial onboarding: 4: Usuario
      Explora interfaz: 5: Usuario
    section Exploración
      Ve perfil destacado: 5: Usuario
      Navega a Directory: 4: Usuario
      Filtra por categoría: 5: Usuario
      Ve perfil de otro usuario: 5: Usuario, Sistema
      Ve análisis de match: 4: Usuario
    section Interacción
      Envía mensaje: 4: Usuario, Sistema
      Recibe notificación: 5: Sistema, Usuario
      Ve actividad: 5: Usuario
      Conecta con emprendedor: 5: Usuario, Sistema
    section Conversión
      Ve beneficios bloqueados: 3: Usuario
      Click en "Probar por $1": 4: Usuario
      Ve página membership: 5: Usuario
      Selecciona trial: 5: Usuario
      Completa pago: 4: Usuario, Sistema
      Activa membresía: 5: Sistema
    section Uso Premium
      Accede a beneficios: 5: Usuario
      Ve análisis IA: 5: Usuario, Sistema
      Sin límite de perfiles: 5: Usuario
      Ve Rally llegar a 1000: 4: Usuario, Sistema
    section Mi Tribu
      Se desbloquea Mi Tribu: 5: Sistema, Usuario
      Ve 8 emprendedores asignados: 5: Usuario
      Completa tareas: 4: Usuario, Sistema
      Gana puntos: 5: Sistema, Usuario
      Colabora con tribu: 5: Usuario
    section Retención
      Recibe notificaciones: 5: Sistema, Usuario
      Nueva tribu cada mes: 4: Sistema, Usuario
      Renueva membresía: 5: Usuario, Sistema
      Sigue activo: 5: Usuario
```

---

## 8. 🔄 Ciclo de Vida de los Datos

```mermaid
stateDiagram-v2
    [*] --> LocalStorage: App inicia
    LocalStorage --> CheckCache: Verificar cache
    
    CheckCache --> UseCache: Cache válido
    CheckCache --> FetchFirebase: Cache vacío/viejo
    
    FetchFirebase --> Firestore: Obtener datos
    Firestore --> SyncLocal: Sincronizar
    SyncLocal --> LocalStorage: Actualizar cache
    
    UseCache --> ReactState: Cargar en estado
    LocalStorage --> ReactState: Cargar en estado
    
    ReactState --> UserInteraction: Usuario interactúa
    
    UserInteraction --> UpdateLocal: Cambio local
    UpdateLocal --> ReactState: Actualizar UI
    UpdateLocal --> QueueSync: Encolar sincronización
    
    QueueSync --> Firestore: Sincronizar a Firebase
    Firestore --> LocalStorage: Confirmar cambio
    
    LocalStorage --> [*]: App cierra
    
    note right of LocalStorage
        Cache offline-first
        Persistencia local
    end note
    
    note right of Firestore
        Source of truth
        Sincronización en tiempo real
    end note
    
    note right of ReactState
        Estado volátil
        Solo durante sesión
    end note
```

---

## 9. 🎯 Algoritmo de Matching

```mermaid
graph TD
    Start[Calcular Match entre User A y User B]
    
    Start --> InitScore[score = 0]
    
    InitScore --> CheckCategory{Categoría igual?}
    CheckCategory -->|SÍ| AddCat[score += 40]
    CheckCategory -->|NO| SkipCat[score += 0]
    
    AddCat --> CheckAffinity{Afinidad igual?}
    SkipCat --> CheckAffinity
    
    CheckAffinity -->|SÍ| AddAff[score += 30]
    CheckAffinity -->|NO| SkipAff[score += 0]
    
    AddAff --> CheckGeo{Alcance compatible?}
    SkipAff --> CheckGeo
    
    CheckGeo -->|SÍ| AddGeo[score += 20]
    CheckGeo -->|NO| SkipGeo[score += 0]
    
    AddGeo --> CheckRevenue{Facturación similar?}
    SkipGeo --> CheckRevenue
    
    CheckRevenue -->|SÍ| AddRev[score += 10]
    CheckRevenue -->|NO| SkipRev[score += 0]
    
    AddRev --> CalculateResult{score >= 80?}
    SkipRev --> CalculateResult
    
    CalculateResult -->|SÍ| Excellent[Match Excelente]
    CalculateResult -->|NO| CheckGood{score >= 60?}
    
    CheckGood -->|SÍ| Good[Match Bueno]
    CheckGood -->|NO| CheckModerate{score >= 40?}
    
    CheckModerate -->|SÍ| Moderate[Match Moderado]
    CheckModerate -->|NO| Low[Match Bajo]
    
    Excellent --> GenerateAnalysis[Generar análisis IA]
    Good --> GenerateAnalysis
    Moderate --> GenerateAnalysis
    Low --> GenerateAnalysis
    
    GenerateAnalysis --> SaveAnalysis[Guardar análisis]
    SaveAnalysis --> Return[Retornar resultado]
    
    Return --> End[Fin]
    
    style Start fill:#228be6,stroke:#1971c2,color:#fff
    style Excellent fill:#40c057,stroke:#2f9e44,color:#fff
    style Good fill:#51cf66,stroke:#37b24d,color:#fff
    style Moderate fill:#fab005,stroke:#f59f00,color:#fff
    style Low fill:#fa5252,stroke:#e03131,color:#fff
```

---

## 10. 🎨 Sistema de Diseño y Colores

```mermaid
graph LR
    subgraph Palette[Paleta de Colores Monday.com]
        Primary[Primary 6161FF]
        Secondary[Secondary 00CA72]
        Accent1[Accent FF6B6B]
        Accent2[Accent FFD93D]
        Neutral[Neutral 292F4C]
    end
    
    subgraph Typography[Tipografía]
        Font1[Heading: Poppins Bold]
        Font2[Body: Inter Regular]
        Font3[Caption: Inter Medium]
    end
    
    subgraph Components[Componentes Base]
        Button[Buttons]
        Card[Cards]
        Input[Inputs]
        Modal[Modals]
        Nav[Navigation]
    end
    
    Palette --> Components
    Typography --> Components
    
    Button --> BtnPrimary[Primary Button]
    Button --> BtnSecondary[Secondary Button]
    Button --> BtnGhost[Ghost Button]
    
    Card --> CardBase[Base Card]
    Card --> CardElevated[Elevated Card]
    Card --> CardGlass[Glass Card]
    
    Input --> InputText[Text Input]
    Input --> InputSelect[Select Input]
    Input --> InputCheckbox[Checkbox]
    
    style Primary fill:#6161FF,stroke:#4d4dcc,color:#fff
    style Secondary fill:#00CA72,stroke:#00a85d,color:#fff
    style Accent1 fill:#FF6B6B,stroke:#ff5252,color:#fff
    style Accent2 fill:#FFD93D,stroke:#ffc720,color:#000
    style Neutral fill:#292F4C,stroke:#1a1e33,color:#fff
```

---

## 11. 📊 Métricas y Analytics

```mermaid
graph TB
    subgraph UserActions[Acciones del Usuario]
        Register[Registro]
        Login[Login]
        ProfileView[Ver perfil]
        Connect[Conectar]
        Message[Enviar mensaje]
        UpgradeTrial[Upgrade a Trial]
        UpgradePremium[Upgrade a Premium]
        TaskComplete[Completar tarea Tribu]
    end
    
    subgraph Tracking[Sistema de Tracking]
        GA[Google Analytics]
        FB[Facebook Pixel]
        Custom[Custom Events]
    end
    
    subgraph Metrics[Métricas Clave]
        KPI1[Usuarios registrados]
        KPI2[Tasa de conversión]
        KPI3[Retention rate]
        KPI4[Rally progress]
        KPI5[Engagement score]
    end
    
    subgraph Dashboard[Dashboard Admin]
        Chart1[Gráfico registros/día]
        Chart2[Funnel de conversión]
        Chart3[User cohorts]
        Chart4[Revenue analytics]
    end
    
    UserActions --> Tracking
    Tracking --> Metrics
    Metrics --> Dashboard
    
    Register --> KPI1
    Login --> KPI3
    UpgradeTrial --> KPI2
    TaskComplete --> KPI5
    
    style UserActions fill:#51cf66,stroke:#2f9e44,color:#fff
    style Tracking fill:#fab005,stroke:#f59f00,color:#fff
    style Metrics fill:#228be6,stroke:#1971c2,color:#fff
    style Dashboard fill:#f06595,stroke:#e64980,color:#fff
```

---

## 12. 🚀 Pipeline de Despliegue

```mermaid
graph LR
    Dev[Desarrollo Local]
    Commit[Git Commit]
    Push[Git Push]
    
    subgraph GitHub[GitHub]
        Repo[Repositorio]
        Actions[GitHub Actions]
    end
    
    subgraph CI[CI/CD Pipeline]
        Build[Build Vite]
        Test[Run Tests]
        Lint[Lint Code]
    end
    
    subgraph Vercel[Vercel Platform]
        Deploy[Deploy Preview]
        Production[Production Deploy]
    end
    
    Dev --> Commit
    Commit --> Push
    Push --> Repo
    Repo --> Actions
    
    Actions --> Build
    Build --> Test
    Test --> Lint
    
    Lint -->|Branch| Deploy
    Lint -->|Main| Production
    
    Deploy --> Preview[Preview URL]
    Production --> Live[www.tribuimpulsa.cl]
    
    style Dev fill:#51cf66,stroke:#2f9e44,color:#fff
    style CI fill:#fab005,stroke:#f59f00,color:#fff
    style Vercel fill:#228be6,stroke:#1971c2,color:#fff
    style Live fill:#40c057,stroke:#2f9e44,color:#fff
```

---

## 13. 🔧 Stack Tecnológico

```mermaid
mindmap
  root((Tribu Impulsa))
    Frontend
      React 18
      TypeScript
      Vite
      Tailwind CSS v4
      React Router
    Backend
      Firebase Auth
      Firestore
      Cloud Functions
      Cloud Messaging
    Services
      Vercel Hosting
      Azure OpenAI
      Stripe Payments
      MercadoPago
    Tools
      Git GitHub
      VS Code
      Cursor AI
      Eruda Debug
    Testing
      Vitest
      React Testing Library
      Playwright E2E
```

---

## 14. 🎯 Roadmap de Features

```mermaid
timeline
    title Roadmap Tribu Impulsa 2025
    
    section v0.9.1 - Actual
        Sistema base completo : Rally 1000 : Matching básico : Membresía trial
    
    section v1.0.0 - Enero
        Lanzamiento oficial : Onboarding mejorado : Notificaciones push : Mi Tribu activada
    
    section v1.1.0 - Febrero
        Chat directo : Video llamadas : Eventos presenciales : Más beneficios
    
    section v1.2.0 - Marzo
        IA Matching avanzado : Recomendaciones personalizadas : Dashboard analytics : Badges y gamificación
    
    section v2.0.0 - Q2 2025
        App móvil nativa : Marketplace : Pagos integrados : API pública
```

---

## 15. 🌐 Arquitectura de Red

```mermaid
graph TB
    User[Usuario]
    
    subgraph CDN[Vercel Edge Network]
        Edge1[Edge Santiago]
        Edge2[Edge São Paulo]
        Edge3[Edge Global]
    end
    
    subgraph App[Application Layer]
        Static[Assets estáticos]
        HTML[HTML/CSS/JS]
        SW[Service Worker]
    end
    
    subgraph API[API Layer]
        REST[REST Endpoints]
        Webhooks[Webhooks]
    end
    
    subgraph Data[Data Layer]
        FireAuth[Firebase Auth us-east1]
        FireDB[Firestore southamerica-east1]
        Storage[Cloud Storage]
    end
    
    subgraph External[External APIs]
        Stripe[Stripe API]
        Azure[Azure OpenAI]
        Analytics[Google Analytics]
    end
    
    User -->|HTTPS| CDN
    CDN --> App
    App --> SW
    SW -->|Cache| App
    App --> API
    API --> Data
    API --> External
    
    FireAuth -.Replication.-> FireDB
    
    style User fill:#51cf66,stroke:#2f9e44,color:#fff
    style CDN fill:#228be6,stroke:#1971c2,color:#fff
    style App fill:#fab005,stroke:#f59f00,color:#fff
    style Data fill:#f06595,stroke:#e64980,color:#fff
```

---

**Documento creado:** Diciembre 2024  
**Versión:** v0.9.1  
**Autor:** Sistema de documentación Tribu Impulsa  
**Última actualización:** 25 Dic 2024

