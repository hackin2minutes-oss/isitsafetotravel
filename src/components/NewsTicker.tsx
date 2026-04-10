'use client';

import React from 'react';
import { Activity, Globe, Zap, AlertCircle } from 'lucide-react';
import { NewsItem } from '@/types';

interface NewsTickerProps {
  items: NewsItem[];
}

export function NewsTicker({ items }: NewsTickerProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 border-b border-white/10 overflow-hidden py-2 relative flex items-center">
      {/* Ticker Header */}
      <div className="px-4 z-10 bg-slate-900 flex items-center gap-2 border-r border-white/10 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
        <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase whitespace-nowrap">
          T1 Intel Ticker
        </span>
      </div>

      {/* Scrolling Container */}
      <div className="flex-1 overflow-hidden relative h-full">
        <div className="flex items-center gap-12 animate-ticker whitespace-nowrap h-full">
          {items.map((item) => (
            <a 
              key={item.id} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 transition-colors hover:bg-white/5 px-2 py-0.5 rounded cursor-pointer"
            >
              {item.relevance === 'high' ? (
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-blue-400" />
              )}
              
              <span className="text-xs font-medium text-slate-300 group-hover:text-white capitalize">
                {item.title}
              </span>
              
              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 border border-white/10 rounded-full text-slate-400 font-mono">
                  {item.source}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </a>
          ))}
          {/* Duplicate items for seamless loop */}
          {items.map((item) => (
            <a 
              key={`${item.id}-dup`} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 transition-colors hover:bg-white/5 px-2 py-0.5 rounded cursor-pointer"
            >
              {item.relevance === 'high' ? (
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-blue-400" />
              )}
              
              <span className="text-xs font-medium text-slate-300 group-hover:text-white capitalize">
                {item.title}
              </span>
              
              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 border border-white/10 rounded-full text-slate-400 font-mono">
                  {item.source}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: flex;
          animation: ticker 120s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
