'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface LogoProps {
  variant?: 'full' | 'icon' | 'compact';
  className?: string;
  showPulse?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'full', 
  className = '',
  showPulse = false 
}) => {
  const { isMobile, isTablet } = useDeviceDetection();

  // Responsive sizing: 40px mobile, 48px tablet, 56px desktop for icon
  const getIconSize = () => {
    if (isMobile) return 40;
    if (isTablet) return 48;
    return 56;
  };

  // Responsive sizing for full logo
  const getFullLogoSize = () => {
    if (isMobile) return { icon: 32, text: 'text-md' };
    if (isTablet) return { icon: 40, text: 'text-lg' };
    return { icon: 48, text: 'text-xl' };
  };

  const iconSize = getIconSize();
  const fullSize = getFullLogoSize();

  if (variant === 'icon') {
    return (
      <div 
        className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
        role="img"
        aria-label="Is It Safe To Travel logo"
      >
        <div 
          className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
          style={{ 
            width: iconSize, 
            height: iconSize,
            minWidth: iconSize,
            minHeight: iconSize
          }}
        >
          <Shield className="text-white" style={{ width: iconSize * 0.6, height: iconSize * 0.6 }} />
        </div>
        {showPulse && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75" />
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div 
        className={`flex items-center gap-2 ${className}`}
        role="img"
        aria-label="Is It Safe To Travel"
      >
        <div 
          className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20"
        >
          <Shield className="w-5 h-5 text-white" />
        </div>
      </div>
    );
  }

  // Full logo (default)
  return (
    <div 
      className={`flex items-center gap-3 group ${className}`}
      role="img"
      aria-label="Is It Safe To Travel"
    >
      <div 
        className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform duration-500 shrink-0"
        style={{ 
          width: fullSize.icon, 
          height: fullSize.icon,
          minWidth: fullSize.icon,
          minHeight: fullSize.icon
        }}
      >
        <Shield className="text-white" style={{ width: fullSize.icon * 0.6, height: fullSize.icon * 0.6 }} />
      </div>
      
      <div className="flex flex-col">
        <h1 className={`font-black text-slate-900 dark:text-white tracking-tighter leading-none ${fullSize.text}`}>
          Is It Safe To Travel?
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {isMobile ? 'Live' : 'Global Scan Profile'}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Mobile-optimized inline logo for headers and navigation
 */
export const InlineLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <Shield className="w-5 h-5 text-emerald-500" />
    <span className="text-sm font-bold text-slate-900 dark:text-white">
      Is It Safe?
    </span>
  </div>
);
