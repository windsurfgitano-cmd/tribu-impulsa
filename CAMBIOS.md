# Bitácora de Cambios - Tribu Impulsa PWA

> Registro detallado de todos los cambios realizados en la aplicación para control y facturación.

---

## 📅 Domingo 7 de Diciembre 2025

### 🎁 Beta Pública - Mes Gratis + TikTok en Perfil
**Hora:** 19:48 - 20:15 hrs  
**Solicitado por:** Usuario (Doraluz)  
**Desarrollador:** Cascade AI

#### Cambios Realizados

1. **Nueva Pantalla de Membresía - Beta Pública**
   - **Antes:** Pantalla de pago con MercadoPago/Transferencia ($20.000/mes)
   - **Ahora:** Pantalla de "Bienvenido a la Beta Pública" con mes gratis
   - **Mensaje:** "Has sido seleccionado/a entre cientos de personas para disfrutar 1 MES GRATIS"
   - **Botón:** "¡Canjear Mi Mes Gratis!" (verde, con icono de regalo)
   - **Beneficios mostrados:**
     - Acceso completo al Algoritmo Tribal 10+10
     - Conexiones con emprendedores verificados
     - Cross-promotion sin costo por 30 días
   - **Ubicación:** `App.tsx` líneas 1603-1737 (MembershipScreen)

2. **Actualización de Sección Membresía en Perfil**
   - **Antes:** Mostraba "Monto: $20.000", "Método: mercadopago/transferencia"
   - **Ahora:** Para usuarios Beta muestra:
     - "🎉 Mes Gratis - Círculo Emprendedor"
     - "Beta Pública Tribu Impulsa"
     - Fecha de activación y vencimiento
   - **Botón para invitados:** Cambiado de "Activar Membresía - $20.000/mes" a "¡Canjear Mi Mes Gratis!"
   - **Ubicación:** `App.tsx` líneas 3423-3485 (MembershipSection)

3. **Nuevo Campo TikTok en Perfil**
   - **Agregado:** Campo editable para TikTok en la sección de redes sociales
   - **Placeholder:** "@tu_tiktok"
   - **Botón:** Aparece junto a Instagram y WhatsApp cuando el usuario tiene TikTok configurado
   - **Estilo:** Botón negro con icono SVG de TikTok
   - **Ubicaciones:**
     - Campo editable: `App.tsx` líneas 3037-3044
     - Botón de vista: `App.tsx` líneas 3078-3088
     - Guardado: `App.tsx` línea 2825

4. **Import Agregado**
   - `Gift` de lucide-react para el icono de regalo en la pantalla de membresía
   - **Ubicación:** `App.tsx` línea 5

#### Archivos Modificados
```
App.tsx
- Línea 5: Import de Gift
- Líneas 1603-1737: MembershipScreen completo (reescrito)
- Líneas 2825: profileData con tiktok
- Líneas 3037-3044: Campo TikTok editable
- Líneas 3078-3088: Botón TikTok en vista
- Líneas 3423-3485: MembershipSection actualizado
```

#### Lógica de Negocio
- **Método de pago:** `beta_publica`
- **Monto:** `0` (gratis)
- **Plan:** `Círculo Emprendedor Tribu Impulsa`
- **Duración:** 30 días desde activación
- **Firebase:** Se sincroniza con colección `memberships`

#### Tiempo Estimado
**Total:** ~30 minutos

---

### 📦 FASE 1: Estructura de Datos - Categorías, Afinidades y Geografía
**Hora:** 20:15 - 20:45 hrs  
**Solicitado por:** Usuario  
**Desarrollador:** Cascade AI

#### Cambios Realizados

1. **Nuevo Archivo: `constants/categories.ts`**
   - **~180 categorías** organizadas en 17 grupos principales
   - Estructura jerárquica: Grupo > Subgrupo > Categoría
   - Grupos: Moda Mujer, Moda Hombre, Negocio, Alimentos y Gastronomía, Belleza/Estética/Bienestar, Servicios Profesionales, Educación, Arte/Diseño, Construcción, Tecnología, Turismo, Eventos, Transporte, Mascotas, Industria, Oficio, Otro
   - Funciones helper: `getCategoriesByGroup()`, `getCategoriesGrouped()`, `searchCategories()`

2. **Nuevo Archivo: `constants/affinities.ts`**
   - **20 afinidades** organizadas en 8 grupos
   - Grupos: Bienestar y Salud, Diseño y Estilo, Digital y Tecnología, Sustentabilidad, Conciencia y Propósito, Estilo de Vida, Educación y Desarrollo, Economía y Negocios
   - Función de scoring: `calculateAffinityScore()` para matching

3. **Nuevo Archivo: `constants/geography.ts`**
   - **16 regiones de Chile** con todas sus comunas (~346 comunas)
   - Tipos de alcance: `local`, `regional`, `nacional`
   - Rangos de facturación mensual (6 rangos)
   - Funciones: `getRegionByComuna()`, `getComunasByRegion()`, `checkGeographicCompatibility()`

