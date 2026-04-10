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
    const newsText = assessment.news && assessment.news.length > 0 ? assessment.news.map(n => `- ${n.title} (${n.source})`).join('\n') : '';
    const tipsText = assessment.tips && assessment.tips.length > 0 ? assessment.tips.map((t, i) => `${i + 1}. ${t}`).join('\n') : 'No specific operational directives at this time.';
    
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
    <div className="flex flex-col gap-4 p-5 glass-panel rounded-2xl animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Dossier Generation</h3>
            <p className="text-[7px] font-mono-technical text-slate-500 uppercase">Export Intel // Sector Sync</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all group active:scale-95"
          >
            {copied ? <Check data-testid="check-icon" className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />}
          </button>
          <button 
            onClick={handleDownload}
            className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all group active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
          </button>
        </div>
      </div>
      
      <p className="text-[9px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
        STANDARD OPERATING PROCEDURE: CUSTOM DOSSIER GENERATION FOR OFFLINE ENCRYPTION. INCLUDES GLOBAL CENSUS, SECURITY SYNOPSIS, AND AIRSPACE LOGISTICS.
      </p>
    </div>
  );
}
