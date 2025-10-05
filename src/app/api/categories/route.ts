import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Fetch all active categories from the database
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                stock: {
                  gt: 0 // Only count products that are in stock
                }
              }
            }
          }
        },
        products: {
          where: {
            stock: {
              gt: 0
            },
            imageUrl: {
              not: null
            }
          },
          select: {
            imageUrl: true,
            title_en: true,
            price: true
          },
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data to match the Category interface
    const transformedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image || '/images/placeholder.jpg',
      productCount: category._count.products,
      firstProduct: category.products.length > 0 ? {
        imageUrl: category.products[0].imageUrl,
        title: category.products[0].title_en,
        price: category.products[0].price
      } : null
    }));

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, image } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Create new category
    const category = await prisma.category.create({
      data: {
        name,
        description,
        image: image || null
      }
    });

    return NextResponse.json({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      productCount: 0
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
