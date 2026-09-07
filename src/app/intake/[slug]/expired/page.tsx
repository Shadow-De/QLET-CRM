"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ClientIntakeExpired() {
  return (
    <div className="bg-[#0A0710] bg-[radial-gradient(circle_at_50%_12%,rgba(230,57,155,0.12)_0%,transparent_45%),radial-gradient(circle_at_80%_30%,rgba(124,58,237,0.08)_0%,transparent_50%),radial-gradient(circle_at_20%_85%,rgba(96,1,209,0.06)_0%,transparent_45%)] text-on-surface min-h-[max(884px,100dvh)] flex flex-col justify-between items-center p-unit-4 sm:p-unit-6 antialiased selection:bg-primary-container selection:text-on-primary">
      
      {/* Minimal Brand Header Emblem */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[390px] pt-unit-5 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2.5 opacity-90 transition-opacity hover:opacity-100">
          <div className="w-7 h-7 rounded-lg bg-surface-container-high border border-outline-variant/40 flex items-center justify-center shadow-md">
            <span className="text-primary font-headline-sm font-bold text-xs tracking-tighter">QL</span>
          </div>
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">QletLettings</span>
        </div>
      </motion.header>

      {/* Central Card Screen Focus */}
      <main className="w-full max-w-[390px] my-auto py-unit-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
          className="bg-gradient-to-b from-[rgba(255,255,255,0.035)] via-[rgba(20,16,25,0.95)_16%] to-[#141019] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.07)] rounded-[24px] p-unit-6 sm:p-card-padding-lg flex flex-col items-center text-center relative overflow-hidden backdrop-blur-xl"
        >
          {/* Top Subtle Ambient Highlight */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-20 bg-gradient-to-b from-primary-container/20 to-transparent blur-xl pointer-events-none"></div>
          
          {/* Elevated Link Off / Expired Icon with Dual Amber/Rose Halo */}
          <div className="relative mb-unit-6 mt-unit-2">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }} className="w-16 h-16 rounded-full bg-surface-container-lowest shadow-[0_0_28px_-2px_rgba(245,158,11,0.22),0_0_0_1px_rgba(245,158,11,0.25)] flex items-center justify-center relative z-10 border border-outline-variant/30">
              <span className="material-symbols-outlined text-outline text-[28px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>link_off</span>
            </motion.div>
            {/* Ambient Underglow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-error/20 via-primary-container/20 to-secondary-container/20 blur-md -z-0"></div>
          </div>

          {/* Status Tag */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/40 mb-unit-4">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">Access Inactive</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold mb-unit-3 tracking-tight">
            Link Expired
          </motion.h1>

          {/* Primary Neutral Message */}
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="font-body-md text-body-md text-on-surface-variant max-w-[280px] mb-unit-6 leading-relaxed">
            This onboarding link is no longer active. Please contact your letting agent to request a new secure link.
          </motion.p>

          {/* Decorative Informational Callout Box */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="w-full rounded-xl bg-surface-container-lowest/80 border border-outline-variant/25 p-unit-3.5 mb-unit-6 text-left flex items-start gap-3">
            <div className="text-secondary mt-0.5 flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <p className="font-body-sm text-body-sm text-outline leading-snug">
              Links are single-use and expire after 7 days for privacy &amp; GDPR compliance.
            </p>
          </motion.div>

          {/* Primary Action: Contact Agency Concierge */}
          <motion.a 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="w-full py-unit-3 px-unit-4 rounded-xl bg-surface-container border border-outline-variant/50 hover:border-outline/50 hover:bg-surface-container-high active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group shadow-sm" 
            href="mailto:concierge@qletlettings.com?subject=New%20Onboarding%20Link%20Request"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-on-surface transition-colors">support_agent</span>
            <span className="font-label-md text-label-md font-semibold text-on-surface">Contact Agency Concierge</span>
          </motion.a>

          {/* Secondary Reference Details in Subtle Data-Mono */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-unit-5 pt-unit-4 border-t border-outline-variant/20 w-full flex items-center justify-between text-outline">
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Protocol Ref</span>
            <span className="font-data-mono text-data-mono text-xs opacity-75">QLET-EXP-0x7F2</span>
          </motion.div>

        </motion.div>
      </main>

      {/* Clean Minimal Portal Footer */}
      <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="w-full max-w-[390px] pb-unit-6 pt-unit-2 text-center flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-1.5 text-outline">
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          <span className="font-body-sm text-body-sm opacity-90">256-Bit Encrypted Link Protocol</span>
        </div>
        <p className="font-label-sm text-label-sm text-outline/70">
          QletLettings Secure Client Portal
        </p>
      </motion.footer>

    </div>
  );
}
