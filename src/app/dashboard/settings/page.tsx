"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Helper to trigger unsaved changes when inputs change
  const handleChange = () => {
    setUnsavedChanges(true);
  };

  return (
    <div className="w-full flex flex-col relative pb-32">
      {/* ================= TOP TITLE AREA ================= */}
      <div className="mb-unit-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-unit-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-headline-lg font-headline-lg text-white tracking-tight font-bold">Agency Configuration</h1>
            <span className="px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-tertiary/10 text-tertiary border border-tertiary/20 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-tertiary"></span>
              Enterprise Tier &middot; Multi-Tenant
            </span>
          </div>
          <p className="text-body-md font-body-md text-outline mt-1 max-w-2xl">
            Configure core brokerage details, regional branch routing, automated client onboarding workflows, and third-party syndication feeds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-label-sm font-label-sm text-outline uppercase tracking-wider">Last Configuration Push</p>
            <p className="text-data-mono font-data-mono text-on-surface text-body-sm">Today, 14:32 GMT &middot; Agent ID #8841</p>
          </div>
          <button className="bg-[#1E1826] border border-white/10 text-white px-unit-4 py-2 rounded-lg text-label-md font-label-md hover:border-white/20 hover:bg-[#251E30] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">history</span>
            Audit History
          </button>
        </div>
      </div>

      {/* ================= 2-COLUMN HUB LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-unit-6 items-start relative">
        
        {/* ================= LEFT COLUMN: INNER NAVIGATION ================= */}
        <div className="lg:col-span-3 lg:sticky lg:top-24">
          <div className="bg-gradient-to-b from-white/[0.025] to-transparent bg-[#141019] border border-white/[0.07] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] rounded-[20px] p-unit-3">
            <p className="px-3 pt-2 pb-3 text-label-sm font-label-sm text-outline uppercase tracking-wider">Configuration Modules</p>
            <nav className="flex flex-col gap-1">
              {/* Active Tab */}
              <button className="w-full flex items-center justify-between px-unit-4 py-unit-3 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white shadow-md shadow-primary-container/20 font-label-md text-label-md text-left transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>business</span>
                  <span>General &amp; Profile</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>

              <button className="w-full flex items-center justify-between px-unit-4 py-unit-3 rounded-xl text-outline hover:text-on-surface hover:bg-white/[0.03] font-label-md text-label-md text-left transition-all group">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] group-hover:text-primary transition-colors">badge</span>
                  <span>Team &amp; Access</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container-high text-secondary border border-secondary/20">8 Seats</span>
              </button>

              <button className="w-full flex items-center justify-between px-unit-4 py-unit-3 rounded-xl text-outline hover:text-on-surface hover:bg-white/[0.03] font-label-md text-label-md text-left transition-all group">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] group-hover:text-primary transition-colors">link</span>
                  <span>Intake Link Rules</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-tertiary/10 text-tertiary border border-tertiary/20">Active</span>
              </button>

              <button className="w-full flex items-center justify-between px-unit-4 py-unit-3 rounded-xl text-outline hover:text-on-surface hover:bg-white/[0.03] font-label-md text-label-md text-left transition-all group">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] group-hover:text-primary transition-colors">share_windows</span>
                  <span className="truncate">Portal Syndication</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-tertiary"></span>
              </button>

              <button className="w-full flex items-center justify-between px-unit-4 py-unit-3 rounded-xl text-outline hover:text-on-surface hover:bg-white/[0.03] font-label-md text-label-md text-left transition-all group">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] group-hover:text-primary transition-colors">verified_user</span>
                  <span>Compliance &amp; KYC</span>
                </div>
              </button>

              <button className="w-full flex items-center justify-between px-unit-4 py-unit-3 rounded-xl text-outline hover:text-on-surface hover:bg-white/[0.03] font-label-md text-label-md text-left transition-all group">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] group-hover:text-primary transition-colors">terminal</span>
                  <span>API &amp; Webhooks</span>
                </div>
                <span className="text-data-mono font-data-mono text-body-sm text-outline">v3.4</span>
              </button>

              <button className="w-full flex items-center justify-between px-unit-4 py-unit-3 rounded-xl text-outline hover:text-on-surface hover:bg-white/[0.03] font-label-md text-label-md text-left transition-all group">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] group-hover:text-primary transition-colors">shield</span>
                  <span>Audit &amp; Security Logs</span>
                </div>
              </button>
            </nav>

            {/* Quick Storage & Quota Widget */}
            <div className="mt-6 pt-4 border-t border-white/5 px-2">
              <div className="flex justify-between text-label-sm font-label-sm mb-1.5">
                <span className="text-outline uppercase tracking-wider">Encrypted Storage</span>
                <span className="text-white font-data-mono">68% used</span>
              </div>
              <div className="w-full h-1.5 bg-[#0E0A14] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-container to-secondary" style={{ width: "68%" }}></div>
              </div>
              <p className="text-body-sm font-body-sm text-outline/70 mt-2">13.6 GB of 20 GB AML Retention Cap</p>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: SETTINGS FORMS ================= */}
        <div className="lg:col-span-9 flex flex-col gap-unit-6">
          
          {/* Section Banner Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-r from-[#141019] to-[#1a1424] border border-white/[0.07] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] rounded-[20px] p-unit-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-full bg-radial from-primary-container/10 to-transparent pointer-events-none"></div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
                  <h2 className="text-headline-sm font-headline-sm font-bold text-white">Agency Profile &amp; Operational Standards</h2>
                </div>
                <p className="text-body-md font-body-md text-outline">
                  Configure core brokerage details, regional branch routing, and default letting terms applied across automated tenant contracts.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3 py-1 rounded-full text-label-sm font-label-sm bg-white/5 border border-white/10 text-white flex items-center gap-1.5 font-data-mono">
                  <span className="h-2 w-2 rounded-full bg-tertiary animate-pulse"></span>
                  Region: UK-LON-W1
                </span>
              </div>
            </div>
          </motion.div>

          {/* CARD 1: Agency Details & Branch Hierarchy */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-b from-white/[0.025] to-transparent bg-[#141019] border border-white/[0.07] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] rounded-[20px] p-unit-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-unit-4 mb-unit-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
                </div>
                <div>
                  <h3 className="text-headline-sm font-headline-sm font-bold text-white">Agency Details &amp; Hierarchy</h3>
                  <p className="text-body-sm font-body-sm text-outline">Legal entity credentials and territorial registration</p>
                </div>
              </div>
              <span className="text-label-sm font-label-sm uppercase text-outline tracking-wider font-data-mono">Section 01</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-unit-5">
              <div>
                <label className="block text-label-sm font-label-sm uppercase tracking-wider text-outline mb-2">Agency Trading Name</label>
                <input onChange={handleChange} className="w-full h-11 bg-[#0E0A14] border border-white/10 rounded-lg px-3.5 text-white font-body-md text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-all" type="text" defaultValue="QletLettings Central Region" />
              </div>
              <div>
                <label className="block text-label-sm font-label-sm uppercase tracking-wider text-outline mb-2">Corporate Registration No.</label>
                <input onChange={handleChange} className="w-full h-11 bg-[#0E0A14] border border-white/10 rounded-lg px-3.5 text-white font-data-mono text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-all" type="text" defaultValue="OC492819-UK" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-label-sm font-label-sm uppercase tracking-wider text-outline mb-2">Head Office Registered Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">location_on</span>
                  <input onChange={handleChange} className="w-full h-11 bg-[#0E0A14] border border-white/10 rounded-lg pl-10 pr-3.5 text-white font-body-md text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-all" type="text" defaultValue="14 Grosvenor Street, Mayfair, Malta W1K 4PS, United Kingdom" />
                </div>
              </div>
              <div>
                <label className="block text-label-sm font-label-sm uppercase tracking-wider text-outline mb-2">HMRC VAT Registration</label>
                <input onChange={handleChange} className="w-full h-11 bg-[#0E0A14] border border-white/10 rounded-lg px-3.5 text-white font-data-mono text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-all" type="text" defaultValue="GB 948 2011 44" />
              </div>
              <div>
                <label className="block text-label-sm font-label-sm uppercase tracking-wider text-outline mb-2">Primary Settlement Currency</label>
                <div className="relative">
                  <select onChange={handleChange} className="w-full h-11 bg-[#0E0A14] border border-white/10 rounded-lg px-3.5 text-white font-body-md text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container appearance-none transition-all cursor-pointer">
                    <option value="gbp">€ GBP — British Pound Sterling</option>
                    <option value="eur">€ EUR — Euro</option>
                    <option value="usd">$ USD — US Dollar</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CARD 2: Client Intake & Onboarding Link Defaults */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-b from-white/[0.025] to-transparent bg-[#141019] border border-white/[0.07] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] rounded-[20px] p-unit-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-unit-4 mb-unit-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">link</span>
                </div>
                <div>
                  <h3 className="text-headline-sm font-headline-sm font-bold text-white">Client Intake &amp; Onboarding Links</h3>
                  <p className="text-body-sm font-body-sm text-outline">Automated application links generated for prospective tenants</p>
                </div>
              </div>
              <span className="text-label-sm font-label-sm uppercase text-outline tracking-wider font-data-mono">Section 02</span>
            </div>
            
            <div className="space-y-unit-6">
              <div>
                <label className="block text-label-sm font-label-sm uppercase tracking-wider text-outline mb-2">Default Link Expiry Horizon</label>
                <div className="relative max-w-md">
                  <select onChange={handleChange} className="w-full h-11 bg-[#0E0A14] border border-white/10 rounded-lg px-3.5 text-white font-body-md text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container appearance-none transition-all cursor-pointer">
                    <option value="7">7 Days (Standard Security)</option>
                    <option value="3">3 Days (Urgent Letting Cycle)</option>
                    <option value="14">14 Days (Extended Brokerage)</option>
                    <option value="1">Single Session (Zero Storage)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span>
                </div>
                <p className="text-body-sm font-body-sm text-outline/80 mt-1.5">Unsubmitted candidate links automatically invalidate and purge uploaded bank statements upon expiration.</p>
              </div>

              {/* Toggles Row */}
              <div className="divide-y divide-white/5 border-y border-white/5 py-2">
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-body-md font-body-md text-white font-medium">Require Identity Verification</p>
                    <p className="text-body-sm font-body-sm text-outline">Passports, BRP cards, or EU identity documents scanned via automated optical character recognition.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" className="sr-only peer" defaultChecked onChange={handleChange} />
                    <div className="w-12 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-container peer-checked:to-secondary-container"></div>
                  </label>
                </div>
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-body-md font-body-md text-white font-medium">Auto-generate QR code for dispatch</p>
                    <p className="text-body-sm font-body-sm text-outline">Renders an in-branch high-resolution dynamic QR code on physical letting summaries.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" className="sr-only peer" defaultChecked onChange={handleChange} />
                    <div className="w-12 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-container peer-checked:to-secondary-container"></div>
                  </label>
                </div>
                <div className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-body-md font-body-md text-white font-medium">Enable WhatsApp concierge invite</p>
                    <p className="text-body-sm font-body-sm text-outline">Direct integration with Qlet automated messaging API for instant tenant acknowledgment.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" className="sr-only peer" defaultChecked onChange={handleChange} />
                    <div className="w-12 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-container peer-checked:to-secondary-container"></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-label-sm font-label-sm uppercase tracking-wider text-outline mb-2">Applicant Portal Welcome Headline</label>
                <div className="flex flex-col md:flex-row gap-4">
                  <input onChange={handleChange} className="flex-1 h-11 bg-[#0E0A14] border border-white/10 rounded-lg px-3.5 text-white font-body-md text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-all" type="text" defaultValue="Welcome to Qlet Mayfair — Complete Your Tenancy Screening" />
                  <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30 flex items-center justify-center gap-2 text-label-sm font-label-sm text-secondary cursor-pointer hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Live Preview</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CARD 3: Portal Syndication & Third-Party Feeds */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-b from-white/[0.025] to-transparent bg-[#141019] border border-white/[0.07] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] rounded-[20px] p-unit-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-unit-4 mb-unit-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">hub</span>
                </div>
                <div>
                  <h3 className="text-headline-sm font-headline-sm font-bold text-white">Portal Syndication &amp; Feeds</h3>
                  <p className="text-body-sm font-body-sm text-outline">Real-time listing feeds and governmental statutory checks</p>
                </div>
              </div>
              <span className="text-label-sm font-label-sm uppercase text-outline tracking-wider font-data-mono">Section 03</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-unit-4">
              <div className="p-unit-4 rounded-xl bg-surface-container-low border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-[18px]">apartment</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-tertiary/10 text-tertiary border border-tertiary/20 flex items-center gap-1.5 font-data-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-tertiary"></span>
                      Live Sync &middot; 15m
                    </span>
                  </div>
                  <h4 className="text-body-md font-body-md font-bold text-white mb-1">Rightmove Plus</h4>
                  <p className="text-body-sm font-body-sm text-outline mb-4">Direct BLM v3 spec real-time property pipeline sync.</p>
                </div>
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-body-sm">
                  <span className="text-outline font-data-mono">RM-9481-EXT</span>
                  <button className="text-primary hover:underline font-label-md font-semibold">Configure</button>
                </div>
              </div>
              <div className="p-unit-4 rounded-xl bg-surface-container-low border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-[18px]">home_work</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-tertiary/10 text-tertiary border border-tertiary/20 flex items-center gap-1.5 font-data-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-tertiary"></span>
                      Active
                    </span>
                  </div>
                  <h4 className="text-body-md font-body-md font-bold text-white mb-1">Zoopla API</h4>
                  <p className="text-body-sm font-body-sm text-outline mb-4">Instant listing push &amp; lead callback hook enabled.</p>
                </div>
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-body-sm">
                  <span className="text-outline font-data-mono">ZPG Node #012</span>
                  <button className="text-primary hover:underline font-label-md font-semibold">Configure</button>
                </div>
              </div>
              <div className="p-unit-4 rounded-xl bg-surface-container-low border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-[18px]">assured_workload</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-tertiary/10 text-tertiary border border-tertiary/20 flex items-center gap-1.5 font-data-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-tertiary"></span>
                      Auto-KYC
                    </span>
                  </div>
                  <h4 className="text-body-md font-body-md font-bold text-white mb-1">HM Land Registry</h4>
                  <p className="text-body-sm font-body-sm text-outline mb-4">Automated title deed &amp; ownership verification.</p>
                </div>
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-body-sm">
                  <span className="text-outline font-data-mono">Gov Gateway Auth</span>
                  <button className="text-primary hover:underline font-label-md font-semibold">Manage</button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* CARD 4: Security & Access Protocols */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-gradient-to-b from-white/[0.025] to-transparent bg-[#141019] border border-white/[0.07] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] rounded-[20px] p-unit-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-unit-4 mb-unit-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">security</span>
                </div>
                <div>
                  <h3 className="text-headline-sm font-headline-sm font-bold text-white">Security &amp; Access Protocols</h3>
                  <p className="text-body-sm font-body-sm text-outline">Branch cryptographic keys and enterprise compliance retention</p>
                </div>
              </div>
              <span className="text-label-sm font-label-sm uppercase text-outline tracking-wider font-data-mono">Section 04</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-unit-4">
              <div className="p-unit-4 rounded-xl bg-[#0E0A14] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline">Authentication</span>
                  <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
                </div>
                <h4 className="text-body-md font-body-md font-bold text-white">Two-Factor Auth (2FA)</h4>
                <p className="text-body-sm font-body-sm text-outline mt-1 mb-3">Enforced for all brokers and branch managers.</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-tertiary/10 text-tertiary border border-tertiary/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-tertiary"></span>
                  Mandatory Enforced
                </span>
              </div>
              <div className="p-unit-4 rounded-xl bg-[#0E0A14] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline">Session Lifecycle</span>
                  <span className="material-symbols-outlined text-secondary text-[18px]">timer</span>
                </div>
                <h4 className="text-body-md font-body-md font-bold text-white">Session Timeout</h4>
                <p className="text-body-sm font-body-sm text-outline mt-1 mb-3">Automatic lock out after 30 minutes inactivity.</p>
                <div className="flex items-center gap-2">
                  <span className="text-data-mono font-data-mono text-body-sm text-white bg-surface-container px-2.5 py-0.5 rounded">30 Minutes</span>
                  <span className="text-body-sm font-body-sm text-outline">Default</span>
                </div>
              </div>
              <div className="p-unit-4 rounded-xl bg-[#0E0A14] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline">Compliance</span>
                  <span className="material-symbols-outlined text-tertiary text-[18px]">policy</span>
                </div>
                <h4 className="text-body-md font-body-md font-bold text-white">Encrypted AML Audit</h4>
                <p className="text-body-sm font-body-sm text-outline mt-1 mb-3">ISO-27001 compliant retention standard.</p>
                <span className="text-data-mono font-data-mono text-body-sm text-secondary">7 Years Retention</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ================= BOTTOM STICKY ACTION BAR (Visible when unsaved changes) ================= */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: unsavedChanges ? 0 : 100, opacity: unsavedChanges ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-6 right-8 left-[312px] z-40 bg-[#141019]/90 backdrop-blur-xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.6)] rounded-[20px] p-unit-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-primary-container animate-ping"></span>
          <span className="text-body-md font-body-md text-on-surface">You have unsaved changes in <strong className="text-white font-semibold">Configuration Modules</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setUnsavedChanges(false)}
            className="px-unit-4 py-2.5 rounded-lg border border-white/10 text-outline hover:text-white hover:bg-white/5 transition-all text-label-md font-label-md font-medium"
          >
            Discard Changes
          </button>
          <button 
            onClick={() => setUnsavedChanges(false)}
            className="bg-gradient-to-r from-[#E6399B] to-[#7C3AED] hover:brightness-110 shadow-[0_4px_20px_rgba(230,57,155,0.35)] text-white px-unit-6 py-2.5 rounded-lg font-label-md text-label-md font-bold flex items-center gap-2 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Save Configuration</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
