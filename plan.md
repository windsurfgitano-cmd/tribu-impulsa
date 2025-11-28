# Plan Tribu Impulsa

## Objetivo general
Impulsar la estabilidad funcional y la mantenibilidad del MVP "Tribu Impulsa" mediante mejoras en la generación de matches, el flujo de registro y la organización del código.

## Qué es Tribu Impulsa
Tribu Impulsa es una plataforma de cross-promotion entre emprendedores chilenos que automatiza los “match” mensuales para que cada marca comparta contenidos de otras empresas compatibles. El corazón es una PWA embebible en Shopify (iframe hipervisor) y usable de forma standalone, que integra:

- **Onboarding único y gamificado**: registro completo (datos personales, redes sociales, categoría de producto/servicio, afinidades de estilo de vida, alcance, ingresos) con barra de progreso, mensajes educativos (ej. “Instagram debe ser público”) y persistencia local/API.
- **Encuesta obligatoria**: formulario detallado que captura afinidades, categorías y alcance geográfico; se guarda en `localStorage` hoy y en el backend mañana, impidiendo acceso al dashboard si no está completo.
- **Algoritmo “Tómbola”**: genera dos listas por usuario cada mes (10 cuentas que debe compartir y 10 que lo compartirán) aplicando doble taxonomía (producto/servicio + estilo de vida) y reglas de exclusión para competencia directa. Permite preferencias (empresas grandes con grandes) y emite “tarjetas” para denunciar incumplimientos.
- **Dashboard tribal**: muestra matches recomendados con tarjetas estilo glassmorphism, razones de afinidad y accesos rápidos a WhatsApp, perfiles y acciones de seguimiento.
- **Visor de tribu y control de cumplimiento**: cada usuario puede ver su red asignada y marcar si la contraparte cumplió (“acusete”), habilitando alertas o sanciones antes del corte mensual.
- **Integraciones clave**: botón flotante de WhatsApp, futura sincronización con Shopify App Bridge (autologin + lectura de contexto de tienda) y login standalone vía magic link para la PWA.

## Contexto
- La app es un SPA en React con enrutamiento hash y un único archivo `App.tsx` de ~700 líneas.
- Los datos provienen de servicios mockeados (`matchService.ts`) que se recalculan en memoria.
- El flujo de registro permite avanzar sin datos, lo que genera perfiles incompletos.

## Iniciativas prioritarias

### 1. Estabilizar el Dashboard de Matches
- **Problema**: `Dashboard` llama `generateMockMatches` en cada render, cambiando la lista aleatoriamente.
- **Solución propuesta**:
  1. Mover la generación a `useEffect` + estado (o memoizar por `userCategory`).
  2. Preparar firma para reemplazo futuro por API real.
  3. Añadir pruebas manuales o unitarias básicas para garantizar consistencia.
- **Entrega**: Matches permanecen estables durante la sesión actual.

### 2. Agregar validaciones al Wizard de Registro
- **Problema**: Los botones permiten avanzar aunque haya campos vacíos.
- **Solución propuesta**:
  1. Definir requisitos por paso (nombre/company en paso 1, afinidad/subcategoría en paso 2).
  2. Deshabilitar el botón “Continuar” o mostrar mensajes inline cuando falten datos.
  3. Persistir el perfil mock en un estado global (Context o servicio) para usarlo en vistas futuras.
- **Entrega**: No se puede finalizar el registro sin datos mínimos y el perfil queda disponible para otras pantallas.

### 3. Modularizar `App.tsx`
- **Problema**: Todas las vistas y rutas conviven en un solo archivo, dificultando el mantenimiento.
- **Solución propuesta**:
  1. Extraer cada vista principal (`LoginScreen`, `RegisterScreen`, `Dashboard`, etc.) a `src/pages/`.
  2. Crear un `layout/AppLayout.tsx` que contenga rutas y navegación inferior.
  3. Mantener componentes reutilizables (`GlassCard`, `WhatsAppFloat`) en `src/components/` con barril.
  4. Ajustar imports y tipos compartidos desde `src/types/`.
- **Entrega**: Árbol de archivos claro y componentes fáciles de probar.

