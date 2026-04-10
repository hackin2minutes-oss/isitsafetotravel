'use client';

import React from 'react';
import { ScoredCountry } from '@/scoring/types';
import { getScoreRating } from '@/scoring/scoring';
import { Globe, ChevronRight } from 'lucide-react';

interface SafetyMapProps {
  countries: ScoredCountry[];
  selectedCountry: string | null;
  onCountrySelect: (countryCode: string) => void;
  className?: string;
}

export function SafetyMap({
  countries,
  selectedCountry,
  onCountrySelect,
  className = '',
}: SafetyMapProps) {
  const topCountries = [...countries]
    .sort((a, b) => (b.score?.score || 0) - (a.score?.score || 0))
    .slice(0, 20);

  return (
    <div className={`relative ${className}`}>
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8">
          <div className="text-center">
            <Globe className="w-24 h-24 mx-auto mb-4 text-emerald-500 opacity-50" />
            <p className="text-slate-400 text-lg mb-2">Interactive Map</p>
            <p className="text-slate-500 text-sm">Select a country from the list</p>
          </div>
        </div>
        
        <div className="mt-4 space-y-1 max-h-64 overflow-y-auto">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
            Top 20 Safest Countries
          </h4>
          {topCountries.map((country) => {
            const rating = getScoreRating(country.score?.score || 5);
            const isSelected = selectedCountry === country.code;
            
            return (
              <button
                key={country.code}
                onClick={() => onCountrySelect(country.code)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                  isSelected 
                    ? 'bg-emerald-500/20 border border-emerald-500/50' 
                    : 'hover:bg-slate-700/50'
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: rating.color + '30', color: rating.color }}
                >
                  {country.rank || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {country.name}
                  </p>
                  <p className="text-xs text-slate-400 uppercase">{country.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: rating.color }}>
                    {country.score?.score?.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
