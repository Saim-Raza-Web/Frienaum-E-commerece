import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { productId, orderItemId, rating, review, language } = await request.json();

    if (!productId || !orderItemId || !rating) {
      return NextResponse.json(
        { error: 'Product ID, Order Item ID, and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Verify that the order item exists and belongs to the user
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        productId: productId,
        order: {
          customerId: payload.id,
          status: 'DELIVERED'
        }
      },
      include: {
        order: true
      }
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: 'Order item not found or not eligible for rating' },
        { status: 404 }
      );
    }

    // Check if rating already exists for this order item
    const existingRating = await prisma.rating.findUnique({
      where: {
        customerId_orderItemId: {
          customerId: payload.id,
          orderItemId: orderItemId
        }
      }
    });

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this product' },
        { status: 400 }
      );
    }

    // Create the rating
    const newRating = await prisma.rating.create({
      data: {
        rating,
        review,
        language: (language === 'en' || language === 'de') ? language : 'de',
        productId,
        customerId: payload.id,
        orderItemId
      }
    });

    // Update product average rating and count
    await updateProductRating(productId);

    return NextResponse.json({
      success: true,
      rating: newRating
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating rating:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateProductRating(productId: string) {
  const ratings = await prisma.rating.findMany({
    where: { productId },
    select: { rating: true }
  });

  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
    : 0;

  await prisma.product.update({
    where: { id: productId },
    data: {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      ratingCount: totalRatings
    }
  });
}
