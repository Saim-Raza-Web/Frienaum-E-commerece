'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useTranslation } from '@/i18n/TranslationProvider';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function MerchantDashboard() {
  const { translate } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const stats = [
    { label: translate('merchant.totalSales'), value: '$12,847', change: '+12.5%', icon: DollarSign, color: 'text-green-600' },
    { label: translate('merchant.orders'), value: '156', change: '+8.2%', icon: ShoppingBag, color: 'text-blue-600' },
    { label: translate('merchant.customers'), value: '89', change: '+15.3%', icon: Users, color: 'text-purple-600' },
    { label: translate('merchant.products'), value: '24', change: '+5.7%', icon: Package, color: 'text-orange-600' }
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'John Doe', amount: '$89.99', status: 'Delivered', date: '2024-01-15' },
    { id: '#ORD-002', customer: 'Sarah Johnson', amount: '$199.99', status: 'Shipped', date: '2024-01-14' },
    { id: '#ORD-003', customer: 'Mike Wilson', amount: '$45.99', status: 'Processing', date: '2024-01-13' },
    { id: '#ORD-004', customer: 'Emily Brown', amount: '$129.99', status: 'Delivered', date: '2024-01-12' }
  ];

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle delete product
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Remove product from state
      setProducts(products.filter(product => product.id !== productId));
    } catch (err) {
      setError('Failed to delete product');
      console.error('Error deleting product:', err);
    }
  };

  // Handle view product
  const handleViewProduct = (productId: number) => {
    // For now, just log the product ID
    console.log('View product:', productId);
    // TODO: Implement view product modal or redirect to product detail page
  };

  // Handle edit product
  const handleEditProduct = (productId: number) => {
    // For now, just log the product ID
    console.log('Edit product:', productId);
    // TODO: Implement edit product modal or redirect to edit page
  };

  const tabs = [
    { id: 'overview', label: translate('merchant.overview'), icon: TrendingUp },
    { id: 'orders', label: translate('merchant.orders'), icon: ShoppingBag },
    { id: 'products', label: translate('merchant.products'), icon: Package },
    { id: 'customers', label: translate('merchant.customerManagement'), icon: Users },
    { id: 'analytics', label: translate('merchant.businessAnalytics'), icon: TrendingUp }
  ];

  return (
    <ProtectedRoute requiredRole="merchant">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{translate('merchant.dashboard')}</h1>
                <p className="mt-2 text-gray-600">{translate('merchant.manageProducts')}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="btn-secondary flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>{translate('merchant.exportData')}</span>
                </button>
                <button className="btn-primary flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>{translate('merchant.addProduct')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-turquoise-100 rounded-lg">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  <span className="text-sm text-gray-600 ml-1">{translate('merchant.fromLastMonth')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-turquoise-100 text-turquoise-700 border-r-2 border-turquoise-500'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Recent Orders */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{translate('merchant.recentOrders')}</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.id}</h3>
                          <p className="text-sm text-gray-600">{order.customer}</p>
                          <p className="text-xs text-gray-500">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{order.amount}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === translate('status.delivered') ? 'bg-green-100 text-green-800' :
                            order.status === translate('status.shipped') ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">{translate('merchant.quickActions')}</h2>
                    </div>
                    <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="btn-primary flex items-center justify-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>{translate('merchant.addProduct')}</span>
                    </button>
                    <button className="btn-secondary flex items-center justify-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>{translate('merchant.exportOrders')}</span>
                    </button>
                    <button className="btn-secondary flex items-center justify-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>{translate('merchant.viewAnalytics')}</span>
                    </button>
                  </div>
                </div>
              </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <h2 className="text-xl font-semibold text-gray-900">{translate('merchant.orderManagement')}</h2>
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder={translate('merchant.searchOrders')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                          />
                        </div>
                        <button className="btn-secondary flex items-center space-x-2">
                          <Filter className="w-4 h-4" />
                          <span>{translate('merchant.filter')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.orderId')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.customer')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.amount')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.status')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.date')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.actions')}</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentOrders.map((order) => (
                            <tr key={order.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.amount}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-turquoise-600 hover:text-turquoise-900 mr-3">{translate('merchant.view')}</button>
                                <button className="text-primary-600 hover:text-primary-900">{translate('merchant.update')}</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <h2 className="text-xl font-semibold text-gray-900">{translate('merchant.productManagement')}</h2>
                      <button className="btn-primary flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>{translate('merchant.addProduct')}</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    {loading && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-turquoise-600 mr-2" />
                        <span className="text-gray-600">{translate('merchant.loading')}</span>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-800">{error}</p>
                      </div>
                    )}

                    {!loading && !error && products.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{translate('merchant.noProducts')}</h3>
                        <p className="text-gray-600">{translate('merchant.noProductsDesc')}</p>
                      </div>
                    )}

                    {!loading && !error && products.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.product')}</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.price')}</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.stock')}</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.status')}</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.actions')}</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                              <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{product.title_en}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() => handleViewProduct(product.id)}
                                    className="text-turquoise-600 hover:text-turquoise-900 mr-3"
                                  >
                                    {translate('merchant.view')}
                                  </button>
                                  <button
                                    onClick={() => handleEditProduct(product.id)}
                                    className="text-primary-600 hover:text-primary-900 mr-3"
                                  >
                                    {translate('merchant.edit')}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    {translate('merchant.delete')}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Customers Tab */}
              {activeTab === 'customers' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">{translate('merchant.customerManagement')}</h2>
                  </div>
                  <div className="p-6">
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{translate('merchant.customerManagement')}</h3>
                      <p className="text-gray-600">{translate('merchant.manageCustomerRelationships')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">{translate('merchant.businessAnalytics')}</h2>
                  </div>
                  <div className="p-6">
                    <div className="text-center py-12">
                      <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{translate('merchant.businessAnalytics')}</h3>
                      <p className="text-gray-600">{translate('merchant.comprehensiveInsights')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function MerchantPage() {
  return (
    <ProtectedRoute requiredRole="merchant">
      <MerchantDashboard />
    </ProtectedRoute>
  );
} 