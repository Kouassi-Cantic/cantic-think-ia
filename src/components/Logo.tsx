import React, { useState } from 'react';
import { BRANDING } from '../constants.ts';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ variant = 'dark', className = "" }) => {
  const [imageError, setImageError] = useState(false);
  
  // Détermine si on doit afficher l'image externe
  const showExternalLogo = BRANDING.logoUrl && BRANDING.logoUrl.length > 0 && !imageError;

  return (
    <div className={`flex items-center group transition-all duration-500 ${className}`}>
      {/* Conteneur de l'icône - Fond blanc forcé pour faire ressortir le logo sombre */}
      <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-xl transition-all duration-700 group-hover:scale-110 overflow-hidden bg-white ${
        variant === 'light' 
        ? 'border-white/20' 
        : 'border-slate-100'
      }`}>
        {showExternalLogo ? (
          <img 
            src={BRANDING.logoUrl} 
            alt={BRANDING.name} 
            className="w-full h-full p-1.5 object-contain transition-transform duration-500 group-hover:scale-110"
            onError={() => {
              console.warn("Logo Cantic IA : Échec du chargement, basculement sur le fallback.");
              setImageError(true);
            }}
          />
        ) : (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-cantic-green">
            {/* Symbole Institutionnel Mate Masie - Fallback en couleur de marque */}
            <rect x="30" y="30" width="40" height="40" stroke="currentColor" strokeWidth="6" />
            <circle cx="50" cy="15" r="8" fill="currentColor" className="animate-pulse" />
            <circle cx="50" cy="85" r="8" fill="currentColor" />
            <circle cx="15" cy="50" r="8" fill="currentColor" />
            <circle cx="85" cy="50" r="8" fill="currentColor" />
            <path d="M50 25V30M50 70V75M25 50H30M70 50H75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        )}
        
        {/* Effet de brillance discret au survol */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Logo;
