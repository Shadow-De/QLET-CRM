"use client";

import React from "react";
import { motion } from "framer-motion";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatCurrency(num: number) {
  if (num >= 1000000) return `€${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `€${(num / 1000).toFixed(1)}k`;
  return `€${num.toLocaleString()}`;
}

export default function AnalyticsPage() {
  const { data: response, error, isLoading } = useSWR('/api/analytics/overview', fetcher, { refreshInterval: 60000 });

  if (error) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh] text-red-400">
        <p>Error loading analytics data. Please try again.</p>
      </div>
    );
  }

  if (isLoading || !response) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const { data } = response;
  
  if (!data) return null;

  const { 
    grossRent, 
    commissionYield, 
    avgTurnaroundDays, 
    pipelineConversionRate,
    totalLeadsCount,
    stages,
    boroughs,
    typologies,
    agentStats
  } = data;

  const funnelRates = {
    viewings: stages.ingest > 0 ? (stages.viewings / stages.ingest) * 100 : 0,
    kyc: stages.viewings > 0 ? (stages.kyc / stages.viewings) * 100 : 0,
    ast: stages.kyc > 0 ? (stages.ast / stages.kyc) * 100 : 0,
    leased: stages.ast > 0 ? (stages.leased / stages.ast) * 100 : 0,
    overall: stages.ingest > 0 ? (stages.leased / stages.ingest) * 100 : 0,
  };

  return (
    <div className="w-full flex flex-col gap-unit-8">
      {/* ================= HEADER AREA ================= */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-white/5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-white font-bold tracking-tight">Portfolio Analytics &amp; Deal Velocity</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary/10 border border-tertiary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping"></span>
              <span className="font-data-mono text-xs text-tertiary uppercase tracking-wider font-semibold">Live Real-Time Sync</span>
            </div>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Operational revenue realization, vacancy duration attrition, and agent conversion benchmarks across prime Malta residential desks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-white/5 flex items-center gap-2">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Index Confidence</span>
            <span className="font-data-mono text-data-mono font-bold text-tertiary">99.9%</span>
          </div>
        </div>
      </section>

      {/* ================= TOP STAT BANNERS (4 CARDS) ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-desktop">
        
        {/* Card 1: Gross Rent Realization */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-b from-white/[0.025] to-transparent bg-[#141019] border border-white/[0.07] hover:border-white/[0.14] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] hover:shadow-[0_16px_40px_-8px_rgba(124,58,237,0.15)] rounded-[20px] p-unit-6 relative overflow-hidden flex flex-col justify-between group transition-all duration-200">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-primary/10 blur-2xl pointer-events-none group-hover:bg-primary/20 transition-all"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase text-outline tracking-wider">Gross Rent Realization</span>
              <span className="material-symbols-outlined text-primary text-xl">payments</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display-kpi text-display-kpi text-white tracking-tight">{formatCurrency(grossRent)}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-semibold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>Active Portofolio</span>
            </div>
            <span className="font-data-mono text-xs text-outline">from {stages.leased} won deals</span>
          </div>
        </motion.div>

        {/* Card 2: Avg Void Period */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-b from-white/[0.025] to-transparent bg-[#141019] border border-white/[0.07] hover:border-white/[0.14] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] hover:shadow-[0_16px_40px_-8px_rgba(124,58,237,0.15)] rounded-[20px] p-unit-6 relative overflow-hidden flex flex-col justify-between group transition-all duration-200">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-tertiary/10 blur-2xl pointer-events-none group-hover:bg-tertiary/20 transition-all"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase text-outline tracking-wider">Avg Turnaround Time</span>
              <span className="material-symbols-outlined text-tertiary text-xl">timer</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display-kpi text-display-kpi text-white tracking-tight">{avgTurnaroundDays.toFixed(1)} Days</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tertiary/15 border border-tertiary/30 text-tertiary text-xs font-semibold shadow-sm shadow-tertiary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              <span>Based on won deals</span>
            </div>
            <span className="font-data-mono text-xs text-outline">Target: &lt; 5d</span>
          </div>
        </motion.div>

        {/* Card 3: Pipeline Conversion Rate */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-b from-white/[0.025] to-transparent bg-[#141019] border border-white/[0.07] hover:border-white/[0.14] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] hover:shadow-[0_16px_40px_-8px_rgba(124,58,237,0.15)] rounded-[20px] p-unit-6 relative overflow-hidden flex flex-col justify-between group transition-all duration-200">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-secondary/10 blur-2xl pointer-events-none group-hover:bg-secondary/20 transition-all"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase text-outline tracking-wider">Pipeline Conversion Rate</span>
              <span className="material-symbols-outlined text-secondary text-xl">filter_alt</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display-kpi text-display-kpi text-white tracking-tight">{pipelineConversionRate.toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1 text-primary text-xs font-medium">
              <span className="material-symbols-outlined text-sm">hub</span>
              <span>Ingest to Signed AST</span>
            </div>
            <span className="font-data-mono text-xs text-tertiary font-semibold">{stages.leased} / {totalLeadsCount} Leads</span>
          </div>
        </motion.div>

        {/* Card 4: Agency Commission Yield */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-b from-white/[0.025] to-transparent bg-[#141019] border border-white/[0.07] hover:border-white/[0.14] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] hover:shadow-[0_16px_40px_-8px_rgba(124,58,237,0.15)] rounded-[20px] p-unit-6 relative overflow-hidden flex flex-col justify-between group transition-all duration-200">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-primary-container/10 blur-2xl pointer-events-none group-hover:bg-primary-container/20 transition-all"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase text-outline tracking-wider">Agency Commission</span>
              <span className="material-symbols-outlined text-primary-container text-xl">monetization_on</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display-kpi text-display-kpi text-white tracking-tight">{formatCurrency(commissionYield)}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="font-data-mono text-xs text-on-surface-variant">12.0% gross commission</span>
            <div className="flex items-center gap-1 text-xs text-tertiary font-medium">
              <span className="material-symbols-outlined text-sm">arrow_upward</span>
              <span>Accrued</span>
            </div>
          </div>
        </motion.div>

      </section>

      {/* ================= SECTION 1: FUNNEL & BOROUGH BREAKDOWN ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop">
        
        {/* Left Card (8-Cols): Deal Conversion Funnel & Velocity */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-8 bg-gradient-to-b from-white/[0.025] to-transparent bg-[#141019] border border-white/[0.07] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] rounded-[20px] p-unit-8 flex flex-col justify-between">
          <div>
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-white font-bold">Deal Conversion Funnel &amp; Velocity</h3>
                <p className="font-body-sm text-body-sm text-outline">Granular tracking from prospect intake to fully executed AST agreement</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-surface-container border border-white/10 flex items-center gap-1.5 text-xs text-white">
                  <span className="material-symbols-outlined text-primary text-sm">speed</span>
                  <span>Avg Cycle: <strong className="font-data-mono text-primary">{avgTurnaroundDays.toFixed(1)} Days</strong></span>
                </div>
              </div>
            </div>

            {/* Visual Funnel Breakdown */}
            <div className="space-y-4">
              
              {/* Funnel Stage 1 */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center font-data-mono text-xs font-bold">01</span>
                    <span className="font-body-md text-white font-medium">Lead Ingest</span>
                    <span className="text-xs text-outline">(Unfiltered inquiries across portals &amp; high-net-worth direct desks)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-data-mono text-sm font-bold text-white">{stages.ingest} Leads</span>
                    <span className="text-xs text-outline ml-2 font-data-mono">100% Volume</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1, delay: 0.6 }} className="h-full bg-gradient-to-r from-[#E6399B] to-[#7C3AED] rounded-full"></motion.div>
                </div>
              </div>

              {/* Funnel Stage 2 */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center font-data-mono text-xs font-bold">02</span>
                    <span className="font-body-md text-white font-medium">Viewing Arranged</span>
                    <span className="text-xs text-outline">(Accompanied physical or concierge VR viewings)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-data-mono text-sm font-bold text-white">{stages.viewings} Viewings</span>
                    <span className="text-xs text-primary ml-2 font-data-mono font-semibold">{funnelRates.viewings.toFixed(1)}% Conversion</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${funnelRates.viewings}%` }} transition={{ duration: 1, delay: 0.7 }} className="h-full bg-gradient-to-r from-[#E6399B] to-[#7C3AED] rounded-full"></motion.div>
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-outline font-data-mono">
                  <span>Attrition Drop-off: {stages.ingest - stages.viewings} leads</span>
                </div>
              </div>

              {/* Funnel Stage 3 */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center font-data-mono text-xs font-bold">03</span>
                    <span className="font-body-md text-white font-medium">Negotiation &amp; KYC</span>
                    <span className="text-xs text-outline">(Financial source vetting, terms negotiation)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-data-mono text-sm font-bold text-white">{stages.kyc} Verified</span>
                    <span className="text-xs text-primary ml-2 font-data-mono font-semibold">{funnelRates.kyc.toFixed(1)}% Retention</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(stages.kyc / stages.ingest) * 100}%` }} transition={{ duration: 1, delay: 0.8 }} className="h-full bg-gradient-to-r from-[#E6399B] to-[#7C3AED] rounded-full"></motion.div>
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-outline font-data-mono">
                  <span>Attrition: {stages.viewings - stages.kyc} drops</span>
                </div>
              </div>

              {/* Funnel Stage 4 */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-tertiary/20 bg-tertiary/5 hover:border-tertiary/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-tertiary text-on-tertiary flex items-center justify-center font-data-mono text-xs font-bold">04</span>
                    <span className="font-body-md text-white font-semibold">Leased &amp; Won</span>
                    <span className="text-xs text-tertiary">(Deposit collected, keys handed over, full revenue booked)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-data-mono text-sm font-bold text-tertiary">{stages.leased} Completed</span>
                    <span className="text-xs text-tertiary ml-2 font-data-mono font-bold">{funnelRates.leased.toFixed(1)}% Final Execution</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${funnelRates.overall}%` }} transition={{ duration: 1, delay: 1 }} className="h-full bg-tertiary rounded-full shadow-sm shadow-tertiary/30"></motion.div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Bottom Micro Metrics Ribbon */}
          <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-data-mono text-outline">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              <span>Overall End-to-End Conversion: <strong className="text-white font-bold">{funnelRates.overall.toFixed(1)}%</strong></span>
            </div>
            <div>
              <span>Avg Ingest-to-AST Velocity: <strong className="text-white">{avgTurnaroundDays.toFixed(1)} Days</strong></span>
            </div>
          </div>
        </motion.div>

        {/* Right Card (4-Cols): Yield & Average Asking Rent by Borough */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-4 bg-gradient-to-b from-white/[0.025] to-transparent bg-[#141019] border border-white/[0.07] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] rounded-[20px] p-unit-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-white font-bold">Yield &amp; Asking Rent</h3>
                <p className="font-body-sm text-body-sm text-outline">By Malta Prime Borough</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-xl">map</span>
            </div>
            
            {/* Borough Comparison Stack */}
            <div className="space-y-4 mt-2">
              {boroughs.length === 0 && <p className="text-outline text-sm">No area data available.</p>}
              {boroughs.map((b: any, index: number) => {
                const colors = ["bg-primary-container", "bg-secondary", "bg-primary", "bg-tertiary"];
                const color = colors[index % colors.length];
                
                return (
                  <div key={b.name} className="p-3 rounded-xl bg-surface-container-low border border-white/5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${color}`}></span>
                        <span className="font-body-md text-white font-medium">{b.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-data-mono text-sm font-bold text-white">€{Math.round(b.avgRent).toLocaleString()}<span className="text-xs text-outline font-normal">/mo</span></span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-primary text-xs font-data-mono font-semibold">{b.yield}% Yield</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: b.width }} transition={{ duration: 1, delay: 0.7 + (index * 0.1) }} className={`h-full ${color} rounded-full`}></motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Bottom Highlight Box */}
          <div className="mt-4 p-3 rounded-xl bg-surface-container border border-white/5 flex items-center justify-between">
            <span className="text-xs text-outline">Highest Capital Yield:</span>
            {boroughs.length > 0 ? (
              <span className="text-xs font-bold text-tertiary font-data-mono">
                {boroughs.reduce((prev: any, current: any) => parseFloat(current.yield) > parseFloat(prev.yield) ? current : prev).name} &middot; {boroughs.reduce((prev: any, current: any) => parseFloat(current.yield) > parseFloat(prev.yield) ? current : prev).yield}%
              </span>
            ) : (
              <span className="text-xs font-bold text-tertiary font-data-mono">N/A</span>
            )}
          </div>
        </motion.div>

      </section>

      {/* ================= SECTION 2: TYPOLOGY DEMAND & LEADERBOARD ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop">
        
        {/* Left Card (5-Cols): Property Typology Demand vs Available Inventory */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="lg:col-span-5 bg-gradient-to-b from-white/[0.025] to-transparent bg-[#141019] border border-white/[0.07] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] rounded-[20px] p-unit-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-white font-bold">Typology Demand vs Inventory</h3>
                <p className="font-body-sm text-body-sm text-outline">Market appetite vs currently listed units</p>
              </div>
              <span className="material-symbols-outlined text-primary text-xl">pie_chart</span>
            </div>
            
            {/* Distribution Matrix */}
            <div className="space-y-4 my-3">
              {typologies.length === 0 && <p className="text-outline text-sm">No typology data available.</p>}
              {typologies.map((t: any, index: number) => (
                <div key={t.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-body-md text-white font-medium">{t.name}</span>
                    <div className="flex items-center gap-2 font-data-mono">
                      <span className="text-sm font-bold text-white">{t.demandPct}% Demand</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${t.labelClass}`}>{t.label}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${t.demandPct}%` }} transition={{ duration: 1, delay: 0.8 + (index * 0.1) }} className={`${t.colorClass} h-full`}></motion.div>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${t.inventoryPct}%` }} transition={{ duration: 1, delay: 0.8 + (index * 0.1) }} className="bg-white/10 h-full border-l border-[#141019]"></motion.div>
                  </div>
                  <span className="text-xs text-outline mt-1 block">Active Portfolio Availability: {t.inventoryPct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-surface-container-low border border-white/5 flex items-center justify-between text-xs">
            <span className="text-outline">Top Investor Directive:</span>
            {typologies.length > 0 ? (
               <span className="font-bold text-primary">Intake more {typologies[0].name} stock</span>
            ) : (
               <span className="font-bold text-primary">Data populating...</span>
            )}
          </div>
        </motion.div>

        {/* Right Card (7-Cols): Agent & Desk Performance Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="lg:col-span-7 bg-gradient-to-b from-white/[0.025] to-transparent bg-[#141019] border border-white/[0.07] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] rounded-[20px] p-unit-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-white font-bold">Agent &amp; Desk Performance Leaderboard</h3>
                <p className="font-body-sm text-body-sm text-outline">Rankings by transacted gross rent &amp; deal turnaround SLA</p>
              </div>
              <span className="material-symbols-outlined text-tertiary text-xl">military_tech</span>
            </div>
            
            {/* Leaderboard Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-outline text-label-sm font-label-sm uppercase tracking-wider">
                    <th className="py-2.5 px-3">Broker / Desk</th>
                    <th className="py-2.5 px-3 text-right">Deals</th>
                    <th className="py-2.5 px-3 text-right">Gross Rent</th>
                    <th className="py-2.5 px-3 text-right">Turnaround</th>
                    <th className="py-2.5 px-3 text-right">SLA Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-data-mono text-sm">
                  {/* Row 1: Logged in agent */}
                  <tr className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-container to-secondary flex items-center justify-center text-white font-bold text-xs">
                          {agentStats.initials}
                        </div>
                        <div>
                          <span className="font-body-md text-white font-bold block group-hover:text-primary transition-colors">{agentStats.name}</span>
                          <span className="text-xs text-outline font-normal">Primary Agent</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right text-white font-semibold">{agentStats.deals}</td>
                    <td className="py-3.5 px-3 text-right text-white font-bold">{formatCurrency(agentStats.rent)}</td>
                    <td className="py-3.5 px-3 text-right text-tertiary">{agentStats.turnaround} Days</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-semibold">{agentStats.sla}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-outline">Desk Quota Realization: <strong className="text-white font-data-mono">104.2% of target</strong></span>
            <button className="text-primary hover:underline font-label-sm font-semibold flex items-center gap-1">
              <span>View Full Breakdown</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </motion.div>

      </section>
    </div>
  );
}
