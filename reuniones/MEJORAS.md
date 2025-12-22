# MEJORAS PROPUESTAS (sin cambios de código)

Este documento lista mejoras posibles para **Tribu Impulsa PWA**, priorizadas y explicando **cómo se integrarían** (a nivel funcional/arquitectura), sin implementar nada aún.

---

## 1) Quick wins (alto impacto, baja complejidad)

### UI/UX
- **Consistencia de etiquetas y jerarquía visual**
  - **Qué**: Homologar títulos (“Mi Perfil” vs “Ajustes”), textos de botones, y microcopys.
  - **Cómo integrar**: Definir un “glosario UI” (nombres oficiales) y aplicarlo en navegación, menús y pantallas clave.

- **Estados vacíos / errores con feedback claro**
  - **Qué**: En pantallas como Beneficios/Directorio/Mi Tribu, mostrar empty states (sin datos / sin conexión) y CTA específico.
  - **Cómo integrar**: Componentes reutilizables de “EmptyState” + “ErrorState” con 1 CTA (Reintentar / Completar perfil / Ir a membresía).

- **Navegación: prevención de taps repetidos**
  - **Qué**: Evitar doble navegación por taps rápidos (especialmente en móvil).
  - **Cómo integrar**: Deshabilitar temporalmente el botón al navegar o usar un “navigation lock” simple con timeout.

### Accesibilidad
- **Focus visible + navegación teclado**
  - **Qué**: Asegurar focus-ring y orden de tab correcto en modales/menús.
  - **Cómo integrar**: Revisar overlay del menú y modales: focus trap, cierre con ESC, y aria-labels.

- **Contraste y tamaño de tipografía**
  - **Qué**: Verificar contrastes AA y tamaños mínimos (ya existe ajuste de tamaño; estandarizarlo).
  - **Cómo integrar**: Una mini auditoría (Lighthouse + inspección) y ajustar tokens de color/tipografía.

### Performance percibida
- **Skeleton loaders en listas**
  - **Qué**: Reemplazar “pantalla en blanco” mientras carga por skeletons.
  - **Cómo integrar**: Skeleton para tarjetas de perfil y beneficios.

---

## 2) UX/Producto (mejoras funcionales)

### Onboarding y activación
- **Onboarding guiado por objetivos (tour)**
  - **Qué**: Un tutorial corto para explicar: Mi Tribu, Beneficios, WhatsApp, Santander Academia.
  - **Cómo integrar**: Estado “tour_seen” por usuario en localStorage/Firestore; pasos tipo tooltip + highlight.

- **Checklist de perfil completo más accionable**
  - **Qué**: Mostrar exactamente “qué falta” con botones que lleven directo al campo.
  - **Cómo integrar**: Reusar validación de perfil; mapear campos faltantes -> sección del formulario.

### Membresía
- **Pantalla de membresía con propuesta de valor + prueba social**
  - **Qué**: Mejorar conversión con beneficios, testimonios, FAQ.
  - **Cómo integrar**: Sección dinámica (editable) desde Firestore para no depender de despliegues.

- **Estados de membresía más robustos**
  - **Qué**: Diferenciar “invitado”, “pendiente”, “miembro”, “admin”, “expirado”.
  - **Cómo integrar**: Un único “membership resolver” (fuente de verdad Firestore con cache local) y UI que refleje el estado.

### Pagos (MercadoPago) — paso a paso (links automáticos)

#### A) Habilitación de cuenta (operativo)
1. **Crear cuenta Mercado Pago**
   - Ideal: cuenta del negocio (empresa/emprendimiento).
2. **Verificar identidad / KYC**
   - Completar datos del titular/representante y del negocio.
3. **Configurar retiros**
   - Asociar cuenta bancaria (para liquidación/retiros).
4. **Revisar límites/comisiones y normativa local**
   - Definir si el precio final incluye comisiones o si se absorben.

#### B) Crear la aplicación y obtener credenciales (técnico)
1. **Ir a Mercado Pago Developers**
   - Crear una **Aplicación** para Tribu Impulsa.
