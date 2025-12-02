import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing phone update for user without CustomerProfile...\n');

  // Find a user without CustomerProfile (like merchant@store.com)
  const user = await prisma.user.findFirst({
    where: {
      email: 'merchant@store.com'
    },
    select: {
      id: true,
      email: true,
      customerProfile: true
    }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('Before update:');
  console.log(`User: ${user.email}`);
  console.log(`Has CustomerProfile: ${!!user.customerProfile}`);

  // Simulate the API logic
  const phone = '+92 300 1234567'; // Test phone number

  console.log(`\nUpdating phone to: ${phone}`);

  // This is the logic from the API
  if (phone !== undefined) {
    const phoneValue = phone && phone.trim() ? phone.trim() : null;

    const existingProfile = await prisma.customerProfile.findUnique({
      where: { userId: user.id }
    });

    if (existingProfile) {
      // Update existing profile
      if (phoneValue) {
        // If there's phone data, update it
        await prisma.customerProfile.update({
          where: { userId: user.id },
          data: { phone: phoneValue }
        });
      } else {
        // If phone is empty/null, check if profile has other data
        // For now, just update to null (we can delete later if needed)
        await prisma.customerProfile.update({
          where: { userId: user.id },
          data: { phone: null }
        });
      }
    } else if (phoneValue) {
      // Only create profile if there's actual phone data
      await prisma.customerProfile.create({
        data: {
          userId: user.id,
          phone: phoneValue
        }
      });
    }
  }

  // Check after update
  const updatedUser = await prisma.user.findFirst({
    where: {
      email: 'merchant@store.com'
    },
    select: {
      id: true,
      email: true,
      customerProfile: {
        select: {
          phone: true
        }
      }
    }
  });

  console.log('\nAfter update:');
  console.log(`User: ${updatedUser?.email}`);
  console.log(`CustomerProfile exists: ${!!updatedUser?.customerProfile}`);
  console.log(`Phone: ${updatedUser?.customerProfile?.phone}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
