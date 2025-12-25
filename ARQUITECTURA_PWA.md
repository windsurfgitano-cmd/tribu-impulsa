# 📱 Arquitectura Completa - Tribu Impulsa PWA

## 📋 Tabla de Contenidos

1. [Flujo Principal de Navegación](#flujo-principal-de-navegación)
2. [Páginas y Funcionalidades](#páginas-y-funcionalidades)
3. [Bottom Navigation](#bottom-navigation)
4. [Sistema de Datos y Sincronización](#sistema-de-datos-y-sincronización)
5. [Sistema de Permisos](#sistema-de-permisos)
6. [Métricas y Analytics](#métricas-y-analytics)

---

## 🎯 Flujo Principal de Navegación

```
┌─────────────┐
│ Login Screen│ (/)
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
   Usuario Nuevo    Usuario Existente
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│  Registro    │   │ Ingreso Pass │
└──────┬───────┘   └──────┬───────┘
       │                  │
       └────────┬─────────┘
                │
                ▼
        ┌───────────────┐
        │ Loading Video │ (/searching)
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │   Dashboard   │ (/dashboard)
        └───────┬───────┘
                │
    ┌───────────┼───────────┬────────────┐
    │           │           │            │
    ▼           ▼           ▼            ▼
Activity   Directory   Mi Perfil    Beneficios
(/activity) (/directory) (/my-profile) (/beneficios)
```

---

## 📄 Páginas y Funcionalidades

### 1️⃣ Login Screen

**Ruta:** `/`  
**Archivo:** `screens/auth/LoginScreen.tsx`

#### Función Principal
Punto de entrada de la aplicación. Maneja tanto login como registro de nuevos usuarios.

#### Elementos UI

| Elemento | Ubicación | Función | Detalles Técnicos |
|----------|-----------|---------|-------------------|
| **Logo** | Header | Marca visual + botón secreto | 5 clicks rápidos activa reset (contraseña: `TRIBU2026RESET`) |
| **Rally Counter** | Esquina superior | Muestra X/1000 perfiles | Listener en tiempo real a `system_stats/global` |
| **Campo Email** | Centro | Input para email | Validación en `onBlur` |
| **Botón "Continuar"** | Debajo del email | Verifica si email existe | Busca local → Firebase |
| **Link "Ya tengo cuenta"** | Inferior | Marca intención LOGIN | `setUserIntent('login')` |
| **Botón "Crear cuenta GRATIS"** | Inferior | Marca intención REGISTRO | `setUserIntent('register')` |

#### Flujo de Datos

```javascript
// 1. Usuario ingresa email
handleEmailCheck(email)
  ↓
// 2. Buscar usuario localmente
let user = getUserByEmail(email)
  ↓
// 3. Si no está local, buscar en Firebase
if (!user) {
  user = await getUserFromFirebaseByEmail(email)
}
  ↓
// 4. Lógica según intención
if (userIntent === 'login') {
  if (user) → Pedir contraseña
  else → Error "Email no registrado"
} else { // userIntent === 'register'
  if (user) → Error "Email ya existe"
  else → Mostrar formulario registro
}
```

#### Estados del Componente

```typescript
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [step, setStep] = useState<'initial' | 'password' | 'register'>('initial')
const [userIntent, setUserIntent] = useState<'login' | 'register'>('login')
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState('')
const [registerData, setRegisterData] = useState({...})
const [resetClicks, setResetClicks] = useState(0)
```

#### Funciones Principales

**`handleEmailCheck()`**
```javascript
// Verifica si email existe y determina siguiente paso
- Busca en localStorage
- Si no está, busca en Firestore
- Decide mostrar password o registro según userIntent
```

**`handleLogin()`**
```javascript
// Proceso de login
- Valida password con Firebase Authentication
- Obtiene perfil completo de Firestore
- Sincroniza a localStorage
- Establece sesión
- Redirige a SearchingScreen
```

**`handleRegister()`**
```javascript
// Proceso de registro
- Valida TODOS los campos
- Valida email único (Auth + Firestore)
- Crea usuario en Firebase Auth
- Guarda perfil en Firestore
- Incrementa contador Rally
- Guarda en localStorage
- Redirige a SearchingScreen
```

**`handleLogoClick()`**
```javascript
// Botón secreto de reset
- Contador de 5 clicks
- Pide contraseña TRIBU2026RESET
- Limpia: localStorage + sessionStorage + contador Firebase
- Recarga la app
```

#### Validaciones Geográficas

```javascript
NACIONAL:
  - No requiere campos adicionales
  - Mensaje: "Harás match con emprendedores de todo Chile"

REGIONAL:
  - Requiere: selectedRegions[] (checkboxes)
  - Validación: al menos 1 región
  - No requiere comuna

LOCAL:
  - Requiere: region (dropdown) → comuna (dropdown cascada)
  - Validación: ambos obligatorios
  - Comuna se filtra según región seleccionada
```

#### Auto-formateo de Campos

```javascript
// Instagram
onBlur={(e) => {
  let value = e.target.value.trim()
  if (value && !value.startsWith('@')) {
    value = '@' + value
  }
  setRegisterData({...registerData, instagram: value})
}}

// Teléfono
onBlur={(e) => {
  let value = e.target.value.trim().replace(/\s/g, '')
  if (value && !value.startsWith('+569')) {
    value = '+569' + value
  }
  setRegisterData({...registerData, phone: value})
}}

// Website
onBlur={(e) => {
  let value = e.target.value.trim()
  if (value && !value.startsWith('http')) {
    value = 'https://' + value
  }
  setRegisterData({...registerData, website: value})
}}
```

#### Conexiones

- ✅ Login exitoso → `/searching` → `/dashboard`
- ✅ Registro exitoso → `/searching` → `/dashboard`
- ❌ Error de autenticación → Permanece en `/` con mensaje

---

### 2️⃣ Searching Screen (Loading)

**Ruta:** `/searching`  
**Archivo:** `screens/loading/SearchingScreen.tsx`

#### Función Principal
Pantalla de transición con video mientras se prepara el dashboard.

#### Elementos UI

| Elemento | Función | Duración |
|----------|---------|----------|
| **Video Background** | `newtribuloading.mp4` | Loop |
| **Mensaje** | "Buscando tu Tribu ideal..." | Estático |
| **Progress Spinner** | Indicador visual | Animado |

#### Configuración

```javascript
const LOADING_DURATION = 3000 // 3 segundos

useEffect(() => {
  const timer = setTimeout(() => {
    navigate('/dashboard')
  }, LOADING_DURATION)
  
  return () => clearTimeout(timer)
}, [])
```

#### Conexiones

- ← Desde: Login exitoso, Registro completo
- → Hacia: Dashboard (automático después de 3s)

---

### 3️⃣ Dashboard (Inicio)

**Ruta:** `/dashboard`  
**Archivo:** `screens/dashboard/Dashboard.tsx`

#### Función Principal
Hub central de la aplicación. Primera pantalla post-login.

#### Secciones

**Header del Usuario**
```javascript
<div className="profile-header">
  <Avatar src={currentUser.avatarUrl} />
  <h2>{currentUser.name}</h2>
  <p>{currentUser.companyName}</p>
</div>
```

**Stats Card**
```javascript
<div className="stats-grid">
  <Stat icon={Users} value={currentUser.followers} label="Seguidores" />
  <Stat icon={Eye} value={profilesViewed} label="Vistos" />
  <Stat icon={MessageCircle} value={interactions} label="Interacciones" />
</div>
```

**Perfil Destacado**
```javascript
// Algoritmo de matching
const compatibleUsers = getCompatibleUsers(currentUser)
const featured = compatibleUsers[0]

<ProfileCard 
  user={featured}
  matchPercentage={calculateMatch(currentUser, featured)}
  onClick={() => navigate(`/profile/${featured.id}`)}
/>
```

**Feed de Actividad (Preview)**
```javascript
const recentNotifications = getNotifications(currentUser.id).slice(0, 5)

<div className="activity-feed">
  {recentNotifications.map(notif => (
    <NotificationItem key={notif.id} notification={notif} />
  ))}
  <Button onClick={() => navigate('/activity')}>Ver todas</Button>
</div>
```

#### Onboarding Modal

```javascript
// Se muestra SOLO la primera vez
const [showOnboarding, setShowOnboarding] = useState(() => {
  if (!currentUser) return false
  return !isOnboardingComplete(currentUser.id)
})

// Al cerrar el modal
const handleCloseOnboarding = () => {
  markOnboardingComplete(currentUser.id)
  setShowOnboarding(false)
}

// Almacenamiento
localStorage.setItem(`onboarding_complete_${userId}`, 'true')
```

**Contenido del Onboarding:**
1. Bienvenida a Tribu Impulsa
2. Cómo funciona el matching
3. Explicación de Mi Tribu
4. Cómo conectar con otros emprendedores
5. Rally de 1000 perfiles

#### Funciones Principales

**`loadDashboardData()`**
```javascript
// Carga datos iniciales
- Perfil del usuario actual
- Usuarios compatibles para destacado
- Últimas 5 notificaciones
- Stats del usuario
```

**`calculateMatch(user1, user2)`**
```javascript
// Algoritmo de compatibilidad
let score = 0

// Categoría (40%)
if (user1.category === user2.category) score += 40

// Afinidad (30%)
if (user1.affinity === user2.affinity) score += 30

// Alcance geográfico (20%)
if (hasGeographicOverlap(user1, user2)) score += 20

// Facturación similar (10%)
if (similarRevenue(user1, user2)) score += 10

return score
```

#### Conexiones

- → `/profile/:id` (click en perfil destacado)
- → `/activity` (click en "Ver todas")
- → Otras vías Bottom Nav

---

### 4️⃣ Activity View (Actividad)

**Ruta:** `/activity`  
**Archivo:** `screens/activity/ActivityView.tsx`

#### Función Principal
Centro de notificaciones y actividad del usuario.

#### Tipos de Notificaciones

```typescript
type NotificationType = 
  | 'welcome'          // Bienvenida al registrarse
  | 'match'            // Match con otro usuario
  | 'interaction'      // Alguien vio tu perfil
  | 'tribe_assigned'   // Nueva Tribu asignada
  | 'message'          // Mensaje recibido (futuro)
  | 'system'           // Notificaciones del sistema
```

#### Estructura de Notificación

```typescript
interface Notification {
  id: string
  userId: string           // Receptor
  fromUserId?: string      // Emisor (si aplica)
  type: NotificationType
  title: string
  message: string
  read: boolean
  archived: boolean
  createdAt: string
  metadata?: {
    profileId?: string
    matchScore?: number
    actionUrl?: string
  }
}
```

#### Elementos UI

**Header con Tabs**
```javascript
<div className="tabs">
  <Tab active={filter === 'all'} onClick={() => setFilter('all')}>
    Todas ({allCount})
  </Tab>
  <Tab active={filter === 'unread'} onClick={() => setFilter('unread')}>
    No leídas ({unreadCount})
  </Tab>
</div>
```

**Lista de Notificaciones**
```javascript
{filteredNotifications.map(notif => (
  <NotificationCard
    key={notif.id}
    notification={notif}
    onClick={() => handleNotificationClick(notif)}
    onArchive={() => handleArchive(notif.id)}
  />
))}
```

**Card de Notificación**
```javascript
<div className={`notification-card ${!notif.read ? 'unread' : ''}`}>
  <Avatar src={fromUser?.avatarUrl} />
  <div className="content">
    <h4>{notif.title}</h4>
    <p>{notif.message}</p>
    <span className="time">{formatRelativeTime(notif.createdAt)}</span>
  </div>
  <Button onClick={onArchive}>Archivar</Button>
</div>
```

#### Funciones Principales

**`handleNotificationClick(notif)`**
```javascript
// Marca como leída
markNotificationAsRead(notif.id)

// Navega según tipo
switch(notif.type) {
  case 'match':
    navigate(`/profile/${notif.metadata.profileId}`)
    break
  case 'tribe_assigned':
    navigate('/tribe')
    break
  case 'interaction':
    navigate(`/profile/${notif.fromUserId}`)
    break
  default:
    // Solo marcar como leída
}
```

**`handleArchive(notifId)`**
```javascript
// NO elimina, solo archiva
updateNotification(notifId, { archived: true })
// Remueve de la vista actual
setNotifications(prev => prev.filter(n => n.id !== notifId))
```

#### Sincronización

```javascript
useEffect(() => {
  // Sincronizar notificaciones desde Firebase
  syncNotificationsFromFirebase(currentUser.id)
  
  // Listener en tiempo real (opcional)
  const unsubscribe = onSnapshot(
    collection(db, 'notifications'),
    query => where('userId', '==', currentUser.id),
    (snapshot) => {
      const newNotifs = snapshot.docs.map(doc => doc.data())
      setNotifications(newNotifs)
    }
  )
  
  return () => unsubscribe()
}, [])
```

#### Conexiones

- ← Accesible desde Dashboard y Bottom Nav
- → `/profile/:id` (click en notificación de match/interacción)
- → `/tribe` (notificación de tribu asignada)

---

### 5️⃣ Mi Perfil

**Ruta:** `/my-profile`  
**Archivo:** `screens/profile/MyProfileView.tsx`

#### Función Principal
Vista y edición del perfil del usuario actual + configuración de cuenta.

#### Secciones

**1. Header Visual**
```javascript
<div className="profile-header">
  <img src={currentUser.coverUrl} className="cover" />
  <img src={currentUser.avatarUrl} className="avatar" />
  <h1>{currentUser.name}</h1>
  <p className="subtitle">{capitalizeFirstLetter(currentUser.businessDescription)}</p>
</div>
```

**2. Bio y Categorías**
```javascript
<div className="bio-section">
  <p>{currentUser.bio}</p>
  <div className="tags">
    <Tag>{currentUser.category}</Tag>
    <Tag>{currentUser.affinity}</Tag>
  </div>
</div>
```

**3. Redes Sociales**
```javascript
<div className="social-links">
  {currentUser.instagram && (
    <SocialButton href={currentUser.instagram} icon={Instagram} />
  )}
  {currentUser.website && (
    <SocialButton href={currentUser.website} icon={Globe} />
  )}
  {currentUser.tiktok && (
    <SocialButton href={currentUser.tiktok} icon={Music} />
  )}
</div>
```

**4. Alcance Geográfico**
```javascript
<div className="location-section">
  <h3>Alcance del Servicio</h3>
  <p className="scope">{currentUser.scope}</p>
  
  {currentUser.scope === 'REGIONAL' && (
    <div className="regions">
      {currentUser.selectedRegions.map(region => (
        <Chip key={region}>{region}</Chip>
      ))}
    </div>
  )}
  
  {currentUser.scope === 'LOCAL' && (
    <p className="location">
      {currentUser.city} - {currentUser.comuna}
    </p>
  )}
</div>
```

**5. Facturación**
```javascript
<div className="revenue-section">
  <h3>Facturación Mensual</h3>
  <p>{formatRevenue(currentUser.revenue)}</p>
</div>
```

**6. Estado de Membresía**
```javascript
<div className="membership-section">
  <h3>Membresía</h3>
  {!isMember ? (
    <>
      <p>Plan: Gratuito</p>
      <Button onClick={() => navigate('/membership')}>
        ¡Probar por $1 Peso!
      </Button>
    </>
  ) : (
    <>
      <p>Plan: {membershipType}</p>
      <p className="status">✅ Activo</p>
    </>
  )}
</div>
```

**7. Match Analysis (Solo Miembros)**
```javascript
{isMember && (
  <div className="match-analysis">
    <h3>Análisis de Compatibilidad</h3>
    <p>Análisis basado en IA de tus mejores matches</p>
    {/* Análisis generado con Azure OpenAI o fallback local */}
  </div>
)}
```

**8. Ajustes y Configuración**
```javascript
<div className="settings-section">
  <SettingItem 
    icon={Bell} 
    label="Notificaciones" 
    value={notificationsEnabled ? 'Activadas' : 'Desactivadas'}
  />
  <SettingItem 
    icon={FileText} 
    label="Términos y Condiciones" 
    onClick={() => setShowTerms(true)}
  />
  <SettingItem 
    icon={Shield} 
    label="Política de Privacidad" 
    onClick={() => setShowPrivacy(true)}
  />
  <Button 
    variant="danger" 
    onClick={handleLogout}
    icon={LogOut}
  >
    Cerrar Sesión
  </Button>
</div>
```

#### Modal de Edición

**Campos Editables**
```javascript
const [editData, setEditData] = useState({
  name: currentUser.name,
  companyName: currentUser.companyName,
  bio: currentUser.bio,
  businessDescription: currentUser.businessDescription,
  instagram: currentUser.instagram,
  facebook: currentUser.facebook,
  tiktok: currentUser.tiktok,
  website: currentUser.website,
  phone: currentUser.phone,
  category: currentUser.category,
  affinity: currentUser.affinity,
  scope: currentUser.scope,
  city: currentUser.city,
  comuna: currentUser.comuna,
  selectedRegions: currentUser.selectedRegions,
  revenue: currentUser.revenue
})
```

**Proceso de Guardado**
```javascript
const handleSaveProfile = async () => {
  try {
    // 1. Validar campos
    if (editData.bio.length < 50) {
      setError('Biografía muy corta (mín. 50 caracteres)')
      return
    }
    
    // 2. Guardar en localStorage
    updateUser(currentUser.id, editData)
    
    // 3. Sincronizar a Firestore
    const { doc, setDoc } = await import('firebase/firestore')
    await setDoc(doc(db, 'users', currentUser.id), {
      ...editData,
      updatedAt: new Date().toISOString()
    }, { merge: true })
    
    // 4. Actualizar estado local
    setCurrentUser({...currentUser, ...editData})
    
    // 5. Cerrar modal
    setShowEditModal(false)
    
    alert('✅ Perfil actualizado correctamente')
  } catch (error) {
    console.error('Error guardando perfil:', error)
    alert('❌ Error al guardar. Intenta de nuevo.')
  }
}
```

#### Función de Logout

```javascript
const handleLogout = () => {
  console.log('🚪 Cerrando sesión...')
  
  try {
    // 1. Limpiar sesión almacenada
    clearStoredSession()
    
    // 2. Limpiar storage
    localStorage.removeItem('tribu_session')
    localStorage.removeItem('tribu_current_user')
    localStorage.removeItem('tribu_onboarding_completed')
    
    // 3. Limpiar flags de onboarding
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('onboarding_complete_')) {
        localStorage.removeItem(key)
      }
    })
    
    // 4. Limpiar sessionStorage
    sessionStorage.clear()
    
    console.log('✅ Sesión limpiada, redirigiendo...')
    
    // 5. Redirigir con pequeño delay
    setTimeout(() => {
      window.location.href = '/'
    }, 100)
    
  } catch (error) {
    console.error('❌ Error cerrando sesión:', error)
    // Forzar redirect de todas formas
    window.location.href = '/'
  }
}
```

#### Conexiones

- → `/membership` (botón "Probar por $1")
- → `/` (después de logout)
- ← Accesible desde Bottom Nav

---

### 6️⃣ Profile Detail (Vista de Otro Usuario)

**Ruta:** `/profile/:userId`  
**Archivo:** `screens/profile/ProfileDetail.tsx`

#### Función Principal
Vista detallada de otro usuario (NO editable).

#### Diferencias con Mi Perfil

```javascript
// Mi Perfil
- Editable ✅
- Botón "Editar Perfil" ✅
- Botón "Cerrar Sesión" ✅
- Sección de Ajustes ✅

// Profile Detail
- Solo lectura ❌
- Botón "Volver" ✅
- Botón "Conectar" (futuro) ✅
- Match Analysis visible ✅
```

#### Sección Match Analysis

```javascript
const MatchAnalysisSection = ({ targetUser, currentUser }) => {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadAnalysis = async () => {
      // 1. Buscar análisis guardado
      const cached = getStoredAnalysis(currentUser.id, targetUser.id)
      if (cached) {
        setAnalysis(cached)
        setLoading(false)
        return
      }
      
      // 2. Generar nuevo análisis
      const newAnalysis = await generateSmartAnalysis(currentUser, targetUser)
      
      // 3. Guardar para futuras visitas
      saveAnalysis(currentUser.id, targetUser.id, newAnalysis)
      
      setAnalysis(newAnalysis)
      setLoading(false)
    }
    
    loadAnalysis()
  }, [targetUser.id])
  
  return (
    <div className="match-analysis">
      <h3>Análisis de Compatibilidad</h3>
      <div className="score">{analysis.matchScore}%</div>
      
      <div className="strengths">
        <h4>Fortalezas del Match</h4>
        {analysis.strengths.map(strength => (
          <div key={strength} className="strength-item">
            ✓ {strength}
          </div>
        ))}
      </div>
      
      <div className="opportunities">
        <h4>Oportunidades de Colaboración</h4>
        {analysis.opportunities.map(opp => (
          <div key={opp} className="opportunity-item">
            💡 {opp}
          </div>
        ))}
      </div>
      
      <div className="recommendations">
        <h4>Recomendaciones</h4>
        <p>{analysis.recommendation}</p>
      </div>
    </div>
  )
}
```

#### Algoritmo de Match

```javascript
const generateSmartAnalysis = async (user1, user2) => {
  let score = 0
  const strengths = []
  const opportunities = []
  
  // Categoría (40 puntos)
  if (user1.category === user2.category) {
    score += 40
    strengths.push('Mismo giro empresarial')
  } else {
    opportunities.push(`Colaboración cross-industry: ${user1.category} + ${user2.category}`)
  }
  
  // Afinidad (30 puntos)
  if (user1.affinity === user2.affinity) {
    score += 30
    strengths.push('Valores y enfoque similares')
  }
  
  // Alcance geográfico (20 puntos)
  const hasGeoOverlap = checkGeographicOverlap(user1, user2)
  if (hasGeoOverlap) {
    score += 20
    strengths.push('Alcance geográfico compatible')
  } else {
    opportunities.push('Expandir alcance geográfico mutuamente')
  }
  
  // Facturación (10 puntos)
  const similarRevenue = checkSimilarRevenue(user1, user2)
  if (similarRevenue) {
    score += 10
    strengths.push('Nivel de facturación similar')
  }
  
  // Generar recomendación
  let recommendation = ''
  if (score >= 80) {
    recommendation = '¡Match excelente! Alta probabilidad de colaboración exitosa.'
  } else if (score >= 60) {
    recommendation = 'Buen match. Explora oportunidades de colaboración.'
  } else if (score >= 40) {
    recommendation = 'Match moderado. Considera áreas complementarias.'
  } else {
    recommendation = 'Match bajo. Mejor explorar otros perfiles.'
  }
  
  return { score, strengths, opportunities, recommendation }
}
```

#### Conexiones

- ← Desde Dashboard (perfil destacado)
- ← Desde Directory (click en card)
- ← Desde Activity (notificación de match)
- → Botón "Volver" (history.back())

---

### 7️⃣ Directory View (Directorio)

**Ruta:** `/directory`  
**Archivo:** `screens/directory/DirectoryView.tsx`

#### Función Principal
Exploración y búsqueda de todos los emprendedores registrados.

#### Elementos UI

**Search Bar**
```javascript
<div className="search-bar">
  <SearchIcon />
  <input
    type="text"
    placeholder="Buscar por nombre o empresa..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>
```

**Filtros**
```javascript
<div className="filters">
  <FilterGroup title="Categoría">
    {TRIBE_CATEGORY_OPTIONS.map(cat => (
      <Checkbox
        key={cat}
        label={cat}
        checked={selectedCategories.includes(cat)}
        onChange={() => toggleCategory(cat)}
      />
    ))}
  </FilterGroup>
  
  <FilterGroup title="Alcance">
    {['NACIONAL', 'REGIONAL', 'LOCAL'].map(scope => (
      <Checkbox
        key={scope}
        label={scope}
        checked={selectedScopes.includes(scope)}
        onChange={() => toggleScope(scope)}
      />
    ))}
  </FilterGroup>
  
  <FilterGroup title="Región">
    {REGIONES_CHILE.map(region => (
      <Checkbox
        key={region}
        label={region}
        checked={selectedRegions.includes(region)}
        onChange={() => toggleRegion(region)}
      />
    ))}
  </FilterGroup>
  
  <Button onClick={clearFilters}>Limpiar Filtros</Button>
</div>
```

**Grid de Perfiles**
```javascript
<div className="profiles-grid">
  {filteredUsers.map(user => (
    <ProfileCard
      key={user.id}
      user={user}
      matchPercentage={isMember ? calculateMatch(currentUser, user) : null}
      onClick={() => navigate(`/profile/${user.id}`)}
    />
  ))}
</div>
```

#### Lógica de Filtrado

```javascript
const filteredUsers = useMemo(() => {
  let results = allUsers
  
  // 1. Excluir usuario actual
  results = results.filter(u => u.id !== currentUser.id)
  
  // 2. Búsqueda por texto
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    results = results.filter(u => 
      u.name.toLowerCase().includes(query) ||
      u.companyName.toLowerCase().includes(query)
    )
  }
  
  // 3. Filtro por categoría
  if (selectedCategories.length > 0) {
    results = results.filter(u => 
      selectedCategories.includes(u.category)
    )
  }
  
  // 4. Filtro por alcance
  if (selectedScopes.length > 0) {
    results = results.filter(u => 
      selectedScopes.includes(u.scope)
    )
  }
  
  // 5. Filtro por región
  if (selectedRegions.length > 0) {
    results = results.filter(u => {
      if (u.scope === 'NACIONAL') return true
      if (u.scope === 'REGIONAL') {
        return u.selectedRegions.some(r => selectedRegions.includes(r))
      }
      if (u.scope === 'LOCAL') {
        return selectedRegions.includes(u.city)
      }
      return false
    })
  }
  
  // 6. Ordenar por match score (si es miembro)
  if (isMember) {
    results.sort((a, b) => {
      const scoreA = calculateMatch(currentUser, a)
      const scoreB = calculateMatch(currentUser, b)
      return scoreB - scoreA
    })
  } else {
    // Orden alfabético
    results.sort((a, b) => a.name.localeCompare(b.name))
  }
  
  return results
}, [searchQuery, selectedCategories, selectedScopes, selectedRegions, allUsers])
```

#### Profile Card Component

```javascript
const ProfileCard = ({ user, matchPercentage, onClick }) => (
  <div className="profile-card" onClick={onClick}>
    <img src={user.avatarUrl} alt={user.name} className="avatar" />
    
    {matchPercentage !== null && (
      <div className="match-badge">{matchPercentage}%</div>
    )}
    
    <h3>{user.name}</h3>
    <p className="company">{user.companyName}</p>
    
    <div className="tags">
      <Tag>{user.category}</Tag>
      <Tag>{user.scope}</Tag>
    </div>
    
    <div className="location">
      📍 {getLocationString(user)}
    </div>
  </div>
)
```

#### Funciones Auxiliares

```javascript
const getLocationString = (user) => {
  switch(user.scope) {
    case 'NACIONAL':
      return 'Chile'
    case 'REGIONAL':
      return user.selectedRegions.join(', ')
    case 'LOCAL':
      return `${user.city}, ${user.comuna}`
    default:
      return 'No especificado'
  }
}

const toggleCategory = (category) => {
  setSelectedCategories(prev => 
    prev.includes(category)
      ? prev.filter(c => c !== category)
      : [...prev, category]
  )
}

const clearFilters = () => {
  setSearchQuery('')
  setSelectedCategories([])
  setSelectedScopes([])
  setSelectedRegions([])
}
```

#### Conexiones

- → `/profile/:id` (click en cualquier card)
- ← Accesible desde Bottom Nav

---

### 8️⃣ Club Bienestar (Beneficios)

**Ruta:** `/beneficios`  
**Archivo:** `screens/benefits/ClubBienestarView.tsx`

#### Función Principal
Beneficios exclusivos para miembros Premium.

#### Restricción de Acceso

```javascript
useEffect(() => {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    navigate('/')
    return
  }
  
  const status = localStorage.getItem(`membership_status_${currentUser.id}`)
  const isMember = status === 'miembro' || status === 'admin' || status === 'trial'
  
  if (!isMember) {
    navigate('/membership')
  }
}, [])
```

#### Categorías de Beneficios

```javascript
const benefitCategories = [
  {
    id: 'discounts',
    title: 'Descuentos Exclusivos',
    icon: Tag,
    benefits: [
      {
        id: 'hosting',
        provider: 'Hostinger',
        discount: '30% OFF',
        description: 'Hosting web premium',
        code: 'TRIBU30'
      },
      {
        id: 'adobe',
        provider: 'Adobe Creative Cloud',
        discount: '20% OFF',
        description: 'Suite completa de diseño',
        code: 'TRIBUADOBE'
      }
      // ... más descuentos
    ]
  },
  {
    id: 'workshops',
    title: 'Talleres Exclusivos',
    icon: Users,
    benefits: [
      {
        id: 'marketing',
        title: 'Marketing Digital Avanzado',
        date: '2025-02-15',
        duration: '2 horas',
        instructor: 'María González'
      }
      // ... más talleres
    ]
  },
  {
    id: 'networking',
    title: 'Eventos de Networking',
    icon: Calendar,
    benefits: [
      {
        id: 'meetup-feb',
        title: 'Meetup Mensual Febrero',
        date: '2025-02-20',
        location: 'Santiago Centro',
        attendees: 50
      }
      // ... más eventos
    ]
  },
  {
    id: 'resources',
    title: 'Recursos Descargables',
    icon: Download,
    benefits: [
      {
        id: 'templates',
        title: 'Pack de Plantillas',
        description: 'Contratos, facturas, propuestas',
        format: 'PDF + DOCX'
      }
      // ... más recursos
    ]
  }
]
```

#### UI de Beneficios

```javascript
<div className="benefits-container">
  {benefitCategories.map(category => (
    <div key={category.id} className="benefit-category">
      <h2>
        <category.icon /> {category.title}
      </h2>
      
      <div className="benefits-grid">
        {category.benefits.map(benefit => (
          <BenefitCard
            key={benefit.id}
            benefit={benefit}
            onClaim={() => handleClaimBenefit(benefit)}
          />
        ))}
      </div>
    </div>
  ))}
</div>
```

#### Claim de Beneficios

```javascript
const handleClaimBenefit = (benefit) => {
  // Modal con código/detalles
  setBenefitModal({
    open: true,
    benefit: benefit
  })
  
  // Registrar uso (analytics)
  trackBenefitClaim(currentUser.id, benefit.id)
}

// Modal
{benefitModal.open && (
  <Modal onClose={() => setBenefitModal({ open: false })}>
    <h3>{benefitModal.benefit.title}</h3>
    <p>{benefitModal.benefit.description}</p>
    
    {benefitModal.benefit.code && (
      <div className="code-box">
        <p>Código de descuento:</p>
        <code>{benefitModal.benefit.code}</code>
        <Button onClick={() => copyToClipboard(benefitModal.benefit.code)}>
          Copiar Código
        </Button>
      </div>
    )}
    
    {benefitModal.benefit.url && (
      <Button href={benefitModal.benefit.url} target="_blank">
        Ir al Sitio
      </Button>
    )}
  </Modal>
)}
```

#### Conexiones

- ← Solo accesible desde Bottom Nav si es miembro
- → `/membership` (si NO es miembro, redirect automático)

---

### 9️⃣ Mi Tribu

**Ruta:** `/tribe`  
**Archivo:** `screens/tribe/TribeAssignmentsView.tsx`

#### Función Principal
Sistema de 8 emprendedores asignados para impulsar mutuamente.

#### Doble Restricción

```javascript
useEffect(() => {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    navigate('/')
    return
  }
  
  // 1. Verificar Rally >= 1000
  if (globalProgress < 1000) {
    alert('Mi Tribu se desbloqueará cuando el Rally llegue a 1000 perfiles')
    navigate('/dashboard')
    return
  }
  
  // 2. Verificar membresía (futuro)
  // const isMember = checkMembership(currentUser.id)
  // if (!isMember) navigate('/membership')
  
}, [globalProgress])
```

#### Estructura de Tribu

```typescript
interface TribeAssignment {
  id: string
  userId: string              // Usuario asignado a esta tribu
  month: string               // 'YYYY-MM' (ej: '2025-02')
  assignedUsers: string[]     // 8 IDs de usuarios para impulsar
  createdAt: string
  expiresAt: string           // Último día del mes
}

interface TribeTask {
  id: string
  userId: string              // Quien hace la tarea
  targetUserId: string        // A quien se la hace
  taskType: TaskType
  completed: boolean
  points: number
  completedAt?: string
}

type TaskType =
  | 'visit_profile'      // 2 puntos
  | 'follow_instagram'   // 3 puntos
  | 'share_content'      // 5 puntos
  | 'comment_post'       // 4 puntos
  | 'send_message'       // 6 puntos
  | 'make_connection'    // 8 puntos
  | 'recommend'          // 7 puntos
  | 'collaboration'      // 10 puntos
```

#### Algoritmo de Asignación

```javascript
const generateTribeAssignments = (month) => {
  // 1. Obtener todos los usuarios activos
  const activeUsers = getAllUsers().filter(u => u.status === 'active')
  
  // 2. Calcular compatibilidad para cada par
  const compatibilityMatrix = {}
  activeUsers.forEach(user1 => {
    compatibilityMatrix[user1.id] = {}
    activeUsers.forEach(user2 => {
      if (user1.id !== user2.id) {
        compatibilityMatrix[user1.id][user2.id] = calculateMatch(user1, user2)
      }
    })
  })
  
  // 3. Para cada usuario, asignar 8 más compatibles
  const assignments = activeUsers.map(user => {
    const sortedMatches = Object.entries(compatibilityMatrix[user.id])
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, 8)
      .map(([userId]) => userId)
    
    return {
      id: `tribe_${user.id}_${month}`,
      userId: user.id,
      month: month,
      assignedUsers: sortedMatches,
      createdAt: new Date().toISOString(),
      expiresAt: getLastDayOfMonth(month)
    }
  })
  
  // 4. Guardar en Firestore
  assignments.forEach(async (assignment) => {
    await setDoc(doc(db, 'tribe_assignments', assignment.id), assignment)
  })
  
  return assignments
}
```

#### Rotación Mensual

```javascript
useEffect(() => {
  const checkMonthlyRotation = async () => {
    const currentMonth = getCurrentMonth() // 'YYYY-MM'
    const lastRotation = localStorage.getItem('last_tribe_rotation')
    
    if (lastRotation !== currentMonth) {
      console.log('🔄 ROTACIÓN MENSUAL: Generando nueva Tribu...')
      
      // Generar nuevas asignaciones
      await generateTribeAssignments(currentMonth)
      
      // Marcar rotación completada
      localStorage.setItem('last_tribe_rotation', currentMonth)
      
      // Notificar a usuarios
      getAllUsers().forEach(user => {
        createNotification({
          userId: user.id,
          type: 'tribe_assigned',
          title: '¡Nueva Tribu Asignada!',
          message: `Ya tienes tu nueva Tribu para impulsar este mes de ${getMonthName(currentMonth)}`
        })
      })
      
      console.log('✅ Nueva Tribu generada para', currentMonth)
    }
  }
  
  checkMonthlyRotation()
}, [])
```

#### UI de Tribu

**Progress Card**
```javascript
<div className="progress-card">
  <h3>Tu Progreso Este Mes</h3>
  <div className="progress-bar">
    <div 
      className="progress-fill" 
      style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
    />
  </div>
  <p>{completedTasks} de {totalTasks} tareas completadas</p>
  <p className="points">⭐ {totalPoints} puntos</p>
</div>
```

**Grid de Miembros**
```javascript
<div className="tribe-grid">
  {tribeMembers.map(member => (
    <div key={member.id} className="tribe-member-card">
      <img src={member.avatarUrl} alt={member.name} />
      <h4>{member.name}</h4>
      <p>{member.companyName}</p>
      
      {/* Checklist de tareas */}
      <div className="tasks-checklist">
        {TRIBE_TASKS.map(task => {
          const taskCompleted = isTaskCompleted(currentUser.id, member.id, task.type)
          return (
            <div key={task.type} className="task-item">
              <Checkbox
                checked={taskCompleted}
                onChange={() => handleTaskComplete(member.id, task)}
              />
              <span>{task.label}</span>
              <span className="points">+{task.points}</span>
            </div>
          )
        })}
      </div>
      
      <Button onClick={() => navigate(`/profile/${member.id}`)}>
        Ver Perfil
      </Button>
    </div>
  ))}
</div>
```

#### Manejo de Tareas

```javascript
const handleTaskComplete = async (targetUserId, task) => {
  try {
    const newTask = {
      id: `task_${Date.now()}`,
      userId: currentUser.id,
      targetUserId: targetUserId,
      taskType: task.type,
      completed: true,
      points: task.points,
      completedAt: new Date().toISOString()
    }
    
    // 1. Guardar en Firestore
    await setDoc(doc(db, 'tribe_tasks', newTask.id), newTask)
    
    // 2. Actualizar estado local
    setCompletedTasks(prev => [...prev, newTask])
    
    // 3. Actualizar puntos totales
    setTotalPoints(prev => prev + task.points)
    
    // 4. Notificar al usuario objetivo (opcional)
    await createNotification({
      userId: targetUserId,
      type: 'interaction',
      title: `${currentUser.name} completó una tarea`,
      message: task.notificationMessage
    })
    
    console.log(`✅ Tarea completada: ${task.label} (+${task.points} puntos)`)
    
  } catch (error) {
    console.error('Error completando tarea:', error)
    alert('Error al guardar. Intenta de nuevo.')
  }
}
```

#### Lista de Tareas

```javascript
const TRIBE_TASKS = [
  {
    type: 'visit_profile',
    label: 'Visitar su perfil',
    points: 2,
    notificationMessage: 'visitó tu perfil'
  },
  {
    type: 'follow_instagram',
    label: 'Seguir en Instagram',
    points: 3,
    notificationMessage: 'te siguió en Instagram'
  },
  {
    type: 'share_content',
    label: 'Compartir su contenido',
    points: 5,
    notificationMessage: 'compartió tu contenido'
  },
  {
    type: 'comment_post',
    label: 'Comentar en su post',
    points: 4,
    notificationMessage: 'comentó en tu publicación'
  },
  {
    type: 'send_message',
    label: 'Enviar mensaje directo',
    points: 6,
    notificationMessage: 'te envió un mensaje'
  },
  {
    type: 'make_connection',
    label: 'Hacer match/conexión',
    points: 8,
    notificationMessage: 'quiere conectar contigo'
  },
  {
    type: 'recommend',
    label: 'Recomendar a alguien',
    points: 7,
    notificationMessage: 'te recomendó con alguien'
  },
  {
    type: 'collaboration',
    label: 'Colaboración completada',
    points: 10,
    notificationMessage: 'completó una colaboración contigo'
  }
]
```

#### Conexiones

- ← Solo visible en Bottom Nav si Rally >= 1000
- → `/profile/:id` (click en miembro de la tribu)

---

### 🔟 Membership Screen

**Ruta:** `/membership`  
**Archivo:** `screens/membership/MembershipScreen.tsx`

#### Función Principal
Página de conversión para membresía Premium.

#### Lógica de Redirect

```javascript
useEffect(() => {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    navigate('/')
    return
  }
  
  const status = localStorage.getItem(`membership_status_${currentUser.id}`)
  const isMember = status === 'miembro' || status === 'admin' || status === 'trial'
  
  // Si viene desde Settings, NO redirigir (dejar ver la página)
  const fromSettings = sessionStorage.getItem('from_settings')
  
  if (isMember && !fromSettings) {
    // Ya es miembro y NO viene de settings → redirigir
    setTimeout(() => navigate('/dashboard'), 1500)
  } else if (fromSettings) {
    // Limpiar flag después de usarlo
    sessionStorage.removeItem('from_settings')
  }
}, [])
```

#### Secciones de la Página

**Header**
```javascript
<div className="membership-header">
  <h1>Hazte Miembro Premium</h1>
  <p>Desbloquea todo el potencial de Tribu Impulsa</p>
</div>
```

**Comparación de Planes**
```javascript
<div className="plans-comparison">
  <PlanCard
    title="Plan Gratuito"
    price="$0"
    features={[
      'Perfil básico',
      'Ver hasta 10 perfiles/día',
      'Notificaciones básicas',
      'Acceso al Rally 1000'
    ]}
    limitations={[
      'Sin Mi Tribu hasta Rally 1000',
      'Sin beneficios exclusivos',
      'Sin análisis de compatibilidad'
    ]}
    current={!isMember}
  />
  
  <PlanCard
    title="Trial 7 días"
    price="$1"
    period="único pago"
    features={[
      'Todas las features Premium',
      'Acceso a Club Bienestar',
      'Análisis de compatibilidad IA',
      'Sin límite de perfiles',
      'Prioridad en matching'
    ]}
    recommended={true}
    ctaText="Probar por $1"
    onCTA={() => handleSubscribe('trial')}
  />
  
  <PlanCard
    title="Premium"
    price="$9.990"
    period="/mes"
    features={[
      'Todo del Trial',
      'Acceso ilimitado permanente',
      'Soporte prioritario',
      'Badges exclusivos',
      'Eventos VIP'
    ]}
    ctaText="Suscribirme"
    onCTA={() => handleSubscribe('premium')}
  />
</div>
```

**Testimonios**
```javascript
<div className="testimonials">
  <h2>Lo que dicen nuestros miembros</h2>
  {testimonials.map(testimonial => (
    <TestimonialCard key={testimonial.id}>
      <img src={testimonial.avatar} alt={testimonial.name} />
      <p>"{testimonial.quote}"</p>
      <span>— {testimonial.name}, {testimonial.business}</span>
    </TestimonialCard>
  ))}
</div>
```

**FAQ**
```javascript
<div className="faq">
  <h2>Preguntas Frecuentes</h2>
  {faqs.map(faq => (
    <FAQItem key={faq.id}>
      <h4>{faq.question}</h4>
      <p>{faq.answer}</p>
    </FAQItem>
  ))}
</div>
```

#### Proceso de Suscripción

```javascript
const handleSubscribe = async (plan) => {
  try {
    setIsProcessing(true)
    
    // 1. Crear checkout session en Stripe (futuro)
    const { data } = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        plan: plan,
        email: currentUser.email
      })
    }).then(r => r.json())
    
    // 2. Redirigir a Stripe Checkout
    window.location.href = data.checkoutUrl
    
  } catch (error) {
    console.error('Error iniciando suscripción:', error)
    alert('Error al procesar. Intenta de nuevo.')
    setIsProcessing(false)
  }
}

// Webhook de Stripe (backend)
// POST /api/stripe-webhook
// Cuando el pago se completa:
// 1. Actualizar membership_status en Firestore
// 2. Crear notificación de bienvenida Premium
// 3. Enviar email de confirmación
```

#### Conexiones

- ← Desde Settings (botón "Probar por $1")
- ← Desde Club Bienestar (si NO es miembro)
- → Stripe Checkout (proceso de pago)
- → Dashboard (si ya es miembro y NO viene de settings)

---

## 🧭 Bottom Navigation Bar

**Componente:** `components/layout/AppLayout.tsx`

#### Configuración

**Rutas donde NO se muestra:**
```javascript
const hiddenNavRoutes = [
  '/',              // Login
  '/register',      // Registro
  '/survey',        // Encuesta (legacy)
  '/admin',         // Admin panel
  '/membership',    // Membresía
  '/searching',     // Loading screen
  '/complete-profile' // Completar perfil (legacy)
]

const showNav = !hiddenNavRoutes.includes(location.pathname) 
                && !location.pathname.startsWith('/admin')
```

#### Estructura de Botones

```javascript
const navItems = [
  {
    id: 'dashboard',
    icon: Home,
    label: 'Inicio',
    path: '/dashboard',
    requiresMembership: false
  },
  {
    id: 'activity',
    icon: Bell,
    label: 'Actividad',
    path: '/activity',
    requiresMembership: false,
    badge: unreadCount > 0 ? unreadCount : null
  },
  {
    id: 'directory',
    icon: Users,
    label: 'Directorio',
    path: '/directory',
    requiresMembership: false
  },
  {
    id: 'benefits',
    icon: Gift,
    label: 'Beneficios',
    path: '/beneficios',
    requiresMembership: true,
    badge: !isMember ? 'PRO' : null
  },
  {
    id: 'profile',
    icon: User,
    label: 'Perfil',
    path: '/my-profile',
    requiresMembership: false
  },
  {
    id: 'tribe',
    icon: Handshake,
    label: 'Mi Tribu',
    path: '/tribe',
    requiresMembership: false,
    locked: globalProgress < 1000,
    lockMessage: '¡Mi Tribu se desbloqueará cuando lleguemos a 1000 perfiles completos!'
  }
]
```

#### Renderizado

```javascript
<nav className="bottom-nav">
  {navItems.map(item => {
    const isActive = location.pathname === item.path
    const isLocked = item.locked
    
    return (
      <button
        key={item.id}
        className={`nav-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
        onClick={() => handleNavClick(item)}
      >
        <div className="icon-wrapper">
          <item.icon />
          {item.badge && (
            <span className="badge">{item.badge}</span>
          )}
          {isLocked && (
            <Lock className="lock-icon" />
          )}
        </div>
        <span className="label">{item.label}</span>
      </button>
    )
  })}
</nav>
```

#### Lógica de Navegación

```javascript
const handleNavClick = (item) => {
  // 1. Verificar si está bloqueada
  if (item.locked) {
    alert(item.lockMessage)
    return
  }
  
  // 2. Verificar membresía
  if (item.requiresMembership && !isMember) {
    navigate('/membership')
    return
  }
  
  // 3. Navegar
  navigate(item.path)
}
```

---

## 🔄 Sistema de Datos y Sincronización

### Arquitectura de Datos

```
┌─────────────────────────────────────┐
│   Firebase Authentication           │
│   (Credenciales, UIDs)              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Firestore Database                │
│                                     │
│   /users/{userId}                   │
│   /notifications/{notifId}          │
│   /tribe_assignments/{assignmentId} │
│   /tribe_tasks/{taskId}             │
│   /system_stats/global              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   localStorage (Cache)              │
│                                     │
│   tribu_users: UserProfile[]        │
│   tribu_current_user: userId        │
│   tribu_session: UserSession        │
│   onboarding_complete_{userId}      │
│   membership_status_{userId}        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   React State (Session)             │
│   Datos volátiles de la UI          │
└─────────────────────────────────────┘
```

### Orden de Prioridad (Source of Truth)

```javascript
// 1. Firebase Authentication → Validación de credenciales
// 2. Firestore → Datos de perfiles y notificaciones
// 3. localStorage → Cache para offline
// 4. React State → Datos temporales de sesión
```

### Flujo de Sincronización en Registro

```javascript
// Archivo: services/realUsersData.ts - registerNewUser()

1. Validar email único
   - localStorage: emailExists(email)
   - Firebase Auth: fetchSignInMethodsForEmail(email)
   
2. Si email disponible:
   ↓
   Crear usuario en Firebase Authentication
   - createUserWithEmailAndPassword(email, password)
   - Obtener UID
   
   ↓
   Guardar perfil completo en Firestore
   - setDoc(doc(db, 'users', userId), profileData)
   - Incluir authUID para referencia
   
   ↓
   Incrementar contador global
   - updateDoc(doc(db, 'system_stats', 'global'), {
       profilesCompleted: increment(1),
       membersActive: increment(1)
     })
   
   ↓
   Guardar en localStorage
   - users.push(newUser)
   - localStorage.setItem('tribu_users', JSON.stringify(users))
   
   ↓
   Establecer sesión
   - setStoredSession({ email, name, isLoggedIn: true })
   - localStorage.setItem('tribu_current_user', userId)
   
   ↓
   Redirigir
   - navigate('/searching')
```

### Flujo de Sincronización en Login

```javascript
// Archivo: services/realUsersData.ts - validateCredentials()

1. Usuario ingresa email
   ↓
   Buscar localmente
   - getUserByEmail(email) en localStorage
   
   ↓
   Si NO existe localmente:
   - getUserFromFirebaseByEmail(email) en Firestore
   - Sincronizar a localStorage
   
   ↓
2. Usuario ingresa password
   ↓
   Validar con Firebase Authentication
   - signInWithEmailAndPassword(auth, email, password)
   - Obtener userCredential
   
   ↓
   Si autenticación exitosa:
   - Obtener perfil completo de Firestore
   - Actualizar cache en localStorage
   - Establecer sesión
   - navigate('/searching')
```

### Listener en Tiempo Real del Rally Counter

```javascript
// Archivo: components/layout/AppLayout.tsx

useEffect(() => {
  const { getFirestoreInstance } = await import('./services/firebaseService')
  const { doc, onSnapshot } = await import('firebase/firestore')
  
  const db = getFirestoreInstance()
  if (!db) return
  
  const unsubscribe = onSnapshot(
    doc(db, 'system_stats', 'global'),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        setGlobalProgress(data.profilesCompleted || 0)
      }
    },
    (error) => {
      console.error('Error en listener de Rally:', error)
    }
  )
  
  return () => unsubscribe()
}, [])
```

### Sincronización de Notificaciones

```javascript
// Archivo: services/databaseService.ts

