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
          ? 'text-[var(--color-primary-700)] border-b-2 border-[var(--color-primary-700)]' 
          : 'text-gray-600 hover:text-[var(--color-primary-700)]'
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
    <nav className="bg-white/95 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-40 shadow-sm" suppressHydrationWarning={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={`/${lang}/`} className="flex items-center gap-3 group">
              <img 
                src="/images/Logo.png" 
                alt="Feinraum Logo" 
                className="h-10 w-auto transition-transform duration-200 group-hover:scale-105" 
                style={{ filter: 'invert(37%) sepia(53%) saturate(946%) hue-rotate(336deg) brightness(90%) contrast(100%)' }}
              />
              <span className="font-montserrat font-bold text-xl text-primary-800 group-hover:text-primary-600 transition-colors">Feinraum</span>
            </Link>
          </div>

          {/* Desktop Navigation - Clean minimalist design */}
          <div className="hidden lg:block flex-1">
            <div className="ml-8 flex items-center gap-6">
              <Link href={`/${lang}/`} className="font-lora text-primary-700 hover:text-primary-500 transition-colors duration-200">
                {translate('home')}
              </Link>
              <NavLink href="/products" className="font-lora">{translate('navigation.products')}</NavLink>
              <NavLink href="/categories" className="font-lora">{translate('navigation.categories')}</NavLink>
              <NavLink href="/about" className="font-lora">{translate('about')}</NavLink>
              <NavLink href="/contact" className="font-lora">{translate('contact')}</NavLink>
            </div>
          </div>

          {/* Right side - Search, Cart, User/Language */}
          <div className="flex items-center gap-4">
            {/* Search Bar - Prominent and clean */}
            <div className="hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-4 h-4" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="w-64 pl-10 pr-4 py-3 bg-primary-50 border border-primary-200 rounded-full placeholder-primary-400 text-primary-800 font-lora text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 hover:bg-primary-100"
                  placeholder="Search products..."
                />
              </div>
            </div>

            {/* Language Selector - Minimalist design */}
            <div className="relative">
              <button 
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                onBlur={() => setTimeout(() => setIsLanguageOpen(false), 200)}
                className="flex items-center text-primary-600 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 rounded-lg px-3 py-2 transition-colors duration-200"
              >
                <Globe className="h-4 w-4 mr-2" />
                <span className="text-sm font-lora font-medium">{lang.toUpperCase()}</span>
                <ChevronDown className="ml-1 h-3 w-3" />
              </button>
              <div 
                className={`absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl py-2 border border-primary-100 ${isLanguageOpen ? 'block' : 'hidden'} z-[100]`}
              >
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => changeLanguage(language.code)}
                    className={`w-full text-left px-4 py-2 text-sm font-lora transition-colors duration-200 ${lang === language.code ? 'bg-primary-50 text-primary-700 font-medium' : 'text-primary-600 hover:bg-primary-50 hover:text-primary-700'}`}
                  >
                    {language.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart - Clean minimalist design */}
            <Link href={`/${lang}/cart`} className="relative p-3 text-primary-600 hover:text-primary-500 transition-colors duration-200 rounded-lg hover:bg-primary-50 group">
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cta-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-montserrat font-bold shadow-sm">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu or Sign In */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 p-2 text-gray-600 hover:text-[var(--color-primary-700)] transition-colors rounded-lg hover:bg-[var(--color-primary-50)]"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-primary-600 font-medium capitalize">{user.role}</p>
                    </div>
                    
                    <Link
                      href={`/${lang}/profile`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-700)]"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      {translate('profile')}
                    </Link>

                    <Link
                      href={`/${lang}/orders`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-700)]"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      {translate('orders')}
                    </Link>

                    {user.role === 'merchant' && (
                      <Link
                        href={`/${lang}/merchant`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-700)]"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        {translate('merchantDashboard')}
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        href={`/${lang}/admin`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-700)]"
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
              <Link href={`/${lang}/login`} className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-[var(--color-primary-700)] rounded-lg hover:bg-[var(--color-primary-50)] transition-colors">
                <User className="w-4 h-4" />
                <span>{translate('signIn')}</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-600 hover:text-[var(--color-primary-700)] transition-colors rounded hover:bg-[var(--color-primary-50)]"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-3 bg-white border-t border-gray-100">
            {/* Mobile Search */}
            <div className="py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="search-input block w-full pl-9 pr-3 py-2 rounded-full placeholder-gray-500 text-sm transition-all duration-200 focus:outline-none"
                  placeholder="Search..."
                />
              </div>
            </div>

            {/* Mobile Language Selector - Show for both logged in and out */}
            <div className="px-1 py-2">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Language:</span>
                <div className="flex space-x-2">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => changeLanguage(language.code)}
                      className={`px-2 py-1 text-xs rounded ${lang === language.code ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]' : 'text-gray-600 hover:bg-[var(--color-primary-50)]'}`}
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
                  className="block px-3 py-2 text-gray-700 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {translate('home')}
                </Link>
                <Link
                  href={`/${lang}/products`}
                  className="block px-3 py-2 text-gray-700 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {translate('navigation.products')}
                </Link>
                <Link
                  href={`/${lang}/categories`}
                  className="block px-3 py-2 text-gray-700 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {translate('navigation.categories')}
                </Link>
                <Link
                  href={`/${lang}/about`}
                  className="block px-3 py-2 text-gray-700 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {translate('about')}
                </Link>
                <Link
                  href={`/${lang}/contact`}
                  className="block px-3 py-2 text-gray-700 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded text-base"
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
                  className="block px-3 py-2 text-gray-600 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {translate('navigation.products')}
                </Link>
                <Link
                  href={`/${lang}/categories`}
                  className="block px-3 py-2 text-gray-600 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded text-base font-medium"
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
                  className="block px-3 py-2 text-gray-700 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {translate('profile')}
                </Link>
                <Link
                  href={`/${lang}/orders`}
                  className="block px-3 py-2 text-gray-700 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {translate('orders')}
                </Link>
                {user.role === 'merchant' && (
                  <Link
                    href={`/${lang}/merchant`}
                    className="block px-3 py-2 text-gray-700 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded text-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {translate('merchantDashboard')}
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    href={`/${lang}/admin`}
                    className="block px-3 py-2 text-gray-700 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded text-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {translate('admin.panel')}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600 text-base"
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
