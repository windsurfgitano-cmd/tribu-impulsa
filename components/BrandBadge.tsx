import React from 'react';
import { Building2, Store, Briefcase, Crown } from 'lucide-react';

interface BrandBadgeProps {
  companyName: string;
  category?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'glass' | 'featured';
  showIcon?: boolean;
  className?: string;
}

// Determinar el icono basado en la categoría
const getCategoryIcon = (category?: string): React.ReactNode => {
  if (!category) return <Store size={14} />;
  
  const lowerCategory = category.toLowerCase();
  
  if (lowerCategory.includes('servicio') || lowerCategory.includes('profesional')) {
    return <Briefcase size={14} />;
  }
  if (lowerCategory.includes('negocio') || lowerCategory.includes('comercio')) {
    return <Building2 size={14} />;
  }
  return <Store size={14} />;
};

export const BrandBadge: React.FC<BrandBadgeProps> = ({
  companyName,
  category,
  size = 'md',
  variant = 'default',
  showIcon = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const variantClasses = {
    default: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    gradient: 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg',
    glass: 'bg-white/80 backdrop-blur-sm text-gray-800 border border-white/30 shadow-sm',
    featured: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg font-bold ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {showIcon && getCategoryIcon(category)}
      <span className="truncate max-w-[180px]">{companyName}</span>
      {variant === 'featured' && <Crown size={12} className="text-amber-100" />}
    </div>
  );
};

// Componente de tarjeta de perfil prominente
interface ProminentProfileCardProps {
  companyName: string;
  ownerName: string;
  category: string;
  avatarUrl?: string;
  instagram?: string;
  affinity?: string;
  matchScore?: number;
  onView?: () => void;
  onWhatsApp?: () => void;
  featured?: boolean;
}

export const ProminentProfileCard: React.FC<ProminentProfileCardProps> = ({
  companyName,
  ownerName,
  category,
  avatarUrl,
  instagram,
  affinity,
  matchScore,
  onView,
  onWhatsApp,
  featured = false
}) => {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=6161FF&color=fff&bold=true`;

  return (
    <div 
      className={`relative bg-white rounded-2xl overflow-hidden border transition-all hover:shadow-lg cursor-pointer ${
        featured 
          ? 'border-amber-300 ring-2 ring-amber-200' 
          : 'border-gray-100 hover:border-indigo-200'
      }`}
      onClick={onView}
    >
      {/* Featured badge */}
      {featured && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
          ⭐ DESTACADO
        </div>
      )}

      {/* Header con gradiente */}
      <div className={`h-3 ${featured ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`} />

      <div className="p-4">
        {/* Avatar y Marca prominente */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative">
            <img 
              src={avatarUrl || defaultAvatar}
              alt={companyName}
              className={`w-16 h-16 rounded-xl object-cover shadow-md ${featured ? 'ring-2 ring-amber-300' : 'ring-2 ring-indigo-100'}`}
            />
            {matchScore && (
              <div className={`absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                matchScore >= 90 ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white'
              }`}>
                {matchScore}%
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* MARCA PROMINENTE */}
            <h3 className="font-black text-lg text-gray-900 leading-tight truncate">
              {companyName}
            </h3>
            <p className="text-sm text-gray-500 truncate">por {ownerName}</p>
            
            {/* Categoría */}
            <div className="flex items-center gap-1 mt-1">
              <Store size={12} className="text-indigo-500" />
              <span className="text-xs text-indigo-600 font-medium truncate">{category}</span>
            </div>
          </div>
        </div>

        {/* Tags de afinidad */}
        {affinity && (
          <div className="mb-3">
            <span className="inline-block text-[10px] font-medium bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
              🎯 {affinity}
            </span>
          </div>
        )}

        {/* Instagram */}
        {instagram && (
          <div className="flex items-center gap-1 text-xs text-pink-500 mb-3">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
            </svg>
            <span>@{instagram.replace('@', '')}</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2">
          {onView && (
            <button
              onClick={(e) => { e.stopPropagation(); onView(); }}
              className="flex-1 py-2 px-3 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              Ver perfil →
            </button>
          )}
          {onWhatsApp && (
            <button
              onClick={(e) => { e.stopPropagation(); onWhatsApp(); }}
              className="py-2 px-3 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20BA5C] transition-colors"
            >
              💬
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandBadge;

