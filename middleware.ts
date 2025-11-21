import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

// Define supported locales
const locales = ['de', 'en'] as const;
type Locale = typeof locales[number];

// Utility to extract locale from path
function getUrlLocale(path: string): Locale | undefined {
  const match = path.match(/^\/(de|en)(\/|$)/);
  if (match) return match[1] as Locale;
  return undefined;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Skip static and API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(css|js|jpg|png|svg|woff2?|eot|ttf|otf)$/)
  ) {
    return NextResponse.next();
  }

  // No locale: redirect to default (/de)
  if (!pathnameHasLocale) {
    // Always default to German if not in URL
    const locale = 'de';
    const newUrl = new URL(
      `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}${request.nextUrl.search}`,
      request.url
    );
    return NextResponse.redirect(newUrl);
  }

  // Set locale cookie
  const response = NextResponse.next();
  const locale = pathname.split('/')[1] as Locale;
  if (locales.includes(locale)) {
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
  }
  return response;
}

export const config = {
  matcher: [
    // Match all request paths except those that start with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
