'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'merchant' | 'admin';
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Only redirect if we're done loading and still not authenticated
    if (!isLoading && !isAuthenticated) {
      setShouldRedirect(true);
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (shouldRedirect) {
      // Don't redirect if we're already on the home page
      const pathSegments = pathname?.split('/').filter(Boolean) || [];
      const currentLang = pathSegments[0] || 'en';
      const isHomePage = pathSegments.length === 1 && (pathname === `/${currentLang}` || pathname === `/${currentLang}/`);

      if (!isHomePage) {
  router.push(`/${currentLang}/login?redirect=${encodeURIComponent(pathname || '')}`);
      }
    }
  }, [shouldRedirect, router, pathname]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-turquoise-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show redirect message
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please log in to continue</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If role is required, check if user has permission
  if (requiredRole && user.role !== requiredRole) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. 
            This page requires {requiredRole} role.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Your current role: <span className="font-medium text-gray-700">{user.role}</span>
            </p>
            <p className="text-sm text-gray-500">
              Logged in as: <span className="font-medium text-gray-700">{user.email}</span>
            </p>
          </div>
          <button
            onClick={() => {
              const pathSegments = pathname?.split('/').filter(Boolean) || [];
              const currentLang = pathSegments[0] || 'en';
              router.push(`/${currentLang}`);
            }}
            className="mt-6 btn-primary"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role
  return <>{children}</>;
}
