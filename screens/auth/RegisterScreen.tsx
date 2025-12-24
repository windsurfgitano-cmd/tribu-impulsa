import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { TermsCheckbox } from '../../components/TermsAndConditions';
import { createUser } from '../../services/databaseService';
import { syncUserToCloud } from '../../services/cloudSync';
import { persistSurveyResponse, SurveyFormState } from '../../services/surveyService';
import { REGIONS } from '../../constants/geography';
import { TRIBE_CATEGORY_OPTIONS } from '../../data/tribeCategories';
import { SURVEY_CATEGORY_OPTIONS, SURVEY_AFFINITY_OPTIONS, SURVEY_SCOPE_OPTIONS, SURVEY_REVENUE_OPTIONS } from '../../constants/surveyOptions';

// Funciones helper para normalizar valores
const normalizeInstagram = (value: string): string => {
  let normalized = value.trim();
  if (normalized && !normalized.startsWith('@')) {
    normalized = '@' + normalized;
  }
  return normalized;
};

const normalizePhone = (value: string): string => {
  let normalized = value.trim().replace(/\s+/g, '');
  if (normalized && !normalized.startsWith('+')) {
    // Si empieza con 9, agregar +569
    if (normalized.startsWith('9')) {
      normalized = '+569' + normalized.substring(1);
    } else if (!normalized.startsWith('569')) {
      normalized = '+56' + normalized;
    } else {
      normalized = '+' + normalized;
    }
  }
  return normalized;
};

