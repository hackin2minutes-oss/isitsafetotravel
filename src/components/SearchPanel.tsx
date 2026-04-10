'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Navigation2 } from 'lucide-react';
import { searchLocations } from '@/services/locationService';
import { Location } from '@/types';

interface SearchPanelProps {
  onLocationSelect: (location: Location) => void;
}

export function SearchPanel({ onLocationSelect }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useRef(
    (() => {
      let timeout: NodeJS.Timeout;
      return (q: string) => {
        clearTimeout(timeout);
        if (q.length < 3) {
          setResults([]);
          return;
        }
        setIsSearching(true);
        timeout = setTimeout(async () => {
          try {
            const data = await searchLocations(q);
            setResults(data);
          } catch (error) {
            console.error('Search failed:', error);
          } finally {
            setIsSearching(false);
          }
        }, 800);
      };
    })()
  ).current;

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

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
    console.log('SearchPanel: Location selected', loc);
    onLocationSelect(loc);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span className="text-[9px] font-mono-technical text-slate-500">Search locations</span>
        </div>

        {isSearching && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
            <span className="text-[8px] font-mono-technical text-indigo-400">Searching...</span>
          </div>
        )}
      </div>

      <div className="relative group">
        <div className="relative flex items-center bg-white/[0.02] border border-white/10 rounded-xl transition-all focus-within:bg-white/[0.04] focus-within:border-indigo-500/30">
          <div className="pl-4 pr-2">
            <Search className="w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search cities, countries..."
            className="w-full bg-transparent py-3.5 outline-none text-xs font-bold text-white placeholder:text-slate-700 tracking-tight uppercase"
          />

          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); }}
              className="p-3 text-slate-500 hover:text-white transition-all mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-panel-heavy rounded-xl overflow-hidden z-[2000] animate-fade-up">
          {results.length > 0 ? (
            <div className="py-1">
              {results.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelect(loc)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/[0.03] transition-all text-left group border-b border-white/[0.03] last:border-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/5 transition-all">
                    <Navigation2 className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors rotate-45" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-black text-white group-hover:text-indigo-400 transition-colors uppercase">
                      {loc.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono-technical text-slate-500">{loc.countryName || 'Global'}</span>
                      <span className="text-[8px] font-mono text-slate-700">
                        [{loc.coordinates.latitude.toFixed(2)}, {loc.coordinates.longitude.toFixed(2)}]
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 3 && !isSearching ? (
            <div className="p-6 text-center">
              <p className="text-[9px] font-mono-technical text-slate-500">No results found for "{query}"</p>
              <p className="text-[8px] text-slate-600 mt-1">Try a different search term</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
