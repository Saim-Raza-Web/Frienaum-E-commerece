'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { Filter, Search, Loader2, X } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';
import MerchantBlocker from '@/components/MerchantBlocker';

interface Category {
  id: string;
  name: string;
  productCount: number;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { addToCart } = useCart();
  const { translate } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Get current language from URL
  const currentLang = pathname?.split('/')[1] || 'de';

  // Fetch products and categories from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch products and categories in parallel with cache-busting
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' }),
          fetch('/api/categories')
        ]);

        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }

        const [productsData, categoriesData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json()
        ]);

        // Transform API data to match Product interface with correct language
        const transformedProducts: Product[] = productsData.map((product: any) => ({
          id: product.id.toString(),
          name: currentLang === 'de' ? (product.title_de || product.title_en) : product.title_en,
          description: currentLang === 'de' ? (product.desc_de || product.desc_en) : product.desc_en,
          price: product.price,
          originalPrice: product.price,
          images: [product.imageUrl || '/images/placeholder.jpg'],
          category: product.category || 'Uncategorized',
          rating: Number(product.averageRating || 0),
          reviewCount: Number(product.ratingCount || 0),
          inStock: product.stock > 0,
          tags: []
        }));

        setProducts(transformedProducts);
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for custom event when rating is deleted/added
    const handleRatingChange = () => {
      fetchData();
    };

    window.addEventListener('ratingChanged', handleRatingChange);

    return () => {
      window.removeEventListener('ratingChanged', handleRatingChange);
    };
  }, [currentLang]);

  useEffect(() => {
    const categoryParam = searchParams?.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Pick up the search query from URL (?search=...) when landing from Navbar
  useEffect(() => {
    const q = searchParams?.get('search') || '';
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Reset price range when category changes
  useEffect(() => {
    setPriceRange(null);
  }, [selectedCategory]);

  // Filter products based on selected filters
  useEffect(() => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    // Apply price range filter
    if (priceRange) {
      switch (priceRange) {
        case 'under50':
          filtered = filtered.filter(product => product.price < 50);
          break;
        case '50to100':
          filtered = filtered.filter(product => product.price >= 50 && product.price <= 100);
          break;
        case '100to200':
          filtered = filtered.filter(product => product.price > 100 && product.price <= 200);
          break;
        case 'over200':
          filtered = filtered.filter(product => product.price > 200);
          break;
        default:
          break;
      }
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, priceRange, products]);

  // Close mobile sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Prevent body horizontal scroll when sidebar is open on mobile
    if (isMobileSidebarOpen) {
      document.body.style.overflowX = 'hidden';
      document.body.style.position = 'fixed'; // Prevents body scroll jump
      document.body.style.width = '100vw';
    } else {
      document.body.style.overflowX = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    // Clean up in case route changes
    return () => {
      document.body.style.overflowX = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobileSidebarOpen]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Close mobile sidebar when category is selected
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen(false);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <MerchantBlocker>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar Filters - Responsive design */}
          <div className={`lg:w-64 flex-shrink-0 lg:block ${isMobileSidebarOpen ? 'block' : 'hidden'} lg:sticky lg:top-20`}>
            {/* Mobile backdrop */}
            {isMobileSidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={closeMobileSidebar}
              />
            )}
            {/* Sidebar content */}
            <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-20 contain-layout contain-paint contain-content contain-strict transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed lg:relative top-0 left-0 h-full lg:h-auto w-80 lg:w-auto z-50 lg:z-auto overflow-y-auto overflow-x-hidden`} style={{maxWidth: '20rem', minWidth: '16rem', boxSizing: 'border-box', overscrollBehaviorX: 'none', overflowX: 'hidden'}}>
              {/* Close button for mobile */}
              <div className="flex justify-between items-center mb-3 sm:mb-4 lg:hidden">
                <h3 className="text-sm sm:text-base font-montserrat font-semibold text-primary-800 flex items-center">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {translate('filters')}
                </h3>
                <button
                  onClick={closeMobileSidebar}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Desktop title (hidden on mobile) */}
              <h3 className="hidden lg:flex text-sm sm:text-base font-montserrat font-semibold text-primary-800 mb-3 sm:mb-4 items-center">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {translate('filters')}
              </h3>
              
              {/* Search */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-montserrat font-medium text-primary-700 mb-2">
                  {translate('searchProducts')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={translate('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 sm:h-10 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-inset focus:ring-1 focus:ring-turquoise-500 focus:border-turquoise-600 transition-all duration-150 text-sm text-gray-900"
                    style={{
                      boxSizing: 'border-box',
                      contain: 'layout style paint'
                    }}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-montserrat font-medium text-primary-700 mb-2 sm:mb-3">
                  {translate('categories')}
                </label>
                <div className="space-y-1 sm:space-y-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 border text-sm ${
                      selectedCategory === 'all'
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    {translate('allCategories')} ({products.length})
                  </button>
                  {categories.map((category) => {
                    const categoryProducts = products.filter(product => product.category.toLowerCase() === category.name.toLowerCase());
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 border text-sm ${
                          selectedCategory === category.name
                            ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 border-transparent'
                        }`}
                      >
                        {translate(category.name)} ({categoryProducts.length})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-montserrat font-medium text-primary-700 mb-3">
                  {translate('priceRange')}
                </label>
                <div className="space-y-2">
                  <button 
                    onClick={() => setPriceRange(priceRange === 'under50' ? null : 'under50')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 border ${
                      priceRange === 'under50' 
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    {translate('under50')}
                  </button>
                  <button 
                    onClick={() => setPriceRange(priceRange === '50to100' ? null : '50to100')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 border ${
                      priceRange === '50to100' 
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    {translate('50to100')}
                  </button>
                  <button 
                    onClick={() => setPriceRange(priceRange === '100to200' ? null : '100to200')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 border ${
                      priceRange === '100to200' 
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    {translate('100to200')}
                  </button>
                  <button 
                    onClick={() => setPriceRange(priceRange === 'over200' ? null : 'over200')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 border ${
                      priceRange === 'over200' 
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    {translate('over200')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Responsive design */}
          <div className="flex-1 contain-content">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={toggleMobileSidebar}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-primary-700 border border-gray-200 hover:border-primary-300"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">{translate('filters')}</span>
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-montserrat font-bold text-primary-800 mb-2">
              {selectedCategory === 'all' ? translate('allProducts') : `${translate(selectedCategory)} ${translate('categoryProducts').replace('{category}', '')}`}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {selectedCategory === 'all'
                ? translate('discoverCollection')
                : translate('browseCategory').replace('{category}', selectedCategory)
              }
            </p>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-turquoise-600 mr-2" />
                <span className="text-gray-600">{translate('loading')}</span>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h3 className="text-base font-montserrat font-medium text-primary-800 mb-2">
                  {translate('errorLoadingProducts')}
                </h3>
                <p className="text-gray-600">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Responsive product grid: 1col xs, 2col sm/md, 3col lg/xl */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                  {filteredProducts.map((product, idx) => (
                    <div key={product.id}>
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    </div>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <h3 className="text-base font-montserrat font-medium text-primary-800 mb-2">
                      {translate('noProductsFound')}
                    </h3>
                    <p className="text-gray-600">
                      {translate('adjustSearch')}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </MerchantBlocker>
  );
}
