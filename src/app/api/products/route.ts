import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';
import { ObjectId } from 'mongodb';

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string | undefined | null): boolean {
  if (!id) return false;
  try {
    return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
  } catch {
    return false;
  }
}

// Type for the product with merchant info
type ProductWithMerchant = {
  id: string;
  slug: string;
  title_en: string;
  title_de: string;
  desc_en: string;
  desc_de: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  merchantId: string;
  category: string;
  merchant: {
    id: string;
    name: string;
    email: string;
  } | null;
};

// Helper function to get product with merchant and merchant's user
async function getProductsWithMerchants(where: any = {}) {
  return prisma.product.findMany({  
    where,
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
}

// Helper function to create product with merchant
async function createProductWithMerchant(data: any) {
  return prisma.product.create({
    data,
    include: {
      merchant: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    }
  });
}

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function GET(request: NextRequest) {
  try {
    // Get all products for now (remove merchant status filter for debugging)
    const products = await getProductsWithMerchants();

    // Map merchant.user info into top-level shape if needed by client
    const shaped = products.map((p: any) => ({
      ...p,
      merchant: p.merchant?.user
        ? { id: p.merchant.user.id, name: p.merchant.user.name, email: p.merchant.user.email }
        : null
    }));

    return NextResponse.json(shaped);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Authenticate user
  const user = getUserFromNextRequest(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MERCHANT')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Parse request body
    const productData = await request.json();
    const {
      slug,
      title_en,
      title_de,
      desc_en,
      desc_de,
      price,
      stock,
      imageUrl,
      category
    } = productData;

    // Resolve the merchant entity
    let targetMerchantId: string | null = null;
    if (user.role === 'MERCHANT') {
      const merchant = await prisma.merchant.findUnique({
        where: { userId: user.id }
      });
      if (!merchant) {
        return NextResponse.json(
          { error: 'Merchant profile not found. Please register as a merchant.' },
          { status: 403 }
        );
      }
      targetMerchantId = merchant.id;
    } else {
      // Admin can specify merchantId in body
      targetMerchantId = productData.merchantId;
    }
    if (!targetMerchantId) {
      return NextResponse.json(
        { error: 'Merchant ID is required' },
        { status: 400 }
      );
    }

    // Create the product
    const created = await prisma.product.create({
      data: {
        slug,
        title_en,
        title_de,
        desc_en,
        desc_de,
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl || undefined,
        category: category || 'General',
        merchantId: targetMerchantId
      },
      include: {
        merchant: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    const shapedCreated = created && (created as any).merchant?.user
      ? {
          ...(created as any),
          merchant: {
            id: (created as any).merchant.user.id,
            name: (created as any).merchant.user.name,
            email: (created as any).merchant.user.email,
          }
        }
      : created;

    return NextResponse.json(shapedCreated, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create product: ${errorMessage}` },
      { status: 500 }
    );
  }
}
