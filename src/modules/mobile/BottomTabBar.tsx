'use client';

import React from 'react';
import { Search, Map as MapIcon, Activity, MessageSquare, Briefcase } from 'lucide-react';

export type MobileTab = 'location' | 'compare' | 'comms' | 'planner';

interface BottomTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'location', label: 'Analyst', icon: <Search className="w-5 h-5" /> },
    { id: 'compare', label: 'Compare', icon: <Activity className="w-5 h-5" /> },
    { id: 'comms', label: 'Comms', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'planner', label: 'Planner', icon: <Briefcase className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] bg-[#08090C]/90 backdrop-blur-xl border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-16 ${
                isActive ? 'text-indigo-400 font-black' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                {tab.icon}
              </div>
              <span className={`text-[8px] uppercase tracking-widest ${isActive ? 'font-black' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
