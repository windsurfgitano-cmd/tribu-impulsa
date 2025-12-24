# 🗑️ RESET COMPLETO - Borrar TODAS las Cuentas

## ⚠️ ADVERTENCIA
Este script borrará **TODAS** las cuentas de usuarios de:
- ✅ localStorage
- ✅ Firebase Firestore
- ✅ Datos de sesión
- ✅ Datos de onboarding

**NO SE PUEDE DESHACER**

---

## 🚀 Cómo Ejecutar el Reset

### Opción 1: Desde la Consola del Navegador (Recomendado)

1. Abre la app en producción: https://www.tribuimpulsa.cl
2. Abre la consola del navegador (F12)
3. Pega este código y presiona Enter:

```javascript
(async () => {
  const { deleteAllAccounts } = await import('./services/realUsersData.js');
  const result = await deleteAllAccounts();
  console.log('✅ Reset completado:', result);
})();
```

---

### Opción 2: Descomentar en App.tsx

1. Abre `App.tsx`
2. Busca la sección `// 🗑️ RESET COMPLETO`
3. Descomenta las líneas:

```typescript
// 🗑️ RESET COMPLETO: Descomentar SOLO para borrar TODAS las cuentas
try {
  const { deleteAllAccounts } = await import('./services/realUsersData');
  const result = await deleteAllAccounts();
  console.log(`🗑️ RESET: ${result.localDeleted} local + ${result.firebaseDeleted} Firebase eliminadas`);
} catch (resetErr) {
  console.error('❌ Error en reset:', resetErr);
}
```

4. Guarda el archivo
5. La app se recargará automáticamente
6. Verás en la consola el progreso del borrado
7. **IMPORTANTE**: Vuelve a comentar las líneas después del reset

---

## 📊 Lo Que Verás en la Consola

```
🗑️ INICIANDO RESET COMPLETO - BORRANDO TODAS LAS CUENTAS...
📦 Encontradas 15 cuentas en localStorage
  ✅ Borrada de localStorage: usuario1@email.com
  ✅ Borrada de localStorage: usuario2@email.com
  ...
✅ 15 cuentas borradas de localStorage
🔥 Conectando a Firebase...
📦 Encontradas 15 cuentas en Firebase
  ✅ Borrada de Firebase: usuario1@email.com
  ✅ Borrada de Firebase: usuario2@email.com
  ...
✅ 15 cuentas borradas de Firebase
🧹 Limpiando datos relacionados...
✅ Datos relacionados limpiados

🎉 ========================================
   RESET COMPLETO TERMINADO
🎉 ========================================
   📦 localStorage: 15 cuentas eliminadas
   🔥 Firebase: 15 cuentas eliminadas
   ❌ Errores: 0
   ✨ Sistema limpio - listo para empezar desde cero
========================================
```

---

## ✨ Después del Reset

El sistema quedará completamente limpio:
- ✅ Sin cuentas de usuarios
- ✅ Sin sesiones activas
- ✅ Sin datos de onboarding
- ✅ Listo para crear nuevas cuentas con todas las mejoras implementadas

---

## 🎯 Beneficios de Empezar desde Cero

Con todas las mejoras que hemos implementado:
- ✅ Emails únicos (no más duplicados)
- ✅ Validación completa de perfiles
- ✅ Onboarding solo aparece una vez
- ✅ Facturación mensual se guarda correctamente
- ✅ Timestamps para evitar conflictos de sincronización
- ✅ Alcance geográfico sin texto basura
- ✅ Auto-prefijos para URLs, Instagram y teléfonos
- ✅ Validación correcta de alcance NACIONAL
- ✅ Botón cerrar sesión funcionando

---

## 🔒 Seguridad

La función `deleteAllAccounts()` está disponible pero **NO se ejecuta automáticamente**.
Debes ejecutarla manualmente para evitar borrados accidentales.

