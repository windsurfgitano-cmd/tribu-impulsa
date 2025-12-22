
import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    padding?: string;
    onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = "",
    padding = "p-5",
    onClick
}) => {
    return (
        <div
            onClick={onClick}
            className={`
      relative overflow-hidden
      bg-white
      border border-[#E4E7EF]
      shadow-[0_4px_20px_rgba(0,0,0,0.05)]
      rounded-2xl 
      text-[#434343]
      ${padding} 
      ${className}
    `}>
            {children}
        </div>
    );
};
