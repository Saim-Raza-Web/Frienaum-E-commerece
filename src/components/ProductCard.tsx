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
    <Link href={`/${lang}/product/${product.id}`} className="group">
      <div className="card overflow-hidden">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-sm">{translate('productImage')}</span>
          </div>
          
          {/* Wishlist Button */}
          <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50">
            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
          </button>
          
          {/* Out of Stock Badge */}
          {!product.inStock && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {translate('outOfStock')}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          <p className="text-sm text-turquoise-600 font-medium mb-1">
            {translate(product.category)}
          </p>
          
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-turquoise-600 transition-colors">
            {translate(product.name)}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">
              ({product.reviewCount})
            </span>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
              product.inStock
                ? 'bg-turquoise-500 hover:bg-turquoise-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{product.inStock ? translate('addToCart') : translate('outOfStock')}</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
