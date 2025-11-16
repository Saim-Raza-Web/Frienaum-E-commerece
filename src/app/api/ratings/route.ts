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
      // Check if order item exists at all
      const anyOrderItem = await prisma.orderItem.findFirst({
        where: { id: orderItemId },
        include: { order: true }
      });
      
      if (!anyOrderItem) {
        return NextResponse.json(
          { error: 'Order item not found' },
          { status: 404 }
        );
      }
      
      if (anyOrderItem.order.customerId !== payload.id) {
        return NextResponse.json(
          { error: 'This order item does not belong to you' },
          { status: 403 }
        );
      }
      
      if (anyOrderItem.order.status !== 'DELIVERED') {
        return NextResponse.json(
          { error: `Order must be DELIVERED to rate. Current status: ${anyOrderItem.order.status}` },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Order item not eligible for rating' },
        { status: 400 }
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
    try {
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
    } catch (createError: any) {
      console.error('Error creating rating in database:', createError);
      
      // Check if it's a unique constraint violation
      if (createError.code === 'P2002') {
        return NextResponse.json(
          { error: 'You have already rated this product for this order item' },
          { status: 400 }
        );
      }
      
      throw createError; // Re-throw to be caught by outer catch
    }

  } catch (error: any) {
    console.error('Error creating rating:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const orderItemId = searchParams.get('orderItemId');

    if (!orderItemId) {
      return NextResponse.json(
        { error: 'Order Item ID is required' },
        { status: 400 }
      );
    }

    // Find the rating to delete
    const rating = await prisma.rating.findUnique({
      where: {
        customerId_orderItemId: {
          customerId: payload.id,
          orderItemId: orderItemId
        }
      }
    });

    if (!rating) {
      // Try to find any rating for this orderItemId to help debug
      const anyRating = await prisma.rating.findFirst({
        where: { orderItemId },
        select: { customerId: true, orderItemId: true }
      });
      
      if (anyRating) {
        return NextResponse.json(
          { error: 'Rating not found. You can only delete your own ratings.' },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          { error: 'Rating not found for this order item.' },
          { status: 404 }
        );
      }
    }

    // Delete the rating
    await prisma.rating.delete({
      where: {
        id: rating.id
      }
    });

    // Update product average rating and count
    await updateProductRating(rating.productId);

    return NextResponse.json({
      success: true,
      message: 'Rating deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting rating:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
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
