'use client';

import React, { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams, usePathname } from 'next/navigation';

import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/i18n/TranslationProvider';
import { Star, ShoppingCart, Heart, Truck, Shield, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import SmartImage from '@/components/SmartImage';
import MerchantBlocker from '@/components/MerchantBlocker';

const RatingDisplay = dynamic(() => import('@/components/RatingDisplay'), {
  ssr: false,
  loading: () => (
    <div className="h-32 rounded-2xl bg-white shadow-md animate-pulse" />
  )
});

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const { translate: t } = useTranslation();

  const [product, setProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Get current language from URL
  const pathname = usePathname();
  const currentLang = pathname?.split('/')[1] || 'de';

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        // Add cache-busting to ensure fresh data
        const response = await fetch(`/api/products/${productId}?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();

        // Transform API data to match Product interface with correct language and real ratings
        const transformedProduct: Product = {
          id: data.id.toString(),
          name: currentLang === 'de' ? (data.title_de || data.title_en) : data.title_en,
          description: currentLang === 'de' ? (data.desc_de || data.desc_en) : data.desc_en,
          price: data.price,
          originalPrice: data.price,
          images: [data.imageUrl || '/images/placeholder.jpg'],
          category: data.category || 'Uncategorized',
          rating: data.averageRating || 0,
          reviewCount: data.ratingCount || 0,
          inStock: data.stock > 0,
          tags: []
        };

        setProduct(transformedProduct);
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }

    // Refresh product data when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden && productId) {
        fetchProduct();
      }
    };

    // Listen for custom event when rating is deleted/added
    const handleRatingChange = () => {
      if (productId) {
        fetchProduct();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('ratingChanged', handleRatingChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('ratingChanged', handleRatingChange);
    };
  }, [productId, currentLang]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleImageChange = (index: number) => {
    setSelectedImageIndex(index);
  };

  const nextImage = () => {
    if (product) {
      setSelectedImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('productDetail.loadingProduct')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 text-center py-20">
        <div className="text-gray-400 text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('productDetail.productNotFound')}</h1>
        <p className="text-gray-600">{t('productDetail.productNotFoundMessage')}</p>
      </div>
    );
  }

  return (
    <MerchantBlocker>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8">
          <span>{t('home')}</span>
          <span className="mx-2">/</span>
          <span>{t('products')}</span>
          <span className="mx-2">/</span>
          <span>{product.category}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <SmartImage
                src={product.images[selectedImageIndex]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                fallbackSrc="/images/placeholder-product.png"
                priority
              />

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleImageChange(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === selectedImageIndex
                      ? 'border-orange-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="relative w-full h-full">
                    <SmartImage
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      sizes="(max-width: 1024px) 25vw, 12vw"
                      className="object-cover"
                      fallbackSrc="/images/placeholder-product.png"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <p className="text-orange-600 font-medium">{product.category}</p>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      product.rating && product.reviewCount > 0 && i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.reviewCount > 0 ? `(${product.reviewCount} ${t('productDetail.reviews')})` : t('rating.noReviewsYet')}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                {`${product.price.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                product.inStock ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                {product.inStock ? t('inStock') : t('outOfStock')}
              </span>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">{t('productDetail.quantity')}</label>
                <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-primary-900 bg-white hover:bg-gray-100 transition-colors border-none outline-none"
                    type="button"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 text-primary-900 font-semibold bg-white select-none" style={{ minWidth: '2.5rem', textAlign: 'center' }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-primary-900 bg-white hover:bg-gray-100 transition-colors border-none outline-none"
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-colors ${
                    product.inStock
                      ? 'btn-primary'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{product.inStock ? t('addToCart') : t('outOfStock')}</span>
                </button>
                
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-600">{t('freeShipping')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-600">{t('securePayment')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-600">{t('fastDelivery')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('productDetail.customerReviews')}</h2>
          <Suspense fallback={<div className="h-32 rounded-2xl bg-white shadow-md animate-pulse" />}>
            <RatingDisplay productId={product.id} />
          </Suspense>
        </div>
      </div>
    </div>
    </MerchantBlocker>
  );
}
