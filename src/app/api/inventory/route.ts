// app/api/inventory/route.ts — CRUD for jewelry items

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — list all in-stock items (or filter by query)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const origin = searchParams.get("origin");
    const inStockOnly = searchParams.get("inStock") !== "false";

    const items = await prisma.jewelryItem.findMany({
      where: {
        ...(inStockOnly && { inStock: true }),
        ...(category && category !== "ALL" && { category: category as never }),
        ...(origin && origin !== "ALL" && { origin: origin as never }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

// POST — create a new jewelry item
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sku, name, category, origin, condition, karat,
      grossWeight, stoneWeight, netGoldWeight,
      faconPerGram, faconFixed, attributes,
    } = body;

    if (!sku || !name || !category || grossWeight === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check SKU uniqueness
    const existing = await prisma.jewelryItem.findUnique({ where: { sku } });
    if (existing) {
      return NextResponse.json({ error: `رمز ${sku} مستخدم مسبقاً` }, { status: 409 });
    }

    const item = await prisma.jewelryItem.create({
      data: {
        sku,
        name,
        category,
        origin: origin || "LOCAL",
        condition: condition || "NEUF",
        karat: karat || 18,
        grossWeight: parseFloat(grossWeight),
        stoneWeight: parseFloat(stoneWeight || "0"),
        netGoldWeight: parseFloat(netGoldWeight),
        faconPerGram: parseFloat(faconPerGram || "0"),
        faconFixed: parseFloat(faconFixed || "0"),
        attributes: attributes || null,
        inStock: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

// DELETE — soft-delete (mark inStock=false)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "No id" }, { status: 400 });

    await prisma.jewelryItem.update({
      where: { id },
      data: { inStock: false },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

