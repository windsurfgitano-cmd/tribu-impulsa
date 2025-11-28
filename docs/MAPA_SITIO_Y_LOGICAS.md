# 🗺️ Mapa del Sitio y Lógicas - Tribu Impulsa

> Documento técnico para análisis de flujos, detección de fallos y mejoras UX
> Última actualización: 27-nov-2025

---

## 📍 MAPA DEL SITIO

```
                                    ┌─────────────────┐
                                    │   tribuimpulsa  │
                                    │     (root)      │
                                    └────────┬────────┘
                                             │
              ┌──────────────────────────────┼──────────────────────────────┐
              │                              │                              │
              ▼                              ▼                              ▼
     ┌────────────────┐            ┌─────────────────┐            ┌─────────────────┐
     │   / (Login)    │            │    /register    │            │     /admin      │
     │   Público      │────────────│   5 pasos      │            │   Solo Admin    │
     └───────┬────────┘            └────────┬────────┘            └────────┬────────┘
             │                              │                              │
             │                              ▼                              │
             │                     ┌─────────────────┐                     │
             │                     │   /searching    │                     │
             │                     │  Algoritmo X    │                     │
             │                     └────────┬────────┘                     │
             │                              │                              │
             ▼                              ▼                              │
     ┌───────────────────────────────────────────────┐                     │
     │                 /dashboard                     │                     │
     │            (Requiere login)                    │                     │
     └─────────────────────┬─────────────────────────┘                     │
                           │                                               │
        ┌──────────────────┼──────────────────┐                            │
        │                  │                  │                            │
        ▼                  ▼                  ▼                            ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌─────────────────────────┐
│   /tribe     │   │  /activity   │   │ /my-profile  │   │     Admin Panel         │
│  Checklist   │   │Notificaciones│   │  Mi Perfil   │   │─────────────────────────│
│    10+10     │   │              │   │              │   │ • overview (stats)      │
└──────┬───────┘   └──────────────┘   └──────────────┘   │ • users (lista real)    │
       │                                                  │ • reports (acusetes)    │
       ▼                                                  │ • settings (config)     │
┌──────────────┐                                         └─────────────────────────┘
│/profile/:id  │
│ Ver perfil   │
│  de otro     │
└──────────────┘
```

---

## 🔄 FLUJOS DE USUARIO

### Flujo A: Nuevo Usuario
```
1. Llega a / (Login)
   └→ Click "Crear cuenta"
   
2. /register (5 pasos)
   ├→ Paso 1: Nombre, email, teléfono
   ├→ Paso 2: Empresa, ciudad, alcance
   ├→ Paso 3: GIRO/RUBRO (categoría negocio)
   ├→ Paso 4: AFINIDAD (con quién quiere conectar)
   └→ Paso 5: Redes sociales (Instagram obligatorio)
   
3. /searching (Algoritmo Tribal X)
   └→ Animación 5 segundos
   └→ [AQUÍ SE GENERA LA TRIBU]
   
4. /dashboard
   └→ Ve sus matches recomendados
   └→ Puede ir a /tribe para ver su checklist
```

### Flujo B: Usuario Recurrente
```
1. / (Login)
   └→ Ingresa email + password
   └→ Valida sesión en localStorage
   
2. /dashboard
   └→ Ve notificaciones pendientes
   └→ Ve matches del mes
   
3. /tribe
   └→ Ve lista 10+10
   └→ Marca checkboxes de compartidos
   └→ Puede reportar "acusete"
```

### Flujo C: Administrador
```
1. /admin
   └→ Login especial (admin@tribuimpulsa.cl / admin123)
   
2. Panel con 4 tabs:
   ├→ Overview: Stats en tiempo real
   ├→ Users: Lista de todos los usuarios registrados
   ├→ Reports: Reportes "acusete" pendientes
   └→ Settings: Configuración del sistema
   
3. Acciones disponibles:
   ├→ Exportar CSV/JSON a Google Drive
   ├→ Ver perfil de cualquier usuario
   ├→ Resolver/Sancionar reportes
   └→ Regenerar tómbola
```

---

