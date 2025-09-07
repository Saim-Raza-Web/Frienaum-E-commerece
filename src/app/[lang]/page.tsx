'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/i18n/TranslationProvider';
import { products, categories } from '@/lib/dummyData';
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
  
  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const featuredProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-turquoise-500 to-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {translate('welcome')} to EStore
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
              <div key={category.id} className="group cursor-pointer">
                <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-turquoise-100 to-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {translate(category.name)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {category.productCount} {translate('products')}
                  </p>
                  <div className="flex items-center justify-center text-turquoise-600 group-hover:text-turquoise-700 transition-colors">
                    <span className="text-sm font-medium">{translate('explore')}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
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
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
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

      {/* Newsletter Section */}
      <section className="py-16 bg-turquoise-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {translate('stayUpdated')}
          </h2>
          <p className="text-xl mb-8">
            {translate('newsletterDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder={translate('enterEmail')}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="btn-primary bg-white text-turquoise-600 hover:bg-gray-100">
              {translate('subscribe')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;