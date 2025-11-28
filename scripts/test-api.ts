import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAPI() {
  try {
    console.log('Testing products API...');
    
    // Test the exact same query that the API uses
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

    console.log(`✅ Successfully fetched ${products.length} products`);
    
    // Filter out products with deleted merchants and map merchant.user info
    const validProducts = products
      .filter((p: any) => p.merchant && p.merchant.user) // Only include products with valid merchants
      .map((p: any) => ({
        ...p,
        merchant: {
          id: p.merchant.user.id,
          name: p.merchant.user.name,
          email: p.merchant.user.email
        }
      }));

    console.log(`✅ Valid products after filtering: ${validProducts.length}`);
    
    if (validProducts.length > 0) {
      console.log('\nSample product:');
      const sample = validProducts[0];
      console.log(`  - Title: ${sample.title_en}`);
      console.log(`  - Price: ${sample.price.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`);
      console.log(`  - Merchant: ${sample.merchant.name} (${sample.merchant.email})`);
    }
    
    console.log('\n🎉 Products API is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing products API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
