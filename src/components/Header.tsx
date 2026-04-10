'use client';

import React from 'react';
import { Bell, Shield, ArrowRight } from 'lucide-react';

export function Header() {
  return (
    <header className="relative w-full h-16 shrink-0 bg-[#08090C] border-b border-white/[0.08] flex items-center px-6 z-[1000]">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent opacity-50" />
      
      <div className="relative w-full flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Shield className="w-4 h-4 text-indigo-400" />
             </div>
             <div className="flex flex-col">
                <h1 className="text-xs font-black text-white tracking-widest uppercase leading-none mb-1">
                   TRVL<span className="text-indigo-400">SFE</span> // OPS
                </h1>
                <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.4em] leading-none">Intelligence Protocol v4.0</span>
             </div>
          </div>

          <div className="h-4 w-px bg-white/5 hidden md:block" />

          <div className="hidden md:flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-mono-technical text-emerald-500">System Nominal</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[8px] font-mono-technical text-slate-500">Latency: 24ms</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-5 py-2 bg-indigo-500 rounded-xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
             Sync Feed
          </button>
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative group cursor-pointer hover:bg-white/10 transition-all">
             <Bell className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
             <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-[#08090C]" />
          </div>
        </div>
      </div>
    </header>
  );
}
