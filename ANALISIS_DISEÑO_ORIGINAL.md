# Análisis del Diseño Original - App.tsx Monolítico

## 🎨 PALETA DE COLORES ORIGINAL (OTROS/RESPALDO/index.css)

### Colores Primarios
```css
/* Danger (rojo) - Estados stuck, alertas */
--color-danger-050: #FFF0F5;
--color-danger-100: #FFD5E1;
--color-danger-300: #FF8EA9;
--color-danger-500: #FB275D;
--color-danger-700: #C11243;
--color-danger-900: #7A0F2C;

/* Warning (amarillo) - Working on it */
--color-warning-050: #FFF8E1;
--color-warning-100: #FFEDB3;
--color-warning-300: #FFE066;
--color-warning-500: #FFCC00;
--color-warning-700: #E0A800;
--color-warning-900: #8C6400;

/* Success (verde) - Done, completado */
--color-success-050: #E6FFF3;
--color-success-100: #C1F8DF;
--color-success-300: #4AE698;
--color-success-500: #00CA72;
--color-success-700: #008C4F;
--color-success-900: #005432;

/* Accent (purple) - Tecnología, links */
--color-accent-050: #F3F3FF;
--color-accent-100: #DCDCFD;
--color-accent-300: #A4A4FF;
--color-accent-500: #6161FF;
--color-accent-700: #2C2CA0;
--color-accent-900: #1B1B66;

/* Lila Pastel - Estados especiales, afinidades */
--color-lila-050: #FAF5FF;
--color-lila-100: #E8D5FF;
--color-lila-300: #C9A8FF;
--color-lila-500: #A78BFA;
--color-lila-700: #7C3AED;
--color-lila-900: #5B21B6;

/* Fucsia Pastel - Notificaciones, highlights */
--color-fucsia-050: #FDF2F8;
--color-fucsia-100: #FFD5E5;
--color-fucsia-300: #FF9EC4;
--color-fucsia-500: #EC4899;
--color-fucsia-700: #BE185D;
--color-fucsia-900: #831843;

/* Lavanda - Hover, selecciones */
--color-lavanda: #DDD6FE;
--color-rosa-suave: #FDF2F8;

/* Neutrales */
--neutral-000: #FFFFFF;
--neutral-050: #F5F7FB;
--neutral-100: #E4E7EF;
--neutral-300: #B3B8C6;
--neutral-500: #7C8193;
--neutral-700: #434343;
--neutral-900: #181B34;
```

### Gradientes
```css
--gradient-tribe: linear-gradient(135deg, #181B34 0%, #1B1B66 45%, #6161FF 100%);
--gradient-hero: linear-gradient(160deg, #181B34 0%, #1B1B66 55%, #6161FF 100%);
--gradient-success: linear-gradient(135deg, #005432 0%, #00CA72 100%);
--gradient-warning: linear-gradient(135deg, #FFEDB3 0%, #FFCC00 100%);
--gradient-cta: linear-gradient(135deg, #00CA72 0%, #4AE698 100%);
```

## 🔲 FORMAS Y ESPACIADO

### Border Radius
- **Cards principales**: `rounded-3xl` (24px)
- **Inputs y botones**: `rounded-xl` (12px)
- **Elementos pequeños**: `rounded-lg` (8px)
- **Círculos decorativos**: `rounded-full`

### Sombras
- **Cards principales**: `shadow-[0_8px_40px_rgba(0,0,0,0.08)]`
- **Botones hover**: `hover:shadow-[0_8px_20px_rgba(0,202,114,0.35)]`
- **Botones base**: `shadow-md`
- **Botones hover elevados**: `hover:shadow-lg`

### Padding
- **Cards grandes**: `p-8` (32px)
- **Inputs**: `p-4` (16px) o `p-3.5` (14px)
- **Botones**: `py-3.5` (14px vertical), `py-4` (16px vertical)
- **Elementos pequeños**: `p-3` (12px)

### Blur Effects
- **Decoraciones grandes**: `blur-[100px]`
- **Decoraciones medianas**: `blur-[80px]`
- **Decoraciones pequeñas**: `blur-[60px]`

## 🎯 COMPONENTES CLAVE

