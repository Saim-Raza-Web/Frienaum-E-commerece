import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');
    const featured = searchParams.get('featured') === 'true';

    // Check if prisma is available
    if (!prisma) {
      console.warn('Prisma not available, returning empty reviews');
      return NextResponse.json({
        reviews: [],
        total: 0
      });
    }

    // Get featured customer reviews with customer names
    const reviews = await prisma.rating.findMany({
      where: {
        review: {
          not: null // Only reviews with text
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true
          }
        },
        product: {
          select: {
            id: true,
            title_en: true,
            title_de: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Transform the data for the frontend
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      review: review.review,
      customerName: review.customer.name || 'Anonymous',
      productName: review.product.title_en,
      createdAt: review.createdAt
    }));

    return NextResponse.json({
      reviews: transformedReviews,
      total: transformedReviews.length
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    // Return empty array instead of error to prevent frontend crashes
    return NextResponse.json({
      reviews: [],
      total: 0
    });
  }
}
