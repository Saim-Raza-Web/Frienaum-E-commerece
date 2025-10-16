'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/i18n/TranslationProvider';
import { Product } from '@/types';
import { ArrowRight, Star, Truck, Shield, Clock } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// Dynamically import the ProductCard component with no SSR
const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
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
      <div className="relative h-48 w-full overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <img
          src={imageSrc}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder-category.jpg';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
        <h3 className="absolute bottom-4 left-0 right-0 mx-auto text-white text-lg font-semibold drop-shadow-lg px-4">
          {(() => {
            try {
              // Test if basic translation works
              const testTranslation = translate('electronics');
              console.log('Test translation for "electronics":', testTranslation);

              const translationKey = getCategoryTranslationKey(category.name);
              console.log('Category:', category.name, 'Translation key:', translationKey);

              const translated = translate(translationKey);
              console.log('Translated result:', translated, 'Type:', typeof translated);

              // Check if translation actually worked
              if (translated && translated !== translationKey && translated !== category.name) {
                return translated;
              } else {
                console.log('Translation failed, using fallback');
                return category.name;
              }
            } catch (error) {
              console.error('Translation error for category:', category.name, error);
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
  
  // Typing animation state
  const [displayText, setDisplayText] = useState('');
  const words = lang === 'de' ? ['Wohnen', 'Komfort', 'Eleganz', 'Stil'] : ['Living', 'Comfort', 'Elegance', 'Style'];

  // Fetch featured products and categories
  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch products and categories in parallel with error handling for each
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/products').then(res => {
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
      setFeaturedProducts(transformedProducts.slice(0, 5));

      // Use categories from database
      setCategories(categoriesData);
      console.log('Categories loaded:', categoriesData);
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

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  // categories are built from products fetch above

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[var(--color-accent-beige)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            {/* Text Content */}
            <div className="w-full lg:w-1/2 xl:pr-16">
              <div className="min-h-[240px] md:min-h-[260px] lg:min-h-[320px] flex flex-col justify-center pt-8 lg:pt-0">
                <h1 className="text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-serif text-[var(--color-primary-800)] leading-tight" style={{ fontFamily: 'var(--font-playfair), ui-serif, Georgia' }}>
                  <div className="whitespace-nowrap">{translate('timelessStyle')}</div>
                  <div className="flex items-baseline">
                    <span className="whitespace-nowrap">{translate('modern')}&nbsp;</span>
                    <span className="inline-block min-w-[180px] lg:min-w-[220px] text-left">
                      {displayText}
                      {!displayText && <span className="invisible">Comfort</span>}
                    </span>
                  </div>
                </h1>
                <p className="mt-6 text-lg text-[var(--color-primary-700)] max-w-lg">
                  {translate('heroSubtitle')}
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button 
                    className="px-8 py-4 bg-[var(--color-primary-500)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-700)] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    onClick={() => router.push(`/${lang}/products`)}
                  >
                    {translate('shopNow')}
                  </button>
                  <button 
                    className="px-8 py-4 border-2 border-[#8C6A4A] text-[var(--color-primary-700)] font-medium rounded-lg hover:bg-[var(--color-hover-accent)] hover:text-[var(--color-primary-800)] transition-all duration-300"
                    style={{ borderStyle: 'solid' }}
                    onClick={() => router.push(`/${lang}/about`)}
                  >
                    {translate('learnMore')}
                  </button>
                </div>
              </div>
            </div>

            {/* Image - Fixed dimensions to prevent movement */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mt-8 lg:mt-0">
              <div className="relative w-full max-w-2xl h-[400px] md:h-[500px] lg:h-[600px] transform -translate-y-10">
                <img 
                  src="/images/hero.png" 
                  alt="Elegant Home Decor" 
                  className="w-full h-full object-contain lg:object-cover rounded-xl shadow-2xl" 
                  style={{ objectPosition: 'center 10%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{translate('freeShipping')}</h3>
              <p className="text-gray-600">{translate('freeShippingDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{translate('securePayment')}</h3>
              <p className="text-gray-600">{translate('securePaymentDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{translate('support247')}</h3>
              <p className="text-gray-600">{translate('support247Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center bg-white">
        <div className="max-w-7xl mx-auto relative">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">{translate('shopByCategory')}</h2>
          <p className="text-gray-500 mb-10">{translate('shopByCategoryDesc')}</p>
          
          {/* Navigation Buttons - Outside Swiper */}
          <button className="category-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button className="category-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Categories Slider */}
          <div className="px-12 overflow-hidden">
            <Swiper
              spaceBetween={16}
              slidesPerView={'auto'}
              navigation={{
                nextEl: '.category-swiper-button-next',
                prevEl: '.category-swiper-button-prev',
              }}
              modules={[Navigation]}
              breakpoints={{
                640: {
                  slidesPerView: 2.5,
                },
                768: {
                  slidesPerView: 3.5,
                },
                1024: {
                  slidesPerView: 5,
                },
              }}
              className="!py-4 !overflow-visible"
              noSwiping={true}
              noSwipingClass="swiper-wrapper"
              preventInteractionOnTransition={true}
            >
              {categories.map((category, index) => (
                <SwiperSlide key={category.id} className="!w-auto">
                  <CategoryCard 
                    category={category} 
                    index={index} 
                    lang={lang} 
                    router={router} 
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
      
      {/* Swiper Navigation Styles */}
      <style jsx global>{`
        .swiper {
          padding: 10px 0;
          overflow: hidden !important;
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .swiper::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
        .swiper-wrapper {
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        .swiper-slide {
          width: auto !important;
          height: auto !important;
          transition: transform 0.3s ease;
        }
        .swiper-slide:hover {
          transform: translateY(-4px);
        }
      `}</style>
      
      <style jsx global>{`
        .swiper {
          padding: 10px 0 40px;
        }
        .swiper-slide {
          width: auto;
          height: auto;
        }
        .category-swiper-button-prev,
        .category-swiper-button-next {
          background: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          color: #4f46e5;
        }
        .category-swiper-button-prev:after,
        .category-swiper-button-next:after {
          font-size: 16px;
          font-weight: bold;
        }
        .category-swiper-button-prev {
          left: 0;
        }
        .category-swiper-button-next {
          right: 0;
        }
      `}</style>

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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="w-full h-36 bg-gray-200 animate-pulse"></div>
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