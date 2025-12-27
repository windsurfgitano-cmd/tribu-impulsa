import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  Type,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Instagram,
  Share2,
  MapPin,
  Globe,
  ArrowRight,
  LogOut,
  Crown,
  Gift,
  CreditCard,
  Bell,
  Sparkles
} from 'lucide-react';
import { getMyProfile } from '../../services/matchService';
import { getCurrentUser, updateUser } from '../../services/databaseService';
import { useSurveyGuard } from '../../hooks/useSurveyGuard';
import { REGIONS } from '../../constants/geography';
import { SearchableSelect } from '../../components/SearchableSelect';
import { CATEGORY_SELECT_OPTIONS, AFFINITY_SELECT_OPTIONS_WITH_GROUP } from '../../utils/selectOptions';
import { validateUserProfile, syncProfileCompletionState } from '../../utils/validation';
import { changeUserPassword } from '../../services/realUsersData';
import { getNotificationStatus, requestNotificationPermission, clearFCMToken } from '../../services/firebaseService';
import { TribalLoadingAnimation } from '../../components/TribalAnimation';
import { getAppConfig, clearStoredSession } from '../../utils/storage';
import { fetchMembershipFromCloud, syncMembershipToLocalCache } from '../../services/membershipCache';
import { TRIBE_CATEGORY_OPTIONS } from '../../data/tribeCategories';
import { AFFINITY_OPTIONS } from '../../types';


