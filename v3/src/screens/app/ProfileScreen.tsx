import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserService } from '../../services/api/users';
import {
    Edit2, LogOut, Save, User as UserIcon, CreditCard, HelpCircle,
    FileText, ChevronRight, Bell, Shield, Type, Moon, Globe, MessageCircle
} from 'lucide-react';

// Tipos para las opciones del menú
interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    subLabel?: string;
    onClick?: () => void;
    isDanger?: boolean;
    hasToggle?: boolean;
    toggleValue?: boolean;
    onToggle?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
    icon, label, subLabel, onClick, isDanger, hasToggle, toggleValue, onToggle
}) => (
    <button
        onClick={hasToggle ? onToggle : onClick}
        className={`w-full flex items-center justify-between p-4 hover:bg-[#F5F7FB] transition-colors group border-b border-[#F5F7FB] last:border-0`}
    >
        <div className="flex items-center gap-4">
            <span className={`
                p-2 rounded-xl transition-colors
                ${isDanger
                    ? 'bg-[#FB275D]/10 text-[#FB275D] group-hover:bg-[#FB275D] group-hover:text-white'
                    : 'bg-[#6161FF]/10 text-[#6161FF] group-hover:bg-[#6161FF] group-hover:text-white'}
            `}>
                {icon}
            </span>
            <div className="text-left">
                <span className={`block font-semibold ${isDanger ? 'text-[#FB275D]' : 'text-[#181B34]'}`}>
                    {label}
                </span>
                {subLabel && <span className="text-xs text-[#7C8193]">{subLabel}</span>}
            </div>
        </div>

        {hasToggle ? (
            <div className={`
                w-11 h-6 rounded-full transition-colors relative
                ${toggleValue ? 'bg-[#00CA72]' : 'bg-[#E4E7EF]'}
            `}>
                <div className={`
                    w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform
                    ${toggleValue ? 'left-[22px]' : 'left-0.5'}
                `} />
            </div>
        ) : (
            <ChevronRight size={18} className="text-[#B3B8C6]" />
        )}
    </button>
);

