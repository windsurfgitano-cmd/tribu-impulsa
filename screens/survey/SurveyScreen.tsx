import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { REGIONS } from '../../constants/geography';
import { 
  getStoredSurveyResponse, 
  persistSurveyResponse, 
  EMPTY_SURVEY_FORM,
  type SurveyFormState 
} from '../../services/surveyService';
import { clearStoredSession } from '../../utils/storage';

// Constantes de opciones
const SURVEY_CATEGORY_OPTIONS = ['Alimentos', 'Belleza', 'Comercio', 'Consultoría', 'Diseño', 'Educación', 'Eventos', 'Financiero', 'Fitness', 'Gastronomía', 'Hogar', 'Legal', 'Marketing', 'Mascotas', 'Moda', 'Profesional', 'Salud', 'Servicios', 'Tecnología', 'Transporte', 'Turismo', 'Otro'];
const SURVEY_AFFINITY_OPTIONS = ['Arte y cultura', 'Aventura al aire libre', 'Bienestar y salud', 'Ciencia y tecnología', 'Cocina y gastronomía', 'Deportes', 'Educación y aprendizaje', 'Emprendimiento y negocios', 'Entretenimiento', 'Estilo de vida sostenible', 'Familia', 'Fitness y actividad física', 'Fotografía', 'Moda y belleza', 'Mascotas', 'Música', 'Naturaleza', 'Networking profesional', 'Sostenibilidad', 'Tecnología', 'Viajes'];
const SURVEY_SCOPE_OPTIONS = [
  { value: 'LOCAL', label: 'Local (comuna)' },
  { value: 'REGIONAL', label: 'Regional (varias regiones)' },
  { value: 'NACIONAL', label: 'Nacional (todo Chile)' }
];
const SURVEY_REVENUE_OPTIONS = ['Menos de $500.000', '$500.000 - $1.500.000', '$1.500.000 - $3.000.000', '$3.000.000 - $5.000.000', 'Más de $5.000.000'];

