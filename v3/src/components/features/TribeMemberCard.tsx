
import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Instagram, MapPin } from 'lucide-react';

interface TribeMemberProps {
    name: string;
    category: string;
    instagram: string;
    city?: string;
    imageUrl?: string;
}

export const TribeMemberCard: React.FC<TribeMemberProps> = ({ name, category, instagram, city, imageUrl }) => {
    // Generador de avatar simple si no hay imagen
    const avatar = imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

    return (
        <GlassCard className="flex flex-col items-center text-center p-4">
            <div className="relative mb-3">
                <img
                    src={avatar}
                    alt={name}
                    className="w-20 h-20 rounded-full border-2 border-white/20 shadow-lg object-cover"
                />
                <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-[#121212]" />
            </div>

            <h3 className="text-[#181B34] font-bold text-lg mb-1">{name}</h3>
            <p className="text-[#6161FF] text-xs uppercase tracking-wider mb-3">{category}</p>

            {city && (
                <div className="flex items-center gap-1 text-[#7C8193] text-xs mb-4">
                    <MapPin size={12} />
                    <span>{city}</span>
                </div>
            )}

            <a
                href={`https://instagram.com/${instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
                <Instagram size={16} />
                <span>Seguir</span>
            </a>
        </GlassCard>
    );
};
