'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/i18n/TranslationProvider';
import { Product } from '@/types';
import { ArrowRight, Star, Truck, Shield, Clock } from 'lucide-react';

// Dynamically import the ProductCard component with no SSR
const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
});

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

function HomePage({ params }: HomePageProps) {
  const { lang } = React.use(params);
  const { addToCart } = useCart();
  const { translate } = useTranslation();
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string; productCount: number; firstProduct?: { imageUrl?: string; title?: string } }[]>([]);
  
  // Typing animation state
  const [displayText, setDisplayText] = useState('EStore');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  // Typing animation effect
  useEffect(() => {
    const startTypingAnimation = () => {
      const targetText = 'Feinraum';
      let currentIndex = 0;
      let isDeleting = false;
      
      const typeText = () => {
        if (!isDeleting && currentIndex < targetText.length) {
          // Typing forward
          setDisplayText(targetText.substring(0, currentIndex + 1));
          currentIndex++;
          setTimeout(typeText, 150);
        } else if (isDeleting && currentIndex > 0) {
          // Deleting backward
          setDisplayText(targetText.substring(0, currentIndex - 1));
          currentIndex--;
          setTimeout(typeText, 100);
        } else if (!isDeleting && currentIndex === targetText.length) {
          // Pause before deleting
          setTimeout(() => {
            isDeleting = true;
            typeText();
          }, 2000);
        } else if (isDeleting && currentIndex === 0) {
          // Reset to EStore and pause before typing again
          setDisplayText('EStore');
          setTimeout(() => {
            isDeleting = false;
            typeText();
          }, 1000);
        }
      };
      
      typeText();
    };

    // Start animation after a short delay
    const timer = setTimeout(startTypingAnimation, 1000);
    return () => clearTimeout(timer);
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch products and categories in parallel
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/products'),
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

      // Take first 6 products as featured
      setFeaturedProducts(transformedProducts.slice(0, 6));

      // Use categories from database
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  // categories are built from products fetch above

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-turquoise-500 to-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {translate('welcome')} to <span className="text-white">{displayText}<span className="animate-pulse">|</span></span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            {translate('heroDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="btn-primary text-lg px-8 py-3"
              onClick={() => router.push(`/${lang}/products`)}
            >
              {translate('shopNow')}
            </button>
            <button 
              className="btn-secondary text-lg px-8 py-3"
              onClick={() => router.push(`/${lang}/about`)}
            >
              {translate('learnMore')}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-turquoise-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-turquoise-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{translate('freeShipping')}</h3>
              <p className="text-gray-600">{translate('freeShippingDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-turquoise-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-turquoise-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{translate('securePayment')}</h3>
              <p className="text-gray-600">{translate('securePaymentDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-turquoise-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-turquoise-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{translate('support247')}</h3>
              <p className="text-gray-600">{translate('support247Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {translate('shopByCategory')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {translate('shopByCategoryDesc')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group cursor-pointer"
                onClick={() => router.push(`/${lang}/products?category=${encodeURIComponent(category.name)}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/${lang}/products?category=${encodeURIComponent(category.name)}`); }}
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-turquoise-200 relative">
                  {/* Product Image */}
                  <div className="relative h-32 overflow-hidden">
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
                      <span className="text-4xl text-white font-bold">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {/* Overlay with category info */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-sm font-semibold mb-1">{category.name}</p>
                        <p className="text-xs">{category.productCount} {translate('products')}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-turquoise-600 transition-colors duration-200">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 font-medium">
                      {category.productCount} {translate('products')}
                    </p>
                    <div className="flex items-center justify-center text-turquoise-600 group-hover:text-turquoise-700 transition-all duration-200 group-hover:scale-105">
                      <span className="text-sm font-semibold">{translate('explore')}</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {translate('featuredProducts')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {translate('featuredProductsDesc')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse w-2/3"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={fetchFeaturedProducts} className="btn-primary">
                  {translate('tryAgain')}
                </button>
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-600">{translate('noProductsAvailable')}</p>
              </div>
            ) : (
              featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
              <button 
                className="btn-primary text-lg px-8 py-3" 
                onClick={() => router.push(`/${lang}/products`)}
              >
              {translate('viewAllProducts')}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default HomePage;