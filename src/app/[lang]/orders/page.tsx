'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/i18n/TranslationProvider';
import { useAuth } from '@/context/AuthContext';
import { Package, Clock, CheckCircle, XCircle, Eye, Star } from 'lucide-react';
import RatingForm from '@/components/RatingForm';

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
    status: string;
    items: Array<{
      id: string;
      productId: string;
      quantity: number;
      price: number;
        hasRated?: boolean;
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
  const currentLang = pathname?.split('/')[1] || 'en';
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
      const response = await fetch('/api/orders', {
        credentials: 'include',
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
    await fetchOrders();
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
          <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            {translate('ordersPage.logIn')}
          </a>
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
    <>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{translate('ordersPage.myOrders')}</h1>
          <p className="text-gray-600 mt-2">{translate('ordersPage.trackHistory')}</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{translate('ordersPage.noOrdersYet')}</h3>
            <p className="text-gray-600">{translate('ordersPage.noOrdersYetDesc')}</p>
            <a href="/products" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              {translate('ordersPage.startShopping')}
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{translate('ordersPage.order')} #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        {translate('ordersPage.placedOn', { date: new Date(order.createdAt).toLocaleDateString() })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-2">{translate(`status.${order.status.toLowerCase()}`)}</span>
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {order.subOrders.map((subOrder) => (
                      <div key={subOrder.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{translate('ordersPage.fromMerchant')}</h4>
                          <span className="text-sm text-gray-600">
                            {translate('ordersPage.subtotal')}: ${subOrder.subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-600 text-sm">
                          <span>{translate('cart.tax')}</span>
                          <span>{formatPrice(((subOrder.subtotal + (subOrder.shipping ?? 0)) * 0.081), currentLang)}</span>
                        </div>

                        <div className="space-y-2">
                          {subOrder.items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3">
                      {item.product.imageUrl && (
                                <img
                                  src={item.product.imageUrl}
                          alt={currentLang === 'de' && item.product.title_de ? item.product.title_de : item.product.title_en}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <h5 className="text-sm font-medium text-gray-900">
                          {currentLang === 'de' && item.product.title_de ? item.product.title_de : item.product.title_en}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {translate('ordersPage.quantity')}: {item.quantity} × {formatPrice(item.price, currentLang)}
                                </p>
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatPrice(item.quantity * item.price, currentLang)}
                              </div>
                              {order.status === 'DELIVERED' && (
                                item.hasRated ? (
                                  <span className="ml-4 inline-flex items-center text-green-600 text-sm">
                                    <Star className="w-4 h-4 mr-1 fill-current" /> {translate('ordersPage.rated')}
                                  </span>
                                ) : (
                                  <button
                                    className="ml-4 px-3 py-1 text-sm bg-turquoise-500 hover:bg-turquoise-600 text-white rounded"
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
            <RatingForm
              productId={target.productId}
              orderItemId={target.orderItemId}
              onRatingSubmitted={onSubmitted}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
