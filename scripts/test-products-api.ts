import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProductsAPI() {
  try {
    console.log('Testing products API...');
    
    // Test the same query that the API uses
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

    console.log(`Found ${products.length} products`);
    
    // Check for products with missing merchants
    const productsWithMissingMerchants = products.filter(p => !p.merchant || !p.merchant.user);
    console.log(`Products with missing merchants: ${productsWithMissingMerchants.length}`);
    
    if (productsWithMissingMerchants.length > 0) {
      console.log('Products with missing merchants:');
      productsWithMissingMerchants.forEach(p => {
        console.log(`- Product ID: ${p.id}, Title: ${p.title_en}, MerchantId: ${p.merchantId}`);
      });
    }
    
    // Test the filtering logic
    const validProducts = products
      .filter((p: any) => p.merchant && p.merchant.user)
      .map((p: any) => ({
        ...p,
        merchant: {
          id: p.merchant.user.id,
          name: p.merchant.user.name,
          email: p.merchant.user.email
        }
      }));
    
    console.log(`Valid products after filtering: ${validProducts.length}`);
    console.log('API should work correctly now!');
    
  } catch (error) {
    console.error('Error testing products API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductsAPI();
