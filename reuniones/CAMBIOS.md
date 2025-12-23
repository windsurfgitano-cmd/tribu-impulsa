# Bitácora de Cambios - Tribu Impulsa PWA

> Registro de mejoras y funcionalidades implementadas.

---

## ✅ COMPLETADO (Diciembre 2025)

| # | Mejora | Fecha |
|---|--------|-------|
| 82 | **✅ FIX PRODUCCIÓN CRÍTICO: Eliminado Tailwind CDN e importmap de desarrollo de index.html que bloqueaban la app completamente** | 23 Dic |
| 81 | **✅ FIX RUNTIME ERRORS: Corregido AdminPanelInline undefined, movido AcademiaViewWrapper, limpieza 50+ imports innecesarios en App.tsx** | 23 Dic |
| 80 | **✅ FIX BUILD ERROR: Eliminado código duplicado de App.tsx (1633L→401L, -75%), corregidos imports relativos en módulos, build exitoso en Vercel** | 23 Dic |
| 79 | **✅ ESTABILIZACIÓN POST-REFACTORIZACIÓN: Base de datos limpia (9 usuarios), persistencia completa (businessDescription agregado), PDFs legales creados, PIN desarrollo corregido, documentación MercadoPago actualizada** | 23 Dic |
| 78 | **✅ REFACTORIZACIÓN COMPLETA: Arquitectura modular implementada. App.tsx reducido de 7,700L a 1,501L (-80.5%). Todos los componentes migrados a estructura screens/components/** | 23 Dic |
| 77 | **Refactorización Fase 4b COMPLETADA: TribeAssignmentsView migrado a screens/tribe/ (3636L eliminadas de App.tsx, -62% del tamaño original)** | 23 Dic |
| 76 | **Refactorización Fase 4b: LoginScreen migrado a screens/auth/ (1130L eliminadas de App.tsx)** | 23 Dic |
| 75 | **Refactorización Fase 4b (progreso): SurveyScreen migrado a screens/survey/** | 23 Dic |
| 74 | **Refactorización Fase 4b (progreso): RegisterScreen migrado a screens/auth/, LoginScreen (~1130L) y TribeAssignmentsView (~2900L) pendientes** | 23 Dic |
| 73 | **Refactorización Fase 4b (inicio): Migrado MembershipScreen a screens/membership/** | 23 Dic |
| 72 | **Refactorización Fase 4a: Migradas pantallas medianas (ActivityView, DirectoryView, ClubBienestarView) a estructura modular** | 23 Dic |
| 71 | **Arquitectura modular: nueva estructura de carpetas (screens/, hooks/, utils/, services/) para refactorización gradual de App.tsx** | 23 Dic |
| 70 | **Fix contador Rally -20: corregido decremento erróneo en syncProfileCompletionState, solo decrementa cuando profileComplete pasa de true a false** | 23 Dic |
| 69 | **Fix validación perfil: eliminado "Onboarding completado", logging detallado guardado (bio/businessDescription/revenue), recarga forzada post-save** | 23 Dic |
| 68 | **Fix banners duplicados: eliminado banner naranja, mensajes user-friendly, logging de diagnóstico** | 23 Dic |
| 67 | **Fix contador Rally: sincronización automática en tiempo real, solo incrementa con perfiles completos** | 23 Dic |
| 66 | **Auditoría completa de plataforma: testing exhaustivo, reporte con 85% funcionalidades OK, 2 críticos identificados** | 23 Dic |
| 65 | **MercadoPago debugging mejorado: logging detallado, endpoint /api/health, guía diagnóstico** | 22 Dic |
| 64 | **Mi Tribu desbloqueada: muestra contenido con banner de progreso arriba (no bloquea)** | 22 Dic |
| 63 | **Loading al navegar eliminado: ya no muestra spinner al cambiar de pestaña** | 22 Dic |
| 62 | **Sistema referidos eliminado: solo botón "Compartir" simple, sin códigos** | 22 Dic |
| 61 | **Marca/Empresa prominente: tarjetas mejoradas en directorio y tribu asignada** | 22 Dic |
| 60 | **Efectos confeti (chaya): animación celebratoria al registrarse + componente reutilizable** | 22 Dic |
| 59 | **Tutorial onboarding interactivo: 5 pasos guiados con animaciones y tips** | 22 Dic |
| 58 | **Landing page Rally 1000 mejorada: urgencia, testimonios, FOMO visual, CTAs potentes** | 22 Dic |
| 57 | **Sistema de referidos completo: códigos únicos, panel UI, WhatsApp, recompensas automáticas** | 22 Dic |
| 56 | **Servicio referralService.ts: generación códigos, registro referidos, otorgar meses gratis** | 22 Dic |
| 55 | **ProgressBanner gamificado: Rally 1000, hitos, FOMO (cupos + días Navidad), animaciones** | 22 Dic |
| 54 | **Fix membershipService: createdAt fallback para evitar undefined en Firestore** | 22 Dic |
| 53 | **Menús dev ocultos en producción: PIN login + Acceso admin solo visibles en dev** | 22 Dic |
| 52 | **QA end-to-end validado: login, trial, edición perfil, sync Firebase funcionando** | 22 Dic |
| 51 | **Registro/Survey v3 con SearchableSelect jerárquico (categorías/afinidades) + utilidades comunes** | 22 Dic |
| 50 | **Purge legacy incompletos (solo permanecen admins seed)** | 22 Dic |
| 49 | **Reset Firestore + seed solo admins (Dafna/Doraluz/Guillermo) + backup** | 22 Dic |
| 48 | **Gating 10+10: Mi Tribu bloqueado hasta 1000 perfiles completos** | 21 Dic |
| 47 | **Bloqueo estricto por perfil completo + sync flags Firestore** | 21 Dic |
| 46 | **ProgressBanner reusable + integración en Dashboard/Membership** | 21 Dic |
| 45 | **Script reset-firestore (backup + wipe + seed minimal)** | 21 Dic |
| 44 | **Documentación FASEII-PARTE2: Sistema de persistencia de datos** | 19 Dic |
| 43 | **Lógica robusta de guardado: 3 reintentos Firebase + mensajes claros** | 19 Dic |
| 42 | **Botón Sincronizar: sube datos locales ANTES de descargar (protección)** | 19 Dic |
| 41 | **Fix persistencia: sincronizar usuario desde Firebase al restaurar sesión** | 19 Dic |
| 34 | **Revisión exhaustiva: sincronizar categorías/afinidades en toda la app** | 19 Dic |
| 35 | **Fix IDs planes PaywallScreen → API (monthly→mensual)** | 19 Dic |
| 36 | **Actualizar tribeAlgorithm con categorías oficiales** | 19 Dic |
| 37 | **Sincronizar types.ts con sistema de categorías** | 19 Dic |
| 38 | **Políticas de Privacidad actualizadas (documento oficial)** | 19 Dic |
| 39 | **Password visibility toggle (ojito) en login y registro** | 18 Dic |
| 40 | **Disclaimer tarjeta crédito obligatoria MercadoPago** | 18 Dic |
| 1 | Cambiar "Editar Perfil" a "Completar Perfil" | 14 Dic |
| 2 | Checklist paso a paso (Mi Tribu) | 14 Dic |
| 3 | "X emprendedores esperan tu colaboración" | 14 Dic |
| 4 | Sistema 10+10 explicado en UI | 14 Dic |
| 5 | Mensaje WhatsApp automático personalizado | 14 Dic |
| 6 | Menú hamburguesa lateral | 14 Dic |
| 7 | Segmentación geográfica (Local/Regional/Nacional) | 7 Dic |
| 8 | Segmentación por facturación mensual | 7 Dic |
| 9 | Sección "¿Cómo funciona?" en Dashboard | 15 Dic |
| 10 | Navegación mejorada (Mi Tribu, Configuración) | 15 Dic |
| 11 | Fix duplicados en asignaciones | 8 Dic |
| 12 | Persistencia datos en Firebase | 8 Dic |
| 13 | Integración Santander Academia | 9 Dic |
| 14 | Módulo Club de Bienestar | 14 Dic |
| 15 | 38 afinidades en 11 grupos | 14 Dic |
| 16 | **Análisis TRIBU X con IA** | 16 Dic |
| 17 | **Modal fullscreen responsivo** | 16 Dic |
| 18 | **Botones WhatsApp personalizados** | 16 Dic |
| 19 | **Optimización iPhone 14 Pro Max** | 16 Dic |
| 20 | **Fix persistencia datos al login** | 16 Dic |
| 21 | **Botón Refrescar en perfil** | 16 Dic |
| 22 | **"¿Cómo funciona?" expandido por defecto** | 16 Dic |
| 23 | **Barra navegación inferior 5 botones** | 17 Dic |
| 24 | **Botón Beneficios en barra inferior** | 17 Dic |
| 25 | **Menú hamburguesa reubicado a barra inferior** | 17 Dic |
| 26 | **Accesibilidad: tamaño de letra global (html font-size) + escalado real** | 18 Dic |
| 27 | **Integración MercadoPago Checkout Pro (backend + webhook + UI)** | 18 Dic |
| 28 | **Términos y Condiciones con checkbox + popup descargable** | 18 Dic |
| 29 | **Trial $1 con suscripción automática (30 días)** | 18 Dic |
| 30 | **Webhook para trial $1 + Cron job cobros automáticos** | 18 Dic |
| 31 | **Modales consistentes (max-height, backdrop-blur, z-index)** | 18 Dic |
| 32 | **Badge perfil separado (giro + subcategoría en tags distintos)** | 18 Dic |
| 33 | **Trial $1 en Administrar Suscripción (oportunidad única)** | 18 Dic |

---

## 🔴 PENDIENTE

| # | Mejora | Prioridad | Tipo |
|---|--------|-----------|------|
| 1 | Video animado explicativo | Alta | 🎬 Creativo |
| 2 | Sistema de Strikes | Media | 💻 Código |
| 3 | Medallas (bronce, plata, oro) | Media | 💻 Código |
| 4 | Sistema de Ranking | Media | 💻 Código |
| 5 | Reseñas estilo LinkedIn | Media | 💻 Código |
| 6 | Módulo alianzas completo | Media | 💻 Código |
| 7 | Cápsulas educativas | Media | 📝 Contenido |

### ✅ COMPLETADO HOY (22 Dic)
| ✅ | Landing page Rally 1000 mejorada | Alta | 💻 |
| ✅ | Tutorial onboarding interactivo | Alta | 💻 |
| ✅ | Marca/Empresa prominente | Alta | 💻 |
| ✅ | Efectos confeti (chaya) | Media | 💻 |
| ✅ | Configurar secrets Vercel | Alta | 🔧 |

---

## 📅 Miércoles 18 de Diciembre 2025 (Sesión PM)

### 🎁 Sistema de Suscripción $1 + Renovación Automática
**Solicitado por:** Doraluz Tribu Impulsa  
**Desarrollador:** Oscar Zambrano D.

#### Funcionalidades Implementadas

1. **Trial $1 con Suscripción Automática**
   - Usuario paga $1 para 1 mes de prueba
   - Selecciona plan futuro (mensual/semestral/anual)
   - Después de 30 días se cobra el plan seleccionado
   - Tarjeta queda registrada para cobros automáticos

2. **Términos y Condiciones**
   - Checkbox obligatorio en paso 1 del registro
   - Modal popup con documento legal completo
   - Botón para descargar T&C en .txt
   - 12 secciones: servicios, pagos, privacidad, etc.

3. **Webhook Actualizado** (`api/mercadopago-webhook.ts`)
   - Detecta tipo de pago: `promo_trial_1_peso` vs regular
   - Guarda en `pending_subscriptions` para cobro futuro
   - Registra `membershipType: 'trial'` vs `'paid'`

4. **Cron Job** (`api/process-subscriptions.ts`)
   - Ejecuta diariamente a las 8 AM (Vercel Cron)
   - Busca suscripciones con `chargeDate` vencida
   - Crea link de pago y envía notificación in-app
   - ⚠️ Requiere plan Vercel Pro ($20/mes) para cron automático

5. **Trial $1 en Administrar Suscripción**
   - Disponible también desde Mi Perfil
   - Es oportunidad ÚNICA por usuario
   - Se verifica con `localStorage` + `currentPlan`
   - Solo disponible hasta 31 dic 2025

**Archivos creados:**
- `components/TermsAndConditions.tsx`
- `api/create-subscription.ts`
- `api/process-subscriptions.ts`

**Archivos modificados:**
- `App.tsx` (MembershipScreen, SubscriptionManager, RegisterScreen)
- `api/mercadopago-webhook.ts`
- `vercel.json` (crons)

**Commits:**
- `8cc75b5` - T&C con checkbox
- `b18deb1` - Suscripción $1 con selección de plan
- `76e0399` - Eliminar mes gratis, solo flujo $1
- `bc3ae06` - Modales consistentes
- `689b352` - Webhook trial + cron job
- `632124c` - Badge perfil separado
- `23c8c1c` - Trial $1 en Administrar Suscripción

---

## 📅 Miércoles 18 de Diciembre 2025 (Sesión AM)

### 💳 Integración MercadoPago Checkout Pro
**Solicitado por:** Doraluz Tribu Impulsa  
**Desarrollador:** Oscar Zambrano D.

#### Arquitectura Implementada

1. **Backend (Vercel Serverless Functions)**
   - `api/create-preference.ts`: Crea preferencia de pago con planes
   - `api/mercadopago-webhook.ts`: Recibe notificaciones y activa membresías

2. **Planes de Membresía**
   - **Mensual:** $19.990/mes
   - **6 meses (paga 5):** $99.990
   - **12 meses (paga 9):** $179.910

3. **Frontend Actualizado**
   - `PaywallScreen.tsx`: Selector de planes + botón MercadoPago real
   - `PaymentResult.tsx`: Manejo de retorno (success/pending/failure)

4. **Flujo de Pago**
   ```
   Usuario → PaywallScreen → /api/create-preference → MercadoPago Checkout
                                                          ↓
   Dashboard ← PaymentResult ← back_urls ←────────────────┘
                                                          ↓
                         Webhook → Firestore (memberships/{userId})
   ```

**Archivos creados:**
- `api/create-preference.ts`
- `api/mercadopago-webhook.ts`
- `components/PaymentResult.tsx`

**Archivos modificados:**
- `components/PaywallScreen.tsx`
- `App.tsx` (nueva ruta /payment-result)
- `package.json` (firebase-admin, @vercel/node)
- `vercel.json` (rewrite para /api)
- `.env.example` (documentación MP_ACCESS_TOKEN)

**⚠️ PENDIENTE CONFIGURAR EN VERCEL:**
1. `MP_ACCESS_TOKEN` = Access Token de MercadoPago (sandbox o producción)
2. `FIREBASE_SERVICE_ACCOUNT_KEY` = JSON de service account Firebase

---

### ♿ Accesibilidad: ajuste real de tamaño de letra
**Solicitado por:** Doraluz Tribu Impulsa  
**Desarrollador:** Oscar Zambrano D.

#### Mejoras Implementadas

1. **Escala global real en toda la app**
   - Preferencia de tamaño de letra aplicada desde el layout global
   - Se ajusta `html` (`document.documentElement.style.fontSize`) para que escalen los `rem` (Tailwind)
   - Persistencia en `localStorage` (`tribu_font_size`)

2. **Saltos de tamaño más notorios (accesibilidad visual)**
   - `small`: 16px
   - `medium`: 20px
   - `large`: 24px

3. **Fix de tamaños hardcodeados en px para que también escalen**
   - Se reemplazaron `text-[..px]` por equivalentes en `rem`

**Archivos modificados:**
- `App.tsx`
- `components/WhatsAppFloat.tsx`
- `components/PaywallScreen.tsx`

---

## 📅 Lunes 16 de Diciembre 2025

### 🔧 Fixes UX + Modal TRIBU X Fullscreen + Refrescar
**Solicitado por:** Doraluz Tribu Impulsa  
**Desarrollador:** Oscar Zambrano D.

#### Mejoras Implementadas

1. **Fix Persistencia de Datos**
   - Los datos de perfil ya no se pierden al iniciar sesión
   - Preserva: alcance geográfico, facturación, comuna, regiones

2. **Sección "¿Cómo funciona?" expandida por defecto**
   - Usuario ve instrucciones inmediatamente

3. **Texto Onboarding Corregido**
   - Ahora dice: "De la zona geográfica que tú hayas elegido"

4. **Modal TRIBU X Análisis - Fullscreen**
   - Modal ocupa pantalla completa
   - Optimizado para iPhone

5. **Botón "Refrescar" en Mi Perfil**
   - Recarga datos sin cerrar sesión
   - Feedback visual "Datos actualizados"

---

### 🔮 Sistema Análisis TRIBU X con IA
**Solicitado por:** Dafna Tribu Impulsa  
**Desarrollador:** Oscar Zambrano D.

#### Nuevo Sistema

1. **Botón "🔮 Análisis TRIBU X"** en cada perfil de Mi Tribu
   - Análisis de compatibilidad con IA

2. **Modal de Análisis TRIBU X**
   - 💡 Insight de compatibilidad personalizado
   - 🎯 3 oportunidades de colaboración
   - 💬 Mensaje para WhatsApp generado por IA

3. **Botones WhatsApp personalizados** en Mi Tribu
   - Mensajes según contexto (impulsar/ser impulsado)

---

### 📱 Optimización iPhone 14 Pro Max
**Solicitado por:** Doraluz Tribu Impulsa  
**Desarrollador:** Oscar Zambrano D.

1. **Compatibilidad iPhone 14 Pro Max**
   - Safe areas para Dynamic Island
   - Touch targets optimizados
   - Sin zoom en inputs

2. **Banner de Recordatorio**
   - Aparece si perfil incompleto
   - Botón directo a completar

---

## 📅 Domingo 15 de Diciembre 2025

### 🧹 Cierre Fase 1
**Solicitado por:** Dafna Tribu Impulsa  
**Desarrollador:** Oscar Zambrano D.

1. **Fixes técnicos Firebase**
2. **Admin Panel mejorado** - Sin recargas de página
3. **Stats Cards movidos a Mi Tribu**
4. **Navegación rediseñada**

---

## 📅 Martes 9 de Diciembre 2025

### 🎓 Integración Santander Academia
**Solicitado por:** Dafna Tribu Impulsa  
**Desarrollador:** Oscar Zambrano D.

- Nueva sección `/academia`
- Tema visual Santander
- Tracking de cursos iniciados

---

## 📅 Domingo 8 de Diciembre 2025

### 🧹 Limpieza de Datos y Mejoras
**Solicitado por:** Dafna Tribu Impulsa  
**Desarrollador:** Oscar Zambrano D.

1. **Eliminación de usuarios duplicados**
2. **Competencia directa EXCLUIDA** del matching
3. **Banner "Completa tu perfil"**
4. **Dropdowns ordenados A-Z**
5. **Facebook y X.com** en perfil

---

## 📅 Domingo 7 de Diciembre 2025

### 🎁 Beta Pública + TikTok
**Solicitado por:** Doraluz Tribu Impulsa  
**Desarrollador:** Oscar Zambrano D.

1. **Pantalla Beta Pública** - Mes gratis
2. **TikTok** agregado al perfil
3. **FASES 1-9: Sistema de Matching Completo**
   - Matching por categoría/rubro
   - Matching por afinidad/intereses
   - Matching geográfico (LOCAL/REGIONAL/NACIONAL)
   - Matching por facturación
   - Selector cascada Región → Comuna
   - Sistema 10+10 garantizado

---

## 📅 Viernes 6 de Diciembre 2025

### 🎨 Actualización de Branding
**Solicitado por:** Dafna Tribu Impulsa  
**Desarrollador:** Oscar Zambrano D.

1. **Nuevo Logo** actualizado
2. **Favicon** nuevo
3. **Iconos PWA** actualizados

---

## 📊 ESTADO ACTUAL

| Métrica | Valor |
|---------|-------|
| Usuarios registrados | ~140 |
| Categorías disponibles | 157 |
| Afinidades disponibles | 38 (11 grupos) |
| Regiones de Chile | 16 |
| Comunas disponibles | 346 |

---

## 🎯 FUNCIONALIDADES ACTIVAS

### Sistema de Matching Inteligente
- ✅ Matching por Categoría/Rubro
- ✅ Matching por Afinidad/Intereses
- ✅ Matching Geográfico
- ✅ Matching por Facturación
- ✅ Competencia directa EXCLUIDA
- ✅ Sistema TRIBU X con IA

### Perfil de Usuario
- ✅ Datos editables y persistentes
- ✅ Redes sociales (Instagram, TikTok, Facebook, X, WhatsApp)
- ✅ Foto de perfil y portada
- ✅ Sincronización con Firebase

### Sistema Tribu 10+10
- ✅ 10 perfiles para impulsar
- ✅ 10 perfiles que me impulsan
- ✅ Checklist con persistencia
- ✅ WhatsApp con mensajes personalizados
- ✅ Análisis TRIBU X con IA

---

> Desarrollado por **Oscar Zambrano D.**
