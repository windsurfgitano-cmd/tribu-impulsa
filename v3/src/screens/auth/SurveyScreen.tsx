
import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserService } from '../../services/api/users';
import { MembershipService } from '../../services/api/membership';
import { ArrowLeft, Globe, Instagram, Facebook, Layout } from 'lucide-react';

// Datos y Constantes
import { REGIONS } from '../../constants/geography';
import SearchableSelect from '../../components/SearchableSelect';
import { CATEGORY_SELECT_OPTIONS, AFFINITY_SELECT_OPTIONS_WITH_GROUP } from '../../utils/selectOptions';

// Tipos para el estado del formulario
type SurveyFormState = {
    name: string;
    email: string;
    phone: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    website: string;
    otherChannel: string;
    city: string;
    category: string;
    affinity: string;
    scope: string;
    comuna: string;           // Para alcance LOCAL
    selectedRegions: string[]; // Para alcance REGIONAL
    revenue: string;
};

const SURVEY_SCOPE_OPTIONS = [
    { value: 'LOCAL', label: 'LOCAL (sólo si operas en una comuna específica)' },
    { value: 'REGIONAL', label: 'REGIONAL (si cubres una o varias regiones de Chile)' },
    { value: 'NACIONAL', label: 'NACIONAL (llegas a todo Chile)' }
];

