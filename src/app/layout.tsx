import type { Metadata } from 'next';
import { Montserrat, Lora } from 'next/font/google';
import React from 'react';
import { Providers } from '@/components/Providers';
import './globals.css';

const montserrat = Montserrat({ 
  subsets: ['latin'], 
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700', '800', '900']
});
const lora = Lora({ 
  subsets: ['latin'], 
  variable: '--font-lora',
  weight: ['400', '500', '600', '700']
});

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
    <html lang="en" className={`${montserrat.variable} ${lora.variable}`} suppressHydrationWarning>
      <body className="font-montserrat" suppressHydrationWarning>
        <Providers locale="en">
          {children}
        </Providers>
      </body>
    </html>
  );
}
