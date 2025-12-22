# Arquitectura Modular Propuesta

> Objetivo: descomponer el actual `App.tsx` (\~400k+ líneas) en módulos autocontenidos, con límites claros y dependencias explícitas, manteniendo a **Firestore como fuente única de verdad**.

---

## 1. Capas globales

| Capa | Responsabilidad | Recursos / Observaciones |
| --- | --- | --- |
| **Core** | Inicialización (Firebase, servicios compartidos, config), ruteo principal, providers globales. | `index.tsx`, `services/firebaseService.ts`, `contexts` generales. |
| **Dominio** | Cada módulo encapsula UI + lógica + hooks + servicios específicos. | Ver secciones 2.x. |
| **Infraestructura** | Clientes externos (Firestore, Storage, MercadoPago), helpers de persistencia, seeds. | `services/*`, `scripts/*`, `api/*`. |
| **Experiencia** | Componentes visuales reusables, layouts, theming, assets. | `components/*`, `public/*`, `index.css`. |

**Reglas:**
1. Los módulos de dominio sólo interactúan con Firestore vía servicios dedicados (no `localStorage` directo).
2. El Core monta cada módulo mediante rutas o loaders específicos; no más imports masivos en `App.tsx`.
3. Los servicios deben ser *pure data adapters*: sin UI y sin estado React.

---

## 2. Módulos de dominio

### 2.1 Autenticación & Onboarding
- **Componentes**: pantalla de login/landing, registro, recuperación, `CompleteProfile`.
- **Hooks/Contextos**: `useFirebaseAuth`, `AuthContext` (ya existe en `contexts/AuthContext.tsx`).
- **Servicios**: `firestoreService` (usuarios), `realUsersData` (legacy, migrarlo a Firestore).
- **Pendientes**: mover validaciones de perfil completo aquí; exponer estado `profileComplete` para bloquear otras rutas.

### 2.2 Membership & Pagos
- **Componentes**: `MembershipScreen`, `MembershipSection`, `PaymentResult`, modales trial.
- **Servicios**: `membershipService.ts`, `api/create-preference.ts`, `api/create-subscription.ts`.
- **Próximo paso**: consolidar funciones de trial, upgrade y registros de pago en este módulo, exponiendo un hook `useMembership()`.

### 2.3 Matching 10+10 / Tribu
- **Componentes**: `TribeAssignmentsView`, `MyTribe` widgets.
- **Servicios**: `matchService.ts`, `services/tribeAlgorithm.ts`.
- **Nueva lógica**: gating por 1.000 perfiles completos + barra/hitos. Este módulo debe suscribirse al contador global de perfiles.

### 2.4 Directorio & Comunidad
- **Componentes**: `DirectoryView`, `ProfileDetail`, feed de actividad.
- **Servicios**: `databaseService` (migrar a Firestore), endpoints de búsqueda.
- **Requisito**: sólo mostrar perfiles con `status: active` y perfil completo.

### 2.5 Admin & Backoffice
- **Componentes**: panel inline (stats, gestión miembros, config), herramientas de seed/backups.
- **Servicios**: `services/dataPersistence.ts`, `scripts/*`, nuevas funciones de limpieza.
- **Acciones**: mover lógica de "Admin Config" fuera de `App.tsx` y crear ruta protegida.

### 2.6 Notificaciones & Mensajería
- **Componentes**: toasts, centro de notificaciones, WhatsApp CTA.
- **Servicios**: `databaseService` (notifs locales), `firebaseService` (FCM), `syncNotificationsFromFirebase`.
- **Meta**: standardizar payloads y mover a colección `notifications` en Firestore.

### 2.7 Experiencia Compartida
- `GlassCard`, loaders, animaciones, TermsModal, etc. Deben vivir en `components/` y ser totalmente stateless.

---

## 3. Roadmap de migración

1. **Extraer routing**: crear `src/routes/index.tsx` con todas las rutas y providers. `App.tsx` debería quedarse como wrapper.
2. **Mover Membership**: copiar la sección de membresía actual a `modules/membership` (UI + hooks) y exponer un provider.
3. **Onboarding completo**: consolidar las pantallas de registro/perfil en `modules/onboarding`, con validaciones centralizadas.
4. **Refactor databaseService**: reemplazar `localStorage` por llamadas a Firestore (usar `services/firebaseService.ts`). Mantener utilidades de export como helpers.
5. **Crear contador global de perfiles**: colección `stats/system` con `totalProfilesComplete`. Consumirla en barra de progreso.
6. **Admin tools**: mover configuraciones y seed scripts a `modules/admin` y exponer APIs internas (backup, wipe, etc.).

Cada paso debería incluir:
- Carpeta `modules/<nombre>` con `components/`, `hooks/`, `services/` propios.
- Tests/ejemplos mínimos (cuando apliquen) o story de UI.
- Documentación en `docs/<modulo>.md` si la lógica es compleja.

---

## 4. Dependencias y convenciones

- **Imports**: siempre desde `modules/...` o `services/...`, evitando rutas relativas profundas.
- **Estado global**: usar Context/Redux sólo cuando varios módulos lo necesitan; priorizar hooks específicos.
- **Nombrado**: `useXxx` para hooks, `XxxService` para adaptadores a Firestore/APIs, `XxxScreen` para páginas completas.
- **Tipado**: definir tipos compartidos en `types/` o en cada módulo (si son exclusivos).

---

## 5. Checklist previo al despliegue

- [ ] `App.tsx` sólo debe importar `RouterProvider` o `MainLayout` (sin lógica de negocio).
- [ ] Cada módulo confirma lectura/escritura cloud-first (Firestore).
- [ ] Scripts de backup + wipe documentados (`docs/operaciones.md`).
- [ ] Barra de progreso 1.000 usuarios integrada globalmente.
- [ ] Documentación actualizada en `README.md` y `docs/*`.

---

Esta guía sirve como blueprint para dividir el monolito actual y asegurar que los equipos futuros entiendan dónde vive cada responsabilidad. Ajusta/expande módulos según evolucionen las features.