4. **Nuevo Archivo: `constants/index.ts`**
   - Exportación centralizada de todas las constantes

#### Archivos Creados
```
constants/
├── categories.ts   (~350 líneas - 180 categorías)
├── affinities.ts   (~90 líneas - 20 afinidades)
├── geography.ts    (~180 líneas - 16 regiones, 346 comunas)
└── index.ts        (exportación)
```

#### Próximos Pasos (Fases 2-6)
- Fase 2: Integrar categorías/afinidades en formulario de registro
- Fase 3: Integrar selector de geografía
- Fase 4: Agregar campos Facebook, Otra RRSS, Facturación
- Fase 5: Actualizar algoritmo de matching
- Fase 6: Mejorar UI/UX de selectores

#### Tiempo Estimado
**Total:** ~30 minutos

---

### 🎯 FASE 2: Algoritmo de Matching Mejorado v2.0
**Hora:** 20:50 - 21:30 hrs  
**Solicitado por:** Usuario (problema reportado por Doraluz: matches malos)  
**Desarrollador:** Cascade AI

#### Problema Resuelto
- Doraluz reportó que le aparecía "un emprendimiento de construcción, 0 en común"
- El algoritmo anterior usaba scores ALEATORIOS (78-98%)
- No consideraba categorías ni afinidades reales

#### Cambios Realizados

1. **Nuevo Sistema de Compatibilidad**
   - Función `calculateCompatibilityScore()` que calcula score REAL basado en:
     - Grupos de categoría (Moda, Belleza, Gastronomía, etc.)
     - Afinidades del usuario
     - Mapa de sinergias entre rubros

2. **Mapa de Sinergias (SYNERGY_MAP)**
   - Define qué rubros tienen audiencias complementarias:
     - Moda ↔ Belleza ↔ Eventos
     - Gastronomía ↔ Eventos ↔ Turismo
     - Tecnología ↔ Arte/Diseño ↔ Educación
     - etc.

3. **Lógica de Scoring**
   - Misma categoría exacta = -20 pts (competencia directa)
   - Mismo grupo, diferente sub = +15 pts (cross-promotion)
   - Grupos con sinergia = +25 pts (audiencias complementarias)
   - Grupos sin relación = -15 pts (evitar matches malos)
   - Misma afinidad = +20 pts (comparten valores)
   - Score mínimo para match: 40 pts

4. **Funciones Actualizadas**
   - `generateTribeAssignments()` → usa compatibilidad real
   - `generateMockMatches()` → usa compatibilidad real
   - Ambas ahora filtran usuarios con score < 40

#### Archivos Modificados
```
services/matchService.ts
- Líneas 1-152: Nuevo algoritmo de compatibilidad
- Líneas 310-407: generateTribeAssignments actualizado
- Líneas 465-523: generateMockMatches actualizado
```

#### Beneficios
- ✅ No más matches de "construcción" con "bienestar"
- ✅ Prioriza usuarios con audiencias complementarias
- ✅ Considera afinidades para mejor matching
- ✅ Muestra razón real del match ("Audiencias complementarias", etc.)

#### Tiempo Estimado
**Total:** ~40 minutos

---

### 🌍 FASE 3: Selector de Geografía (Comunas y Regiones)
**Hora:** 21:15 - 21:45 hrs  
**Solicitado por:** Usuario (formulario Google Forms)  
**Desarrollador:** Cascade AI

#### Cambios Realizados

1. **Import de Constantes Geográficas**
   - Importado `REGIONS`, `ALL_COMUNAS` desde `constants/geography.ts`
   - 16 regiones de Chile con ~346 comunas disponibles

2. **Nuevos Campos en SurveyFormState**
   - `comuna: string` → Para alcance LOCAL
   - `selectedRegions: string[]` → Para alcance REGIONAL (multi-select)

3. **Selectores Condicionales en SurveyScreen**
   - **Si LOCAL:** Muestra dropdown con todas las comunas de Chile
   - **Si REGIONAL:** Muestra checkboxes con las 16 regiones
   - **Si NACIONAL:** Muestra mensaje confirmando alcance nacional

4. **Actualización de RegisterScreen**
   - Agregados campos `comuna` y `selectedRegions` al estado

#### UI/UX
- Selector de comunas: Dropdown con búsqueda (346 opciones)
- Selector de regiones: Lista de checkboxes scrolleable
- Mensaje verde para alcance nacional
- Textos explicativos de cómo afecta al matching

#### Archivos Modificados
```
App.tsx
- Línea 11: Import de REGIONS, ALL_COMUNAS
- Líneas 587-588: Nuevos campos en SurveyFormState
- Líneas 631-632: Valores vacíos en EMPTY_SURVEY_FORM
- Líneas 1254-1255: Campos en RegisterScreen
- Líneas 1332-1333: Campos en surveyData
- Líneas 2034-2094: Selectores condicionales en formulario
```

#### Próximos Pasos
- Integrar geografía en algoritmo de matching
- Agregar campo de facturación al matching

#### Tiempo Estimado
**Total:** ~30 minutos

