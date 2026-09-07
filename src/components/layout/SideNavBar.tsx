"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { name: "Properties", icon: "real_estate_agent", href: "/dashboard/properties" },
  { name: "Pipeline", icon: "view_kanban", href: "/dashboard/leads" },
  { name: "Tenants", icon: "group", href: "/dashboard/tenants" },
  { name: "Analytics", icon: "analytics", href: "/dashboard/analytics" },
  { name: "Settings", icon: "settings", href: "/dashboard/settings" },
];

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
          <nav className="space-y-1 relative">
            {navItems.map((item, i) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className="block relative">
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
          <button className="w-full text-left">
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
