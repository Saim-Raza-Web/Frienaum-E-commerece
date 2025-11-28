// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getUserFromReq } from '@/lib/apiAuth';

// function getUserFromNextRequest(req: NextRequest) {
//   const cookieHeader = req.headers.get('cookie') || '';
//   return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
// }

// export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   const productId = id;
//   if (!productId) {
//     return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
//   }
//   const product = await prisma.product.findUnique({ 
//     where: { id: productId },
//     include: {
//       category: {
//         select: { id: true, name: true, description: true }
//       }
//     }
//   });
//   if (!product) {
//     return NextResponse.json({ message: 'Not found' }, { status: 404 });
//   }
  
//   // Get ratings for this product
//   const ratings = await prisma.rating.findMany({ where: { productId } });
//   const ratingCount = ratings.length;
//   const averageRating = ratingCount ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingCount : 0;

//   // Transform to include category name, averageRating, ratingCount
//   const transformedProduct = {
//     ...product,
//     category: product.category?.name || 'General',
//     averageRating,
//     ratingCount,
//   };
  
//   return NextResponse.json(transformedProduct);
// }

// export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   const productId = id;
//   if (!productId) {
//     return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
//   }

//   const user = getUserFromNextRequest(request);
//   if (!user || (user.role !== 'ADMIN' && user.role !== 'MERCHANT')) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   const { slug, title_en, title_de, desc_en, desc_de, price, stock, imageUrl, category } = await request.json();
  
//   // Find or create category
//   let categoryId = null;
//   if (category && category !== 'General') {
//     const existingCategory = await prisma.category.findUnique({
//       where: { name: category }
//     });
    
//     if (existingCategory) {
//       categoryId = existingCategory.id;
//     } else {
//       // Create new category if it doesn't exist
//       const newCategory = await prisma.category.create({
//         data: {
//           name: category,
//           description: `Products in ${category} category`
//         }
//       });
//       categoryId = newCategory.id;
//     }
//   }

//   const updated = await prisma.product.update({
//     where: { id: productId },
//     data: { 
//       slug, 
//       title_en, 
//       title_de, 
//       desc_en, 
//       desc_de, 
//       price: Number(price), 
//       stock: Number(stock), 
//       imageUrl: imageUrl || undefined,
//       categoryId: categoryId
//     },
//     include: {
//       category: {
//         select: { id: true, name: true, description: true }
//       }
//     }
//   });
  
//   // Transform to include category name
//   const transformedProduct = {
//     ...updated,
//     category: updated.category?.name || 'General'
//   };
  
//   return NextResponse.json(transformedProduct);
// }

// export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   const productId = id;
//   if (!productId) {
//     return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
//   }

//   const user = getUserFromNextRequest(request);
//   if (!user || (user.role !== 'ADMIN' && user.role !== 'MERCHANT')) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   await prisma.product.delete({ where: { id: productId } });
//   return new NextResponse(null, { status: 204 });
// }
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

// Helper to get user from request
function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

// GET product by id
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params;
  if (!productId) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  }

  // Check if user is admin/merchant (they can see all statuses) or public (only published)
  const user = getUserFromNextRequest(request);
  const isAdminOrMerchant = user && (user.role === 'ADMIN' || user.role === 'MERCHANT');

  const product = await prisma.product.findUnique({ 
    where: { id: productId },
    include: {
      category: { select: { id: true, name: true, description: true } }
    }
  });

  if (!product) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  // Public users can only see published products
  if (!isAdminOrMerchant && product.status !== 'PUBLISHED') {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  // Get ratings
  const ratings = await prisma.rating.findMany({ where: { productId } });
  const ratingCount = ratings.length;
  const averageRating = ratingCount ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingCount : 0;

  const transformedProduct = {
    ...product,
    category: product.category?.name || 'General',
    averageRating,
    ratingCount,
  };

  return NextResponse.json(transformedProduct);
}

// PUT update product
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params;
  if (!productId) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  }

  const user = getUserFromNextRequest(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MERCHANT')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { slug, title_en, title_de, desc_en, desc_de, price, stock, imageUrl, category, status } = await request.json();
  
  // Find or create category
  let categoryId = null;
  if (category && category !== 'General') {
    const existingCategory = await prisma.category.findUnique({ where: { name: category } });
    if (existingCategory) {
      categoryId = existingCategory.id;
    } else {
      const newCategory = await prisma.category.create({
        data: { name: category, description: `Products in ${category} category` }
      });
      categoryId = newCategory.id;
    }
  }

  // Build update data object
  const updateData: any = { 
    slug, 
    title_en, 
    title_de, 
    desc_en, 
    desc_de, 
    price: Number(price), 
    stock: Number(stock), 
    imageUrl: imageUrl || undefined,
    categoryId
  };

  // Allow merchants to update status to PENDING (submit for approval), but not to PUBLISHED
  // Only admins can set status to PUBLISHED
  if (status !== undefined) {
    if (user.role === 'ADMIN') {
      updateData.status = status;
    } else if (user.role === 'MERCHANT' && status === 'PENDING') {
      // Merchants can only submit for approval (set to PENDING)
      updateData.status = 'PENDING';
    }
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: updateData,
    include: {
      category: { select: { id: true, name: true, description: true } }
    }
  });

  return NextResponse.json({
    ...updated,
    category: updated.category?.name || 'General'
  });
}

// DELETE product
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params;
  if (!productId) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  }

  const user = getUserFromNextRequest(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MERCHANT')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Get product first
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  if (user.role === 'MERCHANT') {
    // Get the merchant profile for this user
    const merchant = await prisma.merchant.findUnique({ where: { userId: user.id } });
    if (!merchant || product.merchantId !== merchant.id) {
      return NextResponse.json({ message: 'Forbidden. You can only delete your own products.' }, { status: 403 });
    }
  }

  await prisma.product.delete({ where: { id: productId } });
  return new NextResponse(null, { status: 204 });
}
