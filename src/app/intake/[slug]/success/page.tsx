"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientIntakeSuccess() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [digest, setDigest] = useState<any>(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem("lastIntakeSubmission");
      if (data) {
        setDigest(JSON.parse(data));
      }
      if (sessionStorage.getItem("intake_completed") === "true") {
        setIsCompleted(true);
      }
    } catch (e) {}
  }, []);

  const handleComplete = () => {
    setIsCompleted(true);
    try {
      sessionStorage.setItem("intake_completed", "true");
    } catch (e) {}
  };

  return (
    <div className="bg-[#0A0710] bg-[radial-gradient(circle_at_50%_12%,rgba(230,57,155,0.18)_0%,rgba(124,58,237,0.12)_36%,rgba(10,7,16,0)_70%),radial-gradient(circle_at_80%_85%,rgba(124,58,237,0.1)_0%,rgba(10,7,16,0)_50%)] text-on-surface min-h-[max(884px,100dvh)] flex items-center justify-center p-unit-4 antialiased selection:bg-primary-container selection:text-on-primary">
      
      {/* Mobile Viewport Container (~400px portrait) */}
      <main className="w-full max-w-[420px] flex flex-col items-center my-auto py-unit-6 relative">
        
        {/* Top Minimal Brand Monogram Header */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-unit-6 flex flex-col items-center gap-unit-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-surface-container-high border border-outline-variant/40 flex items-center justify-center shadow-md">
              <span className="text-primary font-headline-sm font-bold text-sm tracking-tighter leading-none">Q</span>
            </div>
            <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">QletLettings</span>
          </div>
          <p className="font-label-sm text-label-sm text-outline tracking-wider uppercase opacity-80">Private Client Portal</p>
        </motion.header>

        {/* Main Luxurious Card */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
          className="w-full bg-[#141019] rounded-[24px] p-card-padding-sm sm:p-card-padding-lg border border-white/[0.08] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1),0_20px_45px_-10px_rgba(0,0,0,0.75),0_0_35px_-5px_rgba(230,57,155,0.15)] relative backdrop-blur-2xl flex flex-col items-center text-center overflow-hidden"
        >
          {/* Top Subtle Gradient Horizon Beam */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-75"></div>

          <AnimatePresence mode="wait">
            {isCompleted ? (
              /* Final State: Form Journey Ended */
              <motion.div
                key="completed-screen"
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -15 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full flex flex-col items-center py-unit-2"
              >
                {/* Glowing Success Badge */}
                <div className="mt-unit-3 mb-unit-5 relative flex items-center justify-center">
                  <div className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-[#E6399B] to-[#7C3AED] blur-2xl opacity-60 animate-pulse"></div>
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#E6399B] to-[#7C3AED] flex items-center justify-center shadow-[0_0_35px_rgba(230,57,155,0.5),0_0_60px_rgba(124,58,237,0.3)] border border-white/30">
                    <span className="material-symbols-outlined text-white text-[38px] drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                      task_alt
                    </span>
                  </div>
                </div>

                <div className="mb-unit-4 inline-flex items-center gap-2 px-unit-3 py-1 rounded-full bg-surface-container-low border border-primary/40">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
                  <span className="font-data-mono text-label-sm text-primary font-bold tracking-tight">
                    Submission Finalized
                  </span>
                </div>

                <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold mb-unit-3 tracking-tight">
                  Your Details Are Submitted!
                </h1>

                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-[320px] mb-unit-6">
                  Thank you! Your details have been submitted. Our letting agent will review your preferences and contact you soon.
                </p>

                {/* Clean Status & Details Recap Box */}
                <div className="w-full bg-[#0E0A14] rounded-xl p-unit-4 border border-white/[0.06] text-left mb-unit-6 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Status</span>
                    <span className="text-label-sm font-label-sm text-tertiary font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Received &amp; Assigned
                    </span>
                  </div>
                  {digest?.name && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                      <span className="text-body-sm text-outline">Applicant</span>
                      <span className="text-body-sm font-medium text-on-surface">{digest.name}</span>
                    </div>
                  )}
                  {digest?.areas && digest.areas.length > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                      <span className="text-body-sm text-outline">Preferred Areas</span>
                      <span className="text-body-sm font-medium text-on-surface text-right">{digest.areas.join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* Concluding Helper Notice */}
                <div className="w-full p-unit-3.5 rounded-xl bg-surface-container-lowest/70 border border-outline-variant/30 text-center">
                  <p className="font-body-sm text-body-sm text-outline flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                    Your form journey is complete. You can now close this window.
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Pre-click State: Review Summary & Click Complete Submission */
              <motion.div
                key="review-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -15 }}
                className="w-full flex flex-col items-center"
              >
                {/* Luminous Status Checkmark Badge */}
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }} className="mt-unit-3 mb-unit-5 relative flex items-center justify-center">
                  <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-[#E6399B] to-[#7C3AED] blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#E6399B] to-[#7C3AED] flex items-center justify-center shadow-[0_0_30px_4px_rgba(230,57,155,0.45),0_0_60px_10px_rgba(124,58,237,0.25)] border border-white/30">
                    <span className="material-symbols-outlined text-white text-[32px] drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  </div>
                </motion.div>

                {/* Main Headline */}
                <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold mb-unit-2 tracking-tight">
                  Intake Registered
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-[310px] leading-relaxed mb-unit-5">
                  Review your submitted summary below, then click Complete Submission to finish.
                </p>

                {/* Summary Card Snippet Container */}
                <div className="w-full bg-[#0E0A14] rounded-xl p-unit-4 border border-white/[0.06] text-left mb-unit-5 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase font-semibold">
                      Submission Digest
                    </span>
                    <span className="material-symbols-outlined text-primary text-[16px]">
                      verified
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface font-semibold leading-snug">
                    {digest?.areas && digest.areas.length > 0 ? digest.areas.join(' & ') : 'Malta'} · {digest?.propertyTypes && digest.propertyTypes.length > 0 ? digest.propertyTypes.join(', ') : 'Property'} · Move-in target {digest?.moveInDate ? new Date(digest.moveInDate).toLocaleDateString(undefined, { month: 'long' }) : 'ASAP'}
                  </p>
                  <div className="mt-unit-3 pt-unit-3 border-t border-white/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-[15px]">
                        account_balance_wallet
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {digest?.budget ? `€${digest.budget} pcm` : 'Budget not specified'}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-medium bg-tertiary-container/20 text-tertiary">
                      Priority Tier
                    </span>
                  </div>
                </div>

                {/* Security Assurance Banner */}
                <div className="w-full flex items-start gap-2.5 p-unit-3 rounded-lg bg-surface-container-lowest/70 border border-outline-variant/30 text-left mb-unit-6">
                  <span className="material-symbols-outlined text-secondary-fixed-dim text-[18px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                    lock
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Your identity and rental preferences are securely stored and encrypted.
                  </p>
                </div>

                {/* Primary Action: Complete Submission Button */}
                <button 
                  onClick={handleComplete}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#E6399B] to-[#7C3AED] text-white font-label-md text-label-md font-bold shadow-[0_4px_20px_rgba(230,57,155,0.35)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-unit-3 cursor-pointer" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">done_all</span>
                  Complete Submission
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Bottom Discrete Watermark */}
        <div className="mt-unit-6 text-center">
          <p className="font-label-sm text-label-sm text-outline/60 tracking-wider">
            Qlet Nocturne Client Portal · End-to-End Encrypted
          </p>
        </div>

      </main>
    </div>
  );
}
