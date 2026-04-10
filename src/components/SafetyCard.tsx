'use client';

import { useState, useEffect, useRef } from 'react';
import { SafetyAssessment, Location, DimensionData } from '@/types';
import { 
  Shield, AlertTriangle, CheckCircle, Info, 
  MapPin, Wind, Cloud, ShieldAlert, Sparkles,
  Activity, RefreshCcw, Globe, Flame,
  Clock, HeartPulse, ChevronDown, Zap, AlertOctagon,
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
    <div ref={containerRef} className="space-y-3 pb-20 md:pb-4 overflow-y-auto">
      {/* 1. HERO CELL */}
      <div className="glass-panel rounded-xl p-4 animate-fade-up">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-medium">{location.countryName}</span>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              {location.name}
            </h1>
            <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded text-[9px] font-semibold uppercase tracking-wider ${variant.bg} ${variant.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${variant.color.replace('text-', 'bg-')}`} />
              {assessment.rating}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Safety Index</span>
            <div className="text-4xl font-bold text-white tracking-tighter">{assessment.score}</div>
            <span className="text-[9px] text-slate-600">/ 100</span>
          </div>
        </div>
      </div>

      {/* 2. SECURITY + INFO ROW */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`glass-panel rounded-xl p-4 ${assessment.security.data.warStatus === 'active_war' ? 'border-rose-500/30' : 'border-emerald-500/30'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${assessment.security.data.warStatus === 'active_war' ? 'bg-rose-500/20' : 'bg-slate-700/50'}`}>
              <ShieldAlert className={assessment.security.data.warStatus === 'active_war' ? 'text-rose-400 w-5 h-5' : 'text-slate-400 w-5 h-5'} />
            </div>
            <div>
              <span className="text-[8px] text-slate-500 font-medium uppercase tracking-wider">Security</span>
              <p className="text-[11px] font-semibold text-white">
                {assessment.security.data.warStatus === 'active_war' ? 'War Zone' : 'Stable'}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <span className="text-[8px] text-slate-500 font-medium uppercase tracking-wider">Air Quality</span>
          <p className="text-xl font-bold text-white mt-1">{dim.airQualityIndex.score * 10}</p>
          <span className="text-[9px] text-slate-600">AQI</span>
        </div>
      </div>

      {/* 3. TEMP + AVIATION */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[8px] text-slate-500 font-medium uppercase tracking-wider">Temperature</span>
              <p className="text-xl font-bold text-white mt-1">{assessment.weather.data.temperature}°C</p>
              <span className="text-[9px] text-slate-600">{assessment.weather.data.condition}</span>
            </div>
            <Thermometer className="w-6 h-6 text-slate-600" />
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[8px] text-slate-500 font-medium uppercase tracking-wider">Airspace</span>
              <p className={`text-[11px] font-semibold uppercase mt-1 ${assessment.logistics.airspace === 'open' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {assessment.logistics.airspace}
              </p>
            </div>
            <Plane className="w-6 h-6 text-slate-600" />
          </div>
        </div>
      </div>

      {/* 4. HAZARDS */}
      <div className="glass-panel rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Safety Hazards</span>
        </div>
        <div className="space-y-2">
          {(assessment.hazards || []).slice(0, 2).map((hazard) => (
            <div key={hazard.id} className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${hazard.severity === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`} />
              <div>
                <span className="text-[10px] font-semibold text-white">{hazard.title}</span>
                <p className="text-[9px] text-slate-500 mt-0.5">{hazard.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. DEMOGRAPHIC + EMERGENCY */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-panel rounded-xl p-4">
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block mb-3">Demographic Safety</span>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Women</span>
              <span className="text-[11px] font-semibold text-white">{dim.womenSafety.score}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">LGBTQ+</span>
              <span className="text-[11px] font-semibold text-white">{dim.lgbtqSafety.score}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Child</span>
              <span className="text-[11px] font-semibold text-white">{dim.childSafety.score}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Civil</span>
              <span className="text-[11px] font-semibold text-white">{dim.geopolitical.score}</span>
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block mb-3">Emergency Numbers</span>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Police</span>
              <span className="text-[11px] font-semibold text-white">{assessment.emergency.police}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Medical</span>
              <span className="text-[11px] font-semibold text-white">{assessment.emergency.ambulance}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Fire</span>
              <span className="text-[11px] font-semibold text-white">{assessment.emergency.fire}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. COLLAPSIBLE SECTIONS */}
      <CollapsibleSection 
        id="tips" 
        title="Travel Tips" 
        icon={<Zap className="w-4 h-4" />} 
        isOpen={openSections.tips} 
        onToggle={() => toggleSection('tips')}
        color="violet"
      >
        <div className="space-y-2">
          {assessment.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded bg-violet-500/20 flex items-center justify-center text-[9px] font-semibold text-violet-400 shrink-0">{i+1}</div>
              <p className="text-[10px] text-slate-400 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection 
        id="visa" 
        title="Visa Requirements" 
        icon={<Globe className="w-4 h-4" />} 
        isOpen={openSections.visa} 
        onToggle={() => toggleSection('visa')}
        color="emerald"
      >
        <p className="text-[10px] text-slate-400 leading-relaxed">Visa requirements vary by nationality. Consult your local embassy for current travel advisories and documentation requirements.</p>
      </CollapsibleSection>

      <CollapsibleSection 
        id="customs" 
        title="Local Customs" 
        icon={<Info className="w-4 h-4" />} 
        isOpen={openSections.customs} 
        onToggle={() => toggleSection('customs')}
        color="amber"
      >
        <p className="text-[10px] text-slate-400 leading-relaxed">Research local customs and traditions before traveling. Respect cultural norms and dress codes.</p>
      </CollapsibleSection>
    </div>
  );
}

function CollapsibleSection({ id, title, icon, isOpen, onToggle, children, color }: { id: string, title: string, icon: React.ReactNode, isOpen: boolean, onToggle: () => void, children: React.ReactNode, color: string }) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="text-slate-500">{icon}</div>
          <span className="text-[10px] font-semibold text-white uppercase tracking-wider">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <div className={`transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="px-4 pb-4 pt-0 border-t border-white/5">
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
