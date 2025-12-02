import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for merchant users...');

  const merchants = await prisma.user.findMany({
    where: { role: 'MERCHANT' },
    select: {
      email: true,
      name: true,
      role: true
    }
  });

  if (merchants.length > 0) {
    console.log('Found merchant users:');
    merchants.forEach(merchant => {
      console.log(`- Email: ${merchant.email}`);
      console.log(`- Name: ${merchant.name}`);
      console.log(`- Role: ${merchant.role}`);
      console.log('');
    });
  } else {
    console.log('No merchant users found in database.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
