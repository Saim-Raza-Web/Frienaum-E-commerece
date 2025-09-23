import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import { Providers } from '@/components/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Feinraum - Your Premium Shopping Destination',
  description: 'Discover amazing products at great prices',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers locale="en">
          {children}
        </Providers>
      </body>
    </html>
  );
}
