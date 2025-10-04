import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOrphanedProducts() {
  try {
    console.log('Starting cleanup of orphaned products...');
    
    // Find products that reference non-existent merchants
    const allProducts = await prisma.product.findMany({
      include: {
        merchant: true
      }
    });

    const orphanedProducts = allProducts.filter(product => !product.merchant);
    
    console.log(`Found ${orphanedProducts.length} orphaned products`);
    
    if (orphanedProducts.length > 0) {
      const orphanedIds = orphanedProducts.map(p => p.id);
      
      // Delete orphaned products
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
    
    // Also check for products with invalid merchantId references
    const allProductsWithMerchants = await prisma.product.findMany({
      include: {
        merchant: true
      }
    });

    const invalidProducts = allProductsWithMerchants.filter(p => p.merchantId && !p.merchant);
    
    if (invalidProducts.length > 0) {
      console.log(`Found ${invalidProducts.length} products with invalid merchant references`);
      
      const invalidIds = invalidProducts.map(p => p.id);
      
      const deleteInvalidResult = await prisma.product.deleteMany({
        where: {
          id: {
            in: invalidIds
          }
        }
      });
      
      console.log(`Successfully deleted ${deleteInvalidResult.count} products with invalid merchant references`);
    }
    
    console.log('Cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedProducts();
