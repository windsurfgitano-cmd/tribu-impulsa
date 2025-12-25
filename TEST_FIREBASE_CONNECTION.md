# 🧪 TEST: Verificación de Firebase y Sistema de Login

## ✅ CHECKLIST DE VERIFICACIÓN

### 1. Configuración de Firebase

**📄 Archivo:** `services/firebaseService.ts`

```typescript
✅ apiKey: "AIzaSyDWdi5OUpZmGuS_qLtyCSF-EXffSF3heJA"
✅ authDomain: "tribu-impulsa.firebaseapp.com"
✅ projectId: "tribu-impulsa"
✅ storageBucket: "tribu-impulsa.firebasestorage.app"
✅ messagingSenderId: "348097115578"
✅ appId: "1:348097115578:web:115960bb81563050d01983"
✅ vapidKey: "BIhxjd_diMAgmMBrqvYxISkqe_vEKy3GYqK0tgNQOFlMQ37K_b0UhqmXAFXDjIayCDcAtBmLLktE50Gxn5tFLUE"
```

**Estado:** ✅ Configurado correctamente

---

### 2. Flujo de Registro de Usuarios

**📄 Archivo:** `services/realUsersData.ts` → `registerNewUser()`

**Flujo implementado:**

```
1. ✅ Validación de email duplicado LOCAL
   → Función: emailExists()
   
2. ✅ Validación de email en Firebase Auth
   → fetchSignInMethodsForEmail()
   
3. ✅ Crear usuario en Firebase Authentication
   → createUserWithEmailAndPassword()
   
4. ✅ Guardar perfil completo en Firestore
   → setDoc(db, 'users', userId)
   
5. ✅ Actualizar contador global
   → updateDoc(db, 'system_stats/global')
   
6. ✅ Guardar en localStorage
   → localStorage.tribu_users
```

**Estado:** ✅ Implementado correctamente (Transaccional Auth → Firestore → Local)

---

### 3. Flujo de Login de Usuarios

**📄 Archivo:** `services/realUsersData.ts` → `validateCredentials()`

**Flujo implementado:**

```
1. ✅ Login con Firebase Authentication
   → signInWithEmailAndPassword()
   
2. ✅ Buscar perfil en localStorage
   → getUserByEmail()
   
3. ✅ Si no está local, buscar en Firestore
   → getUserFromFirebaseByEmail()
   
4. ✅ Retornar perfil completo con firstLogin flag
```

**Estado:** ✅ Implementado correctamente (Auth → Firestore → Local)

---

### 4. Sincronización de Datos

**📄 Archivo:** `services/realUsersData.ts`

**Funciones de sincronización:**

```typescript
✅ syncAllUsersToFirebase()
   → Sube TODOS los usuarios locales a Firestore

✅ forceReloadRealUsers()
   → Recarga usuarios desde Firestore

✅ getUserFromFirebaseByEmail(email)
   → Busca usuario específico en Firestore (case-insensitive)
```

**Estado:** ✅ Sincronización bidireccional implementada

---

### 5. Verificación de Perfiles Completos

**📄 Archivo:** `utils/validation.ts` → `isProfileComplete()`

**Campos requeridos:**

```typescript
✅ name (Nombre completo)
✅ email (Email válido)
✅ companyName (Nombre empresa/emprendimiento)
✅ category (Categoría de negocio)
✅ affinity (Afinidad/subcategoría)
✅ bio (Biografía corta)
✅ businessDescription (Descripción del negocio)
✅ instagram (Perfil de Instagram con @)
✅ phone (Teléfono con +569)
✅ revenue (Facturación mensual)
✅ termsAccepted (Términos aceptados)

// Validación geográfica según scope:
✅ scope: 'NACIONAL' → No requiere ubicación adicional
✅ scope: 'REGIONAL' → Requiere selectedRegions[]
✅ scope: 'LOCAL' → Requiere city + comuna
```

**Estado:** ✅ Validación completa implementada

---

## 🧪 PRUEBAS A REALIZAR

### Prueba 1: Registro de Nuevo Usuario

