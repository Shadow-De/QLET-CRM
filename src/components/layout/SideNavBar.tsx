"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

const navItems = [
  { name: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { name: "Properties", icon: "real_estate_agent", href: "/dashboard/properties" },
  { name: "Pipeline", icon: "view_kanban", href: "/dashboard/leads" },
  { name: "Tenants", icon: "group", href: "/dashboard/tenants" },
  { name: "Analytics", icon: "analytics", href: "/dashboard/analytics" },
  { name: "Settings", icon: "settings", href: "/dashboard/settings" },
];

// ────────────────────────────────────────────────────────────────
// DESKTOP: Fixed side nav (hidden on mobile)
// ────────────────────────────────────────────────────────────────
export function SideNavBar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-surface-container-lowest border-r border-outline-variant/30 shadow-2xl z-40 hidden md:block">
      <div className="flex flex-col justify-between h-full p-6">
        {/* Header / Logo */}
        <div>
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E6399B] to-[#7C3AED] flex items-center justify-center text-white shadow-lg shadow-primary-container/20">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                token
              </span>
            </div>
            <div>
              <span className="text-headline-sm font-headline-sm font-bold text-on-surface tracking-tight block">
                QletLettings
              </span>
              <span className="text-label-sm font-label-sm text-outline block -mt-1 tracking-wider uppercase">
                Enterprise Estate CRM
              </span>
            </div>
          </div>

          {/* Primary CTA Intake Button */}
          <div className="mb-6">
            <Link href="/dashboard/leads/new" className="block">
              <motion.button
                whileHover={{ scale: 1.02, filter: "brightness(1.05)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-br from-[#E6399B] to-[#7C3AED] text-white text-label-md font-label-md font-bold shadow-lg shadow-primary-container/25 transition-colors"
              >
                <span className="material-symbols-outlined text-white text-lg">add_circle</span>
                <span>New Intake</span>
              </motion.button>
            </Link>
          </div>

          {/* Navigation Links */}
          <NavLinks pathname={pathname} />
        </div>

        {/* Footer / Account & Support */}
        <div className="pt-4 border-t border-outline-variant/30 space-y-1">
          <Link href="/dashboard/help" className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-outline font-label-md hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">help</span>
              <span className="text-label-md font-label-md">Help & Support</span>
            </motion.div>
          </Link>
          <button
            className="w-full text-left"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-outline font-label-md hover:bg-surface-container hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="text-label-md font-label-md">Log Out</span>
            </motion.div>
          </button>
        </div>
      </div>
    </aside>
  );
}

// ────────────────────────────────────────────────────────────────
// MOBILE: Slide-out drawer (overlay, triggered from TopNavBar)
// ────────────────────────────────────────────────────────────────
export function MobileNavDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed left-0 top-0 h-full w-[300px] bg-[#0F0B17] border-r border-outline-variant/30 shadow-2xl z-50 md:hidden flex flex-col"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E6399B] to-[#7C3AED] flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    token
                  </span>
                </div>
                <div>
                  <span className="text-body-md font-bold text-on-surface tracking-tight block">
                    QletLettings
                  </span>
                  <span className="text-[10px] text-outline block uppercase tracking-wider -mt-0.5">
                    Estate CRM
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {/* New Intake CTA */}
              <Link href="/dashboard/leads/new" className="block mb-4">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-br from-[#E6399B] to-[#7C3AED] text-white text-label-md font-label-md font-bold shadow-lg"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  <span>New Intake</span>
                </motion.button>
              </Link>

              <p className="text-[10px] font-bold uppercase tracking-widest text-outline/60 px-2 mb-2">
                Navigation
              </p>
              <NavLinks pathname={pathname} onNavigate={onClose} />
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-outline-variant/20 space-y-1">
              <Link href="/dashboard/help" className="block">
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-outline hover:bg-surface-container hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">help</span>
                  <span className="text-body-sm font-medium">Help & Support</span>
                </motion.div>
              </Link>
              <button
                className="w-full text-left"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-outline hover:bg-error/10 hover:text-error transition-colors"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span className="text-body-sm font-medium">Sign Out</span>
                </motion.div>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ────────────────────────────────────────────────────────────────
// MOBILE: Bottom Tab Bar (persistent, 5 primary items)
// ────────────────────────────────────────────────────────────────
const bottomTabItems = [
  { name: "Home", icon: "dashboard", href: "/dashboard" },
  { name: "Properties", icon: "real_estate_agent", href: "/dashboard/properties" },
  { name: "Pipeline", icon: "view_kanban", href: "/dashboard/leads" },
  { name: "Tenants", icon: "group", href: "/dashboard/tenants" },
  { name: "Analytics", icon: "analytics", href: "/dashboard/analytics" },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0F0B17]/95 backdrop-blur-xl border-t border-outline-variant/25 safe-area-pb">
      <div className="flex items-stretch h-16">
        {bottomTabItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative group"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-tab-active"
                  className="absolute inset-x-2 top-1 h-1 rounded-full bg-gradient-to-r from-[#E6399B] to-[#7C3AED]"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span
                className={`material-symbols-outlined text-[22px] mt-1.5 transition-colors duration-150 ${
                  isActive ? "text-primary" : "text-outline group-active:text-on-surface"
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span
                className={`text-[10px] font-semibold tracking-wide transition-colors duration-150 ${
                  isActive ? "text-primary" : "text-outline/70 group-active:text-on-surface"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ────────────────────────────────────────────────────────────────
// Shared: Nav link list used by both desktop sidebar + drawer
// ────────────────────────────────────────────────────────────────
function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1 relative">
      {navItems.map((item, i) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.name}
            href={item.href}
            className="block relative"
            onClick={onNavigate}
          >
            <motion.div
              whileHover={{ scale: isActive ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 + 0.1, duration: 0.3 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-colors relative z-10 ${
                isActive
                  ? "text-on-primary font-bold shadow-lg shadow-primary-container/30"
                  : "text-outline hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-primary-container rounded-lg -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-label-md font-label-md">{item.name}</span>
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
