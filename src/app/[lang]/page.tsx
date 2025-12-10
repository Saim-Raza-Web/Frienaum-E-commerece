'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/i18n/TranslationProvider';
import { Product } from '@/types';
import { ArrowRight, Star, Truck, Shield, Clock } from 'lucide-react';
import SmartImage from '@/components/SmartImage';
import MerchantBlocker from '@/components/MerchantBlocker';

// Dynamically import the ProductCard component with no SSR
const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
});

const ReviewsSlider = dynamic(() => import('@/components/ReviewsSlider'), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full rounded-2xl bg-white shadow-md animate-pulse sm:h-56 lg:h-64" />
  )
});

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

// Category Card Component
const CategoryCard = ({ category, index, lang, router }: { 
  category: { id: string; name: string; image?: string; firstProduct?: { imageUrl?: string } }; 
  index: number; 
  lang: string; 
  router: any 
}) => {
  const { translate } = useTranslation();

  // Fallback to first product image if category image is not available
  const imageSrc = category.image || 
                  (category.firstProduct?.imageUrl || 
                  '/images/placeholder-category.jpg');

  // Translate category name using the translation keys
  const getCategoryTranslationKey = (categoryName: string) => {
    // Map common category names to translation keys (case-insensitive)
    const categoryMap: { [key: string]: string } = {
      'electronics': 'electronics',
      'fashion': 'fashion',
      'home & garden': 'home-garden',
      'home and garden': 'home-garden',
      'sports': 'sports',
      'books': 'books',
      'clothing': 'clothing',
      'accessories': 'accessories',
      'fitness': 'fitness',
      'home': 'home'
    };

    // Try exact match first (case-insensitive)
    const lowerCategoryName = categoryName.toLowerCase();
    if (categoryMap[lowerCategoryName]) {
      return categoryMap[lowerCategoryName];
    }

    // Try partial matches
    for (const [key, value] of Object.entries(categoryMap)) {
      if (lowerCategoryName.includes(key)) {
        return value;
      }
    }

    // Fallback to the original category name as translation key
    return categoryName.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div
      className="relative group cursor-pointer h-full"
      onClick={() => router.push(`/${lang}/products?category=${encodeURIComponent(category.name)}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/${lang}/products?category=${encodeURIComponent(category.name)}`); }}
    >
      <div className="relative h-48 w-full overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow aspect-[4/3]">
        <SmartImage
          src={imageSrc}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          fallbackSrc="/images/placeholder-category.jpg"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
        <h3 className="absolute bottom-4 left-0 right-0 mx-auto text-white text-base font-medium drop-shadow-lg px-4">
          {(() => {
            try {
              const translationKey = getCategoryTranslationKey(category.name);
              const translated = translate(translationKey);
              if (translated && translated !== translationKey && translated !== category.name) {
                return translated;
              }
              return category.name;
            } catch {
              return category.name;
            }
          })()}
        </h3>
      </div>
    </div>
  );
};

