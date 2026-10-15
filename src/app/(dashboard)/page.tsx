"use client";
// app/(dashboard)/page.tsx — POS / Caisse page

import { useState } from "react";
import { QuickScaleCalc } from "@/components/pos/QuickScaleCalc";
import { TabdilSplitScreen } from "@/components/pos/TabdilSplitScreen";
import { useDhehabaStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Calculator, ArrowLeftRight, ShoppingCart } from "lucide-react";

const MODES = [
  { id: "SALE",      icon: ShoppingCart,    labelAr: "بيع",     labelFr: "Vente"    },
  { id: "BUY_CASSE", icon: ArrowLeftRight,  labelAr: "شراء كاس", labelFr: "Achat Casse" },
  { id: "TABDIL",    icon: ArrowLeftRight,  labelAr: "تبديل",   labelFr: "Tabdil"   },
] as const;

export default function POSPage() {
  const { posMode, setPosMode } = useDhehabaStore();

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-5">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-white">الكاسا — Caisse</h1>
        <p className="text-stone-400 text-sm">نقطة البيع السريعة — Point de Vente</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 bg-stone-900 border border-stone-800 p-1 rounded-2xl w-fit">
        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setPosMode(m.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all",
                posMode === m.id
                  ? "gold-gradient text-stone-950 shadow-md"
                  : "text-stone-400 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{m.labelAr}</span>
            </button>
          );
        })}
      </div>

      {/* Layout: calculator | main POS */}
      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-5">
        {/* Quick calculator — always visible */}
        <QuickScaleCalc />

        {/* Mode-specific main area */}
        <TabdilSplitScreen />
      </div>
    </div>
  );
}