---

## 📅 Viernes 6 de Diciembre 2025

### 🎨 Actualización de Branding - Logo y Favicon
**Hora:** 21:00 - 21:41 hrs  
**Solicitado por:** Usuario  
**Desarrollador:** Cascade AI

#### Cambios Realizados

1. **Actualización de Logo Principal**
   - **Archivo anterior:** `LogoTribuImpulsa.png`
   - **Archivo nuevo:** `NuevoLogo.jpeg` (45 KB)
   - **Ubicaciones actualizadas:**
     - Pantalla de login (App.tsx línea 959)
     - Formulario de registro paso 1 (App.tsx línea 1368)
     - Formulario de inscripción (App.tsx línea 1939)
   - **Commits:**
     - `a235165` - "feat: update all logos to NuevoLogo.jpeg and favicon to isotipo.PNG"
     - `6aa9d92` - "fix: ensure NuevoLogo.jpeg and isotipo.PNG are in build"

2. **Actualización de Favicon**
   - **Archivo anterior:** `/icons/icon-72.png`
   - **Archivo nuevo:** `isotipo.PNG` (1.3 MB)
   - **Ubicación:** `index.html` línea 29
   - **Commit:** `a235165`

3. **Regeneración de Iconos PWA**
   - Actualizado script `generateIcons.cjs` para usar `LogoTribuImpulsa.png`
   - Regenerados 13 iconos PWA (72x72 hasta 512x512)
   - Regenerado favicon.png (32x32)
   - **Commit:** `ad23c6c` - "chore: regenerate favicon and PWA icons with LogoTribuImpulsa.png, add OTROS/ to gitignore"

4. **Organización de Archivos**
   - Creada carpeta `OTROS/` para documentación y respaldos
   - Movidos 116 archivos no esenciales a `OTROS/`
   - Agregado `OTROS/` a `.gitignore`
   - **Objetivo:** Mantener repo limpio solo con archivos de PWA y Santander Academia
   - **Commit:** `ad23c6c`

5. **Fix Deploy Vercel**
   - Problema: Imágenes no se incluían en build de Vercel
   - Solución: Agregados explícitamente `NuevoLogo.jpeg` e `isotipo.PNG` al repo
   - **Commit:** `6aa9d92`

#### Archivos Modificados
```
App.tsx (3 referencias de logo actualizadas)
index.html (favicon actualizado)
scripts/generateIcons.cjs (source logo actualizado)
.gitignore (agregado OTROS/)
public/NuevoLogo.jpeg (nuevo)
public/isotipo.PNG (nuevo)
public/favicon.png (regenerado)
public/icons/* (13 archivos regenerados)
```

#### Commits en GitHub
- `ad23c6c` - Regeneración de iconos PWA y organización de archivos
- `a235165` - Actualización de logos y favicon
- `6aa9d92` - Fix para deploy en Vercel

#### Estado
- ✅ Cambios pusheados a `main`
- ✅ Deploy automático en Vercel en proceso
- ⏳ Pendiente: Verificar que logo aparezca en www.tribuimpulsa.cl

#### Tiempo Estimado
**Total:** ~40 minutos
- Actualización de código: 10 min
- Regeneración de assets: 5 min
- Organización de archivos: 10 min
- Troubleshooting deploy: 15 min

---

## 📋 Cambios Anteriores

### 🔄 Actualización de Logo PWA (Commit Previo)
**Fecha:** 6 Diciembre 2025, 20:00-21:00 hrs

1. **Primera Actualización de Logo**
   - Actualizado a `Logo-Tribu_.png`
   - Regenerados iconos PWA
   - **Commits:**
     - `58eb813` - "chore(pwa): update logo and regenerate icons"
     - `4dacef9` - "docs: add CHANGELOG.md tracking PWA logo update"
     - `2670147` - Merge a main

2. **Fix Build**
   - Removidos imports de academia que rompían build
   - **Commit:** `3413538` - "fix: remove academia imports breaking build"

3. **Trigger Rebuild**
   - Commit vacío para forzar redeploy
   - **Commit:** `4e62476` - "chore: trigger rebuild for logo update"

#### Tiempo Estimado
**Total:** ~60 minutos

---

## 📊 Resumen de Sesión (6 Dic 2025)

**Tiempo Total:** ~100 minutos  
**Commits Totales:** 8  
**Archivos Modificados:** 20+  
**Archivos Organizados:** 116 (movidos a OTROS/)

**Tareas Completadas:**
- ✅ Actualización completa de branding (logo + favicon)
- ✅ Regeneración de assets PWA
- ✅ Organización de repositorio
- ✅ Fix de build en Vercel
- ✅ Documentación en CHANGELOG.md

---

## 🔜 Próximos Pasos

1. Verificar deploy en www.tribuimpulsa.cl
2. Confirmar que logo y favicon se ven correctamente
3. Continuar con desarrollo de Santander Academia (rama separada)

---

**Nota:** Este documento se actualiza con cada cambio para mantener trazabilidad completa del desarrollo.
