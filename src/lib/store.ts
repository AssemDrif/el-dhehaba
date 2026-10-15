// lib/store.ts — Zustand global state for El Dhehaba

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ActiveRates } from "./pricingEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  sku: string;
  name: string;
  netGoldWeight: number;
  faconPerGram: number;
  faconFixed: number;
  condition: "NEUF" | "BONNE_OCCASION" | "CASSE_FONTE";
  origin: string;
  priceDZD: number;
}

export interface CasseInput {
  description: string;
  grossWeight: number;
  stoneDeduction: number;
  netWeight: number;
  creditDZD: number;
}

interface DhehabaStore {
  // ── Rates ──────────────────────────────────────────────────────────────────
  rates: ActiveRates;
  ratesLocked: boolean;
  rateConfigId: string | null;
  setRates: (r: ActiveRates, id?: string) => void;
  toggleRatesLock: () => void;

  // ── Cart (new items going out) ─────────────────────────────────────────────
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

  // ── Casse inputs (old gold coming in) ────────────────────────────────────
  casseInputs: CasseInput[];
  addCasseInput: (c: CasseInput) => void;
  removeCasseInput: (index: number) => void;
  clearCasse: () => void;

  // ── Discount (مساعدة / bargaining) ─────────────────────────────────────
  discountDZD: number;
  setDiscount: (d: number) => void;

  // ── UI state ───────────────────────────────────────────────────────────────
  posMode: "SALE" | "BUY_CASSE" | "TABDIL";
  setPosMode: (m: "SALE" | "BUY_CASSE" | "TABDIL") => void;
}

export const useDhehabaStore = create<DhehabaStore>()(
  persist(
    (set) => ({
      // Defaults — owner must set real rates on first launch
      rates: {
        standardNewPrice: 15200,
        laCasseBuyPrice: 13800,
        laCasseSellPrice: 14300,
      },
      ratesLocked: true,
      rateConfigId: null,

      setRates: (r, id) =>
        set({ rates: r, ratesLocked: true, rateConfigId: id ?? null }),
      toggleRatesLock: () =>
        set((s) => ({ ratesLocked: !s.ratesLocked })),

      cart: [],
      addToCart: (item) => set((s) => ({ cart: [...s.cart, item] })),
      removeFromCart: (id) =>
        set((s) => ({ cart: s.cart.filter((i) => i.id !== id) })),
      clearCart: () => set({ cart: [] }),

      casseInputs: [],
      addCasseInput: (c) =>
        set((s) => ({ casseInputs: [...s.casseInputs, c] })),
      removeCasseInput: (index) =>
        set((s) => ({
          casseInputs: s.casseInputs.filter((_, i) => i !== index),
        })),
      clearCasse: () => set({ casseInputs: [] }),

      discountDZD: 0,
      setDiscount: (d) => set({ discountDZD: d }),

      posMode: "SALE",
      setPosMode: (m) => set({ posMode: m }),
    }),
    { name: "dhehaba-store" }
  )
);

