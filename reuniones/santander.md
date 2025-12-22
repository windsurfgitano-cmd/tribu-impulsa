# Santander Academia – Registro de decisiones

## Contexto inicial

- Rama de trabajo: `feature/santander-academia`
- Objetivo: diseñar la lógica y UI base de la pestaña **SANTANDER ACADEMIA** sin afectar aún la versión de producción.
- Estrategia: primero lógica y componentes aislados, luego integración controlada en rutas / navegación.

## Estructura creada (v1)

- `types-academia.ts`
  - Define tipos principales:
    - `Capsula`
    - `ProgresoUsuario`
    - `Insignia`
    - `Certificado`
    - `RutaAprendizaje`
    - `Gamification`

- `services/academiaService.ts`
  - Servicio `AcademiaService` (singleton) con:
    - Mock de cápsulas `CAPSULAS_MOCK`
    - Rutas de aprendizaje `RUTAS_APRENDIZAJE`
    - Config de gamificación `GAMIFICATION_CONFIG`
    - Métodos:
      - `getCapsulas()` / `getCapsulaById()` / `getCapsulasByCategoria()` / `getCapsulasByNivel()`
      - `getRutasAprendizaje()`
      - `getProgresoUsuario(userId)` (mock in-memory por ahora)
      - `completarCapsula(userId, capsulaId)`
      - `iniciarCapsula(userId, capsulaId)`
      - `getEstadisticasUsuario(userId)`
      - `getCapsulasRecomendadas(userId)`

- `components/academia/AcademiaDashboard.tsx`
  - Dashboard visual para:
    - Mostrar stats de progreso (puntos, nivel, racha, cápsulas completadas).
    - Listar cápsulas recomendadas.
    - Listar todas las cápsulas con botones de `Iniciar` / `Completar`.

- `components/academia/AcademiaView.tsx`
  - Contenedor de la vista **Santander Academia** con pestañas:
    - `Dashboard`
    - `Cápsulas`
    - `Mi Progreso`
    - `Rutas`
  - Las sub-vistas `CapsulasView`, `ProgresoView`, `RutasView` están en modo **placeholder** (texto "en desarrollo").

## Decisiones importantes

- **No integrar aún** en la navegación principal ni en rutas críticas (login, dashboard, etc.).
- Mantener todo en rama `feature/santander-academia` hasta que se valide UX y lógica.
- Por ahora el progreso de usuario es **mock in-memory**; más adelante se conectará a Firebase/Firestore.

## Ruta de laboratorio creada

- Se creó una ruta **no visible en la navegación principal**:
  - Path: `/santander-lab`
  - Componente: `AcademiaView`
  - Prop `onNavigateBack`: usa `window.history.back()` para volver a la pantalla anterior.

### Cómo probar

1. Levantar la app normalmente (`npm run dev` o flujo estándar del proyecto).
2. Hacer login como usuario normal.
3. En el navegador, ir manualmente a: `/#/santander-lab` (usa HashRouter).
4. Validar que se muestra la vista de Santander Academia con:
   - Dashboard de progreso mock.
   - Listado de cápsulas mock.
   - Tabs `Dashboard / Cápsulas / Mi Progreso / Rutas` (algunas aún en modo placeholder).

## Próximos pasos posibles

1. Conectar el progreso de usuario al modelo real de usuarios y Firebase.
2. Definir catálogo real de cápsulas de Santander + rutas oficiales.
3. Diseñar esquema de gamificación final (niveles, badges, puntos definitivos).

*(Este archivo se irá actualizando con cada decisión / cambio relevante de Santander Academia.)*
