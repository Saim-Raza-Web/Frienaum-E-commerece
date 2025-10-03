'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Users,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Settings,
  BarChart3,
  Package,
  CreditCard,
  Activity,
  Shield,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  Save,
  Upload,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n/TranslationProvider';

type Product = {
  id: number;
  slug: string;
  title_en: string;
  title_de: string;
  desc_en: string;
  desc_de: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  category?: string;
  createdAt: string;
  updatedAt: string;
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { translate } = useTranslation();

  // Product management state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<any>({
    slug:"", title_en:"", title_de:"", desc_en:"", desc_de:"",
    price:"0", stock:"0", imageUrl:"", category: "General"
  });
  const [isUploading, setIsUploading] = useState(false);

  // Live system stats
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, revenue: 0, activeProducts: 0 });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');

  // Orders management state
  type AdminOrder = {
    id: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    totalAmount: number;
    grandTotal: number;
    currency: string;
    shippingAddress: string;
    createdAt: string;
    updatedAt: string;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
        id: string;
        slug: string;
        title_en: string;
        title_de: string;
        imageUrl: string | null;
      };
    }>;
    merchant: {
      storeName: string;
      user: {
        name: string | null;
        email: string;
      };
    };
    customer: {
      name: string | null;
      email: string;
    };
  };
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError('');
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (e: any) {
      setStatsError(e?.message || 'Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('This will permanently delete the user and all their data (including merchant profile, products, orders). Continue?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Delete user failed');
      }
      await loadUsers();
      alert('User deleted successfully');
    } catch (e: any) {
      alert(e?.message || 'Failed to delete user');
    }
  };

  // View/Delete merchant handlers
  const [viewing, setViewing] = useState<{open: boolean; loading: boolean; error: string; data: any | null}>({ open: false, loading: false, error: '', data: null });
  const openViewMerchant = async (merchantId: string) => {
    setViewing({ open: true, loading: true, error: '', data: null });
    try {
      const res = await fetch(`/api/admin/merchants/${merchantId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load merchant');
      const data = await res.json();
      setViewing({ open: true, loading: false, error: '', data });
    } catch (e: any) {
      setViewing({ open: true, loading: false, error: e?.message || 'Failed to load merchant', data: null });
    }
  };
  const closeViewMerchant = () => setViewing({ open: false, loading: false, error: '', data: null });

  const deleteMerchant = async (merchantId: string) => {
    if (!confirm('Are you sure you want to delete this merchant? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/merchants/${merchantId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Delete failed');
      }
      await loadUsers();
      if (viewing.open) closeViewMerchant();
      alert('Merchant deleted successfully');
    } catch (e: any) {
      alert(e?.message || 'Failed to delete merchant');
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      loadStats();
    }
  }, [activeTab]);

  // Users management state
  type AdminUser = {
    id: string;
    name: string | null;
    email: string;
    role: 'ADMIN' | 'MERCHANT' | 'CUSTOMER';
    createdAt: string;
    merchantId: string | null;
    merchantStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | null;
    storeName: string | null;
    isDeleted: boolean;
  };
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError('');
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (e: any) {
      setUsersError(e?.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError('');
      const res = await fetch('/api/admin/orders', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (e: any) {
      setOrdersError(e?.message || 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Delete failed');
      }
      await loadOrders();
      alert('Order deleted successfully');
    } catch (e: any) {
      alert(e?.message || 'Failed to delete order');
    }
  };

  const setMerchantStatus = async (merchantId: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED') => {
    try {
      const res = await fetch(`/api/admin/merchants/${merchantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      await loadUsers();
    } catch (e: any) {
      alert(e?.message || 'Status update failed');
    }
  };

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'customer', status: 'active', lastActive: '2 hours ago' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'merchant', status: 'active', lastActive: '1 day ago' },
    { id: 3, name: 'Mike Wilson', email: 'mike@example.com', role: 'customer', status: 'pending', lastActive: '3 days ago' },
    { id: 4, name: 'Emily Brown', email: 'emily@example.com', role: 'merchant', status: 'active', lastActive: '1 week ago' }
  ];

  // Helper: get current UI language from URL (fallback en)
  const getCurrentLang = () => {
    if (typeof window === 'undefined') return 'en';
    const match = window.location.pathname.match(/^\/([a-z]{2})(\/|$)/);
    return match ? match[1] : 'en';
  };

  // Helper: localized relative time
  const formatRelativeTime = (date: Date) => {
    const lang = getCurrentLang();
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
    const diffMs = date.getTime() - Date.now();
    const diffMin = Math.round(diffMs / 60000);
    const diffHour = Math.round(diffMs / 3600000);
    const diffDay = Math.round(diffMs / 86400000);
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
    if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
    return rtf.format(diffDay, 'day');
  };

  // Recent system alerts with timestamps for localized relative time
  const systemAlerts = [
    { id: 1, type: 'warning', message: 'admin.alerts.highServerLoad', ts: Date.now() - 5 * 60 * 1000 },
    { id: 2, type: 'info', message: 'admin.alerts.databaseBackup', ts: Date.now() - 60 * 60 * 1000 },
    { id: 3, type: 'error', message: 'admin.alerts.paymentGateway', ts: Date.now() - 2 * 60 * 60 * 1000 },
    { id: 4, type: 'success', message: 'admin.alerts.securityUpdate', ts: Date.now() - 24 * 60 * 60 * 1000 }
  ];

  // Format currency amounts in USD
  const formatUSD = (amount: number) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    } catch {
      return `$${(amount || 0).toFixed(2)}`;
    }
  };

  const tabs = [
    { id: 'overview', label: translate('admin.overview'), icon: BarChart3 },
    { id: 'users', label: translate('admin.userManagement'), icon: Users },
    { id: 'orders', label: translate('admin.orders'), icon: ShoppingBag },
    { id: 'products', label: translate('admin.products'), icon: Package },
    { id: 'analytics', label: translate('admin.analytics'), icon: TrendingUp },
    { id: 'settings', label: translate('admin.systemSettings'), icon: Settings }
  ];

  // Product management functions
  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {"Content-Type":"application/json"},
        credentials: 'include',
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setForm({ slug:"", title_en:"", title_de:"", desc_en:"", desc_de:"", price:"0", stock:"0", imageUrl:"", category: "General" });
        setShowForm(false);
        setEditingProduct(null);
        loadProducts();
      } else {
        const error = await res.json();
        alert(`Save failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id:number) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method:"DELETE", credentials: 'include' });
      if (res.ok) {
        loadProducts();
      } else {
        alert("Delete failed");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setForm({
      slug: product.slug,
      title_en: product.title_en,
      title_de: product.title_de,
      desc_en: product.desc_en,
      desc_de: product.desc_de,
      price: product.price.toString(),
      stock: product.stock.toString(),
      imageUrl: product.imageUrl || "",
      category: product.category || "General"
    });
    setShowForm(true);
  };

  const filteredProducts = products.filter(product =>
    product.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.title_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setForm({ slug:"", title_en:"", title_de:"", desc_en:"", desc_de:"", price:"0", stock:"0", imageUrl:"", category: "General" });
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{translate('admin.panel')}</h1>
              <p className="mt-2 text-gray-600">{translate('admin.managePlatform')}</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">{translate('admin.systemOnline')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid (live) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[{
              label: translate('admin.totalUsers'),
              value: statsLoading ? '...' : stats.totalUsers.toString(),
              icon: Users
            }, {
              label: translate('admin.totalOrders'),
              value: statsLoading ? '...' : stats.totalOrders.toString(),
              icon: ShoppingBag
            }, {
              label: translate('admin.revenue'),
              value: statsLoading ? '...' : formatUSD(stats.revenue),
              icon: TrendingUp
            }, {
              label: translate('admin.activeProducts'),
              value: statsLoading ? '...' : stats.activeProducts.toString(),
              icon: Package
            }].map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{statsError ? '-' : stat.value}</p>
                </div>
                <div className="p-3 bg-turquoise-100 rounded-lg">
                  <stat.icon className="w-6 h-6 text-turquoise-600" />
                </div>
              </div>
              {statsError && (
                <div className="mt-4 text-xs text-red-600">{statsError}</div>
              )}
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
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">{translate('admin.recentActivity')}</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {systemAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <div className={`w-3 h-3 rounded-full ${
                            alert.type === 'error' ? 'bg-red-500' :
                            alert.type === 'warning' ? 'bg-yellow-500' :
                            alert.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{translate(alert.message)}</p>
                            <p className="text-xs text-gray-500">{formatRelativeTime(new Date(alert.ts))}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View Merchant Modal */}
            {viewing.open && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Merchant Details</h3>
                    <button onClick={closeViewMerchant} className="text-gray-500 hover:text-gray-700">✕</button>
                  </div>
                  <div className="p-6 space-y-4">
                    {viewing.loading ? (
                      <div className="text-center text-gray-500 py-10">Loading...</div>
                    ) : viewing.error ? (
                      <div className="text-center text-red-600 py-10">{viewing.error}</div>
                    ) : viewing.data ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Store Name</p>
                            <p className="text-base font-medium text-gray-900">{viewing.data.storeName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="text-base font-medium text-gray-900">{viewing.data.status}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">User</p>
                            <p className="text-base font-medium text-gray-900">{viewing.data.user?.name} ({viewing.data.user?.email})</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Created</p>
                            <p className="text-base font-medium text-gray-900">{new Date(viewing.data.createdAt).toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500">Products</p>
                            <p className="text-xl font-semibold">{viewing.data.stats.productCount}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500">Orders</p>
                            <p className="text-xl font-semibold">{viewing.data.stats.orderCount}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500">Revenue</p>
                            <p className="text-xl font-semibold">{formatUSD(Number(viewing.data.stats.revenue || 0))}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Latest Products</h4>
                          {viewing.data.latestProducts?.length ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {viewing.data.latestProducts.map((p: any) => (
                                <div key={p.id} className="p-3 border rounded-lg flex items-center gap-3">
                                  {p.imageUrl && <img src={p.imageUrl} alt={p.slug} className="w-12 h-12 object-cover rounded" />}
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{p.title_en}</p>
                                    <p className="text-xs text-gray-500">{formatUSD(p.price)} • Stock: {p.stock}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No products</p>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Latest Orders</h4>
                          {viewing.data.latestOrders?.length ? (
                            <div className="space-y-2">
                              {viewing.data.latestOrders.map((o: any) => (
                                <div key={o.id} className="p-3 border rounded-lg flex items-center justify-between">
                                  <div className="text-sm text-gray-700">{o.status}</div>
                                  <div className="text-sm font-medium">{formatUSD(o.totalAmount)}</div>
                                  <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No orders</p>
                          )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          {viewing.data?.id && (
                            <button
                              className="px-3 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                              onClick={() => deleteMerchant(viewing.data.id)}
                            >
                              Delete Merchant
                            </button>
                          )}
                          <button className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50" onClick={closeViewMerchant}>Close</button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {/* User Management Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{translate('admin.userManagement')}</h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    {usersLoading ? (
                      <div className="py-8 text-center text-gray-500">Loading users...</div>
                    ) : usersError ? (
                      <div className="py-8 text-center text-red-600">{usersError}</div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.user')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.role')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.status')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.actions')}</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((u) => (
                            <tr key={u.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{u.name || '—'}</div>
                                  <div className="text-sm text-gray-500">{u.email}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    u.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                    u.role === 'MERCHANT' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {u.role}
                                  </span>
                                  {u.isDeleted && (
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700" title="User is deleted/disabled">
                                      Deleted
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {u.merchantId ? (
                                  <span>
                                    {(u.storeName || 'Merchant')}
                                    {u.isDeleted && <span className="ml-2 text-xs text-gray-500">(disabled)</span>}
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {u.merchantId ? (
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    u.isDeleted ? 'bg-gray-200 text-gray-700' : u.merchantStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                    u.merchantStatus === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {u.isDeleted ? 'DELETED' : u.merchantStatus}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-500">N/A</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {u.merchantId ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                      onClick={() => setMerchantStatus(u.merchantId!, 'PENDING')}
                                      disabled={u.merchantStatus === 'PENDING' || u.isDeleted}
                                    >
                                      Set Pending
                                    </button>
                                    <button
                                      className="px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                      onClick={() => setMerchantStatus(u.merchantId!, 'ACTIVE')}
                                      disabled={u.merchantStatus === 'ACTIVE' || u.isDeleted}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      className="px-3 py-1 rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50"
                                      onClick={() => openViewMerchant(u.merchantId!)}
                                      disabled={u.isDeleted}
                                    >
                                      View
                                    </button>
                                    <button
                                      className="px-3 py-1 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                                      onClick={() => deleteMerchant(u.merchantId!)}
                                      disabled={u.isDeleted}
                                    >
                                      Delete
                                    </button>
                                    <button
                                      className="px-3 py-1 rounded-md border border-red-400 text-red-800 hover:bg-red-50"
                                      onClick={() => deleteUser(u.id)}
                                      title="Delete user and all related data"
                                    >
                                      Delete User
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 mr-2">No merchant profile</span>
                                    <button
                                      className="px-3 py-1 rounded-md border border-red-400 text-red-800 hover:bg-red-50"
                                      onClick={() => deleteUser(u.id)}
                                      title="Delete user"
                                    >
                                      Delete User
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{translate('admin.orderManagement')}</h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    {ordersLoading ? (
                      <div className="py-8 text-center text-gray-500">Loading orders...</div>
                    ) : ordersError ? (
                      <div className="py-8 text-center text-red-600">{ordersError}</div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {order.id.slice(-8)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                  order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {translate(`status.${order.status.toLowerCase()}`)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatUSD(order.grandTotal)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{order.customer.name || '—'}</div>
                                  <div className="text-sm text-gray-500">{order.customer.email}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{order.merchant.storeName}</div>
                                  <div className="text-sm text-gray-500">{order.merchant.user.name || order.merchant.user.email}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-3">
                                  <button className="text-blue-600 hover:text-blue-900">
                                    View Details
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-800"
                                    onClick={() => deleteOrder(order.id)}
                                  >
                                    {translate('admin.delete')}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                {/* Header with Add Button */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{translate('admin.productManagement')}</h2>
                      <p className="text-gray-600 text-sm">Manage your product catalog</p>
                    </div>
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center px-5 py-2.5 bg-turquoise-600 text-white font-semibold rounded-md hover:bg-turquoise-700 transition-all duration-200"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Product
                    </button>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                      <Filter className="w-5 h-5 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>

                {/* Products List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading products...</p>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-600 mb-6 text-sm">
                          {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first product.'}
                        </p>
                        {!searchTerm && (
                          <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center px-5 py-2.5 bg-turquoise-600 text-white font-semibold rounded-md hover:bg-turquoise-700"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Your First Product
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map(p=>(
                          <div key={p.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            {p.imageUrl && (
                              <div className="w-full h-48 bg-gray-100">
                                <img src={p.imageUrl} alt={p.slug} className="w-full h-full object-contain" />
                              </div>
                            )}
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate" title={p.title_en}>{p.title_en}</h3>
                                  <p className="text-sm text-gray-600 mb-2 truncate" title={p.title_de}>{p.title_de}</p>
                                  <p className="text-xs text-gray-500">Slug: {p.slug}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => editProduct(p)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit product"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteProduct(p.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Price:</span>
                                  <span className="font-semibold text-lg text-green-600">{formatUSD(p.price)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Stock:</span>
                                  <span className={`font-semibold ${p.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {p.stock}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                  Created: {new Date(p.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Add/Edit Form Modal */}
                {showForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold text-gray-900">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                          </h2>
                          <button
                            onClick={resetForm}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                      <form onSubmit={saveProduct} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Slug (Unique)</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                              value={form.slug}
                              onChange={e=>setForm({...form, slug:e.target.value})}
                              placeholder="unique-product-slug"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">English Title</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                              value={form.title_en}
                              onChange={e=>setForm({...form, title_en:e.target.value})}
                              placeholder="Product Title (English)"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">German Title</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                              value={form.title_de}
                              onChange={e=>setForm({...form, title_de:e.target.value})}
                              placeholder="Produkttitel (Deutsch)"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD)</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                              value={form.price}
                              onChange={e=>setForm({...form, price:e.target.value})}
                              placeholder="29.99"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                            <input
                              type="number"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                              value={form.stock}
                              onChange={e=>setForm({...form, stock:e.target.value})}
                              placeholder="100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent cursor-pointer"
                              value={form.category}
                              onChange={e=>setForm({...form, category:e.target.value})}
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                            <div className="space-y-2">
                              <div className="relative w-full h-48 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                                {form.imageUrl ? (
                                  <>
                                    <img src={form.imageUrl} alt="preview" className="max-h-full object-contain" />
                                    <button
                                      type="button"
                                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 border hover:bg-white shadow"
                                      onClick={() => setForm({ ...form, imageUrl: '' })}
                                      title="Remove image"
                                    >
                                      <X className="w-4 h-4 text-gray-700" />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-gray-400 text-sm">No image</span>
                                )}
                              </div>
                              <div
                                className="flex items-center gap-3"
                                onDragOver={(e)=>e.preventDefault()}
                                onDrop={async (e)=>{
                                  e.preventDefault();
                                  const file = e.dataTransfer.files?.[0];
                                  if (!file) return;
                                  const fd = new FormData();
                                  fd.append('file', file);
                                  try {
                                    setIsUploading(true);
                                    const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                    const data = await res.json();
                                    if (!res.ok || !data.url) {
                                      alert(data.error || 'Upload failed');
                                    } else {
                                      setForm({ ...form, imageUrl: data.url });
                                    }
                                  } finally {
                                    setIsUploading(false);
                                  }
                                }}
                              >
                                <input
                                  type="url"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                                  value={form.imageUrl}
                                  onChange={e=>setForm({...form, imageUrl:e.target.value})}
                                  placeholder="https://example.com/image.jpg"
                                />
                                <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                                  <Upload className="w-4 h-4" />
                                  <span>{isUploading ? 'Uploading...' : (form.imageUrl ? 'Change' : 'Upload')}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const formData = new FormData();
                                      formData.append('file', file);
                                      try {
                                        setIsUploading(true);
                                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                        const data = await res.json();
                                        if (!res.ok || !data.url) {
                                          alert(data.error || 'Upload failed');
                                          return;
                                        }
                                        setForm({ ...form, imageUrl: data.url });
                                      } catch (err) {
                                        alert('Upload failed');
                                      } finally {
                                        setIsUploading(false);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">English Description</label>
                          <textarea
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                            value={form.desc_en}
                            onChange={e=>setForm({...form, desc_en:e.target.value})}
                            placeholder="Product description in English"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">German Description</label>
                          <textarea
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                            value={form.desc_de}
                            onChange={e=>setForm({...form, desc_de:e.target.value})}
                            placeholder="Produktbeschreibung auf Deutsch"
                          />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                          <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            {isUploading ? 'Cancel Upload' : 'Cancel'}
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-turquoise-600 text-white rounded-lg hover:bg-turquoise-700 disabled:opacity-50 flex items-center"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{translate('admin.analyticsSection.title')}</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">{translate('admin.analyticsSection.ordersToday')}</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">{translate('admin.analyticsSection.revenue')}</p>
                      <p className="text-2xl font-bold text-gray-900">{formatUSD(stats.revenue)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">{translate('admin.analyticsSection.activeMerchants')}</p>
                      <p className="text-2xl font-bold text-gray-900">{users.filter(u=>u.merchantStatus==='ACTIVE').length}</p>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-md font-semibold text-gray-900 mb-3">{translate('admin.analyticsSection.topProducts')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {products.slice(0,4).map(p => (
                        <div key={p.id} className="flex items-center gap-3">
                          {p.imageUrl && <img src={p.imageUrl} alt={p.slug} className="w-10 h-10 object-cover rounded" />}
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate" title={p.title_en}>{p.title_en}</div>
                            <div className="text-xs text-gray-500">{formatUSD(p.price)} • {p.stock} in stock</div>
                          </div>
                        </div>
                      ))}
                      {products.length === 0 && (
                        <div className="text-sm text-gray-500">No products</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{translate('admin.settings.title')}</h2>
                </div>
                <SettingsForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsForm() {
  const { translate } = useTranslation();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({ storeName: '', currency: 'EUR', defaultLanguage: 'en' });

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/settings', { credentials: 'include' });
        const data = await res.json();
        setForm({
          storeName: data.storeName || '',
          currency: data.currency || 'EUR',
          defaultLanguage: data.defaultLanguage || 'en'
        });
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data.error || 'Save failed');
      }
      // saved
      alert(translate('admin.settings.saved'));
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      {loading ? (
        <div className="text-gray-600">{translate('admin.settings.loading')}</div>
      ) : (
        <form onSubmit={onSave} className="max-w-xl space-y-5">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.settings.storeName')}</label>
            <input
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
              value={form.storeName}
              onChange={(e)=>setForm({ ...form, storeName: e.target.value })}
              placeholder="EStore"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.settings.currency')}</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                value={form.currency}
                onChange={(e)=>setForm({ ...form, currency: e.target.value })}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.settings.defaultLanguage')}</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                value={form.defaultLanguage}
                onChange={(e)=>setForm({ ...form, defaultLanguage: e.target.value })}
              >
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-turquoise-600 text-white rounded-md hover:bg-turquoise-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : translate('admin.settings.save')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
