import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface LeedoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  variant?: 'vertical' | 'horizontal';
  customLogoUrl?: string | null;
}

export const LeedoLogo: React.FC<LeedoLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  variant = 'horizontal',
  customLogoUrl: customLogoProp,
}) => {
  const [imageError, setImageError] = useState(false);
  let appLogoUrl: string | null = null;
  try {
    const appContext = useApp();
    appLogoUrl = appContext?.customLogoUrl || null;
  } catch (e) {
    // If rendered outside AppProvider
  }

  const effectiveLogoUrl = customLogoProp !== undefined ? customLogoProp : appLogoUrl;

  // Brand red colors of LEEDO
  const redColor = '#E31B23';

  // Sizing mappings
  const iconSizes = {
    sm: 32,
    md: 44,
    lg: 60,
    xl: 90,
  };

  const currentSize = iconSizes[size];

  // SVG reproducing the two joyous dancing/running children figures from the official LEEDO logo
  const FiguresSVG = (
    <svg
      width={currentSize}
      height={currentSize * 1.15}
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200"
    >
      {/* Left Child Head */}
      <circle cx="32" cy="22" r="14" fill={redColor} />
      
      {/* Right Child Head */}
      <circle cx="68" cy="15" r="14" fill={redColor} />

      {/* Body lines & connecting arms in continuous organic path */}
      {/* Left Child Body and Limbs */}
      <path
        d="M 32 36 C 30 45, 26 58, 22 72 C 20 80, 16 90, 24 94 C 32 98, 38 88, 38 78 C 38 68, 42 60, 48 76 C 52 86, 56 94, 62 92 C 68 90, 66 82, 60 72 C 55 64, 48 50, 44 40 Z"
        fill={redColor}
      />

      {/* Connection / holding hands & Left arm waving */}
      <path
        d="M 30 44 C 20 46, 12 50, 6 48 C 0 46, 2 38, 12 39 C 20 40, 26 42, 34 42 Z"
        fill={redColor}
      />

      {/* Right Child Torso, Raised arm, and legs */}
      <path
        d="M 68 28 C 76 26, 88 18, 96 14 C 100 12, 102 18, 96 22 C 88 28, 78 36, 72 40 Z"
        fill={redColor}
      />
      
      {/* Dynamic Hand clasp bridge between the two children */}
      <path
        d="M 32 42 C 45 36, 58 32, 70 36 C 66 42, 54 42, 42 46 Z"
        fill={redColor}
      />

      {/* Right Child Body & Leg Motion */}
      <path
        d="M 68 36 C 66 50, 64 64, 70 76 C 74 84, 80 94, 88 88 C 94 82, 86 72, 80 62 C 76 54, 78 44, 74 38 Z"
        fill={redColor}
      />
      <path
        d="M 52 64 C 58 60, 66 60, 70 66 C 72 72, 66 78, 58 76 C 52 74, 48 70, 52 64 Z"
        fill={redColor}
      />
    </svg>
  );

  const LogoVisual = effectiveLogoUrl && !imageError ? (
    <img
      src={effectiveLogoUrl}
      alt="LEEDO Logo"
      onError={() => setImageError(true)}
      style={{
        height: variant === 'vertical' ? currentSize * 1.3 : currentSize,
        maxHeight: variant === 'vertical' ? 100 : 48,
        maxWidth: variant === 'vertical' ? 160 : 130,
      }}
      className="object-contain shrink-0 rounded-lg drop-shadow-xs transition-transform"
    />
  ) : (
    FiguresSVG
  );

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {LogoVisual}
        <div className="mt-2 tracking-tight">
          <span className="font-extrabold text-2xl md:text-3xl text-[#E31B23] tracking-widest block font-display leading-none">
            LEEDO
          </span>
          {showSubtitle && (
            <span className="text-[10px] sm:text-xs text-slate-600 font-medium tracking-wide mt-1 block max-w-[200px]">
              Local Education & Economic Development Organization
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {LogoVisual}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-black text-2xl tracking-wider text-[#E31B23] font-display leading-tight">
            LEEDO
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-rose-50 text-[#E31B23] rounded-full border border-rose-200">
            CPMS
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline-block leading-tight">
            Child Protection & Case Management System
          </span>
        )}
      </div>
    </div>
  );
};
