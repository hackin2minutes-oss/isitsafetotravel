'use client';

import { useState, useEffect, useRef } from 'react';

import { 
  Shield, Globe, MapPin, Search, BarChart3, 
  Sparkles, Zap, ChevronRight, Star, 
  TrendingUp, Users, X, Map as MapIcon,
  LayoutGrid, Activity, Info, Menu,
  Smartphone, Monitor, RefreshCw, Plus
} from 'lucide-react';
import { Header } from '@/components/Header';
import { SearchPanel } from '@/components/SearchPanel';
import { SafetyCard } from '@/components/SafetyCard';
import { SimpleMap } from '@/components/SimpleMap';
import { IntelligenceAssistant } from '@/components/IntelligenceAssistant';
import { TripPlanner } from '@/components/TripPlanner';
import { ReadinessQuiz } from '@/components/ReadinessQuiz';
import { ICECardGenerator } from '@/components/ICECardGenerator';
import { useSafetyData } from '@/hooks/useSafetyData';
import { Location } from '@/types';
import { reverseGeocode } from '@/services/locationService';
import { ScoredCountry } from '@/scoring/types';
import { getScoreRating } from '@/scoring/scoring';
import { GPI_2025_COUNTRIES } from '@/data/gpi2025';

// Mobile Module
import { MobileAppShell } from '@/modules/mobile/MobileAppShell';
import { MobileTab } from '@/modules/mobile/BottomTabBar';

const MOCK_COUNTRIES = GPI_2025_COUNTRIES;

