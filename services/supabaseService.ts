// Supabase Service - Tribu Impulsa
// Servicio completo para autenticación, base de datos, storage y realtime

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Faltan variables de entorno de Supabase. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
}

export const supabase: SupabaseClient = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});

// ============================================
// TIPOS TYPESCRIPT
// ============================================

export interface SupabaseUser {
  id: string;
  auth_uid: string;
  email: string;
  name: string;
  company_name: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  linkedin?: string;
  tiktok?: string;
  category: string[];
  affinity?: string;
  sub_category?: string;
  scope?: 'NACIONAL' | 'REGIONAL' | 'LOCAL';
  city?: string;
  comuna?: string;
  selected_regions?: string[];
  bio?: string;
  business_description?: string;
  revenue?: string;
  avatar_url?: string;
  company_logo_url?: string;
  cover_url?: string;
  followers: number;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  role?: 'user' | 'admin';
  profile_complete: boolean;
  onboarding_complete: boolean;
  terms_accepted: boolean;
  survey_completed: boolean;
  tribe_assigned: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface SupabaseSystemStats {
  id: string;
  profiles_completed: number;
  members_active: number;
  profiles_target: number;
  last_updated: string;
}

// ============================================
// VERIFICACIÓN DE CONFIGURACIÓN
// ============================================

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// ============================================
// AUTHENTICATION
// ============================================

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
};

export const sendPasswordResetEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  if (error) throw error;
};

// ============================================
// USERS
// ============================================

export const getUserById = async (userId: string): Promise<SupabaseUser | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
  return data;
};

export const getUserByEmail = async (email: string): Promise<SupabaseUser | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();
  
  if (error) {
    if (error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error obteniendo usuario por email:', error);
    }
    return null;
  }
  return data;
};

export const getUserByAuthUID = async (authUID: string): Promise<SupabaseUser | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_uid', authUID)
    .single();
  
  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error obteniendo usuario por auth_uid:', error);
    }
    return null;
  }
  return data;
};

export const createUserProfile = async (userData: Partial<SupabaseUser>): Promise<SupabaseUser> => {
  const { data, error } = await supabase
    .from('users')
    .insert({
      auth_uid: userData.auth_uid,
      email: userData.email?.toLowerCase(),
      name: userData.name,
      company_name: userData.company_name,
      phone: userData.phone,
      whatsapp: userData.whatsapp || userData.phone,
      instagram: userData.instagram,
      website: userData.website,
      linkedin: userData.linkedin,
      tiktok: userData.tiktok,
      category: userData.category || [],
      affinity: userData.affinity,
      sub_category: userData.sub_category,
      scope: userData.scope || 'NACIONAL',
      city: userData.city,
      comuna: userData.comuna,
      selected_regions: userData.selected_regions || [],
      bio: userData.bio,
      business_description: userData.business_description,
      revenue: userData.revenue,
      avatar_url: userData.avatar_url,
      company_logo_url: userData.company_logo_url,
      cover_url: userData.cover_url,
      followers: userData.followers || 0,
      status: userData.status || 'active',
      role: userData.role || 'user',
      profile_complete: userData.profile_complete || false,
      onboarding_complete: userData.onboarding_complete || false,
      terms_accepted: userData.terms_accepted || false,
      survey_completed: userData.survey_completed || false,
      tribe_assigned: userData.tribe_assigned || false
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<SupabaseUser>): Promise<SupabaseUser> => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getAllUsers = async (): Promise<SupabaseUser[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  
  if (error) {
    console.error('Error eliminando usuario:', error);
    return false;
  }
  return true;
};

// ============================================
// NOTIFICATIONS
// ============================================

export const createNotification = async (notification: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}): Promise<SupabaseNotification> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserNotifications = async (userId: string): Promise<SupabaseNotification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
  
  if (error) throw error;
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  
  if (error) throw error;
};

// ============================================
// SYSTEM STATS
// ============================================

export const getSystemStats = async (): Promise<SupabaseSystemStats | null> => {
  const { data, error } = await supabase
    .from('system_stats')
    .select('*')
    .eq('id', 'global')
    .single();
  
  if (error) {
    console.error('Error obteniendo estadísticas:', error);
    return null;
  }
  return data;
};

export const incrementProfilesCompleted = async (): Promise<void> => {
  const { error } = await supabase.rpc('increment_profiles_completed');
  if (error) {
    console.error('Error incrementando contador:', error);
    throw error;
  }
};

export const updateSystemStats = async (stats: Partial<SupabaseSystemStats>): Promise<void> => {
  const { error } = await supabase
    .from('system_stats')
    .update({
      ...stats,
      last_updated: new Date().toISOString()
    })
    .eq('id', 'global');
  
  if (error) throw error;
};

// ============================================
// TRIBE ASSIGNMENTS
// ============================================

