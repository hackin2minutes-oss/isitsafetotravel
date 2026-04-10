'use client';

import React, { useState } from 'react';
import { 
  Shield, Phone, Heart, User, CheckCircle, Download, 
  Smartphone, AlertCircle, Info, FileText, Globe
} from 'lucide-react';

interface ICEData {
  name: string;
  bloodType: string;
  allergies: string;
  medication: string;
  contactName: string;
  contactRelation: string;
  contactPhone: string;
  insuranceProvider: string;
  insurancePolicy: string;
  localEmbassy: string;
}

export function ICECardGenerator() {
  const [data, setData] = useState<ICEData>({
    name: '',
    bloodType: '',
    allergies: '',
    medication: '',
    contactName: '',
    contactRelation: '',
    contactPhone: '',
    insuranceProvider: '',
    insurancePolicy: '',
    localEmbassy: ''
  });

  const [activeStep, setActiveStep] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 p-8 animate-fade-up">
      {/* Left Pane: Form */}
      <div className="flex-1 space-y-8">
        <div>
           <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-2">ICE Card Generator</h2>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">In Case of Emergency // Lock-Screen Tactical Reference</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <InputField label="Full Name" name="name" value={data.name} onChange={handleChange} placeholder="Required" />
           <InputField label="Blood Type" name="bloodType" value={data.bloodType} onChange={handleChange} placeholder="e.g. O+" />
           <div className="md:col-span-2">
              <TextAreaField label="Allergies / Critical Conditions" name="allergies" value={data.allergies} onChange={handleChange} placeholder="None" />
           </div>
           <InputField label="Insurance Provider" name="insuranceProvider" value={data.insuranceProvider} onChange={handleChange} placeholder="Company Name" />
           <InputField label="Policy / ID Number" name="insurancePolicy" value={data.insurancePolicy} onChange={handleChange} />
           
           <div className="md:col-span-2 mt-4 pt-4 border-t border-white/5">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-4">Primary Tactical Contact</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <InputField label="Contact Name" name="contactName" value={data.contactName} onChange={handleChange} />
                 <InputField label="Relation" name="contactRelation" value={data.contactRelation} onChange={handleChange} />
                 <InputField label="Emergency Phone" name="contactPhone" value={data.contactPhone} onChange={handleChange} />
              </div>
           </div>
        </div>
      </div>

      {/* Right Pane: Preview */}
      <div className="w-full lg:w-[400px] shrink-0">
         <div className="sticky top-8 space-y-6">
            <div className="flex items-center justify-between px-2">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lock-Screen Preview</span>
               <div className="flex items-center gap-1.5 animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Optimal Contrast</span>
               </div>
            </div>

            {/* The Actual Card Visual */}
            <div className="aspect-[9/19] w-full bg-black rounded-[3rem] border-[8px] border-slate-900 shadow-2xl relative overflow-hidden group">
               {/* Phone Camera Notch */}
               <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-full z-30" />
               
               {/* Card Content Overlay */}
               <div className="absolute inset-x-8 top-32 bottom-20 bg-white rounded-3xl p-6 flex flex-col shadow-2xl z-20">
                  <div className="flex items-center justify-between mb-8 border-b-2 border-slate-100 pb-4">
                     <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Emergency Info</h4>
                        <p className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">{data.name || 'Your Name'}</p>
                     </div>
                     <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                        <Heart className="w-6 h-6 text-white fill-current" />
                     </div>
                  </div>

                  <div className="space-y-6 flex-1">
                     <PreviewItem label="Blood Type" value={data.bloodType || 'Unknown'} icon={<Shield className="w-3 h-3" />} />
                     <PreviewItem label="Allergies" value={data.allergies || 'N/A'} icon={<AlertCircle className="w-3 h-3" />} alert={!!data.allergies} />
                     <div className="pt-4 border-t border-slate-100 space-y-5">
                        <PreviewItem label="Primary Contact" value={data.contactName || '---'} icon={<User className="w-3 h-3" />} />
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Emergency Call</p>
                           <p className="text-lg font-black text-slate-900 tabular-nums">{data.contactPhone || 'No Number'}</p>
                        </div>
                     </div>
                     <div className="pt-2">
                        <PreviewItem label="Local Policy" value={data.insurancePolicy || '---'} icon={<FileText className="w-3 h-3" />} />
                     </div>
                  </div>

                  <div className="mt-auto pt-6 text-center border-t border-slate-100">
                     <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">SECURE ACCESS // TRVLSFE</span>
                  </div>
               </div>

               {/* Background Glow */}
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-fuchsia-900/40 opacity-40" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px]" />
            </div>

            <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
               <div className="flex items-center gap-2 mb-3">
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Extraction Method</span>
               </div>
               <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                  This tool generates a high-visibility lock screen card. <span className="text-white">TAKE A SCREENSHOT</span> of the preview on the left and set it as your lock-screen wallpaper to ensure emergency services can see your details without unlocking.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-1.5 group">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors pl-1">
        {label}
      </label>
      <input 
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-xs font-black text-white focus:outline-none focus:border-indigo-500/30 hover:bg-white/[0.04] transition-all placeholder:text-white/10 uppercase tracking-widest"
      />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-1.5 group">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors pl-1">
        {label}
      </label>
      <textarea 
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-xs font-black text-white focus:outline-none focus:border-indigo-500/30 hover:bg-white/[0.04] transition-all placeholder:text-white/10 uppercase tracking-widest resize-none"
      />
    </div>
  );
}

function PreviewItem({ label, value, icon, alert }: { label: string, value: string, icon: React.ReactNode, alert?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${alert ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
         {icon}
      </div>
      <div>
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
         <p className={`text-xs font-black tracking-tight ${alert ? 'text-rose-500' : 'text-slate-900 border-b-2 border-slate-50 pb-0.5'} uppercase`}>{value}</p>
      </div>
    </div>
  );
}