type ViewMode = 'location' | 'compare' | 'comms' | 'planner';
type ViewPreference = 'auto' | 'mobile' | 'desktop';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('location');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'readiness' | 'ice'>('none');
  const [viewPreference, setViewPreference] = useState<ViewPreference>('auto');
  
  const { selectedLocation, assessment, isAnalyzing, error, retryCount, fetchSafetyData } = useSafetyData();
  const [compareCountries, setCompareCountries] = useState<[ScoredCountry | null, ScoredCountry | null]>([null, null]);
  const hasRequestedLoc = useRef(false);

  useEffect(() => {
    setIsHydrated(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Dynamic Action Dispatcher for components
    (window as any).dispatchPageAction = (action: string) => {
      if (action === 'open_readiness') setActiveModal('readiness');
      if (action === 'open_ice') setActiveModal('ice');
    };

    return () => {
      window.removeEventListener('resize', checkMobile);
      delete (window as any).dispatchPageAction;
    };
  }, []);

  // --- UTILITIES & COMPUTED ---
  const effectiveIsMobile = viewPreference === 'auto' ? isMobile : viewPreference === 'mobile';
  const [searchQuery, setSearchQuery] = useState('');
  const filteredCountries = MOCK_COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankColor = (rank: number) => {
    if (rank <= 10) return 'text-emerald-400';
    if (rank <= 30) return 'text-cyan-400';
    if (rank <= 60) return 'text-violet-400';
    if (rank <= 100) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getRankBg = (rank: number) => {
    if (rank <= 10) return 'bg-emerald-500/10 border-emerald-500/20';
    if (rank <= 30) return 'bg-cyan-500/10 border-cyan-500/20';
    if (rank <= 60) return 'bg-violet-500/10 border-violet-500/20';
    if (rank <= 100) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  const toggleViewPreference = () => {
    const next: ViewPreference = viewPreference === 'auto' ? 'mobile' : viewPreference === 'mobile' ? 'desktop' : 'auto';
    setViewPreference(next);
  };

  // --- HANDLERS ---
  const handleLocationSelect = async (location: Location) => {
    console.log('page.tsx: handleLocationSelect called', location);
    setSidebarOpen(true);
    await fetchSafetyData(location);
  };

  const handleCompareSelect = (country: ScoredCountry) => {
    if (!compareCountries[0]) {
      setCompareCountries([country, null]);
    } else if (!compareCountries[1]) {
      setCompareCountries([compareCountries[0], country]);
    } else {
      setCompareCountries([country, compareCountries[1]]);
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    setIsHydrated(true);
    setIsMobile(window.innerWidth < 1024);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize, { passive: true });
    const savedPref = localStorage.getItem('view_preference') as ViewPreference;
    if (savedPref) setViewPreference(savedPref);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('view_preference', viewPreference);
  }, [viewPreference]);

  useEffect(() => {
    if (isHydrated && !hasRequestedLoc.current && !selectedLocation) {
      hasRequestedLoc.current = true;
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const loc = await reverseGeocode(position.coords.latitude, position.coords.longitude);
            if (loc) await fetchSafetyData(loc);
          },
          () => {}
        );
      }
    }
  }, [isHydrated, selectedLocation, fetchSafetyData]);

  // --- RENDER HELPERS ---
  const renderCompare = () => (
    <div className="space-y-4 animate-fade-up">
      <div className="glass-panel rounded-2xl p-4 relative overflow-hidden group">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-widest uppercase mb-0.5">Bilateral Synergies</h2>
            <p className="text-[7px] font-mono-technical text-slate-500 uppercase">Cross-Sector Safety Variance Analysis</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <button
          onClick={() => setCompareCountries([null, compareCountries[1]])}
          className={`flex-1 glass-card p-5 h-36 flex flex-col items-center justify-center gap-2 text-center group transition-all ${!compareCountries[0] ? 'border-dashed opacity-40 hover:opacity-100' : 'border-indigo-500/30 bg-indigo-500/5'}`}
        >
          {compareCountries[0] ? (
            <div className="animate-scale-in">
              <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">[ REFERENCE ORIGIN ]</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] mx-auto mb-2 ${getRankBg(compareCountries[0].rank || 1)} ${getRankColor(compareCountries[0].rank || 1)}`}>
                #{compareCountries[0].rank}
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-tighter truncate w-full px-2">{compareCountries[0].name}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Plus className="w-6 h-6 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Select Origin Base</span>
            </div>
          )}
        </button>

        <div className="w-10 h-10 shrink-0 rounded-full glass-panel border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-fuchsia-500/20 animate-pulse" />
            <span className="relative z-10">VS</span>
        </div>

        <button
          onClick={() => setCompareCountries([compareCountries[0], null])}
          className={`flex-1 glass-card p-5 h-36 flex flex-col items-center justify-center gap-2 text-center group transition-all ${!compareCountries[1] ? 'border-dashed opacity-40 hover:opacity-100' : 'border-fuchsia-500/30 bg-fuchsia-500/5'}`}
        >
          {compareCountries[1] ? (
            <div className="animate-scale-in">
              <span className="text-[8px] font-black text-fuchsia-400 uppercase tracking-widest mb-2 block">[ MISSION TARGET ]</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] mx-auto mb-2 ${getRankBg(compareCountries[1].rank || 1)} ${getRankColor(compareCountries[1].rank || 1)}`}>
                #{compareCountries[1].rank}
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-tighter truncate w-full px-2">{compareCountries[1].name}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Plus className="w-6 h-6 text-slate-600 group-hover:text-fuchsia-400 transition-colors" />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Select Deployment Target</span>
            </div>
          )}
        </button>
      </div>

      {compareCountries[0] && compareCountries[1] && (
        <div className="animate-fade-up space-y-4">
           {/* Delta Header */}
           <div className="glass-panel rounded-2xl p-4 flex items-center justify-between border-white/10">
              <div className="flex items-center gap-2">
                 <Shield className="w-4 h-4 text-slate-500" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Safety Delta</span>
              </div>
              <span className={`text-sm font-black tracking-tighter ${(compareCountries[1].score.score - compareCountries[0].score.score) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                 {(compareCountries[1].score.score - compareCountries[0].score.score).toFixed(2)} pts
              </span>
           </div>

           <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
              {['conflict', 'crime', 'health', 'governance', 'environment'].map((pillar) => {
                const s1 = compareCountries[0]!.score.pillarScores.find(p => p.name === pillar)?.value || 0;
                const s2 = compareCountries[1]!.score.pillarScores.find(p => p.name === pillar)?.value || 0;
                const total = s1 + s2;
                const p1 = (s1 / total) * 100;
                
                return (
                  <div key={pillar} className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] px-1 group">
                      <span className="text-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity">{(s1 * 10).toFixed(0)} INC</span>
                      <span className="text-white tracking-[0.4em] font-mono text-[9px]">{pillar}</span>
                      <span className="text-fuchsia-400 opacity-60 group-hover:opacity-100 transition-opacity">{(s2 * 10).toFixed(0)} INC</span>
                    </div>
                    <div className="flex h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{ width: `${p1}%` }} />
                      <div className="h-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)] transition-all duration-1000" style={{ width: `${100-p1}%` }} />
                    </div>
                  </div>
                );
              })}
           </div>

           <div className="p-5 glass-panel rounded-3xl border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                 <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed tracking-wide">
                 ADVISORY: MISSION TARGET DISPLAYING <span className="text-white">{(compareCountries[1].score.score - compareCountries[0].score.score) >= 0 ? 'LOWER' : 'HIGHER'} ERROR VECTORS</span> COMPARED TO ORIGIN BASE. RECALIBRATE INSERTION PROTOCOL ACCORDINGLY.
              </p>
           </div>
        </div>
      )}

      <div className="pt-8 mb-4">
         <div className="h-28 glass-panel rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center relative group">
            <span className="text-[7px] font-black text-slate-700 uppercase tracking-[0.4em] mb-2">Regional Commerce Data Stream</span>
            <div className="w-1/2 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-4" />
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Strategic Logistic Partner #AD-44</span>
         </div>
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Intelligence Entities</p>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="text-[8px] font-black text-slate-600 uppercase">Live Fed</span>
            </div>
        </div>
        <div className="grid grid-cols-1 gap-2 max-h-[30vh] overflow-y-auto pr-1 subtle-scroll scrollbar-hide">
          {filteredCountries.slice(0, 30).map(country => (
            <button 
              key={country.code}
              onClick={() => handleCompareSelect(country)}
              className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[9px] bg-slate-900 border border-white/10 text-slate-500 group-hover:text-white transition-colors`}>{country.code}</div>
                <span className="text-xs font-black text-white uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">{country.name}</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-700 group-hover:text-white group-hover:rotate-90 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // --- FINAL RENDER ---
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#08090C] flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 animate-pulse shadow-2xl shadow-violet-500/20" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen w-full overflow-hidden selection:bg-violet-500/30 bg-[#08090C] ${viewPreference !== 'auto' ? 'border-4 border-violet-500/20' : ''}`}>
      {!effectiveIsMobile && <Header />}
      
      {effectiveIsMobile ? (
        <MobileAppShell 
          viewMode={viewMode}
          setViewMode={(mode) => setViewMode(mode)}
          renderMap={<SimpleMap selectedLocation={selectedLocation} />}
          renderContent={(mode) => (
            <div className="pt-6 animate-fade-in">
              {mode === 'location' && (
                <div className="space-y-6">
                  <SearchPanel onLocationSelect={handleLocationSelect} />
                  <SafetyCard location={selectedLocation} assessment={assessment} isLoading={isAnalyzing} retryCount={retryCount} error={error} />
                </div>
              )}
              {mode === 'compare' && renderCompare()}
              {mode === 'comms' && (
                <div className="h-[70vh]">
                   <IntelligenceAssistant location={selectedLocation} assessment={assessment} />
                </div>
              )}
              {mode === 'planner' && (
                 <TripPlanner />
              )}
            </div>
          )}
        />
      ) : (
      <main className="flex-1 flex overflow-hidden relative flex-row">
        {/* LEFT PANE - INFO & ADVISORIES */}
        <aside 
          className={`
            z-[9999] 
            bg-[#08090C]/95 backdrop-blur-3xl
            border-r border-white/10
            transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
            flex flex-col
            ${effectiveIsMobile ? 'w-full flex-1 order-2' : 'w-[45%] min-w-[360px] relative shrink-0 order-1'}
          `}
        >
          {/* Dashboard Controls */}
          <div className="p-4 flex items-center justify-end border-b border-white/[0.03]">
             <button onClick={toggleViewPreference} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all group">
                {viewPreference === 'mobile' ? <Smartphone className="w-4 h-4 text-violet-400" /> : viewPreference === 'desktop' ? <Monitor className="w-4 h-4 text-emerald-400" /> : <RefreshCw className="w-4 h-4 text-slate-500 group-hover:text-white" />}
             </button>
          </div>

           {/* Navigation Tabs */}
           <div className="px-6 py-4 transition-all">
             <div className="relative p-1 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center">
               <div 
                 className="absolute h-[calc(100%-8px)] rounded-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-lg"
                 style={{
                    width: 'calc(25% - 6px)',
                    left: '4px',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    transform: viewMode === 'location' ? 'translateX(0)' : viewMode === 'compare' ? 'translateX(100%)' : viewMode === 'comms' ? 'translateX(200%)' : 'translateX(300%)'
                  }}
               />
<button onClick={() => setViewMode('location')} className={`relative z-10 flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-colors ${viewMode === 'location' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Analyst</button>
                <button onClick={() => setViewMode('compare')} className={`relative z-10 flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-colors ${viewMode === 'compare' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Compare</button>
                <button onClick={() => setViewMode('comms')} className={`relative z-10 flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-colors ${viewMode === 'comms' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>AskSawan</button>
                <button onClick={() => setViewMode('planner')} className={`relative z-10 flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-colors ${viewMode === 'planner' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Plan Trip</button>
             </div>
           </div>

           {/* Content Area */}
           <div className={`flex-1 overflow-y-auto px-6 pb-20 md:pb-8 subtle-scroll scrollbar-hide`}>
             {viewMode === 'location' && (
               <div className="space-y-6">
                 <SearchPanel onLocationSelect={handleLocationSelect} />
                 <SafetyCard location={selectedLocation} assessment={assessment} isLoading={isAnalyzing} retryCount={retryCount} error={error} />
               </div>
             )}
             {viewMode === 'compare' && renderCompare()}
{viewMode === 'comms' && (
                <div className="h-[calc(100vh-280px)]">
                   <IntelligenceAssistant location={selectedLocation} assessment={assessment} />
                </div>
              )}
              {viewMode === 'planner' && (
                <div className="pb-20 md:pb-8">
                   <TripPlanner />
                </div>
              )}
           </div>
        </aside>

        {/* RIGHT PANE - INTERACTIVE MAP */}
        <section className={`relative transition-all duration-700 order-1 ${effectiveIsMobile ? 'w-full h-[30vh] shrink-0' : 'flex-1 h-full min-w-0'}`}>
          <SimpleMap selectedLocation={selectedLocation} />
          
          {/* Map Overlay Tools */}
          <div className="absolute top-8 right-8 z-[9000] hidden md:flex">
             <div className="glass-panel px-6 py-4 rounded-3xl flex items-center gap-4 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{selectedLocation?.name || 'Awaiting Input...'}</span>
             </div>
          </div>
        </section>
      </main>
      )}



      {/* TOOL MODAL OVERLAY */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setActiveModal('none')} />
           <div className="relative w-full max-w-6xl h-full max-h-[90vh] glass-panel-heavy rounded-[3rem] border border-white/10 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                       <Shield className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                       {activeModal === 'readiness' ? 'Readiness Audit' : 'Tactical ICE Generator'}
                    </span>
                 </div>
                 <button 
                    onClick={() => setActiveModal('none')}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest"
                 >
                    Close Protocol
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto subtle-scroll">
                 {activeModal === 'readiness' && <ReadinessQuiz location={selectedLocation} assessment={assessment} />}
                 {activeModal === 'ice' && <ICECardGenerator />}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