export const SurveyScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedRegionForComuna, setSelectedRegionForComuna] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<SurveyFormState>({
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        phone: '',
        instagram: '',
        facebook: '',
        tiktok: '',
        website: '',
        otherChannel: '',
        city: 'Santiago',
        category: '',
        affinity: '',
        scope: '',
        comuna: '',
        selectedRegions: [],
        revenue: ''
    });

    // Comunas filtradas por región seleccionada (para scope LOCAL)
    const comunasDeRegion = selectedRegionForComuna
        ? REGIONS.find(r => r.id === selectedRegionForComuna)?.comunas || []
        : [];

    const handleChange = (field: keyof SurveyFormState, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpiar error al escribir
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
        const required: (keyof SurveyFormState)[] = ['name', 'phone', 'city', 'category', 'affinity', 'scope'];

        required.forEach(field => {
            if (!formData[field]) nextErrors[field] = 'Campo obligatorio';
        });

        // Validaciones condicionales de Geografía
        if (formData.scope === 'LOCAL' && !formData.comuna) {
            nextErrors.comuna = 'Debes seleccionar tu comuna';
        }
        if (formData.scope === 'REGIONAL' && (!formData.selectedRegions || formData.selectedRegions.length === 0)) {
            nextErrors.selectedRegions = 'Debes seleccionar al menos una región';
        }

        return nextErrors;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!currentUser?.email) return;

        setLoading(true);
        try {
            // 1. Guardar en Firestore
            await UserService.updateUserByEmail(currentUser.email, {
                ...formData,
                surveyCompleted: true,
                onboardingStep: 'complete'
            });

            // 2. Activar Trial si corresponde
            const user = await UserService.getUserByEmail(currentUser.email);
            if (user) {
                try {
                    await MembershipService.activateTrial(user);
                } catch (err) {
                    console.warn('Trials activation warning:', err);
                    // No bloquear el flujo si falla el trial
                }
            }

            // 3. Redirigir
            navigate('/dashboard');

        } catch (error) {
            console.error('Error saving survey:', error);
            alert('Hubo un error al guardar tu perfil. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7FB] relative py-12 px-4">
            {/* Background V2 Style */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-[#6161FF]/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-[#00CA72]/10 blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10 space-y-6">
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 text-[#7C8193] hover:text-[#6161FF] transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={18} /> Volver
                </button>

                <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#E4E7EF]">
                    <header className="mb-10 text-center">
                        <div className="w-16 h-16 bg-[#6161FF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#6161FF]">
                            <Layout size={32} />
                        </div>
                        <p className="text-xs uppercase tracking-[0.35em] text-[#6161FF] mb-2 font-bold">Tu Perfil Tribu</p>
                        <h1 className="text-3xl font-black text-[#181B34] mb-2">Configuración Inicial</h1>
                        <p className="text-[#7C8193] max-w-lg mx-auto">Responde esta encuesta para que el algoritmo encuentre las mejores conexiones para ti.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. Información Básica */}
                        <section>
                            <h3 className="text-lg font-bold text-[#181B34] mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#6161FF] text-white flex items-center justify-center text-xs">1</span>
                                Información Personal
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-semibold text-[#434343] mb-1 block">Nombre Completo<span className="text-red-500">*</span></label>
                                    <input
                                        className={`w-full rounded-xl bg-[#F5F7FB] border ${errors.name ? 'border-red-500' : 'border-[#E4E7EF]'} p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="Tu nombre"
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-[#434343] mb-1 block">Teléfono / WhatsApp<span className="text-red-500">*</span></label>
                                    <input
                                        className={`w-full rounded-xl bg-[#F5F7FB] border ${errors.phone ? 'border-red-500' : 'border-[#E4E7EF]'} p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="+569..."
                                    />
                                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-[#434343] mb-1 block">Ciudad Base<span className="text-red-500">*</span></label>
                                    <input
                                        className={`w-full rounded-xl bg-[#F5F7FB] border ${errors.city ? 'border-red-500' : 'border-[#E4E7EF]'} p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30`}
                                        value={formData.city}
                                        onChange={(e) => handleChange('city', e.target.value)}
                                        placeholder="Ej: Santiago"
                                    />
                                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* 2. Redes y Canales */}
                        <section>
                            <h3 className="text-lg font-bold text-[#181B34] mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#6161FF] text-white flex items-center justify-center text-xs">2</span>
                                Tus Canales
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {['instagram', 'facebook', 'tiktok', 'website'].map((field) => (
                                    <div key={field}>
                                        <label className="text-sm font-semibold text-[#434343] mb-1 block capitalize flex items-center gap-2">
                                            {field === 'instagram' && <Instagram size={14} />}
                                            {field === 'facebook' && <Facebook size={14} />}
                                            {field === 'tiktok' && '🎵 TikTok'}
                                            {field === 'website' && <Globe size={14} />}
                                            {field === 'website' ? 'Sitio Web' : field}
                                        </label>
                                        <input
                                            className="w-full rounded-xl bg-[#F5F7FB] border border-[#E4E7EF] p-3 text-[#181B34] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                                            value={formData[field as keyof SurveyFormState] as string}
                                            onChange={(e) => handleChange(field as keyof SurveyFormState, e.target.value)}
                                            placeholder={field === 'instagram' ? 'sin @' : 'URL completa'}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* 3. Categorización de Negocio (Core Algorithm Data) */}
                        <section>
                            <h3 className="text-lg font-bold text-[#181B34] mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#6161FF] text-white flex items-center justify-center text-xs">3</span>
                                Tu Negocio (Matchmaking)
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="text-sm font-semibold text-[#434343] mb-1 block">Categoría Principal<span className="text-red-500">*</span></label>
                                    <SearchableSelect
                                        value={formData.category}
                                        onChange={(newValue) => handleChange('category', newValue)}
                                        options={CATEGORY_SELECT_OPTIONS}
                                        placeholder="Escribe o navega por categoría madre → hija"
                                    />
                                    {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-[#434343] mb-1 block">Interés Principal (Afinidad)<span className="text-red-500">*</span></label>
                                    <SearchableSelect
                                        value={formData.affinity}
                                        onChange={(newValue) => handleChange('affinity', newValue)}
                                        options={AFFINITY_SELECT_OPTIONS_WITH_GROUP}
                                        placeholder="Escribe para filtrar afinidades"
                                    />
                                    {errors.affinity && <p className="text-xs text-red-500 mt-1">{errors.affinity}</p>}
                                </div>
                            </div>
                        </section>

                        {/* 4. Alcance Geográfico */}
                        <section className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                            <h3 className="text-lg font-bold text-[#181B34] mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#6161FF] text-white flex items-center justify-center text-xs">4</span>
                                Alcance Geográfico
                            </h3>

                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-[#434343]">¿Hasta dónde llega tu servicio?<span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-1 gap-3">
                                    {SURVEY_SCOPE_OPTIONS.map(option => (
                                        <label
                                            key={option.value}
                                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.scope === option.value
                                                    ? 'border-[#6161FF] bg-[#F3F3FF] shadow-md'
                                                    : 'border-[#E4E7EF] bg-white hover:border-blue-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="scope"
                                                className="w-5 h-5 text-[#6161FF] accent-[#6161FF]"
                                                checked={formData.scope === option.value}
                                                onChange={() => handleChange('scope', option.value)}
                                            />
                                            <span className="text-sm font-medium text-[#181B34]">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.scope && <p className="text-xs text-red-500 mt-1">{errors.scope}</p>}

                                {/* Lógica Condicional: Región/Comuna */}
                                {formData.scope === 'LOCAL' && (
                                    <div className="mt-4 p-4 bg-white rounded-xl border border-gray-100 animate-slide-up">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 mb-1 block">Región</label>
                                                <select
                                                    className="w-full rounded-lg bg-[#F5F7FB] border border-[#E4E7EF] p-2 text-sm"
                                                    value={selectedRegionForComuna}
                                                    onChange={(e) => {
                                                        setSelectedRegionForComuna(e.target.value);
                                                        handleChange('comuna', '');
                                                    }}
                                                >
                                                    <option value="">Selecciona Región...</option>
                                                    {REGIONS.map(r => <option key={r.id} value={r.id}>{r.shortName}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 mb-1 block">Comuna<span className="text-red-500">*</span></label>
                                                <select
                                                    className="w-full rounded-lg bg-[#F5F7FB] border border-[#E4E7EF] p-2 text-sm"
                                                    value={formData.comuna}
                                                    onChange={(e) => handleChange('comuna', e.target.value)}
                                                    disabled={!selectedRegionForComuna}
                                                >
                                                    <option value="">Selecciona Comuna...</option>
                                                    {comunasDeRegion.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                {errors.comuna && <p className="text-xs text-red-500 mt-1">{errors.comuna}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#6161FF] hover:bg-[#4F4FE0] text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 text-lg hover:scale-[1.01]"
                            >
                                {loading ? 'Guardando...' : 'Finalizar y Comenzar 🚀'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
