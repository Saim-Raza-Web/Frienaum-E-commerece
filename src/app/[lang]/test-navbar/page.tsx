'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n/TranslationProvider';

export default function TestNavbarPage() {
  const { user, isAuthenticated } = useAuth();
  const { translate } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Navbar Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            {user && (
              <>
                <p><strong>User Name:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>User Email:</strong> {user.email || 'N/A'}</p>
                <p><strong>User Role:</strong> {user.role || 'N/A'}</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Translation Test</h2>
          <div className="space-y-2">
            <p><strong>Home:</strong> {translate('home')}</p>
            <p><strong>Products:</strong> {translate('navigation.products')}</p>
            <p><strong>Categories:</strong> {translate('navigation.categories')}</p>
            <p><strong>About:</strong> {translate('about')}</p>
            <p><strong>Contact:</strong> {translate('contact')}</p>
            <p><strong>Sign In:</strong> {translate('signIn')}</p>
            <p><strong>Search:</strong> {translate('search')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
          <div className="space-y-2 text-gray-600">
            <p>• When logged out: Navbar should show Logo, Products, Categories, Cart, and Sign In button</p>
            <p>• When logged in: Navbar should show Logo, Home, Products, Categories, About, Contact, Search bar, Cart, and User profile dropdown</p>
            <p>• Language selector should only appear when logged out</p>
            <p>• Search bar should only appear when logged in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