export const syncNotificationsFromFirebase = async (userId: string) => {
  try {
    const { getFirestoreInstance } = await import('./firebaseService')
    const { collection, query, where, getDocs } = await import('firebase/firestore')
    
    const db = getFirestoreInstance()
    if (!db) return
    
    // Obtener notificaciones del usuario
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    )
    
    const snapshot = await getDocs(q)
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Guardar en localStorage
    localStorage.setItem(
      `notifications_${userId}`,
      JSON.stringify(notifications)
    )
    
    console.log(`📬 ${notifications.length} notificaciones sincronizadas`)
    
    return notifications
  } catch (error) {
    console.error('Error sincronizando notificaciones:', error)
    return []
  }
}
```

---

## 🔒 Sistema de Permisos

### Niveles de Acceso

```javascript
// Nivel 1: Público (sin login)
const publicRoutes = ['/', '/register']

// Nivel 2: Autenticado (requiere login)
const protectedRoutes = [
  '/dashboard',
  '/activity',
  '/directory',
  '/my-profile',
  '/profile/:id'
]

// Nivel 3: Miembro Premium
const premiumRoutes = [
  '/beneficios'
]

// Nivel 4: Rally 1000 completo
const rallyLockedRoutes = [
  '/tribe'
]

// Nivel 5: Admin (futuro)
const adminRoutes = [
  '/admin'
]
```

### Middleware de Protección

```javascript
// Archivo: components/routing/ProtectedRoute.tsx

