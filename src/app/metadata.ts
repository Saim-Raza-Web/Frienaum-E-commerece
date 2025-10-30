import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | Feinraumshop',
  description: 'Discover premium products at Feinraumshop. Elevate your lifestyle with curated quality, design, and service.',
  openGraph: {
    title: 'Feinraumshop – Your Premium Shopping Destination',
    description:'Feinraumshop: Exquisite selection of timeless, modern products. Your trusted premium online store.',
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
