# 🚀 CHECKLIST DE PRODUCCIÓN - TRIBU IMPULSA

> Convertir el MVP de demo local a sistema real entregable.

---

## 📊 ESTADO ACTUAL vs NECESARIO

| Componente | Ahora | Necesario |
|------------|-------|-----------|
| **Base de datos** | localStorage (local) | Firebase Firestore (cloud) |
| **Autenticación** | Simulada | Firebase Auth real |
| **Usuarios** | Hardcoded en código | Dinámicos en cloud |
| **Algoritmo tribal** | Local, no compartido | Servidor, compartido |
| **Notificaciones** | Solo locales | Push reales desde servidor |
| **Perfil editable** | Guarda local | Guarda en cloud |
| **Admin Panel** | Lee datos locales | Lee datos cloud |

---

## 🔴 NIVEL 1: INFRAESTRUCTURA (Crítico)

### 1.1 Base de Datos Cloud
- [ ] **Configurar Firebase Firestore** ← YA TENEMOS FIREBASE
  - [ ] Crear colecciones: `users`, `tribes`, `assignments`, `reports`, `notifications`
  - [ ] Definir reglas de seguridad
  - [ ] Migrar estructura de datos de localStorage a Firestore
- [ ] **Complejidad**: Media | **Tiempo**: 2-3 horas
- [ ] **Riesgo de romper código**: Bajo (nuevo servicio, reemplazo gradual)

### 1.2 Autenticación Real
- [ ] **Implementar Firebase Auth**
  - [ ] Login con email/password real
  - [ ] Registro de nuevos usuarios
  - [ ] Recuperación de contraseña
  - [ ] Sesiones persistentes y seguras
- [ ] **Complejidad**: Media | **Tiempo**: 1-2 horas
- [ ] **Riesgo**: Bajo (reemplazo del sistema actual)

### 1.3 Migración de Datos
- [ ] **Script de migración**
  - [ ] Subir los 23 usuarios del CSV a Firestore
  - [ ] Convertir contraseñas a hash seguro
  - [ ] Preservar todos los campos
- [ ] **Complejidad**: Baja | **Tiempo**: 30 min
- [ ] **Riesgo**: Bajo

---

## 🟠 NIVEL 2: LÓGICA DE NEGOCIO (Importante)

### 2.1 Servicio de Datos Unificado
- [ ] **Crear `cloudService.ts`**
  - [ ] CRUD de usuarios (create, read, update, delete)
  - [ ] Sincronización en tiempo real
  - [ ] Cache local para offline
  - [ ] Fallback a localStorage si no hay conexión
- [ ] **Complejidad**: Media | **Tiempo**: 2 horas
- [ ] **Riesgo**: Medio (reemplaza databaseService.ts)

### 2.2 Algoritmo Tribal en Cloud
- [ ] **Mover lógica a Cloud Functions**
  - [ ] Ejecutar algoritmo una vez al mes (cron job)
  - [ ] Guardar asignaciones en Firestore
  - [ ] Todos los usuarios ven las mismas asignaciones
- [ ] **Complejidad**: Media-Alta | **Tiempo**: 2-3 horas
- [ ] **Riesgo**: Medio

### 2.3 Sistema de Reportes Real
- [ ] **Reportes en Firestore**
  - [ ] Crear reporte guarda en cloud
  - [ ] Admin ve reportes de todos
  - [ ] Notificaciones reales al reportar
- [ ] **Complejidad**: Baja | **Tiempo**: 1 hora
- [ ] **Riesgo**: Bajo

---

## 🟡 NIVEL 3: NOTIFICACIONES REALES (Mejora UX)

### 3.1 Push Notifications desde Servidor
- [ ] **Firebase Cloud Functions para push**
  - [ ] Endpoint para enviar push masivo
  - [ ] Endpoint para push individual
  - [ ] Guardar tokens en Firestore (no localStorage)
- [ ] **Complejidad**: Media | **Tiempo**: 2 horas
- [ ] **Riesgo**: Bajo (nuevo feature)

### 3.2 Notificaciones Automáticas
- [ ] **Triggers automáticos**
  - [ ] Bienvenida al registrarse
  - [ ] Nuevas asignaciones mensuales
  - [ ] Recordatorios de cumplimiento
  - [ ] Cuando alguien te reporta
