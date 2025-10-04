import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugMerchantUser() {
  try {
    console.log('Debugging merchant-user relationships...');
    
    // Check all merchants and their users
    const merchants = await prisma.merchant.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    console.log(`Found ${merchants.length} merchants`);
    
    merchants.forEach((merchant, index) => {
      console.log(`Merchant ${index + 1}:`);
      console.log(`  - ID: ${merchant.id}`);
      console.log(`  - Store Name: ${merchant.storeName}`);
      console.log(`  - User ID: ${merchant.userId}`);
      console.log(`  - User: ${merchant.user ? `${merchant.user.name} (${merchant.user.email})` : 'NULL'}`);
      console.log('');
    });
    
    // Check for merchants with null users
    const merchantsWithNullUsers = merchants.filter(m => !m.user);
    console.log(`Merchants with null users: ${merchantsWithNullUsers.length}`);
    
    if (merchantsWithNullUsers.length > 0) {
      console.log('Merchants with null users:');
      merchantsWithNullUsers.forEach(m => {
        console.log(`  - Merchant ID: ${m.id}, User ID: ${m.userId}`);
      });
    }
    
    // Check if there are users that don't exist
    const allUserIds = merchants.map(m => m.userId);
    const existingUsers = await prisma.user.findMany({
      where: {
        id: {
          in: allUserIds
        }
      },
      select: { id: true, name: true, email: true }
    });
    
    const existingUserIds = new Set(existingUsers.map(u => u.id));
    const missingUsers = allUserIds.filter(id => !existingUserIds.has(id));
    
    console.log(`Missing users: ${missingUsers.length}`);
    if (missingUsers.length > 0) {
      console.log('Missing user IDs:', missingUsers);
    }
    
  } catch (error) {
    console.error('Error debugging merchant-user relationships:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugMerchantUser();
