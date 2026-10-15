"use client";
// app/(dashboard)/settings/page.tsx — Rate history & settings

import { useQuery } from "@tanstack/react-query";
import { Settings2, History, TrendingUp } from "lucide-react";
import { formatDZD, formatToAlgerianCentimes } from "@/lib/pricingEngine";

type RateConfig = {
  id: string;
  karat: number;
  standardNewPrice: number;
  laCasseBuyPrice: number;
  laCasseSellPrice: number;
  updatedBy: string;
  createdAt: string;
  isActive: boolean;
};

export default function SettingsPage() {
  const { data: rates = [], isLoading } = useQuery<RateConfig[]>({
    queryKey: ["rate-history"],
    queryFn: () => fetch("/api/rates/history").then((r) => r.json()),
  });

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-amber-400" />
          الإعدادات — Paramètres
        </h1>
        <p className="text-stone-400 text-sm">سجل السوم وإعدادات النظام</p>
      </div>

      {/* Rate history */}
      <div className="card-dark p-5">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-amber-400" />
          <h2 className="font-bold text-white">سجل السوم اليومي</h2>
        </div>

        {isLoading ? (
          <div className="text-stone-400 text-sm">جارٍ التحميل...</div>
        ) : rates.length === 0 ? (
          <div className="text-stone-500 text-sm">لا يوجد سجل بعد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-stone-400 border-b border-stone-800">
                  <th className="text-right py-2 pr-0 font-medium">التاريخ</th>
                  <th className="text-center py-2 font-medium">الجديد</th>
                  <th className="text-center py-2 font-medium">شراء كاس</th>
                  <th className="text-center py-2 font-medium">بيع أوكازيون</th>
                  <th className="text-center py-2 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r) => (
                  <tr key={r.id} className="border-b border-stone-800/50 hover:bg-stone-800/30">
                    <td className="py-3 pr-0 text-stone-300 text-xs">
                      {new Date(r.createdAt).toLocaleString("fr-DZ")}
                    </td>
                    <td className="text-center py-3">
                      <div className="text-amber-400 font-bold">{r.standardNewPrice.toLocaleString()}</div>
                      <div className="text-stone-500 text-xs">{formatToAlgerianCentimes(r.standardNewPrice)}/غ</div>
                    </td>
                    <td className="text-center py-3">
                      <div className="text-orange-400 font-bold">{r.laCasseBuyPrice.toLocaleString()}</div>
                      <div className="text-stone-500 text-xs">{formatToAlgerianCentimes(r.laCasseBuyPrice)}/غ</div>
                    </td>
                    <td className="text-center py-3">
                      <div className="text-yellow-400 font-bold">{r.laCasseSellPrice.toLocaleString()}</div>
                      <div className="text-stone-500 text-xs">{formatToAlgerianCentimes(r.laCasseSellPrice)}/غ</div>
                    </td>
                    <td className="text-center py-3">
                      {r.isActive ? (
                        <span className="tag-gold text-xs">نشط</span>
                      ) : (
                        <span className="bg-stone-800 text-stone-500 text-xs px-2 py-0.5 rounded-full">قديم</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* About section */}
      <div className="card-dark p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <h2 className="font-bold text-white">حول النظام</h2>
        </div>
        <div className="text-stone-400 text-sm leading-relaxed space-y-2">
          <p>
            <span className="text-amber-400 font-semibold">El Dhehaba (الذهابة)</span> — نظام إدارة المجوهرات مصمم خصيصاً للسوق الجزائري.
          </p>
          <p>يدعم: السوم اليومي • التبديل (كاس + جديد) • صندوق الكاس • الصياغة والفاصون • عرض بالسنتيم والدينار.</p>
          <p className="text-stone-500 text-xs">مُطوَّر لأسواق الذهب بسطيف — رو دو قسنطينة • عين الفوارة</p>
        </div>
      </div>
    </div>
  );
}

