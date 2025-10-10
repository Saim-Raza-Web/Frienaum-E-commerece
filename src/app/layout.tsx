import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import React from 'react';
import { Providers } from '@/components/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-poppins' });

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
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <Providers locale="en">
          {children}
        </Providers>
      </body>
    </html>
  );
}
