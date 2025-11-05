import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({ reviews: [], count: 0 });
    }
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '8');
    const rating = parseInt(searchParams.get('rating') || '5');
    const lang = (searchParams.get('lang') || 'de').toLowerCase();

    // Validate parameters
    if (limit < 1 || limit > 10) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 10' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Fetch ratings with language filter; if that fails (e.g., field missing), fallback without language filter
    let ratings: any[] = [];
    try {
      ratings = await prisma.rating.findMany({
        where: {
          rating: rating,
          language: lang,
          review: {
            not: null // Only include ratings that have review text
          }
        },
        include: {
          customer: {
            select: {
              name: true,
              id: true
            }
          },
          product: {
            select: {
              title_en: true,
              title_de: true,
              imageUrl: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });
    } catch (e) {
      // Fallback without language constraint
      ratings = await prisma.rating.findMany({
        where: {
          rating: rating,
          review: {
            not: null
          }
        },
        include: {
          customer: {
            select: { name: true, id: true }
          },
          product: {
            select: { title_en: true, title_de: true, imageUrl: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
    }

    // If no ratings with review text found, try to get any ratings with the specified rating
    if (ratings.length === 0) {
      try {
        const anyRatings = await prisma.rating.findMany({
          where: {
            rating: rating,
            language: lang
          },
          include: {
            customer: { select: { name: true, id: true } },
            product: { select: { title_en: true, title_de: true, imageUrl: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: limit
        });
        ratings.push(...anyRatings);
      } catch (e) {
        const anyRatingsNoLang = await prisma.rating.findMany({
          where: { rating: rating },
          include: {
            customer: { select: { name: true, id: true } },
            product: { select: { title_en: true, title_de: true, imageUrl: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: limit
        });
        ratings.push(...anyRatingsNoLang);
      }
    }

    // Transform the data to match the expected format
    const transformedReviews = ratings.map(rating => ({
      id: rating.id,
      customerName: rating.customer.name,
      reviewText: rating.review || `Great product! I gave it ${rating.rating} stars.`,
      rating: rating.rating,
      customerPhoto: null, // No customer photo field in current schema
      productName: lang === 'de' ? rating.product.title_de : rating.product.title_en,
      createdAt: rating.createdAt
    }));

    return NextResponse.json({
      reviews: transformedReviews,
      count: transformedReviews.length
    });

  } catch (error) {
    console.error('Error fetching top reviews:', error);
    // Return empty results instead of 500 to avoid breaking the homepage
    return NextResponse.json({ reviews: [], count: 0 });
  }
}
