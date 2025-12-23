import { prisma } from '@/lib/prisma';

type NotificationType =
  | 'PRODUCT_SUBMITTED'
  | 'PRODUCT_APPROVED'
  | 'PRODUCT_REJECTED'
  | 'MERCHANT_REGISTERED'
  | 'MERCHANT_ACTIVATED'
  | 'MERCHANT_SUSPENDED'
  | 'ORDER_PLACED';

interface NotificationData {
  [key: string]: string | undefined;
  productId?: string;
  productTitle?: string;
  merchantId?: string;
  merchantName?: string;
  storeName?: string;
  orderId?: string;
  customerName?: string;
  totalAmount?: string;
  currency?: string;
}

// Create a notification for a user
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: NotificationData
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || {}
      }
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

// Notify all admins about a new product submission
export async function notifyAdminsProductSubmitted(
  productId: string,
  productTitle: string,
  merchantName: string,
  storeName: string
) {
  try {
    console.log('notifyAdminsProductSubmitted called with:', { productId, productTitle, merchantName, storeName });
    
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN', isDeleted: false },
      select: { id: true }
    });

    console.log('Found admins:', admins.length, admins);

    if (admins.length === 0) {
      console.log('No admins found to notify!');
      return [];
    }

    const notifications = await Promise.all(
      admins.map(admin =>
        createNotification(
          admin.id,
          'PRODUCT_SUBMITTED',
          'Neues Produkt zur Genehmigung',
          `${merchantName} (${storeName}) hat "${productTitle}" zur Genehmigung eingereicht.`,
          { productId, productTitle, merchantName, storeName }
        )
      )
    );

    console.log('Created notifications:', notifications.length);
    return notifications.filter(Boolean);
  } catch (error) {
    console.error('Error notifying admins about product submission:', error);
    return [];
  }
}

// Notify merchant about product approval
export async function notifyMerchantProductApproved(
  merchantUserId: string,
  productId: string,
  productTitle: string
) {
  return createNotification(
    merchantUserId,
    'PRODUCT_APPROVED',
    'Produkt genehmigt',
    `Ihr Produkt "${productTitle}" wurde genehmigt und ist jetzt veröffentlicht.`,
    { productId, productTitle }
  );
}

// Notify merchant about product rejection
export async function notifyMerchantProductRejected(
  merchantUserId: string,
  productId: string,
  productTitle: string,
  reason?: string
) {
  const message = reason
    ? `Ihr Produkt "${productTitle}" wurde abgelehnt. Grund: ${reason}`
    : `Ihr Produkt "${productTitle}" wurde abgelehnt.`;

  return createNotification(
    merchantUserId,
    'PRODUCT_REJECTED',
    'Produkt abgelehnt',
    message,
    { productId, productTitle }
  );
}

// Notify all admins about a new merchant registration
export async function notifyAdminsMerchantRegistered(
  merchantId: string,
  merchantName: string,
  storeName: string
) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN', isDeleted: false },
      select: { id: true }
    });

    const notifications = await Promise.all(
      admins.map(admin =>
        createNotification(
          admin.id,
          'MERCHANT_REGISTERED',
          'Neuer Händler registriert',
          `${merchantName} hat sich als Händler mit dem Shop "${storeName}" registriert.`,
          { merchantId, merchantName, storeName }
        )
      )
    );

    return notifications.filter(Boolean);
  } catch (error) {
    console.error('Error notifying admins about merchant registration:', error);
    return [];
  }
}

export async function notifyMerchantOrderPlaced(
  merchantUserId: string,
  orderId: string,
  customerName: string,
  totalAmount: number,
  currency: string
) {
  return createNotification(
    merchantUserId,
    'ORDER_PLACED',
    'Neue Bestellung erhalten',
    `${customerName} hat Bestellung #${orderId} aufgegeben. Gesamt: ${totalAmount.toFixed(2)} ${currency}.`,
    { orderId, customerName, totalAmount: totalAmount.toString(), currency }
  );
}
