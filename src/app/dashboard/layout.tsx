import { SideNavBar, BottomTabBar } from "@/components/layout/SideNavBar";
import { TopNavBar } from "@/components/layout/TopNavBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative selection:bg-primary-container selection:text-on-primary bg-[#0A0710]">
      {/* Atmospheric Lighting Blobs */}
      <div className="bloom-top-right"></div>
      <div className="bloom-mid-left"></div>

      <div className="flex min-h-screen relative z-10">
        {/* Desktop Sidebar */}
        <SideNavBar />

        {/* Main Content Container */}
        <div className="flex-1 md:ml-[280px] flex flex-col min-w-0">
          <TopNavBar />

          {/* Page content — extra bottom padding on mobile for the bottom tab bar */}
          <div className="flex-1 pb-16 md:pb-0">
            {children}
          </div>

          {/* Footer — hidden on mobile to save space */}
          <footer className="hidden md:flex mt-auto px-8 py-6 max-w-[1680px] w-full mx-auto border-t border-outline-variant/20 flex-col sm:flex-row items-center justify-between gap-4 text-label-sm font-label-sm text-outline">
            <div>QletLettings Enterprise Estate CRM v3.4.12 · Architecture Night Mode</div>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span> Core Engine Operational
              </span>
              <span>Security Protocol 256-bit TLS</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <BottomTabBar />
    </div>
  );
}
