// lib/utils.ts — shared utility helpers

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ORIGIN_LABELS: Record<string, string> = {
  LOCAL: "محلي",
  TURKISH: "تركي",
  ITALIAN: "إيطالي",
  IMPORTED: "مستورد",
};

export const CATEGORY_LABELS: Record<string, string> = {
  BAGUE: "خاتم",
  ALLIANCE: "محبس",
  BRACELET: "براسلي",
  COLLIER: "سنسلة",
  BOUCLES: "مناقش",
  PARURE: "بارير",
  DEMI_PARURE: "دومي بارير",
  LOUISA: "لويزة",
  OTHER: "أخرى",
};

export const CONDITION_LABELS: Record<string, string> = {
  NEUF: "جديد",
  BONNE_OCCASION: "كاس مليح",
  CASSE_FONTE: "كاس ذوبان",
};

export function parseWeight(val: string): number {
  const parsed = parseFloat(val.replace(",", "."));
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

export function generateSKU(category: string): string {
  const prefix = category.slice(0, 2).toUpperCase();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