function HomePage({ params }: HomePageProps) {
  const { lang } = React.use(params);
  const { addToCart } = useCart();
  const { translate } = useTranslation();
  const router = useRouter();
  
  // Component state
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string; productCount: number; firstProduct?: { imageUrl?: string; title?: string } }[]>([]);
  const [topReviews, setTopReviews] = useState<{ id: string; customerName: string; reviewText: string; rating: number; customerPhoto?: string | null; productName?: string; createdAt: string }[]>([]);
  const [isReviewsVisible, setIsReviewsVisible] = useState(false);
  const [hasRequestedReviews, setHasRequestedReviews] = useState(false);
  const reviewsSectionRef = useRef<HTMLDivElement | null>(null);
  
  // Typing animation state
  const [displayText, setDisplayText] = useState('');
  const words = lang === 'de' ? ['Wohnen', 'Komfort', 'Eleganz', 'Stil'] : ['Living', 'Comfort', 'Elegance', 'Style'];

  // Fetch featured products and categories
  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch products, categories, and reviews in parallel with error handling for each
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store', credentials: 'include' }).then(res => {
          if (!res.ok) throw new Error('Failed to fetch products');
          return res.json();
        }).catch(err => {
          console.error('Products fetch error:', err);
          throw new Error('Failed to load products. Please try again later.');
        }),
        fetch('/api/categories').then(res => {
          if (!res.ok) throw new Error('Failed to fetch categories');
          return res.json();
        }).catch(err => {
          console.error('Categories fetch error:', err);
          return []; // Return empty array for categories if fetch fails
        })
      ]);

      const [productsData, categoriesData] = [productsResponse, categoriesResponse];

      // Transform API data to match Product interface
      const transformedProducts: Product[] = productsData.map((product: any) => ({
        id: product.id.toString(),
        name: lang === 'de' ? product.title_de : product.title_en,
        description: lang === 'de' ? product.desc_de : product.desc_en,
        price: product.price,
        originalPrice: product.price,
        images: [product.imageUrl || '/images/placeholder.jpg'],
        category: product.category || 'Uncategorized',
        rating: Number(product.averageRating || 0),
        reviewCount: Number(product.ratingCount || 0),
        inStock: product.stock > 0,
        tags: []
      }));

      // Take first 5 products as featured
      setFeaturedProducts(transformedProducts.slice(0, 4));

      // Use categories from database
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchFeaturedProducts();

    // Listen for custom event when rating is deleted/added
    const handleRatingChange = () => {
      fetchFeaturedProducts();
    };

    window.addEventListener('ratingChanged', handleRatingChange);

    return () => {
      window.removeEventListener('ratingChanged', handleRatingChange);
    };
  }, [lang]);

  // Typing animation effect
  useEffect(() => {
    // Reset animation state when language changes
    setDisplayText('');
    let wordIndex = 0;

    let currentIndex = 0;
    let isDeleting = false;
    let timeout: NodeJS.Timeout;
    let typingSpeed = 150; // ms per character
    let deleteSpeed = 100; // ms per character when deleting
    let pauseBetweenWords = 2000; // ms to pause between words

    const typeText = () => {
      const currentWord = words[wordIndex % words.length];
      
      if (isDeleting) {
        // Delete text
        setDisplayText(currentWord.substring(0, currentIndex - 1));
        currentIndex--;
        typingSpeed = deleteSpeed;
      } else {
        // Type text
        setDisplayText(currentWord.substring(0, currentIndex + 1));
        currentIndex++;
        typingSpeed = 150;
      }

      // Check if we've finished typing a word
      if (!isDeleting && currentIndex === currentWord.length) {
        // Pause at the end of the word
        typingSpeed = pauseBetweenWords;
        isDeleting = true;
      } else if (isDeleting && currentIndex === 0) {
        // Move to the next word after deleting
        isDeleting = false;
        wordIndex++;
        // Short pause before starting next word
        typingSpeed = 500;
      }

      timeout = setTimeout(typeText, typingSpeed);
    };

    // Start the animation after a short delay
    timeout = setTimeout(typeText, 1000);

    // Cleanup function
    return () => {
      clearTimeout(timeout);
    };
  }, [lang]); // Add lang dependency to re-run animation when language changes

  const fetchTopReviews = useCallback(async () => {
    if (hasRequestedReviews) return;
    setHasRequestedReviews(true);
    try {
      const response = await fetch(`/api/top-reviews?rating=5&limit=8&lang=${lang}`);
      if (!response.ok) {
        console.error('Top reviews API response not ok:', response.status, response.statusText);
        return;
      }
      const data = await response.json();
      setTopReviews(data.reviews || []);
    } catch (err) {
      console.error('Top reviews fetch error:', err);
    }
  }, [hasRequestedReviews, lang]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsReviewsVisible(true);
      return;
    }

    if (!reviewsSectionRef.current) {
      setIsReviewsVisible(true);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsReviewsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsReviewsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        root: null,
        threshold: 0.25,
        rootMargin: '0px 0px -15% 0px',
      }
    );

    observer.observe(reviewsSectionRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isReviewsVisible) {
      fetchTopReviews();
    }
  }, [isReviewsVisible, fetchTopReviews]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  // categories are built from products fetch above

  return (
    <MerchantBlocker>
    <div className="min-h-screen bg-primary-50 overflow-x-hidden">
      {/* Hero Section - Responsive design */}
      <section className="bg-primary-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* Text Content */}
            <div className="w-full lg:w-1/2 xl:pr-16">
              <div className="min-h-[200px] sm:min-h-[240px] md:min-h-[260px] lg:min-h-[320px] flex flex-col justify-center pt-4 sm:pt-8 lg:pt-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-montserrat font-bold text-primary-800 leading-tight">
                  <div className="whitespace-nowrap">{translate('timelessStyle')}</div>
                  <div className="flex items-baseline flex-wrap">
                    <span className="whitespace-nowrap">{translate('modern')}&nbsp;</span>
                    <span className="inline-block min-w-[100px] sm:min-w-[120px] md:min-w-[150px] lg:min-w-[180px] xl:min-w-[220px] text-left text-accent-600">
                      {displayText}
                      {!displayText && <span className="invisible">Comfort</span>}
                    </span>
                  </div>
                </h1>
                <p className="mt-4 sm:mt-6 md:mt-8 text-sm sm:text-base md:text-lg text-primary-600 font-lora max-w-lg leading-relaxed">
                  {translate('heroSubtitle')}
                </p>
                <div className="mt-6 sm:mt-8 md:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button 
                    className="btn-primary px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base"
                    onClick={() => router.push(`/${lang}/products`)}
                  >
                    {translate('shopNow')}
                  </button>
                  <button 
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-orange-500 text-orange-500 font-montserrat font-semibold rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-300 focus:outline-none text-sm sm:text-base"
                    onClick={() => router.push(`/${lang}/about`)}
                  >
                    {translate('learnMore')}
                  </button>
                </div>
              </div>
            </div>

            {/* Image - Responsive design */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px]">
                <SmartImage 
                  src="/images/Hero.webp" 
                  alt="Elegant Home Decor" 
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain lg:object-cover rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl md:shadow-2xl hover:shadow-3xl transition-shadow duration-500"
                  style={{ objectPosition: 'center 10%' }}
                  fallbackSrc="/images/hero.png"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Responsive design */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-4 md:gap-6 overflow-x-auto sm:overflow-x-visible pb-3 hide-scrollbar">
            {[{
              icon: <Truck className="w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 text-orange-600" />,
              title: translate('freeShipping'),
              desc: translate('freeShippingDesc'),
            }, {
              icon: <Shield className="w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 text-orange-600" />,
              title: translate('securePayment'),
              desc: translate('securePaymentDesc'),
            }, {
              icon: <Clock className="w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 text-orange-600" />,
              title: translate('supportHoursTitle'),
              desc: translate('supportHoursDesc'),
            }].map((card, idx) => (
              <div
                key={idx}
                className="min-w-[80vw] max-w-[90vw] sm:min-w-0 sm:max-w-full text-center group bg-turquoise-50 border border-turquoise-200 rounded-xl shadow-md flex flex-col items-center justify-center aspect-square max-h-[380px] w-full mx-auto px-4 py-6 min-h-[200px] sm:min-h-[180px] md:min-h-[210px] overflow-hidden"
              >
                <div className="flex items-center justify-center bg-orange-100 rounded-full mb-3 sm:mb-4 md:mb-5 p-3 sm:p-4 md:p-5">
                  {card.icon}
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-montserrat font-semibold mb-2 text-primary-800">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-primary-700 font-lora leading-relaxed px-1">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section - Responsive design */}
      <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 lg:px-8 text-center bg-primary-50 overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-montserrat font-bold text-primary-800 mb-3 sm:mb-4 md:mb-6">{translate('shopByCategory')}</h2>
          <p className="text-sm sm:text-base md:text-lg text-primary-600 font-lora mb-6 sm:mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">{translate('shopByCategoryDesc')}</p>
          
          {/* Categories Slider */}
          <div className="px-2 sm:px-4 lg:px-6">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="snap-start min-w-[75%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[22%]"
                >
                  <CategoryCard 
                    category={category} 
                    index={index} 
                    lang={lang} 
                    router={router} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Featured Products Section - Clean minimalist design */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-montserrat font-bold text-primary-800 mb-4 sm:mb-6">
              {translate('featuredProducts')}
            </h2>
            <p className="text-base sm:text-lg text-primary-600 font-lora max-w-2xl mx-auto leading-relaxed">
              {translate('featuredProductsDesc')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="w-full h-32 sm:h-36 md:h-40 bg-gray-200 animate-pulse"></div>
                  <div className="p-3 sm:p-4">
                    <div className="h-3 sm:h-4 bg-gray-200 animate-pulse mb-1 sm:mb-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 animate-pulse w-2/3"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-2 sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={fetchFeaturedProducts} className="btn-primary">
                  {translate('tryAgain')}
                </button>
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="col-span-2 sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-8">
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
          
          <div className="text-center mt-8 sm:mt-12 md:mt-16">
              <button 
                className="btn-primary text-lg px-10 py-4" 
                onClick={() => router.push(`/${lang}/products`)}
              >
              {translate('viewAllProducts')}
            </button>
          </div>
        </div>
      </section>

      {/* What Our Customers Say Section */}
      <section className="py-16 sm:py-20 bg-primary-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-montserrat font-bold text-gray-800 mb-4 sm:mb-6">
              {translate('whatCustomersSayTitle')}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-lora max-w-2xl mx-auto leading-relaxed">
              {translate('whatCustomersSaySubtitle')}
            </p>
          </div>
          
          <div ref={reviewsSectionRef}>
            {isReviewsVisible ? (
              <Suspense fallback={<div className="h-48 w-full rounded-2xl bg-white shadow-md animate-pulse sm:h-56 lg:h-64" />}>
                <ReviewsSlider 
                  reviews={topReviews}
                  autoSlide={true}
                  slideInterval={6000}
                />
              </Suspense>
            ) : (
              <div className="h-48 w-full rounded-2xl bg-white shadow-md animate-pulse sm:h-56 lg:h-64" />
            )}
          </div>
        </div>
      </section>

      {/* Reviews Section Responsive Styles */}
      <style jsx global>{`
        @media (max-width: 640px) {
          .reviews-slider .flex-shrink-0 {
            width: 100% !important;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .reviews-slider .flex-shrink-0 {
            width: 50% !important;
          }
        }
        @media (min-width: 1025px) {
          .reviews-slider .flex-shrink-0 {
            width: 33.333333% !important;
          }
        }
      `}</style>

      {/* Additional CSS for complete horizontal scroll prevention */}
      <style jsx global>{`
        /* Ensure all sections are properly contained */
        .main-container {
          max-width: 100vw;
          overflow-x: hidden;
        }

        /* Mobile responsive fixes */
        @media (max-width: 767px) {
          .mobile-responsive {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }

          .mobile-card {
            margin-left: 0;
            margin-right: 0;
          }

          /* Ensure buttons don't overflow */
          button {
            white-space: nowrap;
          }
        }

        /* Ensure images don't cause overflow */
        img {
          max-width: 100%;
          height: auto;
        }

        /* Fix any potential gradient overflow */
        [class*="bg-gradient"] {
          max-width: 100%;
        }
        /* Hide scrollbars for mobile horizontal card scroll */
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

    </div>
    </MerchantBlocker>
  );
}

export default HomePage;