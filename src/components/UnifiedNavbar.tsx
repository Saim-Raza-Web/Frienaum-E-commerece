'use client';

import React, { useState, useEffect } from 'react';
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
  ShoppingBag,
  Package,
  Search,
  Globe
} from 'lucide-react';

const NavLink = ({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) => {
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'en';
  const isActive = pathname.includes(href) && href !== '/';
  
  return (
    <Link 
      href={`/${lang}${href}`} 
      className={`px-3 py-2 text-sm font-medium transition-colors ${className} ${
        isActive 
          ? 'text-turquoise-600 border-b-2 border-turquoise-500' 
          : 'text-gray-600 hover:text-turquoise-600'
      }`}
    >
      {children}
    </Link>
  );
};

export default function UnifiedNavbar() {
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'en';
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);

  const { cartItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { translate } = useTranslation();

  const cartItemCount = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setTimeout(() => {
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

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/${lang}/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const changeLanguage = (newLang: string) => {
    setIsLanguageOpen(false);
    if (newLang === lang) return;
    
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
    router.push(`/${newLang}${pathWithoutLocale}`);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ];

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
                  onError={(e) => {
                    if (typeof window === 'undefined') return;
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-8 h-8 rounded-lg bg-turquoise-600 text-white flex items-center justify-center';
                    fallback.innerHTML = '<span class="text-lg font-bold">F</span>';
                    target.parentNode?.insertBefore(fallback, target);
                  }}
                />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">Feinraum</span>
            </Link>
          </div>

          {/* Desktop Navigation - Different content based on auth status */}
          <div className="hidden md:block flex-1">
            <div className="ml-10 flex items-baseline space-x-8">
              {isAuthenticated ? (
                // Logged in navigation
                <>
                  <Link href={`/${lang}/`} className="text-gray-600 hover:text-turquoise-600 px-3 py-2 text-sm font-medium transition-colors">
                    {translate('home')}
                  </Link>
                  <NavLink href="/products">{translate('navigation.products')}</NavLink>
                  <NavLink href="/categories">{translate('navigation.categories')}</NavLink>
                  <NavLink href="/about">{translate('about')}</NavLink>
                  <NavLink href="/contact">{translate('contact')}</NavLink>
                </>
              ) : (
                // Logged out navigation - moved to left side with logo
                <>
                  <NavLink href="/products">{translate('navigation.products')}</NavLink>
                  <NavLink href="/categories">{translate('navigation.categories')}</NavLink>
                </>
              )}
            </div>
          </div>

          {/* Right side - Search, Cart, User/Language */}
          <div className="flex items-center space-x-4">
            {/* Search Bar - Only show when logged in */}
            {isAuthenticated && (
              <div className="hidden lg:block">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    className="block w-64 pl-3 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-turquoise-500 focus:border-turquoise-500 text-sm"
                    placeholder={translate('search')}
                  />
                </div>
              </div>
            )}

            {/* Language Selector - Show for both logged in and out */}
            <div className="relative">
              <button 
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                onBlur={() => setTimeout(() => setIsLanguageOpen(false), 200)}
                className="flex items-center text-gray-700 hover:text-turquoise-600 focus:outline-none"
              >
                <Globe className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">{lang.toUpperCase()}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div 
                className={`absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none ${isLanguageOpen ? 'block' : 'hidden'} z-[100]`}
              >
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => changeLanguage(language.code)}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      lang === language.code
                        ? 'bg-turquoise-50 text-turquoise-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {language.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart - Show for both logged in and out */}
            <Link href={`/${lang}/cart`} className="relative p-2 text-gray-600 hover:text-turquoise-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-turquoise-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu or Sign In */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-turquoise-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-turquoise-500 to-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.firstName?.charAt(0) || 'U'}
                      {user.lastName?.charAt(0) || ''}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user.firstName || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || 'User'}
                      </p>
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

                    <Link
                      href={`/${lang}/orders`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      {translate('orders')}
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
              <Link href={`/${lang}/login`} className="btn-login">
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
            {/* Mobile Search - Only show when logged in */}
            {isAuthenticated && (
              <div className="px-3 py-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    className="block w-full pl-3 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-turquoise-500 focus:border-turquoise-500 text-sm"
                    placeholder={translate('search')}
                  />
                </div>
              </div>
            )}

            {/* Mobile Language Selector - Show for both logged in and out */}
            <div className="px-3 py-2">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Language:</span>
                <div className="flex space-x-2">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => changeLanguage(language.code)}
                      className={`px-2 py-1 text-xs rounded ${
                        lang === language.code
                          ? 'bg-turquoise-100 text-turquoise-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {language.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            {isAuthenticated ? (
              // Logged in mobile navigation
              <>
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
              </>
            ) : (
              // Logged out mobile navigation
              <>
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
              </>
            )}

            {/* User-specific mobile links */}
            {isAuthenticated && user && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <Link
                  href={`/${lang}/profile`}
                  className="block px-3 py-2 text-gray-600 hover:text-turquoise-600 text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {translate('profile')}
                </Link>
                <Link
                  href={`/${lang}/orders`}
                  className="block px-3 py-2 text-gray-600 hover:text-turquoise-600 text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {translate('orders')}
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
