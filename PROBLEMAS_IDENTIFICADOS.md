# 🔴 PROBLEMAS IDENTIFICADOS Y MEJORAS PENDIENTES

## CRÍTICOS (Bloquean uso)

### 1. ⚠️ Popups/Modales mal posicionados
- **Onboarding modal**: Usa portal pero aún puede tener problemas en algunos dispositivos
- **Modal de reportar**: ✅ ARREGLADO - Usa portal con estilos inline
- **Causa**: El body tiene scroll que interfiere
- **Pendiente**: Verificar en dispositivos móviles reales

### 2. ✅ Actividades redirigen al inicio - ARREGLADO
- Ahora solo navega si `item.actionUrl` está definido y no está vacío
- Muestra indicador "Tocar para ir →" solo cuando hay acción

### 3. ⚠️ Azure OpenAI no configurado
- Error: "Azure OpenAI no configurado. Usa configureAzureAI()"
- **ARREGLADO**: Fallback inteligente genera análisis basado en datos locales
- **Pendiente**: Configurar variables de entorno en Vercel cuando esté listo

### 4. ✅ Reportes muestran ID técnico - ARREGLADO
- Ahora guarda y muestra `targetName` (emprendimiento) + `targetOwner` (persona)
- Agregado botón "Enviar por WhatsApp" con mensaje pre-escrito

## MEJORAS DE UX

### 5. ✅ Match Analysis manual - ARREGLADO
- Ya NO genera automáticamente
- Muestra botón "Analizar compatibilidad" con animación "Tribu X está pensando..."
- El análisis se guarda por mes

### 6. ✅ Botón WhatsApp en reportes - ARREGLADO
- Cada reporte tiene botón "Enviar por WhatsApp"
- Mensaje pre-escrito con todos los datos del reporte

### 7. 🟡 Reportes enviados al admin
- Actualmente solo se guardan en localStorage
- **Mejora futura**: Enviar a Firebase y notificar al admin

## ESTADO ACTUAL

| Problema | Estado | Prioridad |
|----------|--------|-----------|
| Modales mal posicionados | ⚠️ Parcial | Alta |
| Actividades redirigen | ✅ Resuelto | - |
| Azure no configurado | ✅ Fallback OK | - |
| Reportes con ID | ✅ Resuelto | - |
| Match manual | ✅ Resuelto | - |
| WhatsApp en reportes | ✅ Resuelto | - |
| Reportes a Firebase | 🟡 Pendiente | Baja |

## PENDIENTE PARA PRODUCCIÓN

1. **Configurar Azure OpenAI en Vercel**
   - Variables: `VITE_AZURE_OPENAI_ENDPOINT`, `VITE_AZURE_OPENAI_KEY`, `VITE_AZURE_OPENAI_DEPLOYMENT`

2. **Verificar modales en móviles reales**
   - Testear en iPhone y Android

3. **Implementar sincronización de reportes a Firebase**
   - Para que admin vea reportes en tiempo real

4. **🔴 LIMPIAR LOGS DE CONSOLA**
   - Actualmente hay muchos `console.log` útiles para desarrollo
   - Para producción DEBEN eliminarse o condicionarse con `process.env.NODE_ENV === 'development'`
   - Archivos afectados:
     - `App.tsx` (líneas ~47-49)
     - `realUsersData.ts` (líneas ~822, ~871)
     - `dataPersistence.ts` (línea ~150)
     - `firebaseService.ts` (línea ~45)
     - `productionInit.ts` (líneas ~464, ~469)
     - `aiMatchingService.ts` (línea ~288)
   - **NO BORRAR AHORA** - Son útiles para debugging durante desarrollo

5. **Tailwind CDN warning**
   - `cdn.tailwindcss.com should not be used in production`
   - Ya está instalado via PostCSS, pero el CDN sigue cargando
   - Revisar `index.html` para eliminar referencia al CDN

## PROGRESO SESIÓN 29-Nov-2025 12:45

### Completados hoy:
1. ✅ **Logo login más grande** - 90% ancho, más cerca del formulario
2. ✅ **Checklist simplificado** - Solo 2 estados: Pendiente (amarillo) / Completado (verde)
3. ✅ **Menú dev colapsable** - Opciones avanzadas ocultas en dropdown
4. ✅ **Avatar único** - Quitado doble círculo en perfiles
5. ✅ **Azure OpenAI fallback** - Retorna null cuando no está configurado, App usa fallback local
6. ✅ **Sistema actividades persistente**:
   - Guardado en localStorage (`tribu_activities`, `tribu_activities_archived`)
   - Archivar en vez de borrar
   - Restaurar desde archivados
   - Estado de lectura persistente
   - Filtros: Todas / Sin leer / Archivadas

### Filosofía de datos:
> "Todo dato que los clientes escriban, conclusiones de la IA, la matriz principal de toda la DB, 
> interacciones, patrones de uso, estadísticas de porcentajes, mensajes, uso del botón de WSP, 
> todo todo todo debe ser trazable, medible, analizable."

## PROGRESO SESIÓN 29-Nov-2025 13:10

### Completados:
1. ✅ **Match Analysis mejorado**:
   - Delay variable 3-5 segundos mientras "piensa"
   - Formato legible con secciones: Insight / Oportunidades / Rompe el hielo
   - 3 oportunidades concretas y accionables
   - Mensaje de WhatsApp pre-escrito personalizado
   - Botón "Enviar mensaje" que abre wa.me con el icebreaker

2. ✅ **Firestore sync functions agregadas**:
   - `syncProfileToCloud(profile)` - Sincroniza perfil completo
   - `getProfileFromCloud(id)` - Obtiene perfil de la nube
   - `updateProfileField(id, field, value)` - Actualiza campo específico
   - `getAllProfilesFromCloud()` - Lista todos los perfiles
   - `syncProfilePhoto(id, url)` - Sincroniza foto
   - `syncChecklistProgress(userId, data)` - Sincroniza progreso
   - `logInteraction(userId, action, details)` - Registra interacciones

3. ✅ **Tipo MatchProfile actualizado**:
   - Agregado `phone?: string`
   - Agregado `email?: string`

### Pendiente integración:
- Llamar `syncProfileToCloud` cada vez que el usuario guarde cambios
- Llamar `logInteraction` en acciones importantes (ver perfil, compartir, etc.)

---
Última actualización: 29-Nov-2025 13:10
