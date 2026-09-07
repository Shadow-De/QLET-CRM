"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TourOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export default function TourOverlayModal({
  isOpen,
  onClose,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: TourOverlayModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          {/* Darkened Semi-transparent Scrim with Heavy Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0A0710]/85 backdrop-blur-md pointer-events-auto"
            onClick={onClose}
          />

          {/* Tooltip Content Wrapper */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-md flex items-center pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full bg-[#181420] border border-white/[0.12] rounded-[20px] p-unit-6 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.85)] relative transition-transform duration-200" style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.1)" }}>
              {/* Subtle Ambient Glow Behind Tooltip Card */}
              <div className="absolute -inset-1 rounded-[22px] bg-gradient-to-br from-[#E6399B]/15 to-[#7C3AED]/20 blur-xl -z-10"></div>
              
              {/* Top Row: Step Counter Pill & Close Cross */}
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#231C2D] border border-white/[0.1]">
                  <span className="w-2 h-2 rounded-full bg-[#fa4aab] shadow-[0_0_6px_#fa4aab]"></span>
                  <span className="text-label-sm font-label-sm text-primary font-semibold tracking-wide">
                    Step {currentStep} of {totalSteps} &middot; Pipeline Velocity
                  </span>
                </div>
                <button 
                  className="text-outline hover:text-white transition-colors p-1 rounded-md hover:bg-white/5 active:scale-95" 
                  onClick={onClose} 
                  title="Close Tour"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Header & Description */}
              <div className="space-y-2.5 mb-6">
                <h3 className="text-headline-md font-headline-md text-white font-bold tracking-tight">
                  Track deals in real time
                </h3>
                <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
                  Every prospective tenant moves through your 6 custom pipeline stages automatically as viewings and AML identity checks are logged.
                </p>
              </div>

              {/* Micro-Progress Indicator Dots */}
              <div className="flex items-center gap-1.5 mb-6">
                {Array.from({ length: totalSteps }).map((_, idx) => {
                  const stepNum = idx + 1;
                  const isActive = stepNum === currentStep;
                  return (
                    <span 
                      key={idx} 
                      className={`h-1 rounded-full ${isActive ? 'w-8 bg-gradient-to-r from-[#E6399B] to-[#7C3AED]' : 'w-2 bg-white/20'}`}
                      style={{ transition: "width 0.3s ease" }}
                    />
                  );
                })}
              </div>

              {/* Interactive Control Row */}
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
                {/* Left: 'Skip tour' Link (muted text) */}
                <button 
                  className="text-body-sm font-body-sm text-outline hover:text-white transition-colors duration-150 py-1" 
                  onClick={onClose}
                >
                  Skip tour
                </button>

                {/* Right: 'Back' Ghost Button & Glowing Gradient 'Next' Button */}
                <div className="flex items-center gap-3">
                  <button 
                    disabled={currentStep === 1}
                    className={`px-unit-4 py-2 rounded-lg bg-transparent text-label-md font-label-md transition-all duration-150 ${currentStep === 1 ? 'text-outline/30 cursor-not-allowed' : 'text-outline hover:text-white hover:bg-white/[0.04] active:scale-[0.98]'}`}
                    onClick={onBack}
                  >
                    Back
                  </button>
                  <button 
                    className="px-unit-5 py-2.5 rounded-lg bg-gradient-to-r from-[#E6399B] to-[#7C3AED] shadow-[0_4px_20px_rgba(230,57,155,0.35)] hover:brightness-110 hover:shadow-[0_6px_24px_rgba(124,58,237,0.45)] text-white font-label-md text-label-md flex items-center gap-1.5 transition-all duration-150 active:scale-[0.98]" 
                    onClick={onNext}
                  >
                    <span>{currentStep === totalSteps ? 'Finish' : 'Next'}</span>
                    {currentStep !== totalSteps && (
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Optional Guided Keyboard Navigation Hint at Screen Bottom */}
            <div className="absolute top-[calc(100%+32px)] left-0 w-full flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-4 text-label-sm font-label-sm text-outline/70">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-surface-container border border-white/10 rounded text-[11px] text-white font-data-mono">ESC</kbd> to exit
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-surface-container border border-white/10 rounded text-[11px] text-white font-data-mono">&rarr;</kbd> next step
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
