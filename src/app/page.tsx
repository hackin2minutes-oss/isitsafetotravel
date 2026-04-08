'use client';

export const runtime = 'edge';

import { useState, useEffect, useRef } from 'react';
import { Shield, Globe, MapPin, Menu, X, Activity, Zap, Search, LayoutGrid, Heart, ShieldCheck, Navigation, RefreshCcw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { SearchPanel } from '@/components/SearchPanel';
const MapPanel = dynamic(() => import('@/components/MapPanel').then(m => m.MapPanel), { ssr: false });
import { SafetyCard } from '@/components/SafetyCard';
import { useSafetyData } from '@/hooks/useSafetyData';
import { Location } from '@/types';
import { reverseGeocode } from '@/services/locationService';
import { NewsTicker } from '@/components/NewsTicker';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default = Map View on mobile
  const { selectedLocation, assessment, isAnalyzing, error, retryCount, fetchSafetyData } = useSafetyData();
  const hasRequestedLoc = useRef(false);

  // Initialize app with User's Geolocation if available
  useEffect(() => {
    if (!hasRequestedLoc.current && !selectedLocation) {
      hasRequestedLoc.current = true;
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const loc = await reverseGeocode(position.coords.latitude, position.coords.longitude);
            if (loc) await fetchSafetyData(loc);
          },
          (err) => console.warn("Geolocation skipped/denied. Leaving dashboard in empty state.")
        );
      }
    }
  }, [selectedLocation, fetchSafetyData]);

  const handleLocationSelect = async (location: Location) => {
    // We purposely do NOT call setSidebarOpen(false) here on mobile anymore 
    // so the user can read the insights of the place they just searched!
    await fetchSafetyData(location);
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      {assessment?.news && assessment.news.length > 0 && <NewsTicker items={assessment.news} />}
      
      <main className="flex-1 flex bg-white dark:bg-slate-950 overflow-hidden font-sans selection:bg-emerald-500/30 relative">
      
      {/* 1. SIDEBAR / DASHBOARD PANEL */}
      <aside className={`
        fixed inset-y-0 left-0 z-[2000] w-full md:w-[600px] lg:w-[60vw] xl:w-[55vw] 
        bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl 
        border-r border-slate-200 dark:border-white/5 
        transition-transform duration-700 ease-smooth
        will-change-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-[110%] md:translate-x-0'}
        flex flex-col shadow-2xl shadow-slate-900/20 pb-[80px] md:pb-0
      `}>
        
        {/* Brand Header */}
        <div className="p-4 lg:p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform duration-500 shrink-0">
               <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">
                Is It Safe To Travel?
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </div>
            </div>
          </div>
          {/* Close button removed for mobile since we use bottom tabs now */}
        </div>

        {/* Global Search Bar */}
        <div className="px-4 lg:px-8 py-2">
          <SearchPanel onLocationSelect={handleLocationSelect} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-8 custom-scrollbar">
          <div className="space-y-6 lg:space-y-8 mt-4">
            
            {/* Core Assessment Card */}
            <SafetyCard 
              location={selectedLocation} 
              assessment={assessment} 
              isLoading={isAnalyzing} 
              retryCount={retryCount}
              error={error}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-4 border-t border-slate-100 dark:border-white/5 opacity-0 pointer-events-none">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[3px]">Sentinel</span>
        </div>
      </aside>

      {/* 2. MAP PANEL */}
      <section className="flex-1 relative pb-[10px] md:pb-0">
        <MapPanel onLocationSelect={handleLocationSelect} />
        
        {/* Deprecated Mobile Hamburger Toggle in favor of Bottom Tabs */}

        {/* Search Helper */}
        {!sidebarOpen && (
          <div className="hidden md:flex absolute top-6 left-6 z-[1000] items-center gap-3">
            <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 dark:border-white/5 shadow-premium flex items-center gap-3 animate-slide-left">
              <Search className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 tracking-widest uppercase">Global Search</span>
            </div>
          </div>
        )}
      </section>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-[2001] bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around p-2">
          <button 
            onClick={() => setSidebarOpen(false)}
            className={`flex flex-col items-center gap-1 w-[45%] py-2 rounded-xl transition-[transform,background-color,color] duration-160 ease-spring ${
              !sidebarOpen ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-1 ring-emerald-500/20 scale-[1.04]' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white scale-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Map View</span>
          </button>
          
          <button 
            onClick={() => setSidebarOpen(true)}
            className={`flex flex-col items-center gap-1 w-[45%] py-2 rounded-xl transition-[transform,background-color,color] duration-160 ease-spring ${
              sidebarOpen ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-1 ring-emerald-500/20 scale-[1.04]' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white scale-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Insights</span>
          </button>
        </div>
      </nav>

    </main>
    </div>
  );
}