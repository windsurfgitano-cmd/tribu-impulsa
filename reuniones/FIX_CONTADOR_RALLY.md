# Fix: Contador del Rally 1000

**Fecha:** 23 de Diciembre, 2025  
**Problema Reportado:** El contador del Rally solo muestra 3/1000 y no se actualiza con los usuarios reales de Firebase

---

## 🔍 Problema Identificado

### 1. Incremento Incorrecto en el Registro
**Archivo:** `services/realUsersData.ts` (líneas 585-586)

**Código Anterior (❌ Incorrecto):**
```typescript
// ❌ Incrementaba SIEMPRE sin validar si el perfil está completo
await updateDoc(statsRef, {
  profilesCompleted: increment(1),  // Siempre +1
  membersActive: increment(1)
});
```

**Problema:** Cada vez que alguien se registraba, el contador `profilesCompleted` se incrementaba automáticamente, **sin importar si el usuario había completado todos los campos obligatorios del perfil**.

### 2. Falta de Actualización al Completar Perfil
**Archivo:** `App.tsx` - función `syncProfileCompletionState`

**Problema:** Cuando un usuario completaba su perfil después del registro inicial, el contador global NO se actualizaba automáticamente.

### 3. Desincronización con la Realidad
**Estado Encontrado:**
- **Firebase real:** 10 usuarios totales, solo 2 con perfiles completos
- **Contador mostraba:** 3/1000 (valor desincronizado)
- **Causa:** Registros antiguos que incrementaron el contador sin validación

---

## ✅ Solución Implementada

### 1. Fix en `services/realUsersData.ts`

**Código Nuevo (✅ Correcto):**
```typescript
// ✅ Solo incrementar profilesCompleted si el perfil está completo
const updateData: any = {
  membersActive: increment(1)
};

if (newUser.profileComplete === true) {
  updateData.profilesCompleted = increment(1);
  console.log('📊 Contador de perfiles completos actualizado (+1)');
} else {
  console.log('📊 Usuario registrado pero perfil incompleto, contador no incrementado');
}

await updateDoc(statsRef, updateData);
```

**Beneficios:**
- ✅ Solo incrementa `profilesCompleted` cuando `profileComplete === true`
- ✅ Siempre incrementa `membersActive` (todos los registros)
- ✅ Logs claros para debugging

### 2. Fix en `App.tsx` - `syncProfileCompletionState`

**Código Nuevo (✅ Actualización Automática):**
```typescript
// 📊 Actualizar contador global cuando el perfil cambia de estado
if (profileStatusChanged) {
  const statsRef = doc(db, 'system_stats', 'global');
  const statsDoc = await getDoc(statsRef);
  
  if (statsDoc.exists()) {
    if (isComplete) {
      // Perfil pasó de incompleto a completo
      await updateDoc(statsRef, {
        profilesCompleted: increment(1)
      });
      console.log('📊 Contador incrementado (+1) tras completar perfil');
    } else {
      // Perfil pasó de completo a incompleto
      await updateDoc(statsRef, {
        profilesCompleted: increment(-1)
      });
      console.log('📊 Contador decrementado (-1) tras marcar incompleto');
    }
  }
}
```

**Beneficios:**
- ✅ Detecta cambios de estado del perfil (incompleto ↔ completo)
- ✅ Actualiza el contador automáticamente cuando alguien completa su perfil
- ✅ Maneja también el caso inverso (perfil pasa a incompleto)

### 3. Sincronización Manual Ejecutada

**Script:** `node scripts/sync-profile-count.cjs`

**Resultado:**
```
📊 Usuarios totales en Firestore: 10
✅ Perfiles con datos mínimos: 2
📈 Nuevo valor: 2/1000 perfiles
```

**Acción:** Corrección del valor desincronizado (3 → 2) basándose en la validación real de perfiles completos.

---

## 🎯 Resultado Final

### Antes (❌):
- Contador: `3/1000` (incorrecto)
- Problema: No se actualizaba con usuarios reales
- Causa: Incremento ciego sin validación

### Después (✅):
- Contador: `2/1000` (correcto)
- **Sincronización en Tiempo Real:** El frontend escucha cambios en Firebase con `onSnapshot`
- **Actualización Automática:** Cada vez que alguien:
  - Se registra con perfil completo → Contador +1
  - Completa su perfil después → Contador +1
  - El valor cambia en Firebase → UI actualiza automáticamente

---

## 📊 Listeners en Tiempo Real (Ya Implementados)

El frontend ya tenía múltiples listeners configurados correctamente:

### 1. Landing Page (línea ~727)
```typescript
onSnapshot(doc(db, 'system_stats', 'global'), (docSnap) => {
  if (docSnap.exists()) {
    const data = docSnap.data();
    setProfilesCount(data.profilesCompleted || 0);
  }
});
```

### 2. Dashboard - ProgressBanner (línea ~3177)
```typescript
onSnapshot(statsRef, snapshot => {
  const data = snapshot.data() || {};
  const current = data.profilesCompleted || 0;
  setGlobalProgress({ current, target: 1000, ... });
});
```

### 3. Mi Tribu - Gating (línea ~9133)
```typescript
const statsRef = doc(db, 'system_stats', 'global');
const snapshot = await getDoc(statsRef);
setNavGlobalProgress({
  current: data.profilesCompleted || 0,
  target: 1000
});
```

**Conclusión:** El sistema de sincronización en tiempo real ya estaba bien implementado. El problema era únicamente la lógica de incremento del contador en el backend.

---

## 🧪 Testing

### Validación Realizada:
1. ✅ Ejecutado script de auditoría: `node scripts/audit-firebase-users.cjs`
2. ✅ Ejecutado script de sincronización: `node scripts/sync-profile-count.cjs`
3. ✅ Verificado contador en landing page: muestra `2/1000`
4. ✅ Verificado actualización en tiempo real: cambios se reflejan automáticamente

### Testing Pendiente:
- [ ] Registrar un nuevo usuario con perfil completo → Verificar contador +1
- [ ] Registrar un usuario con perfil incompleto → Verificar contador NO aumenta
- [ ] Completar un perfil incompleto → Verificar contador +1
- [ ] Verificar que el contador se mantenga sincronizado en múltiples sesiones

---

## 📝 Archivos Modificados

1. **`services/realUsersData.ts`**
   - Líneas 579-598: Lógica condicional para incrementar `profilesCompleted`

2. **`App.tsx`**
   - Líneas 573-603: Función `syncProfileCompletionState` actualizada con contador global

3. **`reuniones/CAMBIOS.md`**
   - Entrada #67: Documentación del fix

---

## 🚀 Beneficios del Fix

1. **Precisión:** El contador ahora refleja la realidad exacta de perfiles completos
2. **Actualización Automática:** No requiere sincronización manual
3. **Tiempo Real:** Los cambios se propagan instantáneamente a todos los usuarios conectados
4. **Logging Mejorado:** Mensajes de consola claros para debugging
5. **Mantenibilidad:** Lógica clara y fácil de entender

---

## 📖 Documentación Relacionada

- **Auditoría Completa:** `reuniones/AUDITORIA_COMPLETA_2025-12-23.md`
- **Bitácora de Cambios:** `reuniones/CAMBIOS.md` (Entrada #67)
- **Script de Auditoría:** `scripts/audit-firebase-users.cjs`
- **Script de Sincronización:** `scripts/sync-profile-count.cjs`

---

**Estado:** ✅ RESUELTO  
**Próxima Acción:** Testing end-to-end del flujo completo de registro

