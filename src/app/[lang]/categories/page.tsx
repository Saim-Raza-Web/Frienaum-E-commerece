'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Grid, List, Loader2 } from 'lucide-react';
import { categories as dummyCategories } from '@/lib/dummyData';
import { useTranslation } from '@/i18n/TranslationProvider';
import { Product } from '@/types';

export default function CategoriesPage() {
  const { translate } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const currentLang = pathname?.split('/')[1] || 'en';

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();

        // Transform API data to match Product interface
        const transformedProducts: Product[] = data.map((product: any) => ({
          id: product.id.toString(),
          name: product.title_en,
          description: product.desc_en,
          price: product.price,
          originalPrice: product.price,
          images: [product.imageUrl || '/images/placeholder.jpg'],
          category: product.category || 'Uncategorized',
          rating: 4.5,
          reviewCount: 0,
          inStock: product.stock > 0,
          tags: []
        }));

        setProducts(transformedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Calculate actual product counts for each category
  const categoriesWithCounts = dummyCategories.map(category => {
    const categoryProducts = products.filter(product =>
      product.category.toLowerCase() === category.name.toLowerCase()
    );
    return {
      ...category,
      productCount: categoryProducts.length
    };
  });

  const filteredCategories = categoriesWithCounts.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<h1 className="text-3xl font-bold text-gray-900">{translate('categories')}</h1>
<p className="mt-2 text-gray-600">{translate('shopByCategoryDesc')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={translate('searchCategories')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-turquoise-100 text-turquoise-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-turquoise-100 text-turquoise-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/${currentLang}/products?category=${encodeURIComponent(category.name)}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-turquoise-100 to-primary-100 p-6 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-turquoise-500 to-primary-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-turquoise-600 transition-colors">
                      {translate(category.name)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {category.productCount} {translate('products')}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {translate(category.description)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/${currentLang}/products?category=${encodeURIComponent(category.name)}`}
                className="group block"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-turquoise-500 to-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-turquoise-600 transition-colors">
                        {translate(category.name)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {translate(category.description)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-turquoise-600">
                        {category.productCount} {translate('products')}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {translate('viewAll')} →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {translate('noCategoriesFound')}
            </h3>
            <p className="text-gray-600">
              {translate('adjustSearchTerms')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
