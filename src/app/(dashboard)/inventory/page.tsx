"use client";
// app/(dashboard)/inventory/page.tsx — Inventory management

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Package, ShoppingCart, Printer, Eye, Trash2 } from "lucide-react";
import { JewelFormModal } from "@/components/inventory/JewelFormModal";
import { useDhehabaStore } from "@/lib/store";
import { calculateItemSellingPrice, formatDZD, formatToAlgerianCentimes } from "@/lib/pricingEngine";
import { ORIGIN_LABELS, CATEGORY_LABELS, CONDITION_LABELS, cn } from "@/lib/utils";
import toast from "react-hot-toast";

type JewelryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  origin: string;
  condition: "NEUF" | "BONNE_OCCASION" | "CASSE_FONTE";
  karat: number;
  grossWeight: number;
  stoneWeight: number;
  netGoldWeight: number;
  faconPerGram: number;
  faconFixed: number;
  attributes: string | null;
  inStock: boolean;
  createdAt: string;
};

export default function InventoryPage() {
  const { rates, addToCart } = useDhehabaStore();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterOrigin, setFilterOrigin] = useState("ALL");
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery<JewelryItem[]>({
    queryKey: ["inventory"],
    queryFn: () => fetch("/api/inventory").then((r) => r.json()),
  });

  const filtered = items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "ALL" || item.category === filterCategory;
    const matchOrigin = filterOrigin === "ALL" || item.origin === filterOrigin;
    return matchSearch && matchCat && matchOrigin && item.inStock;
  });

  const handleAddToCart = useCallback(
    (item: JewelryItem) => {
      const price = calculateItemSellingPrice(
        {
          condition: item.condition,
          netGoldWeight: item.netGoldWeight,
          faconPerGram: item.faconPerGram,
          faconFixed: item.faconFixed,
        },
        rates
      );
      addToCart({
        id: item.id,
        sku: item.sku,
        name: item.name,
        netGoldWeight: item.netGoldWeight,
        faconPerGram: item.faconPerGram,
        faconFixed: item.faconFixed,
        condition: item.condition,
        origin: item.origin,
        priceDZD: price.totalDZD,
      });
      toast.success(`✅ أُضيف للسلة — ${item.name}`);
    },
    [rates, addToCart]
  );

  const handleDelete = async (id: string, sku: string) => {
    if (!confirm(`هل تريد حذف القطعة ${sku}؟`)) return;
    await fetch(`/api/inventory?id=${id}`, { method: "DELETE" });
    qc.invalidateQueries({ queryKey: ["inventory"] });
    toast.success("تم الحذف");
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">المخزون — Inventaire</h1>
          <p className="text-stone-400 text-sm">{filtered.length} قطعة متاحة</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-gold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة قطعة
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            className="input-dark pr-9"
            placeholder="بحث بالاسم أو الرمز..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-dark w-auto"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="ALL">كل الأنواع</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          className="input-dark w-auto"
          value={filterOrigin}
          onChange={(e) => setFilterOrigin(e.target.value)}
        >
          <option value="ALL">كل المنشآت</option>
          {Object.entries(ORIGIN_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-stone-400">جارٍ التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <div>لا توجد قطع — أضف قطعاً من الزر أعلاه</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const price = calculateItemSellingPrice(
              {
                condition: item.condition,
                netGoldWeight: item.netGoldWeight,
                faconPerGram: item.faconPerGram,
                faconFixed: item.faconFixed,
              },
              rates
            );
            const attrs = item.attributes ? JSON.parse(item.attributes) : null;

            return (
              <div key={item.id} className="card-dark p-4 flex flex-col gap-3 group">
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="flex gap-1 flex-wrap">
                    <span className="tag-gold">{CATEGORY_LABELS[item.category] || item.category}</span>
                    <span className="tag-gold" style={{ background: "transparent" }}>
                      {ORIGIN_LABELS[item.origin] || item.origin}
                    </span>
                  </div>
                  <span className="text-stone-500 text-xs font-mono">{item.sku}</span>
                </div>

                {/* Name */}
                <div className="font-bold text-white text-base leading-tight">{item.name}</div>

                {/* Weight */}
                <div className="flex gap-3 text-xs text-stone-400">
                  <span>الإجمالي: <span className="text-white font-semibold">{item.grossWeight}غ</span></span>
                  {item.stoneWeight > 0 && (
                    <span>حجر: <span className="text-orange-400 font-semibold">−{item.stoneWeight}غ</span></span>
                  )}
                  <span>الصافي: <span className="text-amber-400 font-bold">{item.netGoldWeight}غ</span></span>
                </div>

                {/* Attrs */}
                {attrs && (
                  <div className="text-xs text-stone-500 flex gap-2 flex-wrap">
                    {Object.entries(attrs).map(([k, v]) => (
                      <span key={k} className="bg-stone-800 px-2 py-0.5 rounded-full">
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="gold-gradient rounded-xl px-3 py-2 text-center">
                  <div className="text-stone-950 font-black text-lg leading-tight">{price.centimesLabel}</div>
                  <div className="text-stone-800 text-xs font-bold">{price.dzdLabel}</div>
                  {(item.faconPerGram > 0 || item.faconFixed > 0) && (
                    <div className="text-stone-900/60 text-xs mt-0.5">
                      شامل الصياغة +{formatDZD(price.faconTotal)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="btn-gold flex-1 flex items-center justify-center gap-1 text-sm py-2"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    بيع
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.sku)}
                    className="p-2 rounded-xl border border-stone-700 text-stone-500 hover:text-red-400 hover:border-red-400/30 transition-all"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <JewelFormModal
          onClose={() => setShowModal(false)}
          onSaved={() => qc.invalidateQueries({ queryKey: ["inventory"] })}
        />
      )}
    </div>
  );
}

