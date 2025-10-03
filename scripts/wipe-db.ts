/*
  Database wipe script (Mongo via Prisma)

  SAFETY:
  - Requires --force or WIPE_DB_CONFIRM=YES to run
  - Deletes in dependency-safe order
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function isConfirmed(): boolean {
  const hasForceArg = process.argv.includes('--force');
  const envConfirm = process.env.WIPE_DB_CONFIRM === 'YES';
  return hasForceArg || envConfirm;
}

async function wipeDatabase(): Promise<void> {
  // Order matters due to relations
  // 1) Child records of orders/products/users/merchants
  await prisma.rating.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.subOrder.deleteMany({});

  // 2) Orders
  await prisma.order.deleteMany({});

  // 3) Merchant financials and customer joins
  await prisma.payoutTransaction.deleteMany({});
  await prisma.payoutBalance.deleteMany({});
  await prisma.merchantCustomer.deleteMany({});

  // 4) Products
  await prisma.product.deleteMany({});

  // 5) User-related ancillary models
  await prisma.passwordResetToken.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.address.deleteMany({});

  // 6) Merchants
  await prisma.merchant.deleteMany({});

  // 7) Misc independent models
  await prisma.contactMessage.deleteMany({});

  // 8) Users (last)
  await prisma.user.deleteMany({});
}

async function main() {
  if (!isConfirmed()) {
    console.error('Refusing to wipe DB without confirmation. Pass --force or set WIPE_DB_CONFIRM=YES');
    process.exit(1);
  }

  const start = Date.now();
  console.log('Wiping database...');
  try {
    await wipeDatabase();
    const ms = Date.now() - start;
    console.log(`Database wiped successfully in ${ms}ms`);
  } catch (err) {
    console.error('Wipe failed:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();


