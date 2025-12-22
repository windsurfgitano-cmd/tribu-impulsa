# FASE II - PARTE 2: PERSISTENCIA DE DATOS Y SINCRONIZACIÓN

## 📋 RESUMEN EJECUTIVO

**Proyecto:** Tribu Impulsa - Sistema de Persistencia de Datos  
**Fecha:** 19 Diciembre 2025  
**Problema Resuelto:** Pérdida de datos de perfil de usuarios  
**Usuarios Afectados:** Doraluz Galleguillos, Dafna Finkelstein  
**Estado:** ✅ RESUELTO

---

## 🔍 DIAGNÓSTICO DEL PROBLEMA

### Síntoma Reportado
Los usuarios reportaban que al editar su perfil y guardar cambios, los datos se "borraban" o no persistían correctamente.

### Causa Raíz Identificada
El sistema tenía una arquitectura de datos dual (localStorage + Firebase) con problemas de sincronización:

1. **localStorage** = Almacenamiento local del navegador (volátil)
2. **Firebase Firestore** = Base de datos en la nube (persistente)

**El problema:** Cuando el usuario limpiaba caché, cambiaba de navegador o dispositivo, el localStorage se borraba y la app NO sincronizaba automáticamente desde Firebase.

### Verificación en Firebase
Se confirmó que los datos de ambas usuarias **SÍ existían correctamente** en Firebase:

| Usuario | Email | Colección `users` | Colección `profiles` |
|---------|-------|-------------------|---------------------|
| Dafna Finkelstein | dafnafinkelstein@gmail.com | ✅ Existe | ✅ Existe |
| Doraluz Galleguillos | doraluz@terraflorpaisajismo.cl | ✅ Existe | ✅ Existe |

**Conclusión:** El problema era de CARGA, no de GUARDADO.

---

## 🔧 SOLUCIONES IMPLEMENTADAS

### Fix 1: Sincronización Automática al Restaurar Sesión
**Commit:** `70794a4`

**Antes:**
```
App carga → Lee sesión → Navega (sin verificar datos locales)
```

**Después:**
```
App carga → Lee sesión → ¿Usuario en localStorage? 
  → NO: Sincronizar desde Firebase → Continuar
  → SÍ: Continuar normalmente
```

**Código modificado:** `App.tsx` líneas 647-675

```typescript
useEffect(() => {
  const syncAndNavigate = async () => {
    const session = getStoredSession();
    if (session?.isLoggedIn && session.email) {
      let localUser = getUserByEmail(session.email);
      
      // Si no existe localmente, sincronizar desde Firebase
      if (!localUser) {
        localUser = await getUserFromFirebaseByEmail(session.email);
        if (localUser) {
          setCurrentUser(localUser.id);
        } else {
          localStorage.removeItem(AUTH_SESSION_KEY);
          return; // Mostrar login
        }
      }
      
      if (hasCompletedSurvey()) navigate('/dashboard');
      else navigate('/survey');
    }
  };
  syncAndNavigate();
}, [navigate]);
```

---

### Fix 2: Botón "Sincronizar" Mejorado
**Commit:** `3e454f1` → `e870a48`

**Antes (PELIGROSO):**
```
Sincronizar → Descargar de Firebase → Sobrescribir localStorage
(Si había cambios locales no guardados, SE PERDÍAN)
```

**Después (SEGURO):**
```
Sincronizar → PRIMERO subir datos locales a Firebase → LUEGO descargar
(Nunca se pierden cambios)
```

**Código modificado:** `App.tsx` líneas 3654-3711

```typescript
onClick={async () => {
  // PASO 1: PRIMERO subir datos locales a Firebase
  if (localUser) {
    await syncUserToFirebase(localUser.id, {
      name: localUser.name,
      companyName: localUser.companyName,
      // ... todos los campos
    });
  }
  
  // PASO 2: LUEGO descargar datos frescos de Firebase
  const freshUser = await getUserFromFirebaseByEmail(session.email);
  // ... actualizar UI
}}
```

---

### Fix 3: Guardado con Reintentos
**Commit:** `e870a48`

**Antes:**
```
Guardar → localStorage ✅ → Firebase (si falla, silencioso) ⚠️
```

