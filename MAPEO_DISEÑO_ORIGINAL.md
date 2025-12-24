# 🎨 Mapeo de Diseño Original → Módulos Nuevos

**Documento maestro para restaurar el diseño Monday.com hermoso del archivo original**

## 📋 Tabla de Contenidos

1. [Sistema de Diseño Base](#sistema-de-diseño-base)
2. [Mapeo Módulo por Módulo](#mapeo-módulo-por-módulo)
3. [Patrones Reutilizables](#patrones-reutilizables)
4. [Estrategia de Reintegración](#estrategia-de-reintegración)

---

## 📐 Sistema de Diseño Base

### Archivo de Referencia Original

- **Archivo:** `OTROS/RESPALDO-newUX/App.tsx` (4357 líneas)
- **CSS Base:** `OTROS/RESPALDO/index.css` (457 líneas)
- **Última versión:** Diciembre 2024 (newUX - versión mejorada)

### Paleta de Colores Monday.com

```css
/* Variables globales - copiar a index.css */
:root {
  /* Colores primarios */
  --color-accent-500: #6161FF;     /* Morado principal */
  --color-success-500: #00CA72;    /* Verde */
  --color-danger-500: #FB275D;     /* Rojo */
  --color-warning-500: #FFCC00;    /* Amarillo */
  
  /* Neutrales */
  --neutral-000: #FFFFFF;
  --neutral-050: #F5F7FB;
  --neutral-100: #E4E7EF;
  --neutral-300: #B3B8C6;
  --neutral-500: #7C8193;
  --neutral-700: #434343;
  --neutral-900: #181B34;
  
  /* Gradientes */
  --gradient-tribe: linear-gradient(135deg, #181B34 0%, #1B1B66 45%, #6161FF 100%);
  --gradient-hero: linear-gradient(160deg, #181B34 0%, #1B1B66 55%, #6161FF 100%);
  --gradient-cta: linear-gradient(135deg, #00CA72 0%, #4AE698 100%);
}
```

---

## 🗺️ Mapeo Módulo por Módulo

### 1. LoginScreen

**📁 Archivo Original:** `OTROS/RESPALDO-newUX/App.tsx` líneas **618-717**  
**📁 Archivo Nuevo:** `screens/auth/LoginScreen.tsx`  
**📊 Estado Actual:** ⚠️ Parcial (falta diseño completo)

#### Diseño a Restaurar

```tsx
// CONTAINER PRINCIPAL con background decorativo
<div className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative bg-[#F5F7FB]">
  
  {/* Background decorations - Círculos borrosos */}
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#6161FF]/10 blur-[100px]" />
    <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#00CA72]/10 blur-[100px]" />
    <div className="absolute top-[30%] left-[20%] w-[200px] h-[200px] rounded-full bg-[#FFCC00]/10 blur-[60px]" />
  </div>

  {/* Logo grande */}
  <div className="mb-4 flex justify-center">
    <img 
      src="/tribulogo.png" 
      alt="Tribu Impulsa" 
      className="w-[90%] max-w-[380px] object-contain"
    />
  </div>

  {/* Card principal del login */}
  <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-[#E4E7EF]">
    
    {/* Subtítulo */}
    <p className="text-[#7C8193] mb-6 text-sm text-center -mt-2">
      Conecta, colabora y crece con el <span className="text-[#6161FF] font-semibold">Algoritmo Tribal</span>.
    </p>
    
    {/* Formulario */}
    <form className="space-y-4 text-left">
      
      {/* Label estándar */}
      <div>
        <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">
          Email
        </label>
        
        {/* Input estándar con focus ring */}
        <input 
          type="email"
          className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3.5 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
          placeholder="tu@email.com"
        />
      </div>
      
      {/* Mensaje de error */}
      <p className="text-[#FB275D] text-sm text-center">Error message aquí</p>
      
      {/* Botón primario con gradiente verde */}
      <button 
        type="submit"
        className="w-full bg-gradient-to-r from-[#00CA72] to-[#4AE698] text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-[0_8px_20px_rgba(0,202,114,0.35)] transition-all shadow-md flex items-center justify-center gap-3 group disabled:opacity-50"
      >
        Ingresar
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
      </button>
    </form>

    {/* Divider + Link secundario */}
    <div className="mt-6 pt-4 border-t border-[#E4E7EF]">
      <button className="text-[#7C8193] hover:text-[#6161FF] text-sm transition-colors">
        ¿No tienes cuenta? <span className="font-semibold">Regístrate</span>
      </button>
    </div>
    
    {/* Menú de desarrollo (colapsable) */}
    <details className="mt-4">
      <summary className="text-[10px] text-[#B3B8C6] cursor-pointer hover:text-[#7C8193] transition select-none">
        ⚙️ Modo desarrollo
      </summary>
      <div className="mt-2 p-3 bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-xl border border-[#E4E7EF]">
        <p className="text-[10px] text-[#6161FF] uppercase tracking-wide mb-2 font-bold">
          🔐 Contraseña universal: TRIBU2026
        </p>
        {/* Botones de usuarios de prueba aquí */}
      </div>
    </details>
    
  </div>
</div>
```

#### Diferencias Clave del Original

| Elemento | Original (newUX) | Actual LoginScreen | Acción |
|----------|------------------|-------------------|--------|
| Background | 3 círculos blur | ❓ | ✅ Restaurar |
| Card principal | `rounded-3xl` + shadow custom | `rounded-2xl` genérico | ✅ Ajustar |
| Inputs | `rounded-xl` + `p-3.5` | Puede variar | ✅ Unificar |
| Botón CTA | Gradiente verde específico | ❓ | ✅ Restaurar |
| Logo | `max-w-[380px]` | ❓ | ✅ Verificar |

---

### 2. Dashboard (Pantalla Principal)

**📁 Archivo Original:** `OTROS/RESPALDO-newUX/App.tsx` líneas **3571-3690**  
**📁 Archivo Nuevo:** `screens/dashboard/Dashboard.tsx`  
**📊 Estado Actual:** ⚠️ Parcial

#### Diseño del Header Sticky

```tsx
{/* Header - Liquid Glass iOS 26 */}
<header 
  className="px-5 py-5 flex justify-between items-center sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-white/20"
  style={{
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.5)'
  }}
>
  <div>
    <h1 className="text-xl font-bold text-[#181B34]">Hola, {nombre}</h1>
    <p className="text-[#7C8193] text-sm">Tus conexiones activas</p>
  </div>
  
  {/* Avatar con borde hover */}
  <button 
    className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#E4E7EF] hover:border-[#6161FF] transition-colors"
  >
    <img 
      src={avatarUrl} 
      alt="Me"
      className="w-full h-full object-cover"
    />
  </button>
</header>
```

#### Stats Cards - Colores Sólidos

```tsx
<div className="px-4 mt-4 mb-6">
  <div className="grid grid-cols-2 gap-3">
    
    {/* Card: Acciones (Morado) */}
    <div 
      onClick={() => navigate('/tribe')}
      className="bg-[#6161FF] rounded-xl p-4 cursor-pointer hover:opacity-90 transition-opacity"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-white/80 text-xs font-medium">Acciones</span>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <CheckCircle size={16} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{completed}/{total}</p>
      <span className="text-white/70 text-xs">Pendientes: {pending}</span>
    </div>
    
    {/* Card: Reportes (Verde) */}
    <div className="bg-[#00CA72] rounded-xl p-4">
      <div className="flex justify-between items-start mb-3">
        <span className="text-white/80 text-xs font-medium">Reportes</span>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <AlertTriangle size={16} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{reports}</p>
      <span className="text-white/70 text-xs">Acusetes enviados</span>
    </div>
  </div>
  
  {/* Alert Card - Acciones pendientes (Rojo) */}
  {pending > 0 && (
    <div 
      onClick={() => navigate('/tribe')}
      className="mt-3 bg-[#FB275D] rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
    >
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <Clock size={20} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-white font-semibold text-sm">¡Tienes {pending} acciones pendientes!</p>
        <p className="text-white/80 text-xs">Completa tu tribu antes del día 20</p>
      </div>
      <ChevronRight size={18} className="text-white" />
    </div>
  )}
</div>
```

#### Match Cards

```tsx
<div className="px-4">
  <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-[#181B34]">
    <Sparkles size={18} className="text-[#FFCC00]"/> 
    Tus Matches Recomendados
  </h2>
  
  <div className="space-y-4">
    {matches.map((match) => (
      <div 
        key={match.id} 
        className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-[#E4E7EF] hover:border-[#6161FF]/30"
      >
        <div className="p-5">
          
          {/* Header con avatar */}
          <div className="flex gap-4 mb-4">
            <img 
              src={match.targetProfile.avatarUrl} 
              alt={match.targetProfile.name} 
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-lg leading-tight text-[#181B34] truncate pr-2">
                  {match.targetProfile.companyName}
                </h3>
                
                {/* Badge de score */}
                <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                  match.affinityScore > 90 
                    ? 'bg-[#00CA72]/10 text-[#00CA72]' 
                    : 'bg-[#FFCC00]/10 text-[#9D6B00]'
                }`}>
                  {match.affinityScore}%
                </span>
              </div>
              
              <p className="text-sm text-[#7C8193] truncate mb-2">
                {match.targetProfile.name}
              </p>
              
              {/* Tags de categoría */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] bg-[#6161FF]/10 px-2 py-0.5 rounded text-[#6161FF] truncate max-w-[120px]">
                  {match.targetProfile.category}
                </span>
                <span className="text-[10px] bg-[#00CA72]/10 px-2 py-0.5 rounded text-[#00CA72] truncate max-w-[120px]">
                  {match.targetProfile.subCategory}
                </span>
              </div>
            </div>
          </div>
          
          {/* Footer con razón del match y CTA */}
          <div className="pt-4 border-t border-[#E4E7EF] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#7C8193] text-xs">
              <Briefcase size={14} />
              <span className="italic">{match.reason}</span>
            </div>
            
            <button 
              onClick={() => navigate(`/profile/${match.targetProfile.id}`)}
              className="text-xs font-bold bg-[#6161FF] text-white px-4 py-2 rounded-lg hover:bg-[#5050DD] transition-colors shadow-md flex items-center gap-1"
            >
              Ver Perfil <ArrowRight size={12}/>
            </button>
          </div>
          
        </div>
      </div>
    ))}
  </div>
</div>
```

---

### 3. Barra de Navegación Inferior

**📁 Archivo Original:** `OTROS/RESPALDO-newUX/App.tsx` líneas **4478-4540**  
**📁 Archivo Nuevo:** `components/layout/AppLayout.tsx`  
**📊 Estado Actual:** ❌ Falta diseño completo

#### Código Completo Original

```tsx
{showNav && (
  <nav 
    className="fixed bottom-0 left-0 right-0 w-full backdrop-blur-xl border-t border-[#A8E6CF]/50 py-2 px-4 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" 
    style={{ 
      backgroundColor: 'rgba(232, 245, 233, 0.98)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)',
      height: '70px',
      position: 'fixed',
      zIndex: 9999,
      transform: 'translate3d(0,0,0)',
      WebkitTransform: 'translate3d(0,0,0)',
      WebkitBackfaceVisibility: 'hidden',
      backfaceVisibility: 'hidden',
    }}
  >
    
    {/* Dashboard Button */}
    <button 
      onClick={() => navigate('/dashboard')}
      className={`flex flex-col items-center transition-all duration-300 ${
        isDashboard 
          ? 'text-[#00CA72]' 
          : 'text-[#5D6B74] hover:text-[#00CA72]'
      }`}
    >
      <Users size={24} strokeWidth={isDashboard ? 2.5 : 2} />
      <span className="text-[10px] mt-0.5 font-medium">Inicio</span>
    </button>
    
    {/* Tribu Button - MISMO TAMAÑO que los demás (NO elevado en este diseño) */}
    <button 
      onClick={() => navigate('/tribe')}
      className={`flex flex-col items-center transition-all duration-300 ${
        isTribe 
          ? 'text-[#00CA72]' 
          : 'text-[#5D6B74] hover:text-[#00CA72]'
      }`}
    >
      <Share2 size={24} strokeWidth={isTribe ? 2.5 : 2} />
      <span className="text-[10px] mt-0.5 font-medium">Tribu</span>
    </button>

    {/* Activity Button */}
    <button 
      onClick={() => navigate('/activity')}
      className={`flex flex-col items-center transition-all duration-300 ${
        isActivity 
          ? 'text-[#00CA72]' 
          : 'text-[#5D6B74] hover:text-[#00CA72]'
      }`}
    >
      <Bell size={24} strokeWidth={isActivity ? 2.5 : 2} />
      <span className="text-[10px] mt-0.5 font-medium">Actividad</span>
    </button>

    {/* Profile Button */}
    <button 
      onClick={() => navigate('/my-profile')}
      className={`flex flex-col items-center transition-all duration-300 ${
        isProfile 
          ? 'text-[#00CA72]' 
          : 'text-[#5D6B74] hover:text-[#00CA72]'
      }`}
    >
      <Settings size={24} strokeWidth={isProfile ? 2.5 : 2} />
      <span className="text-[10px] mt-0.5 font-medium">Perfil</span>
    </button>
  </nav>
)}
```

#### Características Clave

| Propiedad | Valor Original | Propósito |
|-----------|----------------|-----------|
| `backgroundColor` | `rgba(232, 245, 233, 0.98)` | Verde pastel translúcido |
| `backdrop-blur-xl` | Sí | Efecto glassmorphism |
| `paddingBottom` | `calc(env(safe-area-inset-bottom, 0px) + 6px)` | Safe area iPhone |
| `height` | `70px` | Altura fija |
| `transform: translate3d(0,0,0)` | Hardware acceleration | Suavidad en iOS |
| Color activo | `#00CA72` (verde) | Estado seleccionado |
| Color inactivo | `#5D6B74` (gris) | Estado normal |

**⚠️ NOTA:** En el original, el botón de "Mi Tribu" **NO está elevado**. Todos los botones tienen el mismo tamaño.

---

### 4. Mi Tribu (TribeAssignmentsView)

**📁 Archivo Original:** `OTROS/RESPALDO-newUX/App.tsx` líneas **1480-1900**  
**📁 Archivo Nuevo:** `screens/tribe/TribeAssignmentsView.tsx`  
**📊 Estado Actual:** ⚠️ Diseño incompleto

#### Header con Estados

```tsx
<header className="px-6 py-6 sticky top-0 z-30 backdrop-blur-xl bg-white/90 border-b border-[#E4E7EF] shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-[#6161FF] font-medium">
        Mi red tribal
      </p>
      <h1 className="text-2xl font-bold text-[#181B34]">
        Checklist de Reciprocidad
      </h1>
    </div>
    
    {/* Badge de estado */}
    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${
      isCompleted 
        ? 'bg-[#E6FFF3] border-[#00CA72]/30 text-[#00CA72]'
        : isPending
        ? 'bg-[#FFF0F3] border-[#FB275D]/30 text-[#FB275D]'
        : 'bg-[#FFEDB3] border-[#FFCC00]/30 text-[#9D6B00]'
    }`}>
      {isCompleted ? '✓ ' : '○ '}{statusLabel}
    </span>
  </div>
