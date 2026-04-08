'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Globe, History, Sparkles, X, Heart } from 'lucide-react';
import { searchLocations } from '@/services/locationService';
import { Location } from '@/types';
import { debounce } from 'lodash';

interface SearchPanelProps {
  onLocationSelect: (location: Location) => void;
}

import { useSafetyStore } from '@/store/safetyStore';

const MAJOR_COUNTRIES = [
  { code: 'US', name: 'USA' },
  { code: 'GB', name: 'UK' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'RU', name: 'Russia' },
  { code: 'IL', name: 'Israel' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' }
];

export function SearchPanel({ onLocationSelect }: SearchPanelProps) {
  const { originCountry, setOriginCountry } = useSafetyStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // --- Premium Debounced Search ---
  const debouncedSearch = useRef(
    debounce(async (q: string) => {
      if (q.length < 3) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const data = await searchLocations(q);
        setResults(data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 800)
  ).current;

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  // --- Close Dropdown on Click Outside ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: Location) => {
    onLocationSelect(loc);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
             <MapPin className="w-3.5 h-3.5 text-emerald-500" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               Global
             </span>
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-white/10">
            <Globe className="w-3 h-3 text-slate-400" />
            <select 
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              className="bg-transparent text-[10px] font-bold text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer outline-none uppercase tracking-widest appearance-none"
            >
              {MAJOR_COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {isSearching && (
          <div aria-live="polite" aria-atomic="true" className="flex items-center gap-2">
             <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" aria-hidden="true" />
             <span className="text-[9px] font-medium text-emerald-500 uppercase tracking-widest">Indexing...</span>
          </div>
        )}
      </div>

      {/* Floating Modern Input Wrapper */}
      <div className="relative group">
        <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/5 blur-xl group-focus-within:bg-emerald-500/20 transition-all pointer-events-none" />
        
        <div className="relative flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-1 shadow-premium focus-within:ring-2 focus-within:ring-emerald-500/30 transition-all">
          <div className="pl-4 pr-2">
             <Search className="w-4.5 h-4.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search for a city or country..."
            aria-label="Search for a city or country"
            aria-expanded={showResults && results.length > 0}
            aria-controls="search-results-list"
            aria-autocomplete="list"
            role="combobox"
            className="w-full bg-transparent py-3.5 outline-none text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />

          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); }}
              aria-label="Clear search"
              className="p-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}


        </div>
      </div>

      {/* Modern Results Dropdown */}
      {showResults && (
        <div
          id="search-results-list"
          role="listbox"
          aria-label="Search results"
          className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-[2000] animate-safe-fade-in"
        >
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelect(loc)}
                  role="option"
                  aria-selected="false"
                  className="w-full px-5 py-4 flex items-start gap-4 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 transition-all group text-left"
                >
                  <div className="mt-1 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-white/5 transition-all group-hover:bg-emerald-500 group-hover:border-emerald-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 transition-colors group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {loc.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{loc.countryName || 'Global Area'}</span>
                      <div className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="text-[10px] text-slate-400 font-mono italic">
                        {loc.coordinates.latitude.toFixed(2)}, {loc.coordinates.longitude.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <CompassIcon className="w-3 h-3 text-slate-200 dark:text-slate-700 group-hover:text-emerald-500/40 transition-colors self-center" />
                </button>
              ))}
            </div>
          ) : query.length >= 3 && !isSearching ? (
             <div aria-live="polite" role="status" className="p-8 text-center flex flex-col items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                 <Globe className="w-6 h-6 text-slate-300 animate-pulse" aria-hidden="true" />
               </div>
               <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">No Tactical Contacts Found</p>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tight mt-1">Infrastructure may be rate-limited. Try a broader term.</p>
               </div>
             </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function CompassIcon(props: any) {
  return (
    <svg 
      {...props}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
