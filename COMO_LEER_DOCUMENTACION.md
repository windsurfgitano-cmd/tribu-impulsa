# 📚 Cómo Leer la Documentación de Tribu Impulsa

## 🎯 Para Ti (Fundadora/CEO/PM)

### Día 1: Vista General (30 minutos)

**1. Empieza aquí:**
- [**RESUMEN_REORGANIZACION.md**](./RESUMEN_REORGANIZACION.md) ← Resumen de TODO lo hecho

**¿Qué vas a aprender?**
- ✅ Qué documentos se crearon (11 documentos, 320 páginas)
- ✅ Qué archivos sensibles se movieron
- ✅ Qué pasos quedan pendientes
- ✅ Checklist de acción urgente

**Tiempo:** 10 minutos de lectura

---

**2. Índice Maestro:**
- [**INDICE_DOCUMENTACION.md**](./INDICE_DOCUMENTACION.md) ← Mapa de toda la documentación

**¿Qué vas a aprender?**
- ✅ Dónde está cada documento
- ✅ Qué contiene cada uno
- ✅ Para quién es cada documento
- ✅ Cómo buscar información específica

**Tiempo:** 15 minutos de lectura

---

**3. Vista Visual:**
- [**ARQUITECTURA_VISUAL.md**](./ARQUITECTURA_VISUAL.md) ← 15 diagramas del sistema

**¿Qué vas a ver?**
- ✅ Diagrama de arquitectura de alto nivel
- ✅ Flujo de usuario completo (journey)
- ✅ Cómo se conectan las páginas
- ✅ Dónde están los datos (Firebase, localStorage)

**Tiempo:** 5 minutos (solo mira los diagramas)

---

### Día 2-3: Entender la App (1-2 horas)

**4. Arquitectura Completa:**
- [**ARQUITECTURA_PWA.md**](./ARQUITECTURA_PWA.md) ← Documentación técnica completa

**Lee en este orden:**

**Parte 1: Las Páginas (30 min)**
```
Sección "Páginas y Funcionalidades"
- Login Screen
- Dashboard
- Mi Perfil
- Directorio
- Mi Tribu
- Club Bienestar
```

**¿Qué vas a aprender?**
- ✅ Qué hace cada página
- ✅ Qué hace cada botón
- ✅ Cómo navegar entre páginas
- ✅ Qué información ve el usuario

**Parte 2: Los Datos (30 min)**
```
Sección "Sistema de Datos y Sincronización"
- Cómo se guardan los usuarios
- Dónde está Firebase
- Qué es localStorage
- Cómo se sincronizan
```

**¿Qué vas a aprender?**
- ✅ Dónde se guardan los perfiles de usuarios
- ✅ Cómo funciona el Rally 1000
- ✅ Qué pasa si se cae Firebase
- ✅ Cómo se sincronizan los datos

**Parte 3: Seguridad (30 min)**
```
Sección "Sistema de Permisos"
- Quién puede ver qué
- Cómo funciona la membresía
- Qué se desbloquea con el Rally
```

---

### Semana 1: Cómo Hacer Cambios

**5. Si quieres modificar algo:**
- [**GUIA_DESPLIEGUE.md**](./GUIA_DESPLIEGUE.md) ← Cómo deployar cambios

**Lee solo estas secciones:**

**Para subir cambios:**
```
Sección 4: "Despliegue en Vercel"
- Cómo hacer push a GitHub
- Cómo se actualiza la web automáticamente
- Cómo ver si funcionó
```

**Si algo falla:**
```
Sección 11: "Troubleshooting Común"
- Errores frecuentes y soluciones
```

---

## 👩‍💻 Para Desarrolladores

### Onboarding (Primera Semana)

**Día 1: Setup**

1. **Leer:**
   - `README.md` (visión general)
   - `INDICE_DOCUMENTACION.md` (mapa completo)

2. **Configurar entorno:**
   - Clonar repo
   - Copiar `env.example` → `.env`
   - Llenar credenciales (pedir al team lead)
   - `npm install`
   - `npm run dev`

**Día 2-3: Arquitectura**