export const ProfileScreen: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Settings State (Mocked for now, implies parity features)
    const [fontSize, setFontSize] = useState(1); // 0: Small, 1: Normal, 2: Large
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        instagram: '',
        city: ''
    });

    useEffect(() => {
        const loadProfile = async () => {
            if (currentUser?.email) {
                const data = await UserService.getUserByEmail(currentUser.email);
                if (data) {
                    setProfile(data);
                    setFormData({
                        name: data.name || '',
                        category: data.category || '',
                        instagram: data.instagram || '',
                        city: data.city || ''
                    });
                }
            }
            setLoading(false);
        };
        loadProfile();
    }, [currentUser]);

    const handleSave = async () => {
        if (!currentUser?.email) return;
        setLoading(true);
        await UserService.updateUserByEmail(currentUser.email, formData);
        const updated = await UserService.getUserByEmail(currentUser.email);
        setProfile(updated);
        setIsEditing(false);
        setLoading(false);
    };

    if (loading && !profile) return <div className="p-10 text-center text-[#7C8193]">Cargando perfil...</div>;

    const avatarUrl = profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.email || 'User')}&background=random`;

    return (
        <div className="p-5 pb-24 min-h-screen bg-[#F5F7FB]">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-[#181B34]">Ajustes</h1>
                <p className="text-[#7C8193] text-sm">Gestiona tu cuenta y preferencias</p>
            </header>

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl p-6 mb-6 border border-[#E4E7EF] shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 rounded-full border-2 border-[#F5F7FB] overflow-hidden">
                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-[#181B34]">{profile?.name || currentUser?.email}</h2>
                        <span className="inline-block bg-[#6161FF]/10 text-[#6161FF] text-xs font-bold px-2 py-0.5 rounded-md mt-1">
                            {profile?.category || 'Sin Categoría'}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="w-10 h-10 rounded-full bg-[#F5F7FB] flex items-center justify-center text-[#6161FF] hover:bg-[#6161FF]/10 transition-colors"
                    >
                        <Edit2 size={20} />
                    </button>
                </div>

                {/* Decorative background blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#6161FF]/5 rounded-full blur-2xl" />
            </div>

            {isEditing && (
                <div className="bg-white rounded-2xl p-6 mb-6 border border-[#E4E7EF] shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-[#181B34] mb-2">Editar Información</h3>
                    <div>
                        <label className="text-xs text-[#7C8193] uppercase font-bold mb-1 block">Nombre</label>
                        <input
                            className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:outline-none focus:border-[#6161FF]"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-[#7C8193] uppercase font-bold mb-1 block">Categoría</label>
                        <input
                            className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:outline-none focus:border-[#6161FF]"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-[#7C8193] uppercase font-bold mb-1 block">Instagram</label>
                        <input
                            className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:outline-none focus:border-[#6161FF]"
                            value={formData.instagram}
                            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-[#7C8193] uppercase font-bold mb-1 block">Ciudad</label>
                        <input
                            className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:outline-none focus:border-[#6161FF]"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        className="w-full bg-[#00CA72] hover:bg-[#00B365] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 shadow-sm"
                    >
                        <Save size={18} /> Guardar Cambios
                    </button>
                </div>
            )}

            {/* Accessibility Section: Font Size & Dark Mode */}
            <h3 className="text-xs font-bold text-[#7C8193] uppercase tracking-wider mb-3 px-1">Visualización</h3>
            <div className="bg-white rounded-2xl border border-[#E4E7EF] shadow-sm overflow-hidden mb-6">
                <div className="p-4 border-b border-[#F5F7FB]">
                    <div className="flex items-center gap-4 mb-3">
                        <span className="p-2 rounded-xl bg-[#6161FF]/10 text-[#6161FF]">
                            <Type size={20} />
                        </span>
                        <span className="font-semibold text-[#181B34]">Tamaño de Texto</span>
                    </div>
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-bold text-[#7C8193]">A</span>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="1"
                            value={fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                            className="w-full mx-4 h-2 bg-[#F5F7FB] rounded-lg appearance-none cursor-pointer accent-[#6161FF]"
                        />
                        <span className="text-lg font-bold text-[#181B34]">A</span>
                    </div>
                </div>
                {/* <MenuItem 
                    icon={<Moon size={20} />} 
                    label="Modo Oscuro" 
                    subLabel="Próximamente"
                    hasToggle 
                    toggleValue={darkMode} 
                    onToggle={() => setDarkMode(!darkMode)}
                /> */}
            </div>

            {/* Account Settings */}
            <h3 className="text-xs font-bold text-[#7C8193] uppercase tracking-wider mb-3 px-1">Cuenta</h3>
            <div className="bg-white rounded-2xl border border-[#E4E7EF] shadow-sm overflow-hidden mb-6">
                <MenuItem icon={<UserIcon size={20} />} label="Datos Personales" subLabel="Actualizar información" onClick={() => setIsEditing(true)} />
                <MenuItem icon={<CreditCard size={20} />} label="Membresía" subLabel="Plan Básico activo" />
                <MenuItem icon={<Shield size={20} />} label="Seguridad" subLabel="Contraseña y acceso" />
                <MenuItem
                    icon={<Bell size={20} />}
                    label="Notificaciones"
                    hasToggle
                    toggleValue={notifications}
                    onToggle={() => setNotifications(!notifications)}
                />
            </div>

            {/* Support */}
            <h3 className="text-xs font-bold text-[#7C8193] uppercase tracking-wider mb-3 px-1">Ayuda</h3>
            <div className="bg-white rounded-2xl border border-[#E4E7EF] shadow-sm overflow-hidden mb-6">
                <MenuItem icon={<HelpCircle size={20} />} label="Centro de Ayuda" />
                <MenuItem icon={<MessageCircle size={20} />} label="Soporte Técnico" subLabel="Contactar al equipo" />
                <MenuItem icon={<FileText size={20} />} label="Términos y Condiciones" />
                <MenuItem icon={<Globe size={20} />} label="Versión de la App" subLabel="v3.0.1 (Beta)" />
            </div>

            {/* Danger Zone */}
            <div className="space-y-4">
                <button
                    onClick={logout}
                    className="w-full bg-[#FB275D]/10 text-[#FB275D] hover:bg-[#FB275D]/20 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-[#FB275D]/10"
                >
                    <LogOut size={20} /> Cerrar Sesión
                </button>
            </div>

        </div>
    );
};
