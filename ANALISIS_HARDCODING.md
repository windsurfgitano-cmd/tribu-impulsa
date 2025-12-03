# 🔍 ANÁLISIS DE DATOS HARDCODEADOS

## 🚨 CRÍTICO - REQUIERE MIGRACIÓN INMEDIATA

### 1. Usuarios (realUsersData.ts)
- **Estado:** ❌ HARDCODEADO
- **Problema:** 108 usuarios en código, se recargan cada vez
- **Solución:** Migrar a Firebase, cargar solo desde allí
- **Impacto:** Usuarios no pueden ser modificados/eliminados permanentemente

### 2. Datos de Seed (seedData.ts)  
- **Estado:** ⚠️ LEGACY
- **Problema:** Usuarios de prueba adicionales (no se usan activamente)
- **Solución:** Eliminar archivo, usar solo Firebase

### 3. Mock Profiles (matchService.ts)
- **Estado:** ⚠️ FALLBACK
- **Problema:** `DUMMY_DATABASE` con 50 perfiles fake
- **Solución:** Ya usa usuarios reales como prioridad, pero limpiar fallback

---

## ✅ CORRECTO - USA FIREBASE/LOCALSTORAGE

### 1. Configuración Admin (tribu_admin_config)
- **Estado:** ✅ OK
- **Almacenamiento:** localStorage + sincronizable
- **Datos:** Precio membresía, WhatsApp soporte, etc.

### 2. Membresías 
- **Estado:** ✅ OK
- **Almacenamiento:** localStorage + Firebase
- **Datos:** Estado de membresía por usuario

### 3. Notificaciones
- **Estado:** ✅ OK (recién arreglado)
- **Almacenamiento:** localStorage + Firebase
- **Datos:** Notificaciones de usuarios

### 4. Historial de Pagos
- **Estado:** ✅ OK (nuevo)
- **Almacenamiento:** Firebase (payment_history)

---

## 📦 LLAVES DE LOCALSTORAGE ACTUALES

| Llave | Descripción | Sincroniza con Firebase? |
|-------|-------------|--------------------------|
| `tribu_users` | Lista de usuarios | ⚠️ Parcial (sobreescribe) |
| `tribu_notifications` | Notificaciones | ✅ Sí |
| `tribu_interactions` | Interacciones | ⚠️ No |
| `tribu_reports` | Reportes | ⚠️ No |
| `tribu_admin_config` | Config admin | ⚠️ No |
| `membership_status_{id}` | Estado membresía | ✅ Sí |
| `membership_payment_{id}` | Datos pago | ✅ Sí |
| `tribe_assignments` | Asignaciones tribu | ⚠️ No |
| `user_session` | Sesión actual | ❌ No (solo local) |

---

## 🎯 PLAN DE MIGRACIÓN

### Fase 1: Usuarios (AHORA)
1. Subir 108 usuarios a Firebase (colección 'users')
2. Cambiar `forceReloadRealUsers` para cargar SOLO desde Firebase
3. Mantener código como fallback si Firebase falla

### Fase 2: Configuración
1. Sincronizar `tribu_admin_config` con Firebase
2. Permitir cambios desde cualquier dispositivo admin

### Fase 3: Datos Secundarios
1. Sincronizar tribe_assignments con Firebase
2. Sincronizar reportes con Firebase
3. Sincronizar interacciones con Firebase

---

## 🧪 TESTS REQUERIDOS

| Función | Test | Estado |
|---------|------|--------|
| Registro usuario | Crear cuenta nueva | ⏳ |
| Login | Credenciales correctas/incorrectas | ⏳ |
| Editar perfil | Cambiar datos y verificar persistencia | ⏳ |
| Subir foto | Upload a Firebase Storage | ⏳ |
| Ver tribu | Cargar 20 asignaciones | ⏳ |
| Checklist | Marcar items y verificar | ⏳ |
| Membresía | Otorgar/Revocar desde admin | ⏳ |
| Notificaciones | Enviar y recibir | ⏳ |
| WhatsApp | Links funcionan | ⏳ |
| Baja usuario | Eliminar y no vuelve | ⏳ |
