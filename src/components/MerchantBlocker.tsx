'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { AlertTriangle, ShoppingBag } from 'lucide-react';

/**
 * Component that blocks merchants from accessing customer shopping pages
 * and redirects them to their merchant dashboard
 */
export default function MerchantBlocker({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check if we're done loading and user is authenticated
    if (!isLoading && isAuthenticated && user?.role === 'merchant') {
      // Get current language
      const langMatch = pathname?.match(/^\/([a-z]{2})(\/|$)/);
      const currentLang = langMatch ? langMatch[1] : 'de';

      // Redirect merchant to their dashboard
      router.replace(`/${currentLang}/merchant`);
    }
  }, [isLoading, isAuthenticated, user, router, pathname]);

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

  // If merchant is authenticated, show blocking message while redirecting
  if (isAuthenticated && user?.role === 'merchant') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingBag className="w-16 h-16 text-turquoise-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Merchant Dashboard</h1>
          <p className="text-gray-600 mb-4">
            As a merchant, you have access to your merchant dashboard to manage your products and orders.
          </p>
          <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Allow access for customers and non-authenticated users
  return <>{children}</>;
}

