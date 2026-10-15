"use client";
// components/rates/StickyRateBanner.tsx
// Always-visible gold rate bar at the top of every page

import { useState } from "react";
import { Lock, Unlock, TrendingUp, RefreshCw } from "lucide-react";
import { useDhehabaStore } from "@/lib/store";
import { formatDZD, formatToAlgerianCentimes } from "@/lib/pricingEngine";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function StickyRateBanner() {
  const { rates, ratesLocked, setRates, toggleRatesLock } = useDhehabaStore();
  const [editing, setEditing] = useState({
    standardNewPrice: rates.standardNewPrice.toString(),
    laCasseBuyPrice: rates.laCasseBuyPrice.toString(),
    laCasseSellPrice: rates.laCasseSellPrice.toString(),
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const newPrice = parseFloat(editing.standardNewPrice);
    const casseBuy = parseFloat(editing.laCasseBuyPrice);
    const casseSell = parseFloat(editing.laCasseSellPrice);

    if (isNaN(newPrice) || isNaN(casseBuy) || isNaN(casseSell)) {
      toast.error("أدخل أسعاراً صحيحة");
      return;
    }
    if (casseBuy >= newPrice) {
      toast.error("سوم الكاس يجب أن يكون أقل من سوم الجديد");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ standardNewPrice: newPrice, laCasseBuyPrice: casseBuy, laCasseSellPrice: casseSell }),
      });
      const data = await res.json();
      setRates({ standardNewPrice: newPrice, laCasseBuyPrice: casseBuy, laCasseSellPrice: casseSell }, data.id);
      toast.success("✅ السوم تم تحديثه — كل الأسعار محدّثة");
    } catch {
      toast.error("خطأ في حفظ السوم");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sticky top-0 z-50 gold-gradient shadow-xl shadow-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Title */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-stone-950" />
            <span className="text-stone-950 font-bold text-sm">السوم اليومي</span>
          </div>

          <div className="flex-1 flex items-center gap-4 flex-wrap">
            {/* New Price */}
            <RateField
              label="الجديد"
              value={editing.standardNewPrice}
              locked={ratesLocked}
              onChange={(v) => setEditing((e) => ({ ...e, standardNewPrice: v }))}
              rateValue={rates.standardNewPrice}
              color="stone-950"
            />

            <div className="w-px h-8 bg-amber-700/50" />

            {/* Casse Buy */}
            <RateField
              label="شراء كاس"
              value={editing.laCasseBuyPrice}
              locked={ratesLocked}
              onChange={(v) => setEditing((e) => ({ ...e, laCasseBuyPrice: v }))}
              rateValue={rates.laCasseBuyPrice}
              color="stone-950"
            />

            <div className="w-px h-8 bg-amber-700/50" />

            {/* Casse Sell */}
            <RateField
              label="بيع أوكازيون"
              value={editing.laCasseSellPrice}
              locked={ratesLocked}
              onChange={(v) => setEditing((e) => ({ ...e, laCasseSellPrice: v }))}
              rateValue={rates.laCasseSellPrice}
              color="stone-950"
            />
          </div>

          {/* Lock / Save controls */}
          {!ratesLocked && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 bg-stone-950/80 text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              حفظ
            </button>
          )}

          <button
            onClick={toggleRatesLock}
            className="flex items-center gap-1 bg-stone-950/40 hover:bg-stone-950/60 text-stone-900 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          >
            {ratesLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            {ratesLocked ? "تعديل السوم" : "إلغاء"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RateField({
  label,
  value,
  locked,
  onChange,
  rateValue,
  color,
}: {
  label: string;
  value: string;
  locked: boolean;
  onChange: (v: string) => void;
  rateValue: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center min-w-[120px]">
      <span className={cn("text-xs font-semibold text-stone-900/70 mb-0.5")}>{label}</span>
      {locked ? (
        <div className="text-center">
          <div className="text-stone-950 font-black text-lg leading-tight">
            {formatDZD(rateValue)}
          </div>
          <div className="text-stone-800 text-xs font-medium">
            ({formatToAlgerianCentimes(rateValue)} / غ)
          </div>
        </div>
      ) : (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 text-center bg-stone-950/30 border-2 border-stone-950/40 rounded-lg px-2 py-1 text-stone-950 font-bold text-base focus:outline-none focus:border-stone-950"
          placeholder="0"
          step="100"
        />
      )}
    </div>
  );
}

