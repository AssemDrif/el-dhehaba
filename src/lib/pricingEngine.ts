// lib/pricingEngine.ts — El Dhehaba Pricing Engine

export interface ActiveRates {
  standardNewPrice: number;   // DZD per gram — سوم الجديد
  laCasseBuyPrice: number;    // DZD per gram — سوم شراء الكاس
  laCasseSellPrice: number;   // DZD per gram — سوم بيع الكاس
}

export interface JewelryPiece {
  condition: "NEUF" | "BONNE_OCCASION" | "CASSE_FONTE";
  netGoldWeight: number;     // grams (e.g. 6.45)
  faconPerGram: number;      // extra DZD/g markup
  faconFixed: number;        // flat craftsmanship fee
}

export interface SellingPriceResult {
  baseGoldCost: number;
  faconTotal: number;
  rawTotal: number;
  totalDZD: number;           // rounded to nearest 10 DZD
  effectivePricePerGram: number;
  centimesLabel: string;      // e.g. "14 مليون و 800 ألف"
  dzdLabel: string;           // e.g. "148,000 د.ج"
}

export interface CasseBuybackResult {
  netWeight: number;
  rawPayout: number;
  payoutDZD: number;
  centimesLabel: string;
  dzdLabel: string;
}

export interface TabdilResult {
  newItemsTotal: number;
  casseCredit: number;
  discountDZD: number;
  netPayable: number;         // positive → client pays; negative → jeweler refunds
  centimesLabel: string;
  dzdLabel: string;
}

// ─── Core Calculators ─────────────────────────────────────────────────────────

/**
 * Calculate the selling price of a jewelry piece from the showcase.
 * Uses the active daily rate (Soum) set by the owner.
 */
export function calculateItemSellingPrice(
  item: JewelryPiece,
  rates: ActiveRates
): SellingPriceResult {
  const baseRate =
    item.condition === "NEUF" ? rates.standardNewPrice : rates.laCasseSellPrice;

  const baseGoldCost = item.netGoldWeight * baseRate;
  const faconTotal =
    item.netGoldWeight * item.faconPerGram + item.faconFixed;
  const rawTotal = baseGoldCost + faconTotal;

  // Round to nearest 10 DZD (Algerian market practice)
  const totalDZD = Math.round(rawTotal / 10) * 10;
  const effectivePricePerGram = Number(
    (totalDZD / item.netGoldWeight).toFixed(2)
  );

  return {
    baseGoldCost,
    faconTotal,
    rawTotal,
    totalDZD,
    effectivePricePerGram,
    centimesLabel: formatToAlgerianCentimes(totalDZD),
    dzdLabel: formatDZD(totalDZD),
  };
}

/**
 * Calculate how much the jeweler pays for old gold (La Casse).
 * Deducts stone weight before applying the casse rate.
 */
export function calculateCasseBuyback(
  grossWeight: number,
  stoneDeductionGrams: number,
  rates: ActiveRates
): CasseBuybackResult {
  const netWeight = Math.max(
    0,
    parseFloat((grossWeight - stoneDeductionGrams).toFixed(2))
  );
  const rawPayout = netWeight * rates.laCasseBuyPrice;
  const payoutDZD = Math.round(rawPayout / 10) * 10;

  return {
    netWeight,
    rawPayout,
    payoutDZD,
    centimesLabel: formatToAlgerianCentimes(payoutDZD),
    dzdLabel: formatDZD(payoutDZD),
  };
}

/**
 * Calculate a Tabdil (Trade-in) transaction.
 * Client brings old gold → offset against new piece cost → net difference.
 */
export function calculateTabdil(
  newItemsPriceDZD: number,
  casseGrossWeight: number,
  casseStoneDeduction: number,
  discountDZD: number,
  rates: ActiveRates
): TabdilResult {
  const { payoutDZD: casseCredit } = calculateCasseBuyback(
    casseGrossWeight,
    casseStoneDeduction,
    rates
  );
  const netPayable = newItemsPriceDZD - casseCredit - discountDZD;
  const roundedNet = Math.round(netPayable / 10) * 10;

  return {
    newItemsTotal: newItemsPriceDZD,
    casseCredit,
    discountDZD,
    netPayable: roundedNet,
    centimesLabel: formatToAlgerianCentimes(Math.abs(roundedNet)),
    dzdLabel: formatDZD(Math.abs(roundedNet)),
  };
}

// ─── Formatters ───────────────────────────────────────────────────────────────

/**
 * Converts DZD into Algerian spoken Centimes (مليون / ألف).
 *   1 Malyoun centimes = 10,000 DZD
 *   1 Alf (1000 centimes) = 10 DZD
 *
 * Examples:
 *   145,500 DZD → "14 مليون و 550 ألف"
 *   80,000 DZD  → "8 مليون"
 *   5,000 DZD   → "500 ألف"
 */
export function formatToAlgerianCentimes(amountDZD: number): string {
  const abs = Math.abs(Math.round(amountDZD / 10) * 10);
  const mlayen = Math.floor(abs / 10000);
  const remainderDZD = abs % 10000;
  const alaf = Math.floor(remainderDZD / 10);

  if (mlayen > 0 && alaf > 0) {
    return `${mlayen} مليون و ${alaf} ألف`;
  } else if (mlayen > 0) {
    return `${mlayen} مليون`;
  } else if (alaf > 0) {
    return `${alaf} ألف`;
  }
  return "0";
}

/** Format as locale DZD string: 148000 → "148,000 د.ج" */
export function formatDZD(amountDZD: number): string {
  return `${amountDZD.toLocaleString("fr-DZ")} د.ج`;
}

/**
 * Quick inline calculator: weight → price (for scale reading at counter)
 */
export function quickCalc(
  weight: number,
  mode: "new" | "casse_buy" | "casse_sell",
  rates: ActiveRates
): { dzd: number; centimes: string; dzd_label: string } {
  const rate =
    mode === "new"
      ? rates.standardNewPrice
      : mode === "casse_buy"
      ? rates.laCasseBuyPrice
      : rates.laCasseSellPrice;
  const raw = weight * rate;
  const dzd = Math.round(raw / 10) * 10;
  return {
    dzd,
    centimes: formatToAlgerianCentimes(dzd),
    dzd_label: formatDZD(dzd),
  };
}

