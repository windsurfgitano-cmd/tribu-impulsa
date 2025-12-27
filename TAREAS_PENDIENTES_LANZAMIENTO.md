# Tareas Pendientes para Lanzamiento - Reunión 26/12

## ✅ COMPLETADAS

1. ✅ Ocultar contador Rally hasta 500 usuarios
2. ✅ Cambiar texto "RALLY 1000 - Últimos cupos" → "1000 cupos de regalo"
3. ✅ Cambiar "Rally Activo" → "Ya es momento de colaborar"
4. ✅ Eliminar "100% Garantizado" de beneficios
5. ✅ Ampliar rangos de ingresos hasta 100M
6. ✅ Simplificar selección de planes (solo mensual)
7. ✅ Agregar "¿Cómo funciona?" en landing page (botón expandible)

---

## ⏳ PENDIENTES (Requieren Acción Manual o Configuración Externa)

### 1. BUG DE GUARDAR PERFIL EN iPad (Prioridad Alta)

**Reportado por**: Doraluz
**Síntomas**: "Error al guardar, inténtalo más tarde" - No puede cambiar foto de perfil ni banner

**Diagnóstico posible**:
- El código de subida de imágenes (`services/supabaseStorage.ts`) parece correcto
- Usa `auth.uid()` para la ruta de archivos (líneas 76-77, 137-138)
- Usa compresión de imágenes estándar (canvas.toBlob)

**Posibles causas**:
1. **RLS Policies**: Verificar que las políticas de Supabase Storage permitan UPDATE en avatars/covers
2. **Safari/iOS Canvas**: `canvas.toBlob()` podría no estar disponible en versiones antiguas de Safari
3. **Error no capturado**: Agregar mejor logging en el catch de `handleSave` y `handlePhotoUpload`

**Acción sugerida**:
- Revisar logs de consola en iPad para ver el error exacto
- Verificar RLS policies en Supabase Dashboard → Storage → avatars/covers
- Probar con otro dispositivo iOS para confirmar si es problema específico del iPad

---

### 2. CONFIGURAR SMTP PERSONALIZADO EN SUPABASE (Prioridad Alta)

**Problema**: Correos de recuperación llegan con remitente "Supabase" - parece phishing

**Pasos para configurar**:

1. **En Supabase Dashboard**:
   - Ir a **Authentication** → **Email Templates**
   - Editar templates: "Confirm Signup", "Magic Link", "Reset Password", "Change Email"
   - Cambiar remitente de "Supabase" a `contacto@tribuimpulsa.cl`

2. **Configurar SMTP (Google Workspace)**:
   - Ir a **Settings** → **SMTP Settings**
   - Habilitar "Custom SMTP"
   - Configurar:
     - **Host**: `smtp.gmail.com`
     - **Port**: `587` (TLS) o `465` (SSL)
     - **User**: `contacto@tribuimpulsa.cl` (o el email de Google Workspace)
     - **Password**: Contraseña de aplicación de Google (no la contraseña normal)
     - **Sender Name**: `Tribu Impulsa`
     - **Sender Email**: `contacto@tribuimpulsa.cl`

3. **Crear contraseña de aplicación en Google**:
   - Ir a https://myaccount.google.com/apppasswords
   - Seleccionar "Mail" y "Otro (nombre personalizado)"
   - Usar esa contraseña en Supabase SMTP

4. **Actualizar Site URL en Supabase**:
   - Settings → URL Configuration
   - Site URL: `https://www.tribuimpulsa.cl` (o el dominio de producción)
   - Redirect URLs: Agregar `https://www.tribuimpulsa.cl/**`

**Requiere**: Credenciales de Google Workspace

---

### 3. VERIFICAR INTEGRACIÓN MERCADOPAGO (Prioridad Alta)

**Estado actual**: Código existe en `api/create-subscription.ts` y `api/mercadopago-webhook.ts`

**Verificaciones necesarias**:

1. **Variables de entorno en Vercel**:
   - `MP_ACCESS_TOKEN`: Token de acceso de MercadoPago
   - Verificar que esté configurado en Vercel Dashboard → Settings → Environment Variables

2. **Conectar botón de activación**:
   - El botón "Activar mes gratis" en `MembershipScreen.tsx` debe llamar al endpoint `/api/create-subscription`
   - Verificar que el flujo funcione: Trial → Cobro automático al finalizar

3. **Configurar pagos recurrentes**:
   - En MercadoPago Dashboard, verificar que las suscripciones estén habilitadas
   - Configurar webhook URL: `https://www.tribuimpulsa.cl/api/mercadopago-webhook`

4. **Tipos de pago permitidos**:
   - Según la reunión: Débito, Crédito, y Prepago
   - MercadoPago por defecto acepta todos estos métodos
   - Verificar que el checkout permita guardar tarjeta para pagos recurrentes

**Requiere**: 
- Token de acceso de MercadoPago (contactar a Micaela o Gabi según reunión)
- Configuración en Vercel

---

### 4. AGREGAR ACCESO PERMANENTE A "¿CÓMO FUNCIONA?" EN MENÚ (Prioridad Media)

**Estado**: Ya agregado en landing page, falta en menú hamburguesa

**Ubicación**: `components/layout/AppLayout.tsx` - Agregar botón en el menú dropdown

**Acción**: Agregar botón después de "Club de Bienestar" que muestre el mismo contenido expandible o navegue a una página dedicada.

---

### 5. SANTANDER OPEN ACADEMY (Prioridad Media)

**Estado**: Código existe en `components/academia/AcademiaDashboard.tsx`

**Pendiente**: 
- Verificar que esté accesible desde el menú principal
- Actualmente está deshabilitado en el menú (línea 197-211 de AppLayout.tsx)
- Según reunión: "Es la guinda de la torta" - debe estar activo

---

### 6. AGREGAR SECCIONES EN LANDING (Prioridad Baja)

Según reunión, faltan:
- **Legales**: Cargar PDF de términos y condiciones (convertir Word a PDF)
- **FAQ**: Texto con preguntas frecuentes enviado por Guillermo
- **Video Explicativo**: Usar video de Óscar (cortar antes de parte de Santander)

Estos pueden agregarse como botones en la landing page que abren modales o navegan a páginas dedicadas.

---

## NOTAS IMPORTANTES

- **CODE FREEZE**: No cambiar colores, botones, tamaños. Solo reubicar y corregir bugs.
- **Próxima revisión**: Sábado a las 12:00
- **Principio KISS**: No romper nada, solo corregir lo esencial