**Después:**
```
Guardar → localStorage ✅ → Firebase (3 reintentos, 1s entre cada uno)
  → Si falla 3 veces: Mensaje claro "⚠️ Guardado local. Presiona Sincronizar"
```

**Código modificado:** `App.tsx` líneas 3568-3612

```typescript
let firebaseSaved = false;
let retries = 3;

while (!firebaseSaved && retries > 0) {
  try {
    await syncUserToFirebase(currentUser.id, profileData);
    await syncProfileToCloud({...});
    firebaseSaved = true;
    setSaveMessage('✅ Perfil guardado y sincronizado');
  } catch (error) {
    retries--;
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

if (!firebaseSaved) {
  setSaveMessage('⚠️ Guardado local. Presiona Sincronizar para subir a la nube.');
}
```

---

## 📊 FLUJOS DE DATOS ACTUALIZADOS

### Flujo 1: Login de Usuario Existente
```
1. Usuario ingresa email
2. Buscar en localStorage
   → Si existe: Validar contraseña
   → Si NO existe: Buscar en Firebase → Sincronizar a localStorage
3. Validar contraseña (TRIBU2026 o personalizada)
4. Guardar sesión en localStorage
5. Navegar a dashboard/membership
```

### Flujo 2: Registro de Nuevo Usuario
```
1. Usuario completa formulario
2. Crear usuario en localStorage
3. Sincronizar a Firebase (colección 'users')
4. Guardar sesión
5. Navegar a membership
```

### Flujo 3: Editar Perfil + Guardar
```
1. Usuario edita campos
2. Presiona "Guardar"
3. Guardar en localStorage ✅
4. Intentar Firebase (hasta 3 veces)
   → Éxito: "✅ Perfil guardado y sincronizado"
   → Fallo: "⚠️ Guardado local. Presiona Sincronizar"
5. Cerrar modo edición
```

### Flujo 4: Botón Sincronizar
```
1. Usuario presiona "Sincronizar"
2. ⬆️ Subir datos locales a Firebase (proteger cambios)
3. ⬇️ Descargar datos frescos de Firebase
4. Actualizar localStorage
5. Actualizar UI
6. "✅ Sincronización completa"
```

### Flujo 5: Restaurar Sesión (App Carga)
```
1. App se carga
2. Leer sesión de localStorage
3. ¿Sesión activa?
   → NO: Mostrar login
   → SÍ: ¿Usuario en localStorage?
     → NO: Sincronizar desde Firebase
     → SÍ: Continuar
4. Navegar a dashboard/survey
```

---

## 🗄️ ARQUITECTURA DE DATOS

### Fuentes de Datos

| Fuente | Tipo | Persistencia | Uso |
|--------|------|--------------|-----|
| `localStorage['tribu_users']` | Array JSON | Volátil (navegador) | Caché local, acceso rápido |
| `localStorage['tribu_session']` | JSON | Volátil | Sesión activa |
| Firebase `users/{userId}` | Documento | Permanente | Fuente de verdad |
| Firebase `profiles/{userId}` | Documento | Permanente | Datos extendidos |

### Prioridad de Datos

```
ESCRITURA: localStorage → Firebase (ambos)
LECTURA:   localStorage (primero) → Firebase (si no existe local)
CONFLICTO: Firebase gana (es la fuente de verdad)
```

### Campos Sincronizados

| Campo | localStorage | Firebase users | Firebase profiles |
|-------|--------------|----------------|-------------------|
| email | ✅ | ✅ | ✅ |
| name | ✅ | ✅ | ✅ |
| companyName | ✅ | ✅ | ✅ |
| phone | ✅ | ✅ | ✅ |
| instagram | ✅ | ✅ | ✅ |
| category | ✅ | ✅ | ✅ |
| affinity | ✅ | ✅ (subCategory) | ✅ |
| bio | ✅ | ✅ | ✅ |
| city | ✅ | ✅ (location) | ✅ |
| scope | ✅ | ✅ | ✅ |
| comuna | ✅ | ✅ | ✅ |
| selectedRegions | ✅ | ✅ | ✅ |
| revenue | ✅ | ✅ | ✅ |
| avatarUrl | ✅ | ✅ | ✅ |
| coverUrl | ✅ | ✅ | ✅ |
| password | ✅ | ✅ | ❌ |

