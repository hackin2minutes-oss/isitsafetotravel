'use client';

import { useState, useEffect, useRef } from 'react';
import { SafetyAssessment, Location, DimensionData } from '@/types';
import { 
  Shield, AlertTriangle, CheckCircle, Info, 
  MapPin, Wind, Cloud, ShieldAlert, Sparkles,
  Activity, RefreshCcw, Globe, Flame,
  Clock, HeartPulse, Navigation, Zap, AlertOctagon,
  Monitor, Smartphone, Database, CloudOff,
  Thermometer, User, Heart, Baby, ShieldCheck,
  Plane, AlertCircle, Phone, Users
} from 'lucide-react';

interface SafetyCardProps {
  location: Location | null;
  assessment: SafetyAssessment | null;
  isLoading: boolean;
  retryCount?: number;
  error?: string | null;
}

export function SafetyCard({ location, assessment, isLoading, retryCount = 0, error }: SafetyCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    tips: true,
    visa: false,
    customs: false
  });

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (location?.id || location?.coordinates) {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [location?.id, location?.coordinates]);

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getScoreVariant = (score: number) => {
    if (score >= 75) return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/20', label: 'Resilient' };
    if (score >= 50) return { color: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/20', label: 'Precautionary' };
    return { color: 'text-rose-400', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/20', label: 'Compromised' };
  };

  if (isLoading) {
    return (
      <div className="bento-grid animate-fade-up">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className={`glass-panel rounded-3xl bg-white/[0.02] animate-pulse h-32`}
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-3xl p-8 border-rose-500/20 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20 shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-lg font-black text-white mb-2 uppercase tracking-tight">System Disruption</h2>
        <p className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-500/20 active:scale-95 transition-all">
          Reinitialize
        </button>
      </div>
    );
  }

  if (!location || !assessment) {
    return (
      <div className="glass-panel-heavy rounded-[2.5rem] p-12 text-center relative overflow-hidden animate-fade-up">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-violet-600/10 blur-3xl rounded-full" />
        <div className="w-24 h-24 rounded-[2rem] bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <Globe className="w-10 h-10 text-violet-500/60" />
        </div>
        <h2 className="text-xl font-black text-white mb-3 tracking-tight">Ready for analysis</h2>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] max-w-[240px] mx-auto leading-relaxed">Select a coordinate or search global entities to begin assessment</p>
      </div>
    );
  }

  const dim = assessment.dimensions;
  const variant = getScoreVariant(assessment.score);

  return (
    <div ref={containerRef} className="bento-grid pb-20 md:pb-0">
      {/* 1. HERO CELL */}
      <div className="bento-col-2 bento-row-2 glass-panel rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
          <ShieldCheck className="w-48 h-48 rotate-12" />
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-mono-technical text-slate-500">{location.countryName || 'Sector Alpha'} // {location.id.slice(0, 8)}</span>
          </div>
          <h1 className="text-3xl font-black text-white leading-tight tracking-tighter mb-4">
            {location.name.toUpperCase()}
          </h1>
          <div className="flex items-center gap-3">
             <div className={`px-3 py-1 rounded border ${variant.bg} ${variant.color} border-${variant.color.split('-')[1]}-500/20 text-[8px] font-black uppercase tracking-widest`}>
                PROTO: {assessment.rating}
             </div>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Global Safety Index</span>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-white tracking-tighter tabular-nums">
                {assessment.score}
              </span>
              <span className="text-sm font-black text-slate-700">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 0. STRATEGIC INTELLIGENCE AD SLOT */}
      <div className="bento-col-4 h-24 glass-panel rounded-2xl flex items-center justify-center border border-white/5 bg-white/[0.01] relative overflow-hidden group mb-4">
         <div className="absolute top-0 left-0 w-1 h-full bg-slate-800" />
         <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.5em] animate-pulse">Intl Intel Feed Sponsor</span>
         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm pointer-events-none">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">AdSense Placement ID: #BX-990</span>
         </div>
      </div>

      {/* 2. SECURITY STATUS */}
      <div className={`bento-col-2 bento-row-1 glass-panel rounded-3xl p-5 border-l-4 transition-all animate-fade-up ${assessment.security.data.warStatus === 'active_war' ? 'border-l-rose-500 bg-rose-500/5 shadow-rose-500/10' : 'border-l-violet-500 shadow-violet-500/10'}`} style={{ animationDelay: '150ms' }}>
        <div className="flex items-start gap-4 h-full">
          <div className={`w-12 h-12 min-h-[48px] min-w-[48px] rounded-2xl flex items-center justify-center ${assessment.security.data.warStatus === 'active_war' ? 'bg-rose-500/10 shadow-inner' : 'bg-slate-800/50'}`}>
            <ShieldAlert className={assessment.security.data.warStatus === 'active_war' ? 'text-rose-400' : 'text-slate-400'} />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Security Directive</h4>
            <p className="text-xs font-black text-white uppercase tracking-tight line-clamp-2">
              {assessment.security.data.warStatus === 'active_war' ? 'WAR ZONE ALERT: DISCONTINUE TRANSIT' : 'STABILITY CONFIRMED: PROCEED WITH CAUTION'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. ATMOSPHERE BENTO ITEM */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between group animate-fade-up">
        <div className="flex items-center gap-2">
           <Wind className="w-3.5 h-3.5 text-indigo-400" />
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Atmosphere</span>
        </div>
        <div>
          <p className="text-2xl font-black text-white tracking-tighter tabular-nums">{dim.airQualityIndex.score * 10}</p>
          <span className="text-[8px] font-mono-technical text-slate-600 uppercase">AQI Unit</span>
        </div>
      </div>

      {/* 4. WEATHER BENTO ITEM */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between group animate-fade-up">
        <div className="flex items-center gap-2">
           <Thermometer className="w-3.5 h-3.5 text-indigo-400" />
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Meteorology</span>
        </div>
        <div>
          <p className="text-2xl font-black text-white tracking-tighter tabular-nums">{dim.meteorological.score * 10}%</p>
          <span className="text-[8px] font-mono-technical text-slate-600 uppercase">Operational Delta</span>
        </div>
      </div>

      {/* 5. OPERATIONAL HAZARDS (SCAM-WATCH) */}
      <div className="bento-col-2 bento-row-1 glass-panel rounded-3xl p-6 border-l-4 border-l-amber-500 bg-amber-500/5 transition-all animate-fade-up relative overflow-hidden group" style={{ animationDelay: '600ms' }}>
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operational Hazards</h3>
          </div>
          
          <div className="space-y-3">
            {(assessment.hazards || []).slice(0, 2).map((hazard) => (
              <div key={hazard.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${hazard.severity === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  <span className="text-[10px] font-black text-white uppercase tracking-tight">{hazard.title}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed pl-3.5 italic">{hazard.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. LOGISTICS TACTICAL CARD */}
      <div className="bento-col-2 bento-row-1 glass-card rounded-3xl relative overflow-hidden group animate-fade-up" style={{ animationDelay: '750ms' }}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Plane className="w-24 h-24 rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between p-5">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aviation Intel</h3>
          </div>
          
          <div className="flex gap-2">
            <span className={`px-2 py-1.5 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-500/20 text-emerald-400 bg-emerald-500/5`}>
              AIRSPACE: {assessment.logistics.airspace}
            </span>
            <span className={`px-2 py-1.5 rounded text-[8px] font-black uppercase tracking-widest border border-amber-500/20 text-amber-400 bg-amber-500/5`}>
              LOGISTICS: {assessment.logistics.transport}
            </span>
          </div>
        </div>
      </div>

      {/* 7. SOCIETY SCORECARD */}
      <div className="bento-col-2 bento-row-2 glass-panel rounded-[2.5rem] p-6 animate-fade-up" style={{ animationDelay: '900ms' }}>
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-4 h-4 text-violet-400" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Demographic Safety</h3>
        </div>
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          <MetricItem icon={<User className="w-3.5 h-3.5" />} label="Women" value={dim.womenSafety.score} />
          <MetricItem icon={<Heart className="w-3.5 h-3.5" />} label="LGBTQ+" value={dim.lgbtqSafety.score} />
          <MetricItem icon={<Baby className="w-3.5 h-3.5" />} label="Child" value={dim.childSafety.score} />
          <MetricItem icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Civil" value={dim.geopolitical.score} />
        </div>
      </div>

      {/* 8. EMERGENCY PROTOCOL */}
      <div className="bento-col-2 bento-row-1 glass-panel rounded-2xl p-5 border border-white/5 bg-white/[0.01] animate-fade-up">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-3.5 h-3.5 text-rose-500" />
          <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Response Nodes</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <EmergencyDisplay label="POLICE" code={assessment.emergency.police} />
          <EmergencyDisplay label="MED_U" code={assessment.emergency.ambulance} />
          <EmergencyDisplay label="FIRE_S" code={assessment.emergency.fire} />
        </div>
      </div>

      {/* 9. TACTICAL TOOLKIT (NEW) */}
      <div className="bento-col-4 bento-row-1 glass-panel rounded-2xl p-6 border border-indigo-500/20 bg-indigo-500/5 animate-fade-up overflow-hidden relative group">
         <div className="absolute top-0 right-0 p-4 opacity-[0.02]">
            <Zap className="w-32 h-32" />
         </div>
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                  <ShieldAlert className="w-5 h-5 text-indigo-400" />
               </div>
               <div>
                  <h3 className="text-xs font-black text-white tracking-widest uppercase">Special Operations Toolkit</h3>
                  <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em]">Advanced Deployment Utilities</p>
               </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <button 
                  onClick={() => (window as any).dispatchPageAction('open_readiness')}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest transition-all"
               >
                  Readiness Audit
               </button>
               <button 
                  onClick={() => (window as any).dispatchPageAction('open_ice')}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 rounded-xl text-[9px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
               >
                  Generate ICE Card
               </button>
            </div>
         </div>
      </div>

      {/* 8. COLLAPSIBLE SECTIONS */}
      <div className="bento-col-4 space-y-4 animate-fade-up" style={{ animationDelay: '1050ms' }}>
        {/* TIPS SECTION */}
        <CollapsibleSection 
          id="tips" 
          title="Operational Briefing" 
          icon={<Zap className="w-4 h-4 text-violet-500" />} 
          isOpen={openSections.tips} 
          onToggle={() => toggleSection('tips')}
          color="violet"
        >
          <div className="grid md:grid-cols-3 gap-6 pt-2">
            {assessment.tips.map((tip, i) => (
              <div key={i} className="flex flex-col gap-3 group animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black bg-violet-500/10 text-violet-400`}>{i+1}</div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocol 0{i+1}</span>
                </div>
                <p className="text-xs text-slate-400 font-bold leading-relaxed group-hover:text-slate-200 transition-colors">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* VISA SECTION */}
        <CollapsibleSection 
          id="visa" 
          title="Transit Requirements" 
          icon={<Globe className="w-4 h-4 text-emerald-500" />} 
          isOpen={openSections.visa} 
          onToggle={() => toggleSection('visa')}
          color="emerald"
        >
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-slate-400 font-bold">Transit documentation and visa requirements are currently subject to rapid geopolitical shifts. Consult your local embassy for the most current directive.</p>
            </div>
          </div>
        </CollapsibleSection>

        {/* CUSTOMS SECTION */}
        <CollapsibleSection 
          id="customs" 
          title="Cultural Neutrality" 
          icon={<Info className="w-4 h-4 text-amber-500" />} 
          isOpen={openSections.customs} 
          onToggle={() => toggleSection('customs')}
          color="amber"
        >
          <div className="space-y-4 pt-2">
             <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-slate-400 font-bold">Maintain tactical silence regarding local political movements. Observe all religious protocols during high-transit intervals.</p>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}

function CollapsibleSection({ id, title, icon, isOpen, onToggle, children, color }: { id: string, title: string, icon: React.ReactNode, isOpen: boolean, onToggle: () => void, children: React.ReactNode, color: string }) {
  return (
    <div className={`glass-panel rounded-2xl overflow-hidden transition-all duration-500 border-white/[0.08] ${isOpen ? `bg-${color}-500/5 ring-1 ring-${color}-500/10` : 'hover:bg-white/[0.04]'}`}>
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center`}>
            {icon}
          </div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{title}</h3>
        </div>
        <div className={`p-2 rounded-lg bg-white/5 transition-transform duration-400 ${isOpen ? 'rotate-180' : ''}`}>
          <Navigation className="w-3 h-3 text-slate-500 rotate-180" />
        </div>
      </button>
      
      <div className={`transition-all duration-500 ease-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="px-6 pb-6">
          <div className="h-[1px] w-full bg-white/5 mb-6" />
          {children}
        </div>
      </div>
    </div>
  );
}

function MetricItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  const percentage = (value / 10) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-white/[0.02] flex items-center justify-center text-slate-600">
            {icon}
          </div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-[10px] font-mono-technical text-indigo-400">{value}</span>
      </div>
      <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500/60 transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function EmergencyDisplay({ label, code }: { label: string, code: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.03] rounded-2xl p-3 text-center transition-all hover:bg-white/[0.05] hover:border-rose-500/20 min-h-[64px] flex flex-col justify-center">
      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{label}</span>
      <span className="text-sm font-black text-white tracking-widest">{code}</span>
    </div>
  );
}
