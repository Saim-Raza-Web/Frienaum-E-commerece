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
    price:"0", stock:"0", imageUrl:""
  });

  const systemStats = [
    { label: translate('admin.totalUsers'), value: '2,847', icon: Users, change: '+12%', changeType: 'positive' },
    { label: translate('admin.totalOrders'), value: '15,234', icon: ShoppingBag, change: '+8%', changeType: 'positive' },
    { label: translate('admin.revenue'), value: '$89,432', icon: TrendingUp, change: '+23%', changeType: 'positive' },
    { label: translate('admin.activeProducts'), value: products.length.toString(), icon: Package, change: '+5%', changeType: 'positive' }
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'customer', status: 'active', lastActive: '2 hours ago' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'merchant', status: 'active', lastActive: '1 day ago' },
    { id: 3, name: 'Mike Wilson', email: 'mike@example.com', role: 'customer', status: 'pending', lastActive: '3 days ago' },
    { id: 4, name: 'Emily Brown', email: 'emily@example.com', role: 'merchant', status: 'active', lastActive: '1 week ago' }
  ];

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'admin.alerts.highServerLoad', time: '5 minutes ago' },
    { id: 2, type: 'info', message: 'admin.alerts.databaseBackup', time: '1 hour ago' },
    { id: 3, type: 'error', message: 'admin.alerts.paymentGateway', time: '2 hours ago' },
    { id: 4, type: 'success', message: 'admin.alerts.securityUpdate', time: '1 day ago' }
  ];

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

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setForm({ slug:"", title_en:"", title_de:"", desc_en:"", desc_de:"", price:"0", stock:"0", imageUrl:"" });
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
      const res = await fetch(`/api/products/${id}`, { method:"DELETE" });
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
      imageUrl: product.imageUrl || ""
    });
    setShowForm(true);
  };

  const filteredProducts = products.filter(product =>
    product.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.title_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setForm({ slug:"", title_en:"", title_de:"", desc_en:"", desc_de:"", price:"0", stock:"0", imageUrl:"" });
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="p-3 bg-turquoise-100 rounded-lg">
                  <stat.icon className="w-6 h-6 text-turquoise-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600 ml-1">{translate('admin.fromLastMonth')}</span>
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
                {/* System Health */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">{translate('admin.systemHealth')}</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Activity className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{translate('admin.cpuUsage')}</h3>
                        <p className="text-2xl font-bold text-green-600">23%</p>
                        <p className="text-sm text-gray-600">{translate('admin.normal')}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <BarChart3 className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{translate('admin.memory')}</h3>
                        <p className="text-2xl font-bold text-blue-600">67%</p>
                        <p className="text-sm text-gray-600">{translate('admin.good')}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Package className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{translate('admin.storage')}</h3>
                        <p className="text-2xl font-bold text-yellow-600">45%</p>
                        <p className="text-sm text-gray-600">{translate('admin.available')}</p>
                      </div>
                    </div>
                  </div>
                </div>

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
                            <p className="text-xs text-gray-500">{alert.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.user')}</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.role')}</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.status')}</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.lastActive')}</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentUsers.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'merchant' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastActive}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-turquoise-600 hover:text-turquoise-900 mr-3" onClick={() => alert('Edit functionality coming soon!')}>
                                {translate('admin.edit')}
                              </button>
                              <button className="text-red-600 hover:text-red-900 mr-3" onClick={() => alert('Delete functionality coming soon!')}>
                                {translate('admin.delete')}
                              </button>
                              <button className="text-blue-600 hover:text-blue-900" onClick={() => alert('View user details coming soon!')}>
                                {translate('admin.view')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{translate('admin.orderManagement')}</h3>
                    <p className="text-gray-600">{translate('admin.viewManageOrders')}</p>
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
                      <h2 className="text-xl font-semibold text-gray-900">{translate('admin.productManagement')}</h2>
                      <p className="text-gray-600">Manage your product catalog</p>
                    </div>
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center px-6 py-3 bg-turquoise-600 text-white font-semibold rounded-lg hover:bg-turquoise-700 transition-all duration-200"
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
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-600 mb-6">
                          {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first product.'}
                        </p>
                        {!searchTerm && (
                          <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center px-6 py-3 bg-turquoise-600 text-white font-semibold rounded-lg hover:bg-turquoise-700"
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
                              <img src={p.imageUrl} alt={p.slug} className="w-full h-48 object-cover" />
                            )}
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{p.title_en}</h3>
                                  <p className="text-sm text-gray-600 mb-2">{p.title_de}</p>
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
                                  <span className="font-semibold text-lg text-green-600">€{p.price.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Stock:</span>
                                  <span className={`font-semibold ${p.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {p.stock} {p.stock === 1 ? 'item' : 'items'}
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
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price (€)</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                            <input
                              type="url"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                              value={form.imageUrl}
                              onChange={e=>setForm({...form, imageUrl:e.target.value})}
                              placeholder="https://example.com/image.jpg"
                            />
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
                            Cancel
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
                  <h2 className="text-xl font-semibold text-gray-900">{translate('admin.analyticsDashboard')}</h2>
                </div>
                <div className="p-6">
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{translate('admin.analyticsDashboard')}</h3>
                    <p className="text-gray-600">{translate('admin.comprehensiveAnalytics')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{translate('admin.systemSettings')}</h2>
                </div>
                <div className="p-6">
                  <div className="text-center py-12">
                    <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{translate('admin.systemSettings')}</h3>
                    <p className="text-gray-600">{translate('admin.configurePlatformSettings')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
