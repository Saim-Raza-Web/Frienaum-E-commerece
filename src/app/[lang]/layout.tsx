import Navbar from '@/components/Navbar';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { TranslationProvider } from '@/i18n/TranslationProvider';
import { Locale, isValidLocale } from '@/i18n/config';
import { CartProvider } from '@/context/CartContext';

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
  
  // Wrap in a client component
  return (
    <ClientLayout locale={locale}>
      {children}
    </ClientLayout>
  );
}

// Client-side layout component
function ClientLayout({ 
  children, 
  locale 
}: { 
  children: React.ReactNode; 
  locale: Locale 
}) {
  return (
    <TranslationProvider initialLocale={locale}>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Navigation />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </CartProvider>
    </TranslationProvider>
  );
}
