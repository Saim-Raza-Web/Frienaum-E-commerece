'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { AlertTriangle, ShoppingBag } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';

/**
 * Component that blocks merchants from accessing customer shopping pages
 * and redirects them to their merchant dashboard
 */
interface MerchantBlockerProps {
  children: React.ReactNode;
  allowMerchantAccess?: boolean;
}

export default function MerchantBlocker({ children, allowMerchantAccess = false }: MerchantBlockerProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { translate } = useTranslation();

  useEffect(() => {
    // Only check if we're done loading and user is authenticated
    if (!allowMerchantAccess && !isLoading && isAuthenticated && user?.role === 'merchant') {
      // Get current language
      const langMatch = pathname?.match(/^\/([a-z]{2})(\/|$)/);
      const currentLang = langMatch ? langMatch[1] : 'de';
      
      // Define paths that merchants are allowed to access
      const allowedPaths = [
        `^\/${currentLang}\/product\/\\d+$`, // Product details page
        `^\/${currentLang}\/products`, // Products listing
        `^\/${currentLang}\/checkout`, // Checkout process
        `^\/${currentLang}\/cart`, // Cart page
        `^\/${currentLang}\/orders` // Customer orders history
      ];
      
      // Check if current path is in the allowed list
      const isAllowedPath = allowedPaths.some(pattern => 
        new RegExp(pattern).test(pathname || '')
      );
      
      // Only redirect if not on an allowed path
      if (!isAllowedPath) {
        router.replace(`/${currentLang}/merchant`);
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname, allowMerchantAccess]);

  // Show loading while checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If merchant is authenticated and not on an allowed path, show blocking message
  if (!allowMerchantAccess && isAuthenticated && user?.role === 'merchant') {
    // Define paths that merchants are allowed to access
    const langMatch = pathname?.match(/^\/([a-z]{2})(\/|$)/);
    const currentLang = langMatch ? langMatch[1] : 'de';
    const allowedPaths = [
      `^\/${currentLang}\/product\/\\d+$`, // Product details page
      `^\/${currentLang}\/products`, // Products listing
      `^\/${currentLang}\/checkout`, // Checkout process
      `^\/${currentLang}\/cart`, // Cart page
      `^\/${currentLang}\/orders` // Customer orders history
    ];
    
    const isAllowedPath = allowedPaths.some(pattern => 
      new RegExp(pattern).test(pathname || '')
    );
    
    if (!isAllowedPath) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto px-4">
            <ShoppingBag className="w-16 h-16 text-turquoise-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{translate('merchant.merchantDashboard') || 'Merchant Dashboard'}</h1>
            <p className="text-gray-600 mb-4">
              {translate('merchant.merchantAccessMessage') || 'As a merchant, you have access to your merchant dashboard to manage your products and orders.'}
            </p>
            <p className="text-sm text-gray-500">{translate('merchant.redirecting') || 'Redirecting to your dashboard...'}</p>
          </div>
        </div>
      );
    }
  }

  // Allow access for customers and non-authenticated users
  return <>{children}</>;
}