1. **Leer `ARQUITECTURA_PWA.md`:**
   - Secciones 1-5: Páginas principales
   - Sección 6: Flujo de datos
   - Sección 7: Componentes

2. **Revisar `ARQUITECTURA_VISUAL.md`:**
   - Diagrama 1: Arquitectura de alto nivel
   - Diagrama 3: Flujo de datos completo
   - Diagrama 4: Diagrama de componentes
   - Diagrama 5: Modelo de datos Firestore

**Día 4-5: Código**

1. **Explorar código fuente:**
   ```
   src/
   ├── App.tsx              ← Entry point
   ├── screens/             ← Pantallas principales
   │   ├── auth/            ← Login, Registro
   │   ├── dashboard/       ← Dashboard
   │   └── profile/         ← Perfiles
   ├── services/            ← Lógica de negocio
   │   ├── firebaseService.ts
   │   ├── databaseService.ts
   │   └── realUsersData.ts
   └── components/          ← Componentes reutilizables
   ```

2. **Hacer un pequeño cambio:**
   - Cambiar un texto en `Dashboard.tsx`
   - Ver cómo se refleja en local
   - Leer `CHANGELOG.md` para entender el formato de commits

---

## 🚀 Para DevOps

### Setup Inicial (2 horas)

**1. Seguridad:**
- [**GUIA_REORGANIZACION_SEGURIDAD.md**](./GUIA_REORGANIZACION_SEGURIDAD.md)
- Verificar que `INTERNO/` NO está en Git
- Verificar `.gitignore` actualizado
- Ejecutar `bash verificar-seguridad.sh` antes de cada push

**2. Deployment:**
- [**GUIA_DESPLIEGUE.md**](./GUIA_DESPLIEGUE.md)
- Leer secciones 4-6 (Vercel, Firebase, Dominios)
- Configurar variables de entorno en Vercel
- Verificar webhooks de GitHub

**3. Monitoreo:**
- Configurar alertas en Firebase
- Configurar alertas en Vercel
- Setup de Sentry (opcional)

---

## 🔍 Buscar Información Específica

### "¿Cómo funciona el login?"

1. **Buscar en documentación:**
   ```powershell
   # Desde PowerShell
   Select-String -Path *.md -Pattern "login" -CaseSensitive:$false
   ```

2. **O abrir directamente:**
   - `ARQUITECTURA_PWA.md` → Sección "1️⃣ Login Screen"
   - `ARQUITECTURA_VISUAL.md` → Diagrama 6 (Flujo de autenticación)

### "¿Dónde se guardan los usuarios?"

1. **Respuesta rápida:**
   - `ARQUITECTURA_PWA.md` → Sección "Sistema de Datos"

2. **Respuesta técnica:**
   - Código: `services/realUsersData.ts`
   - Firebase: Colección `users`
   - Local: `localStorage.tribu_users`

### "¿Cómo agregar una nueva feature?"

1. **Leer:**
   - `CHANGELOG.md` → Ver cómo se documentan features
   - `ARQUITECTURA_PWA.md` → Entender dónde encaja

2. **Proceso:**
   ```
   1. Crear branch: git checkout -b feature/nombre
   2. Implementar código
   3. Actualizar CHANGELOG.md
   4. Actualizar ARQUITECTURA_PWA.md (si es grande)
   5. Hacer PR
   6. Deploy a staging
   7. Testing
   8. Merge a main
   ```

---

## 📊 Diagramas Útiles

### Diagrama 1: Arquitectura General

**Ver en:** `ARQUITECTURA_VISUAL.md` → Sección 1

**Qué muestra:**
- Frontend (React)
- Backend (Firebase)
- Servicios externos (Stripe, Azure)

**Úsalo para:**
- Explicar la app a inversores
- Onboarding de nuevos devs
- Planificar nuevas integraciones

---

### Diagrama 7: Journey del Usuario

**Ver en:** `ARQUITECTURA_VISUAL.md` → Sección 7

**Qué muestra:**
- Todo el viaje del usuario desde descubrir la app hasta ser miembro

**Úsalo para:**
- Entender la experiencia completa
- Identificar puntos de fricción
- Mejorar conversión

---

### Diagrama 9: Algoritmo de Matching

