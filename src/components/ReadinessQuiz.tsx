'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, ChevronLeft, Shield, AlertTriangle, 
  CheckCircle, Zap, ShieldAlert, Target, Info,
  Save, RefreshCw, BarChart3, Fingerprint, Lock
} from 'lucide-react';
import { SafetyAssessment, Location } from '@/types';
import { useSafetyStore } from '@/store/safetyStore';

interface Question {
  id: string;
  text: string;
  options: { label: string; points: number; hint: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 's01',
    text: 'Mission Profile',
    options: [
      { label: 'Solo Operative', points: 0, hint: 'High exposure. No immediate reinforcement.' },
      { label: 'Tandem (Pair)', points: 5, hint: 'Increased situational awareness.' },
      { label: 'Group Deployment', points: 10, hint: 'Maximum security through numbers.' }
    ]
  },
  {
    id: 's02',
    text: 'Field Experience',
    options: [
      { label: 'First International Op', points: 0, hint: 'High vulnerability to local deception.' },
      { label: 'Experienced Traveler', points: 5, hint: 'Standard situational proficiency.' },
      { label: 'Veteran / High-Freq', points: 10, hint: 'Advanced threat recognition capabilities.' }
    ]
  },
  {
    id: 's03',
    text: 'Signal Capability (Language)',
    options: [
      { label: 'Zero Local Language', points: 0, hint: 'Complete reliance on external tools.' },
      { label: 'Basic Survival Phrases', points: 5, hint: 'Able to navigate essential logistics.' },
      { label: 'Fluent / Local Native', points: 10, hint: 'Optimal integration into environment.' }
    ]
  },
  {
    id: 's04',
    text: 'Arrival Window',
    options: [
      { label: 'Night (22:00 - 05:00)', points: 0, hint: 'High transit risk. Reduced visibility.' },
      { label: 'Dusk (18:00 - 22:00)', points: 5, hint: 'Moderate transit hazard.' },
      { label: 'Daylight (05:00 - 18:00)', points: 10, hint: 'Optimal window for insertion.' }
    ]
  },
  {
    id: 's05',
    text: 'Safe House Status',
    options: [
      { label: 'Shared Hostel / Unsecured', points: 0, hint: 'Property risk. Minimal perimeter security.' },
      { label: 'Standard Hotel / Airbnb', points: 5, hint: 'Moderate property security.' },
      { label: 'Secured / Gated / High-End', points: 10, hint: 'Hardened perimeter. Active surviellance.' }
    ]
  },
  {
    id: 's06',
    text: 'Transit Intelligence',
    options: [
      { label: 'Unregistered Public Only', points: 0, hint: 'Exposure to transit scams.' },
      { label: 'Registered Apps (Uber/Grab)', points: 5, hint: 'Digital tracking and vetting active.' },
      { label: 'Private / Pre-Arranged', points: 10, hint: 'Secure, vetted transit corridor.' }
    ]
  },
  {
    id: 's07',
    text: 'Data Redundancy',
    options: [
      { label: 'Physical Only', points: 0, hint: 'High risk of loss or theft.' },
      { label: 'Digital Only', points: 5, hint: 'Device failure risk if no backup.' },
      { label: 'Hybrid (Cloud + Physical Encrypted)', points: 10, hint: 'Optimal document resilience.' }
    ]
  },
  {
    id: 's08',
    text: 'Medical Extraction Protocol',
    options: [
      { label: 'No Insurance', points: 0, hint: 'Critical financial and health risk.' },
      { label: 'Standard Travel Insurance', points: 5, hint: 'Basic coverage for emergencies.' },
      { label: 'Full Med-Evac / High-Risk Cover', points: 10, hint: 'Guaranteed secondary extraction.' }
    ]
  },
  {
    id: 's09',
    text: 'Emergency Communication',
    options: [
      { label: 'No Local Contacts', points: 0, hint: 'Isolated. No immediate aid.' },
      { label: 'Embassy Info Only', points: 5, hint: 'Official recourse available.' },
      { label: 'Trusted Local + Global SOS', points: 10, hint: 'Rapid response network established.' }
    ]
  },
  {
    id: 's10',
    text: 'Area Familiarity',
    options: [
      { label: 'Zero Prior Research', points: 0, hint: 'Operating blind in unknown sector.' },
      { label: 'Checked Blogs/Social Media', points: 5, hint: 'Superficial threat awareness.' },
      { label: 'Detailed Intel Study', points: 10, hint: 'Advanced situational knowledge.' }
    ]
  }
];

interface ReadinessQuizProps {
  location: Location | null;
  assessment: SafetyAssessment | null;
}

