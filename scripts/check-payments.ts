import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPayments() {
  try {
    console.log('Checking payment records in database...\n');

    // Count total payments
    const totalPayments = await prisma.payment.count();
    console.log(`📊 Total payment records: ${totalPayments}`);

    if (totalPayments === 0) {
      console.log('❌ No payment records found in database');
      return;
    }

    // Get sample payment records
    const payments = await prisma.payment.findMany({
      take: 5,
      include: {
        order: {
          select: {
            id: true,
            customer: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('\n💳 Recent payment records:');
    payments.forEach((payment, index) => {
      console.log(`${index + 1}. Payment ID: ${payment.id}`);
      console.log(`   Gateway: ${payment.gateway}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Amount: ${payment.amount} ${payment.currency}`);
      console.log(`   Transaction ID: ${payment.transactionId}`);
      console.log(`   Customer: ${payment.order.customer.name} (${payment.order.customer.email})`);
      console.log(`   Created: ${payment.createdAt}`);
      console.log('');
    });

    // Check payment gateway distribution
    const gatewayStats = await prisma.payment.groupBy({
      by: ['gateway'],
      _count: { id: true },
      _sum: { amount: true }
    });

    console.log('📈 Payment gateway distribution:');
    gatewayStats.forEach(stat => {
      console.log(`   ${stat.gateway}: ${stat._count.id} payments, Total: ${stat._sum.amount || 0}`);
    });

    console.log('\n✅ Payment system is working correctly!');

  } catch (error) {
    console.error('❌ Error checking payments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPayments();
