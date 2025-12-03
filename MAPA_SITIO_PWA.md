# 🗺️ MAPA DEL SITIO - TRIBU IMPULSA PWA

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
/profile/:id         → ProfileDetail        (🔒 Solo miembros)
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
| Tribu | ⚠️ Revisar | Algoritmo local |
| Checklist | ⚠️ Revisar | Solo localStorage |