export function ReadinessQuiz({ location, assessment }: ReadinessQuizProps) {
  const { quizResults, setQuizResults } = useSafetyStore();
  const [currentStep, setCurrentStep] = useState(-1); // -1 for landing, 0-9 for questions, 10 for results
  const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(-1));
  const [isCalculated, setIsCalculated] = useState(false);

  const handleStart = () => {
    setCurrentStep(0);
    setAnswers(new Array(QUESTIONS.length).fill(-1));
    setIsCalculated(false);
  };

  const handleOptionSelect = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = index;
    setAnswers(newAnswers);
    
    // Auto-advance after small delay for feel
    setTimeout(() => {
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleFinalize();
      }
    }, 400);
  };

  const handleFinalize = () => {
    const totalPoints = answers.reduce((acc, curr, idx) => {
      return acc + (curr !== -1 ? QUESTIONS[idx].options[curr].points : 0);
    }, 0);
    
    let level = 'EXPOSED';
    if (totalPoints > 75) level = 'OPTIMAL';
    else if (totalPoints > 40) level = 'PREPARED';

    const results = {
      score: totalPoints,
      level,
      timestamp: new Date().toISOString()
    };

    setQuizResults(results);
    setCurrentStep(10);
    setIsCalculated(true);
  };

  const getStepProgress = () => ((currentStep + 1) / QUESTIONS.length) * 100;

  if (!location) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-xl font-black text-white mb-2">Assessment Locked</h3>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Identify a mission target on the map to unlock readiness analysis</p>
      </div>
    );
  }

  // Results View
  if (currentStep === 10 || (quizResults && currentStep === -1)) {
    const results = quizResults!;
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="glass-panel-heavy rounded-[2.5rem] p-8 relative overflow-hidden">
             {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 ${results.level === 'OPTIMAL' ? 'bg-emerald-500' : results.level === 'PREPARED' ? 'bg-amber-500' : 'bg-rose-500'}`} />
            
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-violet-500">
                    <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Deployment Readiness Report</h3>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Operational Readiness Score</p>
                   <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-white tracking-tighter">{results.score}</span>
                      <span className="text-sm font-black text-slate-600 uppercase">/ 100</span>
                   </div>
                </div>

                <div className={`px-6 py-3 rounded-2xl border flex flex-col items-center justify-center min-w-[160px] ${
                    results.level === 'OPTIMAL' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    results.level === 'PREPARED' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                   <span className="text-[8px] font-black uppercase tracking-[0.3em] mb-1">Status Level</span>
                   <span className="text-lg font-black tracking-widest">{results.level}</span>
                </div>
            </div>

            {/* AD SLOT: PROVISIONAL GEAR SPONSOR */}
            <div className="mt-8 h-20 glass-panel rounded-2xl flex items-center justify-between px-6 border border-white/5 bg-indigo-500/[0.02] group">
               <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest leading-none mb-1">Logistics Sponsor</span>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Tactical Gear Depot</span>
               </div>
               <div className="px-3 py-1 rounded-md border border-white/5 bg-white/5 text-[8px] font-black text-slate-700 uppercase tracking-widest">Sponsored</div>
            </div>

            <div className="mt-10 pt-10 border-t border-white/5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    Strategic Remediation Checklist
                </h4>
                <div className="space-y-4">
                    {results.score < 80 && (
                        <div className="flex items-start gap-3 group">
                            <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            <p className="text-xs text-slate-400 font-bold leading-relaxed border-b border-white/5 pb-2 w-full group-hover:text-white transition-colors">
                                Critical vulnerability detected in {results.score < 40 ? 'all major vectors' : 'specific logistics'}. Recommend immediate secondary contact verification.
                            </p>
                        </div>
                    )}
                    <div className="flex items-start gap-3 group">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <p className="text-xs text-slate-400 font-bold leading-relaxed border-b border-white/5 pb-2 w-full group-hover:text-white transition-colors">
                            Insertion into {location.name} ({assessment?.rating || 'Sector'}) requires active digital data redundancy.
                        </p>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleStart}
                className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
                <RefreshCw className="w-4 h-4" />
                Recalibrate Assessment
            </button>
        </div>
      </div>
    );
  }

  // Landing View
  if (currentStep === -1) {
    return (
      <div className="glass-panel rounded-[2.5rem] p-10 flex flex-col items-center text-center animate-fade-up">
        <div className="w-20 h-20 rounded-[2rem] bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-8 shadow-2xl shadow-violet-500/10">
            <Fingerprint className="w-10 h-10 text-violet-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Mission Readiness Check</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-[300px] leading-relaxed mb-10">
            An interactive 10-step audit of your deployment preparedness for <span className="text-white">{location.name}</span>.
        </p>
        <button 
          onClick={handleStart}
          className="px-10 py-5 bg-white text-black rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-violet-400 transition-all active:scale-95 flex items-center gap-3 shadow-2xl"
        >
          Initialize Briefing
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Question View
  const question = QUESTIONS[currentStep];
  return (
    <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 animate-fade-up h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-10">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-violet-500 tracking-widest uppercase">Step {currentStep + 1} of 10</span>
           </div>
           <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-violet-500 transition-all duration-500"
                style={{ width: `${getStepProgress()}%` }}
              />
           </div>
        </div>

        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Strategic Vector</h3>
        <h2 className="text-3xl font-black text-white tracking-tighter mb-10">{question.text}</h2>

        <div className="space-y-4">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOptionSelect(i)}
              className={`w-full group text-left p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
                answers[currentStep] === i 
                  ? 'bg-violet-600/10 border-violet-500/40' 
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                 <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                    answers[currentStep] === i ? 'bg-violet-500 text-white' : 'bg-white/5 text-slate-500 group-hover:text-white'
                 }`}>
                    {String.fromCharCode(65 + i)}
                 </div>
                 <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight mb-1">{opt.label}</p>
                    <p className="text-[10px] font-bold text-slate-500 group-hover:text-slate-400 transition-colors">{opt.hint}</p>
                 </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 flex items-center justify-between">
        <button 
          onClick={() => setCurrentStep(prev => Math.max(-1, prev - 1))}
          className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="text-[8px] font-mono text-slate-700 uppercase tracking-widest hidden sm:block">AX-LOG.V4 // READY_ASSESS</span>
      </div>
    </div>
  );
}
