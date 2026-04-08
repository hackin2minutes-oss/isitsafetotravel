'use client';

import React from 'react';
import { FileText, Download, Copy, Check, Shield, Globe, Activity, Navigation, Phone } from 'lucide-react';
import { SafetyAssessment, Location } from '@/types';

interface BriefGeneratorProps {
  location: Location;
  assessment: SafetyAssessment;
}

export function BriefGenerator({ location, assessment }: BriefGeneratorProps) {
  const [copied, setCopied] = React.useState(false);

  const generatePlainTextBrief = () => {
    const newsText = assessment.news.map(n => `- ${n.title} (${n.source})`).join('\n');
    const tipsText = assessment.tips.map((t, i) => `${i + 1}. ${t}`).join('\n');
    
    return `
[ SENTINEL TACTICAL BRIEF ]
LOCATION: ${location.name.toUpperCase()}
DATE: ${new Date().toLocaleDateString()}
SECURITY RATING: ${assessment.rating} (Score: ${assessment.score}/100)
-----------------------------------------------------------

0. GLOBAL CENSUS DATA [v4.0]
Population: ${assessment.quickFacts.population}
Land Area: ${assessment.quickFacts.landArea}

I. SECURITY SYNOPSIS
Status: ${assessment.security.status}
Summary: ${assessment.summary}

II. LOGISTICS & AIRSPACE
Airspace: ${assessment.logistics.airspace.toUpperCase()}
Transport: ${assessment.logistics.transport.toUpperCase()}
Details: ${assessment.logistics.details}

III. LATEST GEOPOLITICAL INTELLIGENCE
${newsText || 'No recent headlines detected for this sector.'}

IV. OPERATIONAL DIRECTIVES (TIPS)
${tipsText}

V. EMERGENCY CONTACTS
Police: ${assessment.emergency.police}
Ambulance: ${assessment.emergency.ambulance}
Fire: ${assessment.emergency.fire}
Helpline: ${assessment.emergency.helpline}

VI. TRAVEL REQUIREMENTS
Visa: ${assessment.requirements.visa}
Passport: ${assessment.requirements.passport}
Vaccinations: ${assessment.requirements.vaccinations}
Insurance: ${assessment.requirements.insurance}

-----------------------------------------------------------
END OF BRIEF // DATA PROVIDED BY SENTINEL LIVE v3.0
    `.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePlainTextBrief());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatePlainTextBrief()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `SENTINEL_BRIEF_${location.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Tactical Brief</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Export Intel Dossier</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition-all group"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />}
          </button>
        </div>
      </div>
      
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
        Generate a standardized text-based briefing for offline use or mission planning. Includes all real-time security vectors.
      </p>
    </div>
  );
}
