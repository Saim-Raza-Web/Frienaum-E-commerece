import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test user...');

  const hashed = await bcrypt.hash('testpass', 12);

  const user = await prisma.user.upsert({
    where: { email: 'merchant@store.com' },
    update: {},
    create: {
      email: 'merchant@store.com',
      password: hashed,
      name: 'Test Merchant',
      role: 'MERCHANT'
    }
  });

  console.log('Created user:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
