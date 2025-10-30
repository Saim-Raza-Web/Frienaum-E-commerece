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
  metadataBase: new URL("https://feinraum-e-commerce.vercel.app/en"),
  title: 'Home | Feinraumshop',
  description: 'Discover premium products at Feinraumshop. Elevate your lifestyle with curated quality, design, and service.',
  openGraph: {
    title: 'Feinraumshop – Your Premium Shopping Destination',
    description:
      'Feinraumshop: Exquisite selection of timeless, modern products. Your trusted premium online store.',
    type: 'website',
    url: 'https://feinraumshop.ch',
    images: [
      {
        url: '/images/opengraph-banner.png',
        width: 1200,
        height: 630,
        alt: 'Feinraumshop Premium Banner',
      },
    ],
    siteName: 'Feinraumshop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Feinraumshop – Premium Shopping',
    description:'Discover premium lifestyle products at Feinraumshop.',
    site: '@feinraumshop',
    images: ['/images/opengraph-banner.png'],
  },
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
