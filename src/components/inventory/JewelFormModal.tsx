"use client";
// components/inventory/JewelFormModal.tsx
// Dynamic jewelry item creation form

import { useState } from "react";
import { X, Save, Sparkles } from "lucide-react";
import { useDhehabaStore } from "@/lib/store";
import { ORIGIN_LABELS, CATEGORY_LABELS, generateSKU, parseWeight } from "@/lib/utils";
import { calculateItemSellingPrice, formatDZD, formatToAlgerianCentimes } from "@/lib/pricingEngine";
import toast from "react-hot-toast";

interface JewelFormModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES = Object.entries(CATEGORY_LABELS);
const ORIGINS = Object.entries(ORIGIN_LABELS);

const CATEGORY_EXTRA_FIELDS: Record<string, string[]> = {
  BAGUE: ["ringSize"],
  ALLIANCE: ["ringSize"],
  BRACELET: ["bangleSize", "length"],
  COLLIER: ["length"],
  BOUCLES: [],
  PARURE: ["components"],
  DEMI_PARURE: ["components"],
  LOUISA: ["denomination"],
  OTHER: [],
};

export function JewelFormModal({ onClose, onSaved }: JewelFormModalProps) {
  const { rates } = useDhehabaStore();

  const [form, setForm] = useState({
    sku: generateSKU("BA"),
    name: "",
    category: "BAGUE",
    origin: "LOCAL",
    condition: "NEUF" as "NEUF" | "BONNE_OCCASION" | "CASSE_FONTE",
    karat: "18",
    grossWeight: "",
    stoneWeight: "0",
    faconPerGram: "0",
    faconFixed: "0",
    // Extra attributes
    ringSize: "",
    bangleSize: "",
    length: "",
    components: "",
    denomination: "",
  });

  const [saving, setSaving] = useState(false);

  const grossW = parseWeight(form.grossWeight);
  const stoneW = parseWeight(form.stoneWeight);
  const netW = Math.max(0, parseFloat((grossW - stoneW).toFixed(2)));

  const preview =
    netW > 0
      ? calculateItemSellingPrice(
          {
            condition: form.condition,
            netGoldWeight: netW,
            faconPerGram: parseFloat(form.faconPerGram) || 0,
            faconFixed: parseFloat(form.faconFixed) || 0,
          },
          rates
        )
      : null;

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("أدخل اسم القطعة"); return; }
    if (grossW <= 0) { toast.error("أدخل وزناً صحيحاً"); return; }

    setSaving(true);
    const attributes: Record<string, string> = {};
    CATEGORY_EXTRA_FIELDS[form.category].forEach((field) => {
      if (form[field as keyof typeof form]) {
        attributes[field] = form[field as keyof typeof form];
      }
    });

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: form.sku,
          name: form.name,
          category: form.category,
          origin: form.origin,
          condition: form.condition,
          karat: parseInt(form.karat),
          grossWeight: grossW,
          stoneWeight: stoneW,
          netGoldWeight: netW,
          faconPerGram: parseFloat(form.faconPerGram) || 0,
          faconFixed: parseFloat(form.faconFixed) || 0,
          attributes: Object.keys(attributes).length ? JSON.stringify(attributes) : null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "خطأ");
      }
      toast.success(`✅ تمت إضافة القطعة — ${form.sku}`);
      onSaved();
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const extraFields = CATEGORY_EXTRA_FIELDS[form.category] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card-dark w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-black text-xl text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            إضافة قطعة جديدة
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* SKU */}
          <div>
            <label className="label-sm">رمز القطعة (SKU / Étiquette)</label>
            <input className="input-dark" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
          </div>

          {/* Name */}
          <div>
            <label className="label-sm">الاسم / Désignation</label>
            <input className="input-dark" placeholder="مثال: خاتم مسمار تركي" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>

          {/* Category */}
          <div>
            <label className="label-sm">النوع / Catégorie</label>
            <select
              className="input-dark"
              value={form.category}
              onChange={(e) => {
                const cat = e.target.value;
                setForm((f) => ({ ...f, category: cat, sku: generateSKU(cat) }));
              }}
            >
              {CATEGORIES.map(([k, v]) => (
                <option key={k} value={k}>{v} — {k}</option>
              ))}
            </select>
          </div>

          {/* Origin */}
          <div>
            <label className="label-sm">المنشأ / Origine</label>
            <select className="input-dark" value={form.origin} onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}>
              {ORIGINS.map(([k, v]) => (
                <option key={k} value={k}>{v} — {k}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="label-sm">الحالة / État</label>
            <select className="input-dark" value={form.condition} onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as typeof form.condition }))}>
              <option value="NEUF">جديد — Neuf</option>
              <option value="BONNE_OCCASION">كاس مليح — Occasion</option>
              <option value="CASSE_FONTE">كاس ذوبان — Fonte</option>
            </select>
          </div>

          {/* Karat */}
          <div>
            <label className="label-sm">العيار / Karat</label>
            <select className="input-dark" value={form.karat} onChange={(e) => setForm((f) => ({ ...f, karat: e.target.value }))}>
              <option value="18">18K (750)</option>
              <option value="21">21K (875)</option>
              <option value="24">24K (999)</option>
              <option value="9">9K (375)</option>
            </select>
          </div>

          {/* Gross weight */}
          <div>
            <label className="label-sm">الوزن الإجمالي (غ)</label>
            <input type="number" className="input-dark text-center" placeholder="0.00" step="0.01" min="0" value={form.grossWeight} onChange={(e) => setForm((f) => ({ ...f, grossWeight: e.target.value }))} />
          </div>

          {/* Stone weight */}
          <div>
            <label className="label-sm">وزن الحجر / خصم (غ)</label>
            <input type="number" className="input-dark text-center" placeholder="0.00" step="0.01" min="0" value={form.stoneWeight} onChange={(e) => setForm((f) => ({ ...f, stoneWeight: e.target.value }))} />
          </div>

          {/* Facon per gram */}
          <div>
            <label className="label-sm">حق الصياغة / غ (د.ج)</label>
            <input type="number" className="input-dark text-center" placeholder="0" step="100" min="0" value={form.faconPerGram} onChange={(e) => setForm((f) => ({ ...f, faconPerGram: e.target.value }))} />
          </div>

          {/* Facon fixed */}
          <div>
            <label className="label-sm">حق ثابت للقطعة (د.ج)</label>
            <input type="number" className="input-dark text-center" placeholder="0" step="500" min="0" value={form.faconFixed} onChange={(e) => setForm((f) => ({ ...f, faconFixed: e.target.value }))} />
          </div>

          {/* Extra fields by category */}
          {extraFields.includes("ringSize") && (
            <div>
              <label className="label-sm">مقاس الخاتم / Pointure</label>
              <input type="number" className="input-dark text-center" placeholder="54" min="40" max="80" value={form.ringSize} onChange={(e) => setForm((f) => ({ ...f, ringSize: e.target.value }))} />
            </div>
          )}
          {extraFields.includes("bangleSize") && (
            <div>
              <label className="label-sm">مقاس المسيسة (مم)</label>
              <input type="number" className="input-dark text-center" placeholder="62" value={form.bangleSize} onChange={(e) => setForm((f) => ({ ...f, bangleSize: e.target.value }))} />
            </div>
          )}
          {extraFields.includes("length") && (
            <div>
              <label className="label-sm">الطول (سم)</label>
              <input type="number" className="input-dark text-center" placeholder="45" value={form.length} onChange={(e) => setForm((f) => ({ ...f, length: e.target.value }))} />
            </div>
          )}
          {extraFields.includes("components") && (
            <div>
              <label className="label-sm">مكوّنات البارير</label>
              <input className="input-dark" placeholder="خاتم + سنسلة + مناقش" value={form.components} onChange={(e) => setForm((f) => ({ ...f, components: e.target.value }))} />
            </div>
          )}
        </div>

        {/* Net weight + price preview */}
        {netW > 0 && (
          <div className="gold-gradient rounded-2xl p-4 flex items-start justify-between">
            <div>
              <div className="text-stone-950/60 text-xs mb-0.5">الوزن الصافي</div>
              <div className="text-stone-950 font-black text-2xl">{netW.toFixed(2)} غ</div>
            </div>
            {preview && (
              <div className="text-right ltr text-left">
                <div className="text-stone-950/60 text-xs mb-0.5">سعر البيع المقدّر</div>
                <div className="text-stone-950 font-black text-2xl">{preview.centimesLabel}</div>
                <div className="text-stone-800 text-sm font-bold">{preview.dzdLabel}</div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">إلغاء</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-gold flex-1 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "جارٍ الحفظ..." : "حفظ القطعة"}
          </button>
        </div>
      </div>
    </div>
  );
}

