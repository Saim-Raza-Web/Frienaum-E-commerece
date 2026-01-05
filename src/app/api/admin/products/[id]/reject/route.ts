import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';
import { notifyMerchantProductRejected } from '@/lib/notifications';
import { sendProductRejectionEmail } from '@/lib/email';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params;
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Authenticate user
    const user = getUserFromNextRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    // Get optional reason from request body
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || '';

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update product status to DRAFT (rejected)
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { status: 'DRAFT' },
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

    // Send notification and email to merchant about product rejection
    if (updatedProduct.merchant?.user?.id && updatedProduct.merchant?.user?.email) {
      const productTitle = updatedProduct.title_de || updatedProduct.title_en || 'Produkt';
      const merchantName = updatedProduct.merchant.user.name || 'Händler';
      
      // Send notification
      notifyMerchantProductRejected(
        updatedProduct.merchant.user.id,
        updatedProduct.id,
        productTitle,
        reason
      ).catch(err => {
        console.error('Failed to send merchant rejection notification:', err);
      });

      // Send email
      sendProductRejectionEmail(
        updatedProduct.merchant.user.email,
        merchantName,
        productTitle,
        updatedProduct.id,
        reason
      ).catch(err => {
        console.error('Failed to send product rejection email:', err);
      });
    }

    return NextResponse.json({
      message: 'Product rejected successfully',
      product: {
        ...updatedProduct,
        category: updatedProduct.category?.name || 'General'
      }
    });
  } catch (error) {
    console.error('Error rejecting product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to reject product: ${errorMessage}` },
      { status: 500 }
    );
  }
}
