#!/usr/bin/env python3
# Script para aplicar cambios en MyProfileView.tsx

import re

# Leer el archivo
with open('screens/profile/MyProfileView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# CAMBIO 1: Reemplazar función handleSave (líneas 352-404)
old_code_1 = '''    // Guardar cambios localmente
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
  };'''

new_code_1 = '''    // SUPABASE COMO FUENTE DE VERDAD: Guardar primero en Supabase, luego en localStorage
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
  };'''

# Buscar y reemplazar (ignorando diferencias en emojis)
# Usar regex para encontrar el patrón sin importar los emojis exactos
pattern = r'// Guardar cambios localmente\s+const updated = updateUser.*?setIsEditing\(false\);\s+\};'
if re.search(pattern, content, re.DOTALL):
    content = re.sub(pattern, new_code_1, content, flags=re.DOTALL)
    print("✅ CAMBIO 1 aplicado: handleSave actualizado")
else:
    print("❌ No se encontró el patrón para CAMBIO 1")

# Guardar el archivo
with open('screens/profile/MyProfileView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Archivo actualizado exitosamente")

