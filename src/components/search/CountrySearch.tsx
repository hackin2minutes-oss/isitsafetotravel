'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, MapPin, X, Clock } from 'lucide-react';
import { ScoredCountry } from '@/scoring/types';
import { getScoreRating } from '@/scoring/scoring';
import debounce from 'lodash/debounce';

interface CountrySearchProps {
  countries: ScoredCountry[];
  onSelect: (country: ScoredCountry) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CountrySearch({
  countries,
  onSelect,
  placeholder = 'Search for a country...',
  autoFocus = false,
}: CountrySearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter countries based on query
  const filteredCountries = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return countries
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q)
      )
      .slice(0, 8); // Limit to 8 results
  }, [query, countries]);

  // Debounced search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setSelectedIndex(0);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredCountries.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCountries.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCountries[selectedIndex]) {
          handleSelect(filteredCountries[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  // Handle selection
  const handleSelect = (country: ScoredCountry) => {
    onSelect(country);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-12 pr-12 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && filteredCountries.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="py-2">
            {filteredCountries.map((country, index) => {
              const rating = getScoreRating(country.score.score);
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={country.code}
                  onClick={() => handleSelect(country)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${
                    isSelected ? 'bg-emerald-500/20' : 'hover:bg-slate-800'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm"
                    style={{ backgroundColor: rating.color }}
                  >
                    {country.score.score.toFixed(1)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-white">{country.name}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="uppercase">{country.code}</span>
                      {country.rank && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">#{country.rank}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-xs font-medium px-2 py-1 rounded-lg"
                      style={{ backgroundColor: `${rating.color}20`, color: rating.color }}
                    >
                      {rating.category.replace('_', ' ')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Enter</kbd>
                to select
              </span>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.trim() && filteredCountries.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 text-center">
          <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400">No countries found for "{query}"</p>
          <p className="text-xs text-slate-500 mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
