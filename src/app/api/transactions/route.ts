// app/api/transactions/route.ts — Atomic SALE / BUY_CASSE / TABDIL commits

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — recent transactions
export async function GET() {
  try {
    const txns = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { items: { include: { jewelry: true } } },
    });
    return NextResponse.json(txns);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

// POST — create a transaction atomically
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type,                  // "SALE" | "BUY_CASSE" | "TABDIL"
      appliedNewRate,
      appliedCasseRate,
      newItemsTotalDZD,
      casseTradeInDZD,
      discountDZD,
      finalPayableDZD,
      cartItems = [],        // [{ jewelryItemId, quantity, unitPriceDZD, totalDZD }]
      casseInputs = [],      // [{ description, grossWeight, stoneDeduction, netWeight, creditDZD }]
      notes,
    } = body;

    // Prisma transaction — all-or-nothing
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create transaction header
      const txn = await tx.transaction.create({
        data: {
          type,
          appliedNewRate,
          appliedCasseRate,
          newItemsTotalDZD: newItemsTotalDZD || 0,
          casseTradeInDZD: casseTradeInDZD || 0,
          discountDZD: discountDZD || 0,
          finalPayableDZD,
          notes: notes || null,
        },
      });

      // 2. Create line items + mark sold
      for (const item of cartItems) {
        await tx.transactionItem.create({
          data: {
            transactionId: txn.id,
            jewelryItemId: item.jewelryItemId,
            quantity: item.quantity || 1,
            unitPriceDZD: item.unitPriceDZD,
            totalDZD: item.totalDZD,
          },
        });
        // Mark item as sold
        await tx.jewelryItem.update({
          where: { id: item.jewelryItemId },
          data: { inStock: false },
        });
      }

      // 3. Create casse vault entries
      for (const casse of casseInputs) {
        await tx.casseVaultEntry.create({
          data: {
            transactionId: txn.id,
            description: casse.description || null,
            grossWeight: casse.grossWeight,
            stoneDeduction: casse.stoneDeduction || 0,
            netGoldWeight: casse.netWeight,
            appliedCasseRate,
            sentToAffineur: false,
          },
        });
      }

      return txn;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
  }
}

