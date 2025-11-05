import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const productId = id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const lang = (searchParams.get('lang') || 'de').toLowerCase();
    const offset = (page - 1) * limit;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get ratings for the product
    const ratingsData = await prisma.rating.findMany({
      where: { productId, language: lang },
      include: {
        customer: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.rating.count({
      where: { productId, language: lang }
    });

    // Get product info with current rating stats
    const productData = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title_en: true,
        averageRating: true,
        ratingCount: true
      }
    });

    if (!productData) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product: {
        id: productData.id,
        title: productData.title_en,
        averageRating: productData.averageRating,
        ratingCount: productData.ratingCount
      },
      ratings: ratingsData.map((rating: any) => ({
        id: rating.id,
        rating: rating.rating,
        review: rating.review,
        createdAt: rating.createdAt,
        customer: {
          id: rating.customer.id,
          name: rating.customer.name
        }
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: offset + limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
