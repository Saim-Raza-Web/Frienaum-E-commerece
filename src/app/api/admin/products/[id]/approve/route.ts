import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: productId } = params;
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Authenticate user
    const user = getUserFromNextRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update product status to PUBLISHED
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { status: 'PUBLISHED' },
      include: {
        merchant: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        category: {
          select: { id: true, name: true, description: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Product approved and published successfully',
      product: {
        ...updatedProduct,
        category: updatedProduct.category?.name || 'General'
      }
    });
  } catch (error) {
    console.error('Error approving product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to approve product: ${errorMessage}` },
      { status: 500 }
    );
  }
}

