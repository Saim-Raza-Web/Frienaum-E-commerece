import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function GET(request: NextRequest) {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const user = getUserFromNextRequest(request);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MERCHANT')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { slug, title_en, title_de, desc_en, desc_de, price, stock, imageUrl, category } = await request.json();

  try {
    const created = await prisma.product.create({
      data: { slug, title_en, title_de, desc_en, desc_de, price: Number(price), stock: Number(stock), imageUrl, category }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.meta?.cause || 'Bad request' }, { status: 400 });
  }
}
