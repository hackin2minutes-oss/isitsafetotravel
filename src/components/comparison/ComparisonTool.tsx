'use client';

import React, { useState } from 'react';
import { ScoredCountry } from '@/scoring/types';
import { getScoreRating } from '@/scoring/scoring';
import { X, ArrowLeftRight, Trophy } from 'lucide-react';

interface ComparisonToolProps {
  countries: ScoredCountry[];
  initialCountry1?: string;
  initialCountry2?: string;
  onClose?: () => void;
}

export function ComparisonTool({
  countries,
  initialCountry1,
  initialCountry2,
  onClose,
}: ComparisonToolProps) {
  const [country1Code, setCountry1Code] = useState(initialCountry1 || '');
  const [country2Code, setCountry2Code] = useState(initialCountry2 || '');

  const country1 = countries.find((c) => c.code === country1Code);
  const country2 = countries.find((c) => c.code === country2Code);

  const getWinner = (pillarName: string): 0 | 1 | 2 => {
    if (!country1 || !country2) return 0;
    const p1 = country1.score.pillarScores.find((p) => p.name === pillarName)?.value ?? 0;
    const p2 = country2.score.pillarScores.find((p) => p.name === pillarName)?.value ?? 0;
    if (p1 === p2) return 0;
    return p1 > p2 ? 1 : 2;
  };

  const overallWinner = country1 && country2
    ? country1.score.score > country2.score.score
      ? 1
      : country2.score.score > country1.score.score
      ? 2
      : 0
    : 0;

  const scoreDiff = country1 && country2
    ? Math.abs(country1.score.score - country2.score.score).toFixed(1)
    : '0.0';

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-white">Country Comparison</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Country Selectors */}
      <div className="p-4 border-b border-slate-800">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider">
              First Country
            </label>
            <select
              value={country1Code}
              onChange={(e) => setCountry1Code(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select country...</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider">
              Second Country
            </label>
            <select
              value={country2Code}
              onChange={(e) => setCountry2Code(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select country...</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      {country1 && country2 && (
        <div className="p-4 space-y-4">
          {/* Overall Score Comparison */}
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Country 1 */}
            <div className="text-center">
              <div
                className="text-5xl font-black mb-2"
                style={{ color: getScoreRating(country1.score.score).color }}
              >
                {country1.score.score.toFixed(1)}
              </div>
              <div className="font-bold text-white">{country1.name}</div>
              {overallWinner === 1 && (
                <div className="flex items-center justify-center gap-1 mt-2 text-emerald-400">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs font-bold">WINNER</span>
                </div>
              )}
            </div>

            {/* VS & Diff */}
            <div className="text-center">
              <div className="text-slate-500 text-sm mb-1">Difference</div>
              <div className="text-2xl font-black text-slate-300">+{scoreDiff}</div>
              <div className="flex justify-center gap-2 mt-2">
                <ArrowLeftRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Country 2 */}
            <div className="text-center">
              <div
                className="text-5xl font-black mb-2"
                style={{ color: getScoreRating(country2.score.score).color }}
              >
                {country2.score.score.toFixed(1)}
              </div>
              <div className="font-bold text-white">{country2.name}</div>
              {overallWinner === 2 && (
                <div className="flex items-center justify-center gap-1 mt-2 text-emerald-400">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs font-bold">WINNER</span>
                </div>
              )}
            </div>
          </div>

          {/* Pillar Comparison */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pillar Breakdown
            </h3>
            
            {['conflict', 'crime', 'health', 'governance', 'environment'].map(
              (pillar) => {
                const winner = getWinner(pillar);
                const p1Value = country1.score.pillarScores.find(
                  (p) => p.name === pillar
                )?.value ?? 0;
                const p2Value = country2.score.pillarScores.find(
                  (p) => p.name === pillar
                )?.value ?? 0;

                return (
                  <div key={pillar} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={`font-medium ${
                        winner === 1 ? 'text-emerald-400' : 'text-slate-300'
                      }`}>
                        {pillar.charAt(0).toUpperCase() + pillar.slice(1)}
                      </span>
                      <span className="text-slate-400">
                        {(p1Value * 10).toFixed(1)} vs {(p2Value * 10).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            winner === 1 ? 'bg-emerald-500' : 'bg-slate-600'
                          }`}
                          style={{ width: `${p1Value * 100}%` }}
                        />
                      </div>
                      <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ml-auto ${
                            winner === 2 ? 'bg-emerald-500' : 'bg-slate-600'
                          }`}
                          style={{ width: `${p2Value * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!country1 || !country2) && (
        <div className="p-12 text-center">
          <ArrowLeftRight className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">
            Select two countries to compare their safety scores
          </p>
        </div>
      )}
    </div>
  );
}