## ⚙️ LÓGICAS DE CADA COMPONENTE

### 1. Sistema de Registro (`RegisterScreen`)
```typescript
// LÓGICA ACTUAL
handleNext() {
  1. Valida campos del paso actual
  2. Si paso < 5 → avanza al siguiente
  3. Si paso === 5:
     a. createUser() → guarda en tribu_users (localStorage)
     b. persistSurveyResponse() → guarda en surveyResponses (compatibilidad)
     c. Navega a /searching
}

// DATOS GUARDADOS
{
  id: "user_timestamp_random",
  name, email, phone,
  companyName, city, sector,
  category, affinity, scope,
  instagram, facebook, tiktok, website,
  status: "active",
  createdAt, updatedAt
}
```

**🐛 FALLOS DETECTADOS:**
- ❌ No hay validación de email duplicado
- ❌ No hay confirmación de contraseña
- ❌ El teléfono no se valida formato chileno
- ❌ Si el usuario cierra en paso 3, pierde todo

**✅ MEJORAS SUGERIDAS:**
- Guardar progreso parcial en cada paso
- Validar email único antes de continuar
- Agregar +56 automático al teléfono


### 2. Generación de Tribu (`generateTribeAssignments`)
```typescript
// LÓGICA ACTUAL
generateTribeAssignments(userCategory, currentUserId) {
  1. Obtener todos los usuarios de tribu_users
  2. Excluir al usuario actual
  3. Separar por categoría diferente (diversidad)
  4. Mezclar aleatoriamente
  5. Tomar 10 para "toShare" (yo les comparto)
  6. Tomar 10 para "shareWithMe" (ellos me comparten)
  7. Si hay menos de 10 usuarios → usar datos mock
}
```

**🐛 FALLOS DETECTADOS:**
- ❌ No considera la AFINIDAD del usuario al hacer match
- ❌ No bloquea competencia directa (mismo rubro)
- ❌ Se regenera cada vez que entras a /tribe (debería ser mensual)
- ❌ No hay lógica de "ya compartí con esta persona antes"

**✅ MEJORAS SUGERIDAS:**
- Guardar asignación mensual fija
- Usar affinity para priorizar matches
- Bloquear mismo rubro/categoría principal


### 3. Sistema de Reportes "Acusete"
```typescript
// LÓGICA ACTUAL (en TribeAssignmentsView)
handleReport(targetId) {
  1. Prompt para razón
  2. Guardar en tribeReportsLog (localStorage)
  3. Marcar en checklist como reportado
}

// FORMATO DEL REPORTE
{
  targetId: "user_id",
  reason: "texto libre",
  timestamp: "ISO date"
}
```

**🐛 FALLOS DETECTADOS:**
- ❌ No guarda quién hizo el reporte (fromUserId)
- ❌ No hay confirmación antes de enviar
- ❌ No hay límite de reportes por usuario
- ❌ El Admin no puede responder al reporte

**✅ MEJORAS SUGERIDAS:**
- Agregar fromUserId al reporte
- Modal de confirmación
- Sistema de estados: pendiente → en_revision → resuelto/sancionado
- Notificación al reportado


### 4. Sistema de Notificaciones
```typescript
// LÓGICA ACTUAL
createNotification({userId, type, title, message}) {
  → Guarda en tribu_notifications (localStorage)
}

getUserNotifications(userId) {
  → Lee y filtra por userId
}

// SE CREAN NOTIFICACIONES CUANDO:
- Usuario completa acción de compartir
- Alguien reporta a un usuario
- (Falta: asignación de tribu mensual)
```

**🐛 FALLOS DETECTADOS:**
- ❌ No hay notificación al registrarse
- ❌ No hay notificación cuando te asignan tribu
- ❌ getMockActivity() no pasa userId, no lee notificaciones reales
- ❌ El badge de notificaciones es hardcoded

**✅ MEJORAS SUGERIDAS:**
- Crear notificación de bienvenida
- Notificar asignación de tribu mensual
- Conectar badge al conteo real de no leídas


