import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensiveCleanup() {
  try {
    console.log('Starting comprehensive cleanup...');
    
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
      // Delete related data first, then merchants
      for (const merchant of merchantsWithMissingUsers) {
        console.log(`Cleaning up merchant: ${merchant.storeName} (${merchant.id})`);
        
        try {
          // Delete MerchantCustomer records
          const merchantCustomers = await prisma.merchantCustomer.deleteMany({
            where: { merchantId: merchant.id }
          });
          console.log(`  - Deleted ${merchantCustomers.count} merchant customer records`);
          
          // Delete PayoutBalance
          const payoutBalance = await prisma.payoutBalance.deleteMany({
            where: { merchantId: merchant.id }
          });
          console.log(`  - Deleted ${payoutBalance.count} payout balance records`);
          
          // Delete PayoutTransaction records
          const payoutTransactions = await prisma.payoutTransaction.deleteMany({
            where: { merchantId: merchant.id }
          });
          console.log(`  - Deleted ${payoutTransactions.count} payout transaction records`);
          
          // Delete SubOrder records
          const subOrders = await prisma.subOrder.deleteMany({
            where: { merchantId: merchant.id }
          });
          console.log(`  - Deleted ${subOrders.count} sub order records`);
          
          // Delete Order records
          const orders = await prisma.order.deleteMany({
            where: { merchantId: merchant.id }
          });
          console.log(`  - Deleted ${orders.count} order records`);
          
          // Delete Product records
          const products = await prisma.product.deleteMany({
            where: { merchantId: merchant.id }
          });
          console.log(`  - Deleted ${products.count} product records`);
          
          // Finally delete the merchant
          await prisma.merchant.delete({
            where: { id: merchant.id }
          });
          console.log(`  - Deleted merchant: ${merchant.storeName}`);
          
        } catch (error) {
          console.error(`Error cleaning up merchant ${merchant.id}:`, error);
        }
      }
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
    
    console.log('Comprehensive cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during comprehensive cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveCleanup();
