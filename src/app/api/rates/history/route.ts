// app/api/rates/history/route.ts — Full rate history log

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const rates = await prisma.goldRateConfig.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(rates);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

