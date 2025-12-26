const fs = require('fs');

console.log('Aplicando cambios de Supabase a MyProfileView.tsx...\n');

// Leer el archivo
let content = fs.readFileSync('screens/profile/MyProfileView.tsx', 'utf8');

// CAMBIO 1: Actualizar imports (línea 35)
console.log('1. Actualizando imports...');
content = content.replace(
  /import \{ syncProfileToCloud, getNotificationStatus, requestNotificationPermission, clearFCMToken \} from '\.\.\/\.\.\/services\/firebaseService';/,
  "import { getNotificationStatus, requestNotificationPermission, clearFCMToken } from '../../services/firebaseService';"
);

// CAMBIO 2: Reemplazar handlePhotoUpload
console.log('2. Actualizando handlePhotoUpload...');
const oldPhotoUpload = /\/\/ Manejar upload de foto de perfil - SUBE A FIREBASE STORAGE[\s\S]*?catch \(err\) \{[\s\S]*?setSaveMessage\([^)]+\);[\s\S]*?setTimeout\([^}]+\}, 3000\);[\s\S]*?\}[\s\S]*?\};/;

const newPhotoUpload = `// Manejar upload de foto de perfil - SUBE A SUPABASE STORAGE
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setSaveMessage('Subiendo foto a Supabase...');

      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setSaveMessage('Formato no válido. Usa JPG, PNG, WEBP o GIF');
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSaveMessage('La imagen es muy grande. Máximo 5MB');
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      // Subir a Supabase Storage
      const { uploadAvatarToSupabase } = await import('../../services/supabaseStorage');
      const url = await uploadAvatarToSupabase(currentUser.id, file);

      // Actualizar estado local
      setProfile({ ...profile, avatarUrl: url });

      // También actualizar en localStorage
      const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
      const userIndex = users.findIndex((u: { id: string }) => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].avatarUrl = url;
        localStorage.setItem('tribu_users', JSON.stringify(users));
      }

      setSaveMessage('Foto subida correctamente');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Error upload foto:', err);
      setSaveMessage('Error al subir imagen');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };`;

content = content.replace(oldPhotoUpload, newPhotoUpload);

// CAMBIO 3: Reemplazar handleBannerUpload
console.log('3. Actualizando handleBannerUpload...');
const oldBannerUpload = /\/\/ Manejar upload de banner\/cover - SUBE A FIREBASE STORAGE[\s\S]*?catch \(err\) \{[\s\S]*?console\.error\('Error upload banner:', err\);[\s\S]*?setSaveMessage\([^)]+\);[\s\S]*?setTimeout\([^}]+\}, 3000\);[\s\S]*?\}[\s\S]*?\};/;

const newBannerUpload = `// Manejar upload de banner/cover - SUBE A SUPABASE STORAGE
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setSaveMessage('Subiendo banner a Supabase...');

      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setSaveMessage('Formato no válido. Usa JPG, PNG, WEBP o GIF');
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      // Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setSaveMessage('La imagen es muy grande. Máximo 10MB');
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      // Subir a Supabase Storage
      const { uploadCoverToSupabase } = await import('../../services/supabaseStorage');
      const url = await uploadCoverToSupabase(currentUser.id, file);

      // Actualizar estado local
      setProfile({ ...profile, coverUrl: url });

      // También actualizar en localStorage
      const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
      const userIndex = users.findIndex((u: { id: string }) => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].coverUrl = url;
        localStorage.setItem('tribu_users', JSON.stringify(users));
      }

      setSaveMessage('Banner subido correctamente');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Error upload banner:', err);
      setSaveMessage('Error al subir banner');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };`;

content = content.replace(oldBannerUpload, newBannerUpload);

// CAMBIO 4: Reemplazar handleSave (la parte de Firebase sync)
console.log('4. Actualizando handleSave (sync con Supabase)...');
const oldHandleSave = /\/\/ Guardar cambios localmente[\s\S]*?const updated = updateUser\(currentUser\.id, profileData\);[\s\S]*?if \(updated\) \{[\s\S]*?setIsEditing\(false\);[\s\S]*?\};/;

const newHandleSave = `// SUPABASE COMO FUENTE DE VERDAD: Guardar primero en Supabase, luego en localStorage
    let supabaseSaved = false;
    let retries = 3;

    while (!supabaseSaved && retries > 0) {
      try {
        const { supabase } = await import('../../services/supabaseService');

        setSaveMessage('Guardando en Supabase... (intento ' + (4 - retries) + '/3)');

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
          console.warn('No se pudo actualizar localStorage, pero Supabase se guardó correctamente');
        }

        supabaseSaved = true;
        setSaveMessage('Perfil guardado en Supabase');
        console.log('Perfil actualizado en Supabase');
      } catch (error) {
        retries--;
        console.error('Error guardando en Supabase (quedan ' + retries + ' intentos):', error);
        if (retries > 0) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    if (!supabaseSaved) {
      setSaveMessage('Error al guardar. Por favor intenta de nuevo.');
      setIsSaving(false);
      return;
    }

    setTimeout(() => setSaveMessage(null), 3000);
    setIsSaving(false);
    setIsEditing(false);
  };`;

content = content.replace(oldHandleSave, newHandleSave);

// Guardar el archivo
fs.writeFileSync('screens/profile/MyProfileView.tsx', content, 'utf8');

console.log('\n✅ TODOS LOS CAMBIOS APLICADOS EXITOSAMENTE!\n');
console.log('Cambios realizados:');
console.log('  1. ✅ Imports actualizados');
console.log('  2. ✅ handlePhotoUpload -> Supabase Storage');
console.log('  3. ✅ handleBannerUpload -> Supabase Storage');
console.log('  4. ✅ handleSave -> Supabase Database');
console.log('\nAhora ejecuta: git add . && git commit -m "feat: Migración completa a Supabase" && git push');

