'use client';

import React, { useState, useEffect } from 'react';
import { SafetyMap } from '@/components/map/SafetyMap';
import { CountryCard } from '@/components/map/CountryCard';
import { CountrySearch } from '@/components/search/CountrySearch';
import { ComparisonTool } from '@/components/comparison/ComparisonTool';
import { ScoredCountry } from '@/scoring/types';
import { getScoreRating } from '@/scoring/scoring';
import {
  Shield,
  Globe,
  Map as MapIcon,
  BarChart3,
  Search,
  Trophy,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

// Mock data for demo (in production, would fetch from API)
const MOCK_COUNTRIES: ScoredCountry[] = [
  { code: 'IS', name: 'Iceland', baselines: { countryCode: 'IS', lastUpdated: '' }, signals: { countryCode: 'IS', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 9.4, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.98, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.95, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.92, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.94, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.88, weight: 0.10 }], isHardCapped: false, isFloorLimited: false, rawGeometricMean: 0.93 }, rank: 1 },
  { code: 'NZ', name: 'New Zealand', baselines: { countryCode: 'NZ', lastUpdated: '' }, signals: { countryCode: 'NZ', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 9.2, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.96, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.94, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.91, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.93, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.85, weight: 0.10 }], isHardCapped: false, isFloorLimited: false, rawGeometricMean: 0.92 }, rank: 2 },
  { code: 'SG', name: 'Singapore', baselines: { countryCode: 'SG', lastUpdated: '' }, signals: { countryCode: 'SG', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 9.1, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.95, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.96, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.90, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.92, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.86, weight: 0.10 }], isHardCapped: false, isFloorLimited: false, rawGeometricMean: 0.92 }, rank: 3 },
  { code: 'JP', name: 'Japan', baselines: { countryCode: 'JP', lastUpdated: '' }, signals: { countryCode: 'JP', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 8.9, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.92, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.94, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.95, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.88, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.78, weight: 0.10 }], isHardCapped: false, isFloorLimited: false, rawGeometricMean: 0.90 }, rank: 4 },
  { code: 'NO', name: 'Norway', baselines: { countryCode: 'NO', lastUpdated: '' }, signals: { countryCode: 'NO', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 8.8, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.93, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.91, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.93, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.95, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.82, weight: 0.10 }], isHardCapped: false, isFloorLimited: false, rawGeometricMean: 0.91 }, rank: 5 },
  { code: 'SE', name: 'Sweden', baselines: { countryCode: 'SE', lastUpdated: '' }, signals: { countryCode: 'SE', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 8.6, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.90, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.85, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.92, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.92, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.84, weight: 0.10 }], isHardCapped: false, isFloorLimited: false, rawGeometricMean: 0.89 }, rank: 6 },
  { code: 'FI', name: 'Finland', baselines: { countryCode: 'FI', lastUpdated: '' }, signals: { countryCode: 'FI', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 8.7, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.91, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.92, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.93, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.94, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.83, weight: 0.10 }], isHardCapped: false, isFloorLimited: false, rawGeometricMean: 0.91 }, rank: 7 },
  { code: 'DK', name: 'Denmark', baselines: { countryCode: 'DK', lastUpdated: '' }, signals: { countryCode: 'DK', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 8.5, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.89, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.90, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.91, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.93, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.81, weight: 0.10 }], isHardCapped: false, isFloorLimited: false, rawGeometricMean: 0.89 }, rank: 8 },
  { code: 'CH', name: 'Switzerland', baselines: { countryCode: 'CH', lastUpdated: '' }, signals: { countryCode: 'CH', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 8.4, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.88, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.89, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.94, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.92, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.80, weight: 0.10 }], isHardCapped: false, isFloorLimited: false, rawGeometricMean: 0.89 }, rank: 9 },
  { code: 'CA', name: 'Canada', baselines: { countryCode: 'CA', lastUpdated: '' }, signals: { countryCode: 'CA', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 8.3, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.87, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.82, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.90, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.89, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.79, weight: 0.10 }], isHardCapped: false, isFloorLimited: false, rawGeometricMean: 0.86 }, rank: 10 },
  // Add more countries...
  { code: 'US', name: 'United States', baselines: { countryCode: 'US', lastUpdated: '' }, signals: { countryCode: 'US', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 7.2, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.75, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.65, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.78, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.72, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.70, weight: 0.10 }], isHardCapped: false, isFloorLimited: false, rawGeometricMean: 0.72 }, rank: 45 },
  { code: 'GB', name: 'United Kingdom', baselines: { countryCode: 'GB', lastUpdated: '' }, signals: { countryCode: 'GB', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 7.5, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.78, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.74, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.80, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.82, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.72, weight: 0.10 }], isHardCapped: false, isFloorLimited: false, rawGeometricMean: 0.77 }, rank: 38 },
  { code: 'IN', name: 'India', baselines: { countryCode: 'IN', lastUpdated: '' }, signals: { countryCode: 'IN', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 5.8, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.55, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.50, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.52, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.48, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.55, weight: 0.10 }], isHardCapped: false, isFloorLimited: false, rawGeometricMean: 0.52 }, rank: 125 },
  { code: 'CN', name: 'China', baselines: { countryCode: 'CN', lastUpdated: '' }, signals: { countryCode: 'CN', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 6.2, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.60, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.70, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.68, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.45, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.50, weight: 0.10 }], isHardCapped: false, isFloorLimited: false, rawGeometricMean: 0.59 }, rank: 105 },
  { code: 'RU', name: 'Russia', baselines: { countryCode: 'RU', lastUpdated: '' }, signals: { countryCode: 'RU', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 3.5, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.25, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.40, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.55, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.30, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.45, weight: 0.10 }], isHardCapped: false, isFloorLimited: true, rawGeometricMean: 0.35 }, rank: 180 },
  { code: 'UA', name: 'Ukraine', baselines: { countryCode: 'UA', lastUpdated: '' }, signals: { countryCode: 'UA', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 1.8, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.05, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.30, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.50, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.25, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.40, weight: 0.10 }], isHardCapped: true, isFloorLimited: false, rawGeometricMean: 0.18 }, rank: 220 },
  { code: 'SY', name: 'Syria', baselines: { countryCode: 'SY', lastUpdated: '' }, signals: { countryCode: 'SY', advisories: [], lastUpdated: '' }, advisories: [], score: { score: 1.2, pillarScores: [{ name: 'conflict', displayName: 'Conflict', value: 0.02, weight: 0.30 }, { name: 'crime', displayName: 'Crime', value: 0.15, weight: 0.25 }, { name: 'health', displayName: 'Health', value: 0.25, weight: 0.20 }, { name: 'governance', displayName: 'Governance', value: 0.10, weight: 0.15 }, { name: 'environment', displayName: 'Environment', value: 0.30, weight: 0.10 }], isHardCapped: true, isFloorLimited: false, rawGeometricMean: 0.12 }, rank: 245 },
];

