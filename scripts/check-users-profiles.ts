import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking users and their customer profiles...\n');

  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      customerProfile: {
        select: {
          phone: true
        }
      }
    }
  });

  console.log('Users and their phone data:');
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email} (${user.role})`);
    console.log(`   User.phone: ${user.phone || 'NULL'}`);
    console.log(`   CustomerProfile.phone: ${user.customerProfile?.phone || 'NULL (no profile)'}`);
    console.log('');
  });

  // Count users without customer profiles
  const usersWithoutProfiles = users.filter(user => !user.customerProfile);
  console.log(`Total users: ${users.length}`);
  console.log(`Users without CustomerProfile: ${usersWithoutProfiles.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
