# Guía de Pruebas - Tribu Impulsa v0.9.1

## ✅ Antes de Empezar

1. **Ejecuta el script de limpieza maestra:**
   ```
   https://www.tribuimpulsa.cl/cleanup-master.html
   ```
   - Click en "LIMPIAR TODO"
   - Confirma las acciones
   - Verifica que el contador Rally esté en 0/1000

2. **Recarga la aplicación con Ctrl + Shift + R**

---

## 📋 Checklist de Pruebas

### 1. Registro de Nuevo Usuario

#### Test 1.1: Registro NACIONAL
- [ ] Ir a la pantalla de login
- [ ] Click en "¡Crear mi cuenta GRATIS!"
- [ ] Ingresar email: `test-nacional@tribuimpulsa.cl`
- [ ] Completar TODOS los campos obligatorios
- [ ] Seleccionar alcance: **NACIONAL**
- [ ] **Verificar:** NO debe pedir región ni comuna
- [ ] Completar el registro
- [ ] **Verificar en Firebase Authentication:** Debe aparecer el email
- [ ] **Verificar en Firestore /users:** Debe aparecer 1 documento
- [ ] **Verificar contador Rally:** Debe mostrar 1/1000

#### Test 1.2: Registro REGIONAL
- [ ] Registrar nuevo usuario: `test-regional@tribuimpulsa.cl`
- [ ] Seleccionar alcance: **REGIONAL**
- [ ] Seleccionar regiones: Metropolitana, Valparaíso
- [ ] **Verificar:** NO debe pedir comuna
- [ ] Completar el registro
- [ ] **Verificar contador Rally:** Debe mostrar 2/1000

#### Test 1.3: Registro LOCAL
- [ ] Registrar nuevo usuario: `test-local@tribuimpulsa.cl`
- [ ] Seleccionar alcance: **LOCAL**
- [ ] Seleccionar región: Metropolitana
- [ ] Seleccionar comuna: Santiago
- [ ] **Verificar:** Debe pedir región Y comuna
- [ ] Completar el registro
- [ ] **Verificar contador Rally:** Debe mostrar 3/1000

---

### 2. Login con Usuario Existente

#### Test 2.1: Login Exitoso
- [ ] Cerrar sesión (botón en Ajustes)
- [ ] Ir a Login
- [ ] Click en "Ya tengo cuenta - Ingresar"
- [ ] Ingresar email: `test-nacional@tribuimpulsa.cl`
- [ ] Ingresar contraseña (la que usaste al registrar)
- [ ] **Verificar:** Debe entrar al Dashboard
- [ ] **Ver consola:** Debe mostrar logs de `[LOGIN]` y `[FIREBASE-SEARCH]`

#### Test 2.2: Login con Email No Registrado
- [ ] Cerrar sesión
- [ ] Intentar login con: `noexiste@test.com`
- [ ] **Verificar:** Debe mostrar "Este email no está registrado"

#### Test 2.3: Login con Contraseña Incorrecta
- [ ] Cerrar sesión
- [ ] Ingresar email existente: `test-nacional@tribuimpulsa.cl`
- [ ] Ingresar contraseña incorrecta: `wrongpassword`
- [ ] **Verificar:** Debe mostrar "Email o contraseña incorrectos"

---

### 3. Edición de Perfil

#### Test 3.1: Editar y Guardar
- [ ] Ir a "Mi Perfil"
- [ ] Click en "Editar Perfil"
- [ ] Cambiar biografía
- [ ] Cambiar facturación mensual
- [ ] Guardar cambios
- [ ] **Verificar en Firestore:** Debe actualizarse el documento
- [ ] Recargar la página
- [ ] **Verificar:** Los cambios deben persistir

---

### 4. Sincronización

#### Test 4.1: Persistencia de Sesión
- [ ] Loguearse con un usuario
- [ ] Cerrar el navegador completamente
- [ ] Abrir de nuevo `https://www.tribuimpulsa.cl`
- [ ] **Verificar:** Debe seguir logueado
- [ ] **Ver consola:** Debe mostrar "Usuario cargado desde Firebase"

---

### 5. Auto-formateo de Campos

#### Test 5.1: Instagram (@)
- [ ] Registrar nuevo usuario
- [ ] En campo Instagram, ingresar: `miinstagram` (sin @)
- [ ] Salir del campo (blur)
- [ ] **Verificar:** Debe auto-agregar `@miinstagram`

#### Test 5.2: Teléfono (+569)
- [ ] En campo teléfono, ingresar: `12345678` (sin +569)
- [ ] Salir del campo
- [ ] **Verificar:** Debe auto-agregar `+56912345678`

#### Test 5.3: Website (https://)
- [ ] En campo website, ingresar: `miempresa.cl` (sin https://)
- [ ] Salir del campo
- [ ] **Verificar:** Debe auto-agregar `https://miempresa.cl`

---

### 6. Emails Duplicados

#### Test 6.1: Registro con Email Existente
- [ ] Intentar registrar con email ya usado: `test-nacional@tribuimpulsa.cl`
- [ ] **Verificar:** Debe mostrar error inmediato
- [ ] **Verificar:** NO debe crear cuenta duplicada en Firebase

---

## 🐛 Logging y Debug

### Abrir Consola del Navegador (F12)

Durante las pruebas, busca estos logs:

#### Registro Exitoso:
```
🔐 [REGISTER] Paso 1/3: Creando en Firebase Authentication...
✅ [REGISTER] Creado en Authentication: [UID]
📦 [REGISTER] Paso 2/3: Guardando en Firestore...
✅ [REGISTER] Guardado en Firestore: [email]
📊 [REGISTER] Paso 3/3: Actualizando contador...
💾 [REGISTER] Paso 4/4: Guardando en localStorage...
✅ ✅ ✅ REGISTRO COMPLETO: [email]
```

#### Login Exitoso:
```
🔐 [LOGIN] Iniciando login para: [email]
🔍 [FIREBASE-SEARCH] Buscando usuario: [email]
✅ [FIREBASE-SEARCH] Usuario encontrado: [email]
🔐 [VALIDATE] Validando credenciales para: [email]
✅ [VALIDATE] Autenticación exitosa: [UID]
✅ [LOGIN] Login exitoso: [email]
```

---

## ❌ Reportar Problemas

Si encuentras errores, reporta:

1. **Paso exacto donde falla**
2. **Mensaje de error** (screenshot de la consola)
3. **Estado de Firebase:**
   - Número de usuarios en Authentication
   - Número de documentos en Firestore /users
   - Valor del contador Rally

---

## 🎯 Checklist Final

- [ ] Todos los test de registro pasaron
- [ ] Todos los test de login pasaron
- [ ] Edición de perfil funciona
- [ ] Persistencia de sesión funciona
- [ ] Auto-formateo funciona
- [ ] NO hay emails duplicados
- [ ] Firestore y Authentication están sincronizados
- [ ] Contador Rally funciona correctamente

---

## ✅ Si Todo Funciona

**¡Felicitaciones! La app está lista para v1.0.0**

Próximos pasos:
1. Pruebas con usuarios reales (beta testing)
2. Optimizaciones de performance
3. Release v1.0.0

