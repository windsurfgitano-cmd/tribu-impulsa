# Changelog - Tribu Impulsa PWA

## [Unreleased]

### 2025-12-06 - Actualización de Logo y Assets PWA
**Branch:** `feature/update-logo-pwa`
**Commit:** `58eb813`

#### Cambios
- ✅ Actualizado logo principal a `Logo-Tribu_.png` (518 KB)
- ✅ Copiado logo a `public/Logo-Tribu_.png` para servir en PWA
- ✅ Regenerados todos los iconos PWA desde nuevo logo:
  - `icon-72.png` a `icon-512.png` (8 tamaños)
  - `apple-touch-icon.png` y variantes (4 tamaños)
  - `favicon.png` (32x32)
- ✅ Script `generateIcons.cjs` actualizado para usar `Logo-Tribu_.png`

#### Archivos modificados
```
public/Logo-Tribu_.png (nuevo)
public/favicon.png
public/icons/icon-72.png
public/icons/icon-96.png
public/icons/icon-128.png
public/icons/icon-144.png
public/icons/icon-152.png
public/icons/icon-192.png
public/icons/icon-384.png
public/icons/icon-512.png
public/icons/apple-touch-icon.png
public/icons/apple-touch-icon-120.png
public/icons/apple-touch-icon-152.png
public/icons/apple-touch-icon-167.png
scripts/generateIcons.cjs
```

#### Referencias en código
- `App.tsx` línea 960: Logo pantalla login
- `App.tsx` línea 1369: Logo formulario registro paso 1
- `App.tsx` línea 1940: Logo formulario inscripción

#### Estado
- ✅ Pusheado a GitHub: `feature/update-logo-pwa`
- ⏳ Pendiente: PR a `main`

---

## En desarrollo (NO pusheado)

### Santander Academia
**Branch:** `feature/santander-academia` (local)

#### Archivos pendientes
```
components/academia/ (nuevo)
services/academiaService.ts (nuevo)
types-academia.ts (nuevo)
santander.md (nuevo)
bench.md (nuevo)
App.tsx (modificado - cambios mezclados)
package-lock.json (modificado)
```

**Nota:** Mantener separado de cambios PWA hasta completar funcionalidad.

---

## Historial

### 2025-12-03
- Commit `ff82124`: Documentación MAPA v2.1 (88 cambios, 108 commits)
- Commit `4695e4d`: MAPA_SITIO_PWA.md v2.0 (gamificación, roadmap)
