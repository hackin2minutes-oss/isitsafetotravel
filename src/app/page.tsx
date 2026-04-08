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
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Logo } from '@/components/Logo';
import { reportWebVitals } from '@/utils/performance';

export default function Home() {
  const { isMobile } = useDeviceDetection();
  // INSIGHTS FIRST: sidebarOpen defaults to true (especially on mobile)
  const [sidebarOpen, setSidebarOpen] = useState(true); 
  const { selectedLocation, assessment, isAnalyzing, error, retryCount, fetchSafetyData } = useSafetyData();
  const hasRequestedLoc = useRef(false);

  useEffect(() => {
    reportWebVitals();
  }, []);

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
    // Ensure sidebar is open when high-fidelity data is being analyzed
    setSidebarOpen(true);
    await fetchSafetyData(location);
  };

  return (
    <ResponsiveLayout>
      <div className="flex flex-col h-[100dvh] w-full overflow-hidden">
        {assessment?.news && assessment.news.length > 0 && <NewsTicker items={assessment.news} />}
        
        <main className="flex-1 flex bg-white dark:bg-slate-950 overflow-hidden font-sans selection:bg-emerald-500/30 relative">
        
        {/* 1. SIDEBAR / DASHBOARD PANEL */}
        <aside className={`
          fixed inset-y-0 left-0 z-[2000] w-full md:w-[500px] lg:w-[45vw] xl:w-[40vw] 
          bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl 
          border-r border-slate-200 dark:border-white/5 
          transition-transform duration-700 ease-smooth
          will-change-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-[110%] md:translate-x-0'}
          flex flex-col shadow-2xl shadow-slate-900/20 pb-[80px] md:pb-0
        `}>
          
          {/* Brand Header - Consistent Logo across all devices */}
          <div className="p-4 lg:p-8 pb-4 flex items-center justify-between">
            <Logo variant="full" showPulse />
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
        </aside>

        {/* 2. MAP PANEL */}
        <section className={`flex-1 relative pb-[10px] md:pb-0 transition-opacity duration-500 ${isMobile && sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <MapPanel onLocationSelect={handleLocationSelect} />
          
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
              onClick={() => setSidebarOpen(true)}
              className={`flex flex-col items-center gap-1 w-[45%] py-2 rounded-xl transition-[transform,background-color,color] duration-160 ease-spring ${
                sidebarOpen ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-1 ring-emerald-500/20 scale-[1.04]' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white scale-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Insights</span>
            </button>

            <button 
              onClick={() => setSidebarOpen(false)}
              className={`flex flex-col items-center gap-1 w-[45%] py-2 rounded-xl transition-[transform,background-color,color] duration-160 ease-spring ${
                !sidebarOpen ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-1 ring-emerald-500/20 scale-[1.04]' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white scale-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Map View</span>
            </button>
          </div>
        </nav>

      </main>
      </div>
    </ResponsiveLayout>
  );
}