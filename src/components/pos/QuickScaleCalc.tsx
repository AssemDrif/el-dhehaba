"use client";
// components/pos/QuickScaleCalc.tsx
// Lightning-fast weight → price calculator for walk-in inquiries

import { useState, useCallback } from "react";
import { Scale, Eraser, Copy } from "lucide-react";
import { useDhehabaStore } from "@/lib/store";
import { quickCalc, formatToAlgerianCentimes, formatDZD } from "@/lib/pricingEngine";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type CalcMode = "new" | "casse_buy" | "casse_sell";

const MODE_CONFIG: Record<CalcMode, { label: string; labelAr: string; color: string }> = {
  new:       { label: "Neuf",      labelAr: "جديد",      color: "amber" },
  casse_buy: { label: "Casse ↓",   labelAr: "شراء كاس",  color: "orange" },
  casse_sell:{ label: "Occasion ↑",labelAr: "بيع أوكازيون", color: "yellow" },
};

export function QuickScaleCalc() {
  const { rates } = useDhehabaStore();
  const [weight, setWeight] = useState("");
  const [mode, setMode] = useState<CalcMode>("new");
  const [stoneDeduction, setStoneDeduction] = useState("0");

  const netWeight = Math.max(
    0,
    parseFloat(weight || "0") - parseFloat(stoneDeduction || "0")
  );

  const result = netWeight > 0 ? quickCalc(netWeight, mode, rates) : null;

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result.centimes);
    toast.success("نُسخت قيمة السنتيم");
  }, [result]);

  const numpadKeys = ["7","8","9","4","5","6","1","2","3","","0","."];

  const handleNumpad = (key: string) => {
    if (key === "") return; // empty slot
    if (key === "." && weight.includes(".")) return;
    if (key === "." && weight === "") {
      setWeight("0.");
      return;
    }
    // max 2 decimal places
    const dotIdx = weight.indexOf(".");
    if (dotIdx !== -1 && weight.length - dotIdx > 2) return;
    setWeight((prev) => (prev === "0" && key !== "." ? key : prev + key));
  };

  return (
    <div className="card-dark p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Scale className="w-5 h-5 text-amber-400" />
        <h2 className="font-bold text-lg text-white">حاسبة الميزان السريعة</h2>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-2 bg-stone-800/50 p-1 rounded-xl">
        {(Object.entries(MODE_CONFIG) as [CalcMode, typeof MODE_CONFIG[CalcMode]][]).map(([m, cfg]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "py-2 rounded-lg text-sm font-semibold transition-all",
              mode === m
                ? cfg.color === "amber"
                  ? "bg-amber-500 text-stone-950"
                  : cfg.color === "orange"
                  ? "bg-orange-500 text-stone-950"
                  : "bg-yellow-400 text-stone-950"
                : "text-stone-400 hover:text-white"
            )}
          >
            <div className="text-xs opacity-70">{cfg.label}</div>
            <div>{cfg.labelAr}</div>
          </button>
        ))}
      </div>

      {/* Weight display */}
      <div className="bg-stone-800 rounded-xl p-4 text-left ltr">
        <div className="text-stone-400 text-xs mb-1">الوزن الصافي (غ)</div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white font-mono tracking-wider">
            {weight || "0.00"}
          </span>
          <span className="text-stone-400 text-sm">غ</span>
          {stoneDeduction && parseFloat(stoneDeduction) > 0 && (
            <span className="text-orange-400 text-sm">
              − {stoneDeduction}غ حجر = {netWeight.toFixed(2)}غ صافي
            </span>
          )}
        </div>
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2">
        {numpadKeys.map((k, i) => (
          <button
            key={i}
            onClick={() => k !== "" && handleNumpad(k)}
            className={cn(
              "h-14 rounded-xl font-bold text-xl transition-all active:scale-95",
              k === "" ? "invisible" : "bg-stone-800 hover:bg-stone-700 text-white"
            )}
          >
            {k}
          </button>
        ))}
      </div>

      {/* Backspace + Stone deduction row */}
      <div className="flex gap-2">
        <button
          onClick={() => setWeight((p) => p.slice(0, -1))}
          className="flex-1 h-10 bg-stone-800 hover:bg-red-900/40 text-red-400 rounded-xl font-bold transition-all"
        >
          ←
        </button>
        <button
          onClick={() => { setWeight(""); setStoneDeduction("0"); }}
          className="flex-1 h-10 bg-stone-800 hover:bg-stone-700 text-stone-400 rounded-xl flex items-center justify-center gap-1 transition-all"
        >
          <Eraser className="w-4 h-4" />
          <span className="text-sm">مسح</span>
        </button>
      </div>

      {/* Stone deduction */}
      <div className="flex items-center gap-2">
        <label className="text-stone-400 text-sm whitespace-nowrap">خصم الحجر (غ):</label>
        <input
          type="number"
          value={stoneDeduction}
          onChange={(e) => setStoneDeduction(e.target.value)}
          className="input-dark text-center text-sm"
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>

      {/* Result card */}
      {result ? (
        <div className="gold-gradient rounded-2xl p-4 shadow-xl shadow-amber-900/30">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-stone-950/70 text-sm font-medium mb-1">
                {netWeight.toFixed(2)} غ × {rates[mode === "new" ? "standardNewPrice" : mode === "casse_buy" ? "laCasseBuyPrice" : "laCasseSellPrice"].toLocaleString()} د.ج/غ
              </div>
              <div className="text-stone-950 font-black text-3xl leading-tight">
                {result.centimes}
              </div>
              <div className="text-stone-800 font-bold text-lg mt-1">
                {result.dzd_label}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="mt-1 bg-stone-950/20 hover:bg-stone-950/40 text-stone-950 p-2 rounded-lg transition-all"
              title="نسخ"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-stone-800/30 rounded-2xl p-4 text-center text-stone-500 text-sm">
          أدخل الوزن لحساب السعر
        </div>
      )}
    </div>
  );
}