**Pasos:**

1. Abrir app en navegador: `http://localhost:3001` o `https://www.tribuimpulsa.cl`
2. Click en "¡Crear mi cuenta GRATIS!"
3. Ingresar email nuevo: `test@ejemplo.com`
4. Completar formulario:
   - Nombre: "Test Usuario"
   - Empresa: "Test Company"
   - Instagram: "testuser" (se auto-formatea a @testuser)
   - Teléfono: "123456789" (se auto-formatea a +569123456789)
   - Website: "ejemplo.com" (se auto-formatea a https://ejemplo.com)
   - Categoría: Seleccionar cualquiera
   - Alcance: NACIONAL
   - Bio y descripción de negocio
   - Facturación mensual
   - Aceptar términos
5. Click "Registrarme"

**Resultado esperado en consola:**

```javascript
🔐 [REGISTER] Paso 1/3: Creando en Firebase Authentication...
✅ [REGISTER] Creado en Authentication: [UID]
📦 [REGISTER] Paso 2/3: Guardando en Firestore...
✅ [REGISTER] Guardado en Firestore: test@ejemplo.com
📊 [REGISTER] Paso 3/3: Actualizando contador global...
✅ [REGISTER] Contador actualizado: profilesCompleted +1
💾 [REGISTER] Guardado en localStorage
✅ Nuevo usuario registrado: test@ejemplo.com
```

**Verificar en Firebase Console:**

1. **Authentication:** https://console.firebase.google.com/u/0/project/tribu-impulsa/authentication/users
   - ✅ Debe aparecer `test@ejemplo.com`
   
2. **Firestore:** https://console.firebase.google.com/u/0/project/tribu-impulsa/firestore/data/users
   - ✅ Debe existir documento con el ID del usuario
   - ✅ Todos los campos deben estar presentes

**Estado:** ⏳ Pendiente de prueba

---

### Prueba 2: Login con Usuario Existente

**Pasos:**

1. Cerrar sesión (si está logueado)
2. Click en "Ya tengo cuenta - Ingresar"
3. Ingresar email: `rincondeoz@gmail.com` (usuario pre-cargado)
4. Ingresar contraseña: `TRIBU2026`
5. Click "Iniciar Sesión"

**Resultado esperado en consola:**

```javascript
🔐 [VALIDATE] Validando credenciales para: rincondeoz@gmail.com
🔐 [VALIDATE] Paso 1: Autenticación con Firebase Auth...
✅ [VALIDATE] Autenticación exitosa: [UID]
🔍 [VALIDATE] Buscando perfil...
✅ [VALIDATE] Perfil encontrado localmente
✅ [VALIDATE] Credenciales válidas y perfil cargado
🔐 [LOGIN] Iniciando login para: rincondeoz@gmail.com
✅ [LOGIN] Login exitoso: rincondeoz@gmail.com
```

**Estado:** ⏳ Pendiente de prueba

---

### Prueba 3: Login con Credenciales Incorrectas

**Pasos:**

1. Click en "Ya tengo cuenta - Ingresar"
2. Ingresar email: `rincondeoz@gmail.com`
3. Ingresar contraseña incorrecta: `password123`
4. Click "Iniciar Sesión"

**Resultado esperado:**

```javascript
🔐 [VALIDATE] Validando credenciales para: rincondeoz@gmail.com
❌ [VALIDATE] Error de autenticación: auth/wrong-password
❌ [LOGIN] Credenciales inválidas
```

**UI debe mostrar:**
```
"Email o contraseña incorrectos. Verifica tus datos e intenta de nuevo."
```

**Estado:** ⏳ Pendiente de prueba

---

### Prueba 4: Intento de Registro con Email Duplicado

**Pasos:**

1. Click en "¡Crear mi cuenta GRATIS!"
2. Ingresar email existente: `rincondeoz@gmail.com`
3. Completar formulario
4. Click "Registrarme"

**Resultado esperado:**

```javascript
🔐 [REGISTER] Validando email...
❌ [REGISTER] Email ya existe en Firebase Authentication
```

**UI debe mostrar:**
```
alert("Este email ya está registrado. Por favor, inicia sesión.")
```

**Estado:** ⏳ Pendiente de prueba

---

### Prueba 5: Sincronización Firestore ↔ localStorage

**Pasos:**

1. Registrar usuario en dispositivo A
2. Verificar que aparece en Firebase Console
3. Abrir app en dispositivo B (mismo email)
4. Intentar login

**Resultado esperado:**

```javascript
🔐 [VALIDATE] Autenticación exitosa
🔍 [VALIDATE] Usuario no encontrado localmente, buscando en Firestore...
✅ [VALIDATE] Usuario cargado desde Firestore y guardado localmente
```

**Estado:** ⏳ Pendiente de prueba

---

### Prueba 6: Contador Rally 1000

**Pasos:**

1. Registrar nuevo usuario con perfil completo
2. Observar barra superior "Rally Activo"

**Resultado esperado:**

```javascript
📊 [REGISTER] Contador actualizado: profilesCompleted +1
```

**UI debe mostrar:**
```
"Rally Activo: X/1000" (incrementado en +1)
```

**Verificar en Firestore:**

```
Colección: system_stats
Documento: global
Campo: profilesCompleted → debe ser +1
```

**Estado:** ⏳ Pendiente de prueba

---

### Prueba 7: Validación Geográfica

**Caso 1: NACIONAL**

```
Alcance: NACIONAL
✅ NO debe pedir región
✅ NO debe pedir comuna
✅ Debe permitir registro sin ubicación adicional
```

**Caso 2: REGIONAL**

```
Alcance: REGIONAL
✅ Debe pedir seleccionar regiones (checkboxes)
✅ NO debe pedir comuna
✅ Debe permitir múltiples regiones
```

**Caso 3: LOCAL**

```
Alcance: LOCAL
✅ Debe mostrar dropdown de regiones
✅ Al seleccionar región, mostrar dropdown de comunas
✅ Debe pedir seleccionar comuna
```

**Estado:** ⏳ Pendiente de prueba

---

### Prueba 8: Auto-formateo de Campos

**Instagram:**
```
Input: "rincondeoz"
Output: "@rincondeoz" ✅
```

**Teléfono:**
```
Input: "987654321"
Output: "+569987654321" ✅
```

**Website:**
```
Input: "rincondeoz.com"
Output: "https://rincondeoz.com" ✅
```

**Estado:** ⏳ Pendiente de prueba

---

## 🔧 COMANDOS ÚTILES PARA DEBUGGING

### Verificar usuarios en localStorage

```javascript
// En consola del navegador (F12)
console.log(JSON.parse(localStorage.getItem('tribu_users')));
```

### Verificar contador global

```javascript
// En consola del navegador (F12)
console.log(localStorage.getItem('profilesCompleted'));
```

### Verificar sesión actual

```javascript
// En consola del navegador (F12)
console.log(JSON.parse(localStorage.getItem('tribu_current_user')));
```

### Limpiar localStorage (reset completo)

```javascript
// En consola del navegador (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Limpiar solo usuarios locales

```javascript
// En consola del navegador (F12)
localStorage.removeItem('tribu_users');
localStorage.removeItem('tribu_current_user');
location.reload();
```

---

## 🚨 PROBLEMAS POTENCIALES Y SOLUCIONES

### Problema 1: "Firebase not initialized"

**Causa:** Firebase no se inicializó correctamente

**Solución:**
1. Verificar que firebaseConfig tiene todas las keys
2. Verificar que initializeFirebase() se llama en App.tsx
3. Verificar que getFirestoreInstance() retorna un objeto válido

```typescript
// En consola del navegador
import { getFirestoreInstance } from './services/firebaseService';
console.log(getFirestoreInstance());
```

---

### Problema 2: "auth/email-already-in-use" pero UI no muestra error

**Causa:** Error capturado pero no propagado a UI

**Solución:**
```typescript
// En registerNewUser(), línea 888-892
if (authError.code === 'auth/email-already-in-use') {
  console.error('❌ Email ya existe');
  alert('Este email ya está registrado.'); // ← Este alert debe aparecer
  return null;
}
```

---

### Problema 3: Usuario se registra pero no aparece en Firestore

**Causa:** Error en paso 2 de sincronización

**Verificar logs:**
```javascript
📦 [REGISTER] Paso 2/3: Guardando en Firestore...
❌ [REGISTER] Error guardando en Firestore: [error]
```

**Solución:**
1. Verificar permisos de Firestore Rules
2. Verificar que db no es null
3. Verificar que el documento tiene todos los campos requeridos

---

### Problema 4: Login funciona pero perfil aparece vacío

**Causa:** Perfil no sincronizado desde Firestore a localStorage

**Verificar:**
```javascript
🔍 [VALIDATE] Usuario no encontrado localmente, buscando en Firestore...
✅ [VALIDATE] Usuario cargado desde Firestore
```

**Solución:**
```typescript
// getUserFromFirebaseByEmail() debe guardar en localStorage:
localStorage.setItem('tribu_users', JSON.stringify([...existingUsers, userProfile]));
```

---

### Problema 5: Contador Rally no se actualiza

**Causa:** system_stats/global no se está actualizando

**Verificar:**
```javascript
📊 [REGISTER] Paso 3/3: Actualizando contador global...
✅ [REGISTER] Contador actualizado: profilesCompleted +1
```

**Solución:**
1. Verificar que existe el documento `system_stats/global`
2. Crear manualmente si no existe:

```javascript
// En Firebase Console → Firestore
Colección: system_stats
Documento: global
Campos:
  - profilesCompleted: 0
  - membersActive: 0
  - lastUpdated: [timestamp]
```

---

## ✅ CHECKLIST DE APROBACIÓN

Antes de considerar el sistema listo para producción:

```
[ ] Prueba 1: Registro exitoso
[ ] Prueba 2: Login exitoso
[ ] Prueba 3: Login con credenciales incorrectas (error correcto)
[ ] Prueba 4: Email duplicado rechazado
[ ] Prueba 5: Sincronización entre dispositivos
[ ] Prueba 6: Contador Rally actualizado
[ ] Prueba 7: Validación geográfica (3 casos)
[ ] Prueba 8: Auto-formateo de campos

[ ] Usuario aparece en Firebase Authentication
[ ] Perfil completo en Firestore
[ ] localStorage sincronizado
[ ] Contador global incrementado
[ ] No hay errores en consola
[ ] UI muestra mensajes de error apropiados
```

---

## 🎯 ESTADO ACTUAL DEL SISTEMA

**Fecha:** 25 Diciembre 2024  
**Versión:** v0.9.1

### Configuración:
- ✅ Firebase configurado
- ✅ Firestore inicializado
- ✅ Authentication activo
- ✅ Credenciales válidas

### Funcionalidades:
- ✅ Registro de usuarios implementado
- ✅ Login con Firebase Auth implementado
- ✅ Sincronización transaccional (Auth → Firestore → Local)
- ✅ Validación de emails duplicados
- ✅ Auto-formateo de campos (Instagram, teléfono, website)
- ✅ Validación geográfica por scope
- ✅ Contador Rally 1000 conectado

### Pendiente:
- ⏳ **Pruebas manuales de todos los flujos**
- ⏳ **Regenerar credenciales de Firebase (expuestas en Git)**
- ⏳ **Verificar en producción (www.tribuimpulsa.cl)**

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Ejecutar todas las pruebas de este documento**
2. **Documentar resultados y screenshots**
3. **Regenerar credenciales de Firebase** (GUIA_RAPIDA_VERCEL.md)
4. **Actualizar Vercel con nuevas credenciales**
5. **Re-deployar a producción**
6. **Probar en producción**

---

**Documento creado:** 25 Diciembre 2024 (Modo Crisis)  
**Estado:** 🚨 VERIFICACIÓN URGENTE REQUERIDA  
**Responsable:** Equipo Dev + Doraluz (CEO)

