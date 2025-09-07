'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search, ChevronDown, Globe } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';
import { locales, type Locale, getTranslations, isValidLocale } from '../i18n/config';

// Import the Translation type from config
import type { Translation } from '../i18n/config';

// Use the Translation type for our translations
type NavTranslations = Translation;

// Type for navigation items
type NavItem = {
  name: keyof Translation['navigation'];
  path: string;
};

// Default English translations as a fallback
const defaultTranslations: NavTranslations = {
  navigation: {
    products: 'Products',
    categories: 'Categories',
    search: 'Search',
    cart: 'Cart',
    profile: 'Profile'
  },
  language: {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch'
  }
};

export default function Navbar() {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const pathname = usePathname() || '';
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [translations, setTranslations] = useState<NavTranslations>(defaultTranslations);
  
  // Extract current locale from pathname or use default 'en'
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentLocale = isValidLocale(pathSegments[0]) ? pathSegments[0] : 'en';

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const loadedTranslations = await getTranslations(currentLocale);
        setTranslations(loadedTranslations);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fall back to default translations if loading fails
        setTranslations(defaultTranslations);
      }
    };
    
    loadTranslations();
  }, [currentLocale]);
  
  // Navigation items with translations
  const navItems: NavItem[] = [
    { name: 'products', path: '/products' },
    { name: 'categories', path: '/categories' },
  ];
  
  // Language options - use default translations to avoid type issues
  const languages = [
    { code: 'en' as const, name: translations?.language?.en || 'English' },
    { code: 'es' as const, name: translations?.language?.es || 'Español' },
    { code: 'fr' as const, name: translations?.language?.fr || 'Français' },
    { code: 'de' as const, name: translations?.language?.de || 'Deutsch' },
  ] as const;
  
  const changeLanguage = (newLang: string) => {
    if (!locales.includes(newLang as Locale)) return;
    
    // Close the language selector
    setIsLanguageOpen(false);
    
    // If we're already on this language, do nothing
    if (newLang === currentLocale) return;
    
    // Get the current path without the locale
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
    
      // Navigate to the same path with the new locale
      startTransition(() => {
        const newPath = `/${newLang}${pathWithoutLocale}`;
        // Navigate to the new path with the selected language
        window.location.href = newPath;
      });
  };
  
  // Helper function to create localized paths
  const createLocalizedPath = (path: string) => `/${currentLocale}${path}`;
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={`/${currentLocale}`} className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white p-1">
                <img 
                  src="/images/Feinraum%20logo%20icon%20favicon%20png.png" 
                  alt="Feinraum Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to text if image fails to load
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
              <span className="text-xl font-bold text-turquoise-600 hidden sm:inline">Feinraum</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={createLocalizedPath(item.path)}
                  className={`px-3 py-2 text-sm font-medium ${
                    pathname.includes(item.path)
                      ? 'text-turquoise-600 border-b-2 border-turquoise-500'
                      : 'text-gray-700 hover:text-turquoise-600'
                  }`}
                >
                  {translations.navigation[item.name]}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center
          ">
            <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
              <div className="max-w-lg w-full lg:max-w-xs">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-turquoise-500 focus:border-turquoise-500 sm:text-sm"
                    placeholder="Search"
                    type="search"
                  />
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button 
                    onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                    onBlur={() => setTimeout(() => setIsLanguageOpen(false), 200)}
                    className="flex items-center text-gray-700 hover:text-turquoise-600 focus:outline-none"
                    aria-expanded={isLanguageOpen}
                    aria-haspopup="true"
                  >
                    <Globe className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">{currentLocale.toUpperCase()}</span>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  <div 
                    className={`absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none ${isLanguageOpen ? 'block' : 'hidden'} z-[100]`}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="language-menu"
                    onMouseDown={(e) => e.preventDefault()} // Prevent focus loss on click
                  >
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => changeLanguage(language.code)}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          currentLocale === language.code
                            ? 'bg-turquoise-50 text-turquoise-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {language.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <Link 
                  href={createLocalizedPath('/search')} 
                  className="text-gray-700 hover:text-turquoise-600 p-2 -m-2"
                  aria-label={translations.navigation.search}
                >
                  <span className="sr-only">{translations.navigation.search}</span>
                  <Search className="h-5 w-5" />
                </Link>
                <Link 
                  href={createLocalizedPath('/cart')} 
                  className="relative text-gray-700 hover:text-turquoise-600 p-2 -m-2"
                  aria-label={translations.navigation.cart}
                >
                  <span className="sr-only">{translations.navigation.cart}</span>
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-turquoise-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
                </Link>
                <Link 
                  href={createLocalizedPath('/profile')} 
                  className="text-gray-700 hover:text-turquoise-600 p-2 -m-2"
                  aria-label={translations.navigation.profile}
                >
                  <span className="sr-only">{translations.navigation.profile}</span>
                  <User className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
