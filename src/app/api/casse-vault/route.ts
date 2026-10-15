// app/api/casse-vault/route.ts — Casse Vault CRUD

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — all vault entries
export async function GET() {
  try {
    const entries = await prisma.casseVaultEntry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

// PATCH — mark entry as sent to affineur
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "No id" }, { status: 400 });

    const entry = await prisma.casseVaultEntry.update({
      where: { id },
      data: { sentToAffineur: true, sentAt: new Date() },
    });
    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

// POST — manually add a casse entry (without a transaction)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, grossWeight, stoneDeduction, netGoldWeight, appliedCasseRate } = body;

    const entry = await prisma.casseVaultEntry.create({
      data: {
        description: description || null,
        grossWeight: parseFloat(grossWeight),
        stoneDeduction: parseFloat(stoneDeduction || "0"),
        netGoldWeight: parseFloat(netGoldWeight),
        appliedCasseRate: parseFloat(appliedCasseRate),
      },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

