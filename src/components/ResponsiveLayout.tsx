'use client';

import React from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const { isDesktop, isHydrated } = useDeviceDetection();

  return (
    <div className={`layout min-h-screen ${isDesktop ? 'layout--desktop' : 'layout--mobile'} ${!isHydrated ? 'invisible' : 'visible'}`}>
      {children}
    </div>
  );
};
