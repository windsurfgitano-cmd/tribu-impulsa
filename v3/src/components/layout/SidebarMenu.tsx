import React from 'react';
import { X, ChevronRight, Gift, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000]">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl animate-in slide-in-from-left duration-300">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-[#6161FF] to-[#00CA72]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Menú</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <X size={18} className="text-white" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <img
                            src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.email || 'User')}&background=random`}
                            alt="Profile"
                            className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
                        />
                        <div>
                            <p className="text-white font-semibold truncate max-w-[180px]">{currentUser?.displayName || 'Usuario'}</p>
                            <p className="text-white/70 text-sm truncate max-w-[180px]">{currentUser?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="p-4 space-y-2">
                    <p className="text-xs font-bold text-[#7C8193] uppercase tracking-wide px-3 mb-2">Comunidad</p>

                    <button
                        onClick={() => { onClose(); navigate('/academia'); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F7FB] transition text-left"
                    >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#EC0000] to-[#CC0000] flex items-center justify-center">
                            <span className="text-lg">🎓</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-[#181B34]">Academia</p>
                            <p className="text-xs text-[#7C8193]">Cursos y recursos</p>
                        </div>
                        <ChevronRight size={16} className="text-[#7C8193]" />
                    </button>

                    <div className="border-t border-[#E4E7EF] my-3" />

                    <button
                        onClick={() => { onClose(); navigate('/benefits'); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F7FB] transition text-left"
                    >
                        <div className="w-10 h-10 rounded-lg bg-[#00CA72]/10 flex items-center justify-center">
                            <Gift size={20} className="text-[#00CA72]" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-[#181B34]">Beneficios</p>
                            <p className="text-xs text-[#7C8193]">Descuentos exclusivos</p>
                        </div>
                        <ChevronRight size={16} className="text-[#7C8193]" />
                    </button>

                    <div className="border-t border-[#E4E7EF] my-3" />

                    <button
                        onClick={() => { onClose(); logout(); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-500 transition text-left"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
