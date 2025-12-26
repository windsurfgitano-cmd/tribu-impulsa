# 🔥 ELIMINAR FIREBASE COMPLETAMENTE - Migración 100% a Supabase

## ⚠️ PROBLEMA ACTUAL

Tu app está usando **AMBOS** Firebase y Supabase, lo que causa:
- ❌ Duplicación de datos
- ❌ Confusión en los logs
- ❌ Costos innecesarios
- ❌ Complejidad extra
- ❌ Errores como `saveUserFCMToken is not defined`

---

## ✅ SOLUCIÓN: Todo a Supabase

### 📊 Comparación de Storage:

| Servicio | Gratis | Costo después |
|----------|--------|---------------|
| **Supabase** | 1GB | $0.021/GB/mes |
| **Firebase** | 5GB | $0.026/GB/mes |

**Recomendación**: Usar **Supabase Storage**
- 1GB = ~5,000-10,000 fotos de perfil comprimidas
- Todo en un solo lugar
- Más simple de mantener

---

## 🛠️ CAMBIOS A REALIZAR

### 1. Actualizar `screens/profile/MyProfileView.tsx`

**Buscar (línea 352-403):**
```typescript
// Guardar cambios localmente
const updated = updateUser(currentUser.id, profileData);

if (updated) {
  // Sincronizar con Firebase - OBLIGATORIO, con reintentos
  let firebaseSaved = false;
  let retries = 3;

  while (!firebaseSaved && retries > 0) {
    try {
      const { syncProfileToCloud, logInteraction, syncUserToFirebase } = await import('../../services/firebaseService');

      setSaveMessage(`☁️ Guardando en la nube... (intento ${4 - retries}/3)`);

      // Sincronizar a la colección users (PRINCIPAL)
      await syncUserToFirebase(currentUser.id, profileData);

      // Sincronizar perfil completo
      await syncProfileToCloud({
        id: currentUser.id,
        ...profileData,
        subCategory: profile.subCategory,
      });

      // Registrar la interacción
      await logInteraction(currentUser.id, 'profile_updated', {
        fields: Object.keys(profileData),
        timestamp: new Date().toISOString()
      });

      firebaseSaved = true;
      setSaveMessage('✅ Perfil guardado y sincronizado');
    } catch (error) {
      retries--;
      console.error(`❌ Error guardando en Firebase (quedan ${retries} intentos):`, error);
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 1000)); // Esperar 1s antes de reintentar
      }
    }
  }

  if (!firebaseSaved) {
    // Si después de 3 intentos no se guardó, mostrar advertencia CLARA
    setSaveMessage('⚠️ Guardado local. Presiona Sincronizar para subir a la nube.');
  }
} else {
  setSaveMessage('❌ Error al guardar');
}

setTimeout(() => setSaveMessage(null), 3000);
setIsSaving(false);
setIsEditing(false);
```

**Reemplazar con:**
```typescript
// SUPABASE COMO FUENTE DE VERDAD: Guardar primero en Supabase, luego en localStorage
let supabaseSaved = false;
let retries = 3;

while (!supabaseSaved && retries > 0) {
  try {
    const { supabase } = await import('../../services/supabaseService');

    setSaveMessage(`☁️ Guardando en Supabase... (intento ${4 - retries}/3)`);

    // 1. Guardar en Supabase (FUENTE DE VERDAD)
    const { error } = await supabase
      .from('users')
      .update({
        name: profileData.name,
        company_name: profileData.companyName,
        bio: profileData.bio,
        business_description: profileData.businessDescription,
        phone: profileData.phone,
        whatsapp: profileData.whatsapp,
        instagram: profileData.instagram,
        tiktok: profileData.tiktok,
        facebook: profileData.facebook,
        twitter: profileData.twitter,
        website: profileData.website,
        city: profileData.city,
        location: profileData.location,
        avatar_url: profileData.avatarUrl,
        cover_url: profileData.coverUrl,
        category: profileData.category,
        affinity: profileData.affinity,
        scope: profileData.scope,
        comuna: profileData.comuna,
        selected_regions: profileData.selectedRegions,
        revenue: profileData.revenue,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentUser.id);

    if (error) throw error;

    // 2. Sincronizar a localStorage (CACHÉ)
    const updated = updateUser(currentUser.id, profileData);
    
    if (!updated) {
      console.warn('⚠️ No se pudo actualizar localStorage, pero Supabase se guardó correctamente');
    }

    supabaseSaved = true;
    setSaveMessage('✅ Perfil guardado en Supabase');
    console.log('✅ Perfil actualizado en Supabase');
  } catch (error) {
    retries--;
    console.error(`❌ Error guardando en Supabase (quedan ${retries} intentos):`, error);
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

if (!supabaseSaved) {
  setSaveMessage('❌ Error al guardar. Por favor intenta de nuevo.');
  setIsSaving(false);
  return;
}

setTimeout(() => setSaveMessage(null), 3000);
setIsSaving(false);
setIsEditing(false);
```

---

### 2. Cambiar Upload de Imágenes a Supabase Storage

**Archivo**: `services/firebaseService.ts` (o donde esté la función de upload)

**Buscar**: `uploadAvatarImage`, `uploadCoverImage`

