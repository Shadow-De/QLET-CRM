"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="bg-[#0A0710] text-on-surface antialiased min-h-screen flex flex-col justify-between overflow-x-hidden relative selection:bg-primary-container selection:text-on-primary">
      
      {/* Atmospheric Nocturne Ambient Gradient Radial Blooming from Top */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[240px] left-1/2 -translate-x-1/2 w-[920px] h-[640px] bg-gradient-to-b from-[#E6399B]/25 via-[#7C3AED]/20 to-transparent blur-[140px] opacity-70"></div>
        <div className="absolute top-[8%] left-[20%] w-[380px] h-[380px] bg-[#E6399B]/10 blur-[110px] rounded-full"></div>
        <div className="absolute top-[12%] right-[18%] w-[420px] h-[420px] bg-[#7C3AED]/15 blur-[120px] rounded-full"></div>
        {/* Fine Specular Grid Texture Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:28px_28px] opacity-40"></div>
      </div>

      {/* Top Minimalist Utility Header */}
      <header className="relative z-10 w-full max-w-[1680px] mx-auto px-unit-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Qlet Geometric Emblem */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#E6399B] to-[#7C3AED] p-[1.5px] shadow-lg shadow-[#E6399B]/20">
            <div className="w-full h-full bg-[#100D16] rounded-[10px] flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-fixed" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 9V20C3 20.5523 3.44772 21 4 21H9V14H15V21H20C20.5523 21 21 20.5523 21 20V9L12 2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
                <path d="M15 11L18 8" stroke="#E6399B" strokeLinecap="round" strokeWidth="2"></path>
              </svg>
            </div>
          </div>
          <div>
            <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">QletLettings</span>
            <span className="hidden sm:inline-block ml-2 text-label-sm font-label-sm uppercase tracking-wider text-outline px-unit-2 py-[2px] rounded-md bg-surface-container-low border border-outline-variant/30">
              Enterprise Estate CRM
            </span>
          </div>
        </div>
        {/* Live Diagnostics Micro-Chip */}
        <div className="flex items-center gap-unit-3 text-label-sm font-label-sm text-on-surface-variant bg-surface-container-lowest/80 border border-outline-variant/30 px-unit-3 py-unit-2 rounded-full backdrop-blur-md">
          <span className="inline-block w-2 h-2 rounded-full bg-error animate-pulse"></span>
          <span className="font-data-mono text-data-mono text-outline">HTTP 404 INTAKE_FAILED</span>
        </div>
      </header>

      {/* Main Canvas: Centered High-Precision Glassmorphism Card */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-unit-4 py-unit-8">
        <div className="w-full max-w-[620px]">
          {/* Nocturne Glass Card Container with Specular Hairline Edge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative bg-surface-container-lowest/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-8 sm:p-12 text-center overflow-hidden transition-all duration-300" 
            style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 24px 64px -12px rgba(0, 0, 0, 0.85)" }}
          >
            {/* Subtle Inner Card Ambient Glow */}
            <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-80 h-44 bg-gradient-to-b from-[#E6399B]/30 to-transparent blur-3xl opacity-60"></div>
            
            {/* Center Geometric Monogram Anchor */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="relative mx-auto mb-6 w-16 h-16 rounded-2xl bg-surface-container p-1 border border-white/[0.1] shadow-2xl flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-gradient-to-b from-white/[0.06] to-transparent flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ffafd1] text-3xl">real_estate_agent</span>
              </div>
              {/* Orbiting Ambient Indicator Pill */}
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#100D16] border border-outline-variant/50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary-container"></div>
              </div>
            </motion.div>

            {/* 404 Display Numeral with Luminous Violet-Magenta Gradient Fill */}
            <div className="relative mb-2">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="font-display-kpi text-[96px] sm:text-[124px] leading-none font-extrabold tracking-tighter bg-gradient-to-b from-white via-primary-fixed-dim to-secondary bg-clip-text text-transparent select-none" style={{ textShadow: "0 0 60px rgba(230, 57, 155, 0.35), 0 0 120px rgba(124, 58, 237, 0.2)" }}>
                404
              </motion.div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-80"></div>
            </div>

            {/* Primary Error Headline */}
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6 font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Record or Page Not Found
            </motion.h1>
            
            {/* Short Explanatory Paragraph */}
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-3 text-body-lg font-body-lg text-outline max-w-[480px] mx-auto leading-relaxed">
              The property instruction, client intake link, or CRM route you requested does not exist or has been archived by your agency administrator.
            </motion.p>

            {/* Reference Metadata Tag & Diagnostic Pills */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low/90 border border-white/[0.06] shadow-inner">
              <span className="material-symbols-outlined text-outline-variant text-[16px]">terminal</span>
              <span className="font-data-mono text-data-mono text-on-surface-variant text-xs tracking-tight">
                Error Code: <span className="text-primary font-semibold">404-ROUTE-NOT-FOUND</span> &middot; Node: <span className="text-secondary font-semibold">LON-04</span>
              </span>
            </motion.div>

            {/* Contextual Suggested Action Buttons */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Primary CTA Button */}
              <Link href="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-unit-6 py-unit-3 rounded-xl bg-gradient-to-r from-[#E6399B] to-[#7C3AED] text-white font-label-md text-label-md font-bold shadow-[0_4px_24px_rgba(230,57,155,0.38)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.5)] hover:brightness-110 active:scale-[0.98] transition-all duration-150 ease-out group">
                <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:-translate-x-0.5">dashboard</span>
                <span>Return to Dashboard</span>
              </Link>
              {/* Secondary Ghost / Surface Action */}
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-unit-6 py-unit-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-label-md font-semibold border border-white/[0.08] hover:border-white/[0.2] active:scale-[0.98] transition-all duration-150 ease-out">
                <span className="material-symbols-outlined text-[18px] text-outline">contact_support</span>
                <span>Contact System Support</span>
              </button>
            </motion.div>

            {/* Quick Recovery Breadcrumbs / Search Hint */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-10 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3 text-body-sm font-body-sm text-outline">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-primary">info</span>
                Did a tenancy link expire? Check your intake queue.
              </span>
              <button className="text-primary hover:text-primary-fixed transition-colors font-medium inline-flex items-center gap-1">
                <span>Review Pipeline</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Quick Operational Safety Switch */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-6 flex items-center justify-center gap-6 text-label-sm font-label-sm text-outline/80">
            <button className="hover:text-on-surface transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Reload Session
            </button>
            <span className="text-outline-variant">&bull;</span>
            <button className="hover:text-on-surface transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">key</span>
              Verify Permissions
            </button>
            <span className="text-outline-variant">&bull;</span>
            <button className="hover:text-on-surface transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">lan</span>
              Cluster Health
            </button>
          </motion.div>
        </div>
      </main>

      {/* Ambient Minimal Footer */}
      <footer className="relative z-10 w-full max-w-[1680px] mx-auto px-unit-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-2 text-body-sm font-body-sm text-outline">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
          <span>Qlet Core Systems Online &middot; Malta Gateway Primary DC</span>
        </div>
        <div className="text-body-sm font-body-sm text-outline">
          &copy; {new Date().getFullYear()} QletLettings CRM Ltd. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