export default function SafetyDashboard() {
  const [activeTab, setActiveTab] = useState<'map' | 'rankings' | 'compare'>('map');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedCountryData = MOCK_COUNTRIES.find(c => c.code === selectedCountry);

  const handleCountrySelect = (country: ScoredCountry) => {
    setSelectedCountry(country.code);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-black text-lg tracking-tight">Global Safety Index</h1>
                <p className="text-xs text-slate-400">Powered by Weighted Geometric Mean</p>
              </div>
            </div>

            {/* Nav Tabs */}
            <div className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl">
              {[
                { id: 'map', label: 'Map', icon: Globe },
                { id: 'rankings', label: 'Rankings', icon: Trophy },
                { id: 'compare', label: 'Compare', icon: BarChart3 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === id
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Data</span>
              </div>
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {/* Mobile Tab Navigation */}
        <div className="md:hidden flex gap-1 bg-slate-800/50 p-1 rounded-xl mb-4">
          {[
            { id: 'map', label: 'Map', icon: Globe },
            { id: 'rankings', label: 'Rankings', icon: Trophy },
            { id: 'compare', label: 'Compare', icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Map/Rankings/Compare */}
          <div className="lg:col-span-2">
            {activeTab === 'map' && (
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden h-[500px]">
                <SafetyMap
                  countries={MOCK_COUNTRIES}
                  selectedCountry={selectedCountry}
                  onCountrySelect={setSelectedCountry}
                  className="h-full"
                />
              </div>
            )}

            {activeTab === 'rankings' && (
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4">
                <h2 className="text-lg font-bold mb-4">Top 20 Safest Countries</h2>
                <div className="space-y-2">
                  {MOCK_COUNTRIES.slice(0, 20).map((country, index) => {
                    const rating = getScoreRating(country.score.score);
                    return (
                      <div
                        key={country.code}
                        onClick={() => setSelectedCountry(country.code)}
                        className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                          selectedCountry === country.code
                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                            : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="text-slate-500 font-mono w-6">{index + 1}.</span>
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-sm"
                          style={{ backgroundColor: rating.color }}
                        >
                          {country.score.score.toFixed(1)}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-white">{country.name}</div>
                          <div className="text-xs text-slate-400">{country.code}</div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {rating.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'compare' && (
              <ComparisonTool countries={MOCK_COUNTRIES} />
            )}
          </div>

          {/* Right Column - Search & Details */}
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                Search Countries
              </h3>
              <CountrySearch
                countries={MOCK_COUNTRIES}
                onSelect={handleCountrySelect}
                placeholder="Search 248 countries..."
              />
            </div>

            {/* Selected Country Details */}
            {selectedCountryData && (
              <CountryCard
                country={selectedCountryData}
                rank={selectedCountryData.rank}
                onCompare={() => setActiveTab('compare')}
              />
            )}

            {/* Quick Stats */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Global Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                  <div className="text-2xl font-black text-emerald-400">248</div>
                  <div className="text-xs text-slate-400">Countries</div>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                  <div className="text-2xl font-black text-emerald-400">7.2</div>
                  <div className="text-xs text-slate-400">Avg Score</div>
                </div>
                <div className="text-center p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <div className="text-2xl font-black text-emerald-400">Iceland</div>
                  <div className="text-xs text-emerald-400">Safest</div>
                </div>
                <div className="text-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <div className="text-2xl font-black text-red-400">Syria</div>
                  <div className="text-xs text-red-400">Most Dangerous</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>Global Safety Index | Data from World Bank, GDACS, Government Travel Advisories</p>
          <p className="mt-1">Scores calculated using Weighted Geometric Mean with 24-hour data freshness</p>
        </div>
      </footer>
    </div>
  );
}
