import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

// Define supported locales
const locales = ['en', 'es', 'fr', 'de'] as const;
type Locale = typeof locales[number];

// Function to get the locale from the request
function getLocale(request: NextRequest): Locale {
  // Get the locale from the cookie first
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // Get the accept-language header
  const acceptLanguage = request.headers.get('accept-language') || 'en';
  const headers = { 'accept-language': acceptLanguage };
  const languages = new Negotiator({ headers }).languages();
  
  // Match the best locale
  const defaultLocale = 'en';
  return matchLocale(languages, Array.from(locales), defaultLocale) as Locale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Skip if the request is for a static file, Next.js internal, or API route
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(css|js|jpg|png|svg|woff2?|eot|ttf|otf)$/)
  ) {
    return NextResponse.next();
  }

  // Redirect if there's no locale
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    
    // Create new URL with locale
    const newUrl = new URL(
      `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}${request.nextUrl.search}`,
      request.url
    );
    
    return NextResponse.redirect(newUrl);
  }

  // Set the locale cookie if it's not set
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