export const ProtectedRoute = ({ children, requiresMembership = false, requiresRally = false }) => {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const [accessGranted, setAccessGranted] = useState(false)
  
  useEffect(() => {
    // 1. Verificar autenticación
    if (!currentUser) {
      console.log('❌ No autenticado, redirigiendo a login')
      navigate('/')
      return
    }
    
    // 2. Verificar membresía si es requerida
    if (requiresMembership) {
      const status = localStorage.getItem(`membership_status_${currentUser.id}`)
      const isMember = status === 'miembro' || status === 'admin' || status === 'trial'
      
      if (!isMember) {
        console.log('❌ Membresía requerida, redirigiendo')
        navigate('/membership')
        return
      }
    }
    
    // 3. Verificar Rally si es requerido
    if (requiresRally) {
      const rallyProgress = getRallyProgress()
      if (rallyProgress < 1000) {
        console.log('❌ Rally no completado, bloqueado')
        alert('Esta función se desbloqueará cuando el Rally llegue a 1000 perfiles')
        navigate('/dashboard')
        return
      }
    }
    
    // Acceso concedido
    setAccessGranted(true)
  }, [currentUser, requiresMembership, requiresRally])
  
  if (!accessGranted) {
    return <LoadingScreen />
  }
  
  return children
}
```

### Uso en Rutas

```javascript
// Archivo: App.tsx

