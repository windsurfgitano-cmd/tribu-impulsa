# Elevator Pitch – Tribu Impulsa (20 min)

## 1. Problema (3 min)
- Emprendedores invierten tiempo en grupos cerrados y planillas que no escalan.
- La competencia directa se bloquea y el alcance se reduce.
- No existe visibilidad ni control sobre quién cumple con las campañas cruzadas.

## 2. Solución (4 min)
- Tribu Impulsa es una PWA embebible en Shopify que automatiza el cross-promotion mensual.
- Algoritmo “Tómbola” con doble taxonomía (producto/servicio + estilo de vida) que asigna 10 cuentas para compartir y 10 que te comparten, bloqueando competencia directa y respetando preferencias de tamaño.
- Registro único gamificado y encuesta obligatoria para asegurar datos limpios.

## 3. Producto (5 min)
- Dashboard tribal con tarjetas glass, razones de afinidad y accesos a WhatsApp/perfiles.
- Visor de tribu + panel “acusete” para marcar cumplimiento y aplicar sanciones.
- Integraciones: botón WhatsApp, App Bridge (autologin), magic link standalone.
- PWA lista para instalar, también funciona en iframe/Shopify.
- Todo el flujo está pensado para lanzarse antes de Navidad y asegurar reciprocidad: asignaciones claras, recordatorios y control en un solo lugar.

## 4. Tracción / Plan (4 min)
- MVP listo para estabilizar en 4 días: matches consistentes, wizard validado, modularización.
- Roadmap inmediato: hosting + CSP, OAuth Shopify + magic link, configuración PWA, QA/demo.
- Convenio municipal para captar +2.5k emprendedores, meta 4k en el primer año.
- Tres focos para el impacto: (1) algoritmo inteligente, (2) lanzamiento pre-Navidad, (3) PWA con control de reciprocidad.

## 5. Pedidos (4 min)
- Aprobación del plan de rescate y presupuesto en 2 hitos (50/50).
- Acceso a base de datos Excel definitiva para entrenar algoritmo.
- Feedback semanal (stand-up corto) para ajustar gamificación y reglas de “tómbola”.

---

## Notas rápidas para la videollamada
1. **Abrir con demo**: compartir pantalla ya en `#/dashboard` para mostrar métricas → botón central lleva a `#/tribe` y exhibir 10+10, reportes y CTA de compartir.
2. **Recordar narrativa**: “De grupos cerrados a matches individuales con control y transparencia”.
3. **Shopify & PWA**: recalcar que hoy funciona standalone y mañana se embebe como iframe con App Bridge + magic link.
4. **Timing**: insistir en la urgencia navideña y que el MVP ya está listo para captar los 2.5k leads municipales.
5. **Siguiente paso**: obtener el Excel real para reemplazar el mock de 50 empresas y ajustar afinidades reales.

## Preguntas frecuentes / respuestas relámpago
- **¿Se puede integrar con nuestras tiendas Shopify existentes?** Sí. El plan contempla App Bridge para usar la misma sesión del merchant y magic link como fallback standalone.
- **¿Cómo evitamos que compitan entre sí?** El motor “tómbola” bloquea coincidencias por producto/servicio y ofrece afinidades de estilo de vida para ampliar el match sin cruzar competencia directa.
- **¿Cómo aseguramos cumplimiento?** Checklist 10+10 con casillas, botón “reportar” (“acusete”) y registro de reportes; todo queda visible en métricas del dashboard.
- **¿Podemos escalar a miles?** La arquitectura es SPA + servicios. Hoy usa mocks persistidos en localStorage; al conectar el backend sólo cambia la fuente de datos.
- **¿Cuánto demora el onboarding?** Registro único + encuesta en un flujo gamificado (~3 min). No más planillas ni formularios duplicados.

## Manejo de objeciones
- **“Suena como otro grupo cerrado”** → Mostrar la vista tribu: cada usuario recibe su lista única de 10 + 10 y se regenera mensualmente, no hay grupos estancos.
- **“No confío en que la gente comparta”** → Enfatizar botones de compartir + reporte y las métricas en el dashboard que exponen quién cumplió.
- **“¿Y si no tenemos datos limpios?”** → La plataforma ya procesa taxonomías reales; sólo necesitamos el Excel para importar y limpiar de inmediato.
- **“¿Se siente como app nativa?”** → Mostrar instalación PWA + botón flotante WhatsApp y explicar embebido Shopify.

## Próximos pasos tras la reunión
1. **Decisión sobre el plan de rescate (48 h)** – confirmar alcance y presupuesto para activar hosting y App Bridge.
2. **Provisionar entorno** – definimos dominio, certificados y políticas CSP para el MVP público.
3. **Integración Shopify / Magic link** – configurar App Bridge en el store piloto y dejar listo el flujo de login automático.
4. **Carga del Excel oficial** – limpieza + importación a la base mock para calibrar afinidades reales.
5. **QA + Demo pública** – sesión de prueba interna y video demo para el comité municipal.

## Qué necesitamos del cliente
- **Excel actualizado** con los 2.5k contactos (campos: rubro, subcategoría, canales sociales, ubicación, tamaño de empresa).
- **Accesos Shopify Partner / tienda piloto** para instalar la app y validar App Bridge.
- **Lineamientos de marca** (logos, paleta, copy clave) para la versión “public-facing”.
- **Fechas y KPIs de campaña navideña** para configurar recordatorios y métricas básicas.
- **Responsable interno** para feedback semanal y aprobación de iteraciones (canal directo).
