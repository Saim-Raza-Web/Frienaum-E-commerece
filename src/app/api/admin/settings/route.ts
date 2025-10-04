import { NextRequest, NextResponse } from 'next/server';
import { getUserFromReq } from '@/lib/apiAuth';

let inMemorySettings = {
  storeName: 'Fienraum',
  currency: 'USD',
  defaultLanguage: 'en'
};

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function GET() {
  return NextResponse.json(inMemorySettings);
}

export async function PATCH(request: NextRequest) {
  const user = getUserFromNextRequest(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    inMemorySettings = { ...inMemorySettings, ...body };
    return NextResponse.json(inMemorySettings);
  } catch (e) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
}


