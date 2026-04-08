'use client';

import React from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const { isMobile, isTablet, isDesktop } = useDeviceDetection();

  const layoutClass = isMobile 
    ? 'layout--mobile' 
    : isTablet 
    ? 'layout--tablet' 
    : 'layout--desktop';

  return (
    <div className={`layout min-h-screen transition-colors duration-500 ${layoutClass}`}>
      {children}
    </div>
  );
};
