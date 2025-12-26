# 🚀 INSTRUCCIONES PARA APLICAR CAMBIOS - Eliminar Firebase

## ✅ ARCHIVOS CREADOS

He creado los siguientes archivos con el código actualizado:

1. **`services/supabaseStorage.ts`** - ✅ YA CREADO (nuevo archivo)
2. **`CODIGO_NUEVO_MYPROFILEVIEW.txt`** - Código para reemplazar función `handleSave`
3. **`CODIGO_NUEVO_UPLOAD_IMAGENES.txt`** - Código para reemplazar funciones de upload
4. **`CODIGO_NUEVO_IMPORTS.txt`** - Código para actualizar imports
5. **`CODIGO_NUEVO_SINCRONIZAR.txt`** - Código para reemplazar botón de sincronizar

---

## 📝 CÓMO APLICAR LOS CAMBIOS

### Archivo: `screens/profile/MyProfileView.tsx`

Este archivo necesita **4 cambios**:

#### CAMBIO 1: Actualizar imports (línea 35)
1. Abre `CODIGO_NUEVO_IMPORTS.txt`
2. Busca la línea que dice:
   ```typescript
   import { syncProfileToCloud, getNotificationStatus, requestNotificationPermission, clearFCMToken } from '../../services/firebaseService';
   ```
3. Reemplázala con el código del archivo

#### CAMBIO 2: Actualizar funciones de upload (líneas 175-263)
1. Abre `CODIGO_NUEVO_UPLOAD_IMAGENES.txt`
2. Busca la función `handlePhotoUpload` (línea 176)
3. Selecciona desde `const handlePhotoUpload` hasta el final de `handleBannerUpload` (línea 263)
4. Reemplaza con el código del archivo

#### CAMBIO 3: Actualizar función handleSave (líneas 352-404)
1. Abre `CODIGO_NUEVO_MYPROFILEVIEW.txt`
2. Busca la línea que dice:
   ```typescript
   // Guardar cambios localmente
   const updated = updateUser(currentUser.id, profileData);
   ```
3. Selecciona desde esa línea hasta `setIsEditing(false);` (línea 403)
4. Reemplaza con el código del archivo

#### CAMBIO 4: Actualizar botón de sincronizar (líneas 440-499)
1. Abre `CODIGO_NUEVO_SINCRONIZAR.txt`
2. Busca el botón con `onClick={async () => {` y `setSaveMessage('Sincronizando con la nube...');`
3. Selecciona desde `<button` hasta `className="hidden"` (línea 499)
4. Reemplaza con el código del archivo

---

## ✅ VERIFICACIÓN

Después de aplicar los cambios, verifica que:

1. ✅ No hay errores de TypeScript en el editor
2. ✅ El archivo `services/supabaseStorage.ts` existe
3. ✅ Los imports ya no incluyen `syncProfileToCloud` ni `syncUserToFirebase`
4. ✅ Las funciones de upload usan `uploadAvatarToSupabase` y `uploadCoverToSupabase`
5. ✅ La función `handleSave` usa `supabase.from('users').update()`
6. ✅ El botón de sincronizar usa `supabase.from('users').update()`

---

## 🚀 SIGUIENTE PASO

Una vez aplicados los cambios:

1. **Hacer commit**:
   ```bash
   git add .
   git commit -m "Migración completa a Supabase - Eliminar Firebase"
   git push
   ```

2. **Vercel hará deploy automáticamente**

3. **Probar**:
   - Subir foto de perfil
   - Subir banner
   - Editar perfil
   - Verificar que todo se guarda en Supabase

---

## 📊 RESUMEN DE CAMBIOS

| Antes | Después |
|-------|---------|
| Firebase Storage | Supabase Storage |
| Firebase Firestore | Supabase PostgreSQL |
| `syncUserToFirebase()` | `supabase.from('users').update()` |
| `uploadProfileImage()` | `uploadAvatarToSupabase()` |
| Logs: "Firebase" | Logs: "Supabase" |

---

**Tiempo estimado**: 10-15 minutos

