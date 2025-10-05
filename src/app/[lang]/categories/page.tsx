'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Grid, List, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';
import { Category } from '@/types';

export default function CategoriesPage() {
  const { translate } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const currentLang = pathname?.split('/')[1] || 'en';

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback to dummy data if database is not available
        setError(err instanceof Error ? err.message : 'Failed to load categories');
        // For now, we'll keep the categories empty if database fails
        // In a production app, you might want to show dummy data as fallback
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(category =>
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
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-lg">
              <div className="relative">
                {/* <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                <input
                  type="text"
                  placeholder={translate('searchCategories')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md transition-shadow duration-200"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-turquoise-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-turquoise-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-turquoise-600 mr-2" />
            <span className="text-gray-600">{translate('loading')}</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {translate('errorLoadingCategories')}
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              {translate('tryAgain')}
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/${currentLang}/products?category=${encodeURIComponent(category.name)}`}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 relative">
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden">
                    {category.firstProduct?.imageUrl ? (
                      <img
                        src={category.firstProduct.imageUrl}
                        alt={category.firstProduct.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* Fallback gradient background */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-br from-turquoise-500 to-primary-500 flex items-center justify-center ${category.firstProduct?.imageUrl ? 'hidden' : 'flex'}`}
                    >
                      <span className="text-5xl text-white font-bold">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {/* Overlay with category info */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                      <div className="text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-lg font-bold mb-2">{translate(category.name)}</p>
                        <p className="text-sm mb-2">{category.productCount} {translate('products')}</p>
                        <p className="text-xs px-4 leading-relaxed">
                          {translate(category.description)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-turquoise-600 transition-colors duration-200 mb-2">
                      {translate(category.name)}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {category.productCount} {translate('products')}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      {translate(category.description)}
                    </p>
                    <div className="flex items-center text-turquoise-600 group-hover:text-turquoise-700 transition-colors duration-200">
                      <span className="text-sm font-semibold">{translate('explore')}</span>
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
