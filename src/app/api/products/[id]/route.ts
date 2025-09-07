import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  }
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  }

  const user = getUserFromNextRequest(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MERCHANT')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { slug, title_en, title_de, desc_en, desc_de, price, stock, imageUrl } = await request.json();
  const updated = await prisma.product.update({
    where: { id },
    data: { slug, title_en, title_de, desc_en, desc_de, price: Number(price), stock: Number(stock), imageUrl }
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  }

  const user = getUserFromNextRequest(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MERCHANT')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await prisma.product.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