<Routes>
  {/* Públicas */}
  <Route path="/" element={<LoginScreen />} />
  
  {/* Protegidas - Solo login */}
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />
  
  {/* Protegidas - Membresía */}
  <Route path="/beneficios" element={
    <ProtectedRoute requiresMembership={true}>
      <ClubBienestarView />
    </ProtectedRoute>
  } />
  
  {/* Protegidas - Rally + Membresía (futuro) */}
  <Route path="/tribe" element={
    <ProtectedRoute requiresRally={true}>
      <TribeAssignmentsView />
    </ProtectedRoute>
  } />
</Routes>
```

---

## 📊 Métricas y Analytics

### Contador Rally (system_stats/global)

```typescript
interface SystemStats {
  profilesCompleted: number  // Total de perfiles completos
  membersActive: number      // Total de miembros activos
  profilesTarget: 1000       // Meta fija
  lastUpdated: string        // ISO timestamp
}
```

### Tracking de Eventos

```javascript
// Archivo: services/analytics.ts (futuro)

export const trackEvent = (eventName, properties = {}) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, properties)
  }
  
  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', eventName, properties)
  }
  
  // Custom analytics
  sendToBackend({
    event: eventName,
    properties: properties,
    userId: getCurrentUser()?.id,
    timestamp: new Date().toISOString()
  })
}

