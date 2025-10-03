'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';

interface RatingFormProps {
  productId: string;
  orderItemId: string;
  onRatingSubmitted?: () => void;
  onClose?: () => void;
}

export default function RatingForm({ productId, orderItemId, onRatingSubmitted, onClose }: RatingFormProps) {
  const { translate: t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setMessage(t('rating.pleaseSelectRating'));
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          orderItemId,
          rating,
          review: review.trim() || undefined,
        }),
      });

      if (response.ok) {
        setMessage(t('rating.ratingSubmitted'));
        setRating(0);
        setReview('');
        onRatingSubmitted?.();
        setTimeout(() => {
          onClose?.();
        }, 2000);
      } else {
        const error = await response.json();
        setMessage(error.error || t('rating.submitError'));
      }
    } catch (error) {
      setMessage(t('rating.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('rating.rateProduct')}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('rating.yourRating')}
          </label>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      starValue <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              );
            })}
            <span className="ml-2 text-sm text-gray-600">
              {rating > 0 && `${rating} ${t('rating.outOf5')}`}
            </span>
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('rating.writeReview')} ({t('rating.optional')})
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder={t('rating.reviewPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
            rows={4}
            maxLength={500}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {review.length}/500
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isSubmitting || rating === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-turquoise-500 hover:bg-turquoise-600 text-white'
          }`}
        >
          {isSubmitting ? t('rating.submitting') : t('rating.submitRating')}
        </button>

        {/* Message */}
        {message && (
          <div className={`text-sm text-center ${
            message.includes('success') || message.includes(t('rating.ratingSubmitted'))
              ? 'text-green-600'
              : 'text-red-600'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
