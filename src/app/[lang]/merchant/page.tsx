'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n/TranslationProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
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

function MerchantDashboard() {
  const { translate } = useTranslation();
  const { user } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log('MerchantDashboard - User authentication state:', {
      user,
      userExists: !!user,
      userId: user?.id,
      userRole: user?.role
    });
  }, [user]);

  // State declarations
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for add product modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProduct, setNewProduct] = useState({
    slug: '',
    title_en: '',
    title_de: '',
    desc_en: '',
    desc_de: '',
    price: '',
    stock: '',
    imageUrl: '',
    category: 'General'
  });

  // State for view and edit modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState({
    slug: '',
    title_en: '',
    title_de: '',
    desc_en: '',
    desc_de: '',
    price: '',
    stock: '',
    imageUrl: '',
    category: 'General'
  });
  const [updating, setUpdating] = useState(false);
  // Get the translation function
  const { translate: t } = useTranslation();

  // Initialize stats with loading state
  const [stats, setStats] = useState([
    { label: 'Total Sales', value: 'Loading...', change: '', icon: DollarSign, color: 'text-green-600' },
    { label: 'Orders', value: 'Loading...', change: '', icon: ShoppingBag, color: 'text-blue-600' },
    { label: 'Customers', value: 'Loading...', change: '', icon: Users, color: 'text-purple-600' },
    { label: 'Products', value: 'Loading...', change: '', icon: Package, color: 'text-orange-600' }
  ]);

  // Fetch stats data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated first
        if (!user) {
          setError('Please log in to access merchant dashboard');
          return;
        }

        // Fetch stats with proper session handling
        const response = await fetch('/api/merchant/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' // Include cookies for session
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please log in to view merchant statistics');
          }
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        const data = await response.json();

        // Validate data structure
        if (data && typeof data === 'object' && !data.error) {
          setStats(prevStats => [
            {
              ...prevStats[0],
              value: new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(Number(data.totalSales) || 0)
            },
            {
              ...prevStats[1],
              value: data.totalOrders?.toString() || '0'
            },
            {
              ...prevStats[2],
              value: data.totalCustomers?.toString() || '0'
            },
            {
              ...prevStats[3],
              value: data.totalProducts?.toString() || '0'
            }
          ]);
        } else {
          console.error('Unexpected data format:', data);
          throw new Error('Invalid data received from server');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]); // Add user dependency to refetch when user changes


  const recentOrders = [
    { id: '#ORD-001', customer: 'John Doe', amount: '$89.99', status: 'Delivered', date: '2024-01-15' },
    { id: '#ORD-002', customer: 'Sarah Johnson', amount: '$199.99', status: 'Shipped', date: '2024-01-14' },
    { id: '#ORD-003', customer: 'Mike Wilson', amount: '$45.99', status: 'Processing', date: '2024-01-13' },
    { id: '#ORD-004', customer: 'Emily Brown', amount: '$129.99', status: 'Delivered', date: '2024-01-12' }
  ];

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');

        // Check if user is authenticated first
        if (!user) {
          setError('Please log in to access merchant dashboard');
          return;
        }

        const response = await fetch('/api/merchant/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' // Include cookies for session
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please log in to view merchant products');
          }
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]); // Add user dependency

  // Handle delete product
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include' // Include cookies for session
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to delete products');
        }
        throw new Error('Failed to delete product');
      }

      // Remove product from state
      setProducts(products.filter(product => product.id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      console.error('Error deleting product:', err);
    }
  };

  // Handle view product
  const handleViewProduct = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }

      const product = await response.json();
      setSelectedProduct(product);
      setShowViewModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product details');
    }
  };

  // Handle edit product
  const handleEditProduct = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }

      const product = await response.json();
      setSelectedProduct(product);
      setEditingProduct({
        slug: product.slug || '',
        title_en: product.title_en || '',
        title_de: product.title_de || '',
        desc_en: product.desc_en || '',
        desc_de: product.desc_de || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        imageUrl: product.imageUrl || '',
        category: product.category || 'General'
      });
      setShowEditModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product for editing');
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setCreating(false);
    setNewProduct({
      slug: '',
      title_en: '',
      title_de: '',
      desc_en: '',
      desc_de: '',
      price: '',
      stock: '',
      imageUrl: '',
      category: 'General'
    });
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedProduct(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
    setEditingProduct({
      slug: '',
      title_en: '',
      title_de: '',
      desc_en: '',
      desc_de: '',
      price: '',
      stock: '',
      imageUrl: '',
      category: 'General'
    });
    setUpdating(false);
  };

  const updateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setUpdating(true);
    setError('');

    try {
      const payload = {
        slug: toSlug(editingProduct.slug || editingProduct.title_en || ''),
        title_en: editingProduct.title_en,
        title_de: editingProduct.title_de,
        desc_en: editingProduct.desc_en,
        desc_de: editingProduct.desc_de,
        price: Number(editingProduct.price || 0),
        stock: Number(editingProduct.stock || 0),
        imageUrl: editingProduct.imageUrl || undefined,
        category: editingProduct.category || 'General',
      };

      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Please log in to update products');
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update product');
      }

      // Refresh the products list
      const refreshed = await fetch('/api/merchant/products', {
        credentials: 'include'
      });
      const items = await refreshed.json();
      setProducts(items);
      closeEditModal();
    } catch (err: any) {
      setError(err?.message || 'Failed to update product');
    } finally {
      setUpdating(false);
    }
  };

  const toSlug = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

  // Auto-generate slug from English title when slug is empty
  useEffect(() => {
    if (!newProduct.slug && newProduct.title_en) {
      setNewProduct(p => ({ ...p, slug: toSlug(p.title_en) }));
    }
  }, [newProduct.title_en]);

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const payload = {
        slug: toSlug(newProduct.slug || newProduct.title_en || ''),
        title_en: newProduct.title_en,
        title_de: newProduct.title_de,
        desc_en: newProduct.desc_en,
        desc_de: newProduct.desc_de,
        price: Number(newProduct.price || 0),
        stock: Number(newProduct.stock || 0),
        imageUrl: newProduct.imageUrl || undefined,
        category: newProduct.category || 'General',
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include', // Include cookies for session
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Please log in to create products');
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create product');
      }

      // refresh list
      const refreshed = await fetch('/api/merchant/products', {
        credentials: 'include' // Include cookies for session
      });
      const items = await refreshed.json();
      setProducts(items);
      closeAddModal();
    } catch (err: any) {
      setError(err?.message || 'Failed to create product');
    } finally {
      setCreating(false);
    }
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
                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 text-xs text-gray-500">
                    Auth Status: {user ? `Logged in as ${user.role}` : 'Not authenticated'} |
                    User ID: {user?.id || 'N/A'}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button className="btn-secondary flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>{translate('merchant.exportData')}</span>
                </button>
                <button onClick={openAddModal} className="btn-primary flex items-center space-x-2">
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
            {stats.map((stat, index) => {
              // Determine if the value is a currency amount (for proper formatting)
              const isCurrency = stat.label.includes('Sales') || stat.label.includes('totalSales');
              const displayValue = isCurrency && !isNaN(Number(stat.value.replace(/[^0-9.-]+/g, '')))
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(Number(stat.value.replace(/[^0-9.-]+/g, '')))
                : stat.value;

              return (
                <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {loading ? (
                          <span className="inline-flex items-center">
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            Loading...
                          </span>
                        ) : error ? (
                          <span className="text-red-600">Error</span>
                        ) : (
                          <>{displayValue}</>
                        )}
                      </p>
                      {stat.change && (
                        <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change}
                        </p>
                      )}
                    </div>
                    <div className={`p-3 rounded-full ${stat.color.replace('text', 'bg').replace('-600', '-100')}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
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
                      <button onClick={openAddModal} className="btn-primary flex items-center space-x-2">
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
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Access Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{error}</p>
                              {!user && (
                                <p className="mt-1">
                                  Please <a href="/login" className="underline hover:no-underline">log in</a> as a merchant to access this dashboard.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
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
      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900">{translate('merchant.viewProduct')}</h3>
              <button onClick={closeViewModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('Title (EN)')}</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedProduct.title_en}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('Title (DE)')}</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedProduct.title_de || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Slug</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedProduct.slug}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('Price')}</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">${selectedProduct.price}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('Stock')}</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedProduct.stock}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('Category')}</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('Status')}</label>
                    <p className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedProduct.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </p>
                  </div>
                </div>

                {selectedProduct.imageUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('Image')}</label>
                    <div className="mt-1">
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.title_en}
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('Description (EN)')}</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded whitespace-pre-wrap">{selectedProduct.desc_en || 'No description'}</p>
                </div>

                {selectedProduct.desc_de && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('Description (DE)')}</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded whitespace-pre-wrap">{selectedProduct.desc_de}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p>{new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p>{new Date(selectedProduct.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button onClick={closeViewModal} className="btn-secondary">{translate('Close')}</button>
              <button
                onClick={() => {
                  closeViewModal();
                  handleEditProduct(selectedProduct.id);
                }}
                className="btn-primary"
              >
                {translate('merchant.edit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900">{translate('merchant.editProduct')}</h3>
              <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={updateProduct} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('Title (EN)')}</label>
                  <input
                    value={editingProduct.title_en}
                    onChange={e => setEditingProduct(p => ({ ...p, title_en: e.target.value }))}
                    className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors"
                    required
                    placeholder="Ex: Wireless Headphones"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('Title (DE)')}</label>
                  <input
                    value={editingProduct.title_de}
                    onChange={e => setEditingProduct(p => ({ ...p, title_de: e.target.value }))}
                    className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Slug</label>
                  <input
                    value={editingProduct.slug}
                    onChange={e => setEditingProduct(p => ({ ...p, slug: e.target.value.toLowerCase() }))}
                    className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors"
                    placeholder={toSlug(editingProduct.title_en || 'my-product')}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Used in the URL, lowercase and hyphenated (e.g. my-awesome-product).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('Price')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct(p => ({ ...p, price: e.target.value }))}
                    className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors"
                    required
                    placeholder="Ex: 49.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('Stock')}</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editingProduct.stock}
                    onChange={e => setEditingProduct(p => ({ ...p, stock: e.target.value }))}
                    className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors"
                    required
                    placeholder="Ex: 100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('Category')}</label>
                  <select
                    value={editingProduct.category}
                    onChange={e => setEditingProduct(p => ({ ...p, category: e.target.value }))}
                    className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                    <option value="Sports & Outdoors">Sports & Outdoors</option>
                    <option value="Books">Books</option>
                    <option value="Toys & Games">Toys & Games</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('Image URL')}</label>
                  <input
                    value={editingProduct.imageUrl}
                    onChange={e => setEditingProduct(p => ({ ...p, imageUrl: e.target.value }))}
                    className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors"
                    placeholder="https://.../image.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{translate('Description (EN)')}</label>
                <textarea
                  rows={4}
                  value={editingProduct.desc_en}
                  onChange={e => setEditingProduct(p => ({ ...p, desc_en: e.target.value }))}
                  className="input-field min-h-28 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors"
                  placeholder="Short description in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{translate('Description (DE)')}</label>
                <textarea
                  rows={4}
                  value={editingProduct.desc_de}
                  onChange={e => setEditingProduct(p => ({ ...p, desc_de: e.target.value }))}
                  className="input-field min-h-28 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors"
                  placeholder="Kurze Beschreibung auf Deutsch (optional)"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeEditModal} className="btn-secondary">{translate('Cancel')}</button>
                <button type="submit" disabled={updating} className="btn-primary">
                  {updating ? translate('merchant.loading') : translate('merchant.updateProduct')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900">{translate('merchant.addProduct')}</h3>
              <button onClick={closeAddModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={createProduct} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('Title (EN)')}</label>
                  <input value={newProduct.title_en} onChange={e=>setNewProduct(p=>({...p, title_en: e.target.value}))} className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors" required placeholder="Ex: Wireless Headphones" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('Title (DE)')}</label>
                  <input value={newProduct.title_de} onChange={e=>setNewProduct(p=>({...p, title_de: e.target.value}))} className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors" placeholder="Optional" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Slug</label>
                  <input
                    value={newProduct.slug}
                    onChange={e=>setNewProduct(p=>({...p, slug: e.target.value.toLowerCase()}))}
                    className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors"
                    placeholder={toSlug(newProduct.title_en || 'my-product')}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Used in the URL, lowercase and hyphenated (e.g. my-awesome-product).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('Price')}</label>
                  <input type="number" min="0" step="0.01" value={newProduct.price} onChange={e=>setNewProduct(p=>({...p, price: e.target.value}))} className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors" required placeholder="Ex: 49.99" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('Stock')}</label>
                  <input type="number" min="0" step="1" value={newProduct.stock} onChange={e=>setNewProduct(p=>({...p, stock: e.target.value}))} className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors" required placeholder="Ex: 100" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('Category')}</label>
                  <select
                    value={newProduct.category}
                    onChange={e=>setNewProduct(p=>({...p, category: e.target.value}))}
                    className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                    <option value="Sports & Outdoors">Sports & Outdoors</option>
                    <option value="Books">Books</option>
                    <option value="Toys & Games">Toys & Games</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('Image URL')}</label>
                  <input value={newProduct.imageUrl} onChange={e=>setNewProduct(p=>({...p, imageUrl: e.target.value}))} className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors" placeholder="https://.../image.jpg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{translate('Description (EN)')}</label>
                <textarea rows={4} value={newProduct.desc_en} onChange={e=>setNewProduct(p=>({...p, desc_en: e.target.value}))} className="input-field min-h-28 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors" placeholder="Short description in English" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{translate('Description (DE)')}</label>
                <textarea rows={4} value={newProduct.desc_de} onChange={e=>setNewProduct(p=>({...p, desc_de: e.target.value}))} className="input-field min-h-28 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors" placeholder="Kurze Beschreibung auf Deutsch (optional)" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeAddModal} className="btn-secondary">{translate('Cancel')}</button>
                <button type="submit" disabled={creating} className="btn-primary">
                  {creating ? translate('merchant.loading') : translate('merchant.addProduct')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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