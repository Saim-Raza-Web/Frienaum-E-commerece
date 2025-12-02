import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating admin user seed...");

  // Hash password with bcrypt (12 rounds for strong security)
  const adminPass = await bcrypt.hash("Admin@12345", 12);

  // Create admin user
  await prisma.user.upsert({
    where: { email: "admin@store.com" },
    update: {},
    create: {
      email: "admin@store.com",
      password: adminPass,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  console.log("Admin user seeded successfully!");
  console.log("Email: admin@store.com");
  console.log("Password: Admin@12345");
}

main().finally(() => prisma.$disconnect());