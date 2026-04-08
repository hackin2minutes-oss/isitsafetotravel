'use client';

import { useState } from 'react';
import { SafetyAssessment, Location, DimensionData } from '@/types';
import { 
  Shield, AlertTriangle, CheckCircle, Info, 
  MapPin, Wind, Cloud, ShieldAlert, Sparkles,
  Activity, RefreshCcw, FileText, Heart, Globe, Flame,
  Clock, CreditCard, Languages, Phone, Check, Zap, AlertOctagon, HeartPulse,
  Monitor, Smartphone, Navigation, Database
} from 'lucide-react';


interface SafetyCardProps {
  location: Location | null;
  assessment: SafetyAssessment | null;
  isLoading: boolean;
  retryCount?: number;
  error?: string | null;
}

export function SafetyCard({ location, assessment, isLoading, retryCount = 0, error }: SafetyCardProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // 1. LOADING STATE
  if (isLoading) {
    return (
      <div className="glass-card rounded-3xl p-8 lg:p-10 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full mb-6" />
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-full mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
        {retryCount > 0 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <RefreshCcw className="w-3 h-3 text-emerald-500 animate-spin" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
              Retrying ({retryCount}/2)...
            </span>
          </div>
        )}
      </div>
    );
  }

  // 2. ERROR STATE
  if (error) {
    return (
      <div role="alert" aria-live="assertive" className="glass-card rounded-3xl p-10 border-rose-500/20 bg-rose-500/5 text-center flex flex-col items-center gap-6 animate-safe-fade-in group">
        <ShieldAlert className="w-10 h-10 text-rose-500" aria-hidden="true" />
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Analysis Failure</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-emerald-500/20">
          Reinitialize System
        </button>
      </div>
    );
  }

  // 3. EMPTY STATE
  if (!location || !assessment) {
    return (
      <div className="glass-card rounded-3xl p-12 text-center flex flex-col items-center gap-6">
        <Globe className="w-12 h-12 text-emerald-500/40" />
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Select a Destination</h2>
        <p className="text-sm text-slate-500">Pick a point on the map to begin your travel safety assessment.</p>
      </div>
    );
  }

  // 4. DATA RENDERING SUPPORT
  const getStatusBg = (score: number, max=100) => {
    const ratio = score/max;
    if (ratio >= 0.75) return 'bg-emerald-500';
    if (ratio >= 0.50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const dim = assessment.dimensions;
  const isDesktop = viewMode === 'desktop';

  return (
    <div className={`flex flex-col gap-6 animate-spring-in ${isDesktop ? 'w-full' : 'max-w-md mx-auto w-full'}`}>
      
      {/* VIEW MODE TOGGLE */}
      <div className="flex items-center justify-end gap-2 mb-2" role="group" aria-label="View mode toggle">
        <div className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-white/5">
          <button
            onClick={() => setViewMode('desktop')}
            aria-label="Desktop view"
            aria-pressed={isDesktop}
            className={`p-2 rounded-lg transition-all ${isDesktop ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <Monitor className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            aria-label="Mobile view"
            aria-pressed={!isDesktop}
            className={`p-2 rounded-lg transition-all ${!isDesktop ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <Smartphone className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* WARZONE BANNER */}
      {assessment.security.data.warStatus === 'active_war' && (
        <div className="rounded-2xl p-5 bg-rose-600 text-white shadow-2xl shadow-rose-900/40 border border-rose-400/30 flex items-start gap-4">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-white/10 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] font-black tracking-widest uppercase mb-1 text-rose-200">⚠ Active Armed Conflict — Do Not Travel</h4>
            {assessment.security.data.conflictLabel && (
              <p className="text-base font-bold mb-1">{assessment.security.data.conflictLabel}</p>
            )}
            <p className="text-xs text-rose-100 font-medium leading-relaxed">
              {assessment.security.data.conflictSince 
                ? `Ongoing since ${assessment.security.data.conflictSince}. ` 
                : ''}
              This region is classified as an active warzone. All civilian travel is strongly advised against. Follow your government's emergency evacuation directives.
            </p>
          </div>
        </div>
      )}

      {/* CORE HEADER */}
      <div className="glass-card hover-lift rounded-3xl p-8 relative overflow-hidden group premium-shadow">
        <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] opacity-20 -mr-10 -mt-10 ${getStatusBg(assessment.score)}`} />
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Scan Profile</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">
              {location.name}
            </h1>
            <div className="flex items-center gap-3">
               <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300">
                 {location.countryName || 'Regional'}
               </div>

            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto">
            <div className="text-left lg:text-right hidden sm:block">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{assessment.rating}</h3>
              <p className="text-xs text-slate-500 font-medium">Safety Classification</p>
            </div>
            <div className={`w-24 h-24 lg:w-28 lg:h-28 rounded-3xl flex flex-col items-center justify-center border border-white/20 dark:border-white/10 ${getStatusBg(assessment.score)} shadow-xl shadow-slate-900/10 shrink-0`}>
              <span className="text-4xl font-black text-white font-mono tracking-tighter">{assessment.score}</span>
              <span className="text-[9px] font-black text-white/70 uppercase tracking-widest mt-1">/ 100 IDX</span>
            </div>
          </div>
        </div>

        {/* Global Census Profile [v4.0] */}
        {assessment.quickFacts.population !== 'Data N/A' && (
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Census Population</span>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{assessment.quickFacts.population}</span>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-100 dark:bg-slate-800 mx-2 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Land Area</span>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{assessment.quickFacts.landArea}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MULTI-COLUMN LAYOUT */}
      <div className={isDesktop ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
        
        {/* LEFT COLUMN: DIMENSIONS & TIPS */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card rounded-3xl p-8">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Target Safety Vectors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 stagger-children">
              <RiskBar label="Atmospheric Safety" data={dim.atmospheric} />
              <RiskBar label="Meteorological Risk" data={dim.meteorological} />
              <RiskBar label="Geopolitical Stability" data={dim.geopolitical} />
              <RiskBar label="General Security" data={dim.security} />
              <RiskBar label="Air Quality (AQI)" data={dim.airQualityIndex} />
              <RiskBar label="Women's Safety" data={dim.womenSafety} />
              <RiskBar label="LGBTQ+ Safety" data={dim.lgbtqSafety} />
              <RiskBar label="Child Safety" data={dim.childSafety} />
            </div>
          </div>

          <div className="glass-card hover-lift rounded-3xl p-8">
             <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
               <Info className="w-4 h-4 text-emerald-500" /> Operational Directives
             </h3>
             <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {assessment.tips.map((tip, i) => (
                 <li key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                   <div className="w-6 h-6 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                     <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">{i+1}</span>
                   </div>
                   <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{tip}</p>
                 </li>
               ))}
             </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGISTICS & BRIEF */}
        <div className="flex flex-col gap-6">


          {/* Aviation Monitor */}
          <div className="glass-card rounded-3xl p-6 bg-gradient-to-b from-blue-500/5 to-transparent border-t-2 border-t-blue-500">
             <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-5 flex items-center gap-2">
               <Navigation className="w-4 h-4" /> Aviation & Logistics
             </h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Airspace</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${assessment.logistics.airspace === 'open' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {assessment.logistics.airspace}
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                  &quot;{assessment.logistics.details}&quot;
                </p>
             </div>
          </div>

          {/* Emergency contacts */}
          <div className="glass-card rounded-3xl p-6 bg-rose-500/5 border-t-2 border-rose-500">
             <h3 className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <ShieldAlert className="w-4 h-4" /> Emergency
             </h3>
             <div className="space-y-2">
                <ContactRow label="Police" number={assessment.emergency.police} icon={Shield} />
                <ContactRow label="Medical" number={assessment.emergency.ambulance} icon={HeartPulse} />
                <ContactRow label="Fire" number={assessment.emergency.fire} icon={Zap} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskBar({ label, data }: { label: string, data: DimensionData }) {
  const value = data.score;
  const color = value >= 7 ? 'bg-emerald-500' : value >= 4 ? 'bg-amber-500' : 'bg-rose-500';
  const percentage = Math.round((value / 10) * 100);
  return (
    <div className="group relative" role="meter" aria-label={`${label}: ${value} out of 10`} aria-valuenow={value} aria-valuemin={0} aria-valuemax={10}>
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-help">
          {label} <Info className="w-3 h-3 text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity" />
        </span>
        <span className="text-[10px] font-black text-slate-400">{value}/10</span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
          role="presentation"
        />
      </div>
      
      {/* Tooltip Hover Box */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-56 sm:w-64 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-[0_20px_40px_rgb(0,0,0,0.2)] opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:-translate-y-[110%] transition-all duration-300 z-[1000] pointer-events-none">
         <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
           <Database className="w-3 h-3 text-blue-500" /> Reference Log
         </h4>
         <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3">{data.source}</p>
         
         <div className="h-px w-full bg-slate-100 dark:bg-white/5 mb-3" />
         
         <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
           <Zap className="w-3 h-3 text-amber-500" /> Live Justification
         </h4>
         <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{data.justification}</p>
         
         {/* Tooltip Arrow below */}
         <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-r border-slate-200 dark:border-white/10 rotate-45 shadow-sm" />
      </div>
    </div>
  );
}

function ContactRow({ label, number, icon: Icon }: any) {
  return (
    <a 
      href={`tel:${number}`}
      className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 hover:bg-rose-500/5 transition-colors group"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-rose-500 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</span>
      </div>
      <span className="text-xs font-black text-rose-600 dark:text-rose-400">{number}</span>
    </a>
  );
}
