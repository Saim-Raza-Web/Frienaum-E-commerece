'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const currentLang = pathname?.split('/')[1] || 'en';
  
  // Category images array matching the home page
  const categoryImages = [
    '/images/0bc3a4a9-e8ff-4ccb-84fb-31c2681954e8.avif',
    '/images/56bd60e4-9ceb-4d19-96e2-fbff134f96e6.webp',
    '/images/87bad4ed-4a67-46d2-bbf6-dc07464a66b8.jfif',
    '/images/aa3828cd-3b1b-4988-a260-1a3835961377.webp',
    '/images/ab3774f4-bef8-47fb-8110-231aa1bbdecb.webp',
    '/images/dbf72cec-2063-4f83-9dce-3d9859f3fb40.webp',
    '/images/0bc3a4a9-e8ff-4ccb-84fb-31c2681954e8.avif',
    '/images/56bd60e4-9ceb-4d19-96e2-fbff134f96e6.webp',
  ];

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
<h1 className="text-3xl font-bold text-gray-900">{translate('Categories')}</h1>
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
            {filteredCategories.map((category, index) => (
              <div
                key={category.id}
                className="relative group cursor-pointer h-full"
                onClick={() => router.push(`/${currentLang}/products?category=${encodeURIComponent(category.name)}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/${currentLang}/products?category=${encodeURIComponent(category.name)}`); }}
              >
                <div className="h-full flex flex-col bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                  {/* Category Image */}
                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={categoryImages[index % categoryImages.length]}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-turquoise-600 transition-colors">
                      {translate(category.name)}
                    </h3>
                    
                    {/* Description with fallback */}
                    <div className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                      {category.description ? (
                        translate(category.description)
                      ) : (
                        <span className="text-gray-400 italic">
                          {translate('noDescriptionAvailable')}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          {category.productCount} {translate('products')}
                        </span>
                        <span className="text-sm font-medium text-turquoise-600 group-hover:text-turquoise-700 transition-colors flex items-center">
                          {translate('explore')} <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
