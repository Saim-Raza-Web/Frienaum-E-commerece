import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking admin user...');

  const admin = await prisma.user.findUnique({
    where: { email: 'admin@store.com' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  });

  if (admin) {
    console.log('✅ Admin user found:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Created: ${admin.createdAt}`);
  } else {
    console.log('❌ Admin user not found');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
