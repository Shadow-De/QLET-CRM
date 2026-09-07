"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GenerateClientLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRef?: string;
}

export default function GenerateClientLinkModal({ isOpen, onClose, defaultRef = "" }: GenerateClientLinkModalProps) {
  const [accessScope, setAccessScope] = useState<"single" | "multi">("single");
  const [expiry, setExpiry] = useState("7");
  const [copied, setCopied] = useState(false);
  const [linkRef, setLinkRef] = useState(defaultRef);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/intake-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expiryDays: expiry === "never" ? undefined : parseInt(expiry),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to generate link");
      setGeneratedLink(data.link.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleClose = () => {
    setGeneratedLink(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#0a0710]/85 backdrop-blur-[12px] z-40 cursor-pointer"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[560px] bg-[#141019] border border-outline-variant/40 rounded-2xl z-50 overflow-hidden shadow-[0_24px_60px_-12px_rgba(0,0,0,0.9),0_0_0_1px_rgba(250,74,171,0.25),0_0_35px_-5px_rgba(230,57,155,0.2)]"
          >
            {/* Ambient glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-[radial-gradient(circle_at_50%_0%,rgba(230,57,155,0.18)_0%,rgba(124,58,237,0.08)_45%,transparent_75%)] pointer-events-none"></div>
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>

            {/* Header */}
            <div className="relative px-unit-8 pt-unit-8 pb-unit-5 flex items-start justify-between border-b border-outline-variant/20">
              <div className="flex items-start gap-unit-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container/15 border border-primary-container/30 flex items-center justify-center text-primary shrink-0 shadow-inner">
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>link</span>
                </div>
                <div className="flex flex-col gap-1 pr-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-headline-md font-headline-md font-bold text-on-surface tracking-tight">Generate Client Link</h2>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                    </span>
                  </div>
                  <p className="text-body-sm font-body-sm text-outline leading-relaxed">
                    Create a secure onboarding link for prospective tenants to submit their intake requirements.
                  </p>
                </div>
              </div>
              <button onClick={handleClose} aria-label="Close modal" className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-all active:scale-[0.96]" type="button">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="px-unit-8 py-unit-6 flex flex-col gap-unit-5 relative z-10">

              {/* Link Label */}
              <div className="flex flex-col gap-unit-2">
                <div className="flex items-center justify-between">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="link-ref">
                    Link Label / Applicant Reference
                  </label>
                  <span className="text-label-sm font-label-sm text-outline">Optional</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="link-ref"
                    type="text"
                    value={linkRef}
                    onChange={(e) => setLinkRef(e.target.value)}
                    disabled={!!generatedLink}
                    placeholder="e.g. Mayfair — John Smith"
                    className="w-full h-11 bg-[#0E0A14] border border-outline-variant/40 rounded-lg px-unit-3 text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/40 transition-all disabled:opacity-50"
                  />
                  <div className="absolute right-3 text-outline pointer-events-none flex items-center">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </div>
                </div>
              </div>

              {/* Access Type & Expiration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-unit-4">
                {/* Access Type */}
                <div className="flex flex-col gap-unit-2">
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Access Scope</span>
                  <div className="grid grid-cols-2 p-1 bg-[#0E0A14] border border-outline-variant/30 rounded-lg h-11 relative">
                    <button
                      onClick={() => { if (!generatedLink) setAccessScope("single"); }}
                      className={`relative z-10 rounded-md font-label-sm text-[11px] flex items-center justify-center gap-1 transition-all ${accessScope === "single" ? "text-on-surface font-semibold" : "text-outline hover:text-on-surface"} ${generatedLink ? "opacity-50 cursor-not-allowed" : ""}`}
                      type="button"
                    >
                      {accessScope === "single" && <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                      <span>Single Use</span>
                    </button>
                    <button
                      onClick={() => { if (!generatedLink) setAccessScope("multi"); }}
                      className={`relative z-10 rounded-md font-label-sm text-[11px] flex items-center justify-center gap-1 transition-all ${accessScope === "multi" ? "text-on-surface font-semibold" : "text-outline hover:text-on-surface"} ${generatedLink ? "opacity-50 cursor-not-allowed" : ""}`}
                      type="button"
                    >
                      {accessScope === "multi" && <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                      <span>Multi-Use</span>
                    </button>
                    <div
                      className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-surface-container-high border border-primary-container/40 rounded-md shadow-sm transition-transform duration-300 ease-out"
                      style={{ transform: accessScope === "single" ? "translateX(4px)" : "translateX(calc(100% + 4px))" }}
                    ></div>
                  </div>
                </div>

                {/* Expiration */}
                <div className="flex flex-col gap-unit-2">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="link-expiry">Expiry Horizon</label>
                  <div className="relative flex items-center">
                    <select
                      id="link-expiry"
                      value={expiry}
                      onChange={(e) => { if (!generatedLink) setExpiry(e.target.value); }}
                      disabled={!!generatedLink}
                      className="w-full h-11 appearance-none bg-[#0E0A14] border border-outline-variant/40 rounded-lg px-unit-3 pr-9 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/40 cursor-pointer disabled:opacity-50"
                    >
                      <option value="1">Expires in 24 Hours</option>
                      <option value="7">Expires in 7 Days</option>
                      <option value="30">Expires in 30 Days</option>
                      <option value="never">No Expiration</option>
                    </select>
                    <div className="absolute right-3 text-outline pointer-events-none flex items-center">
                      <span className="material-symbols-outlined text-[20px]">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="px-4 py-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-body-sm">
                  {error}
                </div>
              )}

              {/* Generate button (before link is generated) */}
              {!generatedLink && (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full h-11 rounded-lg bg-gradient-to-br from-[#E6399B] to-[#7C3AED] text-white font-label-md font-semibold flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_4px_20px_rgba(230,57,155,0.35)] transition-all active:scale-[0.98] disabled:opacity-70"
                  type="button"
                >
                  {isGenerating ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">link</span>
                      <span>Generate Secure Link</span>
                    </>
                  )}
                </button>
              )}

              {/* Generated URL Box */}
              {generatedLink && (
                <div className="flex flex-col gap-unit-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-tertiary">lock</span>
                      Generated Secure Link
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tertiary/10 border border-tertiary/20 text-tertiary text-label-sm font-label-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                      {accessScope === "single" ? "Single-Use · Auto-Expires on Submit" : "Multi-Use · Active"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch gap-unit-2">
                    <div className="flex-1 relative flex items-center">
                      <input
                        readOnly
                        type="text"
                        value={generatedLink}
                        className="w-full h-11 bg-[#0E0A14] border border-outline-variant/50 rounded-lg pl-unit-3 pr-10 text-data-mono font-data-mono text-secondary-fixed text-xs sm:text-[13px] tracking-tight select-all focus:outline-none focus:border-primary-container/60 cursor-text"
                      />
                      <span className="absolute right-3 material-symbols-outlined text-[16px] text-outline pointer-events-none">shield</span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="bg-gradient-to-br from-[#E6399B] to-[#7C3AED] hover:brightness-110 shadow-[0_4px_20px_rgba(230,57,155,0.35)] px-unit-5 h-11 rounded-lg text-white font-label-md font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all shrink-0"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {copied ? 'check' : 'content_copy'}
                      </span>
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => { setGeneratedLink(null); setError(null); }}
                    className="text-outline text-body-sm hover:text-on-surface transition-colors text-left"
                    type="button"
                  >
                    ← Generate a new link
                  </button>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-2 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-2">
                <span className="text-body-sm font-body-sm text-outline">Alternative delivery methods:</span>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 px-unit-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant hover:bg-surface-container font-label-sm text-xs transition-all active:scale-[0.97]" type="button">
                    <span className="material-symbols-outlined text-[15px] text-primary">qr_code_2</span>
                    <span>View QR Code</span>
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-unit-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant hover:bg-surface-container font-label-sm text-xs transition-all active:scale-[0.97]" type="button">
                    <span className="material-symbols-outlined text-[15px] text-tertiary">sms</span>
                    <span>Dispatch SMS</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-unit-8 py-unit-5 bg-[#100D16] border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-unit-4 relative z-10">
              <div className="flex items-center gap-2 text-outline text-body-sm font-body-sm">
                <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span className="leading-tight text-[11px]">GDPR &amp; AML encrypted tenant intake link</span>
              </div>
              <button
                onClick={handleClose}
                className="w-full sm:w-auto min-w-[100px] h-10 px-unit-6 rounded-lg bg-surface-container-high border border-outline-variant/40 hover:bg-surface-variant text-on-surface font-label-md font-semibold transition-all active:scale-[0.98] text-center"
                type="button"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
