'use client';

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n/TranslationProvider';
import { useAuth } from '@/context/AuthContext';
import { Package, Clock, CheckCircle, XCircle, Eye, Star, Trash2 } from 'lucide-react';
import SmartImage from '@/components/SmartImage';
import MerchantBlocker from '@/components/MerchantBlocker';

const RatingForm = dynamic(() => import('@/components/RatingForm'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-lg bg-white p-6 shadow animate-pulse">
      <div className="h-4 w-1/2 rounded bg-gray-200 mb-4" />
      <div className="h-4 w-full rounded bg-gray-200 mb-2" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
    </div>
  )
});

interface Order {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  subOrders: Array<{
    id: string;
    merchantId: string;
    subtotal: number;
    shipping?: number;
    status: string;
    items: Array<{
      id: string;
      productId: string;
      quantity: number;
      price: number;
      hasRated?: boolean;
      rating?: {
        value: number;
        review?: string | null;
        language: string;
        createdAt: string;
      } | null;
      product: {
        title_en: string;
        title_de?: string;
        imageUrl?: string;
      };
    }>;
  }>;
}

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const { translate } = useTranslation();
  const pathname = usePathname();
  const currentLang = pathname?.split('/')[1] || 'de';
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatPrice = (amount: number, lang: string) => {
    return `${amount.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
  };
  const [ratingTarget, setRatingTarget] = useState<{ productId: string; orderItemId: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Add cache-busting parameter to ensure fresh data
      const response = await fetch(`/api/orders?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmitted = async () => {
    setRatingTarget(null);
    // Add a small delay to ensure the database has been updated
    setTimeout(async () => {
      await fetchOrders();
      // Trigger custom event to refresh product pages
      window.dispatchEvent(new Event('ratingChanged'));
    }, 500);
  };

  const handleDeleteRating = async (orderItemId: string) => {
    if (!confirm(translate('ordersPage.confirmDeleteRating') || 'Are you sure you want to delete this rating?')) {
      return;
    }

    try {
      const response = await fetch(`/api/ratings?orderItemId=${orderItemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to delete rating: ${response.status}`);
      }

      // Wait a bit longer to ensure database transaction is committed
      // Then refresh from server with cache-busting
      setTimeout(async () => {
        await fetchOrders();
        // Trigger custom event to refresh product pages
        window.dispatchEvent(new Event('ratingChanged'));
      }, 500);
    } catch (err) {
      console.error('Error deleting rating:', err);
      const errorMessage = err instanceof Error ? err.message : (translate('ordersPage.deleteError') || 'Failed to delete rating');
      alert(errorMessage);
    }
  };

  const handleStartShopping = () => {
    router.push(`/${currentLang}/products`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'SHIPPED':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'PROCESSING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{translate('ordersPage.pleaseLogin')}</h1>
          <Link href="/login" className="inline-flex bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            {translate('ordersPage.logIn')}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{translate('ordersPage.errorLoading')}</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <MerchantBlocker>
    <>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{translate('ordersPage.myOrders')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">{translate('ordersPage.trackHistory')}</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{translate('ordersPage.noOrdersYet')}</h3>
            <p className="text-gray-600">{translate('ordersPage.noOrdersYetDesc')}</p>
            <button
              type="button"
              onClick={handleStartShopping}
              className="mt-4 inline-flex items-center justify-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {translate('ordersPage.startShopping')}
            </button>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">{translate('ordersPage.order')} #{order.id}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {translate('ordersPage.placedOn', { date: new Date(order.createdAt).toLocaleDateString() })}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1.5 sm:ml-2 capitalize">{translate(`status.${order.status.toLowerCase()}`)}</span>
                      </span>
                      <span className="text-sm sm:text-lg font-semibold text-gray-900">
                        {formatPrice(order.totalAmount, currentLang)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 sm:px-6 py-4">
                  <div className="space-y-4">
                    {order.subOrders.map((subOrder) => (
                      <div key={subOrder.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:mb-3">
                          <h4 className="text-sm sm:text-base font-medium text-gray-900">{translate('ordersPage.fromMerchant')}</h4>
                          <span className="text-xs sm:text-sm text-gray-600">
                            {translate('ordersPage.subtotal')}: {formatPrice(subOrder.subtotal, currentLang)}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-600 text-xs sm:text-sm">
                          <span>{translate('cart.tax')}</span>
                          <span>{formatPrice(((subOrder.subtotal + (subOrder.shipping ?? 0)) * 0.081), currentLang)}</span>
                        </div>

                        <div className="space-y-2">
                          {subOrder.items.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-3">
                              <div className="w-12 h-12 rounded overflow-hidden mx-auto sm:mx-0 relative">
                                <SmartImage
                                  src={item.product.imageUrl}
                                  alt={currentLang === 'de' && item.product.title_de ? item.product.title_de : item.product.title_en}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                  fallbackSrc="/images/placeholder-product.png"
                                />
                              </div>
                              <div className="flex-1">
                                <h5 className="text-sm sm:text-base font-medium text-gray-900">
                                  {currentLang === 'de' && item.product.title_de ? item.product.title_de : item.product.title_en}
                                </h5>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {translate('ordersPage.quantity')}: {item.quantity} × {formatPrice(item.price, currentLang)}
                                </p>
                              </div>
                              <div className="text-xs sm:text-sm font-medium text-gray-900 text-right">
                                {formatPrice(item.quantity * item.price, currentLang)}
                              </div>
                              {order.status === 'DELIVERED' && (
                                item.rating && item.rating.value && item.rating.value > 0 ? (
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                    <div className="flex items-center space-x-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                            i < item.rating!.value
                                              ? 'text-yellow-400 fill-current'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    {item.rating.review && (
                                      <p className="text-xs text-gray-600 max-w-xs truncate">
                                        {item.rating.review}
                                      </p>
                                    )}
                                    <button
                                      onClick={() => handleDeleteRating(item.id)}
                                      className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded flex items-center space-x-1"
                                      title={translate('ordersPage.deleteRating') || 'Delete Rating'}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>{translate('ordersPage.delete') || 'Delete'}</span>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="px-3 py-1 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                                    onClick={() => setRatingTarget({ productId: item.productId, orderItemId: item.id })}
                                  >
                                    {translate('ordersPage.rateProduct')}
                                  </button>
                                )
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    <RatingModal
      target={ratingTarget}
      onClose={() => setRatingTarget(null)}
      onSubmitted={handleRatingSubmitted}
    />
    </>
  </MerchantBlocker>
  );
}

// Modal container for rating form
function RatingModal({ target, onClose, onSubmitted }: { target: { productId: string; orderItemId: string } | null; onClose: () => void; onSubmitted: () => void; }) {
  const { translate } = useTranslation();
  if (!target) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg mx-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{translate('ordersPage.rateProduct')}</h3>
            <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>✕</button>
          </div>
          <div className="p-4">
            <Suspense fallback={<div className="h-32 rounded-lg bg-gray-100 animate-pulse" />}>
              <RatingForm
                productId={target.productId}
                orderItemId={target.orderItemId}
                onRatingSubmitted={onSubmitted}
                onClose={onClose}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