---

## 🛡️ PROTECCIONES IMPLEMENTADAS

### Contra Pérdida de Datos

1. **Reintentos automáticos:** 3 intentos con 1s de espera
2. **Mensajes claros:** Usuario sabe si falló Firebase
3. **Sincronizar sube primero:** Nunca sobrescribe sin guardar
4. **Restauración automática:** Al cargar app, sincroniza si falta

### Contra Inconsistencias

1. **Firebase es fuente de verdad:** En conflictos, Firebase gana
2. **Merge en lugar de replace:** `setDoc(..., { merge: true })`
3. **Timestamps de sincronización:** `syncedAt`, `updatedAt`

---

## 📝 COMMITS RELACIONADOS

| Commit | Descripción |
|--------|-------------|
| `70794a4` | fix: sincronizar datos de usuario desde Firebase al restaurar sesion |
| `3e454f1` | feat: mejorar boton Refrescar para sincronizar desde Firebase |
| `e870a48` | fix: logica robusta de guardado - reintentos Firebase + sincronizar sube antes de bajar |

---

## 🔄 BRANCH DEVELOP CREADO

Se creó el branch `develop` para trabajo futuro:

```bash
git checkout develop     # Trabajar aquí
git push origin develop  # Subir cambios

# Cuando esté probado:
git checkout main
git merge develop
git push origin main     # A producción
```

---

## ✅ VERIFICACIÓN

### Para Probar el Fix

1. **Limpiar caché del navegador** (o abrir en incógnito)
2. **Entrar a la app** con email de Doraluz o Dafna
3. **Verificar que los datos se cargan** automáticamente desde Firebase
4. **Editar perfil y guardar** → Debe decir "sincronizado"
5. **Presionar Sincronizar** → Debe completar sin perder datos

### Logs de Consola Esperados

```
🔄 Sesión activa pero usuario no en localStorage, sincronizando desde Firebase...
☁️ Usuario cargado desde Firebase y sincronizado: dafnafinkelstein@gmail.com
✅ Usuario sincronizado desde Firebase: Dafna Finkelstein
```

---

## 📅 PRÓXIMOS PASOS

1. **Monitorear** que Doraluz y Dafna no reporten más pérdidas
2. **Considerar** sincronización periódica en background
3. **Implementar** indicador visual de estado de conexión
4. **Agregar** cola de operaciones offline (para conexiones inestables)

---

**Documento generado:** 19 Diciembre 2025  
**Autor:** Sistema de Desarrollo Tribu Impulsa

---

## 📌 21 Diciembre 2025 — Refuerzo Firestore + Plan de Reinicio

### Actividades ejecutadas

| Tarea | Detalle |
| --- | --- |
| Respaldo completo | `TribuImpulsa_RESPALDOVIP.zip` generado y branch `RESPALDOVIP` creado para congelar estado previo a refactor. |
| Auditoría de sincronización | Se revisaron todos los módulos (databaseService, cloudBridge, membershipService, scripts legacy) y se listaron los usos de `localStorage` que deben migrar a Firestore como fuente única. |
| Arquitectura modular | Documento `docs/ARQUITECTURA-MODULAR.md` con la propuesta de dividir `App.tsx` en módulos de dominio, capas core/infra y roadmap de extracción. |
| Plan de reinicio Firestore | Documento `docs/REINICIO-FIRESTORE.md` con procedimiento de wipe + seed, campos obligatorios y checklist para activar el algoritmo 10+10 solo con perfiles completos. |

### Estado actual
- ✅ Diagnóstico y documentación listos.
- 🔄 Pendiente implementar scripts de limpieza, validaciones de perfil completo y barra/hitos de 1.000 usuarios antes de habilitar Tribu 10+10.

### Próximo foco
1. Crear script `scripts/reset-firestore.ts` (Admin SDK) que haga backup opcional, wipe controlado y semilla básica.
2. Aplicar validaciones obligatorias en onboarding/perfil (bloqueo de módulos si falta algún campo).
3. Implementar contador global + barra de progreso e hitos cada 50 usuarios hasta los 1.000 necesarios para reactivar matches 10+10.
