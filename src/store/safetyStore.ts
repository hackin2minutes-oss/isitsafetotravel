import { create } from 'zustand';
import { Location, SafetyAssessment } from '@/types';

interface SafetyState {
  selectedLocation: Location | null;
  assessment: SafetyAssessment | null;
  originCountry: string; // ISO Code, e.g. 'US'
  quizResults: { score: number; level: string; timestamp: string } | null;
  isAnalyzing: boolean;
  error: string | null;
  setSelectedLocation: (location: Location | null) => void;
  setAssessment: (assessment: SafetyAssessment | null) => void;
  setOriginCountry: (code: string) => void;
  setQuizResults: (results: { score: number; level: string; timestamp: string } | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSafetyStore = create<SafetyState>((set) => ({
  // Initialize with null to force user location or Empty State
  selectedLocation: null,
  assessment: null,
  originCountry: 'US',
  quizResults: null,

  isAnalyzing: false,
  error: null,
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setAssessment: (assessment) => set({ assessment }),
  setOriginCountry: (originCountry) => set({ originCountry }),
  setQuizResults: (quizResults) => set({ quizResults }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setError: (error) => set({ error }),
}));