## Roadmap sugerido
| Semana | Actividades clave |
| --- | --- |
| Día 1 | Estabilizar matches, preparar hook `useMatches`, instalar dependencias y asegurar entorno de dev. |
| Día 2 | Implementar validaciones del wizard, almacenamiento del perfil registrado y guardar encuesta en backend/localStorage. |
| Día 3 | Modularizar estructura (`pages/`, `layout/`), configurar `vite-plugin-pwa`, manifest e íconos. |
| Día 4 | Integrar App Bridge + OAuth mock, preparar magic link standalone, QA + smoke tests, deployment y video demo. |

## Entregables críticos (4 días)
1. **Infra & despliegue**: hosting definido (Vercel/Netlify), HTTPS y `frame-ancestors *.myshopify.com` configurado.
2. **Sincronización Shopify**: endpoint OAuth básico + guardado `{shop_id, email, encuesta}` para reusar en PWA.
3. **PWA amigable**: `vite-plugin-pwa`, manifest, service worker y UX de install prompt probados en móvil.
4. **Login magic link**: flujo de correo + token que convive con autenticación automática vía App Bridge.
5. **QA / Demo**: checklist de registro → encuesta → dashboard → perfil → logout/login y capturas/video del flujo en iframe y standalone.

## Focos de impacto inmediato
1. **Algoritmo de match inteligente**
   - Implementar el motor “tómbola” con doble taxonomía (producto/servicio + estilo de vida), bloqueo automático de competencia directa y preferencias de emparejamiento por tamaño/segmento.
   - Entregar la primera corrida con datos reales (Excel depurado) y exponer dashboard de auditoría para ajustar reglas junto al equipo.
2. **Lanzamiento previo a Navidad**
   - Ejecutar el plan de 4 días para habilitar el MVP antes de la campaña navideña, capitalizando los 2.5k leads municipales y manteniendo caliente el convenio.
   - Preparar assets de comunicación (video demo, capturas) y activar magic link para facilitar onboarding masivo.
3. **PWA con control de reciprocidad**
   - Desplegar la WebApp instalable/embebible con dashboard tribal, panel “acusete”, recordatorios automatizados y botón flotante de WhatsApp.
   - Garantizar que cada emprendedor vea sus 10 asignaciones (a quién compartir y quién lo comparte) y pueda reportar incumplimientos en un clic.

## Insights de la reunión 25/11
1. **Algoritmo “Tómbola” y reglas de afinidad**@REUNIONES/WhatsApp-Audio-2025-11-25-at-3.43.23-PM_contenido_extraido (1).md#1-312
   - Pasar de grupos cerrados de 10 a listas individuales (cada usuario recibe 10 a quienes compartir y 10 que lo compartirán).
   - Doble taxonomía obligatoria: producto/servicio (con subcategorías detalladas) + estilo de vida/afinidad transversal.
   - Bloqueo solo cuando hay competencia directa en producto; si divergen en subcategorías pueden conectarse por estilo de vida.
   - Permitir preferencias de quién puede compartir (p. ej. marcas grandes con grandes) y “tarjetas” para denunciar incumplimientos.

2. **UX/PWA**@REUNIONES/WhatsApp-Audio-2025-11-25-at-3.43.23-PM_contenido_extraido (1).md#247-355 @REUNIONES/WhatsApp-Audio-2025-11-25-at-3.43.23-PM_analysis (1).md#20-43
   - Registro único gamificado (barra de progreso, luces, mensajes claros sobre requisitos como IG público).
   - Visualizar tribu asignada, marcar cumplimientos y botón flotante de WhatsApp integrado.
   - La PWA debe verse nativa dentro de Shopify (iframe) y también funcionar standalone con magic link.

## Dependencias y riesgos
- Falta de API real: mantener mocks consistentes y aislarlos detrás de servicios.
- Diseño/UX: validar mensajes de error y flujos con stakeholders antes de implementarlos.
- Tiempo: modularización puede destapar code smells adicionales; planificar buffers.

## Próximos pasos
1. Aprobar este plan y priorización.
2. Crear issues/tickets por iniciativa con criterios de aceptación.
3. Iniciar implementación siguiendo el roadmap propuesto.
4. Diseñar login standalone basado en **magic link** para la versión PWA (usando el mismo correo del merchant) y documentar cómo convive con la autenticación automática vía Shopify App Bridge.