**Ver en:** `ARQUITECTURA_VISUAL.md` → Sección 9

**Qué muestra:**
- Cómo se calculan los matches entre usuarios
- Qué factores importan (categoría, afinidad, geo, revenue)

**Úsalo para:**
- Explicar cómo funciona el matching
- Ajustar pesos de los factores
- Debuggear matches raros

---

## 🎓 Glosario de Términos

### Términos Técnicos

**PWA (Progressive Web App)**
- App web que funciona como app nativa
- Se puede instalar en el celular
- Funciona offline

**Firebase**
- Backend de Google
- Guarda usuarios, notificaciones, etc.
- Actualización en tiempo real

**localStorage**
- Almacenamiento local del navegador
- Datos persisten aunque cierres la app
- Cache para funcionar offline

**Firestore**
- Base de datos de Firebase
- NoSQL (documentos JSON)
- Colecciones: `users`, `notifications`, `tribe_assignments`

### Términos de Negocio

**Rally 1000**
- Meta de 1000 perfiles completos
- Desbloquea "Mi Tribu" para todos
- Contador visible en toda la app

**Mi Tribu**
- 8 emprendedores asignados mensualmente
- Sistema de tareas para impulsar mutuamente
- Se rota el 1° de cada mes

**Matching**
- Algoritmo de compatibilidad entre usuarios
- Score de 0-100%
- Basado en: categoría, afinidad, ubicación, facturación

**Club Bienestar**
- Beneficios exclusivos para miembros
- Descuentos, talleres, networking
- Solo con membresía activa

---

## 🆘 Problemas Comunes

### "No entiendo este diagrama"

**Solución:**
1. Ir a `ARQUITECTURA_PWA.md`
2. Buscar la sección correspondiente (texto explicativo)
3. Leer el código fuente mencionado

### "Quiero modificar X pero no sé dónde está"

**Solución:**
1. Buscar en `INDICE_DOCUMENTACION.md` → "Por Tema"
2. O usar grep:
   ```powershell
   Select-String -Path src\**\*.tsx -Pattern "texto que buscas"
   ```

### "La documentación está desactualizada"

**Solución:**
1. Hacer los cambios en el código
2. Actualizar documentación correspondiente:
   - `CHANGELOG.md` (siempre)
   - `ARQUITECTURA_PWA.md` (si es feature grande)
   - `ARQUITECTURA_VISUAL.md` (si cambia flujo)
3. Hacer PR con código + docs juntos

---

## 📞 Contactos

**Dudas técnicas:**
- Slack: #dev-team
- Email: dev@tribuimpulsa.cl

**Dudas de producto:**
- Dafna Finkelstein (Product Owner)
- Doraluz (CEO)

**Emergencias:**
- WhatsApp grupo "Tribu Dev"

---

## ✅ Checklist de Comprensión

### Después de leer esta guía, deberías poder responder:

```
[ ] ¿Qué documentos hay y para qué sirve cada uno?
[ ] ¿Dónde busco cómo funciona una página específica?
[ ] ¿Dónde se guardan los datos de usuarios?
[ ] ¿Cómo hago deploy de cambios?
[ ] ¿Qué hacer si algo falla?
[ ] ¿Cómo contribuir con nueva documentación?
```

Si no puedes responder alguna, vuelve a leer las secciones relevantes.

---

## 🎯 Próximos Pasos

**Después de leer esta guía:**

1. **Si eres PM/CEO:**
   - Lee `RESUMEN_REORGANIZACION.md`
   - Revisa `ARQUITECTURA_VISUAL.md` (diagramas)
   - Bookmarkea `INDICE_DOCUMENTACION.md`

2. **Si eres Developer:**
   - Completa onboarding de 5 días
   - Haz tu primer commit (cambio pequeño)
   - Lee `CHANGELOG.md` para entender formato

3. **Si eres DevOps:**
   - Lee `GUIA_DESPLIEGUE.md` completa
   - Configura alertas
   - Verifica que `verificar-seguridad.sh` funciona

---

**Documento creado:** 25 Diciembre 2024  
**Versión:** v0.9.1  
**Última actualización:** Hoy  
**Siguiente revisión:** Enero 2025

