# 🔴 PROBLEMAS IDENTIFICADOS Y MEJORAS PENDIENTES

## CRÍTICOS (Bloquean uso)

### 1. ❌ Popups/Modales mal posicionados
- **Onboarding modal**: Aparece muy abajo, requiere scroll
- **Modal de reportar**: Mismo problema
- **Causa**: Los modales usan `fixed` pero algo interfiere con el posicionamiento
- **Solución**: Usar `ReactDOM.createPortal` con estilos inline para TODOS los modales

### 2. ❌ Actividades redirigen al inicio
- Al hacer click en cualquier actividad, redirige a /dashboard
- **Causa**: El código tiene `if (item.actionUrl) navigate(item.actionUrl)` pero algo más está navegando
- **Solución**: Prevenir propagación del evento y validar actionUrl

### 3. ❌ Azure OpenAI no configurado
- Error: "Azure OpenAI no configurado. Usa configureAzureAI()"
- El análisis de match muestra "Análisis no disponible"
- **Causa**: Falta configurar las variables de entorno en Vercel/local
- **Solución**: Mejorar el fallback para que funcione sin LLM

### 4. ❌ Reportes muestran ID técnico
- Muestra "Perfil #real_user_19" en vez del nombre del emprendimiento
- **Solución**: Guardar companyName + name en el reporte

## MEJORAS DE UX

### 5. 🟡 Match Analysis manual
- Actualmente intenta generar automáticamente al abrir perfil
- **Mejora**: Agregar botón "Analizar compatibilidad" con animación "Pensando..."

### 6. 🟡 Botón WhatsApp en reportes
- Después de reportar, agregar botón "Enviar reporte por WhatsApp"
- Abre wa.me con mensaje pre-escrito

### 7. 🟡 Reportes enviados al admin
- Actualmente solo se guardan en localStorage
- **Mejora**: Enviar a Firebase y notificar al admin

## ESTADO ACTUAL

| Problema | Estado | Prioridad |
|----------|--------|-----------|
| Modales mal posicionados | 🔴 Pendiente | Alta |
| Actividades redirigen | 🔴 Pendiente | Alta |
| Azure no configurado | 🟡 Fallback OK | Media |
| Reportes con ID | 🔴 Pendiente | Alta |
| Match manual | 🟡 Pendiente | Media |
| WhatsApp en reportes | 🟡 Pendiente | Media |

---
Última actualización: 29-Nov-2025
