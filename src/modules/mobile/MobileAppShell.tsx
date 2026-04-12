'use client';

import React, { useState } from 'react';
import { BottomTabBar, MobileTab } from './BottomTabBar';
import { GestureSheet } from './GestureSheet';
import { Logo } from '@/components/Logo';
import { Shield } from 'lucide-react';

interface MobileAppShellProps {
  children?: React.ReactNode;
  renderMap?: React.ReactNode;
  viewMode: MobileTab;
  setViewMode: (tab: MobileTab) => void;
  renderContent: (mode: MobileTab) => React.ReactNode;
}

export function MobileAppShell({ renderMap, viewMode, setViewMode, renderContent }: MobileAppShellProps) {
  // Determine snap points based on viewMode
  // Default Map view (Analyst) starts with map focused (sheet at 60%). 
  // Comparing or messaging starts full screen (20%).
  const getInitialSnap = () => {
    // Improve mobile UX: ensure Planner view starts with a reasonable sheet height
    // Location (map) loads with map-focused sheet; Planner should be readily accessible.
    if (viewMode === 'location') return 1; // 60%
    if (viewMode === 'planner') return 1; // 60% to reveal planner content by default
    return 2; // 20% for other modes (compare/comms)
  };

  return (
    <div className="w-full h-[100dvh] bg-[#08090C] overflow-hidden flex flex-col fixed inset-0 selection:bg-indigo-500/30">
      {/* HEADER BAR */}
      <div className="absolute top-0 left-0 right-0 h-16 z-[600] pointer-events-none mt-safe">
        <div className="flex items-center justify-between p-4 mix-blend-difference">
           <Logo variant="compact" />
           <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md pointer-events-auto shadow-lg border border-white/20">
             <Shield className="w-4 h-4 text-white" />
           </div>
        </div>
      </div>

      {/* MAP BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        {renderMap}
      </div>

      {/* GESTURE SHEET LAYER */}
      <GestureSheet snapPoints={[80, 60, 15]} initialSnap={getInitialSnap()}>
        {renderContent(viewMode)}
      </GestureSheet>

      {/* BOTTOM NAVIGATION LAYER */}
      <BottomTabBar activeTab={viewMode} onTabChange={setViewMode} />
    </div>
  );
}
