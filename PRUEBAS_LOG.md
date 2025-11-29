# 📋 LOG DE PRUEBAS - TRIBU IMPULSA

## 🗓️ Sesión: 29-Nov-2025 11:02 AM

### Configuración del Ambiente
- **Servidor**: localhost:3003
- **Firebase**: Firestore + Auth habilitados
- **Vercel**: Variables Azure configuradas

---

## 🧪 PRUEBA #1: Login con usuario existente

**Objetivo**: Verificar que un usuario real puede hacer login

**Pasos**:
1. Abrir app
2. Ingresar: `dafnafinkelstein@gmail.com` / `TRIBU2026`
3. Verificar redirección a Dashboard

**Resultado esperado**: Login exitoso → Dashboard

**Resultado real**: _PENDIENTE_

---

## 🧪 PRUEBA #2: Login con usuario inexistente

**Objetivo**: Verificar que muestra error y NO deja pasar

**Pasos**:
1. Ingresar: `noexiste@test.com` / `123456`
2. Verificar mensaje de error

**Resultado esperado**: "Usuario no encontrado. ¿Quieres registrarte?"

**Resultado real**: _PENDIENTE_

---

## 🧪 PRUEBA #3: Login con contraseña incorrecta

**Objetivo**: Verificar mensaje de contraseña incorrecta

**Pasos**:
1. Ingresar: `dafnafinkelstein@gmail.com` / `wrongpass`
2. Verificar mensaje de error

**Resultado esperado**: "Contraseña incorrecta. Usa: TRIBU2026"

**Resultado real**: _PENDIENTE_

---

## 🧪 PRUEBA #4: Navegación Survey → Home

**Objetivo**: Verificar que el botón atrás lleva al Home

**Pasos**:
1. Click "Regístrate"
2. Avanzar hasta Survey
3. Click "Volver al Inicio"
4. Verificar que llega al Login

**Resultado esperado**: Vuelve al Login (no loop)

**Resultado real**: _PENDIENTE_

---

## 🧪 PRUEBA #5: Logo visible

**Objetivo**: Verificar que el logo aparece correctamente

**Ubicaciones a verificar**:
- [ ] Login
- [ ] Registro paso 1
- [ ] Survey/Inscripción

**Resultado real**: _PENDIENTE_

---

## 🧪 PRUEBA #6: Firestore - Creación automática de usuarios

**Objetivo**: Verificar que los 23 usuarios se crean en Firestore

**Pasos**:
1. Abrir consola del navegador
2. Verificar logs de inicialización
3. Ir a Firebase Console → Firestore → users

**Resultado esperado**: 23 documentos en colección `users`

**Resultado real**: _PENDIENTE_

---

## 🧪 PRUEBA #7: Dashboard funcional

**Objetivo**: Verificar que el dashboard carga correctamente

**Pasos**:
1. Login con usuario válido
2. Verificar que carga el dashboard
3. Verificar stats y gráficos

**Resultado real**: _PENDIENTE_

---

## 🧪 PRUEBA #8: Tribu 10+10

**Objetivo**: Verificar asignaciones tribales

**Pasos**:
1. Ir a "Mi Tribu"
2. Verificar lista de 10+10
3. Marcar un checkbox

**Resultado real**: _PENDIENTE_

---

## 📊 RESUMEN DE RESULTADOS

| Prueba | Estado | Notas |
|--------|--------|-------|
| #1 Login existente | ⏳ | |
| #2 Login inexistente | ⏳ | |
| #3 Contraseña incorrecta | ⏳ | |
| #4 Navegación | ⏳ | |
| #5 Logo | ⏳ | |
| #6 Firestore init | ⏳ | |
| #7 Dashboard | ⏳ | |
| #8 Tribu 10+10 | ⏳ | |

---

## 🐛 ERRORES ENCONTRADOS

_Ninguno por ahora_

---

## 💡 MEJORAS SUGERIDAS

_Ninguna por ahora_

---

*Log actualizado: 29-Nov-2025 11:02 AM*