// Eventos clave
trackEvent('user_registered', { method: 'email' })
trackEvent('profile_completed')
trackEvent('membership_started', { plan: 'trial' })
trackEvent('tribe_task_completed', { taskType: 'visit_profile', points: 2 })
```

---

## 🎨 Resumen Visual de Flujos

### Flujo de Registro

```
Login Screen
    ↓ (Click "Crear cuenta")
Email ingresado
    ↓ (Validar email único)
Formulario registro expandido
    ↓ (Completar 5 pasos)
Validaciones geográficas
    ↓ (Enviar formulario)
[Backend]
- Crear en Firebase Auth
- Guardar en Firestore
- Incrementar Rally
- Guardar en localStorage
    ↓
Searching Screen (3s)
    ↓
Dashboard + Onboarding
```

### Flujo de Login

```
Login Screen
    ↓ (Click "Ya tengo cuenta")
Email ingresado
    ↓ (Buscar usuario)
Local → Firebase (si no está)
    ↓ (Usuario encontrado)
Password solicitado
    ↓ (Validar con Firebase Auth)
[Backend]
- Autenticar
- Obtener perfil
- Sincronizar local
    ↓
Searching Screen (3s)
    ↓
Dashboard (NO onboarding)
```

### Flujo de Navegación Principal

```
Dashboard (Hub)
    ├→ Activity (notificaciones)
    ├→ Directory (explorar)
    │   └→ Profile Detail
    ├→ Mi Perfil (editar)
    │   └→ Membership (upgrade)
    ├→ Beneficios (si es miembro)
    └→ Mi Tribu (si Rally >= 1000)
```

---

## 📝 Conclusión

Esta arquitectura proporciona:

✅ **Escalabilidad**: Firebase maneja crecimiento automáticamente  
✅ **Offline-first**: localStorage como cache  
✅ **Real-time**: Listeners para Rally y notificaciones  
✅ **Seguridad**: Múltiples niveles de autenticación  
✅ **UX fluida**: Transiciones suaves, loading states  
✅ **Modular**: Componentes reutilizables  
✅ **Extensible**: Fácil agregar nuevas features  

---

**Documento creado:** Diciembre 2024  
**Versión:** v0.9.1  
**Autor:** Sistema de documentación automática Tribu Impulsa

