import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrdersPaymentMethod() {
  try {
    console.log('Checking if payment methods are stored in Order records...\n');

    // Count total orders
    const totalOrders = await prisma.order.count();
    console.log(`📊 Total order records: ${totalOrders}`);

    if (totalOrders === 0) {
      console.log('❌ No order records found in database');
      return;
    }

    // Get recent orders with payment info
    const orders = await prisma.order.findMany({
      take: 5,
      select: {
        id: true,
        gatewayUsed: true,
        paymentStatus: true,
        totalAmount: true,
        currency: true,
        createdAt: true,
        customer: {
          select: { name: true, email: true }
        },
        payments: {
          select: {
            gateway: true,
            status: true,
            amount: true,
            transactionId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('\n🛒 Recent order records with payment info:');
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order.id}`);
      console.log(`   Gateway Used: ${order.gatewayUsed || 'Not set'}`);
      console.log(`   Payment Status: ${order.paymentStatus || 'Not set'}`);
      console.log(`   Total Amount: ${order.totalAmount} ${order.currency}`);
      console.log(`   Customer: ${order.customer.name} (${order.customer.email})`);

      if (order.payments.length > 0) {
        console.log(`   Payment Records (${order.payments.length}):`);
        order.payments.forEach((payment, pIndex) => {
          console.log(`     ${pIndex + 1}. Gateway: ${payment.gateway}, Status: ${payment.status}, Amount: ${payment.amount}`);
        });
      } else {
        console.log(`   Payment Records: None`);
      }
      console.log('');
    });

    // Check how many orders have gatewayUsed set
    const ordersWithGateway = await prisma.order.count({
      where: { gatewayUsed: { not: null } }
    });

    const ordersWithPaymentStatus = await prisma.order.count({
      where: { paymentStatus: { not: null } }
    });

    console.log(`📈 Order payment method stats:`);
    console.log(`   Orders with gatewayUsed set: ${ordersWithGateway} / ${totalOrders}`);
    console.log(`   Orders with paymentStatus set: ${ordersWithPaymentStatus} / ${totalOrders}`);

    if (ordersWithGateway > 0) {
      console.log('\n✅ Payment methods are being stored in Order records!');
    } else {
      console.log('\n⚠️ Payment methods are NOT being stored in Order records');
    }

  } catch (error) {
    console.error('❌ Error checking orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrdersPaymentMethod();
