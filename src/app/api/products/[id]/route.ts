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
import { sendProductSubmissionForApprovalEmail } from '@/lib/email';
import { notifyAdminsProductSubmitted } from '@/lib/notifications';

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

  const body = await request.json();
  const { slug, title_en, title_de, desc_en, desc_de, price, stock, imageUrl, images, category, status } = body;

  // Build update data object - only include fields that are provided
  const updateData: any = {};

  // Handle category first
  if (category !== undefined) {
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
    updateData.categoryId = categoryId;
  }

  // Handle images: prefer images array, fallback to imageUrl for backward compatibility
  // Step 1: Images are already uploaded to Cloudinary and URLs are received
  // Step 2: Validate that we have valid URLs before storing in database
  if (images !== undefined) {
    if (Array.isArray(images)) {
      // Validate all URLs are valid (Cloudinary URLs or valid HTTP/HTTPS URLs)
      const validImages = images.filter((url: string) => {
        if (!url || typeof url !== 'string') return false;
        try {
          const urlObj = new URL(url);
          return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
          return false;
        }
      });
      updateData.images = validImages;
      // Keep first image in imageUrl for backward compatibility
      updateData.imageUrl = validImages.length > 0 ? validImages[0] : undefined;
    }
  } else if (imageUrl !== undefined) {
    // Validate single imageUrl before storing
    try {
      const urlObj = new URL(imageUrl);
      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        updateData.imageUrl = imageUrl;
        updateData.images = [imageUrl];
      } else {
        updateData.imageUrl = undefined;
        updateData.images = [];
      }
    } catch {
      // Invalid URL, clear images
      updateData.imageUrl = undefined;
      updateData.images = [];
    }
  }

  // Add other fields if they are provided (not undefined)
  if (slug !== undefined) updateData.slug = slug;
  if (title_en !== undefined) updateData.title_en = title_en;
  if (title_de !== undefined) updateData.title_de = title_de;
  if (desc_en !== undefined) updateData.desc_en = desc_en;
  if (desc_de !== undefined) updateData.desc_de = desc_de;
  if (price !== undefined) updateData.price = Number(price);
  if (stock !== undefined) updateData.stock = Number(stock);

  // Handle status separately with role-based permissions
  const wasStatusChangedToPending = status !== undefined && status === 'PENDING' && user.role === 'MERCHANT';
  const previousProduct = wasStatusChangedToPending 
    ? await prisma.product.findUnique({ 
        where: { id: productId },
        include: {
          merchant: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      })
    : null;

  if (status !== undefined) {
    if (user.role === 'ADMIN') {
      updateData.status = status;
    } else if (user.role === 'MERCHANT' && status === 'PENDING') {
      // Merchants can only submit for approval (set to PENDING)
      updateData.status = 'PENDING';
    }
    // Ignore other status changes from merchants
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: updateData,
    include: {
      category: { select: { id: true, name: true, description: true } },
      merchant: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    }
  });

  // Determine whether status actually transitioned into PENDING (avoid duplicate notifications)
  const statusJustBecamePending =
    wasStatusChangedToPending && previousProduct && previousProduct.status !== 'PENDING';

  // Send email and notification only when product transitions into approval state
  if (statusJustBecamePending && updated.merchant?.user) {
    console.log(`Product ${updated.id} submitted for approval - sending notifications`);
    
    try {
      // Send email to merchant
      console.log(`Sending submission confirmation to merchant ${updated.merchant.user.email}`);
      await sendProductSubmissionForApprovalEmail(
        updated.merchant.user.email,
        updated.merchant.user.name || 'Händler',
        updated.title_de || updated.title_en || 'Produkt',
        updated.id
      );
      console.log(`Successfully sent submission confirmation for product ${updated.id}`);

      // Send notifications to all admins
      console.log(`Notifying admins about product submission ${updated.id}`);
      await notifyAdminsProductSubmitted(
        updated.id,
        updated.title_de || updated.title_en || 'Produkt',
        updated.merchant.user.name || 'Händler',
        updated.merchant.storeName
      );
      console.log(`Successfully notified admins about product ${updated.id}`);
    } catch (err) {
      console.error('Error in notification/email sending:', err);
      // Don't fail the request if notifications/emails fail
    }
  }

  return NextResponse.json({
    ...updated,
    category: updated.category?.name || 'General'
  });
}

// DELETE product
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params;
    if (!productId) {
      return NextResponse.json({ message: 'Ungültige ID' }, { status: 400 });
    }

    const user = getUserFromNextRequest(request);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MERCHANT')) {
      return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 401 });
    }

    // Get product first
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ message: 'Nicht gefunden' }, { status: 404 });
    }

    if (user.role === 'MERCHANT') {
      // Get the merchant profile for this user
      const merchant = await prisma.merchant.findUnique({ where: { userId: user.id } });
      if (!merchant || product.merchantId !== merchant.id) {
        return NextResponse.json({ message: 'Sie können nur Ihre eigenen Produkte löschen.' }, { status: 403 });
      }
    }

    await prisma.product.delete({ where: { id: productId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'Fehler beim Löschen des Produkts' },
      { status: 500 }
    );
  }
}
