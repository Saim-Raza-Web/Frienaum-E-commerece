import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMerchantsMissingUsers() {
  try {
    console.log('Finding and fixing merchants with missing users...');
    
    // First, get all merchants without including user (to avoid the error)
    const merchants = await prisma.merchant.findMany({
      select: {
        id: true,
        userId: true,
        storeName: true
      }
    });
    
    console.log(`Found ${merchants.length} merchants`);
    
    // Get all existing users
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });
    
    const existingUserIds = new Set(users.map(u => u.id));
    console.log(`Found ${users.length} users`);
    
    // Find merchants with missing users
    const merchantsWithMissingUsers = merchants.filter(m => !existingUserIds.has(m.userId));
    
    console.log(`Found ${merchantsWithMissingUsers.length} merchants with missing users:`);
    merchantsWithMissingUsers.forEach(m => {
      console.log(`  - Merchant: ${m.storeName} (ID: ${m.id}, UserId: ${m.userId})`);
    });
    
    if (merchantsWithMissingUsers.length > 0) {
      const merchantIds = merchantsWithMissingUsers.map(m => m.id);
      
      console.log('Deleting merchants with missing users...');
      const deleteResult = await prisma.merchant.deleteMany({
        where: {
          id: {
            in: merchantIds
          }
        }
      });
      
      console.log(`Successfully deleted ${deleteResult.count} merchants with missing users`);
    } else {
      console.log('No merchants with missing users found');
    }
    
    // Now test the products API query
    console.log('\nTesting products API query...');
    const products = await prisma.product.findMany({
      include: {
        merchant: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Successfully fetched ${products.length} products with merchant data`);
    
    const validProducts = products.filter(p => p.merchant && p.merchant.user);
    console.log(`Valid products: ${validProducts.length}`);
    
    if (validProducts.length < products.length) {
      const invalidCount = products.length - validProducts.length;
      console.log(`Warning: ${invalidCount} products still have invalid merchant data`);
    }
    
    console.log('Fix completed successfully!');
    
  } catch (error) {
    console.error('Error fixing merchants with missing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMerchantsMissingUsers();
