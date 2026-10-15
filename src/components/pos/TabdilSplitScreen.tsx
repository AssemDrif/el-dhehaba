"use client";
// components/pos/TabdilSplitScreen.tsx
// Unified Tabdil (Trade-in) workflow: Left = New gold out | Right = Casse in | Bottom = Net

import { useState } from "react";
import { Plus, Trash2, ArrowLeftRight, CheckCircle2, ShoppingBag, Coins } from "lucide-react";
import { useDhehabaStore } from "@/lib/store";
import {
  calculateItemSellingPrice,
  calculateCasseBuyback,
  formatDZD,
  formatToAlgerianCentimes,
} from "@/lib/pricingEngine";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function TabdilSplitScreen() {
  const {
    rates,
    cart,
    removeFromCart,
    clearCart,
    casseInputs,
    addCasseInput,
    removeCasseInput,
    clearCasse,
    discountDZD,
    setDiscount,
    posMode,
  } = useDhehabaStore();

  // New casse input form state
  const [casseForm, setCasseForm] = useState({
    description: "",
    grossWeight: "",
    stoneDeduction: "0",
  });

  const [submitting, setSubmitting] = useState(false);

  // ── Totals ─────────────────────────────────────────────────────────────────
  const newItemsTotal = cart.reduce((sum, item) => sum + item.priceDZD, 0);
  const casseCredit = casseInputs.reduce((sum, c) => sum + c.creditDZD, 0);
  const netPayable = newItemsTotal - casseCredit - discountDZD;

  // ── Add casse ──────────────────────────────────────────────────────────────
  const handleAddCasse = () => {
    const gross = parseFloat(casseForm.grossWeight);
    const stone = parseFloat(casseForm.stoneDeduction || "0");
    if (isNaN(gross) || gross <= 0) {
      toast.error("أدخل وزناً صحيحاً");
      return;
    }
    const { netWeight, payoutDZD, centimesLabel } = calculateCasseBuyback(
      gross,
      stone,
      rates
    );
    addCasseInput({
      description: casseForm.description || "كاس",
      grossWeight: gross,
      stoneDeduction: stone,
      netWeight,
      creditDZD: payoutDZD,
    });
    setCasseForm({ description: "", grossWeight: "", stoneDeduction: "0" });
    toast.success(`✅ تمت إضافة الكاس — ${centimesLabel}`);
  };

  // ── Complete transaction ───────────────────────────────────────────────────
  const handleComplete = async () => {
    if (posMode === "SALE" && cart.length === 0) {
      toast.error("أضف قطعاً إلى السلة أولاً");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        type: posMode,
        appliedNewRate: rates.standardNewPrice,
        appliedCasseRate: rates.laCasseBuyPrice,
        newItemsTotalDZD: newItemsTotal,
        casseTradeInDZD: casseCredit,
        discountDZD,
        finalPayableDZD: Math.abs(netPayable),
        cartItems: cart.map((i) => ({
          jewelryItemId: i.id,
          quantity: 1,
          unitPriceDZD: i.priceDZD,
          totalDZD: i.priceDZD,
        })),
        casseInputs,
      };
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("فشل الحفظ");
      clearCart();
      clearCasse();
      setDiscount(0);
      toast.success(
        `✅ المعاملة مكتملة — ${netPayable >= 0 ? "يدفع" : "يستلم"} العميل ${formatToAlgerianCentimes(Math.abs(netPayable))}`
      );
    } catch {
      toast.error("حدث خطأ — حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Left: New Gold Out ────────────────────────────────────────────── */}
        <div className="card-dark p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white">الذهب الجديد (للعميل)</h3>
            <span className="mr-auto tag-gold">{cart.length} قطعة</span>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-sm">
              ابحث عن قطعة من المخزون وأضفها للسلة
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-stone-800/50 rounded-xl px-3 py-2"
                >
                  <div>
                    <div className="text-white text-sm font-semibold">{item.name}</div>
                    <div className="text-stone-400 text-xs">
                      {item.netGoldWeight}غ | {item.sku}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-amber-400 font-bold text-sm text-left ltr">
                      {formatDZD(item.priceDZD)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {newItemsTotal > 0 && (
            <div className="mt-auto pt-2 border-t border-stone-800">
              <div className="flex justify-between items-baseline">
                <span className="text-stone-400 text-sm">إجمالي الجديد</span>
                <div className="text-left ltr">
                  <div className="text-white font-bold">{formatDZD(newItemsTotal)}</div>
                  <div className="text-amber-400 text-xs">{formatToAlgerianCentimes(newItemsTotal)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Casse In ────────────────────────────────────────────────── */}
        <div className="card-dark p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-white">الكاس (من العميل)</h3>
            <span className="mr-auto tag-casse">{casseInputs.length} قطعة</span>
          </div>

          {/* Add casse form */}
          <div className="bg-stone-800/30 rounded-xl p-3 flex flex-col gap-2">
            <input
              className="input-dark text-sm"
              placeholder="وصف (اختياري) — مثال: خاتم قديم"
              value={casseForm.description}
              onChange={(e) => setCasseForm((f) => ({ ...f, description: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label-sm">الوزن الإجمالي (غ)</label>
                <input
                  type="number"
                  className="input-dark text-sm text-center"
                  placeholder="0.00"
                  step="0.01"
                  value={casseForm.grossWeight}
                  onChange={(e) => setCasseForm((f) => ({ ...f, grossWeight: e.target.value }))}
                />
              </div>
              <div>
                <label className="label-sm">خصم الحجر (غ)</label>
                <input
                  type="number"
                  className="input-dark text-sm text-center"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={casseForm.stoneDeduction}
                  onChange={(e) => setCasseForm((f) => ({ ...f, stoneDeduction: e.target.value }))}
                />
              </div>
            </div>
            <button onClick={handleAddCasse} className="btn-gold flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              إضافة كاس
            </button>
          </div>

          {/* Casse list */}
          {casseInputs.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-orange-500/5 border border-orange-500/10 rounded-xl px-3 py-2"
            >
              <div>
                <div className="text-white text-sm font-semibold">{c.description}</div>
                <div className="text-stone-400 text-xs">
                  {c.grossWeight}غ {c.stoneDeduction > 0 ? `− ${c.stoneDeduction}غ حجر` : ""} = {c.netWeight}غ صافي
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-orange-400 font-bold text-sm text-left ltr">
                  {formatDZD(c.creditDZD)}
                </div>
                <button
                  onClick={() => removeCasseInput(i)}
                  className="text-stone-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {casseCredit > 0 && (
            <div className="mt-auto pt-2 border-t border-stone-800">
              <div className="flex justify-between items-baseline">
                <span className="text-stone-400 text-sm">قيمة الكاس</span>
                <div className="text-left ltr">
                  <div className="text-orange-400 font-bold">{formatDZD(casseCredit)}</div>
                  <div className="text-orange-300 text-xs">{formatToAlgerianCentimes(casseCredit)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Net Summary Bar ─────────────────────────────────────────────────── */}
      <div className="card-dark p-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          {/* New total */}
          <SummaryCell label="الجديد" value={newItemsTotal} color="amber" />

          {/* Casse credit */}
          <SummaryCell label="خصم الكاس" value={-casseCredit} color="orange" prefix="−" />

          {/* Discount */}
          <div>
            <label className="label-sm">المساعدة (تخفيض) د.ج</label>
            <input
              type="number"
              className="input-dark text-center"
              value={discountDZD || ""}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              placeholder="0"
              step="500"
              min="0"
            />
          </div>

          {/* Net payable */}
          <div
            className={cn(
              "rounded-2xl p-4 text-center",
              netPayable >= 0 ? "gold-gradient" : "bg-green-600"
            )}
          >
            <div className="text-stone-950/70 text-xs font-medium mb-1">
              {netPayable >= 0 ? "يدفع العميل" : "نرد للعميل"}
            </div>
            <div className="text-stone-950 font-black text-2xl leading-tight">
              {formatToAlgerianCentimes(Math.abs(netPayable))}
            </div>
            <div className="text-stone-800 text-sm font-bold">
              {formatDZD(Math.abs(netPayable))}
            </div>
          </div>
        </div>

        {/* Complete button */}
        <button
          onClick={handleComplete}
          disabled={submitting || (cart.length === 0 && casseInputs.length === 0)}
          className={cn(
            "mt-4 w-full py-4 rounded-2xl font-black text-xl transition-all active:scale-98 flex items-center justify-center gap-2",
            submitting || (cart.length === 0 && casseInputs.length === 0)
              ? "bg-stone-700 text-stone-500 cursor-not-allowed"
              : "gold-gradient text-stone-950 hover:shadow-xl hover:shadow-amber-900/30"
          )}
        >
          <CheckCircle2 className="w-6 h-6" />
          {submitting ? "جارٍ الحفظ..." : "تأكيد المعاملة"}
        </button>
      </div>
    </div>
  );
}

function SummaryCell({
  label,
  value,
  color,
  prefix = "",
}: {
  label: string;
  value: number;
  color: "amber" | "orange" | "green";
  prefix?: string;
}) {
  const colorClass =
    color === "amber"
      ? "text-amber-400"
      : color === "orange"
      ? "text-orange-400"
      : "text-green-400";

  return (
    <div>
      <div className="label-sm">{label}</div>
      <div className={cn("font-bold text-lg ltr", colorClass)}>
        {prefix}{formatDZD(Math.abs(value))}
      </div>
      <div className="text-stone-500 text-xs ltr">
        {prefix}{formatToAlgerianCentimes(Math.abs(value))}
      </div>
    </div>
  );
}

