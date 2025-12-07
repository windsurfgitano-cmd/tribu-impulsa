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
