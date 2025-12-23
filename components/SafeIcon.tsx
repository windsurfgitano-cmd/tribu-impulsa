// components/SafeIcon.tsx
// Wrapper seguro para iconos de lucide-react que pueden ser bloqueados por extensiones

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SafeIconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
}

export const SafeIcon: React.FC<SafeIconProps> = ({ 
  icon: Icon, 
  size = 20, 
  className = '',
  fallback = <span className={className} style={{ display: 'inline-block', width: size, height: size }}>◆</span>
}) => {
  try {
    if (!Icon || typeof Icon !== 'function') {
      console.warn('[SafeIcon] Ícono bloqueado por extensión del navegador, usando fallback');
      return <>{fallback}</>;
    }
    return <Icon size={size} className={className} />;
  } catch (error) {
    console.warn('[SafeIcon] Error renderizando ícono:', error);
    return <>{fallback}</>;
  }
};

export default SafeIcon;

