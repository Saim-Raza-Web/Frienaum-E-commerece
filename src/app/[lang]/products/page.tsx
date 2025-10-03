'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { Filter, Search, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';

interface Category {
  id: string;
  name: string;
  productCount: number;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const { translate } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const firstMatchRef = useRef<HTMLDivElement | null>(null);

  // Fetch products and categories from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch products
        const productsResponse = await fetch('/api/products');
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const productsData = await productsResponse.json();

        // Transform API data to match Product interface
        const transformedProducts: Product[] = productsData.map((product: any) => ({
          id: product.id.toString(),
          name: product.title_en,
          description: product.desc_en,
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

        // Generate categories from products
        const categoryMap = new Map<string, number>();
        transformedProducts.forEach(product => {
          const category = product.category;
          categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
        });

        const categoriesData: Category[] = Array.from(categoryMap.entries()).map(([name, productCount], index) => ({
          id: (index + 1).toString(),
          name,
          productCount
        }));

        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, products]);

  // After filtering with a search query, scroll to the first matching product for better UX
  useEffect(() => {
    if (searchQuery && firstMatchRef.current) {
      firstMatchRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [filteredProducts, searchQuery]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                {translate('filters')}
              </h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translate('searchProducts')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={translate('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {translate('categories')}
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-turquoise-100 text-turquoise-700'
                        : 'text-gray-600 hover:bg-gray-100'
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
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.name
                            ? 'bg-turquoise-100 text-turquoise-700'
                            : 'text-gray-600 hover:bg-gray-100'
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
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {translate('priceRange')}
                </label>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                    {translate('under50')}
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                    {translate('50to100')}
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                    {translate('100to200')}
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                    {translate('over200')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedCategory === 'all' ? translate('allProducts') : `${translate(selectedCategory)} ${translate('categoryProducts').replace('{category}', '')}`}
            </h1>
            <p className="text-gray-600 mb-6">
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {translate('errorLoadingProducts')}
                </h3>
                <p className="text-gray-600">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product, idx) => (
                    <div key={product.id} ref={idx === 0 ? firstMatchRef : undefined}>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
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
  );
}
