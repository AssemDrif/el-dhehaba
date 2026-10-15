// app/api/rates/route.ts — GET active rate / POST update

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — returns the active rate config
export async function GET() {
  try {
    const rate = await prisma.goldRateConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    if (!rate) {
      // Return defaults if no rate configured yet
      return NextResponse.json({
        standardNewPrice: 15200,
        laCasseBuyPrice: 13800,
        laCasseSellPrice: 14300,
        karat: 18,
      });
    }
    return NextResponse.json(rate);
  } catch (err) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

// POST — deactivate old rate, create new one (audit trail)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { standardNewPrice, laCasseBuyPrice, laCasseSellPrice, karat = 18 } = body;

    if (!standardNewPrice || !laCasseBuyPrice || !laCasseSellPrice) {
      return NextResponse.json({ error: "Missing prices" }, { status: 400 });
    }

    // Deactivate all current active rates
    await prisma.goldRateConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Create new active rate
    const newRate = await prisma.goldRateConfig.create({
      data: {
        karat,
        standardNewPrice,
        laCasseBuyPrice,
        laCasseSellPrice,
        isActive: true,
        updatedBy: "owner",
      },
    });

    return NextResponse.json(newRate, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

