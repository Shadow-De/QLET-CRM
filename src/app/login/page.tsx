"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Key, Shield, ArrowRight, AlertCircle } from "lucide-react";

import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("director@qletlettings.com");
  const [password, setPassword] = useState("ChangeMe#2024!");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    });
  }

  return (
    <div className="bg-[#0A0710] text-on-surface min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden antialiased selection:bg-primary-container selection:text-on-primary">
      {/* Atmospheric Top-Corner Gradient Light Blooms */}
      <div className="pointer-events-none fixed top-[-15%] left-[-12%] w-[680px] h-[680px] rounded-full bg-[radial-gradient(circle,rgba(230,57,155,0.18)_0%,rgba(124,58,237,0.08)_50%,transparent_75%)] blur-[100px] -z-10"></div>
      <div className="pointer-events-none fixed top-[-10%] right-[-10%] w-[620px] h-[620px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.2)_0%,rgba(230,57,155,0.06)_45%,transparent_75%)] blur-[110px] -z-10"></div>
      <div className="pointer-events-none fixed bottom-[-20%] left-[30%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(96,1,209,0.1)_0%,transparent_70%)] blur-[120px] -z-10"></div>
      
      {/* Subtle Ambient Background Grid Motif */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-10"></div>

      <motion.div 
        className="w-full max-w-[460px] mx-auto z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Branding Header Cluster */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Clean Geometric Emblem Logo */}
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-xl border border-white/10 bg-gradient-to-br from-surface-container to-surface-container-lowest">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#E6399B] to-[#7C3AED] opacity-20 blur-md"></div>
            <svg aria-hidden="true" className="w-8 h-8 relative z-10" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <rect fill="#E6399B" height="10" rx="3" width="10" x="4" y="4"></rect>
              <rect fill="#7C3AED" height="10" rx="3" width="10" x="18" y="4"></rect>
              <rect fill="#7C3AED" height="10" rx="3" width="10" x="4" y="18"></rect>
              <rect fill="#FFD8E6" fillOpacity="0.85" height="10" rx="3" width="10" x="18" y="18"></rect>
              <path d="M14 9H18M9 14V18M23 14V18M14 23H18" opacity="0.6" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="1.5"></path>
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-on-surface">QletLettings</h1>
          <p className="font-sans text-sm text-outline mt-1 font-medium tracking-wide">Enterprise Estate CRM</p>
        </div>

        {/* Elevated Specular Auth Card */}
        <div 
          className="p-6 sm:p-8 backdrop-blur-2xl rounded-[20px]"
          style={{
            background: "linear-gradient(180deg, rgba(255, 255, 255, 0.035) 0%, rgba(20, 16, 25, 0.95) 100%), #141019",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 12px 32px -4px rgba(0, 0, 0, 0.7), 0 0 80px -20px rgba(124, 58, 237, 0.15)"
          }}
        >
          {/* Screen Scope Welcome Subtitle */}
          <div className="mb-5">
            <h2 className="font-heading text-lg font-semibold text-on-surface">Sign in to console</h2>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">Enter your operator credentials to access the portfolio terminal.</p>
          </div>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Input Field */}
            <div>
              <label className="block font-sans text-sm text-on-surface-variant mb-1.5 font-medium" htmlFor="email-input">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  className="w-full h-11 pl-10 pr-3.5 bg-[#0E0A14] text-on-surface border border-white/10 rounded-lg font-sans text-sm placeholder-[#655E70] focus:outline-none focus:border-[#E6399B] focus:ring-4 focus:ring-[#E6399B]/20 transition-all" 
                  id="email-input" 
                  name="email" 
                  placeholder="name@enterprise.com" 
                  required 
                  type="email" 
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-sans text-sm text-on-surface-variant font-medium" htmlFor="password-input">
                  Password
                </label>
                <a className="font-sans text-xs text-primary hover:text-primary-fixed transition-colors underline-offset-4 hover:underline" href="#forgot">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  className="w-full h-11 pl-10 pr-11 bg-[#0E0A14] text-on-surface border border-white/10 rounded-lg font-sans text-sm placeholder-[#655E70] focus:outline-none focus:border-[#E6399B] focus:ring-4 focus:ring-[#E6399B]/20 transition-all" 
                  id="password-input" 
                  name="password" 
                  placeholder="Enter your security token" 
                  required 
                  type={showPassword ? "text" : "password"} 
                  defaultValue="••••••••••••••••"
                />
                <button 
                  aria-label="Toggle password visibility" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors cursor-pointer" 
                  onClick={() => setShowPassword(!showPassword)} 
                  type="button"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Session Persistence & Hardware Key Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input 
                  defaultChecked 
                  className="w-4 h-4 rounded border-white/20 bg-[#0E0A14] text-primary-container focus:ring-0 focus:ring-offset-0 transition" 
                  type="checkbox"
                />
                <span className="font-sans text-sm text-on-surface-variant">Keep terminal active</span>
              </label>
              <span className="font-mono text-[11px] text-outline/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                Node: LON-04
              </span>
            </div>

            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-sans text-sm">{error}</span>
              </motion.div>
            )}

            {/* Vibrant Gradient Action Button */}
            <div className="pt-2">
              <motion.button 
                whileHover={!isPending ? { filter: "brightness(1.08)", boxShadow: "0 6px 24px rgba(124, 58, 237, 0.45)" } : {}}
                whileTap={!isPending ? { scale: 0.98 } : {}}
                className="w-full h-11 rounded-lg text-white font-sans text-sm font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed" 
                style={{
                  background: "linear-gradient(135deg, #E6399B 0%, #7C3AED 100%)",
                  boxShadow: "0 4px 20px rgba(230, 57, 155, 0.35)"
                }}
                type="submit"
                disabled={isPending}
              >
                <span>{isPending ? "Signing in…" : "Log in"}</span>
                {!isPending && <ArrowRight className="w-4 h-4" />}
              </motion.button>
            </div>
          </form>

          {/* Terminal SSO / Hardware Authentication Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#141019] px-3 font-sans text-xs text-outline tracking-wider uppercase">Institutional Access</span>
            </div>
          </div>

          {/* Secondary Surface Auth Handlers */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              className="h-10 px-3 rounded-lg bg-surface-container-low border border-white/10 hover:border-white/20 hover:bg-surface-container text-on-surface font-sans text-sm flex items-center justify-center gap-2 transition-colors" 
              type="button"
            >
              <Key className="w-4 h-4 text-secondary" />
              <span>SSO Portal</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              className="h-10 px-3 rounded-lg bg-surface-container-low border border-white/10 hover:border-white/20 hover:bg-surface-container text-on-surface font-sans text-sm flex items-center justify-center gap-2 transition-colors" 
              type="button"
            >
              <Shield className="w-4 h-4 text-tertiary" />
              <span>Hardware Passkey</span>
            </motion.button>
          </div>
        </div>

        {/* Security Footnote & Protocol Metadata */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-outline font-sans text-xs">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Protocol • TLS 1.3 Strict</span>
          </div>
          <p className="font-sans text-[11px] text-outline/60 mt-1.5">
            Unauthorized terminal intrusion attempts are recorded and monitored under ISO-27001 compliance.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-[#0A0710] text-on-surface min-h-screen flex items-center justify-center">Loading terminal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
