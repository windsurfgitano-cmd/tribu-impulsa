# Paleta Tribu Impulsa inspirada en monday.com

## 1. Principios
- Mantener la lógica "semáforo" roja-amarilla-verde para representar **stuck / working on it / done**.
- Usar **Monday Purple** (#6161FF) como color de acentos tecnológicos y elementos destacados.
- Complementar con neutros profundos (#181B34) y cálidos (#434343) para texto y fondos.
- Garantizar contraste AA en textos críticos (ratio ≥ 4.5) mezclando fondos oscuros con textos claros y viceversa.

## 2. Tokens principales
| Token | Hex | Roles sugeridos |
| --- | --- | --- |
| `color-danger` | `#FB275D` | Alertas, estados "stuck", CTA secundarios urgentes |
| `color-warning` | `#FFCC00` | Estados "working on it", indicadores de progreso pendiente |
| `color-success` | `#00CA72` | Estados "done", badges de objetivos cumplidos |
| `color-accent` | `#6161FF` | Elementos tecnológicos, links destacados, gráficos |
| `color-dark` | `#181B34` | Fondos hero, modales, navegación |
| `color-text` | `#434343` | Texto primario sobre fondos claros |

## 3. Shades propuestos

### 3.1 Rojo – `color-danger`
| Shade | Hex | Uso |
| --- | --- | --- |
| `danger-050` | `#FFF0F5` | Fondos sutiles (toasts suaves)
| `danger-100` | `#FFD5E1` | Badges secundarios, hover de botones outline
| `danger-300` | `#FF8EA9` | Bordes, iconos informativos
| `danger-500` | `#FB275D` | Base (botones, estados críticos)
| `danger-700` | `#C11243` | Texto/icono sobre fondos claros, focos
| `danger-900` | `#7A0F2C` | Backgrounds profundos, gráficos con contraste

### 3.2 Amarillo – `color-warning`
| Shade | Hex | Uso |
| --- | --- | --- |
| `warning-050` | `#FFF8E1` | Fondos de alertas suaves
| `warning-100` | `#FFEDB3` | Badges informativos, highlights
| `warning-300` | `#FFE066` | Barras de progreso, íconos
| `warning-500` | `#FFCC00` | Estados principales "working on it"
| `warning-700` | `#E0A800` | Texto/icono, contrastes en fondos claros
| `warning-900` | `#8C6400` | Data viz, bordes fuertes

### 3.3 Verde – `color-success`
| Shade | Hex | Uso |
| --- | --- | --- |
| `success-050` | `#E6FFF3` | Fondos de checklist completado
| `success-100` | `#C1F8DF` | Cards informativas, hover
| `success-300` | `#4AE698` | Barras de progreso, acentos
| `success-500` | `#00CA72` | Estado "done", botones principales
| `success-700` | `#008C4F` | Texto/icono sobre fondos claros
| `success-900` | `#005432` | Fondos oscuros, gráficos high-contrast

### 3.4 Purple – `color-accent`
| Shade | Hex | Uso |
| --- | --- | --- |
| `accent-050` | `#F3F3FF` | Background en tarjetas tech
| `accent-100` | `#DCDCFD` | Bordes, inputs focus
| `accent-300` | `#A4A4FF` | Tooltips, gráficos
| `accent-500` | `#6161FF` | Links, toggles activos
| `accent-700` | `#2C2CA0` | Texto/iconos oscuros
| `accent-900` | `#1B1B66` | Fondos profundos combinados con degradés

## 4. Escala neutral
| Token | Hex | Uso |
| --- | --- | --- |
| `neutral-000` | `#FFFFFF` | Fondos principales
| `neutral-050` | `#F5F7FB` | Superficies secundarias
| `neutral-100` | `#E4E7EF` | Divisores, bordes suaves
| `neutral-300` | `#B3B8C6` | Texto secundario
| `neutral-500` | `#7C8193` | Placeholders, iconos muted
| `neutral-700` | `#434343` | Texto primario sobre fondo claro
| `neutral-900` | `#181B34` | Fondos oscuros, texto inverso

### Gradientes sugeridos
1. `gradient-tribe`: `linear-gradient(135deg, #022C22 0%, #005432 45%, #00CA72 100%)`
2. `gradient-hero`: `linear-gradient(160deg, #181B34 0%, #1B1B66 55%, #6161FF 100%)`
3. `gradient-warning`: `linear-gradient(135deg, #FFEDB3 0%, #FFCC00 70%, #E0A800 100%)`

## 5. Semántica UI
- **Estados**: `danger` → reportes, `warning` → tareas pendientes, `success` → completados.
- **Ilustraciones y gráficos**: Purple y neutros para bases, acentos con primarios.
- **Accesos rápidos / CTA**: combinar `success-500` con `accent-500` para botones principales/secundarios.
- **Checklist 10+10**: usar `success-100` como fondo cuando ambas partes han marcado cumplimiento; `warning-050` cuando falta confirmación.

## 6. Implementación sugerida (CSS variables)
```css
:root {
  --color-danger-050: #FFF0F5;
  --color-danger-100: #FFD5E1;
  --color-danger-500: #FB275D;
  --color-danger-700: #C11243;
  --color-danger-900: #7A0F2C;
  --color-warning-050: #FFF8E1;
  --color-warning-100: #FFEDB3;
  --color-warning-500: #FFCC00;
  --color-warning-700: #E0A800;
  --color-warning-900: #8C6400;
  --color-success-050: #E6FFF3;
  --color-success-100: #C1F8DF;
  --color-success-500: #00CA72;
  --color-success-700: #008C4F;
  --color-success-900: #005432;
  --color-accent-050: #F3F3FF;
  --color-accent-100: #DCDCFD;
  --color-accent-500: #6161FF;
  --color-accent-700: #2C2CA0;
  --color-accent-900: #1B1B66;
  --neutral-000: #FFFFFF;
  --neutral-050: #F5F7FB;
  --neutral-300: #B3B8C6;
  --neutral-500: #7C8193;
  --neutral-700: #434343;
  --neutral-900: #181B34;
}
```
*Añade las demás tonalidades si necesitas más granularidad en componentes específicos.*

## 7. Próximos pasos
1. Actualizar componentes (ej. `App.tsx`, `GlassCard`) para leer variables CSS en vez de hex inline.
2. Definir tokens semánticos (`--color-success-background`, `--color-warning-border`, etc.) a partir de esta escala para facilitar el theming.
3. Validar contraste en las pantallas principales y ajustar donde sea necesario (especialmente sobre fondos oscuros).
