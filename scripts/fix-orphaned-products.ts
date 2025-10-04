import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOrphanedProducts() {
  try {
    console.log('Finding and fixing orphaned products...');
    
    // First, let's find all products
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        title_en: true,
        merchantId: true
      }
    });
    
    console.log(`Found ${allProducts.length} total products`);
    
    // Check which merchants exist
    const existingMerchants = await prisma.merchant.findMany({
      select: { id: true }
    });
    
    const existingMerchantIds = new Set(existingMerchants.map(m => m.id));
    console.log(`Found ${existingMerchants.length} existing merchants`);
    
    // Find products with invalid merchant references
    const orphanedProducts = allProducts.filter(p => !existingMerchantIds.has(p.merchantId));
    
    console.log(`Found ${orphanedProducts.length} orphaned products:`);
    orphanedProducts.forEach(p => {
      console.log(`- Product: ${p.title_en} (ID: ${p.id}, MerchantId: ${p.merchantId})`);
    });
    
    if (orphanedProducts.length > 0) {
      const orphanedIds = orphanedProducts.map(p => p.id);
      
      console.log('Deleting orphaned products...');
      const deleteResult = await prisma.product.deleteMany({
        where: {
          id: {
            in: orphanedIds
          }
        }
      });
      
      console.log(`Successfully deleted ${deleteResult.count} orphaned products`);
    } else {
      console.log('No orphaned products found');
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
    console.error('Error fixing orphaned products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrphanedProducts();
