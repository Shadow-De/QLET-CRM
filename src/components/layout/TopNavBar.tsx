"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { ProfileSettingsModal } from "../dashboard/ProfileSettingsModal";
import { MobileNavDrawer } from "./SideNavBar";

export function TopNavBar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 h-16 w-full">
        <div className="flex items-center justify-between px-4 md:px-8 h-full max-w-[1680px] w-full mx-auto gap-3">

          {/* LEFT: Hamburger (mobile only) + Search */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Hamburger button — mobile only */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
              aria-label="Open navigation"
            >
              <span className="material-symbols-outlined">menu</span>
            </motion.button>

            {/* Search bar — hidden on small mobile, shown on sm+ */}
            <div className="relative hidden sm:block w-full max-w-xs lg:max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
                search
              </span>
              <input
                className="w-full h-10 pl-10 pr-4 rounded-full bg-surface-container-lowest text-on-surface placeholder:text-outline/70 border border-outline-variant/40 focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 text-body-sm font-body-sm transition-all"
                placeholder="Search reference, tenant, postcode..."
                type="text"
              />
            </div>

            {/* Mobile: Logo wordmark instead of search */}
            <div className="flex sm:hidden items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#E6399B] to-[#7C3AED] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  token
                </span>
              </div>
              <span className="font-bold text-on-surface text-body-md tracking-tight truncate">
                QletLettings
              </span>
            </div>
          </div>

          {/* RIGHT: Actions + Profile */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Search icon on tiny mobile */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="sm:hidden w-9 h-9 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Search"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </motion.button>

            {/* Tune icon — hide on very small */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Filter Configurations"
            >
              <span className="material-symbols-outlined">tune</span>
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px] md:text-[24px]">notifications</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-container ring-2 ring-surface"
              />
            </motion.button>

            <div className="hidden sm:block h-6 w-px bg-outline-variant/40 mx-1"></div>

            {/* Create Record — desktop only */}
            <motion.button
              whileHover={{ scale: 1.02, filter: "brightness(1.05)" }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-[#E6399B] to-[#7C3AED] text-white text-label-md font-label-md font-semibold shadow-md shadow-primary-container/20 transition-all"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              <span>Create Record</span>
            </motion.button>

            {/* Agent Profile Chip */}
            <div className="relative" ref={menuRef}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 pl-1 md:pl-2 py-1 pr-2 md:pr-3 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden ring-1 ring-primary/40 bg-surface-container-highest relative flex items-center justify-center flex-shrink-0">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="material-symbols-outlined text-outline text-base">person</span>
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-body-sm font-body-sm font-semibold text-on-surface leading-tight">
                    {session?.user?.name || "Agent"}
                  </div>
                  <div className="text-label-sm font-label-sm text-outline leading-tight capitalize">
                    {(session?.user as any)?.position || (session?.user as any)?.role || "Lettings Agent"}
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline text-sm">expand_more</span>
              </motion.div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 py-1 rounded-xl bg-surface border border-outline-variant/30 shadow-xl overflow-hidden z-50"
                  >
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-container transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-[20px] text-outline">settings</span>
                      Profile Settings
                    </button>
                    <div className="h-px w-full bg-outline-variant/20 my-1"></div>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-body-sm font-medium text-error hover:bg-error-container/50 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <ProfileSettingsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentName={session?.user?.name || ""}
          currentEmail={session?.user?.email || ""}
          currentPosition={(session?.user as any)?.position || ""}
          currentAvatar={session?.user?.image || null}
        />
      </header>

      {/* Mobile Drawer — rendered outside header so it can overlay everything */}
      <MobileNavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
