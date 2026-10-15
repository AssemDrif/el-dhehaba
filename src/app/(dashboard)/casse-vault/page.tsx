"use client";
// app/(dashboard)/casse-vault/page.tsx — Casse Vault (صندوق الكاس)

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Vault, TrendingDown, Send, Scale } from "lucide-react";
import { useDhehabaStore } from "@/lib/store";
import { formatDZD, formatToAlgerianCentimes } from "@/lib/pricingEngine";
import toast from "react-hot-toast";

type VaultEntry = {
  id: string;
  description: string | null;
  grossWeight: number;
  stoneDeduction: number;
  netGoldWeight: number;
  appliedCasseRate: number;
  createdAt: string;
  sentToAffineur: boolean;
  sentAt: string | null;
};

export default function CasseVaultPage() {
  const { rates } = useDhehabaStore();
  const qc = useQueryClient();

  const { data: entries = [], isLoading } = useQuery<VaultEntry[]>({
    queryKey: ["casse-vault"],
    queryFn: () => fetch("/api/casse-vault").then((r) => r.json()),
  });

  const available = entries.filter((e) => !e.sentToAffineur);
  const sent = entries.filter((e) => e.sentToAffineur);

  const totalNetWeight = available.reduce((s, e) => s + e.netGoldWeight, 0);
  const estimatedValue = totalNetWeight * rates.laCasseBuyPrice;
  const estimatedValueRounded = Math.round(estimatedValue / 10) * 10;

  const sendMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/casse-vault?id=${id}`, { method: "PATCH" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["casse-vault"] });
      toast.success("✅ تم إرسال الكاس للأفينير");
    },
  });

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Vault className="w-6 h-6 text-amber-400" />
          صندوق الكاس
        </h1>
        <p className="text-stone-400 text-sm">Coffre de la Casse — ذهب متراكم للذوبان</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-dark p-5 text-center">
          <Scale className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <div className="text-stone-400 text-xs mb-1">الوزن الصافي المتاح</div>
          <div className="text-white font-black text-3xl">{totalNetWeight.toFixed(2)}</div>
          <div className="text-stone-400 text-sm">غرام</div>
        </div>

        <div className="gold-gradient rounded-2xl p-5 text-center">
          <TrendingDown className="w-6 h-6 text-stone-950/70 mx-auto mb-2" />
          <div className="text-stone-950/70 text-xs mb-1">القيمة التقديرية</div>
          <div className="text-stone-950 font-black text-2xl leading-tight">
            {formatToAlgerianCentimes(estimatedValueRounded)}
          </div>
          <div className="text-stone-800 text-sm font-bold">{formatDZD(estimatedValueRounded)}</div>
          <div className="text-stone-900/50 text-xs mt-1">
            بسعر {rates.laCasseBuyPrice.toLocaleString()} د.ج/غ
          </div>
        </div>

        <div className="card-dark p-5 text-center">
          <Send className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-stone-400 text-xs mb-1">أُرسل للأفينير</div>
          <div className="text-white font-black text-3xl">{sent.length}</div>
          <div className="text-stone-400 text-sm">دفعة</div>
        </div>
      </div>

      {/* Progress bar toward 200g threshold */}
      <div className="card-dark p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-stone-400">تراكم الكاس نحو عتبة الذوبان (200غ)</span>
          <span className="text-amber-400 font-bold">{Math.min(100, (totalNetWeight / 200) * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-stone-800 rounded-full h-3 overflow-hidden">
          <div
            className="gold-gradient h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (totalNetWeight / 200) * 100)}%` }}
          />
        </div>
        <div className="text-stone-500 text-xs mt-1.5">
          {totalNetWeight.toFixed(2)}غ / 200غ
          {totalNetWeight >= 200
            ? " — ✅ جاهز للإرسال للأفينير!"
            : ` — يحتاج ${(200 - totalNetWeight).toFixed(2)}غ إضافية`}
        </div>
      </div>

      {/* Available entries */}
      <div>
        <h2 className="font-bold text-white mb-3">
          الكاس المتاح ({available.length} قطعة)
        </h2>
        {isLoading ? (
          <div className="text-stone-400 text-sm">جارٍ التحميل...</div>
        ) : available.length === 0 ? (
          <div className="card-dark p-8 text-center text-stone-500 text-sm">
            لا توجد كاس متراكمة بعد
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {available.map((entry) => (
              <div
                key={entry.id}
                className="card-dark px-4 py-3 flex items-center gap-4 flex-wrap"
              >
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">
                    {entry.description || "كاس"}
                  </div>
                  <div className="text-stone-400 text-xs">
                    {new Date(entry.createdAt).toLocaleDateString("fr-DZ")} —
                    إجمالي: {entry.grossWeight}غ
                    {entry.stoneDeduction > 0 ? ` (خصم حجر: ${entry.stoneDeduction}غ)` : ""}
                    → صافي: <span className="text-amber-400 font-bold">{entry.netGoldWeight}غ</span>
                  </div>
                </div>
                <div className="text-left ltr">
                  <div className="text-amber-400 font-bold text-sm">
                    {formatDZD(Math.round((entry.netGoldWeight * entry.appliedCasseRate) / 10) * 10)}
                  </div>
                  <div className="text-stone-500 text-xs">
                    @ {entry.appliedCasseRate.toLocaleString()} د.ج/غ
                  </div>
                </div>
                <button
                  onClick={() => sendMutation.mutate(entry.id)}
                  className="btn-ghost text-xs flex items-center gap-1 py-1.5"
                >
                  <Send className="w-3 h-3" />
                  أُرسل للأفينير
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sent history */}
      {sent.length > 0 && (
        <div>
          <h2 className="font-bold text-stone-400 mb-3">سجل الإرسال ({sent.length})</h2>
          <div className="flex flex-col gap-2">
            {sent.map((entry) => (
              <div key={entry.id} className="card-dark px-4 py-2 flex items-center gap-4 opacity-50">
                <div className="flex-1 text-stone-400 text-sm">
                  {entry.description || "كاس"} — {entry.netGoldWeight}غ
                </div>
                <div className="text-green-400 text-xs">
                  ✅ أُرسل {entry.sentAt ? new Date(entry.sentAt).toLocaleDateString("fr-DZ") : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

