'use client';

import { ReactNode } from 'react';
import { TranslationProvider } from '@/i18n/TranslationProvider';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Locale } from '@/i18n/config';

type ProvidersProps = {
  children: ReactNode;
  locale: Locale;
};

export function Providers({ children, locale }: ProvidersProps) {
  return (
    <AuthProvider>
      <TranslationProvider initialLocale={locale}>
        <CartProvider>
          {children}
        </CartProvider>
      </TranslationProvider>
    </AuthProvider>
  );
}
