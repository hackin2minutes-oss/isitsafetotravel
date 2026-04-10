'use client';

import React from 'react';
import { ScoredCountry } from '@/scoring/types';
import { getScoreRating } from '@/scoring/scoring';
import {
  Shield,
  AlertTriangle,
  X,
  TrendingUp,
  TrendingDown,
  Star,
  Zap,
  Activity,
  Globe,
  Lock,
  Heart,
  Users,
  Wind,
  ShieldCheck
} from 'lucide-react';

interface CountryCardProps {
  country: ScoredCountry;
  compact?: boolean;
  showPillars?: boolean;
  rank?: number;
  onCompare?: () => void;
  onClose?: () => void;
}

export function CountryCard({
  country,
  compact = false,
  showPillars = true,
  rank,
  onCompare,
  onClose,
}: CountryCardProps) {
  const rating = getScoreRating(country.score.score);
  const colorClass = getVariantColor(country.rank || 1);

  if (compact) {
    return (
      <div className="glass-card p-4 transition-all hover:neon-border group animate-fade-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {rank && (
              <div className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-widest bg-white/[0.03] border border-white/5 ${colorClass}`}>
                #{rank}
              </div>
            )}
            <div>
              <h3 className="text-sm font-black text-white group-hover:neon-text transition-all tracking-tight uppercase">{country.name}</h3>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">{country.code}</span>
            </div>
          </div>
          <div className={`text-xl font-black ${colorClass} tracking-tighter`}>
            {country.score.score.toFixed(1)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel-heavy rounded-[2.5rem] overflow-hidden animate-scale-in border-white/5 shadow-2xl">
      {/* HEADER SECTION */}
      <div className="p-8 relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-600/10 blur-[80px] rounded-full" />
        
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-2xl transition-all active:scale-95 group"
          >
            <X className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </button>
        )}

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            {rank && (
              <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] bg-white/[0.03] border border-white/10 ${colorClass}`}>
                RANK #{rank}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Area</span>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter leading-none mb-2 uppercase">
                {country.name}
              </h2>
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-slate-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{country.code} Intel Feed</span>
              </div>
            </div>

            <div className="text-right">
              <div className={`text-5xl font-black ${colorClass} tracking-tighter score-glow`}>
                {country.score.score.toFixed(1)}
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 opacity-60" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{rating.category}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
             <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">GPI VERIFIED</span>
             </div>
             {country.change && (
               <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border ${
                 country.change === 'up' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
               }`}>
                 {country.change === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                 <span className="text-[10px] font-black uppercase tracking-widest">
                   {country.change === 'up' ? 'Improvement' : 'Degradation'}
                 </span>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* PILLARS BENTO GRID */}
      {showPillars && (
        <div className="p-8 space-y-8 bg-black/20">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-violet-500" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Security Pillar Metrics</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {country.score.pillarScores.map((pillar, i) => (
              <div key={pillar.name} className="space-y-4 group">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-violet-500/10 transition-colors">
                      {getPillarIcon(pillar.name)}
                    </div>
                    <div>
                      <span className="text-xs font-black text-white uppercase tracking-tight group-hover:text-violet-400 transition-colors">{pillar.displayName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Weight: {(pillar.weight * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-white tracking-tighter">{(pillar.value * 10).toFixed(1)}</span>
                    <span className="text-[10px] text-slate-600 font-bold ml-1">/ 10</span>
                  </div>
                </div>
                
                <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05]">
                  <div
                    className="h-full rounded-full transition-all duration-[1.5s] ease-out-expo shadow-inner"
                    style={{
                      width: `${pillar.value * 100}%`,
                      background: getPillarColor(pillar.value),
                      boxShadow: `0 0 20px ${getPillarColor(pillar.value)}40`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER ACTION */}
      {onCompare && (
        <div className="p-8">
          <button
            onClick={onCompare}
            className="w-full py-5 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-violet-500/50 rounded-3xl text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all relative overflow-hidden group active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Zap className="w-3.5 h-3.5 text-violet-500" />
              Analyze Conflict Synergy
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function getVariantColor(rank: number) {
  if (rank <= 10) return 'text-emerald-400';
  if (rank <= 30) return 'text-cyan-400';
  if (rank <= 60) return 'text-violet-400';
  if (rank <= 100) return 'text-amber-400';
  return 'text-rose-400';
}

function getPillarColor(value: number) {
  if (value >= 0.7) return '#10B981';
  if (value >= 0.4) return '#F59E0B';
  return '#EF4444';
}

function getPillarIcon(name: string) {
  switch(name) {
    case 'conflict': return <Activity className="w-3.5 h-3.5 text-rose-400" />;
    case 'crime': return <Lock className="w-3.5 h-3.5 text-amber-400" />;
    case 'health': return <Heart className="w-3.5 h-3.5 text-emerald-400" />;
    case 'governance': return <Shield className="w-3.5 h-3.5 text-violet-400" />;
    case 'environment': return <Wind className="w-3.5 h-3.5 text-cyan-400" />;
    default: return <Activity className="w-3.5 h-3.5" />;
  }
}
