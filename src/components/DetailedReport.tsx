'use client';

import { SafetyAssessment, Location } from '@/types';
import { 
  Cloud, Wind, Shield, Activity, TrendingUp, 
  Zap, AlertCircle, Droplets, Sun, Thermometer,
  ShieldCheck, ArrowUpRight, BarChart3
} from 'lucide-react';

interface DetailedReportProps {
  location: Location | null;
  assessment: SafetyAssessment | null;
}

export function DetailedReport({ location, assessment }: DetailedReportProps) {
  if (!location || !assessment) return null;

  const StatBox = ({ label, value, sub, color = 'text-emerald-500', icon: Icon }: any) => (
    <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 p-4 rounded-2xl flex flex-col hover:border-emerald-500/20 transition-all duration-300 group safe-hover-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{label}</span>
        {Icon && <Icon className={`w-3.5 h-3.5 ${color} opacity-40 group-hover:opacity-100 transition-opacity`} />}
      </div>
      <span className={`text-lg font-extrabold text-slate-900 dark:text-white font-sans tracking-tight`}>{value}</span>
      {sub && <span className="text-[10px] text-slate-500 font-medium mt-1 truncate">{sub}</span>}
    </div>
  );

  return (
    <div className="glass-card rounded-3xl p-8 lg:p-10 animate-safe-fade-in premium-shadow border-white/10 dark:border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
             <BarChart3 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Metrics_Insight</h3>
            <span className="text-[10px] text-slate-400 font-bold tracking-widest opacity-60">QUANTITATIVE_RISK_MODELS</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-white/5">
           <Zap className="w-3 h-3 text-amber-500" />
           <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Live_Sync</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ENVIRONMENT SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Cloud className="w-3.5 h-3.5 text-blue-500" />
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Environment</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="Temperature" value={`${assessment.weather.data.temperature}°C`} sub={`FEELS: ${assessment.weather.data.feelsLike}°`} icon={Thermometer} />
            <StatBox label="Humidity" value={`${assessment.weather.data.humidity}%`} color="text-blue-400" icon={Droplets} />
            <StatBox label="Wind_Speed" value={`${assessment.weather.data.windSpeed} k/h`} sub={assessment.weather.data.windDirection} icon={Wind} />
            <StatBox label="Visibility" value={`${assessment.weather.data.visibility} km`} icon={GlobeIcon} />
          </div>
        </section>

        {/* ATMOSPHERE SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Wind className="w-3.5 h-3.5 text-purple-500" />
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Atmosphere</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="PM2.5" value={assessment.airQuality.data.pm25} color="text-rose-400" icon={Activity} />
            <StatBox label="PM10" value={assessment.airQuality.data.pm10} color="text-amber-300" icon={Activity} />
            <StatBox label="Nitrogen_O2" value={assessment.airQuality.data.no2} icon={Activity} />
            <StatBox label="Ozone_G3" value={assessment.airQuality.data.o3} icon={Activity} />
          </div>
        </section>

        {/* SECURITY DEEP-SCAN */}
        <section className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Security_Analysis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50/50 dark:bg-slate-950/50 p-5 rounded-2xl border border-slate-100 dark:border-white/5 col-span-2">
              <div className="flex justify-between text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">
                <span>Instability_Scale</span>
                <span className="text-emerald-500">{assessment.security.data.violenceIndex}%</span>
              </div>
              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${assessment.security.data.violenceIndex}%` }} />
              </div>
            </div>
            <StatBox label="War_Status" value={assessment.security.data.warStatus.replace('_', ' ').toUpperCase()} color="text-amber-500" icon={AlertCircle} />
            <StatBox label="Incidents" value={assessment.security.data.recentIncidents} color={assessment.security.data.recentIncidents > 0 ? 'text-rose-500' : 'text-emerald-500'} icon={Activity} />
          </div>
        </section>
      </div>

      {/* FOOTER METADATA */}
      <div className="mt-10 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
             Consolidated_Data_Stream // Auth_Ref: 09-AF-X
          </p>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 tracking-tighter">DATASET_CONTINUITY_NOMINAL</span>
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
        </div>
      </div>
    </div>
  );
}

function GlobeIcon(props: any) {
  return (
    <svg 
      {...props}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
