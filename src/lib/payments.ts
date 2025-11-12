import { prisma } from '@/lib/prisma';

export type CartItemInput = { productId: string; quantity: number };
export type SplitResult = {
  orderId: string;
  currency: string;
  grandTotal: number;
  subOrders: Array<{
    merchantId: string;
    subtotal: number;
    commission: number;
    payoutAmount: number;
    items: Array<{ productId: string; title: string; price: number; quantity: number }>;
  }>;
};

const COMMISSION_RATE = Number(process.env.PLATFORM_FEE_PERCENT || '20') / 100; // 0.2

export function calcCommission(subtotal: number, rate = COMMISSION_RATE) {
  const commission = Math.round((subtotal * rate) * 100) / 100;
  const payout = Math.round(((subtotal - commission)) * 100) / 100;
  return { commission, payout };
}

export async function splitCart(cart: CartItemInput[]) {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error('Cart is empty');
  }

  // Fetch products
  const productIds = cart.map((c) => c.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { merchant: true },
  });

  if (products.length !== cart.length) {
    throw new Error('Some products not found');
  }

  // Group by merchant
  const groups = new Map<string, { items: any[]; subtotal: number }>();
  for (const ci of cart) {
    const product = products.find((p) => p.id === ci.productId)!;
    const key = product.merchantId;
    const line = { productId: product.id, title: product.title_en, price: product.price, quantity: ci.quantity };
    const amount = product.price * ci.quantity;
    if (!groups.has(key)) groups.set(key, { items: [], subtotal: 0 });
    const g = groups.get(key)!;
    g.items.push(line);
    g.subtotal = Math.round((g.subtotal + amount) * 100) / 100;
  }

  const subOrders = Array.from(groups.entries()).map(([merchantId, g]) => {
    const { commission, payout } = calcCommission(g.subtotal);
    return {
      merchantId,
      subtotal: g.subtotal,
      commission,
      payoutAmount: payout,
      items: g.items,
    };
  });

  const grandTotal = Math.round((subOrders.reduce((s, so) => s + so.subtotal, 0)) * 100) / 100;
  const currency = 'CHF';

  return { currency, grandTotal, subOrders };
}
