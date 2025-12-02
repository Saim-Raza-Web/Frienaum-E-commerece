import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking CustomerProfile records...\n');

  const profiles = await prisma.customerProfile.findMany({
    select: {
      id: true,
      userId: true,
      phone: true,
      defaultAddressId: true,
      user: {
        select: {
          email: true
        }
      }
    }
  });

  console.log('CustomerProfile records:');
  profiles.forEach((profile, index) => {
    console.log(`${index + 1}. User: ${profile.user.email}`);
    console.log(`   Phone: ${profile.phone || 'NULL'}`);
    console.log(`   DefaultAddressId: ${profile.defaultAddressId || 'NULL'}`);
    console.log('');
  });

  console.log(`Total profiles: ${profiles.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
