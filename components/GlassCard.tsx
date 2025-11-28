import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = "", 
  padding = "p-6" 
}) => {
  return (
    <div className={`
      relative overflow-hidden
      bg-white/10 
      backdrop-blur-xl 
      border border-white/20 
      shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] 
      rounded-2xl 
      text-white 
      ${padding} 
      ${className}
    `}>
      {/* Optional shine effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
