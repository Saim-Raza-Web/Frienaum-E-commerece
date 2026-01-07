import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';
    
    console.log('Fetching categories from database...');
    
    const categories = await prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: { 
            products: {
              where: { 
                stock: { gt: 0 } // Only count products that are in stock
              } 
            } 
          }
        },
        products: {
          where: {
            stock: { gt: 0 },
            imageUrl: { not: null }
          },
          select: {
            imageUrl: true,
            title_en: true,
            price: true
          },
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`Found ${categories.length} categories`);

    // Transform the data to match the expected format
    const transformedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      image: category.image || '/images/placeholder-category.jpg',
      isActive: category.isActive !== undefined ? category.isActive : true,
      slug: category.slug || `category-${category.id}`,
      productCount: category._count?.products || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      firstProduct: category.products?.[0] ? {
        imageUrl: category.products[0].imageUrl,
        title: category.products[0].title_en,
        price: category.products[0].price
      } : null
    }));

    console.log('Categories data transformed successfully');
    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Handle multipart form data
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string | null;

    // Debug logging
    console.log('=== CATEGORY CREATION DEBUG ===');
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    console.log('Extracted values:');
    console.log('name:', name);
    console.log('description:', description);
    console.log('imageUrl:', imageUrl);
    console.log('imageUrl type:', typeof imageUrl);
    console.log('imageUrl length:', imageUrl?.length);

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Create new category with the image URL
    const category = await prisma.category.create({
      data: {
        name,
        description,
        image: imageUrl || null
      }
    });

    console.log('Created category:', category);

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
      { error: error instanceof Error ? error.message : 'Failed to create category' },
      { status: 500 }
    );
  }
}