const normalizeWebsite = (value: string): string => {
  let normalized = value.trim();
  if (normalized && !normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  return normalized;
};

const RegisterScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    // Paso 1: Datos personales
    name: '',
    email: '',
    phone: '',
    password: '',
    termsAccepted: false, // Aceptación de T&C
    // Paso 2: Emprendimiento
    companyName: '',
    city: '',
    sector: '',
    // Paso 3: Giro/Rubro
    category: '',
    // Paso 4: Afinidad
    affinity: '',
    scope: 'NACIONAL' as 'LOCAL' | 'REGIONAL' | 'NACIONAL',
    comuna: '',                    // Para alcance LOCAL
    selectedRegions: [] as string[], // Para alcance REGIONAL
    // Paso 5: Redes
    instagram: '',
    facebook: '',
    tiktok: '',
    website: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRegionForComuna, setSelectedRegionForComuna] = useState('');
  const completeProfileCategoryOptions = useMemo(
    () => [...TRIBE_CATEGORY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')),
    []
  );
  const completeProfileAffinityOptions = useMemo(
    () => [...SURVEY_AFFINITY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')),
    []
  );

  const totalSteps = 5;

  // Comunas filtradas por región seleccionada
  const comunasDeRegion = selectedRegionForComuna
    ? REGIONS.find(r => r.id === selectedRegionForComuna)?.comunas || []
    : [];

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Requerido';
      if (!formData.email.trim()) newErrors.email = 'Requerido';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
      if (!formData.phone.trim()) newErrors.phone = 'Requerido';
      if (!formData.password.trim()) newErrors.password = 'Requerido';
      else if (formData.password.length < 4) newErrors.password = 'Mínimo 4 caracteres';
      if (!formData.termsAccepted) newErrors.termsAccepted = 'Debes aceptar los términos';
    } else if (step === 2) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Requerido';
      if (!formData.city.trim()) newErrors.city = 'Requerido';
      // No validar scope aquí, se valida en paso 4
    } else if (step === 3) {
      if (!formData.category) newErrors.category = 'Selecciona un giro';
    } else if (step === 4) {
      if (!formData.affinity) newErrors.affinity = 'Selecciona una afinidad';
      // Validar geografía según alcance
      if (formData.scope === 'LOCAL' && !formData.comuna) {
        newErrors.comuna = 'Selecciona tu comuna';
      }
      if (formData.scope === 'REGIONAL' && formData.selectedRegions.length === 0) {
        newErrors.selectedRegions = 'Selecciona al menos una región';
      }
    } else if (step === 5) {
      if (!formData.instagram.trim()) newErrors.instagram = 'Instagram es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Normalizar valores antes de guardar
      const normalizedPhone = normalizePhone(formData.phone);
      const normalizedInstagram = normalizeInstagram(formData.instagram);
      const normalizedFacebook = formData.facebook ? normalizeInstagram(formData.facebook) : null;
      const normalizedTiktok = formData.tiktok ? normalizeInstagram(formData.tiktok) : null;
      const normalizedWebsite = formData.website ? normalizeWebsite(formData.website) : null;

      // Guardar en databaseService (DB real) - incluir contraseña en el perfil
      const newUser = createUser({
        name: formData.name,
        email: formData.email,
        phone: normalizedPhone,
        password: formData.password, // Contraseña incluida en el perfil
        companyName: formData.companyName,
        city: formData.city,
        sector: formData.sector || null,
        instagram: normalizedInstagram,
        facebook: normalizedFacebook,
        tiktok: normalizedTiktok,
        website: normalizedWebsite,
        category: formData.category,
        affinity: formData.affinity,
        scope: formData.scope,
        comuna: formData.comuna || undefined,
        selectedRegions: formData.selectedRegions.length > 0 ? formData.selectedRegions : undefined,
        whatsapp: normalizedPhone // WhatsApp = teléfono por defecto
      });

      // Establecer usuario actual con el ID (NO email)
      localStorage.setItem('tribu_current_user', newUser.id);

      // ☁️ SINCRONIZAR A FIRESTORE (nube)
      syncUserToCloud(newUser);

      // También guardar en formato antiguo para compatibilidad
      const surveyData: SurveyFormState = {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        instagram: formData.instagram,
        facebook: formData.facebook,
        tiktok: formData.tiktok,
        website: formData.website,
        otherChannel: '',
        city: formData.city,
        sector: formData.sector,
        comuna: formData.comuna || '',
        selectedRegions: formData.selectedRegions || [],
        category: formData.category,
        affinity: formData.affinity,
        scope: formData.scope,
        revenue: '',
        copyResponse: false
      };
      persistSurveyResponse(surveyData);

      console.log('✅ Usuario registrado en DB:', newUser.id);
      navigate('/searching');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8 bg-[#F5F7FB] relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#6161FF]/8 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-[#00CA72]/8 rounded-full blur-[80px]"></div>

      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-lg w-full relative z-10 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-[#E4E7EF]">
        {/* Header con progreso */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <button onClick={handleBack} className="text-[#7C8193] hover:text-[#6161FF] p-1 sm:p-2 touch-manipulation">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-1 sm:gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1.5 sm:h-2 w-6 sm:w-8 rounded-full transition-all duration-500 ${step > i ? 'bg-gradient-to-r from-[#6161FF] to-[#00CA72]' : step === i + 1 ? 'bg-[#6161FF]' : 'bg-[#E4E7EF]'}`} />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-[#7C8193]">{step}/{totalSteps}</span>
        </div>

        {/* Paso 1: Datos personales */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center mb-4 sm:mb-6">
              <img src="/NuevoLogo.png" alt="Tribu Impulsa" className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 object-contain" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#181B34]">¡Bienvenido/a!</h2>
              <p className="text-[#7C8193] text-xs sm:text-sm mt-1">Cuéntanos sobre ti</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Nombre y Apellido *</label>
              <input
                type="text"
                className={`w-full bg-[#F5F7FB] border ${errors.name ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                placeholder="Ej. María Pérez"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="text-xs text-[#FB275D] mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Email *</label>
              <input
                type="email"
                className={`w-full bg-[#F5F7FB] border ${errors.email ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <p className="text-xs text-[#FB275D] mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Teléfono *</label>
              <input
                type="tel"
                className={`w-full bg-[#F5F7FB] border ${errors.phone ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                placeholder="+56 9 1234 5678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              {errors.phone && <p className="text-xs text-[#FB275D] mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Crea tu Contraseña *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full bg-[#F5F7FB] border ${errors.password ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 pr-12 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                  placeholder="Mínimo 4 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C8193] hover:text-[#6161FF] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[#FB275D] mt-1">{errors.password}</p>}
              <p className="text-[0.625rem] text-[#7C8193] mt-1">Elige una contraseña segura para tu cuenta</p>
            </div>

            {/* Checkbox de Términos y Condiciones */}
            <TermsCheckbox
              checked={formData.termsAccepted}
              onChange={(checked) => setFormData({ ...formData, termsAccepted: checked })}
              error={!!errors.termsAccepted}
            />
          </div>
        )}

        {/* Paso 2: Emprendimiento */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#181B34]">Tu Emprendimiento</h2>
              <p className="text-[#7C8193] text-sm mt-1">Datos de tu negocio</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Nombre del Emprendimiento *</label>
              <input
                type="text"
                className={`w-full bg-[#F5F7FB] border ${errors.companyName ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                placeholder="Ej. Cosmética Natural"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
              {errors.companyName && <p className="text-xs text-[#FB275D] mt-1">{errors.companyName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Ciudad *</label>
              <input
                type="text"
                className={`w-full bg-[#F5F7FB] border ${errors.city ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                placeholder="Ej. Santiago"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              {errors.city && <p className="text-xs text-[#FB275D] mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Alcance del Servicio</label>
              <div className="grid grid-cols-3 gap-2">
                {['LOCAL', 'REGIONAL', 'NACIONAL'].map(scope => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => setFormData({ ...formData, scope: scope as typeof formData.scope, comuna: '', selectedRegions: [] })}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${formData.scope === scope ? 'bg-[#6161FF] text-white' : 'bg-[#F5F7FB] border border-[#E4E7EF] text-[#434343] hover:border-[#6161FF]'}`}
                  >
                    {scope}
                  </button>
                ))}
              </div>
              {formData.scope === 'NACIONAL' && (
                <p className="text-xs text-[#00CA72] bg-[#00CA72]/10 p-2 rounded-lg mt-2">
                  ✅ Alcance nacional: Harás match con emprendedores de todo Chile
                </p>
              )}
            </div>
            {formData.scope === 'LOCAL' && (
              <div className="animate-fadeIn space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Región *</label>
                  <div className="relative">
                    <select
                      className={`w-full bg-[#F5F7FB] border ${errors.comuna ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 appearance-none`}
                      value={selectedRegionForComuna}
                      onChange={(e) => {
                        setSelectedRegionForComuna(e.target.value);
                        setFormData({ ...formData, comuna: '' });
                      }}
                    >
                      <option value="">Selecciona tu región</option>
                      {REGIONS.map(region => (
                        <option key={region.id} value={region.id}>{region.shortName}</option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6161FF] pointer-events-none">▼</span>
                  </div>
                </div>
                {selectedRegionForComuna && (
                  <div>
                    <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Comuna *</label>
                    <div className="relative">
                      <select
                        className={`w-full bg-[#F5F7FB] border ${errors.comuna ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 appearance-none`}
                        value={formData.comuna}
                        onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                      >
                        <option value="">Selecciona tu comuna</option>
                        {comunasDeRegion.map(comuna => (
                          <option key={comuna} value={comuna}>{comuna}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6161FF] pointer-events-none">▼</span>
                    </div>
                  </div>
                )}
                {errors.comuna && <p className="text-xs text-[#FB275D]">{errors.comuna}</p>}
                <p className="text-xs text-[#7C8193]">Solo harás match con emprendedores de tu comuna.</p>
              </div>
            )}
            {formData.scope === 'REGIONAL' && (
              <div className="animate-fadeIn space-y-3">
                <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Regiones de operación *</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {REGIONS.map(region => (
                    <label key={region.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F5F7FB] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedRegions.includes(region.id)}
                        onChange={(e) => {
                          const newRegions = e.target.checked
                            ? [...formData.selectedRegions, region.id]
                            : formData.selectedRegions.filter(r => r !== region.id);
                          setFormData({ ...formData, selectedRegions: newRegions });
                        }}
                        className="rounded border-[#E4E7EF] text-[#6161FF] focus:ring-[#6161FF]/30"
                      />
                      <span className="text-sm text-[#434343]">{region.shortName}</span>
                    </label>
                  ))}
                </div>
                {errors.selectedRegions && <p className="text-xs text-[#FB275D]">{errors.selectedRegions}</p>}
                <p className="text-xs text-[#7C8193]">Harás match con emprendedores de las regiones seleccionadas.</p>
              </div>
            )}
          </div>
        )}

        {/* Paso 3: Giro/Rubro */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#181B34]">Giro o Rubro</h2>
              <p className="text-[#7C8193] text-sm mt-1">¿En qué categoría está tu negocio?</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Categoría Principal *</label>
              <div className="relative">
                <select
                  className={`w-full bg-[#F5F7FB] border ${errors.category ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 appearance-none cursor-pointer`}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Selecciona tu giro</option>
                  {[...SURVEY_CATEGORY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#6161FF]">▼</div>
              </div>
              {errors.category && <p className="text-xs text-[#FB275D] mt-1">{errors.category}</p>}
            </div>
            <p className="text-xs text-[#7C8193] bg-[#F5F7FB] p-3 rounded-lg">
              💡 Selecciona la categoría que mejor describe tu actividad principal. Esto ayuda al algoritmo a encontrar conexiones relevantes.
            </p>
          </div>
        )}

        {/* Paso 4: Afinidad */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#181B34]">Tu Afinidad</h2>
              <p className="text-[#7C8193] text-sm mt-1">¿Con qué tipo de negocios quieres conectar?</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Área de Interés *</label>
              <div className="relative">
                <select
                  className={`w-full bg-[#F5F7FB] border ${errors.affinity ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30 appearance-none cursor-pointer`}
                  value={formData.affinity}
                  onChange={(e) => setFormData({ ...formData, affinity: e.target.value })}
                >
                  <option value="">Selecciona una afinidad</option>
                  {[...SURVEY_AFFINITY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#6161FF]">▼</div>
              </div>
              {errors.affinity && <p className="text-xs text-[#FB275D] mt-1">{errors.affinity}</p>}
            </div>
            <p className="text-xs text-[#7C8193] bg-[#F5F7FB] p-3 rounded-lg">
              🎯 El algoritmo usará esta información para encontrar negocios complementarios con los que puedas hacer cross-promotion.
            </p>
          </div>
        )}

        {/* Paso 5: Redes Sociales */}
        {step === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#181B34]">Tus Redes</h2>
              <p className="text-[#7C8193] text-sm mt-1">Donde compartirás contenido tribal</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Instagram * (Principal)</label>
              <input
                type="text"
                className={`w-full bg-[#F5F7FB] border ${errors.instagram ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                placeholder="@tuinstagram"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              />
              {errors.instagram && <p className="text-xs text-[#FB275D] mt-1">{errors.instagram}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Facebook</label>
                <input
                  type="text"
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                  placeholder="@facebook"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">TikTok</label>
                <input
                  type="text"
                  className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                  placeholder="@tiktok"
                  value={formData.tiktok}
                  onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase tracking-wide">Sitio Web</label>
              <input
                type="text"
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                placeholder="www.tusitio.cl"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Botón Continuar */}
        <div className="mt-6 sm:mt-8">
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white py-3 sm:py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
          >
            {step === totalSteps ? '🚀 Buscar Mi Tribu' : 'Continuar'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
