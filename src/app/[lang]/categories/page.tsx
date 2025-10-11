'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Grid, List, Loader2, AlertCircle } from 'lucide-react';
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
  
  // Get the appropriate image source for a category
  const getCategoryImage = (category: Category) => {
    // Use the category image if available
    if (category.image) return category.image;
    
    // Otherwise use the first product's image if available
    if (category.firstProduct?.imageUrl) return category.firstProduct.imageUrl;
    
    // Fallback to a placeholder image
    return '/images/placeholder-category.jpg';
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching categories...');
        const response = await fetch(`/api/categories`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch categories:', response.status, errorText);
          throw new Error(`Failed to fetch categories: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Categories data received:', data);
        
        // Transform the data to match the expected format
        const formattedCategories = data.map((category: any) => ({
          ...category,
          name: category.name || 'Unnamed Category',
          description: category.description || '',
          slug: category.slug || `category-${category.id}`,
          image: category.image || '/images/placeholder-category.jpg',
          productCount: category.productCount || 0
        }));
        
        console.log('Formatted categories:', formattedCategories);
        setCategories(formattedCategories);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
          <p className="mt-4 text-gray-600">{translate('loading')}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            {translate('errorLoadingCategories')}
          </h2>
          <p className="mt-2 text-gray-600">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {translate('retry')}
          </button>
        </div>
      </div>
    );
  }

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
                      src={getCategoryImage(category)}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder-category.jpg';
                      }}
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