export const SurveyScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SurveyFormState>(() => getStoredSurveyResponse() ?? EMPTY_SURVEY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRegionForComuna, setSelectedRegionForComuna] = useState('');

  const requiredFields: (keyof SurveyFormState)[] = ['email', 'name', 'phone', 'city', 'category', 'affinity', 'scope'];

  // Comunas filtradas por región seleccionada
  const comunasDeRegion = selectedRegionForComuna
    ? REGIONS.find(r => r.id === selectedRegionForComuna)?.comunas || []
    : [];

  const handleChange = (field: keyof SurveyFormState, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    requiredFields.forEach(field => {
      if (!formData[field]) {
        nextErrors[field] = 'Campo obligatorio';
      }
    });

    // Validar comuna si alcance es LOCAL
    if (formData.scope === 'LOCAL' && !formData.comuna) {
      nextErrors.comuna = 'Debes seleccionar tu comuna';
    }

    // Validar regiones si alcance es REGIONAL
    if (formData.scope === 'REGIONAL' && (!formData.selectedRegions || formData.selectedRegions.length === 0)) {
      nextErrors.selectedRegions = 'Debes seleccionar al menos una región';
    }

    return nextErrors;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setIsSubmitting(true);
    persistSurveyResponse(formData);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/dashboard', { replace: true });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] relative py-12 px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-[#6161FF]/8 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-[#00CA72]/8 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        <button
          onClick={() => {
            clearStoredSession();
            navigate('/');
          }}
          className="inline-flex items-center gap-2 text-[#7C8193] hover:text-[#6161FF] transition-colors text-sm"
        >
          <ArrowLeft size={18} /> Volver al Inicio
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-[#E4E7EF]">
          <header className="mb-8 text-center">
            <img src="/NuevoLogo.png" alt="Tribu Impulsa" className="w-20 h-20 mx-auto mb-4 object-contain" />
            <p className="text-xs uppercase tracking-[0.35em] text-[#6161FF] mb-2 font-medium">Tu producto o servicio en manos que impulsan</p>
            <h1 className="text-4xl font-bold text-[#181B34] mb-2">Inscripción</h1>
            <p className="text-[#7C8193]">Responde esta encuesta para activar tu experiencia en Tribu Impulsa.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">Correo electrónico<span className="text-[#FB275D]">*</span></label>
                <input
                  type="email"
                  className={`w-full mt-2 rounded-xl bg-[#F5F7FB] border ${errors.email ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                  placeholder="correo@empresa.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
                {errors.email && <p className="text-xs text-[#FB275D] mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">Nombre y Apellido<span className="text-[#FB275D]">*</span></label>
                <input
                  className={`w-full mt-2 rounded-xl bg-[#F5F7FB] border ${errors.name ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                  placeholder="Ej. María Pérez"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                {errors.name && <p className="text-xs text-[#FB275D] mt-1">{errors.name}</p>}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['instagram', 'facebook', 'tiktok', 'website'].map((field) => (
                <div key={field}>
                  <label className="text-sm font-semibold text-[#434343] uppercase text-[0.6875rem] tracking-[0.15em]">
                    {field === 'instagram' && 'Instagram'}
                    {field === 'facebook' && 'Facebook'}
                    {field === 'tiktok' && 'TikTok'}
                    {field === 'website' && 'Web'}
                  </label>
                  <input
                    className="w-full mt-2 rounded-xl bg-[#F5F7FB] border border-[#E4E7EF] p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                    value={formData[field as keyof SurveyFormState] as string}
                    onChange={(e) => handleChange(field as keyof SurveyFormState, e.target.value)}
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-semibold text-[#434343]">Otra red / canal</label>
                <input
                  className="w-full mt-2 rounded-xl bg-[#F5F7FB] border border-[#E4E7EF] p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                  value={formData.otherChannel}
                  onChange={(e) => handleChange('otherChannel', e.target.value)}
                />
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">Teléfono<span className="text-[#FB275D]">*</span></label>
                <input
                  className={`w-full mt-2 rounded-xl bg-[#F5F7FB] border ${errors.phone ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                  placeholder="Ej. +56912345678"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
                {errors.phone && <p className="text-xs text-[#FB275D] mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">Ciudad<span className="text-[#FB275D]">*</span></label>
                <input
                  className={`w-full mt-2 rounded-xl bg-[#F5F7FB] border ${errors.city ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} p-4 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                  placeholder="Ej. Santiago"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
                {errors.city && <p className="text-xs text-[#FB275D] mt-1">{errors.city}</p>}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">Categoría<span className="text-[#FB275D]">*</span></label>
                <div className="relative mt-2">
                  <select
                    className={`w-full appearance-none rounded-xl bg-[#F5F7FB] border ${errors.category ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} p-4 pr-10 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    <option value="">Selecciona una categoría</option>
                    {[...SURVEY_CATEGORY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">▼</span>
                </div>
                {errors.category && <p className="text-xs text-[#FB275D] mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">Afinidad<span className="text-[#FB275D]">*</span></label>
                <div className="relative mt-2">
                  <select
                    className={`w-full appearance-none rounded-xl bg-[#F5F7FB] border ${errors.affinity ? 'border-[#FB275D]' : 'border-[#E4E7EF]'} p-4 pr-10 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                    value={formData.affinity}
                    onChange={(e) => handleChange('affinity', e.target.value)}
                  >
                    <option value="">Selecciona una afinidad</option>
                    {[...SURVEY_AFFINITY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6161FF]">▼</span>
                </div>
                {errors.affinity && <p className="text-xs text-[#FB275D] mt-1">{errors.affinity}</p>}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">Alcance del servicio<span className="text-[#FB275D]">*</span></label>
                <div className="flex flex-col gap-3 mt-3">
                  {SURVEY_SCOPE_OPTIONS.map(option => (
                    <label key={option.value} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.scope === option.value ? 'border-[#6161FF] bg-[#F3F3FF]' : 'border-[#E4E7EF] bg-[#F5F7FB] hover:border-[#B3B8C6]'}`}>
                      <input
                        type="radio"
                        className="mt-1 accent-[#6161FF]"
                        checked={formData.scope === option.value}
                        onChange={() => handleChange('scope', option.value)}
                      />
                      <span className="text-sm text-[#434343]">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.scope && <p className="text-xs text-[#FB275D] mt-1">{errors.scope}</p>}
              </div>
              <div>
                {/* Selector Región → Comuna (si es LOCAL) */}
                {formData.scope === 'LOCAL' && (
                  <>
                    {/* Paso 1: Seleccionar Región */}
                    <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">
                      Región<span className="text-[#FB275D]">*</span>
                    </label>
                    <div className="relative mt-2">
                      <select
                        className="w-full appearance-none rounded-xl bg-[#F5F7FB] border border-[#E4E7EF] p-4 pr-10 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                        value={selectedRegionForComuna}
                        onChange={(e) => {
                          setSelectedRegionForComuna(e.target.value);
                          handleChange('comuna', ''); // Limpiar comuna al cambiar región
                        }}
                      >
                        <option value="">Selecciona tu región</option>
                        {REGIONS.map(region => (
                          <option key={region.id} value={region.id}>{region.shortName}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6161FF]">▼</span>
                    </div>

                    {/* Paso 2: Seleccionar Comuna (solo si hay región) */}
                    {selectedRegionForComuna && (
                      <div className="mt-3">
                        <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">
                          Comuna<span className="text-[#FB275D]">*</span>
                        </label>
                        <div className="relative mt-2">
                          <select
                            className="w-full appearance-none rounded-xl bg-[#F5F7FB] border border-[#E4E7EF] p-4 pr-10 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                            value={formData.comuna}
                            onChange={(e) => handleChange('comuna', e.target.value)}
                          >
                            <option value="">Selecciona tu comuna</option>
                            {comunasDeRegion.map(comuna => (
                              <option key={comuna} value={comuna}>{comuna}</option>
                            ))}
                          </select>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6161FF]">▼</span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-[#7C8193] mt-2">Solo harás match con emprendedores de tu comuna.</p>
                  </>
                )}

                {/* Selector de Regiones (si es REGIONAL) */}
                {formData.scope === 'REGIONAL' && (
                  <>
                    <label className="text-sm font-semibold text-[#434343] flex items-center gap-1">
                      Regiones donde operas<span className="text-[#FB275D]">*</span>
                    </label>
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto p-2 bg-[#F5F7FB] rounded-xl border border-[#E4E7EF]">
                      {REGIONS.map(region => (
                        <label key={region.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded-lg transition">
                          <input
                            type="checkbox"
                            className="accent-[#6161FF] w-4 h-4"
                            checked={(formData.selectedRegions as unknown as string[])?.includes(region.id) || false}
                            onChange={(e) => {
                              const current = (formData.selectedRegions as unknown as string[]) || [];
                              if (e.target.checked) {
                                handleChange('selectedRegions', [...current, region.id] as unknown as string);
                              } else {
                                handleChange('selectedRegions', current.filter(r => r !== region.id) as unknown as string);
                              }
                            }}
                          />
                          <span className="text-sm text-[#434343]">{region.shortName}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-[#7C8193] mt-1">Selecciona todas las regiones donde ofreces tu servicio.</p>
                  </>
                )}

                {/* Mensaje para NACIONAL */}
                {formData.scope === 'NACIONAL' && (
                  <div className="mt-2 p-3 bg-[#00CA72]/10 rounded-xl border border-[#00CA72]/20">
                    <p className="text-sm text-[#00CA72] font-medium">✓ Alcance Nacional</p>
                    <p className="text-xs text-[#7C8193]">Harás match con emprendedores de todo Chile.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-[#434343]">Facturación mensual</label>
                <div className="relative mt-2">
                  <select
                    className="w-full appearance-none rounded-xl bg-[#F5F7FB] border border-[#E4E7EF] p-4 pr-10 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                    value={formData.revenue}
                    onChange={(e) => handleChange('revenue', e.target.value)}
                  >
                    <option value="">Selecciona un rango</option>
                    {SURVEY_REVENUE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6161FF]">▼</span>
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm text-[#434343] mt-6 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-[#6161FF] w-5 h-5"
                  checked={formData.copyResponse}
                  onChange={(e) => handleChange('copyResponse', e.target.checked)}
                />
                Enviarme una copia de mis respuestas
              </label>
            </section>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-[#E4E7EF]">
              <p className="text-xs text-[#7C8193]">* Campos obligatorios</p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#00CA72] to-[#4AE698] text-white font-bold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-60"
              >
                {isSubmitting ? 'Guardando...' : 'Enviar encuesta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

