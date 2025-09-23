import { Locale, isValidLocale } from '@/i18n/config';
import { Providers } from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : 'en';
  
  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <Providers locale={locale}>
          <div className="flex flex-col min-h-screen" suppressHydrationWarning={true}>
            <Navbar />
            <Navigation />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
