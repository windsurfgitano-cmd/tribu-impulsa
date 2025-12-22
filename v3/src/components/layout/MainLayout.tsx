import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { SidebarMenu } from './SidebarMenu';
import { WhatsAppFloat } from '../ui/WhatsAppFloat';

export const MainLayout: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F5F7FB] text-[#434343]">
            {/* Sidebar Overlay */}
            <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* Content Area */}
            <div className="pb-24">
                <Outlet />
            </div>

            {/* Persistent Navigation */}
            <BottomNav onMenuClick={() => setIsMenuOpen(true)} />

            {/* WhatsApp Support Float */}
            <WhatsAppFloat />
        </div>
    );
};