</header>
```

#### Progress Card Grande

```tsx
<div className="bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-2xl p-6 text-white shadow-lg">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    
    {/* Porcentaje grande */}
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-white/80 font-medium">
        Avance mensual
      </p>
      <h2 className="text-5xl font-bold">{completion}%</h2>
      <p className="text-white/80 text-sm">
        {completedCount} de {totalCount} acciones realizadas
      </p>
    </div>
    
    {/* Botones de acción */}
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate('/dashboard')}
        className="px-5 py-2.5 rounded-xl bg-white text-[#6161FF] font-semibold hover:bg-white/90 transition shadow-md"
      >
        Ver recomendaciones
      </button>
      <button
        onClick={() => window.open('https://wa.me/56912345678', '_blank')}
        className="px-5 py-2.5 rounded-xl border-2 border-white/30 text-white hover:bg-white/10 transition font-medium"
      >
        Soporte WhatsApp
      </button>
    </div>
    
  </div>
</div>
```

#### Listas con Checkboxes

```tsx
<div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-[#E4E7EF]">
  <header className="mb-4">
    <p className="text-xs uppercase tracking-[0.2em] text-[#6161FF] mb-1 font-medium">
      Cuentas que debo impulsar
    </p>
    <h3 className="text-2xl font-bold text-[#181B34] flex items-center gap-2">
      <Share2 size={18} className="text-[#00CA72]" /> {list.length} cuentas
    </h3>
    <p className="text-[#7C8193] text-sm">
      Publica su contenido y etiquétalas antes del día 20.
    </p>
  </header>
  
  <div className="space-y-3">
    {list.map(profile => {
      const isCompleted = checklist[profile.id] ?? false;
      
      return (
        <div 
          key={profile.id} 
          className={`p-4 rounded-xl border transition ${
            isCompleted 
              ? 'bg-[#E6FFF3] border-[#00CA72]/30' 
              : 'bg-[#F5F7FB] border-[#E4E7EF] hover:border-[#6161FF]/40'
          }`}
        >
          <div className="flex items-start gap-3">
            
            {/* Checkbox */}
            <input
              type="checkbox"
              className="mt-1 accent-[#00CA72] w-5 h-5"
              checked={isCompleted}
              onChange={() => handleToggle(profile.id)}
            />
            
            {/* Info del perfil */}
            <button
              type="button"
              onClick={() => navigate(`/profile/${profile.id}`)}
              className="flex-1 text-left"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[#181B34]">
                  {profile.companyName}
                </p>
                <span className="text-xs text-[#7C8193] bg-white/80 px-2 py-0.5 rounded-full border border-[#E4E7EF]">
                  {profile.category}
                </span>
              </div>
              <p className="text-sm text-[#434343]">
                {profile.name} · {profile.subCategory}
              </p>
              <p className="text-xs text-[#7C8193]">{profile.location}</p>
            </button>
          </div>
          
          {/* Botones de acción */}
          <div className="flex flex-wrap gap-2 mt-3 pl-8">
            <button
              type="button"
              className="text-[10px] px-3 py-1.5 rounded-full bg-[#00CA72] text-white hover:bg-[#00B366] transition flex items-center gap-1"
            >
              <CheckCircle size={12} /> Yo compartí
            </button>
            
            <a
              href={`https://wa.me/${profile.whatsapp?.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] px-3 py-1.5 rounded-full bg-[#25D366] text-white hover:bg-[#128C7E] transition flex items-center gap-1"
            >
              <Send size={12} /> Avisarle
            </a>
            
            <button
              type="button"
              onClick={() => navigate(`/profile/${profile.id}`)}
              className="text-[10px] px-3 py-1.5 rounded-full border border-[#6161FF]/40 text-[#6161FF] hover:bg-[#6161FF]/10 transition"
            >
              Ver perfil
            </button>
            
            <button
              type="button"
              className="text-[10px] px-3 py-1.5 rounded-full border border-[#FB275D]/40 text-[#FB275D] hover:bg-[#FB275D]/10 transition"
            >
              Reportar
            </button>
          </div>
        </div>
      );
    })}
  </div>
</div>
```

---

### 5. MyProfileView (Mi Perfil)

**📁 Archivo Original:** `OTROS/RESPALDO-newUX/App.tsx` líneas **1902-2718**  
**📁 Archivo Nuevo:** `screens/profile/MyProfileView.tsx`  
**📊 Estado Actual:** ⚠️ Parcial

#### Cover con Avatar Flotante

```tsx
<div className="pb-32 animate-fadeIn min-h-screen bg-[#F5F7FB]">
  
  {/* Header with Cover Image */}
  <div className="h-72 w-full relative group">
    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#F5F7FB]"></div>
    
    {/* Botón editar banner (solo en modo edición) */}
    {isEditing && (
      <button 
        onClick={() => bannerInputRef.current?.click()}
        className="absolute top-14 right-4 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all z-20 text-sm"
      >
        <Edit2 size={16} />
        <span className="font-medium">Cambiar banner</span>
      </button>
    )}
    
    {/* Botón volver */}
    <div className="absolute top-14 left-4 z-30 flex items-center gap-4 w-full pr-12">
      <button 
        onClick={() => navigate('/dashboard')}
        className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[#181B34] hover:bg-white transition-colors border border-[#E4E7EF] flex items-center gap-2 shadow-md"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Volver</span>
      </button>
    </div>
  </div>

  {/* Card con avatar flotante */}
  <div className="px-4 -mt-24 relative z-10">
    <div className="bg-white rounded-2xl !overflow-visible px-6 pb-8 border border-[#E4E7EF] shadow-[0_4px_30px_rgba(0,0,0,0.08)] flex flex-col items-center">
      
      {/* Avatar - Centrado y flotando sobre el cover */}
      <div className="relative -mt-20 mb-4 z-20">
        <img 
          src={avatarUrl} 
          alt={name}
          className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
        />
        
        {/* Overlay de edición (solo en modo edición) */}
        {isEditing && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white"
          >
            <div className="text-center">
              <Edit2 size={20} className="mx-auto mb-1" />
              <span className="text-xs">Cambiar foto</span>
            </div>
          </button>
        )}
      </div>

      {/* Nombre y categoría */}
      <div className="text-center mb-4 w-full">
        <h2 className="text-3xl font-bold text-[#181B34] mb-1 tracking-tight">
          {companyName}
        </h2>
        <p className="text-[#7C8193] font-medium text-lg">{name}</p>
        
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          <span className="text-xs font-semibold bg-[#6161FF]/10 border border-[#6161FF]/30 text-[#6161FF] px-4 py-1.5 rounded-full">
            {category}
          </span>
        </div>
        
        {/* Botón Editar Perfil */}
        <div className="mt-4">
          {isEditing ? (
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setIsEditing(false)} 
                className="px-4 py-2 rounded-full bg-[#FB275D]/10 text-[#FB275D] hover:bg-[#FB275D]/20 flex items-center gap-2 text-sm font-medium"
              >
                <X size={16}/> Cancelar
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="px-4 py-2 rounded-full bg-[#00CA72] text-white hover:bg-[#00B366] flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              >
                {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16}/>} 
                Guardar
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-4 py-2 rounded-full border border-[#6161FF]/30 text-[#6161FF] hover:bg-[#6161FF]/10 flex items-center gap-2 text-sm font-medium mx-auto"
            >
              <Edit2 size={14} /> Editar Perfil
            </button>
          )}
        </div>
      </div>
      
      {/* Resto del contenido del perfil... */}
      
    </div>
  </div>
</div>
```

---

### 6. ProfileDetail (Perfil de Otro Usuario)

**📁 Archivo Original:** `OTROS/RESPALDO-newUX/App.tsx` líneas **2719-2854**  
**📁 Archivo Nuevo:** `screens/profile/ProfileDetail.tsx`  
**📊 Estado Actual:** ⚠️ Parcial

#### Layout Completo

```tsx
<div className="pb-24 animate-slideUp bg-[#F5F7FB] min-h-screen">
  
  {/* Header / Cover Image */}
  <div className="h-72 w-full relative">
    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#F5F7FB]"></div>
    
    {/* Botón volver flotante */}
    <button 
      onClick={() => navigate(-1)}
      className="absolute top-6 left-6 bg-white/90 backdrop-blur-md p-3 rounded-full text-[#181B34] hover:bg-white transition-colors z-20 border border-[#E4E7EF] shadow-md"
    >
      <ArrowLeft size={20} />
    </button>
  </div>
  
  {/* Card con info */}
  <div className="px-4 -mt-20 relative z-10">
    <div className="bg-white rounded-2xl !overflow-visible px-6 pb-8 border border-[#E4E7EF] shadow-[0_4px_30px_rgba(0,0,0,0.08)] flex flex-col items-center">
      
      {/* Avatar flotante */}
      <div className="-mt-20 mb-6 z-20">
        <img 
          src={avatarUrl} 
          alt={name}
          className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
        />
      </div>

      {/* Main Info */}
      <div className="text-center mb-8 w-full">
        <h2 className="text-3xl font-bold text-[#181B34] mb-1 tracking-tight">
          {companyName}
        </h2>
        <p className="text-[#7C8193] font-medium text-lg">{name}</p>
        
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          <span className="text-xs font-semibold bg-[#6161FF]/10 border border-[#6161FF]/30 px-4 py-1.5 rounded-full text-[#6161FF]">
            {category}
          </span>
          <span className="text-xs font-semibold bg-[#00CA72]/10 border border-[#00CA72]/30 px-4 py-1.5 rounded-full text-[#00CA72]">
            {subCategory}
          </span>
        </div>
      </div>

      {/* Sección: Sobre Nosotros */}
      <div className="space-y-8 w-full text-left">
        <div>
          <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">
            Sobre Nosotros
          </h3>
          <p className="text-[#434343] leading-relaxed text-lg">
            {bio}
          </p>
        </div>

        {/* Grid de datos */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Card: Ubicación */}
          <div className="bg-[#F5F7FB] p-4 rounded-2xl flex items-center gap-4 border border-[#E4E7EF]">
            <div className="bg-[#6161FF]/10 p-2 rounded-lg text-[#6161FF]">
              <MapPin size={20} />
            </div>
            <div className="text-sm">
              <span className="block text-[#7C8193] text-[10px] mb-0.5 uppercase tracking-wide">
                Ubicación
              </span>
              <span className="font-medium text-[#181B34]">{location}</span>
            </div>
          </div>
          
          {/* Card: Fundada */}
          <div className="bg-[#F5F7FB] p-4 rounded-2xl flex items-center gap-4 border border-[#E4E7EF]">
            <div className="bg-[#00CA72]/10 p-2 rounded-lg text-[#00CA72]">
              <Calendar size={20} />
            </div>
            <div className="text-sm">
              <span className="block text-[#7C8193] text-[10px] mb-0.5 uppercase tracking-wide">
                Fundada
              </span>
              <span className="font-medium text-[#181B34]">{foundingYear}</span>
            </div>
          </div>
          
        </div>

        {/* Enlaces */}
        <div>
          <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">
            Enlaces
          </h3>
          <div className="flex flex-col gap-3">
            
            {website && (
              <a 
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-[#434343] hover:text-[#6161FF] transition-colors bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EF] group hover:border-[#6161FF]"
              >
                <Globe size={20} className="text-[#6161FF] group-hover:scale-110 transition-transform"/> 
                <span className="font-medium text-sm truncate">{website}</span>
              </a>
            )}
            
            {instagram && (
              <a 
                href={`https://instagram.com/${instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-[#434343] hover:text-[#E91E63] transition-colors bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EF] group hover:border-[#E91E63]"
              >
                <Instagram size={20} className="text-[#E91E63] group-hover:scale-110 transition-transform"/> 
                <span className="font-medium text-sm">{instagram}</span>
              </a>
            )}
            
          </div>
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span 
                key={tag} 
                className="text-sm bg-[#F5F7FB] border border-[#E4E7EF] px-4 py-2 rounded-lg text-[#434343] hover:border-[#6161FF] hover:text-[#6161FF] transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Botón de contacto */}
        <button className="w-full bg-gradient-to-r from-[#00CA72] to-[#4AE698] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02]">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
            className="w-6 h-6 filter invert brightness-200" 
            alt="ws"
          />
          Contactar por WhatsApp
        </button>
        
      </div>
    </div>
  </div>
</div>
```

---

### 7. ActivityView (Notificaciones)

**📁 Archivo Original:** `OTROS/RESPALDO-newUX/App.tsx` líneas **3036-3186**  
**📁 Archivo Nuevo:** `screens/activity/ActivityView.tsx`  
**📊 Estado Actual:** ⚠️ Parcial

#### Header con Filtros

```tsx
<div className="pb-32 animate-fadeIn min-h-screen bg-[#F5F7FB]">
  
  <header className="px-6 py-4 sticky top-0 z-30 backdrop-blur-xl bg-white/90 border-b border-[#E4E7EF] shadow-sm">
    
    <div className="flex items-center justify-between mb-3">
      <h1 className="text-xl font-bold flex items-center gap-2 text-[#181B34]">
        <Bell className="text-[#6161FF]" /> Actividad
        {unreadCount > 0 && (
          <span className="bg-[#FB275D] text-white text-xs px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </h1>
      
      <div className="flex gap-2">
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-xs text-[#6161FF] hover:underline"
          >
            Marcar leído
          </button>
        )}
      </div>
    </div>
    
    {/* Filtros */}
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => setFilter('all')}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
          filter === 'all' 
            ? 'bg-[#6161FF] text-white' 
            : 'bg-[#F5F7FB] text-[#7C8193]'
        }`}
      >
        Todas
      </button>
      
      <button
        onClick={() => setFilter('unread')}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
          filter === 'unread' 
            ? 'bg-[#6161FF] text-white' 
            : 'bg-[#F5F7FB] text-[#7C8193]'
        }`}
      >
        Sin leer ({unreadCount})
      </button>
      
      {archivedCount > 0 && (
        <button
          onClick={() => setFilter('archived')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
            filter === 'archived' 
              ? 'bg-[#7C8193] text-white' 
              : 'bg-[#F5F7FB] text-[#7C8193]'
          }`}
        >
          Archivadas ({archivedCount})
        </button>
      )}
    </div>
  </header>
  
  {/* Lista de actividades */}
  <div className="px-4 py-4 space-y-3">
    {filteredActivities.map((item) => (
      <div 
        key={item.id} 
        className={`bg-white p-4 rounded-2xl flex gap-4 items-start group hover:shadow-md transition-all border ${
          item.isRead 
            ? 'border-[#E4E7EF]' 
            : 'border-[#6161FF]/30 bg-[#6161FF]/5'
        } ${item.actionUrl ? 'cursor-pointer' : ''}`}
        onClick={() => {
          markAsRead(item.id);
          if (item.actionUrl) navigate(item.actionUrl);
        }}
      >
        {/* Icono */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${item.color}`}>
          {item.icon}
        </div>
        
        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className={`font-semibold text-sm ${
              item.isRead ? 'text-[#434343]' : 'text-[#181B34]'
            }`}>
              {item.title}
            </h3>
            <span className="text-[10px] text-[#7C8193] whitespace-nowrap">
              {item.timestamp}
            </span>
          </div>
          
          <p className="text-xs text-[#7C8193] leading-relaxed line-clamp-2">
            {item.description}
          </p>
          
          {item.actionUrl && (
            <span className="text-[10px] text-[#6161FF] mt-1 inline-block">
              Tocar para ir →
            </span>
          )}
        </div>
        
        {/* Botón archivar */}
        {filter !== 'archived' ? (
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              handleArchive(item.id); 
            }}
            className="opacity-0 group-hover:opacity-100 text-[#7C8193] hover:text-[#FB275D] transition p-1"
          >
            <X size={16} />
          </button>
        ) : (
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              handleRestore(item.id); 
            }}
            className="text-[#00CA72] hover:text-[#008A4E] transition p-1 text-xs"
          >
            Restaurar
          </button>
        )}
      </div>
    ))}
  </div>
