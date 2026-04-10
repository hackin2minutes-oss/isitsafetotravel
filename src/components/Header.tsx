'use client';

import React from 'react';
import { Bell, Shield, ArrowRight } from 'lucide-react';

export function Header() {
  return (
    <header className="relative w-full h-16 shrink-0 bg-[#08090C] border-b border-white/[0.08] flex items-center px-6 z-[1000]">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent opacity-50" />
      
      <div className="relative w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <h1 className="text-sm font-black text-white tracking-wider">
            Is It Safe To Travel
          </h1>
        </div>
      </div>
    </header>
  );
}