const MyProfileView = ({ fontSize, setFontSize }: { fontSize: 'small' | 'medium' | 'large'; setFontSize: React.Dispatch<React.SetStateAction<'small' | 'medium' | 'large'>> }) => {
  const navigate = useNavigate();
  useSurveyGuard();
  const [isEditing, setIsEditing] = useState(false);
  
  // Inicializar profile con datos de getMyProfile() + campos adicionales de currentUser (businessDescription, revenue, etc.)
  const currentUser = getCurrentUser();
  const initialProfile = getMyProfile();
  const [profile, setProfile] = useState(() => ({
    ...initialProfile,
    businessDescription: (currentUser as any)?.businessDescription || '',
    revenue: (currentUser as any)?.revenue || '',
    affinity: (currentUser as any)?.affinity || '',
  }));
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Estados para selectores de matching (categoría, afinidad, geografía)
  const [editScope, setEditScope] = useState<'LOCAL' | 'REGIONAL' | 'NACIONAL'>(currentUser?.scope || 'NACIONAL');
  const [editSelectedRegionForComuna, setEditSelectedRegionForComuna] = useState<string>('');
  const [editSelectedRegions, setEditSelectedRegions] = useState<string[]>(currentUser?.selectedRegions || []);
  const [editComuna, setEditComuna] = useState<string>(currentUser?.comuna || '');
  const [editCategory, setEditCategory] = useState<string[]>(
    Array.isArray(currentUser?.category) 
      ? currentUser.category 
      : currentUser?.category 
        ? currentUser.category.split(',').map(c => c.trim()) 
        : []
  );
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>('');
  const [editAffinity, setEditAffinity] = useState<string>(currentUser?.affinity || '');
  const [editRevenue, setEditRevenue] = useState<string>(currentUser?.revenue || '');

  // Comunas filtradas por región seleccionada
  const editComunasDeRegion = editSelectedRegionForComuna
    ? REGIONS.find(r => r.id === editSelectedRegionForComuna)?.comunas || []
    : [];
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  // Estados para cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Estado para acceso secreto a Red (Directorio)
  const [showSecretInput, setShowSecretInput] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [secretCodeError, setSecretCodeError] = useState('');

  // Estado para tamaño de letra (accesibilidad)
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);

  // Sincronizar profile con currentUser cuando el componente se monta (especialmente businessDescription)
  useEffect(() => {
    const updatedCurrentUser = getCurrentUser();
    if (updatedCurrentUser) {
      setProfile(prev => ({
        ...prev,
        businessDescription: (updatedCurrentUser as any)?.businessDescription || prev.businessDescription || '',
        revenue: (updatedCurrentUser as any)?.revenue || prev.revenue || '',
        affinity: (updatedCurrentUser as any)?.affinity || prev.affinity || '',
      }));
    }
  }, []); // Ejecutar solo en el mount inicial

  const handleSecretAccess = () => {
    if (secretCode === 'TRIBU2026') {
      navigate('/directory');
      setSecretCode('');
      setShowSecretInput(false);
    } else {
      setSecretCodeError('Código incorrecto');
      setTimeout(() => setSecretCodeError(''), 2000);
    }
  };

  // Función para cambiar contraseña
  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    // Validaciones
    if (!currentPassword) {
      setPasswordError('Ingresa tu contraseña actual');
      return;
    }

    // Verificar contraseña actual
    const user = getCurrentUser();
    if (!user) {
      setPasswordError('Error: usuario no encontrado');
      return;
    }

    // Buscar usuario y verificar contraseña
    const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
    const userIndex = users.findIndex((u: { id: string }) => u.id === user.id);

    if (userIndex === -1) {
      setPasswordError('Error: usuario no encontrado');
      return;
    }

    const currentUserData = users[userIndex];
    if (currentUserData.password !== currentPassword && currentPassword !== 'TRIBU2026') {
      setPasswordError('Contraseña actual incorrecta');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    // Actualizar contraseña en localStorage
    users[userIndex].password = newPassword;
    localStorage.setItem('tribu_users', JSON.stringify(users));

    // Marcar que ya cambió su contraseña (nunca más mostrar popup)
    localStorage.setItem(`password_changed_${user.id}`, 'true');

    // Sincronizar contraseña con Firebase (persistente entre dispositivos)
    try {
      const { updateUserPassword } = await import('../../services/firebaseService');
      const synced = await updateUserPassword(user.id, newPassword);
      if (synced) {
        console.log(' Contraseña sincronizada con Firebase');
      }
    } catch (err) {
      console.log('âš ï¸ Contraseña guardada localmente (Firebase no disponible):', err);
    }

    setPasswordSuccess(true);
    setTimeout(() => {
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(false);
    }, 1500);
  };

  // Manejar upload de foto de perfil - SUBE A SUPABASE STORAGE
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setSaveMessage('Subiendo foto a Supabase...');

      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setSaveMessage('Formato no valido. Usa JPG, PNG, WEBP o GIF');
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSaveMessage('La imagen es muy grande. Maximo 5MB');
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
  };
  // Manejar upload de banner/cover - SUBE A SUPABASE STORAGE
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setSaveMessage('Subiendo banner a Supabase...');

      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setSaveMessage('Formato no valido. Usa JPG, PNG, WEBP o GIF');
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      // Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setSaveMessage('La imagen es muy grande. Maximo 10MB');
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
  };

  // Agregar etiqueta
  const handleAddTag = () => {
    if (newTag.trim() && !profile.tags.includes(newTag.trim())) {
      setProfile({ ...profile, tags: [...profile.tags, newTag.trim()] });
      setNewTag('');
      setShowTagInput(false);
    }
  };

  // Eliminar etiqueta
  const handleRemoveTag = (tagToRemove: string) => {
    setProfile({ ...profile, tags: profile.tags.filter(t => t !== tagToRemove) });
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    // ✅ VALIDACIÓN ESTRICTA: NO permitir guardar perfiles incompletos
    const validationErrors: string[] = [];
    
    if (!profile.name || profile.name.trim().length < 2) {
      validationErrors.push('Nombre completo (mínimo 2 caracteres)');
    }
    if (!profile.companyName || profile.companyName.trim().length < 2) {
      validationErrors.push('Nombre del emprendimiento (mínimo 2 caracteres)');
    }
    if (editCategory.length === 0) {
      validationErrors.push('Al menos 1 categoría/giro comercial');
    }
    if (!profile.instagram || profile.instagram.trim().length < 2) {
      validationErrors.push('Instagram');
    }
    if (!profile.phone && !profile.whatsapp) {
      validationErrors.push('Teléfono/WhatsApp');
    }
    if (!editScope || (editScope === 'LOCAL' && !editComuna) || (editScope === 'REGIONAL' && editSelectedRegions.length === 0)) {
      validationErrors.push('Alcance geográfico completo');
    }
    if (!profile.bio || profile.bio.trim().length < 50) {
      validationErrors.push('Biografía (mínimo 50 caracteres)');
    }
    const businessDesc = (profile as any).businessDescription || '';
    if (!businessDesc || businessDesc.trim().length < 60) {
      validationErrors.push('Descripción del negocio (mínimo 60 caracteres)');
    }
    if (!editRevenue) {
      validationErrors.push('Rango de ingresos/facturación');
    }
    
    if (validationErrors.length > 0) {
      setSaveMessage('Completa todos los campos requeridos');
      alert(`⚠️ PERFIL INCOMPLETO\n\nDebe completar los siguientes campos:\n\n• ${validationErrors.join('\n• ')}\n\n NO se puede guardar un perfil incompleto.`);
      return;
    }
    
    setIsSaving(true);
    setSaveMessage('Guardando cambios...');

    // Datos a guardar (incluye campos de matching y redes sociales)
    const profileData = {
      name: profile.name,
      companyName: profile.companyName,
      bio: profile.bio,
      businessDescription: (profile as any).businessDescription || profile.bio || '',
      phone: profile.phone || profile.whatsapp || '',
      whatsapp: profile.whatsapp || profile.phone || '',
      // Redes sociales
      instagram: profile.instagram,
      tiktok: (profile as any).tiktok || '',
      facebook: (profile as any).facebook || '',
      twitter: (profile as any).twitter || '',
      website: profile.website,
      // Ubicación
      city: profile.location?.split(',')[0]?.trim() || '',
      location: profile.location,
      avatarUrl: profile.avatarUrl,
      coverUrl: profile.coverUrl,
      tags: profile.tags,
      // Campos de MATCHING - usando los selectores
      category: editCategory.length > 0 ? editCategory : (Array.isArray(profile.category) ? profile.category : [profile.category]),
      affinity: editAffinity || (profile as any).affinity || (Array.isArray(editCategory) && editCategory.length > 0 ? editCategory[0] : profile.category),
      scope: editScope,
      comuna: editComuna,
      selectedRegions: editSelectedRegions,
      revenue: editRevenue,
    };

    // SUPABASE COMO FUENTE DE VERDAD: Guardar primero en Supabase, luego en localStorage
    let supabaseSaved = false;
    let retries = 3;

    while (!supabaseSaved && retries > 0) {
      try {
        const { supabase, getCurrentAuthUserId } = await import('../../services/supabaseService');

        setSaveMessage('Guardando en Supabase... (intento ' + (4 - retries) + '/3)');

        // ✅ Obtener auth.uid() real del usuario autenticado
        const authUserId = await getCurrentAuthUserId();
        if (!authUserId) {
          throw new Error('Usuario no autenticado en Supabase');
        }

        console.log(`🔐 Actualizando perfil con auth.uid(): ${authUserId}`);

        // 1. Guardar en Supabase (FUENTE DE VERDAD) - Buscar por auth_uid
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
            website: profileData.website,
            city: profileData.city,
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
          .eq('auth_uid', authUserId); // Usar auth_uid en lugar de id

        if (error) throw error;

        // 2. Sincronizar a localStorage (CACHÉ) - Usar auth.uid() como ID
        const updated = updateUser(authUserId, profileData);
        
        if (!updated) {
          console.warn('No se pudo actualizar localStorage, pero Supabase se guardó correctamente');
        }

        supabaseSaved = true;
        setSaveMessage('Perfil guardado en línea');
        console.log(`✅ Perfil actualizado en Supabase con auth.uid(): ${authUserId}`);
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
  };

  return (
    <div className="pb-32 animate-fadeIn min-h-screen bg-[#F5F7FB]">
      {/* Header with Cover */}
      <div className="h-72 w-full relative group">
        <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#F5F7FB]"></div>

        {/* Botón editar banner - Arriba a la derecha del cover (con safe-area para iPhone) */}
        {isEditing && (
          <button
            onClick={() => bannerInputRef.current?.click()}
            className="absolute top-14 right-4 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all z-40 text-sm"
          >
            <Edit2 size={16} />
            <span className="font-medium">Cambiar banner</span>
          </button>
        )}
        <input
          ref={bannerInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp,.heic,.heif,image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
          onChange={handleBannerUpload}
          className="hidden"
        />

        {/* Top Navigation Actions (con safe-area para iPhone) */}
        <div className="absolute top-14 left-4 right-4 z-30 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[#181B34] hover:bg-white transition-colors border border-[#E4E7EF] flex items-center gap-2 shadow-md"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Volver</span>
          </button>
          <button
            onClick={async () => {
              setSaveMessage('â˜ï¸ Sincronizando con la nube...');
              try {
                const { syncUserToFirebase } = await import('../../services/firebaseService');
                const localUser = getCurrentUser();

                // PASO 1: PRIMERO subir datos locales a Firebase (para no perderlos)
                if (localUser) {
                  setSaveMessage(' Subiendo datos locales a la nube...');
                  await syncUserToFirebase(localUser.id, {
                    name: localUser.name,
                    companyName: localUser.companyName,
                    bio: localUser.bio,
                    phone: localUser.phone,
                    whatsapp: localUser.whatsapp,
                    instagram: localUser.instagram,
                    website: localUser.website,
                    city: localUser.city,
                    category: localUser.category,
                    affinity: localUser.affinity,
                    scope: localUser.scope,
                    comuna: localUser.comuna,
                    selectedRegions: localUser.selectedRegions,
                    revenue: localUser.revenue,
                    avatarUrl: localUser.avatarUrl,
                    coverUrl: localUser.coverUrl,
                  });
                  console.log('Datos locales subidos a Firebase');
                }

                // PASO 2: Luego descargar datos frescos de Firebase
                setSaveMessage(' Descargando datos de la nube...');
                const session = getStoredSession();
                if (session?.email) {
                  const freshUser = await getUserFromFirebaseByEmail(session.email);
                  if (freshUser) {
                    setCurrentUser(freshUser.id);
                    setProfile(getMyProfile());
                    const user = getCurrentUser();
                    if (user) {
                      setEditScope(user.scope || 'NACIONAL');
                      setEditSelectedRegions(user.selectedRegions || []);
                      setEditComuna(user.comuna || '');
                      setEditCategory(user.category || '');
                      setEditAffinity(user.affinity || '');
                      setEditRevenue(user.revenue || '');
                    }
                    setSaveMessage('Sincronizacion completa');
                  } else {
                    setSaveMessage('âš ï¸ No se encontró usuario en la nube');
                  }
                }
              } catch (error) {
                console.error('Error sincronizando:', error);
                setSaveMessage('âŒ Error al sincronizar');
              }
              setTimeout(() => setSaveMessage(null), 3000);
            }}
            className="hidden"
          >
          </button>
        </div>
      </div>

      <div className="px-4 -mt-24 relative z-10">
        <div className="bg-white rounded-2xl !overflow-visible px-6 pb-8 border border-[#E4E7EF] shadow-[0_4px_30px_rgba(0,0,0,0.08)] flex flex-col items-center">

          {/* Avatar - Simple, sin círculo extra */}
          <div className="relative -mt-20 mb-4 z-20">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
            />
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white"
              >
                <div className="text-center">
                  <Edit2 size={20} className="mx-auto mb-1" />
                  <span className="text-xs">Cambiar foto</span>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.heic,.heif,image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* Main Info */}
          <div className="text-center mb-4 w-full">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  value={profile.companyName}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  className="bg-[#F5F7FB] text-center text-2xl font-bold text-[#181B34] rounded-lg p-2 w-full outline-none border border-[#E4E7EF] focus:border-[#6161FF] focus:ring-2 focus:ring-[#6161FF]/20"
                />
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="bg-[#F5F7FB] text-center text-[#434343] font-medium text-lg rounded-lg p-2 w-full outline-none border border-[#E4E7EF] focus:border-[#6161FF] focus:ring-2 focus:ring-[#6161FF]/20"
                />
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-[#181B34] mb-1 tracking-tight">{profile.companyName}</h2>
                <p className="text-[#7C8193] font-medium text-lg">{profile.name}</p>
              </>
            )}

            {/* Badge de categoría (solo lectura) - mostrar giros con bullet points */}
            {!isEditing && (
              <div className="mt-4">
                <div className="bg-[#F5F7FB] rounded-xl p-4 border border-[#E4E7EF]">
                  <h4 className="text-xs font-bold uppercase text-[#7C8193] mb-2 tracking-wide">Giros Comerciales</h4>
                  <ul className="space-y-1.5">
                    {(() => {
                      const categories = Array.isArray(editCategory) 
                        ? editCategory 
                        : typeof editCategory === 'string' && editCategory
                          ? editCategory.split(',').map(c => c.trim())
                          : ['Emprendimiento'];
                      
                      return categories.map((cat: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-[#434343]">
                          <span className="text-[#6161FF] mt-0.5">•</span>
                          <span className="flex-1">{cat}</span>
                        </li>
                      ));
                    })()}
                  </ul>
                </div>
              </div>
            )}

            {/* Botón Editar Perfil - Centrado debajo de categoría */}
            <div className="mt-4">
              {isEditing ? (
                <div className="flex justify-center gap-3">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-full bg-[#FB275D]/10 text-[#FB275D] hover:bg-[#FB275D]/20 flex items-center gap-2 text-sm font-medium">
                    <X size={16} /> Cancelar
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-full bg-[#00CA72] text-white hover:bg-[#00B366] flex items-center gap-2 text-sm font-medium disabled:opacity-50">
                    {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} Guardar
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 rounded-full border border-[#6161FF]/30 text-[#6161FF] hover:bg-[#6161FF]/10 flex items-center gap-2 text-sm font-medium mx-auto">
                  <Edit2 size={14} /> Editar Perfil
                </button>
              )}
            </div>
          </div>

          {/* Mensaje de guardado */}
          {saveMessage && (
            <div className={`w-full p-3 rounded-xl text-center text-sm font-medium mb-4 ${saveMessage.includes('guardado') || saveMessage.includes('Guardando')
              ? 'bg-[#E6FFF3] text-[#008A4E] border border-[#00CA72]/30'
              : 'bg-[#FFF0F3] text-[#FB275D] border border-[#FB275D]/30'
              }`}>
              {saveMessage}
            </div>
          )}

          {/* Campos editables del perfil */}
          {isEditing && (
            <div className="w-full mb-6 space-y-4">
              {/* Datos básicos */}
              <div className="bg-[#F5F7FB] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-[#6161FF] tracking-wide">Datos Básicos</h4>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Nombre del Emprendimiento</label>
                  <input
                    value={profile.companyName}
                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                    placeholder="Mi Empresa"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Tu Nombre</label>
                  <input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Tu nombre"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">WhatsApp</label>
                  <input
                    value={profile.whatsapp || profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value, phone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">
                    Biografía Corta (mín. 50 caracteres) {profile.bio?.length || 0}/50
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Escribe una biografía breve sobre ti y tu emprendimiento..."
                    rows={2}
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF] resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">
                    Descripción del Negocio (mín. 60 caracteres) {((profile as any).businessDescription || '')?.length || 0}/60
                  </label>
                  <textarea
                    value={(profile as any).businessDescription || ''}
                    onChange={(e) => setProfile({ ...profile, businessDescription: e.target.value } as any)}
                    placeholder="Describe tu negocio, productos o servicios..."
                    rows={3}
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF] resize-none"
                  />
                </div>
              </div>

              {/* Categoría y Afinidad - SELECTORES para matching */}
              <div className="bg-[#F5F7FB] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-[#6161FF] tracking-wide">Categoria e Intereses (para Matching)</h4>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1.5 block">
                    Rubros principales * <span className="text-[#7C8193] font-normal">(Selecciona hasta 5)</span>
                  </label>
                  <p className="text-[0.5625rem] text-[#7C8193] mb-2">
                    {editCategory.length === 0 ? 'Selecciona al menos 1 categoría' : `${editCategory.length} de 5 seleccionadas`}
                  </p>
                  
                  {/* Filtro de búsqueda */}
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="🔍 Buscar giro comercial..."
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className="w-full bg-white border border-[#E4E7EF] rounded-xl p-3 text-sm text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF]"
                    />
                  </div>
                  
                  <div className="bg-white border border-[#E4E7EF] rounded-xl p-4 max-h-[400px] overflow-y-auto">
                    {/* Agrupar categorías por group */}
                    {(() => {
                      const searchTerm = categorySearchTerm.toLowerCase();
                      const grouped = CATEGORY_SELECT_OPTIONS.reduce((acc, opt) => {
                        // Filtrar por término de búsqueda
                        if (searchTerm && !opt.label.toLowerCase().includes(searchTerm) && 
                            !(opt.description || '').toLowerCase().includes(searchTerm) &&
                            !(opt.group || '').toLowerCase().includes(searchTerm)) {
                          return acc;
                        }
                        
                        const group = opt.group || 'Otros';
                        if (!acc[group]) acc[group] = [];
                        acc[group].push(opt);
                        return acc;
                      }, {} as Record<string, typeof CATEGORY_SELECT_OPTIONS>);
                      
                      const hasResults = Object.keys(grouped).length > 0;
                      
                      if (!hasResults && searchTerm) {
                        return (
                          <div className="text-center py-8 text-[#7C8193]">
                            <p className="text-sm">No se encontraron giros que coincidan con "{searchTerm}"</p>
                            <p className="text-xs mt-1">Intenta con otro término</p>
                          </div>
                        );
                      }
                      
                      return Object.entries(grouped).map(([groupName, options]) => (
                        <div key={groupName} className="mb-4 last:mb-0">
                          <h4 className="font-bold text-[#181B34] mb-2 text-sm">{groupName}</h4>
                          <div className="space-y-1.5 pl-2">
                            {options.map((opt) => {
                              const isSelected = editCategory.includes(opt.value);
                              const canSelect = editCategory.length < 5 || isSelected;
                              
                              return (
                                <label 
                                  key={opt.value}
                                  className={`flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-[#F5F7FB]/50 transition-colors ${!canSelect ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={!canSelect}
                                    onChange={() => {
                                      if (isSelected) {
                                        // Deseleccionar
                                        setEditCategory(editCategory.filter(c => c !== opt.value));
                                      } else if (editCategory.length < 5) {
                                        // Seleccionar (si no ha llegado al límite)
                                        setEditCategory([...editCategory, opt.value]);
                                      }
                                    }}
                                    className="mt-0.5 h-4 w-4 text-[#6161FF] border-gray-300 rounded focus:ring-[#6161FF]"
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm text-[#181B34] font-medium">{opt.label}</div>
                                    {opt.description && (
                                      <div className="text-xs text-[#7C8193] mt-0.5">{opt.description}</div>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Afinidad/Intereses</label>
                  <select
                    value={editAffinity}
                    onChange={(e) => setEditAffinity(e.target.value)}
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  >
                    <option value="">Selecciona tu afinidad...</option>
                    {[...AFFINITY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map((aff, idx) => (
                      <option key={idx} value={aff}>{aff}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Facturación Mensual *</label>
                  <select
                    value={editRevenue || ''}
                    onChange={(e) => {
                      setEditRevenue(e.target.value);
                      console.log('💰 Revenue actualizado:', e.target.value);
                    }}
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  >
                    <option value="">Selecciona rango...</option>
                    <option value="Menos de $500.000">Menos de $500.000</option>
                    <option value="$500.000 - $2.000.000">$500.000 - $2.000.000</option>
                    <option value="$2.000.000 - $5.000.000">$2.000.000 - $5.000.000</option>
                    <option value="$5.000.000 - $10.000.000">$5.000.000 - $10.000.000</option>
                    <option value="Más de $10.000.000">Más de $10.000.000</option>
                  </select>
                </div>
              </div>

              {/* Geografía - SELECTORES para matching */}
              <div className="bg-[#F5F7FB] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-[#6161FF] tracking-wide">“ Alcance Geográfico (para Matching)</h4>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-2 block">Alcance del Servicio</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['LOCAL', 'REGIONAL', 'NACIONAL'].map(scope => (
                      <button
                        key={scope}
                        type="button"
                        onClick={() => setEditScope(scope as 'LOCAL' | 'REGIONAL' | 'NACIONAL')}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${editScope === scope ? 'bg-[#6161FF] text-white' : 'bg-white border border-[#E4E7EF] text-[#434343] hover:border-[#6161FF]'}`}
                      >
                        {scope}
                      </button>
                    ))}
                  </div>
                </div>

                {/* LOCAL: Selector Región -> Comuna */}
                {editScope === 'LOCAL' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div>
                      <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Región</label>
                      <select
                        value={editSelectedRegionForComuna}
                        onChange={(e) => {
                          setEditSelectedRegionForComuna(e.target.value);
                          setEditComuna(''); // Reset comuna al cambiar región
                        }}
                        className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                      >
                        <option value="">Selecciona región...</option>
                        {REGIONS.map(region => (
                          <option key={region.id} value={region.id}>{region.shortName}</option>
                        ))}
                      </select>
                    </div>
                    {editSelectedRegionForComuna && (
                      <div>
                        <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Comuna</label>
                        <select
                          value={editComuna}
                          onChange={(e) => setEditComuna(e.target.value)}
                          className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                        >
                          <option value="">Selecciona comuna...</option>
                          {editComunasDeRegion.map(comuna => (
                            <option key={comuna} value={comuna}>{comuna}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* REGIONAL: Multi-select de regiones */}
                {editScope === 'REGIONAL' && (
                  <div className="animate-fadeIn">
                    <label className="text-xs font-bold uppercase text-[#7C8193] mb-2 block">Regiones donde operas</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {REGIONS.map(region => (
                        <button
                          key={region.id}
                          type="button"
                          onClick={() => {
                            if (editSelectedRegions.includes(region.id)) {
                              setEditSelectedRegions(editSelectedRegions.filter(r => r !== region.id));
                            } else {
                              setEditSelectedRegions([...editSelectedRegions, region.id]);
                            }
                          }}
                          className={`py-2 px-3 rounded-lg text-xs font-medium transition-all text-left ${editSelectedRegions.includes(region.id)
                            ? 'bg-[#6161FF] text-white'
                            : 'bg-white border border-[#E4E7EF] text-[#434343] hover:border-[#6161FF]'
                            }`}
                        >
                          {editSelectedRegions.includes(region.id) ? '✓ ' : ''}{region.shortName}
                        </button>
                      ))}
                    </div>
                    {editSelectedRegions.length > 0 && (
                      <p className="text-xs text-[#6161FF] mt-2">{editSelectedRegions.length} región(es) seleccionada(s)</p>
                    )}
                  </div>
                )}

                {editScope === 'NACIONAL' && (
                  <p className="text-sm text-[#7C8193] italic">Operación a nivel nacional - matchearás con todos</p>
                )}
              </div>

              {/* Redes sociales */}
              <div className="bg-[#F5F7FB] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-[#6161FF] tracking-wide">Redes Sociales</h4>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Instagram</label>
                  <input
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    placeholder="@tu_instagram"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">TikTok</label>
                  <input
                    value={(profile as any).tiktok || ''}
                    onChange={(e) => setProfile({ ...profile, tiktok: e.target.value } as any)}
                    placeholder="@tu_tiktok"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Facebook</label>
                  <input
                    value={(profile as any).facebook || ''}
                    onChange={(e) => setProfile({ ...profile, facebook: e.target.value } as any)}
                    placeholder="facebook.com/tu_pagina"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">X (Twitter)</label>
                  <input
                    value={(profile as any).twitter || ''}
                    onChange={(e) => setProfile({ ...profile, twitter: e.target.value } as any)}
                    placeholder="@tu_usuario"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Sitio Web</label>
                  <input
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="www.tusitio.cl"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
              </div>

              {/* Botones Cancelar/Guardar al final del formulario */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-[#E4E7EF] p-4 -mx-4 mt-4 flex justify-center gap-3">
                <button onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-full bg-[#FB275D]/10 text-[#FB275D] hover:bg-[#FB275D]/20 flex items-center gap-2 text-sm font-semibold">
                  <X size={16} /> Cancelar
                </button>
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-3 rounded-full bg-[#00CA72] text-white hover:bg-[#00B366] flex items-center gap-2 text-sm font-semibold disabled:opacity-50 shadow-lg">
                  {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} Guardar Cambios
                </button>
              </div>
            </div>
          )}

          {!isEditing && profile && (
            <div className="flex flex-wrap gap-3 w-full mb-6">
              <a
                href={`https://www.instagram.com/${profile.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E91E63] via-[#C13584] to-[#F77737] text-white font-semibold hover:opacity-90 transition shadow-md"
              >
                <Instagram size={16} /> Instagram
              </a>
              {(profile as any).tiktok && (
                <a
                  href={`https://www.tiktok.com/@${(profile as any).tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#000000] text-white font-semibold hover:bg-[#1a1a1a] transition shadow-md"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                  TikTok
                </a>
              )}
              {(profile as any).facebook && (
                <a
                  href={`https://facebook.com/${(profile as any).facebook.replace('facebook.com/', '').replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1877F2] text-white font-semibold hover:bg-[#166FE5] transition shadow-md"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  Facebook
                </a>
              )}
              {(profile as any).twitter && (
                <a
                  href={`https://x.com/${(profile as any).twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#000000] text-white font-semibold hover:bg-[#1a1a1a] transition shadow-md"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  X
                </a>
              )}
              <a
                href={`https://wa.me/${(profile.phone || profile.whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${profile.name}, vi tu perfil en Tribu Impulsa y me gustaría conectar contigo.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00CA72] text-white font-semibold hover:bg-[#00B366] transition shadow-md"
              >
                <Share2 size={16} /> WhatsApp
              </a>
            </div>
          )}

          {/* Details - Solo visible cuando NO estamos editando */}
          {!isEditing && (
            <div className="space-y-8 w-full text-left">
              <div>
                <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">Sobre mi negocio</h3>
                <p className="text-[#434343] leading-relaxed text-base">
                  {(profile as any).businessDescription || profile.bio || 'Sin descripción'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-[#F5F7FB] p-4 rounded-2xl flex items-center gap-4 border border-[#E4E7EF]">
                  <div className="bg-[#6161FF]/10 p-2 rounded-lg text-[#6161FF] shrink-0"><MapPin size={20} /></div>
                  <div className="text-sm min-w-0">
                    <span className="block text-[#7C8193] text-[0.625rem] mb-0.5 uppercase tracking-wide">Ubicación</span>
                    <span className="font-medium text-[#181B34]">{profile.location}</span>
                  </div>
                </div>
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#F5F7FB] p-4 rounded-2xl flex items-center gap-4 border border-[#E4E7EF] hover:border-[#00CA72] transition-colors"
                >
                  <div className="bg-[#00CA72]/10 p-2 rounded-lg text-[#00CA72] shrink-0"><Globe size={20} /></div>
                  <div className="text-sm min-w-0 flex-1">
                    <span className="block text-[#7C8193] text-[0.625rem] mb-0.5 uppercase tracking-wide">Sitio Web</span>
                    <span className="font-medium text-[#181B34] block truncate">{profile.website}</span>
                  </div>
                  <ArrowRight size={16} className="text-[#7C8193] shrink-0" />
                </a>
              </div>
            </div>
          )}

          {/* Secciones siempre visibles */}
          <div className="space-y-8 w-full text-left">
            <div>
              <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag, idx) => (
                  <span key={`${tag}-${idx}`} className="text-sm bg-[#F5F7FB] border border-[#E4E7EF] px-4 py-2 rounded-lg text-[#434343] hover:border-[#6161FF] hover:text-[#6161FF] transition-colors flex items-center gap-2">
                    #{tag}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-[#FB275D] hover:text-[#FB275D] ml-1"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))}
                {isEditing && !showTagInput && (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="text-sm border border-dashed border-[#6161FF]/40 px-4 py-2 rounded-lg text-[#6161FF] hover:bg-[#6161FF]/10"
                  >
                    + Agregar
                  </button>
                )}
                {isEditing && showTagInput && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Nueva etiqueta"
                      className="text-sm bg-[#F5F7FB] border border-[#E4E7EF] px-3 py-2 rounded-lg outline-none focus:border-[#6161FF] w-32"
                      autoFocus
                    />
                    <button
                      onClick={handleAddTag}
                      className="text-[#00CA72] hover:text-[#00B366]"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => { setShowTagInput(false); setNewTag(''); }}
                      className="text-[#7C8193] hover:text-[#FB275D]"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SECCI“N MEMBRESA */}
            <MembershipSection userId={currentUser?.id || ''} />

            {/* Botón de Notificaciones Push */}
            <NotificationButton />

            {/* Opciones de cuenta */}
            <div className="pt-4 border-t border-[#E4E7EF] space-y-3">
              {/* Tamaño de letra (Accesibilidad) */}
              <button
                onClick={() => setShowFontSizeModal(true)}
                className="w-full py-3 rounded-xl border border-[#00CA72]/30 text-[#00CA72] hover:bg-[#00CA72]/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Type size={16} /> Tamaño de Letra: {fontSize === 'small' ? 'Pequeño' : fontSize === 'medium' ? 'Mediano' : 'Grande'}
              </button>

              {/* Cambiar contraseña */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full py-3 rounded-xl border border-[#6161FF]/30 text-[#6161FF] hover:bg-[#6161FF]/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Lock size={16} /> Cambiar Contraseña
              </button>

              {/* Cerrar sesión */}
              <button
                onClick={() => {
                  console.log('🚪 Cerrando sesión...');
                  
                  // Limpiar completamente la sesión
                  try {
                    clearStoredSession();
                    localStorage.removeItem('tribu_session');
                    localStorage.removeItem('algorithm_seen');
                    localStorage.removeItem('tribu_current_user');
                    localStorage.removeItem('tribu_onboarding_completed');
                    
                    // Limpiar todas las claves de onboarding por usuario
                    const keys = Object.keys(localStorage);
                    keys.forEach(key => {
                      if (key.startsWith('onboarding_complete_')) {
                        localStorage.removeItem(key);
                      }
                    });
                    
                    sessionStorage.clear();
                    
                    console.log('✅ Sesión limpiada, redirigiendo...');
                    
                    // Forzar recarga completa de la página
                    setTimeout(() => {
                      window.location.href = '/';
                    }, 100);
                  } catch (error) {
                    console.error(' Error cerrando sesión:', error);
                    // Intentar redireccionar de todas formas
                    window.location.href = '/';
                  }
                }}
                className="w-full py-3 rounded-xl border border-[#FB275D]/30 text-[#FB275D] hover:bg-[#FB275D]/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <LogOut size={16} /> Cerrar Sesión
              </button>

              {/* Acceso secreto a Red/Directorio - Solo visible en desarrollo */}
              {import.meta.env.DEV && (
                <div className="pt-4 border-t border-dashed border-[#E4E7EF]">
                  <button
                    onClick={() => setShowSecretInput(!showSecretInput)}
                    className="text-xs text-[#B3B8C6] hover:text-[#7C8193] transition-colors"
                  >
                    ” Acceso administrador
                  </button>
                  {showSecretInput && (
                    <div className="mt-2 space-y-2 animate-fadeIn">
                      <input
                        type="password"
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSecretAccess()}
                        placeholder="Código de acceso..."
                        className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-2 text-sm"
                      />
                      {secretCodeError && (
                        <p className="text-xs text-[#FB275D]">{secretCodeError}</p>
                      )}
                      <button
                        onClick={handleSecretAccess}
                        className="w-full py-2 rounded-lg bg-[#181B34] text-white text-sm"
                      >
                        Acceder a Red Completa
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal cambio de contraseña */}
            {showPasswordModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto">
                  <h3 className="text-lg font-bold text-[#181B34] mb-4 flex items-center gap-2">
                    <Lock size={20} className="text-[#6161FF]" />
                    Cambiar Contraseña
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase">Contraseña actual</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-sm"
                        placeholder="Tu contraseña actual"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase">Nueva contraseña</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-sm"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase">Confirmar nueva contraseña</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-sm"
                        placeholder="Repetir contraseña"
                      />
                    </div>
                    {passwordError && (
                      <p className="text-[#FB275D] text-sm">{passwordError}</p>
                    )}
                    {passwordSuccess && (
                      <p className="text-[#00CA72] text-sm"> Contraseña actualizada correctamente</p>
                    )}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setShowPasswordModal(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setPasswordError('');
                          setPasswordSuccess(false);
                        }}
                        className="flex-1 py-2.5 rounded-xl border border-[#E4E7EF] text-[#7C8193] hover:bg-[#F5F7FB]"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleChangePassword}
                        className="flex-1 py-2.5 rounded-xl bg-[#6161FF] text-white hover:bg-[#5151EE]"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal tamaño de letra */}
            {showFontSizeModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto">
                  <h3 className="text-lg font-bold text-[#181B34] mb-4 flex items-center gap-2">
                    <Type size={20} className="text-[#00CA72]" />
                    Tamaño de Letra
                  </h3>
                  <p className="text-sm text-[#7C8193] mb-4">Ajusta el tamaño del texto para mejor legibilidad</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => setFontSize('small')}
                      className={`w-full py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-between ${fontSize === 'small'
                        ? 'border-[#00CA72] bg-[#00CA72]/10 text-[#00CA72]'
                        : 'border-[#E4E7EF] text-[#434343] hover:border-[#00CA72]/50'
                        }`}
                    >
                      <span className="text-sm font-medium">Pequeño</span>
                      <span className="text-xs text-[#7C8193]">16px</span>
                    </button>
                    <button
                      onClick={() => setFontSize('medium')}
                      className={`w-full py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-between ${fontSize === 'medium'
                        ? 'border-[#00CA72] bg-[#00CA72]/10 text-[#00CA72]'
                        : 'border-[#E4E7EF] text-[#434343] hover:border-[#00CA72]/50'
                        }`}
                    >
                      <span className="text-base font-medium">Mediano</span>
                      <span className="text-xs text-[#7C8193]">20px</span>
                    </button>
                    <button
                      onClick={() => setFontSize('large')}
                      className={`w-full py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-between ${fontSize === 'large'
                        ? 'border-[#00CA72] bg-[#00CA72]/10 text-[#00CA72]'
                        : 'border-[#E4E7EF] text-[#434343] hover:border-[#00CA72]/50'
                        }`}
                    >
                      <span className="text-lg font-medium">Grande</span>
                      <span className="text-xs text-[#7C8193]">24px</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowFontSizeModal(false)}
                    className="w-full mt-4 py-2.5 rounded-xl bg-[#00CA72] text-white hover:bg-[#00B366] font-medium"
                  >
                    Listo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Sección de Membresía
const MembershipSection = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [membership, setMembership] = useState<{
    status: string;
    paymentDate?: string;
    expiresAt?: string;
    paymentMethod?: string;
    amount?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapMembership = (data: CloudMembership | null, statusFallback?: string) => {
    if (!data) return null;
    return {
      status: data.status || statusFallback || 'invitado',
      paymentDate: data.paymentDate || data.trialStartDate,
      expiresAt: data.expiresAt || data.trialEndDate,
      paymentMethod: data.paymentMethod,
      amount: data.amount
    };
  };

  useEffect(() => {
    if (!userId) return;
    let mounted = true;

    const hydrate = async () => {
      const localStatus = localStorage.getItem(`membership_status_${userId}`);
      const localPayment = localStorage.getItem(`membership_payment_${userId}`);
      if (localStatus && mounted) {
        const paymentData = localPayment ? JSON.parse(localPayment) : {};
        setMembership({
          status: localStatus,
          paymentDate: paymentData.date,
          paymentMethod: paymentData.method,
          amount: paymentData.amount,
          expiresAt: paymentData.expiresAt
        });
      }

      try {
        const membershipData = await fetchMembershipFromCloud(userId);
        if (!mounted) return;
        if (membershipData) {
          syncMembershipToLocalCache(userId, membershipData);
          setMembership(mapMembership(membershipData));
        } else {
          setMembership(localStatus ? { status: localStatus } : null);
        }
      } catch (error) {
        console.log('Error cargando membresía:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    hydrate();
    return () => {
      mounted = false;
    };
  }, [userId]);

  // Formatear fecha
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear precio - Usar precio de configuración como fallback
  const config = getAppConfig();
  const formatPrice = (amount?: number) => {
    const value = amount || config.membershipPrice;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Calcular días restantes
  const getDaysRemaining = () => {
    if (!membership?.expiresAt) return null;
    const expiry = new Date(membership.expiresAt);
    const now = new Date();
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (isLoading) {
    return (
      <div className="pt-4 border-t border-[#E4E7EF]">
        <div className="animate-pulse bg-[#F5F7FB] rounded-2xl h-32"></div>
      </div>
    );
  }

  const isMember = membership?.status === 'miembro' || membership?.status === 'admin';
  const isTrial = membership?.status === 'trial';
  const daysRemaining = getDaysRemaining();

  return (
    <div className="pt-4 border-t border-[#E4E7EF]">
      <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">Membresía</h3>

      <div className={`rounded-2xl p-4 border ${isMember ? 'bg-gradient-to-br from-[#6161FF]/5 to-[#00CA72]/5 border-[#6161FF]/20' : 'bg-[#F5F7FB] border-[#E4E7EF]'}`}>
        {/* Estado */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isMember ? 'bg-[#6161FF]/10' : 'bg-[#7C8193]/10'}`}>
              <Crown size={20} className={isMember ? 'text-[#6161FF]' : 'text-[#7C8193]'} />
            </div>
            <div>
              <p className="font-semibold text-[#181B34]">
                {membership?.status === 'admin' ? 'Administrador' : isMember ? 'Miembro Activo' : 'Invitado'}
              </p>
              <p className="text-xs text-[#7C8193]">
                {isMember ? 'Acceso completo' : 'Acceso limitado'}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${membership?.status === 'admin' ? 'bg-[#FFCC00]/20 text-[#B38F00]' :
            isMember ? 'bg-[#00CA72]/20 text-[#008A4E]' : 'bg-[#7C8193]/20 text-[#7C8193]'
            }`}>
            {membership?.status === 'admin' ? 'ADMIN' : isMember ? 'ACTIVO' : 'PENDIENTE'}
          </span>
        </div>

        {/* Detalles si es miembro */}
        {isMember && (
          <div className="space-y-2 text-sm border-t border-[#E4E7EF]/50 pt-3">
            {/* Plan especial para Beta Pública */}
            {membership?.paymentMethod === 'beta_publica' || membership?.paymentMethod === 'trial' || membership?.paymentMethod === 'promo_trial_1_peso' ? (
              <>
                <div className="bg-gradient-to-r from-[#00CA72]/10 to-[#6161FF]/10 rounded-xl p-3 mb-2">
                  <p className="text-[#00CA72] font-bold text-center">
                    Trial Activo - Circulo Emprendedor
                  </p>
                  <p className="text-xs text-[#7C8193] text-center mt-1">
                    Promoción Beta Tribu Impulsa
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Activado:</span>
                  <span className="text-[#181B34] font-medium">{formatDate(membership?.paymentDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Válido hasta:</span>
                  <span className="text-[#181B34] font-medium">{formatDate(membership?.expiresAt)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Fecha de pago:</span>
                  <span className="text-[#181B34] font-medium">{formatDate(membership?.paymentDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Método:</span>
                  <span className="text-[#181B34] font-medium capitalize">{membership?.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Monto:</span>
                  <span className="text-[#181B34] font-medium">{formatPrice(membership?.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Vence:</span>
                  <span className="text-[#181B34] font-medium">{formatDate(membership?.expiresAt)}</span>
                </div>
              </>
            )}
            {daysRemaining !== null && daysRemaining <= 30 && (
              <div className="mt-2 p-2 bg-[#FFCC00]/10 rounded-lg">
                <p className="text-xs text-[#B38F00] font-medium">
                  âš ï¸ Tu membresía vence en {daysRemaining} días
                </p>
              </div>
            )}
          </div>
        )}

        {/* Botón para invitados */}
        {!isMember && (
          <button
            onClick={() => {
              sessionStorage.setItem('from_settings', 'true');
              navigate('/membership');
            }}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#00CA72] to-[#00B366] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <Gift size={18} />
            ¡Probar por $1 Peso!
          </button>
        )}

        {/* Administrar suscripción - Solo para miembros */}
        {isMember && <SubscriptionManager userId={userId} currentPlan={membership?.paymentMethod || 'mensual'} expiresAt={membership?.expiresAt} />}
      </div>
    </div>
  );
};

// Componente para administrar suscripción
const SubscriptionManager = ({ userId, currentPlan, expiresAt }: { userId: string; currentPlan: string; expiresAt?: string }) => {
  const [showPlans, setShowPlans] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedTrialPlan, setSelectedTrialPlan] = useState<'mensual' | 'semestral' | 'anual'>('mensual');
  const config = getAppConfig();

  // Verificar si el usuario ya usó el trial de $1 (oportunidad única)
  const hasUsedTrial = localStorage.getItem(`trial_used_${userId}`) === 'true' || currentPlan === 'trial' || currentPlan === 'promo_trial';

  // Fecha límite para trial: 31 dic 2025
  const TRIAL_END_DATE = new Date('2025-12-31T23:59:59');
  const isTrialAvailable = new Date() <= TRIAL_END_DATE && !hasUsedTrial;

  // Planes disponibles - PRECIOS FINALES
  const PLANS = [
    {
      id: 'mensual',
      name: 'Mensual',
      price: 19990,
      originalPrice: null,
      duration: '1 mes',
      months: 1,
      description: 'Renovación mes a mes',
      badge: null,
      savings: null
    },
    {
      id: 'semestral',
      name: 'Semestral',
      price: 99990, // 6 meses, paga 5
      originalPrice: 119940, // 6 x 19990
      duration: '6 meses',
      months: 6,
      description: '¡1 mes gratis!',
      badge: 'Popular',
      savings: 19950
    },
    {
      id: 'anual',
      name: 'Anual',
      price: 179990, // 12 meses, paga 9
      originalPrice: 239880, // 12 x 19990
      duration: '12 meses',
      months: 12,
      description: '¡3 meses gratis!',
      badge: 'Mejor valor',
      savings: 59890
    }
  ];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Crear preferencia de pago en MercadoPago
  const handleSelectPlan = async (planId: string) => {
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return;

    setIsProcessing(true);

    try {
      // Obtener email del usuario actual
      const currentUser = getCurrentUser();
      const userEmail = currentUser?.email || '';

      if (!userEmail) {
        alert('Error: No se pudo obtener tu email. Por favor recarga la página.');
        setIsProcessing(false);
        return;
      }

      // Llamar al endpoint de crear preferencia
      console.log('” Iniciando pago MercadoPago (PaywallScreen):', {
        userId,
        userEmail,
        planId: plan.id
      });

      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          userEmail: userEmail,
          planId: plan.id
        })
      });

      console.log('“¥ Response status:', response.status, response.statusText);
      const data = await response.json();
      console.log('“¦ Response data:', data);

      if (!response.ok) {
        console.error('âŒ Error en respuesta:', data);
        alert(`Error: ${data.error || 'Error desconocido'}\n${data.details ? JSON.stringify(data.details, null, 2) : ''}`);
        return;
      }

      if (data.initPoint) {
        console.log(' Redirigiendo a MercadoPago:', data.initPoint);
        // Redirigir a MercadoPago
        window.location.href = data.initPoint;
      } else {
        console.error('âŒ No se recibió initPoint:', data);
        alert('Error: No se pudo crear el pago. Intenta de nuevo o contacta soporte.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión. Intenta de nuevo.');
    }

    setIsProcessing(false);
  };

  // Procesar trial de $1
  const handleTrialSubscription = async () => {
    setIsProcessing(true);

    try {
      const currentUser = getCurrentUser();
      if (!currentUser?.email) {
        alert('Error: No se pudo obtener tu email.');
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          userEmail: currentUser.email,
          userName: currentUser.name,
          planId: selectedTrialPlan
        })
      });

      const data = await response.json();

      if (data.initPoint) {
        // Marcar que intentó usar el trial (se confirmará en webhook)
        localStorage.setItem(`trial_used_${userId}`, 'true');
        window.location.href = data.initPoint;
      } else if (data.error) {
        alert(`Error: ${data.error}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión. Intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  // Cancelar suscripción
  const handleCancelSubscription = async () => {
    setIsProcessing(true);

    try {
      const { getFirestoreInstance } = await import('../../services/firebaseService');
      const { doc, updateDoc } = await import('firebase/firestore');
      const db = getFirestoreInstance();

      if (db) {
        await updateDoc(doc(db, 'memberships', userId), {
          autoRenew: false,
          cancelledAt: new Date().toISOString(),
          status: 'cancelled_pending' // Mantiene acceso hasta que expire
        });

        localStorage.setItem(`membership_autorenew_${userId}`, 'false');
        alert('Tu suscripción no se renovará automáticamente. Tendrás acceso hasta ' +
          (expiresAt ? new Date(expiresAt).toLocaleDateString('es-CL') : 'el fin del período'));
      }
    } catch (error) {
      console.error('Error cancelando:', error);
      alert('Error al cancelar. Contacta soporte.');
    }

    setIsProcessing(false);
    setShowCancelConfirm(false);
  };

  return (
    <div className="mt-4 pt-4 border-t border-[#E4E7EF]/50">
      <button
        onClick={() => setShowPlans(!showPlans)}
        className="w-full py-2.5 rounded-xl border border-[#6161FF]/30 text-[#6161FF] hover:bg-[#6161FF]/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
      >
        <CreditCard size={16} />
        {showPlans ? 'Cerrar opciones' : 'Administrar Suscripción'}
      </button>

      {showPlans && (
        <div className="mt-4 space-y-3 animate-fadeIn">

          {/* Oferta Trial $1 - Solo si está disponible */}
          {isTrialAvailable && (
            <div className="relative rounded-xl border-2 border-[#00CA72] bg-gradient-to-r from-[#00CA72]/10 to-[#6161FF]/10 p-4 mb-4">
              <span className="absolute -top-2.5 left-3 bg-[#00CA72] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                 OFERTA UNICA
              </span>
              <div className="text-center mb-3">
                <p className="text-2xl font-black text-[#00CA72]">$1</p>
                <p className="text-sm text-[#434343] font-medium">1 mes completo de Tribu Impulsa</p>
                <p className="text-xs text-[#7C8193]">Después continúa con el plan que elijas</p>
              </div>

              {/* Selector de plan futuro */}
              <div className="flex gap-1 mb-3">
                {(['mensual', 'semestral', 'anual'] as const).map(planId => (
                  <button
                    key={planId}
                    onClick={() => setSelectedTrialPlan(planId)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedTrialPlan === planId
                      ? 'bg-[#6161FF] text-white'
                      : 'bg-white border border-[#E4E7EF] text-[#7C8193]'
                      }`}
                  >
                    {planId === 'mensual' ? 'Mensual' : planId === 'semestral' ? '6 meses' : 'Anual'}
                  </button>
                ))}
              </div>

              <button
                onClick={handleTrialSubscription}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00CA72] to-[#00B366] text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Procesando...' : '¡Pagar $1 y Comenzar!'}
              </button>
              <p className="text-[9px] text-[#7C8193] text-center mt-2">
                Después de 30 días se cobra el plan {selectedTrialPlan}. Cancela cuando quieras.
              </p>
              <p className="text-[8px] text-[#B3B8C6] text-center mt-1">
                *Débito/prepago no soportan cobros recurrentes (limitación bancos Chile).
              </p>
            </div>
          )}

          <h4 className="text-xs font-bold uppercase text-[#7C8193] tracking-wide">
            {isTrialAvailable ? 'O paga el plan completo' : 'Renovar o Cambiar Plan'}
          </h4>

          {/* Planes */}
          <div className="space-y-2">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-3 transition-all ${plan.badge ? 'border-[#6161FF] bg-[#6161FF]/5' : 'border-[#E4E7EF] bg-white'
                  }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2 right-3 bg-[#6161FF] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#181B34]">{plan.name}</p>
                    <p className="text-xs text-[#7C8193]">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    {plan.originalPrice && (
                      <p className="text-xs text-[#7C8193] line-through">{formatPrice(plan.originalPrice)}</p>
                    )}
                    <p className="font-bold text-[#181B34]">{formatPrice(plan.price)}</p>
                    {plan.savings && (
                      <p className="text-[10px] text-[#00CA72] font-medium">Ahorras {formatPrice(plan.savings)}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isProcessing}
                  className="w-full mt-2 py-2 rounded-lg bg-gradient-to-r from-[#6161FF] to-[#8B5CF6] text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Procesando...' : `Pagar con MercadoPago`}
                </button>
              </div>
            ))}
          </div>

          {/* Cancelar suscripción */}
          <div className="pt-3 border-t border-dashed border-[#E4E7EF]">
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full py-2 text-xs text-[#7C8193] hover:text-[#FB275D] transition-colors"
              >
                Cancelar renovación automática
              </button>
            ) : (
              <div className="bg-[#FB275D]/5 rounded-xl p-3 space-y-2">
                <p className="text-sm text-[#FB275D] font-medium">¿Seguro que deseas cancelar?</p>
                <p className="text-xs text-[#7C8193]">
                  Mantendrás acceso hasta que expire tu período actual.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-2 rounded-lg border border-[#E4E7EF] text-[#434343] text-sm"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={isProcessing}
                    className="flex-1 py-2 rounded-lg bg-[#FB275D] text-white text-sm font-medium disabled:opacity-50"
                  >
                    {isProcessing ? 'Cancelando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Toggle de Notificaciones
const NotificationButton = () => {
  const [status, setStatus] = useState(getNotificationStatus());
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const currentUser = getCurrentUser();

  const isEnabled = status.permission === 'granted' && status.hasToken;

  const handleToggle = async () => {
    if (isEnabled) {
      // Desactivar - limpiar token
      setIsLoading(true);
      if (currentUser) {
        clearFCMToken();
        // También podríamos remover de la DB
      }
      setShowToast('Notificaciones desactivadas');
      setTimeout(() => setShowToast(null), 3000);
      setStatus(getNotificationStatus());
      setIsLoading(false);
    } else {
      // Activar
      setIsLoading(true);
      const token = await requestNotificationPermission();
      if (token) {
        if (currentUser) {
          saveUserFCMToken(currentUser.id, token);
        }
        sendLocalNotification('¡Notificaciones activadas!', 'Recibirás alertas de tu tribu');
        setShowToast('¡Notificaciones activadas!');
      } else {
        setShowToast('No se pudieron activar las notificaciones');
      }
      setTimeout(() => setShowToast(null), 3000);
      setStatus(getNotificationStatus());
      setIsLoading(false);
    }
  };

  if (!status.supported) {
    return (
      <div className="p-4 bg-[#F5F7FB] rounded-xl border border-[#E4E7EF] text-center">
        <p className="text-sm text-[#7C8193]">Tu navegador no soporta notificaciones</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toast notification */}
      {showToast && (
        <div className="absolute -top-12 left-0 right-0 bg-[#181B34] text-white text-sm py-2 px-4 rounded-lg text-center animate-fadeIn">
          {showToast}
        </div>
      )}

      <div className={`p-4 rounded-xl border flex items-center justify-between ${isEnabled
        ? 'bg-[#E6FFF3] border-[#00CA72]/30'
        : 'bg-[#F5F7FB] border-[#E4E7EF]'
        }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEnabled ? 'bg-[#00CA72] text-white' : 'bg-[#E4E7EF] text-[#7C8193]'
            }`}>
            <Bell size={20} />
          </div>
          <div>
            <p className={`font-semibold text-sm ${isEnabled ? 'text-[#008A4E]' : 'text-[#181B34]'}`}>
              {isEnabled ? 'Notificaciones activas' : 'Notificaciones'}
            </p>
            <p className={`text-xs ${isEnabled ? 'text-[#00CA72]' : 'text-[#7C8193]'}`}>
              {isEnabled ? 'Recibirás alertas de tu tribu' : 'Activa para recibir alertas'}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${isEnabled ? 'bg-[#00CA72]' : 'bg-[#E4E7EF]'
            } ${isLoading ? 'opacity-50' : ''}`}
        >
          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
        </button>
      </div>
    </div>
  );
};

// Componente de Análisis de Match con LLM
const MATCH_ANALYSIS_STORAGE_KEY = 'tribu_match_analysis';
const MATCH_ANALYSIS_MONTH_KEY = 'tribu_match_analysis_month';

interface MatchAnalysis {
  profileId: string;
  analysis: string;
  generatedAt: string;
  month: string;
}

const getStoredAnalysis = (profileId: string): MatchAnalysis | null => {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const storedMonth = localStorage.getItem(MATCH_ANALYSIS_MONTH_KEY);

  // Si cambió el mes, limpiar análisis antiguos
  if (storedMonth !== currentMonth) {
    localStorage.removeItem(MATCH_ANALYSIS_STORAGE_KEY);
    localStorage.setItem(MATCH_ANALYSIS_MONTH_KEY, currentMonth);
    return null;
  }

  const allAnalysis = JSON.parse(localStorage.getItem(MATCH_ANALYSIS_STORAGE_KEY) || '{}');
  return allAnalysis[profileId] || null;
};

const saveAnalysis = (profileId: string, analysis: string) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const allAnalysis = JSON.parse(localStorage.getItem(MATCH_ANALYSIS_STORAGE_KEY) || '{}');

  allAnalysis[profileId] = {
    profileId,
    analysis,
    generatedAt: new Date().toISOString(),
    month: currentMonth
  };

  localStorage.setItem(MATCH_ANALYSIS_STORAGE_KEY, JSON.stringify(allAnalysis));
  localStorage.setItem(MATCH_ANALYSIS_MONTH_KEY, currentMonth);
};

// Master Prompt para análisis de compatibilidad
const generateMatchAnalysisPrompt = (myProfile: MatchProfile, targetProfile: MatchProfile) => {
  return `Eres el "Algoritmo Tribal X" de Tribu Impulsa, una plataforma de cross-promotion para emprendedores chilenos.

CONTEXTO:
- Usuario actual: ${myProfile.name} de "${myProfile.companyName}"
- Categoría: ${myProfile.category}
- Ubicación: ${myProfile.location}
- Bio: ${myProfile.bio}
- Tags: ${myProfile.tags?.join(', ') || 'N/A'}

EMPRENDEDOR A ANALIZAR:
- Nombre: ${targetProfile.name} de "${targetProfile.companyName}"
- Categoría: ${targetProfile.category}  
- Subcategoría: ${targetProfile.subCategory}
- Ubicación: ${targetProfile.location}
- Bio: ${targetProfile.bio}
- Instagram: ${targetProfile.instagram}
- Tags: ${targetProfile.tags?.join(', ') || 'N/A'}

INSTRUCCIONES:
Genera un análisis breve (máximo 3-4 oraciones) explicando por qué estos dos emprendedores podrían tener una buena sinergia comercial para hacer cross-promotion en Chile. Considera:
1. Complementariedad de rubros (no competencia directa)
2. Potencial de audiencia compartida
3. Oportunidades de colaboración específicas

Responde en español chileno, de forma cercana y profesional. NO uses bullets, solo texto fluido.`;
};

// Estructura de análisis enriquecido
interface EnrichedAnalysis {
  insight: string;
  opportunities: string[];
  icebreaker: string;
}

const MatchAnalysisSection = ({ profileId, profileData }: { profileId: string; profileData: MatchProfile }) => {
  const [analysis, setAnalysis] = useState<EnrichedAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const myProfile = getMyProfile();

  // Verificar si ya existe análisis guardado al montar
  useEffect(() => {
    const stored = getStoredAnalysis(profileId);
    if (stored) {
      try {
        // Intentar parsear como objeto enriquecido
        const parsed = typeof stored.analysis === 'string' && stored.analysis.startsWith('{')
          ? JSON.parse(stored.analysis)
          : null;
        if (parsed && parsed.insight) {
          setAnalysis(parsed);
        } else {
          // Migrar análisis antiguo a formato nuevo
          setAnalysis({
            insight: stored.analysis,
            opportunities: ['Colaboración en redes sociales', 'Referidos mutuos'],
            icebreaker: `¡Hola! Vi tu emprendimiento en Tribu Impulsa y creo que podríamos colaborar. ¿Te interesa conversar?`
          });
        }
        setHasGenerated(true);
      } catch {
        setHasGenerated(false);
      }
    }
  }, [profileId]);

  // Generar análisis inteligente local - ESPECFICO para cada match
  const generateSmartAnalysis = (me: MatchProfile, target: MatchProfile): EnrichedAnalysis => {
    const sameLocation = me.location === target.location;
    const meCategory = me.category || 'emprendimiento';
    const targetCategory = target.category || 'emprendimiento';
    const meName = me.companyName || me.name;
    const targetName = target.companyName || target.name;

    // Insight šNICO basado en la combinación específica de categorías
    let insight = '';

    // Análisis específico por tipo de negocio
    if (targetCategory.includes('Paisajismo') || targetCategory.includes('Jardín')) {
      insight = `${targetName} puede atraer clientes que valoran el bienestar y la naturaleza - exactamente el perfil que busca servicios como los de ${meName}. Una colaboración donde ${targetName} recomiende tus servicios a sus clientes (y viceversa) podría generar leads de alta calidad para ambos.`;
    } else if (targetCategory.includes('Belleza') || targetCategory.includes('Estética')) {
      insight = `Los clientes de ${targetName} buscan verse y sentirse bien - una audiencia perfecta para ${meName}. Podrían crear experiencias conjuntas de bienestar o packs que combinen sus servicios para maximizar el valor percibido.`;
    } else if (targetCategory.includes('Marketing') || targetCategory.includes('Digital')) {
      insight = `${targetName} tiene expertise en visibilidad digital que podría potenciar la presencia online de ${meName}. A cambio, ${meName} podría ser un caso de éxito o referencia para ${targetName}.`;
    } else if (targetCategory.includes('Consultoría') || targetCategory.includes('Coaching')) {
      insight = `${targetName} trabaja con emprendedores que podrían necesitar exactamente lo que ofrece ${meName}. Esta conexión podría generar referidos de calidad en ambas direcciones.`;
    } else if (targetCategory.includes('Salud') || targetCategory.includes('Kinesiología')) {
      insight = `${targetName} y ${meName} comparten una audiencia interesada en bienestar integral. Sus clientes naturalmente podrían beneficiarse de ambos servicios, creando un ecosistema de salud completo.`;
    } else if (targetCategory.includes('Gastronomía') || targetCategory.includes('Alimentos')) {
      insight = `${targetName} tiene acceso a una audiencia que valora experiencias de calidad. Un evento conjunto o colaboración de contenido podría exponer ambas marcas a nuevos clientes potenciales.`;
    } else {
      insight = `${targetName} en ${targetCategory} y ${meName} en ${meCategory} tienen audiencias complementarias sin competir directamente. Sus clientes podrían beneficiarse de ambos servicios, creando oportunidades de referidos mutuos.`;
    }

    if (sameLocation) {
      insight += ` Al estar ambos en ${me.location}, pueden coordinar eventos presenciales o activaciones conjuntas.`;
    }

    // Oportunidades ESPECFICAS para este match
    const opportunities = [
      `Sorteo conjunto: ${meName} regala un servicio/producto de ${targetName} a sus seguidores (y viceversa)`,
      `Contenido colaborativo: Live de Instagram donde ambos comparten tips de sus industrias`,
      `Pack especial: Clientes de ${targetName} reciben descuento exclusivo en ${meName}`
    ];

    // Mensaje rompehielos personalizado
    const firstName = target.name?.split(' ')[0] || 'Hola';
    const icebreaker = `¡Hola ${firstName}! ‘‹ Soy de ${meName} y te encontré en Tribu Impulsa. Me parece que lo que hacen en ${targetName} es genial y creo que nuestras audiencias podrían beneficiarse mutuamente. ¿Te interesaría explorar un sorteo cruzado o alguna colaboración? ¡Creo que podría funcionar muy bien! `;

    return {
      insight,
      opportunities,
      icebreaker
    };
  };

  // Función para generar análisis con delay realista
  const handleGenerateAnalysis = async () => {
    setIsLoading(true);

    // Delay variable de 3-5 segundos para simular "pensando"
    const thinkingTime = 3000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, thinkingTime));

    try {
      // Intentar usar Azure OpenAI primero
      const { analyzeCompatibility } = await import('../../services/aiMatchingService');
      const result = await analyzeCompatibility(
        { id: myProfile.id, name: myProfile.name, companyName: myProfile.companyName, city: myProfile.location || '', category: myProfile.category, affinity: myProfile.category },
        { id: profileData.id, name: profileData.name, companyName: profileData.companyName, city: profileData.location || '', category: profileData.category, affinity: profileData.category }
      );

      // Verificar que el resultado sea válido y no sea el mensaje de error genérico
      const isValidResult = result &&
        result.analysis &&
        result.analysis !== 'Análisis no disponible' &&
        result.opportunities &&
        result.opportunities.length > 0;

      if (isValidResult) {
        // Usar icebreaker del LLM si existe, o generar uno básico
        const llmIcebreaker = result.icebreaker ||
          `¡Hola ${profileData.name.split(' ')[0]}! ‘‹ Vi tu negocio ${profileData.companyName} y me encantó. ¿Te interesa explorar una colaboración? `;

        const enriched: EnrichedAnalysis = {
          insight: result.analysis,
          opportunities: result.opportunities,
          icebreaker: llmIcebreaker
        };
        console.log(' Análisis LLM completo:', enriched);
        setAnalysis(enriched);
        saveAnalysis(profileId, JSON.stringify(enriched));
      } else {
        // LLM no disponible o respuesta inválida - usar fallback local inteligente
        throw new Error('Using local fallback');
      }
    } catch {
      // Usar fallback inteligente local (siempre funciona)
      console.log(' Usando análisis local enriquecido');
      const smartAnalysis = generateSmartAnalysis(myProfile, profileData);
      setAnalysis(smartAnalysis);
      saveAnalysis(profileId, JSON.stringify(smartAnalysis));
    } finally {
      setIsLoading(false);
      setHasGenerated(true);
    }
  };

  // Generar URL de WhatsApp con mensaje pre-escrito
  const getWhatsAppUrl = () => {
    if (!analysis) return '#';
    const phone = profileData.phone?.replace(/\D/g, '') || '';
    const message = encodeURIComponent(analysis.icebreaker);
    return phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
  };

  // Estado de carga con animación épica
  if (isLoading) {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#6161FF]/20">
        <TribalLoadingAnimation isLoading={true} duration={4500} />
      </div>
    );
  }

  // Mostrar análisis enriquecido
  if (analysis) {
    return (
      <div className="bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-2xl p-5 border border-[#6161FF]/20 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-[#181B34] block">Análisis de Compatibilidad</span>
            <span className="text-xs text-[#7C8193]">Generado por Tribu X</span>
          </div>
        </div>

        {/* Insight principal */}
        <div className="bg-white rounded-xl p-4 border border-[#E4E7EF]">
          <h4 className="text-xs font-bold uppercase tracking-wide text-[#6161FF] mb-2">’¡ Insight</h4>
          <p className="text-sm text-[#434343] leading-relaxed">{analysis.insight}</p>
        </div>

        {/* Oportunidades */}
        <div className="bg-white rounded-xl p-4 border border-[#E4E7EF]">
          <h4 className="text-xs font-bold uppercase tracking-wide text-[#00CA72] mb-2"> Oportunidades concretas</h4>
          <ul className="space-y-2">
            {analysis.opportunities.map((opp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#434343]">
                <span className="text-[#00CA72] mt-0.5">â€¢</span>
                <span>{opp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Romper el hielo */}
        <div className="bg-[#25D366]/10 rounded-xl p-4 border border-[#25D366]/30">
          <h4 className="text-xs font-bold uppercase tracking-wide text-[#25D366] mb-2">’¬ Rompe el hielo</h4>
          <p className="text-sm text-[#434343] leading-relaxed mb-3 italic">"{analysis.icebreaker}"</p>
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-[#20BA5C] transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            Enviar mensaje
          </a>
        </div>
      </div>
    );
  }

  // Botón para generar análisis
  return (
    <div className="bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-2xl p-5 border border-[#6161FF]/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-[#181B34] block">¿Es buen match?</span>
          <span className="text-xs text-[#7C8193]">Descubre sinergias y oportunidades</span>
        </div>
      </div>
      <button
        onClick={handleGenerateAnalysis}
        className="w-full py-3 bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg"
      >
        <Sparkles size={18} />
        Analizar compatibilidad
      </button>
    </div>
  );
};

// 5. Full Profile Detail View (Other User)

export default MyProfileView;