</div>
```

---

## 🧩 Patrones Reutilizables

### Background Decorativo Estándar

```tsx
{/* Copiar al inicio de cualquier pantalla */}
<div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
  <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#6161FF]/10 blur-[100px]" />
  <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#00CA72]/10 blur-[100px]" />
  <div className="absolute top-[30%] left-[20%] w-[200px] h-[200px] rounded-full bg-[#FFCC00]/10 blur-[60px]" />
</div>
```

### Card Estándar con Elevación

```tsx
{/* Card básica blanca */}
<div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-[#E4E7EF]">
  {/* Contenido */}
</div>

{/* Card con elevación más pronunciada */}
<div className="bg-white rounded-2xl !overflow-visible px-6 pb-8 border border-[#E4E7EF] shadow-[0_4px_30px_rgba(0,0,0,0.08)]">
  {/* Contenido */}
</div>
```

### Input Estándar con Focus Ring

```tsx
<input 
  type="text"
  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3.5 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all"
  placeholder="Escribe aquí..."
/>
```

### Botón Primario con Gradiente Verde

```tsx
<button 
  type="submit"
  className="w-full bg-gradient-to-r from-[#00CA72] to-[#4AE698] text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-[0_8px_20px_rgba(0,202,114,0.35)] transition-all shadow-md flex items-center justify-center gap-3 group disabled:opacity-50"
>
  Texto del Botón
  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
</button>
```

### Botón Secundario con Gradiente Morado-Verde

```tsx
<button 
  className="w-full py-3 bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white rounded-xl font-semibold hover:opacity-90 transition"
>
  Guardar cambios
</button>
```

### Botón Terciario (Borde)

```tsx
<button 
  className="px-4 py-2 rounded-full border border-[#6161FF]/30 text-[#6161FF] hover:bg-[#6161FF]/10 transition"
>
  Acción Secundaria
</button>
```

### Badge de Estado

```tsx
{/* Success */}
<span className="px-4 py-1.5 rounded-full text-xs font-semibold border bg-[#E6FFF3] border-[#00CA72]/30 text-[#00CA72]">
  ✓ Completado
</span>

{/* Warning */}
<span className="px-4 py-1.5 rounded-full text-xs font-semibold border bg-[#FFEDB3] border-[#FFCC00]/30 text-[#9D6B00]">
  ○ En Proceso
</span>

{/* Danger */}
<span className="px-4 py-1.5 rounded-full text-xs font-semibold border bg-[#FFF0F3] border-[#FB275D]/30 text-[#FB275D]">
  ✗ Pendiente
</span>
```

### Header Sticky con Backdrop Blur

```tsx
<header className="px-6 py-6 sticky top-0 z-30 backdrop-blur-xl bg-white/90 border-b border-[#E4E7EF] shadow-sm">
  <h1 className="text-2xl font-bold text-[#181B34]">Título</h1>
  <p className="text-[#7C8193] text-sm">Subtítulo</p>
</header>
```

### Label Estándar

```tsx
<label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">
  Nombre del Campo
</label>
```

### Mensaje de Error

```tsx
<p className="text-[#FB275D] text-sm text-center">Mensaje de error aquí</p>
```

### Divider con Texto

```tsx
<div className="mt-6 pt-4 border-t border-[#E4E7EF]">
  {/* Contenido después del divider */}
</div>
```

---

## 🚀 Estrategia de Reintegración

### FASE 1: Variables Globales (30 min)

**Objetivo:** Establecer la base de diseño en todo el proyecto

#### Archivos a Modificar:
- `index.css`

#### Acciones:
1. **Copiar variables CSS completas** de `OTROS/RESPALDO/index.css` (líneas 1-81)
2. **Verificar que todas las clases de utilidad estén disponibles:**
   - `.glass`, `.glass-dark`
   - `.btn-primary`, `.btn-secondary`
   - `.card`, `.card-elevated`
   - `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-accent`
   - Clases de safe-area para iPhone
3. **Añadir animaciones faltantes** (fadeIn, slideUp, pulse-glow)

#### Validación:
- ✅ Todas las variables `--color-*` están definidas
- ✅ Gradientes `--gradient-*` funcionan
- ✅ Clases `.btn-*` y `.badge-*` disponibles

---

### FASE 2: LoginScreen (1-2 horas)

**Objetivo:** Restaurar el diseño hermoso de la pantalla de login/registro

#### Archivos a Modificar:
- `screens/auth/LoginScreen.tsx`

#### Código a Copiar:
- **Líneas 618-717** del original para el diseño completo
- Mantener la lógica actual del nuevo LoginScreen (registro, validaciones, Firebase)
- Solo reemplazar las clases CSS y estructura visual

#### Elementos a Restaurar:
1. **Background decorativo** (3 círculos blur)
2. **Logo centrado** con `max-w-[380px]`
3. **Card principal** con `rounded-3xl` y shadow custom
4. **Inputs** con `rounded-xl` y `p-3.5`
5. **Botón CTA** con gradiente verde
6. **Menú de desarrollo** colapsable

#### Validación:
- ✅ Background con círculos borrosos visible
- ✅ Card con bordes redondeados y sombra correcta
- ✅ Inputs con focus ring morado
- ✅ Botón verde con hover shadow
- ✅ Responsive en móvil y desktop

---

### FASE 3: Video de Carga Inicial (30 min)

**Objetivo:** Verificar que el video de carga funciona correctamente

#### Archivos a Verificar:
- `components/CosmicLoadingAnimation.tsx` (ya existe)
- `/public/newtribuloading.mp4` o `/public/tribuvideo.mp4`

#### Acciones:
1. Confirmar que el componente `CosmicLoadingAnimation` existe
2. Verificar que esté integrado en el flujo de `/searching`
3. Asegurar que el video se reproduce correctamente
4. Configurar duración y transición suave

#### Validación:
- ✅ Video aparece al iniciar sesión
- ✅ Duración correcta (~3-5 segundos)
- ✅ Transición suave al dashboard

---

### FASE 4: Barra de Navegación Inferior (1 hora)

**Objetivo:** Restaurar la barra de navegación con el diseño original

#### Archivos a Modificar:
- `components/layout/AppLayout.tsx`

#### Código a Copiar:
- **Líneas 4478-4540** del original

#### Elementos a Restaurar:
1. **Background translúcido** verde pastel `rgba(232, 245, 233, 0.98)`
2. **Backdrop blur** con `backdrop-blur-xl`
3. **Safe areas iPhone** con `paddingBottom: calc(env(safe-area-inset-bottom, 0px) + 6px)`
4. **5 botones estándar** (NO botón central elevado):
   - Dashboard
   - Tribu
   - Actividad
   - Perfil
   - (Opcional: Menú hamburguesa o Beneficios)
5. **Estados activos** con color verde `#00CA72`
6. **Hardware acceleration** con `transform: translate3d(0,0,0)`

#### Validación:
- ✅ Barra visible en todas las pantallas correctas
- ✅ 5 botones visibles y funcionales
- ✅ Color verde en estado activo
- ✅ Safe area funciona en iPhone
- ✅ Transiciones suaves

---

### FASE 5: Dashboard (2 horas)

**Objetivo:** Restaurar el diseño del Dashboard principal

#### Archivos a Modificar:
- `screens/dashboard/Dashboard.tsx`

#### Código a Copiar:
- **Líneas 3571-3690** del original

#### Elementos a Restaurar:
1. **Header sticky** con backdrop blur
2. **Stats cards** con colores sólidos (morado, verde, rojo)
3. **Match cards** con avatares, badges de score y hover effects
4. **Spacing y shadows** consistentes

#### Validación:
- ✅ Header con glassmorphism
- ✅ Stats cards con colores correctos
- ✅ Match cards con diseño completo
- ✅ Hover effects funcionando

---

### FASE 6: Mi Tribu (2-3 horas)

**Objetivo:** Restaurar el checklist de reciprocidad

#### Archivos a Modificar:
- `screens/tribe/TribeAssignmentsView.tsx`

#### Código a Copiar:
- **Líneas 1480-1900** del original

#### Elementos a Restaurar:
1. **Header con badge de estado**
2. **Progress card grande** con gradiente morado-verde
3. **Listas con checkboxes** y estados visuales
4. **Botones de acción** (Yo compartí, Avisarle, Reportar)
5. **Modales de registro**

#### Validación:
- ✅ Progress card con porcentaje grande
- ✅ Checkboxes con estados correctos
- ✅ Botones de acción funcionales
- ✅ Modales con diseño correcto

---

### FASE 7: Perfiles (MyProfile + ProfileDetail) (2 horas)

**Objetivo:** Restaurar diseño de vistas de perfil

#### Archivos a Modificar:
- `screens/profile/MyProfileView.tsx`
- `screens/profile/ProfileDetail.tsx`

#### Código a Copiar:
- **Líneas 1902-2718** (MyProfileView)
- **Líneas 2719-2854** (ProfileDetail)

#### Elementos a Restaurar:
1. **Cover con avatar flotante**
2. **Botones de edición** con overlay
3. **Grid de información** (ubicación, fundación)
4. **Enlaces con iconos y hover**
5. **Tags con border hover**

#### Validación:
- ✅ Avatar flotante sobre cover
- ✅ Botones de edición visibles
- ✅ Grid de información correcto
- ✅ Enlaces con hover effects

---

### FASE 8: Actividad (1 hora)

**Objetivo:** Restaurar diseño de pantalla de notificaciones

#### Archivos a Modificar:
- `screens/activity/ActivityView.tsx`

#### Código a Copiar:
- **Líneas 3036-3186** del original

#### Elementos a Restaurar:
1. **Header con filtros**
2. **Cards de notificación** con iconos y colores
3. **Estados leído/no leído**
4. **Botón de archivar**

#### Validación:
- ✅ Filtros funcionando
- ✅ Cards con colores correctos
- ✅ Estados visuales claros
- ✅ Archivar/restaurar funcional

---

## 📝 Notas Finales

### Prioridades

1. **CRÍTICO:** FASE 1 (Variables) + FASE 4 (Navegación) = Base funcional
2. **ALTO:** FASE 2 (Login) + FASE 5 (Dashboard) = Primera impresión
3. **MEDIO:** FASE 6 (Mi Tribu) = Funcionalidad core
4. **BAJO:** FASE 7-8 (Perfiles + Actividad) = Pulir detalles

### Colores Monday.com - Referencia Rápida

| Elemento | Color | Variable |
|----------|-------|----------|
| Morado principal | `#6161FF` | `--color-accent-500` |
| Verde éxito | `#00CA72` | `--color-success-500` |
| Rojo peligro | `#FB275D` | `--color-danger-500` |
| Amarillo advertencia | `#FFCC00` | `--color-warning-500` |
| Gris texto principal | `#181B34` | `--neutral-900` |
| Gris texto secundario | `#7C8193` | `--neutral-500` |
| Gris background | `#F5F7FB` | `--neutral-050` |

### Gradientes

| Nombre | Valor |
|--------|-------|
| CTA Verde | `linear-gradient(135deg, #00CA72 0%, #4AE698 100%)` |
| Hero Morado | `linear-gradient(135deg, #181B34 0%, #1B1B66 45%, #6161FF 100%)` |
| Morado-Verde | `linear-gradient(135deg, #6161FF 0%, #00CA72 100%)` |

### Safe Areas iPhone

```css
padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 6px);
padding-top: env(safe-area-inset-top, 0px);
```

---

**Documento creado:** 24 Diciembre 2024  
**Archivo de referencia:** `OTROS/RESPALDO-newUX/App.tsx` (4357 líneas)  
**CSS de referencia:** `OTROS/RESPALDO/index.css` (457 líneas)  

🎨 **¡Listo para restaurar el diseño Monday.com hermoso!**

