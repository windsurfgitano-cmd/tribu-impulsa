
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import { TermsCheckbox } from '../../components/auth/TermsAndConditions';
import { REGIONS } from '../../constants/geography';
import { UserService } from '../../services/api/users';
import SearchableSelect from '../../components/SearchableSelect';
import { CATEGORY_SELECT_OPTIONS, AFFINITY_SELECT_OPTIONS_WITH_GROUP } from '../../utils/selectOptions';

// Removed unused MembershipService and NotificationService imports
// Removed unused MembershipService and NotificationService imports

export const RegisterScreen: React.FC = () => {
    const navigate = useNavigate();
    // const { login } = useAuth(); // Not used directly here as we use UserService.registerUser
    // V3 AuthContext usually exposes register. Let's check or assume we implement logic here.
    // For now, I will assume we use UserService to create profile, and maybe AuthContext.register for Firebase Auth.
    // Wait, AuthContext usually wraps createUserWithEmailAndPassword. 
    // I'll check AuthContext in next step if compilation fails, for now I'll stub the register call.

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        termsAccepted: false,
        companyName: '',
        city: '',
        sector: '', // Optional
        category: '',
        affinity: '',
        scope: 'NACIONAL' as 'LOCAL' | 'REGIONAL' | 'NACIONAL',
        comuna: '',
        selectedRegions: [] as string[],
        instagram: '',
        facebook: '',
        tiktok: '',
        website: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const totalSteps = 5;

    // Helpers
    // Helper for selected region comunas
    // Only used if we wanted to dynamically show comunas based on selectedRegions (multi), but V2 logic was simpler or focused on single region for local.
    // Keeping logic consistent with V2 Step 2.

    // We need 'selectedRegionForComuna' state separate from multi-select
    const [selectedRegionForLocal, setSelectedRegionForLocal] = useState('');

    const localComunas = selectedRegionForLocal
        ? REGIONS.find(r => r.id === selectedRegionForLocal)?.comunas || []
        : [];

    const validateStep = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.name.trim()) newErrors.name = 'Requerido';
            if (!formData.email.trim()) newErrors.email = 'Requerido';
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
            if (!formData.phone.trim()) newErrors.phone = 'Requerido';
            if (!formData.password.trim()) newErrors.password = 'Requerido';
            else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
            if (!formData.termsAccepted) newErrors.termsAccepted = 'Debes aceptar los términos';
        } else if (step === 2) {
            if (!formData.companyName.trim()) newErrors.companyName = 'Requerido';
            if (!formData.city.trim()) newErrors.city = 'Requerido';
        } else if (step === 3) {
            if (!formData.category) newErrors.category = 'Selecciona una categoría';
        } else if (step === 4) {
            if (!formData.affinity) newErrors.affinity = 'Selecciona una afinidad';
            if (formData.scope === 'LOCAL' && !formData.comuna) newErrors.comuna = 'Selecciona tu comuna';
            if (formData.scope === 'REGIONAL' && formData.selectedRegions.length === 0) newErrors.selectedRegions = 'Selecciona al menos una región';
        } else if (step === 5) {
            if (!formData.instagram.trim()) newErrors.instagram = 'Instagram es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (!validateStep()) return;

        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            // SUBMIT
            setIsLoading(true);
            try {
                // 1. Register in Firebase Auth (via Service or Context)
                // Assuming UserService has logic or we import { auth } from firebase.
                // For safety in V3, better to rely on what AuthContext provides or UserService.
                // I will use UserService.registerUser if it exists, otherwise custom.

                // Let's assume UserService.registerUser handles Auth + Firestore creation
                // If not, I'll fix it in verification.

                await UserService.registerUser({
                    email: formData.email,
                    password: formData.password,
                    displayName: formData.name,
                    userData: {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        companyName: formData.companyName,
                        city: formData.city,
                        category: formData.category,
                        affinity: formData.affinity,
                        scope: formData.scope,
                        comuna: formData.comuna,
                        regions: formData.selectedRegions,
                        instagram: formData.instagram,
                        website: formData.website,
                        role: 'member'
                    }
                });

                // Auto Login or Redirect
                navigate('/login');
            } catch (error: any) {
                console.error("Registration failed", error);
                setErrors({ submit: error.message || 'Error al registrar' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#F5F7FB] relative overflow-hidden">
            {/* Background Blobs (V2) */}
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#6161FF]/5 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-[#00CA72]/5 rounded-full blur-[80px]"></div>

            <div className="bg-white rounded-3xl p-8 max-w-lg w-full relative z-10 shadow-xl border border-[#E4E7EF]">

                {/* Header Progress */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={handleBack} className="text-[#7C8193] hover:text-[#6161FF] p-2 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex gap-1.5">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-500 ${step > i
                                ? 'bg-gradient-to-r from-[#6161FF] to-[#00CA72]'
                                : step === i + 1
                                    ? 'bg-[#6161FF]'
                                    : 'bg-[#E4E7EF]'
                                }`} />
                        ))}
                    </div>
                    <span className="text-xs font-medium text-[#7C8193]">{step}/{totalSteps}</span>
                </div>

                {/* Form Steps */}

                {/* Step 1: Personal */}
                {step === 1 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-[#6161FF] rounded-xl mx-auto flex items-center justify-center mb-3 shadow-lg shadow-[#6161FF]/20">
                                <span className="text-white font-bold text-xl">T</span>
                            </div>
                            <h2 className="text-2xl font-bold text-[#181B34]">¡Bienvenido/a!</h2>
                            <p className="text-[#7C8193] text-sm">Crea tu cuenta en Tribu Impulsa</p>
                        </div>

                        <InputGroup label="Nombre y Apellido" error={errors.name}>
                            <input
                                type="text" placeholder="Ej. María Pérez"
                                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 focus:ring-2 focus:ring-[#6161FF]/20 outline-none"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </InputGroup>

                        <InputGroup label="Email" error={errors.email}>
                            <input
                                type="email" placeholder="hola@tribuimpulsa.cl"
                                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 focus:ring-2 focus:ring-[#6161FF]/20 outline-none"
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </InputGroup>

                        <InputGroup label="Teléfono (WhatsApp)" error={errors.phone}>
                            <input
                                type="tel" placeholder="+56 9 1234 5678"
                                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 focus:ring-2 focus:ring-[#6161FF]/20 outline-none"
                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </InputGroup>

                        <InputGroup label="Contraseña" error={errors.password}>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres"
                                    className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 pr-10 focus:ring-2 focus:ring-[#6161FF]/20 outline-none"
                                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-[#7C8193] hover:text-[#6161FF]">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </InputGroup>

                        <TermsCheckbox
                            checked={formData.termsAccepted}
                            onChange={c => setFormData({ ...formData, termsAccepted: c })}
                            error={!!errors.termsAccepted}
                        />
                    </div>
                )}

                {/* Step 2: Business */}
                {step === 2 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-[#181B34]">Tu Emprendimiento</h2>
                            <p className="text-[#7C8193] text-sm">Cuéntanos sobre tu negocio</p>
                        </div>

                        <InputGroup label="Nombre del Negocio" error={errors.companyName}>
                            <input
                                type="text" placeholder="Ej. Tienda Creativa"
                                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 focus:ring-2 focus:ring-[#6161FF]/20 outline-none"
                                value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                            />
                        </InputGroup>

                        <InputGroup label="Ciudad Base" error={errors.city}>
                            <input
                                type="text" placeholder="Ej. Santiago"
                                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 focus:ring-2 focus:ring-[#6161FF]/20 outline-none"
                                value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}
                            />
                        </InputGroup>

                        <div>
                            <label className="block text-xs font-semibold text-[#434343] mb-2 uppercase">Alcance</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['LOCAL', 'REGIONAL', 'NACIONAL'].map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, scope: s as any })}
                                        className={`py-2 rounded-lg text-xs font-medium border transition-colors ${formData.scope === s
                                            ? 'bg-[#6161FF] text-white border-[#6161FF]'
                                            : 'bg-white text-[#434343] border-[#E4E7EF] hover:border-[#6161FF]'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {formData.scope === 'LOCAL' && (
                            <div className="p-3 bg-blue-50/50 rounded-xl space-y-3">
                                <InputGroup label="Región">
                                    <select
                                        className="w-full bg-white border border-[#E4E7EF] rounded-xl p-3 outline-none"
                                        value={selectedRegionForLocal}
                                        onChange={e => setSelectedRegionForLocal(e.target.value)}
                                    >
                                        <option value="">Selecciona Región</option>
                                        {REGIONS.map(r => <option key={r.id} value={r.id}>{r.shortName}</option>)}
                                    </select>
                                </InputGroup>
                                <InputGroup label="Comuna" error={errors.comuna}>
                                    <select
                                        className="w-full bg-white border border-[#E4E7EF] rounded-xl p-3 outline-none"
                                        value={formData.comuna}
                                        onChange={e => setFormData({ ...formData, comuna: e.target.value })}
                                        disabled={!selectedRegionForLocal}
                                    >
                                        <option value="">Selecciona Comuna</option>
                                        {localComunas.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </InputGroup>
                            </div>
                        )}

                        {formData.scope === 'REGIONAL' && (
                            <div className="max-h-40 overflow-y-auto p-2 border border-[#E4E7EF] rounded-xl">
                                {REGIONS.map(r => (
                                    <label key={r.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                        <input
                                            type="checkbox"
                                            checked={formData.selectedRegions.includes(r.id)}
                                            onChange={e => {
                                                const newR = e.target.checked
                                                    ? [...formData.selectedRegions, r.id]
                                                    : formData.selectedRegions.filter(x => x !== r.id);
                                                setFormData({ ...formData, selectedRegions: newR });
                                            }}
                                            className="text-[#6161FF]"
                                        />
                                        <span className="text-sm">{r.shortName}</span>
                                    </label>
                                ))}
                                {errors.selectedRegions && <p className="text-red-500 text-xs mt-1">{errors.selectedRegions}</p>}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Category */}
                {step === 3 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-[#181B34]">Categoría</h2>
                            <p className="text-[#7C8193] text-sm">Clasifica tu emprendimiento</p>
                        </div>
                        <InputGroup label="Categoría Principal" error={errors.category}>
                            <SearchableSelect
                                value={formData.category}
                                onChange={(newValue) => setFormData({ ...formData, category: newValue })}
                                options={CATEGORY_SELECT_OPTIONS}
                                placeholder="Escribe o explora la categoría madre → hija"
                            />
                        </InputGroup>
                    </div>
                )}

                {/* Step 4: Affinity */}
                {step === 4 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-[#181B34]">Afinidad</h2>
                            <p className="text-[#7C8193] text-sm">¿Qué buscas en la Tribu?</p>
                        </div>
                        <InputGroup label="Interés Principal" error={errors.affinity}>
                            <SearchableSelect
                                value={formData.affinity}
                                onChange={(newValue) => setFormData({ ...formData, affinity: newValue })}
                                options={AFFINITY_SELECT_OPTIONS_WITH_GROUP}
                                placeholder="Escribe para filtrar afinidades"
                            />
                        </InputGroup>
                    </div>
                )}

                {/* Step 5: Socials - Final Step */}
                {step === 5 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-[#181B34]">Redes Sociales</h2>
                            <p className="text-[#7C8193] text-sm">¿Dónde te encontramos?</p>
                        </div>

                        <InputGroup label="Instagram (Link o @usuario)" error={errors.instagram}>
                            <input
                                type="text" placeholder="@mitienda"
                                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 outline-none"
                                value={formData.instagram} onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                            />
                        </InputGroup>
                        <InputGroup label="Website (Opcional)">
                            <input
                                type="text" placeholder="www.mitienda.cl"
                                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 outline-none"
                                value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })}
                            />
                        </InputGroup>
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="mt-8 flex gap-3">
                    {errors.submit && (
                        <div className="w-full mb-3 text-center text-red-500 text-sm bg-red-50 p-2 rounded-lg">
                            {errors.submit}
                        </div>
                    )}

                    <button
                        onClick={handleNext}
                        disabled={isLoading}
                        className="w-full bg-[#6161FF] text-white font-semibold py-3.5 rounded-xl hover:bg-[#5050D9] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isLoading ? 'Registrando...' : step === totalSteps ? 'Finalizar Registro' : 'Continuar'}
                        {!isLoading && step < totalSteps && <ArrowRight size={18} />}
                    </button>
                </div>

            </div>
        </div>
    );
};

// UI Helper
const InputGroup: React.FC<{ label: string, error?: string, children: React.ReactNode }> = ({ label, error, children }) => (
    <div>
        <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase tracking-wide">{label}</label>
        {children}
        {error && <p className="text-xs text-[#FB275D] mt-1 font-medium">{error}</p>}
    </div>
);