### 5. Admin Panel
```typescript
// LÓGICA ACTUAL
- Stats: getDashboardStats() → stats reales
- Users: getAllUsers() → usuarios reales
- Reports: tribeReportsLog → reportes reales
- Export: exportForGoogleDrive() → descarga CSV/JSON

// ACCIONES ADMIN
- Ver perfil de usuario
- Exportar datos
- (Pendiente) Resolver reportes
- (Pendiente) Sancionar usuarios
- (Pendiente) Regenerar tómbola
```

**🐛 FALLOS DETECTADOS:**
- ❌ Botón "Resolver" no hace nada
- ❌ Botón "Sancionar" no hace nada
- ❌ Botón "Regenerar Tómbola" no hace nada
- ❌ No hay historial de acciones del admin

**✅ MEJORAS SUGERIDAS:**
- Implementar resolución de reportes (cambiar status)
- Implementar sanción (suspender usuario)
- Regenerar tómbola para un usuario o todos
- Log de acciones administrativas

---

## 🔗 INTERACCIONES ENTRE COMPONENTES

```
┌──────────────┐     createUser()      ┌──────────────────┐
│  Register    │ ───────────────────→  │  databaseService │
│   Screen     │                       │                  │
└──────────────┘                       └────────┬─────────┘
                                                │
                                                │ getAllUsers()
                                                ▼
┌──────────────┐    generateTribe()    ┌──────────────────┐
│    Tribe     │ ←───────────────────  │   matchService   │
│  Assignments │                       │                  │
└──────┬───────┘                       └──────────────────┘
       │
       │ handleReport()
       ▼
┌──────────────────┐                   ┌──────────────────┐
│ tribeReportsLog  │ ───────────────→  │   Admin Panel    │
│  (localStorage)  │    realReports    │    (Reports)     │
└──────────────────┘                   └──────────────────┘
```

---

## 😓 PUNTOS DE DOLOR - DORALUZ Y DAFNA

### Contexto
- **Doraluz**: Dueña de Terraflor Paisajismo, referente de la comunidad
- **Dafna**: Dueña de By Turquía (joyas), co-administradora
- Gestionan +100 emprendedores manualmente
- Usan Excel y WhatsApp para coordinar

### Dolores Identificados

#### 1. 📋 "No sé quién cumplió y quién no"
**Situación actual**: Preguntan por WhatsApp individualmente
**Lo que necesitan**: Dashboard con % de cumplimiento por usuario
**Solución propuesta**: 
```
Vista Admin → Cumplimiento
├── Usuario A: 8/10 compartidos ✅
├── Usuario B: 2/10 compartidos ⚠️
└── Usuario C: 0/10 compartidos ❌ (enviar recordatorio)
```

#### 2. 📬 "Me llegan reclamos y no sé cómo gestionarlos"
**Situación actual**: Mensajes de WhatsApp sin estructura
**Lo que necesitan**: Sistema de tickets con estados
**Solución propuesta**:
```
Reporte #123
├── De: María (EcoBeauty) → Para: Juan (TechSolutions)
├── Razón: "No compartió mi publicación en 2 semanas"
├── Estado: 🟡 En revisión
├── Acciones: [Contactar a ambas partes] [Resolver] [Sancionar]
└── Notas del admin: "Contacté a Juan, prometió ponerse al día"
```

#### 3. 📊 "Necesito reportes para la municipalidad"
**Situación actual**: Armar Excel a mano
**Lo que necesitan**: Exportación automática con métricas
**Solución propuesta**:
```
Reporte Mensual - Noviembre 2025
├── Total usuarios activos: 95
├── Nuevos registros: 12
├── Interacciones realizadas: 847
├── Tasa de cumplimiento: 78%
├── Reportes resueltos: 5/7
└── [Descargar PDF] [Enviar a Drive]
```

#### 4. 🎯 "Quiero ver qué rubros están más activos"
**Situación actual**: Contar manualmente
**Lo que necesitan**: Gráficos de distribución
**Solución propuesta**:
```
Distribución por Rubro
├── 🟣 Moda y Accesorios: 28%
├── 🟢 Bienestar y Salud: 22%
├── 🔵 Servicios Prof.: 18%
├── 🟠 Gastronomía: 15%
└── ⚪ Otros: 17%
```