export const createTribeAssignment = async (assignment: {
  userId: string;
  month: string;
  assignedUserId: string;
  status?: 'pending' | 'completed' | 'skipped';
}) => {
  const { data, error } = await supabase
    .from('tribe_assignments')
    .insert({
      user_id: assignment.userId,
      month: assignment.month,
      assigned_user_id: assignment.assignedUserId,
      status: assignment.status || 'pending'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserTribeAssignments = async (userId: string, month?: string) => {
  let query = supabase
    .from('tribe_assignments')
    .select('*')
    .eq('user_id', userId);
  
  if (month) {
    query = query.eq('month', month);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

// ============================================
// INTERACTIONS
// ============================================

export const createInteraction = async (interaction: {
  fromUserId: string;
  toUserId: string;
  type: 'like' | 'message' | 'view' | 'contact' | 'share';
  status?: 'pending' | 'accepted' | 'declined';
  metadata?: Record<string, any>;
}) => {
  const { data, error } = await supabase
    .from('interactions')
    .insert({
      from_user_id: interaction.fromUserId,
      to_user_id: interaction.toUserId,
      type: interaction.type,
      status: interaction.status || 'pending',
      metadata: interaction.metadata || {}
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserInteractions = async (userId: string) => {
  const { data, error } = await supabase
    .from('interactions')
    .select('*')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

// ============================================
// MEMBERSHIPS
// ============================================

export const getUserMembership = async (userId: string) => {
  const { data, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error obteniendo membresía:', error);
    }
    return null;
  }
  return data;
};

export const createMembership = async (membership: {
  userId: string;
  status?: 'trial' | 'miembro' | 'admin' | 'inactivo';
  plan?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { data, error } = await supabase
    .from('memberships')
    .insert({
      user_id: membership.userId,
      status: membership.status || 'trial',
      plan: membership.plan,
      start_date: membership.startDate,
      end_date: membership.endDate
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateMembership = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('memberships')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export const subscribeToUser = (userId: string, callback: (user: SupabaseUser) => void) => {
  return supabase
    .channel(`user:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'users',
      filter: `id=eq.${userId}`
    }, (payload) => {
      if (payload.new) {
        callback(payload.new as SupabaseUser);
      }
    })
    .subscribe();
};

export const subscribeToNotifications = (userId: string, callback: (notifications: SupabaseNotification[]) => void) => {
  return supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, async () => {
      const notifications = await getUserNotifications(userId);
      callback(notifications);
    })
    .subscribe();
};

export const subscribeToSystemStats = (callback: (stats: SupabaseSystemStats) => void) => {
  return supabase
    .channel('system_stats')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'system_stats',
      filter: 'id=eq.global'
    }, async () => {
      const stats = await getSystemStats();
      if (stats) callback(stats);
    })
    .subscribe();
};

// ============================================
// STORAGE (para imágenes)
// ============================================

const IMAGE_CONFIG = {
  maxSizeBytes: 2 * 1024 * 1024, // 2MB máximo
  maxWidth: 500,
  maxHeight: 500,
  quality: 0.8,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
};

// Comprimir imagen antes de subir
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        if (width > IMAGE_CONFIG.maxWidth || height > IMAGE_CONFIG.maxHeight) {
          const ratio = Math.min(IMAGE_CONFIG.maxWidth / width, IMAGE_CONFIG.maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear canvas'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
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
          IMAGE_CONFIG.quality
        );
      };
      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsDataURL(file);
  });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!IMAGE_CONFIG.allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Solo se permiten imágenes JPG, PNG o WebP' };
  }
  if (file.size > IMAGE_CONFIG.maxSizeBytes) {
    return { valid: false, error: `Imagen muy grande. Máximo ${IMAGE_CONFIG.maxSizeBytes / 1024 / 1024}MB` };
  }
  return { valid: true };
};

export const uploadProfileImage = async (
  userId: string,
  file: File,
  type: 'avatar' | 'cover' = 'avatar'
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Validar
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Comprimir imagen
    const compressedBlob = await compressImage(file);
    
    // Generar nombre de archivo
    const fileExt = 'jpg';
    const fileName = `${type}_${userId}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Subir archivo
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, compressedBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    // Actualizar perfil con la nueva URL
    const field = type === 'avatar' ? 'avatar_url' : 'cover_url';
    await updateUserProfile(userId, { [field]: publicUrl } as Partial<SupabaseUser>);

    console.log(`✅ Imagen ${type} subida para usuario ${userId}`);
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('❌ Error subiendo imagen:', error);
    return { success: false, error: error.message || 'Error al subir imagen. Intenta de nuevo.' };
  }
};

export const getImageConfig = () => ({
  maxSizeMB: IMAGE_CONFIG.maxSizeBytes / 1024 / 1024,
  maxDimensions: `${IMAGE_CONFIG.maxWidth}x${IMAGE_CONFIG.maxHeight}`,
  allowedFormats: 'JPG, PNG, WebP'
});

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  supabase,
  isSupabaseConfigured,
  // Auth
  signUpWithEmail,
  signInWithEmail,
  signOut,
  getCurrentSession,
  getCurrentUser,
  onAuthStateChange,
  sendPasswordResetEmail,
  // Users
  getUserById,
  getUserByEmail,
  getUserByAuthUID,
  createUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  // Notifications
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  // System Stats
  getSystemStats,
  incrementProfilesCompleted,
  updateSystemStats,
  // Tribe Assignments
  createTribeAssignment,
  getUserTribeAssignments,
  // Interactions
  createInteraction,
  getUserInteractions,
  // Memberships
  getUserMembership,
  createMembership,
  updateMembership,
  // Realtime
  subscribeToUser,
  subscribeToNotifications,
  subscribeToSystemStats,
  // Storage
  uploadProfileImage,
  validateImageFile,
  getImageConfig
};

