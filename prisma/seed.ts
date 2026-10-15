// prisma/seed.ts — Seed demo data for El Dhehaba

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding El Dhehaba database...");

  // 1. Active rate config
  await prisma.goldRateConfig.create({
    data: {
      karat: 18,
      standardNewPrice: 15200,
      laCasseBuyPrice: 13800,
      laCasseSellPrice: 14300,
      isActive: true,
      updatedBy: "owner",
    },
  });
  console.log("✅ Rate config created: 15,200 / 13,800 / 14,300 DZD/g");

  // 2. Sample inventory
  const items = [
    {
      sku: "BA-1001",
      name: "خاتم مسمار تركي",
      category: "BAGUE",
      origin: "TURKISH",
      condition: "NEUF",
      karat: 18,
      grossWeight: 5.80,
      stoneWeight: 0,
      netGoldWeight: 5.80,
      faconPerGram: 1500,
      faconFixed: 0,
      attributes: JSON.stringify({ ringSize: 54 }),
    },
    {
      sku: "BA-1002",
      name: "خاتم إيطالي فليغران",
      category: "BAGUE",
      origin: "ITALIAN",
      condition: "NEUF",
      karat: 18,
      grossWeight: 3.45,
      stoneWeight: 0.20,
      netGoldWeight: 3.25,
      faconPerGram: 2500,
      faconFixed: 0,
      attributes: JSON.stringify({ ringSize: 56, stones: "Zircon" }),
    },
    {
      sku: "BR-2001",
      name: "براسلي محلي مسيسة",
      category: "BRACELET",
      origin: "LOCAL",
      condition: "NEUF",
      karat: 18,
      grossWeight: 14.20,
      stoneWeight: 0,
      netGoldWeight: 14.20,
      faconPerGram: 500,
      faconFixed: 0,
      attributes: JSON.stringify({ bangleSize: 62 }),
    },
    {
      sku: "SN-3001",
      name: "سنسلة كارتييه 45سم",
      category: "COLLIER",
      origin: "TURKISH",
      condition: "NEUF",
      karat: 18,
      grossWeight: 8.65,
      stoneWeight: 0,
      netGoldWeight: 8.65,
      faconPerGram: 1000,
      faconFixed: 0,
      attributes: JSON.stringify({ length: "45" }),
    },
    {
      sku: "PA-4001",
      name: "بارير كامل 3 قطع",
      category: "PARURE",
      origin: "TURKISH",
      condition: "NEUF",
      karat: 18,
      grossWeight: 28.50,
      stoneWeight: 1.20,
      netGoldWeight: 27.30,
      faconPerGram: 1200,
      faconFixed: 5000,
      attributes: JSON.stringify({ components: "خاتم + سنسلة + مناقش", stones: "Zircon" }),
    },
    {
      sku: "MH-5001",
      name: "محبس عادي",
      category: "ALLIANCE",
      origin: "LOCAL",
      condition: "NEUF",
      karat: 18,
      grossWeight: 4.10,
      stoneWeight: 0,
      netGoldWeight: 4.10,
      faconPerGram: 300,
      faconFixed: 0,
      attributes: JSON.stringify({ ringSize: 60 }),
    },
    {
      sku: "OK-6001",
      name: "سنسلة أوكازيون — كاس مليح",
      category: "COLLIER",
      origin: "LOCAL",
      condition: "BONNE_OCCASION",
      karat: 18,
      grossWeight: 6.80,
      stoneWeight: 0,
      netGoldWeight: 6.80,
      faconPerGram: 0,
      faconFixed: 0,
      attributes: null,
    },
  ];

  for (const item of items) {
    await prisma.jewelryItem.create({ data: item });
  }
  console.log(`✅ ${items.length} jewelry items created`);

  // 3. Sample casse vault entry
  await prisma.casseVaultEntry.create({
    data: {
      description: "كاس مجموعة الأسبوع الماضي",
      grossWeight: 45.30,
      stoneDeduction: 2.10,
      netGoldWeight: 43.20,
      appliedCasseRate: 13800,
      sentToAffineur: false,
    },
  });
  console.log("✅ Casse vault entry created: 43.20g صافي");

  console.log("\n🟡 El Dhehaba seeded successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

