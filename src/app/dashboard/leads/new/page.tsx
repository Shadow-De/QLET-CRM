"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewLeadPage() {
  const router = useRouter();
  const [fastIntake, setFastIntake] = useState(false);
  const [hasChildren, setHasChildren] = useState(true);
  const [hasPets, setHasPets] = useState(true);

  // Group Type state
  const [groupType, setGroupType] = useState<"single" | "couple" | "group">("couple");
  const [menCount, setMenCount] = useState(1);
  const [womenCount, setWomenCount] = useState(1);
  
  // Property type state
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(["2 Bed Apartment", "Townhouse"]);

  const togglePropertyType = (type: string) => {
    setSelectedPropertyTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    router.push("/dashboard/leads");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-unit-6">
        <div>
          <div className="flex items-center gap-2 text-label-sm font-label-sm text-outline mb-1.5">
            <Link href="/dashboard/leads" className="hover:text-primary transition-colors">Pipeline</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface-variant font-medium">New Lead Intake</span>
          </div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">New Lead Intake</h1>
          <p className="text-body-md font-body-md text-outline">Register new applicant to the live pipeline board and automatically assign SLA metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-unit-4 py-2 rounded-lg bg-surface-container-low text-outline hover:text-on-surface border border-white/10 font-label-md text-label-md transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={() => setFastIntake(!fastIntake)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-label-sm font-label-sm transition-colors ${
              fastIntake ? 'bg-primary-container/20 text-primary border-primary/30' : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary">bolt</span>
            <span>Fast Intake Mode</span>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSave}
        className="bg-[#141019] border border-white/[0.07] rounded-[20px] p-unit-8 md:p-unit-10 relative mb-unit-10 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] flex-1"
      >
        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-unit-10 gap-y-unit-8">
          {/* COLUMN 1: Applicant Profile */}
          <section className="space-y-unit-6">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                <h2 className="text-headline-sm font-headline-sm text-on-surface">Applicant &amp; Household Profile</h2>
              </div>
              <span className="text-label-sm font-label-sm text-outline uppercase tracking-wider">Step 01 of 02</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                Client Full Name <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">badge</span>
                <input required type="text" className="w-full h-11 pl-11 pr-4 rounded-[10px] bg-[#0E0A14] border border-white/10 text-body-md font-body-md text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" placeholder="e.g. Lady Evelyn Montgomery-Smyth" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                  Mobile Phone <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">call</span>
                  <input required type="tel" className="w-full h-11 pl-11 pr-4 rounded-[10px] bg-[#0E0A14] border border-white/10 text-body-md font-body-md text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" placeholder="+44 7911 234567" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                  Email Address <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">mail</span>
                  <input required type="email" className="w-full h-11 pl-11 pr-4 rounded-[10px] bg-[#0E0A14] border border-white/10 text-body-md font-body-md text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" placeholder="evelyn@montgomery.co.uk" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                Household Composition (Group Type)
              </label>
              <div className="p-1 rounded-xl bg-[#0E0A14] border border-white/10 grid grid-cols-3 gap-1">
                {['single', 'couple', 'group'].map((type) => (
                  <button 
                    key={type}
                    type="button" 
                    onClick={() => setGroupType(type as "single"|"couple"|"group")}
                    className={`py-2 px-3 rounded-lg text-label-md font-label-md flex items-center justify-center gap-1.5 transition-all ${
                      groupType === type 
                        ? 'bg-gradient-to-r from-[#E6399B] to-[#7C3AED] text-white font-semibold shadow-md' 
                        : 'text-outline hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {type === 'single' ? 'person' : type === 'couple' ? 'group' : 'groups'}
                    </span>
                    <span className="capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-unit-4 rounded-xl bg-[#0E0A14] border border-white/10 grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-label-sm font-label-sm text-outline">Adult Men</span>
                  <span className="text-data-mono font-data-mono text-primary font-bold">{menCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setMenCount(Math.max(0, menCount - 1))} className="w-9 h-9 rounded-lg bg-surface-container-high border border-white/10 text-on-surface hover:border-primary flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <div className="flex-1 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center font-data-mono text-data-mono text-on-surface">
                    {String(menCount).padStart(2, '0')}
                  </div>
                  <button type="button" onClick={() => setMenCount(menCount + 1)} className="w-9 h-9 rounded-lg bg-surface-container-high border border-white/10 text-on-surface hover:border-primary flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-label-sm font-label-sm text-outline">Adult Women</span>
                  <span className="text-data-mono font-data-mono text-primary font-bold">{womenCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setWomenCount(Math.max(0, womenCount - 1))} className="w-9 h-9 rounded-lg bg-surface-container-high border border-white/10 text-on-surface hover:border-primary flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <div className="flex-1 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center font-data-mono text-data-mono text-on-surface">
                    {String(womenCount).padStart(2, '0')}
                  </div>
                  <button type="button" onClick={() => setWomenCount(womenCount + 1)} className="w-9 h-9 rounded-lg bg-surface-container-high border border-white/10 text-on-surface hover:border-primary flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-unit-4 rounded-xl bg-[#0E0A14] border border-white/10 space-y-3">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setHasChildren(!hasChildren)}>
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant">child_care</span>
                  <div>
                    <span className="text-label-md font-label-md text-on-surface font-semibold block">Accompanying Children</span>
                    <span className="text-body-sm font-body-sm text-outline">Dependents under 18 residing</span>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-0.5 transition-colors relative flex items-center ${hasChildren ? 'bg-gradient-to-r from-[#E6399B] to-[#7C3AED]' : 'bg-surface-container-high border border-white/10'}`}>
                  <motion.div layout className={`w-5 h-5 rounded-full bg-white shadow-md ${hasChildren ? 'ml-auto' : 'mr-auto'}`} />
                </div>
              </div>
              
              <motion.div 
                initial={false}
                animate={{ height: hasChildren ? "auto" : 0, opacity: hasChildren ? 1 : 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/5 mt-3">
                  <div className="space-y-1">
                    <label className="text-label-sm font-label-sm text-outline">Children Count</label>
                    <input type="number" min="1" max="6" defaultValue="2" className="w-full h-10 px-3 rounded-lg bg-[#0E0A14] border border-white/10 text-data-mono font-data-mono text-on-surface focus:border-primary focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-label-sm font-label-sm text-outline">Ages (Comma Separated)</label>
                    <input type="text" defaultValue="4, 7" placeholder="e.g. 4, 7" className="w-full h-10 px-3 rounded-lg bg-[#0E0A14] border border-white/10 text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none" />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="p-unit-4 rounded-xl bg-[#0E0A14] border border-white/10 space-y-3">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setHasPets(!hasPets)}>
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant">pets</span>
                  <div>
                    <span className="text-label-md font-label-md text-on-surface font-semibold block">Pet Occupants</span>
                    <span className="text-body-sm font-body-sm text-outline">Requires landlord pet license approval</span>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-0.5 transition-colors relative flex items-center ${hasPets ? 'bg-gradient-to-r from-[#E6399B] to-[#7C3AED]' : 'bg-surface-container-high border border-white/10'}`}>
                  <motion.div layout className={`w-5 h-5 rounded-full bg-white shadow-md ${hasPets ? 'ml-auto' : 'mr-auto'}`} />
                </div>
              </div>

              <motion.div 
                initial={false}
                animate={{ height: hasPets ? "auto" : 0, opacity: hasPets ? 1 : 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 border-t border-white/5 mt-3">
                  <label className="text-label-sm font-label-sm text-outline block mb-1">Breed &amp; Details</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">cruelty_free</span>
                    <input type="text" defaultValue="1 Golden Retriever (hypoallergenic, registered ESA)" className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#0E0A14] border border-white/10 text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none" />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Nationality</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">flag</span>
                  <input type="text" defaultValue="British / Canadian" className="w-full h-11 pl-11 pr-4 rounded-[10px] bg-[#0E0A14] border border-white/10 text-body-md font-body-md text-on-surface focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Right to Rent / Visa Type</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">verified_user</span>
                  <select className="w-full h-11 pl-11 pr-9 rounded-[10px] bg-[#0E0A14] border border-white/10 text-body-md font-body-md text-on-surface appearance-none cursor-pointer focus:border-primary focus:outline-none">
                    <option value="citizen">UK Citizen (Verified)</option>
                    <option value="tier2">Tier 2 Skilled Worker</option>
                    <option value="student">Student Visa (Cosigner Req.)</option>
                    <option value="indefinite">Indefinite Leave to Remain</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
          </section>

          {/* COLUMN 2: Housing Requirements */}
          <section className="space-y-unit-6">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">apartment</span>
                </div>
                <h2 className="text-headline-sm font-headline-sm text-on-surface">Housing Requirements &amp; Terms</h2>
              </div>
              <span className="text-label-sm font-label-sm text-outline uppercase tracking-wider">Step 02 of 02</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Target Property Type</label>
                <span className="text-label-sm font-label-sm text-primary">Multi-select active</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Single Room', 'Studio Apartment', '1 Bedroom Apartment', '2 Bedroom Apartment', '3 Bedroom Apartment', 'Townhouse', 'Penthouse'].map((type) => {
                  const isSelected = selectedPropertyTypes.includes(type);
                  return (
                    <button 
                      key={type}
                      type="button"
                      onClick={() => togglePropertyType(type)}
                      className={`px-3.5 py-2 rounded-lg text-label-md font-label-md transition-all flex items-center gap-1.5 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-[#E6399B] to-[#7C3AED] text-white font-semibold shadow-md' 
                          : 'bg-[#0E0A14] border border-white/10 text-outline hover:text-on-surface hover:border-outline'
                      }`}
                    >
                      {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5 p-unit-4 rounded-xl bg-[#0E0A14] border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block">Target Monthly Budget Range</span>
                  <span className="text-body-sm font-body-sm text-outline">Inclusive of service charges</span>
                </div>
                <div className="text-right">
                  <span className="text-data-mono font-data-mono text-primary font-bold text-headline-sm">€2,500 – €4,000</span>
                  <span className="text-body-sm font-body-sm text-outline block">/ month</span>
                </div>
              </div>
              <div className="pt-2 relative">
                <div className="h-2 w-full bg-surface-container rounded-full relative overflow-hidden">
                  <div className="absolute left-[35%] right-[20%] h-full bg-gradient-to-r from-[#E6399B] to-[#7C3AED] rounded-full"></div>
                </div>
                <div className="flex justify-between text-label-sm font-label-sm text-outline pt-2 font-data-mono">
                  <span>€1,200/mo</span>
                  <span className="text-white font-medium">€2,500</span>
                  <span className="text-white font-medium">€4,000</span>
                  <span>€8,500+/mo</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                Preferred Malta Boroughs / Areas
              </label>
              <div className="p-2.5 rounded-xl bg-[#0E0A14] border border-white/10 flex flex-wrap items-center gap-2">
                {['Mayfair', "St. Julian's & Sliema", 'Valletta', 'Msida'].map(area => (
                  <span key={area} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/15 text-primary text-label-sm font-label-sm border border-primary-container/30">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {area}
                    <button type="button" className="hover:text-white"><span className="material-symbols-outlined text-[14px]">close</span></button>
                  </span>
                ))}
                <input type="text" placeholder="+ Add area..." className="bg-transparent border-none text-body-sm font-body-sm text-on-surface placeholder:text-outline focus:ring-0 p-1 min-w-[100px] outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Target Move-in Date <span className="text-primary">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">calendar_today</span>
                  <input required type="date" defaultValue="2025-05-01" className="w-full h-11 pl-11 pr-4 rounded-[10px] bg-[#0E0A14] border border-white/10 text-body-md font-body-md text-on-surface font-data-mono focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Tenancy Duration</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">schedule</span>
                  <select defaultValue="12m" className="w-full h-11 pl-11 pr-9 rounded-[10px] bg-[#0E0A14] border border-white/10 text-body-md font-body-md text-on-surface appearance-none focus:border-primary focus:outline-none">
                    <option value="6m">6 Months Fixed</option>
                    <option value="12m">12 Months Standard</option>
                    <option value="24m">24+ Months Long Lease</option>
                    <option value="flex">Short Let (1-3 Months)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Internal Agent Notes &amp; Cold-Call Brief</label>
                <span className="text-label-sm font-label-sm text-outline">Confidential CRM Log</span>
              </div>
              <textarea rows={4} className="w-full p-3.5 rounded-[10px] bg-[#0E0A14] border border-white/10 text-body-md font-body-md text-on-surface placeholder:text-outline/60 resize-none focus:border-primary focus:outline-none" placeholder="Spoke with client via phone enquiry..." defaultValue="Spoke with client via private relocation desk. Strict requirement for secure subterranean parking and private balcony overlooking parkland. Pre-vetted with Tier 1 UK bank statement check."></textarea>
            </div>
          </section>
        </div>

        {/* Bottom Actions */}
        <div className="mt-unit-10 pt-unit-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-label-sm font-label-sm text-outline">
            <span className="material-symbols-outlined text-[18px] text-tertiary">shield</span>
            <span>GDPR verified &amp; tenant AML identity pre-screen enabled</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button type="button" className="w-full sm:w-auto px-unit-6 py-unit-3 rounded-lg bg-[#1E1826] hover:bg-[#251E30] text-white border border-white/10 font-label-md text-label-md transition-all duration-150 active:scale-[0.98]">
              Save &amp; Create Another
            </button>
            <button type="submit" className="w-full sm:w-auto px-unit-8 py-unit-3 rounded-lg bg-gradient-to-r from-[#E6399B] to-[#7C3AED] text-white font-label-md text-label-md font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150 hover:brightness-110">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Save lead to board</span>
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
