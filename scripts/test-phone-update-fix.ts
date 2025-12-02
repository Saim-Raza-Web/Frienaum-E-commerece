import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing phone update fix...\n');

  // Find a user (let's use the admin user we created)
  const user = await prisma.user.findUnique({
    where: { email: 'admin@store.com' },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      customerProfile: {
        select: {
          phone: true
        }
      }
    }
  });

  if (!user) {
    console.log('Admin user not found, creating one...');
    const hashedPass = await import('bcryptjs').then(bcrypt => bcrypt.hash('Admin@12345', 12));

    await prisma.user.create({
      data: {
        email: 'admin@store.com',
        password: hashedPass,
        name: 'Admin User',
        role: 'ADMIN'
      }
    });

    return main(); // Retry
  }

  console.log('Before update:');
  console.log(`User: ${user.email}`);
  console.log(`User.phone: ${user.phone || 'NULL'}`);
  console.log(`CustomerProfile.phone: ${user.customerProfile?.phone || 'NULL (no profile)'}`);
  console.log('');

  // Simulate API update with phone
  const phoneUpdate = '+92 300 1234567';
  console.log(`Updating phone to: ${phoneUpdate}`);

  // Update user phone
  await prisma.user.update({
    where: { id: user.id },
    data: { phone: phoneUpdate }
  });

  // Update or create customer profile
  const existingProfile = await prisma.customerProfile.findUnique({
    where: { userId: user.id }
  });

  if (existingProfile) {
    await prisma.customerProfile.update({
      where: { userId: user.id },
      data: { phone: phoneUpdate }
    });
  } else {
    await prisma.customerProfile.create({
      data: {
        userId: user.id,
        phone: phoneUpdate
      }
    });
  }

  // Check after update
  const updatedUser = await prisma.user.findUnique({
    where: { email: 'admin@store.com' },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      customerProfile: {
        select: {
          phone: true
        }
      }
    }
  });

  console.log('\nAfter update:');
  console.log(`User: ${updatedUser?.email}`);
  console.log(`User.phone: ${updatedUser?.phone || 'NULL'}`);
  console.log(`CustomerProfile.phone: ${updatedUser?.customerProfile?.phone || 'NULL (no profile)'}`);

  if (updatedUser?.phone === phoneUpdate && updatedUser?.customerProfile?.phone === phoneUpdate) {
    console.log('\n✅ SUCCESS: Phone updated in both User and CustomerProfile tables!');
  } else {
    console.log('\n❌ FAILED: Phone not updated correctly');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