2. **Obtener credenciales**
   - **Access Token** (privado/secreto: sólo servidor).
   - **Public Key** (público: sólo si se usa un checkout que lo requiera en frontend).
3. **Separar ambientes**
   - Usar **TEST/Sandbox** para pruebas y luego **Producción**.
4. **Crear usuarios de prueba**
   - Un usuario “vendedor/cobrador” (tu cuenta) + usuario “comprador” para pagos de prueba.

#### C) Definir modalidad de cobro
- **Pago único** (simple)
  - Útil si la membresía se activa por un período y la renovación es manual.
- **Suscripción recurrente** (recomendado para membresía mensual)
  - Útil si quieres renovación automática (con autorizaciones/renovaciones).

#### D) Links de pago automáticos (Checkout Pro)
1. **Evento de compra**
   - El usuario elige un plan y presiona “Pagar”.
2. **Crear “preferencia” en servidor**
   - Datos recomendados:
     - **Monto/plan** (precio, moneda).
     - **external_reference** = `userId` + `planId` + timestamp (para reconciliar).
     - **back_urls** (success / pending / failure) a rutas de la PWA.
     - **notification_url** (webhook) para confirmación asíncrona.
     - (Opcional) **payer** (email) si existe.
3. **Recibir el link**
   - MercadoPago devuelve un link tipo **`init_point`** (producción) o **`sandbox_init_point`** (test).
4. **Redirección y retorno**
   - La PWA redirige al usuario al link y luego vuelve por `back_urls`.
5. **Confirmación “real” del pago (regla clave UX/seguridad)**
   - No confiar sólo en la URL de retorno.
   - Confirmar el pago con:
     - **Webhook** (fuente principal), y/o
     - Verificación servidor contra MercadoPago por `payment_id`.
6. **Actualizar membresía**
   - Cuando el pago queda en **approved**:
     - Guardar en Firestore: `membership_status = miembro`.
     - Guardar datos de pago: `payment_id`, fecha, monto, plan.
   - Considerar idempotencia (si el webhook llega 2+ veces, no duplicar).

#### E) Webhooks (recomendación mínima)
1. **Registrar URL de webhook**
   - Debe ser HTTPS y estable (Cloud Function/Backend).
2. **Procesamiento**
   - Responder rápido 200 y procesar de forma segura.
3. **Validación**
   - Confirmar el pago consultando el estado en MercadoPago antes de marcar “miembro”.

#### F) Suscripciones (si se decide recurrente)
1. **Definir plan mensual**
   - Monto, periodicidad, condiciones de cancelación.
2. **Crear la suscripción por usuario**
   - Guardar `subscription_id` asociado al usuario.
3. **Renovaciones/expiración**
   - Actualizar estado según eventos de cobro (approved, failed, cancelled).

#### G) Checklist de salida a producción (go-live)
1. **Credenciales de producción activas**
2. **Back URLs y Webhook apuntando a dominio real**
3. **Plan de prueba end-to-end**
   - Pago aprobado, pago rechazado, pago pendiente.
4. **Monitoreo**
   - Logs + alertas (errores webhook, pagos pendientes).

### Beneficios (Club de Bienestar)
- **Catálogo con filtros simples**
  - **Qué**: Categorías (salud, educación, herramientas, etc.), búsqueda, favoritos.
  - **Cómo integrar**: Modelo en Firestore: `benefits` + `benefitCategories` + `userFavorites`.

- **Tracking de uso de beneficios**
  - **Qué**: “Ver cupón”, “Abrir link”, “Copiar código”, etc.
  - **Cómo integrar**: Eventos analíticos + contador por beneficio.

---

## 3) Arquitectura / Mantenibilidad

### Estado global de usuario/membresía
- **Provider único (User/Membership Context)**
  - **Qué**: Evitar duplicación de chequeos en múltiples lugares.
  - **Cómo integrar**: Context + hooks (`useCurrentUser`, `useMembership`) que expongan `status`, `loading`, `refresh()`.

