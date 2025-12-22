import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Settings, Gift, Menu, CheckCircle } from 'lucide-react';

interface BottomNavProps {
    onMenuClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onMenuClick }) => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E4E7EF] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pt-safe pb-safe h-[70px]">
            <div className="flex justify-around items-center px-2 h-full">
                {/* 1. Menú (Sidebar Trigger) */}
                <button
                    onClick={onMenuClick}
                    className="flex flex-col items-center gap-1 min-w-[64px] text-[#7C8193] hover:text-[#181B34] transition-colors"
                >
                    <Menu size={24} />
                    <span className="text-[10px] font-medium">Menú</span>
                </button>

                {/* 2. Inicio */}
                <NavButton
                    to="/dashboard"
                    icon={<Home size={24} />}
                    label="Inicio"
                    isActive={location.pathname === '/dashboard'}
                />

                {/* 3. Mi Tribu (Center Highlight) */}
                <div className="relative -top-5">
                    <button
                        onClick={() => navigate('/checklist')}
                        className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg border-4 border-[#F5F7FB] transition-transform active:scale-95 ${location.pathname === '/checklist' ? 'bg-[#E91E63] text-white' : 'bg-[#181B34] text-white'
                            }`}
                    >
                        <CheckCircle size={24} />
                    </button>
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#181B34] whitespace-nowrap">
                        Mi Tribu
                    </span>
                </div>

                {/* 4. Beneficios */}
                <NavButton
                    to="/benefits"
                    icon={<Gift size={24} />}
                    label="Beneficios"
                    isActive={location.pathname === '/benefits'}
                />

                {/* 5. Ajustes */}
                <NavButton
                    to="/profile"
                    icon={<Settings size={24} />}
                    label="Ajustes"
                    isActive={location.pathname === '/profile'}
                />
            </div>
        </div>
    );
};

interface NavButtonProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ to, icon, label, isActive }) => {
    return (
        <NavLink
            to={to}
            className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors duration-200 ${isActive ? 'text-[#6161FF]' : 'text-[#7C8193] hover:text-[#181B34]'
                }`}
        >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
    );
};