#### 5. 📱 "Los usuarios no entienden qué hacer"
**Situación actual**: Explican por WhatsApp
**Lo que necesitan**: Onboarding guiado
**Solución propuesta**:
```
Tutorial interactivo al primer login:
1. "Así funciona tu tribu 10+10"
2. "Cómo marcar que compartiste"
3. "Qué hacer si alguien no cumple"
4. "Cómo contactar por WhatsApp"
```

#### 6. 🔔 "Nadie se acuerda de compartir"
**Situación actual**: Recordatorios manuales
**Lo que necesitan**: Notificaciones automáticas
**Solución propuesta**:
```
Recordatorios automáticos:
├── Día 1 del mes: "Tu nueva tribu está lista"
├── Día 10: "Llevas 3/10, sigue así 💪"
├── Día 20: "Te faltan 5, tienes 10 días"
└── Día 28: "Último recordatorio antes del cierre"
```

---

## 🎨 PALETA DE COLORES ACTUALIZADA

### Colores Actuales
| Color | Hex | Uso |
|-------|-----|-----|
| Púrpura | `#6161FF` | Acento primario |
| Verde | `#00CA72` | Success, CTA |
| Rojo | `#FB275D` | Danger, errores |
| Amarillo | `#FFCC00` | Warning |
| Gris claro | `#F5F7FB` | Fondo |
| Blanco | `#FFFFFF` | Cards |
| Gris borde | `#E4E7EF` | Bordes |
| Texto oscuro | `#181B34` | Títulos |
| Texto muted | `#7C8193` | Secundario |

### 🆕 Nuevos Colores - Lila/Fucsia Pastel
| Color | Hex | Uso Propuesto |
|-------|-----|---------------|
| Lila Pastel | `#E8D5FF` | Backgrounds suaves, estados especiales |
| Lila Medio | `#C9A8FF` | Badges, destacados |
| Fucsia Pastel | `#FFD5E5` | Notificaciones, alertas suaves |
| Fucsia Medio | `#FF9EC4` | Highlights, acciones secundarias |
| Lavanda | `#DDD6FE` | Hover states, selecciones |
| Rosa Suave | `#FDF2F8` | Fondos alternativos |

### Combinaciones Sugeridas
```css
/* Para badges de afinidad */
.badge-affinity {
  background: #E8D5FF;
  color: #6161FF;
}

/* Para notificaciones nuevas */
.notification-new {
  background: #FFD5E5;
  border-left: 3px solid #FF9EC4;
}

/* Para estados "en proceso" */
.status-processing {
  background: #DDD6FE;
  color: #7C3AED;
}

/* Para cards destacadas */
.card-featured {
  background: linear-gradient(135deg, #FDF2F8, #E8D5FF);
}
```

---

## 🚀 PRÓXIMOS PASOS PRIORITARIOS

### Alta Prioridad (App de sus sueños)
1. **Dashboard Admin mejorado**
   - Gráficos de cumplimiento
   - Estados de reportes
   - Filtros por rubro/ciudad

2. **Sistema de estados para reportes**
   - pendiente → en_revision → resuelto/sancionado
   - Notas del admin
   - Notificación al usuario

3. **Recordatorios automáticos**
   - Notificación de nueva tribu
   - Recordatorios de cumplimiento
   - Alertas de vencimiento

4. **Onboarding interactivo**
   - Tutorial al primer login
   - Tooltips en acciones clave
   - Video explicativo

### Media Prioridad
5. Mejora de algoritmo de matching (usar afinidad)
6. Bloqueo de competencia directa
7. Reportes PDF automáticos

### Baja Prioridad
8. Push notifications reales
9. Backend remoto (Firebase/Supabase)
10. Integración Shopify

---

## 📞 CONTACTOS CLAVE

- **Doraluz Galleguillos**: doraluz@terraflorpaisajismo.cl | +56976160566
- **Dafna Finkelstein**: dafnafinkelstein@gmail.com | +56992767707

---

*Documento generado para análisis interno - Tribu Impulsa v1.0*
