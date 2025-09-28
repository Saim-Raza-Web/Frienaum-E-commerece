'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/i18n/TranslationProvider';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  User, 
  LogOut,
  ChevronDown,
  Settings,
  ShoppingBag
} from 'lucide-react';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'en';
  const isActive = pathname.includes(href) && href !== '/';
  
  return (
    <Link 
      href={`/${lang}${href}`} 
      className={`px-3 py-2 text-sm font-medium transition-colors ${
        isActive 
          ? 'text-turquoise-600 border-b-2 border-turquoise-500' 
          : 'text-gray-600 hover:text-turquoise-600'
      }`}
    >
      {children}
    </Link>
  );
};

export default function Navigation() {
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'en';
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { translate } = useTranslation();

  const cartItemCount = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    // Use setTimeout to ensure logout completes before redirect
    setTimeout(() => {
      // Only use window.location.href on client to prevent hydration mismatch
      if (typeof window !== 'undefined') {
        window.location.href = `/${lang}`;
      }
    }, 100);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40" suppressHydrationWarning={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
              <Link href={`/${lang}/`} className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="/images/Feinraum logo icon favicon png.png" 
                    alt="Feinraum Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:inline">Feinraum</span>
              </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href={`/${lang}/`} className="text-gray-600 hover:text-turquoise-600 px-3 py-2 text-sm font-medium transition-colors">
                {translate('home')}
              </Link>
              <NavLink href="/products">{translate('navigation.products')}</NavLink>
              <NavLink href="/categories">{translate('navigation.categories')}</NavLink>
              <NavLink href="/about">{translate('about')}</NavLink>
              <NavLink href="/contact">{translate('contact')}</NavLink>
            </div>
          </div>

          {/* Right side - Cart, User */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href={`/${lang}/cart`} className="relative p-2 text-gray-600 hover:text-turquoise-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-turquoise-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-turquoise-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-turquoise-500 to-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user.firstName}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-turquoise-600 font-medium capitalize">{user.role}</p>
                    </div>
                    
                    <Link
                      href={`/${lang}/profile`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      {translate('profile')}
                    </Link>

                    {user.role === 'merchant' && (
                      <Link
                        href={`/${lang}/merchant`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        {translate('merchantDashboard')}
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        href={`/${lang}/admin`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        {translate('admin.panel')}
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {translate('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href={`/${segments[1] || 'en'}/login`} className="btn-login">
                <User className="w-4 h-4" />
                <span>{translate('signIn')}</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-600 hover:text-turquoise-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <Link
              href={`/${lang}/`}
              className="block px-3 py-2 text-gray-600 hover:text-turquoise-600 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {translate('home')}
            </Link>
            <Link
              href={`/${lang}/products`}
              className="block px-3 py-2 text-gray-600 hover:text-turquoise-600 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {translate('navigation.products')}
            </Link>
            <Link
              href={`/${lang}/categories`}
              className="block px-3 py-2 text-gray-600 hover:text-turquoise-600 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {translate('navigation.categories')}
            </Link>
            <Link
              href={`/${lang}/about`}
              className="block px-3 py-2 text-gray-600 hover:text-turquoise-600 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {translate('about')}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="block px-3 py-2 text-gray-600 hover:text-turquoise-600 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {translate('contact')}
            </Link>
            {isAuthenticated && user && (
              <>
                <Link
                  href={`/${lang}/profile`}
                  className="block px-3 py-2 text-gray-600 hover:text-turquoise-600 text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {translate('profile')}
                </Link>
                {user.role === 'merchant' && (
                  <Link
                    href={`/${lang}/merchant`}
                    className="block px-3 py-2 text-gray-600 hover:text-turquoise-600 text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {translate('merchantDashboard')}
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    href={`/${lang}/admin`}
                    className="block px-3 py-2 text-gray-600 hover:text-turquoise-600 text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {translate('admin.panel')}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-turquoise-600 text-base font-medium"
                >
                  {translate('logout')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 