### Separación por módulos
- **Dividir `App.tsx` en módulos**
  - **Qué**: Reducir riesgo al tocar un archivo gigante.
  - **Cómo integrar**: Mover pantallas a `views/`, navegación a `layout/`, utilidades a `utils/`.

### Bundle size (Vite warning > 500kb)
- **Code splitting real**
  - **Qué**: Partir chunks pesados (Firestore, data, vistas grandes).
  - **Cómo integrar**: Lazy-load de rutas (`React.lazy`) + imports dinámicos coherentes (evitar mezclar import estático y dinámico del mismo módulo).

---

## 4) Datos, seguridad y privacidad

- **Autenticación real (si aplica)**
  - **Qué**: Reforzar login con Firebase Auth (o equivalente) y no sólo localStorage.
  - **Cómo integrar**: Auth provider + reglas de Firestore por UID.

- **PII y perfiles “incompletos/migración”**
  - **Qué**: Ocultar datos sensibles por defecto y excluir perfiles incompletos del matching.
  - **Cómo integrar**: Flag `needsMigration`/`profileComplete`; condicionar render y participación en algoritmos.

- **Reglas Firestore**
  - **Qué**: Validar que sólo admin pueda editar membresías/beneficios.
  - **Cómo integrar**: `customClaims` (admin) o colección de roles + security rules.

---

## 5) Analítica, métricas y observabilidad

- **Eventos clave (GA4/Firebase Analytics)**
  - **Qué**: Medir funnel: registro → perfil completo → membresía → uso (Mi Tribu/Beneficios/Academia).
  - **Cómo integrar**: `track(eventName, payload)` centralizado + naming convention.

- **Error tracking (Sentry)**
  - **Qué**: Capturar errores en producción con contexto.
  - **Cómo integrar**: Integración Sentry + ErrorBoundary en rutas.

---

## 6) Engagement y retención

- **Notificaciones (push/email) para hitos**
  - **Qué**: Recordatorios de completar perfil, rotación mensual, nuevos beneficios.
  - **Cómo integrar**: PWA push (VAPID) o Firebase Cloud Messaging; campañas segmentadas por estado.

- **Gamificación ligera**
  - **Qué**: Medallas por completar acciones (perfil completo, 1er mensaje WhatsApp, etc.).
  - **Cómo integrar**: Tabla de logros por usuario + UI simple en perfil.

---

## 7) Matching / Rotación mensual (producto + reglas)

- **Rotación mensual automatizada**
  - **Qué**: El 1 de cada mes reasignar tribu evitando repetición completa del mes anterior.
  - **Cómo integrar**: Job programado (Cloud Functions/CRON) que guarde `monthKey` + `assignmentsHistory`.

- **Fallback inteligente si el pool no alcanza**
  - **Qué**: Permitir repetición mínima (2-3) si no hay suficientes candidatos.
  - **Cómo integrar**: “Score” por afinidad/giro/alcance y constraints suaves.

---

## 8) Admin / Operación

- **Panel Admin para Beneficios**
  - **Qué**: Crear/editar beneficios, activar/desactivar, ver métricas.
  - **Cómo integrar**: Colección `benefits` con estado; UI admin con permisos.

- **Herramientas de soporte**
  - **Qué**: Buscar usuario, resetear estado, reenviar onboarding, revisar membresía.
  - **Cómo integrar**: Acciones auditadas (`adminLogs`).

---

## Propuesta de priorización (simple)

1. **Quick wins UI/UX + Accesibilidad + estados vacíos**
2. **Beneficios v2 (catálogo + tracking)**
3. **Unificar estado (User/Membership Context) + modularizar App.tsx**
4. **Analítica + Sentry**
5. **Rotación mensual + admin tools**

---

## Preguntas para afinar (responder y lo ajusto)

- ¿Beneficios será sólo “link-out” (a partners) o habrá cupones/códigos internos?
- ¿Membresía se paga ya (MercadoPago) o sigue “beta/gratis” por ahora?
- ¿Qué 3 métricas son prioridad este mes? (ej: conversion a perfil completo, conversion a membresía, mensajes WhatsApp enviados)