**Reemplazar con**:
```typescript
import { supabase } from './supabaseService';

export const uploadAvatarImage = async (userId: string, file: File): Promise<string> => {
  try {
    console.log('📤 Subiendo avatar a Supabase Storage...');
    
    // Comprimir imagen
    const compressedFile = await compressImage(file, 500, 500);
    
    // Generar nombre único
    const fileName = `${userId}_${Date.now()}.jpg`;
    const filePath = `avatars/${fileName}`;
    
    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, compressedFile, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) throw error;
    
    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    console.log('✅ Avatar subido a Supabase:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ Error subiendo avatar:', error);
    throw error;
  }
};

export const uploadCoverImage = async (userId: string, file: File): Promise<string> => {
  try {
    console.log('📤 Subiendo cover a Supabase Storage...');
    
    // Comprimir imagen
    const compressedFile = await compressImage(file, 1200, 400);
    
    // Generar nombre único
    const fileName = `${userId}_${Date.now()}.jpg`;
    const filePath = `covers/${fileName}`;
    
    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('covers')
      .upload(filePath, compressedFile, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) throw error;
    
    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('covers')
      .getPublicUrl(filePath);
    
    console.log('✅ Cover subido a Supabase:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ Error subiendo cover:', error);
    throw error;
  }
};
```

---

### 3. Crear Buckets en Supabase

1. Ve a: https://supabase.com/dashboard/project/ctazrxccukedwifhwaei/storage/buckets
2. Click en "New bucket"
3. Crear 2 buckets:
   - **Nombre**: `avatars`
     - **Public**: ✅ Sí
     - **File size limit**: 5MB
     - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
   
   - **Nombre**: `covers`
     - **Public**: ✅ Sí
     - **File size limit**: 10MB
     - **Allowed MIME types**: `image/jpeg, image/png, image/webp`

---

### 4. Configurar RLS para Storage

En Supabase SQL Editor, ejecuta:

```sql
-- RLS para bucket avatars
CREATE POLICY "Usuarios pueden subir sus propios avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Avatars son públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Usuarios pueden actualizar sus propios avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS para bucket covers
CREATE POLICY "Usuarios pueden subir sus propios covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'covers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Covers son públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'covers');

CREATE POLICY "Usuarios pueden actualizar sus propios covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'covers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

### 5. Arreglar Contador de Usuarios

**Archivo**: `screens/auth/LoginScreen.tsx`

El contador debe leer desde `system_stats` en Supabase (ya lo hace con Realtime).

**Verificar** que la suscripción esté activa (líneas 62-90):
```typescript
useEffect(() => {
  const { supabase } = await import('../../services/supabaseService');
  
  const subscription = supabase
    .channel('system_stats_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'system_stats'
    }, (payload) => {
      console.log('📊 Cambio en system_stats:', payload);
      if (payload.new) {
        setStats({
          members: payload.new.members_active || 0,
          profiles: payload.new.profiles_completed || 0
        });
      }
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

### 6. Eliminar o Migrar Notificaciones

**Opción A: Desactivar temporalmente**

En `screens/profile/MyProfileView.tsx`, comentar o eliminar:
```typescript
// const [notificationStatus, setNotificationStatus] = useState<any>(null);
// useEffect(() => {
//   const loadNotificationStatus = async () => {
//     const status = await getNotificationStatus();
//     setNotificationStatus(status);
//   };
//   loadNotificationStatus();
// }, []);
```

**Opción B: Migrar a Supabase Realtime**

Usar Supabase Realtime para notificaciones en tiempo real (sin necesidad de FCM).

---

### 7. Actualizar `services/databaseService.ts`

**Eliminar** la función `syncUserToFirebase` o reemplazarla con:

```typescript
export const syncUserToSupabase = async (user: Partial<UserProfile>): Promise<void> => {
  console.log('📤 [SYNC] Iniciando sincronización para:', user.email);
  
  try {
    const { supabase } = await import('./supabaseService');
    
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.name,
        company_name: user.companyName,
        bio: user.bio,
        business_description: user.businessDescription,
        phone: user.phone,
        whatsapp: user.whatsapp,
        instagram: user.instagram,
        category: user.category,
        affinity: user.affinity,
        scope: user.scope,
        comuna: user.comuna,
        selected_regions: user.selectedRegions,
        revenue: user.revenue,
        avatar_url: user.avatarUrl,
        cover_url: user.coverUrl,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    console.log('✅ [SYNC] ¡ÉXITO! Usuario guardado en Supabase:', user.email);
  } catch (error: any) {
    console.error('❌ [SYNC] Error:', error.message);
    throw error;
  }
};
```

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

1. ✅ Crear buckets en Supabase Storage
2. ✅ Configurar RLS para Storage
3. ✅ Actualizar función de upload de imágenes
4. ✅ Reemplazar sincronización en `MyProfileView.tsx`
5. ✅ Actualizar `syncUserToSupabase` en `databaseService.ts`
6. ✅ Desactivar notificaciones FCM (temporal)
7. ✅ Verificar contador en tiempo real
8. ✅ Hacer deploy a Vercel
9. ✅ Probar todo el flujo

---

## ✅ RESULTADO FINAL

Después de estos cambios:
- ✅ **100% Supabase** (Auth, DB, Storage, Realtime)
- ✅ **Sin Firebase** (eliminado completamente)
- ✅ **Logs claros** (solo "Supabase")
- ✅ **Arquitectura simple** (un solo backend)
- ✅ **Costos optimizados** (un solo servicio)

---

**Última actualización**: 2025-12-26 09:25