### 1. Login Screen
```tsx
// Fondo
bg-[#F5F7FB]

// Decoraciones de fondo
<div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#6161FF]/10 blur-[100px]" />
<div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#00CA72]/10 blur-[100px]" />
<div className="absolute top-[30%] left-[20%] w-[200px] h-[200px] rounded-full bg-[#FFCC00]/10 blur-[60px]" />

// Card principal
bg-white rounded-3xl p-8 max-w-md w-full shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-[#E4E7EF]

// Inputs
bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3.5 text-[#181B34] placeholder-[#B3B8C6] 
focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF] transition-all

// Botón principal (CTA)
bg-gradient-to-r from-[#00CA72] to-[#4AE698] text-white py-3.5 rounded-xl font-bold text-lg 
hover:shadow-[0_8px_20px_rgba(0,202,114,0.35)] transition-all shadow-md
```

### 2. Register Screen
```tsx
// Fondo similar al login
bg-[#F5F7FB]

// Decoraciones más sutiles
bg-[#6161FF]/8 blur-[80px]
bg-[#00CA72]/8 blur-[80px]

// Indicador de progreso
<div className={`h-2 w-8 rounded-full transition-all duration-500 
  ${step > i ? 'bg-gradient-to-r from-[#6161FF] to-[#00CA72]' : 
    step === i + 1 ? 'bg-[#6161FF]' : 'bg-[#E4E7EF]'}`} 
/>

// Botón de continuar
bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white py-4 rounded-xl font-bold 
shadow-md hover:shadow-lg transition-all transform hover:scale-[1.01]
```

### 3. Labels y Tipografía
```tsx
// Labels de formulario
text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide

// Títulos principales
text-2xl font-bold text-[#181B34]

// Subtítulos
text-[#7C8193] text-sm mt-1

// Texto secundario
text-[#7C8193]

// Texto de error
text-[#FB275D] text-sm
```

### 4. Estados de Input
```tsx
// Normal
border-[#E4E7EF]

// Error
border-[#FB275D]

// Focus
focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF]
```

### 5. Botones Secundarios
```tsx
// Botón seleccionado
bg-[#6161FF] text-white

// Botón no seleccionado
bg-[#F5F7FB] border border-[#E4E7EF] text-[#434343] hover:border-[#6161FF]
```

## 📐 SISTEMA DE DISEÑO

### Colores de Texto
- **Primario**: `text-[#181B34]` o `text-[#434343]`
- **Secundario**: `text-[#7C8193]`
- **Placeholder**: `placeholder-[#B3B8C6]`
- **Accent**: `text-[#6161FF]`
- **Success**: `text-[#00CA72]`
- **Error**: `text-[#FB275D]`

### Colores de Fondo
- **Principal**: `bg-[#F5F7FB]`
- **Card**: `bg-white`
- **Input**: `bg-[#F5F7FB]`
- **Hover sutil**: `hover:bg-white`

### Bordes
- **Ligero**: `border-[#E4E7EF]`
- **Medio**: `border-[#B3B8C6]`
- **Accent**: `border-[#6161FF]`

### Transiciones
- **Estándar**: `transition-all`
- **Colores**: `transition-colors`
- **Transform**: `transition-transform`
- **Duración progreso**: `duration-500`

### Hover Effects
- **Escala sutil**: `hover:scale-[1.01]`
- **Translate icon**: `group-hover:translate-x-1`
- **Cambio de color**: `hover:text-[#6161FF]`
- **Sombra elevada**: `hover:shadow-lg`

## 🎨 CARACTERÍSTICAS VISUALES DISTINTIVAS

1. **Fondos con blur decorativo**: Círculos grandes con colores de marca y blur pesado
2. **Cards con sombra suave**: Sombra extendida pero muy sutil (0.08 opacity)
3. **Gradientes vibrantes**: De verde a verde claro, de morado a verde
4. **Border radius generoso**: 24px para cards, 12px para inputs
5. **Focus rings sutiles**: Ring con 30% de opacidad del color accent
6. **Tipografía uppercase en labels**: Tracking wide para labels pequeños
7. **Transiciones suaves**: Todo con transition-all
8. **Hover states claros**: Cambios de color y sombra

