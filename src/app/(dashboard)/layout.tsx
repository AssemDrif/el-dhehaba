// app/(dashboard)/layout.tsx — Dashboard shell with sticky rate banner + side nav

import { StickyRateBanner } from "@/components/rates/StickyRateBanner";
import { DashboardNav } from "@/components/DashboardNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky gold rate bar */}
      <StickyRateBanner />

      <div className="flex flex-1">
        {/* Side nav */}
        <DashboardNav />

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

