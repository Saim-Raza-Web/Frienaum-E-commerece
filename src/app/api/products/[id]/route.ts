import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';
import { ObjectId } from 'mongodb';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

function isValidObjectId(id: string | undefined | null): boolean {
  if (!id) return false;
  try {
    return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
  } catch {
    return false;
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromNextRequest(request);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MERCHANT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;
    if (!isValidObjectId(productId)) {
      return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
    }

    const body = await request.json();
    const {
      slug,
      title_en,
      title_de,
      desc_en,
      desc_de,
      price,
      stock,
      imageUrl,
      category
    } = body;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(slug !== undefined ? { slug } : {}),
        ...(title_en !== undefined ? { title_en } : {}),
        ...(title_de !== undefined ? { title_de } : {}),
        ...(desc_en !== undefined ? { desc_en } : {}),
        ...(desc_de !== undefined ? { desc_de } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(stock !== undefined ? { stock: Number(stock) } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(category !== undefined ? { category } : {}),
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromNextRequest(request);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MERCHANT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;
    if (!isValidObjectId(productId)) {
      return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = id;
  if (!productId) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  }
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = id;
  if (!productId) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  }

  const user = getUserFromNextRequest(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MERCHANT')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { slug, title_en, title_de, desc_en, desc_de, price, stock, imageUrl } = await request.json();
  const updated = await prisma.product.update({
    where: { id: productId },
    data: { slug, title_en, title_de, desc_en, desc_de, price: Number(price), stock: Number(stock), imageUrl: imageUrl || undefined }
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = id;
  if (!productId) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  }

  const user = getUserFromNextRequest(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MERCHANT')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await prisma.product.delete({ where: { id: productId } });
  return new NextResponse(null, { status: 204 });
}
