'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  id: string;
  customerName: string;
  reviewText: string;
  rating: number;
  customerPhoto?: string | null;
  productName?: string;
  createdAt: string;
}

interface ReviewsSliderProps {
  reviews: Review[];
  autoSlide?: boolean;
  slideInterval?: number;
}

const ReviewsSlider: React.FC<ReviewsSliderProps> = ({
  reviews,
  autoSlide = true,
  slideInterval = 6000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide || reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
      );
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, slideInterval, reviews.length]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Truncate review text to 150 characters
  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Render stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating
            ? 'text-orange-400 fill-current'
            : 'text-gray-200'
        }`}
      />
    ));
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 font-lora text-lg">No reviews available yet.</p>
      </div>
    );
  }

  // Determine how many reviews to show based on screen size
  const getReviewsToShow = () => {
    const reviewsToShow = [];
    const maxPerSlide = 3; // Desktop: 3, Tablet: 2, Mobile: 1 (handled by CSS)
    
    for (let i = 0; i < Math.min(maxPerSlide, reviews.length); i++) {
      const index = (currentIndex + i) % reviews.length;
      reviewsToShow.push(reviews[index]);
    }
    return reviewsToShow;
  };

  const visibleReviews = getReviewsToShow();

  return (
    <div className="relative w-full reviews-slider">
      {/* Reviews Container */}
      <div className="overflow-hidden">
        <div 
          className={`flex transition-transform duration-300 ease-in-out ${
            isTransitioning ? 'transform-gpu' : ''
          }`}
        >
          <div className="flex w-full space-x-4 md:space-x-6">
            {visibleReviews.map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3"
              >
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full border border-gray-100">
                  {/* Customer Photo */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                      {review.customerPhoto ? (
                        <img
                          src={review.customerPhoto}
                          alt={review.customerName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center text-orange-600 font-montserrat font-semibold text-lg ${review.customerPhoto ? 'hidden' : ''}`}>
                        {review.customerName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex justify-center mb-4">
                    {renderStars(review.rating)}
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 font-lora text-center mb-4 leading-relaxed">
                    "{truncateText(review.reviewText)}"
                  </p>

                  {/* Customer Name */}
                  <div className="text-center">
                    <p className="font-montserrat font-semibold text-gray-800 mb-1">
                      {review.customerName}
                    </p>
                    <p className="text-sm text-gray-500">Verified Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {reviews.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
            aria-label="Next review"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {reviews.length > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-orange-400 scale-125'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsSlider;
