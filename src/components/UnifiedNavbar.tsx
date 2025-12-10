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
  Globe
} from 'lucide-react';
import SmartImage from '@/components/SmartImage';

const NavLink = ({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) => {
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'de';
  const isActive = pathname.includes(href) && href !== '/';
  
  return (
    <Link 
      href={`/${lang}${href}`} 
      className={`inline-flex items-center text-sm font-medium transition-colors duration-200 underline-offset-4 ${className} ${
        isActive 
          ? 'text-[var(--color-primary-700)] underline'
          : 'text-gray-700 hover:text-[var(--color-primary-700)] hover:underline'
      }`}
    >
      {children}
    </Link>
  );
};

export default function UnifiedNavbar() {
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'de';
  const router = useRouter();
  const homePath = `/${lang}`;
  const isHomeActive = pathname === homePath || pathname === `${homePath}/`;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);

  const { cartItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { translate } = useTranslation();

  const getUserMenuLabel = (key: string, fallback: string) => {
    const label = translate(`userMenu.${key}`);
    return label === `userMenu.${key}` ? fallback : label;
  };

  const getRoleLabel = () => {
    if (!user?.role) return '';
    const roleKey = `role.${user.role.toUpperCase()}`;
    const label = translate(roleKey);
    if (!label || label === roleKey) {
      return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
    return label;
  };

  const userMenuLabels = {
    profile: getUserMenuLabel('profile', 'Profile'),
    orders: getUserMenuLabel('orders', 'Orders'),
    merchantDashboard: getUserMenuLabel('merchantDashboard', 'Merchant Dashboard'),
    adminPanel: getUserMenuLabel('adminPanel', 'Admin Panel'),
    logout: getUserMenuLabel('logout', 'Log out'),
  };

  const userRoleLabel = getRoleLabel();

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

    // Prevent customers from being redirected to merchant pages
    if (user?.role !== 'merchant' && user?.role !== 'admin' && pathWithoutLocale.startsWith('/merchant')) {
      // Redirect customers to home page instead of merchant pages
      router.push(`/${newLang}/`);
      return;
    }

    router.push(`/${newLang}${pathWithoutLocale}`);
  };

  const languages = [
    { code: 'de', name: 'Deutsch' },
    { code: 'en', name: 'English' }
  ];

  return (
    <nav className="w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40 shadow-sm overflow-visible" suppressHydrationWarning={true}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex w-full items-center justify-between gap-2 sm:gap-4 py-2 sm:py-3 lg:py-4 min-w-0">
          {/* Logo */}
          <div className="flex-shrink-0 min-w-0">
            <Link href={`/${lang}/`} className="flex min-w-0 items-center gap-0 group">
              <div className="relative h-6 w-14 sm:h-8 sm:w-20 flex-shrink-0">
                <SmartImage 
                  src="/images/Logo.png" 
                  alt="Feinraumshop Logo" 
                  fill 
                  sizes="(max-width: 640px) 80px, 96px"
                  className="object-contain transition-transform duration-200 group-hover:scale-105"
                  priority={lang === 'de'}
                  style={{ filter: 'invert(37%) sepia(53%) saturate(946%) hue-rotate(336deg) brightness(90%) contrast(100%)' }}
                />
              </div>
              <span className="font-montserrat font-bold text-sm sm:text-lg lg:text-xl text-primary-800 group-hover:text-primary-600 transition-colors truncate -ml-1 sm:-ml-3.5">Feinraumshop</span>
            </Link>
          </div>

          {/* Desktop Navigation - Clean minimalist design */}
          <div className="hidden lg:block flex-1">
            <div className="ml-8 flex items-center gap-8">
              {/* For merchants, show dashboard link instead of shopping links */}
              {isAuthenticated && user?.role === 'merchant' ? (
                <>
                  <NavLink href="/merchant" className="font-lora">
                    {translate('merchant.dashboard') || 'Merchant Dashboard'}
                  </NavLink>
                  <NavLink href="/about" className="font-lora">{translate('about')}</NavLink>
                  <NavLink href="/contact" className="font-lora">{translate('contact')}</NavLink>
                </>
              ) : (
                <>
                  <Link
                    href={`/${lang}/`}
                    className={`font-lora inline-flex items-center text-sm transition-colors duration-200 underline-offset-4 ${
                      isHomeActive
                        ? 'text-[var(--color-primary-700)] underline'
                        : 'text-gray-700 hover:text-[var(--color-primary-700)] hover:underline active:text-[var(--color-primary-800)] active:underline'
                    }`}
                  >
                    {translate('home')}
                  </Link>
                  <NavLink
                    href="/products"
                    className="font-lora"
                  >
                    {translate('navigation.products')}
                  </NavLink>
                  <NavLink href="/categories" className="font-lora">{translate('navigation.categories')}</NavLink>
                  <NavLink href="/about" className="font-lora">{translate('about')}</NavLink>
                  <NavLink href="/contact" className="font-lora">{translate('contact')}</NavLink>
                </>
              )}
            </div>
          </div>

          {/* Right side - Search, Cart, User/Language */}
          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 flex-shrink-0 ml-auto lg:pl-6">
            {/* Search Bar - Responsive design (hidden for merchants) */}
            {(!isAuthenticated || user?.role !== 'merchant') && (
              <div className="hidden sm:block">
                <div className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    className="w-40 sm:w-48 lg:w-56 xl:w-64 px-3 sm:px-4 h-10 bg-white border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 font-lora text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 hover:border-gray-300"
                    placeholder={translate('searchPlaceholder') || 'Search products...'}
                  />
                </div>
              </div>
            )}

            {/* Language Selector - Responsive design */}
            <div className="relative">
              <button 
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                onBlur={() => setTimeout(() => setIsLanguageOpen(false), 200)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-primary-200 rounded-full border border-gray-200 px-2.5 py-1 bg-white transition-colors duration-200 hover:bg-gray-50"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:block text-sm font-lora font-medium min-w-[2.5ch] max-w-[2.5ch] text-center overflow-hidden">{lang.toUpperCase()}</span>
                <span className="sr-only sm:hidden">{lang.toUpperCase()}</span>
                <ChevronDown className="ml-0.5 h-3 w-3 hidden sm:block" />
              </button>
              <div 
                className={`absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-xl py-2 border border-primary-100 ${isLanguageOpen ? 'block' : 'hidden'} z-[100]`}
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

            {/* Cart - Responsive design (hidden for merchants) */}
            {(!isAuthenticated || user?.role !== 'merchant') && (
              <Link href={`/${lang}/cart`} className="relative inline-flex h-9 w-9 items-center justify-center text-gray-600 hover:text-[var(--color-primary-700)] transition-colors duration-200 rounded-full hover:bg-gray-50">
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cta-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-montserrat font-bold shadow-sm text-[10px] sm:text-xs">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu or Sign In - Responsive design */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 text-gray-700 hover:text-[var(--color-primary-700)] transition-colors rounded-full hover:bg-gray-50"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-bold">
                      {user.firstName?.charAt(0) || 'U'}
                      {user.lastName?.charAt(0) || ''}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user.firstName || 'User'}
                  </span>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 max-w-[160px] truncate whitespace-nowrap overflow-hidden" title={user.email}>
                        {user.email}
                      </p>
                      <p className="text-xs text-primary-600 font-medium">{userRoleLabel}</p>
                    </div>
                    
                    <Link
                      href={`/${lang}/profile`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-700)]"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      {userMenuLabels.profile}
                    </Link>

                    {/* Show orders link only for customers, not merchants */}
                    {user.role !== 'merchant' && (
                      <Link
                        href={`/${lang}/orders`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-700)]"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        {userMenuLabels.orders}
                      </Link>
                    )}

                    {user.role === 'merchant' && (
                      <Link
                        href={`/${lang}/merchant`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-700)]"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        {userMenuLabels.merchantDashboard}
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        href={`/${lang}/admin`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-700)]"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        {userMenuLabels.adminPanel}
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {userMenuLabels.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href={`/${lang}/login`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-[var(--color-primary-700)] rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                <User className="w-4 h-4" />
                <span className="hidden sm:block">{translate('signIn')}</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:text-[var(--color-primary-700)] hover:bg-gray-50 transition-colors sm:hidden"
            
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-3 sm:px-4 pt-2 pb-3 space-y-3 bg-white border-t border-gray-100 ">
            {/* Mobile Search (hidden for merchants) */}
            {(!isAuthenticated || user?.role !== 'merchant') && (
              <div className="py-2">
                <div className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    className="search-input block w-full px-4 py-2 rounded-full placeholder-gray-500 text-gray-900 text-sm transition-all duration-200 focus:outline-none"
                    placeholder={translate('searchPlaceholder') || 'Search...'}
                  />
                </div>
              </div>
            )}

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
                {/* For merchants, show dashboard link instead of shopping links */}
                {user?.role === 'merchant' ? (
                  <>
                    <Link
                      href={`/${lang}/merchant`}
                      className="block px-3 py-2 text-gray-700 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded text-base"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {translate('merchant.dashboard') || 'Merchant Dashboard'}
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
                )}
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
                  {userMenuLabels.profile}
                </Link>
                {/* Show orders link only for customers, not merchants */}
                {user.role !== 'merchant' && (
                  <Link
                    href={`/${lang}/orders`}
                    className="block px-3 py-2 text-gray-700 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded text-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {userMenuLabels.orders}
                  </Link>
                )}
                {user.role === 'merchant' && (
                  <Link
                    href={`/${lang}/merchant`}
                    className="block px-3 py-2 text-gray-700 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded text-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {userMenuLabels.merchantDashboard}
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    href={`/${lang}/admin`}
                    className="block px-3 py-2 text-gray-700 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] rounded text-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {userMenuLabels.adminPanel}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600 text-base"
                >
                  {userMenuLabels.logout}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
