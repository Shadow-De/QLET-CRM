"use client";

import { motion } from "framer-motion";
import { CountUp } from "@/components/ui/CountUp";
import { MonthlyCadenceChart } from "@/components/dashboard/MonthlyCadenceChart";
import { ConversionChart } from "@/components/dashboard/ConversionChart";
import useSWR from "swr";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR('/api/dashboard', fetcher, { refreshInterval: 5000 });

  if (isLoading) {
    return (
      <main className="flex-1 p-8 max-w-[1680px] w-full mx-auto flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  const {
    totalLeads = 0,
    wonLeads = 0,
    lostLeads = 0,
    newLeads = 0,
    recentLeads = [],
    recentProperties = [],
    pipelineCounts = { New: 0, Contacted: 0, Viewing: 0, Negotiating: 0, Won: 0, Lost: 0 },
    chartData = []
  } = data?.data || {};

  const totalActiveLeads = totalLeads - wonLeads - lostLeads;
  const yieldPercent = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;

  const pipelineStages = [
    { name: "New", value: pipelineCounts.New || 0, color: "bg-blue-400" },
    { name: "Contacted", value: pipelineCounts.Contacted || 0, color: "bg-purple-400" },
    { name: "Viewing", value: pipelineCounts.Viewing || 0, color: "bg-primary-container" },
    { name: "Negotiating", value: pipelineCounts.Negotiating || 0, color: "bg-amber-400" },
    { name: "Won", value: pipelineCounts.Won || 0, color: "bg-tertiary", font: "font-bold text-tertiary" },
    { name: "Lost", value: pipelineCounts.Lost || 0, color: "bg-error" },
  ];

  return (
    <main className="flex-1 p-8 max-w-[1680px] w-full mx-auto space-y-8">
      {/* Page Header & Toolbar */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Dashboard</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-container/15 text-primary text-label-sm font-label-sm border border-primary-container/30">
              Live Sync
            </span>
          </div>
          <p className="text-body-sm font-body-sm text-outline mt-1">
            Real-time estate metrics, deal conversion velocities, and property intake tracking.
          </p>
        </div>

        {/* Header Toolbar Controls */}
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative">
            <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-surface-container border border-outline-variant/40 hover:border-outline text-on-surface text-label-md font-label-md transition-colors">
              <span className="material-symbols-outlined text-outline text-base">calendar_today</span>
              <span>This month</span>
              <span className="material-symbols-outlined text-outline text-sm ml-1">expand_more</span>
            </button>
          </motion.div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 h-10 px-4 rounded-xl bg-surface-container border border-outline-variant/40 hover:border-outline text-on-surface text-label-md font-label-md transition-colors">
            <span className="material-symbols-outlined text-outline text-base">filter_list</span>
            <span>Filters</span>
          </motion.button>

          <motion.button whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }} className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/40 hover:border-outline text-outline hover:text-on-surface flex items-center justify-center transition-colors" title="Refresh Data Stream">
            <span className="material-symbols-outlined text-base">sync</span>
          </motion.button>
        </div>
      </section>

      {/* Bento Grid: Analytics & Operations */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-12 gap-6"
      >
        {/* Left Main Card: Performance & 6-Month Bar Chart (Spans 8 columns) */}
        <motion.section variants={itemVariants} className="col-span-12 lg:col-span-8 specular-card p-[1.75rem] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/20">
              <div>
                <h2 className="text-headline-sm font-headline-sm text-on-surface font-semibold">Portfolio Performance Overview</h2>
                <p className="text-body-sm font-body-sm text-outline">Lead acquisition and closure volume relative to operational capacity</p>
              </div>
              <div className="inline-flex p-1 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
                <button className="px-4 py-1.5 rounded-lg bg-surface-container text-white text-label-sm font-label-sm shadow-sm transition-all">Leads</button>
                <button className="px-4 py-1.5 rounded-lg text-outline hover:text-on-surface text-label-sm font-label-sm transition-all">Deals Won</button>
                <button className="px-4 py-1.5 rounded-lg text-outline hover:text-on-surface text-label-sm font-label-sm transition-all">Properties</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              <div className="p-5 rounded-xl bg-surface-container/60 border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="text-label-sm font-label-sm uppercase text-outline tracking-wider block">Total Leads</span>
                  <div className="text-display-kpi font-display-kpi text-white leading-tight">
                    <CountUp end={totalLeads} />
                  </div>
                  <span className="text-body-sm font-body-sm text-outline">Inbound prospective tenants</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-container/15 text-tertiary border border-tertiary/20 text-label-sm font-label-sm">
                  <span className="material-symbols-outlined text-sm font-bold">trending_flat</span>
                  <span>0.0%</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-surface-container/60 border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="text-label-sm font-label-sm uppercase text-outline tracking-wider block">Deals Won</span>
                  <div className="text-display-kpi font-display-kpi text-white leading-tight">
                    <CountUp end={wonLeads} />
                  </div>
                  <span className="text-body-sm font-body-sm text-outline">Executed tenancy agreements</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-container/15 text-tertiary border border-tertiary/20 text-label-sm font-label-sm">
                  <span className="material-symbols-outlined text-sm font-bold">trending_flat</span>
                  <span>0.0%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between text-label-sm font-label-sm text-outline mb-4">
              <span>MONTHLY LETTINGS CADENCE</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-surface-variant"></span> Historical Average</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm brand-gradient"></span> Current Period</div>
              </div>
            </div>
            <MonthlyCadenceChart data={chartData} />
          </div>
        </motion.section>

        {/* Right Column: Pipeline Stages & Conversion Rate (Spans 4 columns) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <motion.section variants={itemVariants} className="specular-card p-[1.75rem] flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold">Pipeline Stages</h3>
              <span className="text-label-sm font-label-sm text-outline uppercase tracking-wider">Active Deals</span>
            </div>
            
            <div className="space-y-3">
              {pipelineStages.map((stage, idx) => {
                const pct = totalLeads > 0 ? ((stage.value / totalLeads) * 100).toFixed(1) + '%' : '0%';
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-body-sm font-body-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${stage.color}`}></span>
                        <span className={stage.font || "text-on-surface"}>{stage.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-data-mono font-data-mono ${stage.font || "text-on-surface font-semibold"}`}>{stage.value}</span>
                        <span className="text-label-sm font-label-sm text-outline w-9 text-right">{pct}</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-container-high overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: pct }}
                        transition={{ duration: 1, delay: 0.2 + idx * 0.1, ease: "easeOut" }}
                        className={`h-full ${stage.color} rounded-full`} 
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.section>

          <motion.section variants={itemVariants} className="specular-card p-[1.75rem]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold">Conversion Rate</h3>
            </div>
            <p className="text-body-sm font-body-sm text-outline mb-4">Overall closed tenancy conversion efficacy</p>
            
            <div className="flex items-center justify-around gap-4">
              <ConversionChart 
                yieldPercent={Number(yieldPercent)}
                data={[
                  { name: "Won Deals", value: wonLeads, color: "#fa4aab" },
                  { name: "Lost/Dropped", value: lostLeads, color: "rgba(255,255,255,0.08)" }
                ]}
              />
              
              <div className="space-y-2 text-label-sm font-label-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                  <span className="text-on-surface">Won Deals</span>
                  <span className="text-outline font-data-mono ml-auto">{yieldPercent}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  <span className="text-on-surface">In Progress</span>
                  <span className="text-outline font-data-mono ml-auto">{totalLeads > 0 ? ((totalActiveLeads / totalLeads) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                  <span className="text-on-surface">Lost/Aborted</span>
                  <span className="text-outline font-data-mono ml-auto">{totalLeads > 0 ? ((lostLeads / totalLeads) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Bottom Row: Recent Leads Card (Left 6 cols) */}
        <motion.section variants={itemVariants} className="col-span-12 lg:col-span-6 specular-card p-[1.75rem]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold">Recent Leads</h3>
              <p className="text-body-sm font-body-sm text-outline">Prospective tenant inquiries requiring operational action</p>
            </div>
            <Link href="/dashboard/leads" className="text-primary text-label-sm font-label-sm hover:underline flex items-center gap-1 font-semibold">
              <span>View All</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentLeads.length === 0 ? (
              <div className="text-center py-8 text-outline text-body-sm">
                No leads found. Create an intake link to get started.
              </div>
            ) : (
              recentLeads.map((lead: any) => {
                const initials = lead.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                const days = Math.floor((new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 3600 * 24));
                const pct = "100%";
                return (
                  <motion.div whileHover={{ scale: 1.01 }} key={lead.id} className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 flex items-center justify-between gap-4 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-label-md font-label-md border text-primary border-primary-container/40 bg-primary-container/20`}>
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-body-md font-body-md font-semibold text-white">{lead.name}</h4>
                        <p className="text-body-sm font-body-sm text-outline">{lead.propertyType || "Unspecified Property"} / {lead.budget ? `€${lead.budget}` : 'No Budget'}</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-label-sm font-label-sm text-outline mb-1">Pipeline: {days} Days</span>
                      <div className="w-24 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: pct }} transition={{ duration: 1, delay: 0.5 }} className={`h-full brand-gradient rounded-full`} />
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-label-sm font-label-sm border bg-primary-container/15 text-primary border-primary-container/30`}>
                        {lead.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.section>

        {/* Bottom Row: Recent Properties Card (Right 6 cols) */}
        <motion.section variants={itemVariants} className="col-span-12 lg:col-span-6 specular-card p-[1.75rem]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold">Recent Properties</h3>
              <p className="text-body-sm font-body-sm text-outline">Latest assets registered to the estate management registry</p>
            </div>
            <Link href="/dashboard/properties" className="text-primary text-label-sm font-label-sm hover:underline flex items-center gap-1 font-semibold">
              <span>View All</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentProperties.length === 0 ? (
              <div className="text-center py-8 text-outline text-body-sm">
                No properties registered yet.
              </div>
            ) : (
              recentProperties.map((prop: any) => (
                <motion.div whileHover={{ scale: 1.01 }} key={prop.id} className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 flex items-center justify-between gap-4 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center border border-outline-variant/40 text-primary`}>
                      <span className="material-symbols-outlined">apartment</span>
                    </div>
                    <div>
                      <h4 className="text-body-md font-body-md font-semibold text-white">{prop.title}</h4>
                      <p className="text-body-sm font-body-sm text-outline">{prop.address}, {prop.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-body-md font-body-md font-bold text-white">{prop.monthlyRent}<span className="text-label-sm font-label-sm text-outline font-normal">/mo</span></div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm border bg-tertiary-container/15 text-tertiary border-tertiary/20`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-tertiary`}></span>
                      {prop.available ? "Available" : "Rented"}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>
      </motion.div>
    </main>
  );
}