- [ ] **Complejidad**: Media | **Tiempo**: 1-2 horas
- [ ] **Riesgo**: Bajo

---

## 🟢 NIVEL 4: MEJORAS DE ALGORITMO (Opcional/Futuro)

### 4.1 Algoritmo con LLM
- [ ] **Integrar OpenAI/Claude API**
  - [ ] Analizar bios y descripciones de negocio
  - [ ] Matching semántico (no solo por categoría)
  - [ ] Detectar sinergias no obvias
  - [ ] Explicar por qué se matchearon
- [ ] **Complejidad**: Alta | **Tiempo**: 4-6 horas
- [ ] **Riesgo**: Bajo (mejora opcional)
- [ ] **Costo**: ~$0.01-0.10 por matching (API OpenAI)

### 4.2 Scoring Dinámico
- [ ] **Mejorar compatibilidad**
  - [ ] Historial de interacciones pasadas
  - [ ] Feedback de usuarios sobre matches
  - [ ] Penalizar usuarios que no cumplen
- [ ] **Complejidad**: Media | **Tiempo**: 2 horas
- [ ] **Riesgo**: Bajo

---

## 🔵 NIVEL 5: PULIDO FINAL (Pre-entrega)

### 5.1 Testing
- [ ] **Pruebas end-to-end**
  - [ ] Flujo completo de registro
  - [ ] Login/logout en múltiples dispositivos
  - [ ] Verificar que datos sincronizan
  - [ ] Probar offline/online
- [ ] **Complejidad**: Baja | **Tiempo**: 1-2 horas

### 5.2 PWA Completa
- [ ] **Service Worker para offline**
  - [ ] Cache de assets
  - [ ] Cola de acciones offline
  - [ ] Sincronización al reconectar
- [ ] **Complejidad**: Media | **Tiempo**: 1-2 horas

### 5.3 Seguridad
- [ ] **Reglas de Firestore**
  - [ ] Usuarios solo leen/escriben sus datos
  - [ ] Admin puede leer todo
  - [ ] Validación de datos en servidor
- [ ] **Complejidad**: Media | **Tiempo**: 1 hora

### 5.4 Documentación Final
- [ ] **Actualizar USO.md**
- [ ] **Crear README técnico**
- [ ] **Documentar APIs y estructura de datos**
- [ ] **Video tutorial de uso**

---

## 📅 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

### Fase 1: Base (Día 1)
```
1.1 Firestore → 1.2 Firebase Auth → 1.3 Migración datos
```
**Resultado**: App funciona con datos en cloud

### Fase 2: Lógica (Día 2)  
```
2.1 cloudService → 2.2 Algoritmo cloud → 2.3 Reportes
```
**Resultado**: Todos los usuarios ven mismos datos

### Fase 3: Notificaciones (Día 3)
```
3.1 Push servidor → 3.2 Triggers automáticos
```
**Resultado**: Notificaciones reales funcionando

### Fase 4: Pulido (Día 4)
```
5.1 Testing → 5.2 PWA offline → 5.3 Seguridad → 5.4 Docs
```
**Resultado**: MVP entregable

### Fase 5: LLM (Opcional/Futuro)
```
4.1 Algoritmo LLM → 4.2 Scoring dinámico
```
**Resultado**: Matching inteligente

---

## ⏱️ ESTIMACIÓN TOTAL

| Fase | Tiempo | Prioridad |
|------|--------|-----------|
| Fase 1: Base | 4-5 horas | 🔴 Crítica |
| Fase 2: Lógica | 5-6 horas | 🔴 Crítica |
| Fase 3: Notificaciones | 3-4 horas | 🟠 Alta |
| Fase 4: Pulido | 4-5 horas | 🟠 Alta |
| Fase 5: LLM | 6-8 horas | 🟢 Opcional |

**Total MVP Real: ~20 horas de desarrollo**
**Con LLM: ~28 horas**

---

## 🎯 DECISIÓN INMEDIATA

¿Empezamos con **Fase 1.1: Configurar Firestore**?

Esto implica:
1. Crear colecciones en Firebase Console
2. Crear `services/firestoreService.ts`
3. Migrar los 23 usuarios
4. Actualizar componentes para usar Firestore

**No rompe nada existente** - creamos un nuevo servicio y lo integramos gradualmente.

---

*Creado: 28-Nov-2025*
