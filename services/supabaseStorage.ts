// Supabase Storage - Upload de imágenes
import { supabase } from './supabaseService';

/**
 * Comprimir imagen antes de subir
 */
const compressImage = async (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones manteniendo aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`📸 Imagen comprimida: ${Math.round(blob.size / 1024)}KB (${width}x${height})`);
              resolve(blob);
            } else {
              reject(new Error('Error al comprimir imagen'));
            }
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

/**
 * Subir avatar a Supabase Storage
 */
export const uploadAvatarToSupabase = async (userId: string, file: File): Promise<string> => {
  try {
    console.log('📤 Subiendo avatar a Supabase Storage...');
    
    // Comprimir imagen (500x500)
    const compressedFile = await compressImage(file, 500, 500);
    
    // Generar nombre único
    const fileName = `${userId}_${Date.now()}.jpg`;
    const filePath = `${userId}/${fileName}`;
    
    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, compressedFile, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.error('❌ Error subiendo avatar:', error);
      throw error;
    }
    
    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    console.log('✅ Avatar subido a Supabase:', publicUrl);
    
    // Actualizar URL en la tabla users
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (updateError) {
      console.error('⚠️ Error actualizando avatar_url en DB:', updateError);
    }
    
    return publicUrl;
  } catch (error) {
    console.error('❌ Error en uploadAvatarToSupabase:', error);
    throw error;
  }
};

/**
 * Subir cover/banner a Supabase Storage
 */
export const uploadCoverToSupabase = async (userId: string, file: File): Promise<string> => {
  try {
    console.log('📤 Subiendo cover a Supabase Storage...');
    
    // Comprimir imagen (1200x400)
    const compressedFile = await compressImage(file, 1200, 400);
    
    // Generar nombre único
    const fileName = `${userId}_${Date.now()}.jpg`;
    const filePath = `${userId}/${fileName}`;
    
    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('covers')
      .upload(filePath, compressedFile, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.error('❌ Error subiendo cover:', error);
      throw error;
    }
    
    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('covers')
      .getPublicUrl(filePath);
    
    console.log('✅ Cover subido a Supabase:', publicUrl);
    
    // Actualizar URL en la tabla users
    const { error: updateError } = await supabase
      .from('users')
      .update({ cover_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (updateError) {
      console.error('⚠️ Error actualizando cover_url en DB:', updateError);
    }
    
    return publicUrl;
  } catch (error) {
    console.error('❌ Error en uploadCoverToSupabase:', error);
    throw error;
  }
};

/**
 * Eliminar imagen de Supabase Storage
 */
export const deleteImageFromSupabase = async (bucket: 'avatars' | 'covers', filePath: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) throw error;
    
    console.log(`✅ Imagen eliminada de ${bucket}:`, filePath);
  } catch (error) {
    console.error(`❌ Error eliminando imagen de ${bucket}:`, error);
    throw error;
  }
};

