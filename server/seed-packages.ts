import { getDb } from "./db";
import { coinPackages } from "../drizzle/schema";
import { nanoid } from "nanoid";

async function seedPackages() {
  const db = await getDb();
  if (!db) {
    console.error("Failed to get database connection");
    return;
  }

  const packages = [
    {
      id: nanoid(),
      name: "Starter Pack",
      coins: 1000,
      bonusCoins: 0,
      price: 499, // $4.99
      popular: false,
      active: true,
      displayOrder: 1,
    },
    {
      id: nanoid(),
      name: "Value Pack",
      coins: 2500,
      bonusCoins: 250,
      price: 999, // $9.99
      popular: true,
      active: true,
      displayOrder: 2,
    },
    {
      id: nanoid(),
      name: "Pro Pack",
      coins: 5000,
      bonusCoins: 750,
      price: 1999, // $19.99
      popular: false,
      active: true,
      displayOrder: 3,
    },
    {
      id: nanoid(),
      name: "Elite Pack",
      coins: 10000,
      bonusCoins: 2000,
      price: 4999, // $49.99
      popular: false,
      active: true,
      displayOrder: 4,
    },
  ];

  for (const pkg of packages) {
    await db.insert(coinPackages).values(pkg);
  }

  console.log("✅ Seeded coin packages successfully!");
}

seedPackages().catch(console.error);
