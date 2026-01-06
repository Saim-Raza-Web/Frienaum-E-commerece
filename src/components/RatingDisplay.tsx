'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';

interface Rating {
  id: string;
  rating: number;
  review?: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
  };
}

interface RatingDisplayProps {
  productId: string;
  className?: string;
}

export default function RatingDisplay({ productId, className = '' }: RatingDisplayProps) {
  const { translate: t, currentLocale } = useTranslation();
  const locale = currentLocale || 'de';
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchRatings = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${productId}/ratings?page=${currentPage}&limit=5&lang=${locale}`);
      if (response.ok) {
        const data = await response.json();
        if (currentPage === 1) {
          setRatings(data.ratings);
          setProduct(data.product);
        } else {
          setRatings(prev => [...prev, ...data.ratings]);
        }
        setHasMore(data.pagination.hasNext);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  }, [locale, productId, currentPage]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const loadMore = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && ratings.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Rating Summary */}
      {product && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('rating.customerReviews')}</h3>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{product.averageRating?.toFixed(1) || '0.0'}</div>
              <div className="flex items-center justify-end mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.averageRating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                {t('rating.basedOnReviews', { count: product.ratingCount || 0 })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Ratings */}
      <div className="space-y-4">
        {ratings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p>{t('rating.noReviewsYet')}</p>
          </div>
        ) : (
          ratings.map((rating) => (
            <div key={rating.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rating.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-900">
                    {rating.customer.name}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(rating.createdAt)}
                </span>
              </div>
              {rating.review && (
                <p className="text-gray-700 leading-relaxed">{rating.review}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-turquoise-500 text-white rounded-md hover:bg-turquoise-600 transition-colors"
          >
            {t('rating.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
