'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useTranslation } from '@/i18n/TranslationProvider';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { translate } = useTranslation();
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'en';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <Link href={`/${lang}/product/${product.id}`} className="group h-full">
      <div className="card overflow-hidden h-full flex flex-col bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 border border-primary-100 hover:border-primary-200">
        {/* Product Image - High quality with white background */}
        <div className="relative aspect-[4/3] overflow-hidden bg-white">
          <div className="w-full h-full">
            {product.images && product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/images/placeholder-product.png';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                <span className="text-primary-400 text-sm font-lora">{translate('productImage')}</span>
              </div>
            )}
          </div>
          
          {/* Wishlist Button - Minimalist design */}
          <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110">
            <Heart className="w-4 h-4 text-primary-400 hover:text-cta-500 transition-colors duration-200" />
          </button>
          
          {/* Out of Stock Badge */}
          {!product.inStock && (
            <div className="absolute top-3 left-3 bg-cta-500 text-white text-xs px-3 py-1 rounded-full font-montserrat font-medium shadow-lg">
              {translate('outOfStock')}
            </div>
          )}
        </div>

        {/* Product Info - Responsive layout */}
        <div className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col">
          {/* Category */}
          <p className="text-xs text-primary-500 font-montserrat font-medium mb-1 uppercase tracking-wide">
            {product.category}
          </p>
          
          {/* Product Name - Responsive typography */}
          <h3 className="font-montserrat font-semibold text-primary-800 mb-1 sm:mb-2 group-hover:text-primary-600 transition-colors duration-200 flex-1 text-xs sm:text-sm leading-tight" title={product.name}>
            <span className="line-clamp-2 block">{product.name}</span>
          </h3>
          
          {/* Rating - Responsive design */}
          <div className="flex items-center mb-1 sm:mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-accent-400 fill-current'
                      : 'text-primary-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-primary-500 font-lora ml-1">
              ({product.reviewCount})
            </span>
          </div>
          
          {/* Price - Responsive typography */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-sm sm:text-lg md:text-xl font-montserrat font-bold text-primary-800">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-primary-400 line-through font-lora">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          
          {/* Add to Cart Button - Responsive CTA styling */}
          <div className="mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full flex items-center justify-center space-x-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg font-montserrat font-semibold transition-all duration-200 focus:outline-none text-xs ${
                product.inStock
                  ? 'btn-primary'
                  : 'bg-primary-200 text-primary-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-3 h-3" />
              <span className="text-xs">{product.inStock ? translate('addToCart') : translate('outOfStock')}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
