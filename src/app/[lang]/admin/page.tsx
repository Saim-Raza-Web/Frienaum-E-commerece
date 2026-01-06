'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
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
  X,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n/TranslationProvider';
import SmartImage from '@/components/SmartImage';
import NotificationBell from '@/components/NotificationBell';

const ImageUpload = dynamic(() => import('@/components/ImageUpload'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 animate-pulse" />
  )
});

const MultipleImageUpload = dynamic(() => import('@/components/MultipleImageUpload'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 animate-pulse" />
  )
});

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
  status?: 'PUBLISHED' | 'PENDING' | 'DRAFT';
  shippingCost?: number;
  shippingCostNote?: string;
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { translate } = useTranslation();
  const { user } = useAuth();

  const translateOrFallback = (key: string, fallback: string) => {
    const result = translate(key);
    return result === key ? fallback : result;
  };

  // Helper function to translate roles
  const translateRole = (role: string) => {
    const roleKey = `role.${role}`;
    const translated = translate(roleKey);
    return translated !== roleKey ? translated : role;
  };

  // Helper function to translate merchant status
  const translateMerchantStatus = (status: string | null | undefined) => {
    if (!status) return translate('admin.notAvailable');
    // Try uppercase first (as it comes from DB), then lowercase
    const statusKeyUpper = `status.${status}`;
    const statusKeyLower = `status.${status.toLowerCase()}`;
    const translatedUpper = translate(statusKeyUpper);
    if (translatedUpper !== statusKeyUpper) return translatedUpper;
    const translatedLower = translate(statusKeyLower);
    return translatedLower !== statusKeyLower ? translatedLower : status;
  };

  // Status labels that get updated when translations load
  const [statusLabels, setStatusLabels] = useState({
    published: '',
    pending: '',
    draft: ''
  });

  // Update status labels when translations are available
  useEffect(() => {
    const publishedLabel = translate('status.published');
    const pendingLabel = translate('status.pending');
    const draftLabel = translate('status.draft');

    setStatusLabels({
      published: publishedLabel !== 'status.published' ? publishedLabel : '',
      pending: pendingLabel !== 'status.pending' ? pendingLabel : '',
      draft: draftLabel !== 'status.draft' ? draftLabel : ''
    });
  }, [translate]);

  // Product management state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; productId: number | null; reason: string }>({
    isOpen: false,
    productId: null,
    reason: ''
  });

  // Debug: Log modal state changes
  useEffect(() => {
    if (rejectModal.isOpen) {
      console.log('Reject modal opened:', rejectModal);
      console.log('Modal should be visible now');
    }
  }, [rejectModal.isOpen, rejectModal]);
  const [form, setForm] = useState<any>({
    slug:"", title_en:"", title_de:"", desc_en:"", desc_de:"",
    price:"0", stock:"0", imageUrl:"", images: [], category: translate('admin.generalCategory') || 'General',
    shippingCost:"", shippingCostNote:""
  });
  const [isProductImageUploading, setIsProductImageUploading] = useState(false);
  // Admin-only: selected merchant for new product
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');

  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    description: '', 
    imageUrl: ''
  });
  const [creatingCategory, setCreatingCategory] = useState(false);

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
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError('');
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      if (!res.ok) throw new Error(translate('admin.failedToFetchStats'));
      const data = await res.json();
      setStats(data);
    } catch (e: any) {
      setStatsError(e?.message || translate('admin.failedToFetchStats'));
    } finally {
      setStatsLoading(false);
    }
  }, [translate]);

  // Fetch categories from database
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const response = await fetch('/api/categories', {
        cache: 'no-store',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(translate('admin.failedToLoadCategories'));
      }
      const data = await response.json();
      setCategories(data);
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesError(error instanceof Error ? error.message : translate('admin.failedToLoadCategories'));
      return [];
    } finally {
      setCategoriesLoading(false);
    }
  }, [translate]);

  // Create or update category
  const saveCategory = async () => {
    if (!newCategory.name.trim()) {
      alert(translate('admin.categoryNameRequired'));
      return;
    }

    // Prevent submission while image is uploading
    if (isImageUploading) {
      alert(translate('admin.waitForImageUpload'));
      return;
    }

    try {
      setCreatingCategory(true);

      // Create form data to handle file upload
      const formData = new FormData();
      formData.append('name', newCategory.name.trim());
      formData.append('description', newCategory.description.trim());
      // Always append imageUrl, even if empty (will be converted to null in API)
      formData.append('imageUrl', newCategory.imageUrl || '');

      // Debug logging
      console.log('=== FRONTEND FORM DATA DEBUG ===');
      console.log('newCategory state:', newCategory);
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Check if imageUrl is set
      if (newCategory.imageUrl) {
        console.log('✅ Image URL is set in state:', newCategory.imageUrl);
      } else {
        console.log('❌ Image URL is empty in state');
      }

      const isEditing = !!editingCategoryId;
      const url = isEditing ? `/api/categories/${editingCategoryId}` : '/api/categories';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
        // Don't set Content-Type header, let the browser set it with the correct boundary
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEditing ? 'update' : 'create'} category`);
      }

      // Refresh the categories list
      await fetchCategories();
      
      // Reset the form and close the modal
      resetCategoryForm();
      alert(isEditing ? translate('admin.categoryUpdated') : translate('admin.categoryCreated'));
    } catch (error) {
      const isEditing = !!editingCategoryId;
      console.error(`Error ${isEditing ? 'updating' : 'creating'} category:`, error);
      alert(error instanceof Error ? error.message : (isEditing ? translate('admin.failedToUpdateCategory') : translate('admin.failedToCreateCategory')));
    } finally {
      setCreatingCategory(false);
    }
  };

  // Handle edit category
  const handleEditCategory = (category: any) => {
    setEditingCategoryId(category.id);
    setNewCategory({
      name: category.name,
      description: category.description || '',
      imageUrl: category.image || ''
    });
    setShowNewCategoryModal(true);
  };

  // Reset the category form
  const resetCategoryForm = () => {
    setNewCategory({ name: '', description: '', imageUrl: '' });
    setEditingCategoryId(null);
    setShowNewCategoryModal(false);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm(translate('admin.confirmDeleteUser'))) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || translate('admin.failedToDeleteUser'));
      }
      await Promise.all([loadUsers(), loadStats()]);
      alert(translate('admin.userDeleted'));
    } catch (e: any) {
      alert(e?.message || translate('admin.failedToDeleteUser'));
    }
  };

  // View/Delete merchant handlers
  const [viewing, setViewing] = useState<{open: boolean; loading: boolean; error: string; data: any | null}>({ open: false, loading: false, error: '', data: null });
  const openViewMerchant = async (merchantId: string) => {
    setViewing({ open: true, loading: true, error: '', data: null });
    try {
      const res = await fetch(`/api/admin/merchants/${merchantId}`, {
        credentials: 'include',
        cache: 'no-store',
      });
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
      await Promise.all([loadUsers(), loadStats()]);
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
  }, [activeTab, loadStats]);

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

  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      setUsersError('');
      const res = await fetch('/api/admin/users', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (e: any) {
      setUsersError(e?.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
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
  }, []);

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

  // Order viewing functions
  const openOrderModal = (order: AdminOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setShowOrderModal(false);
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
      await Promise.all([loadUsers(), loadStats()]);
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

  // Format currency amounts in CHF
  const formatCurrency = (amount: number) => {
    const value = Number.isFinite(amount) ? amount : 0;
    try {
      return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(value);
    } catch {
      return `${value.toFixed(2)} CHF`;
    }
  };

  const [tabs, setTabs] = useState([
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]);

  // Update tabs labels when translations are available
  useEffect(() => {
    setTabs([
      { id: 'overview', label: translate('admin.overview') || 'Overview', icon: BarChart3 },
      { id: 'users', label: translate('admin.userManagement') || 'Users', icon: Users },
      { id: 'orders', label: translate('admin.orderManagement') || 'Orders', icon: ShoppingBag },
      { id: 'products', label: translate('admin.productManagement') || 'Products', icon: Package },
      { id: 'categories', label: translate('admin.categories') || 'Categories', icon: Package },
      { id: 'analytics', label: translate('admin.analyticsDashboard') || 'Analytics', icon: TrendingUp },
      { id: 'settings', label: translate('admin.systemSettings') || 'Settings', icon: Settings },
    ]);
  }, [translate]);

  // Product management functions
  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products", {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Failed to load products: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
      alert(error instanceof Error ? error.message : "Failed to load products");
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
      fetchCategories();
      // Ensure merchants list is available for admin merchant selection
      loadUsers();
    }
  }, [activeTab, loadProducts, fetchCategories, loadUsers]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, loadUsers]);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab, loadOrders]);

  useEffect(() => {
    if (activeTab === 'categories') {
      fetchCategories();
    }
  }, [activeTab, fetchCategories]);

  const handleProductImageUpload = (url: string) => {
    setForm((prev: any) => ({ ...prev, imageUrl: url }));
    setIsProductImageUploading(false);
  };
  const handleProductImageUploadStart = () => setIsProductImageUploading(true);
  const handleProductImageUploadEnd = () => setIsProductImageUploading(false);

  const handleProductImagesChange = (urls: string[]) => {
    setForm((prev: any) => ({ ...prev, images: urls }));
  };

  const [isImageUploading, setIsImageUploading] = useState(false);

  const handleCategoryImageUpload = (url: string) => {
    console.log('=== IMAGE UPLOAD CALLBACK ===');
    console.log('Received URL:', url);
    console.log('Before state update - newCategory:', newCategory);
    setNewCategory((prev: any) => ({ ...prev, imageUrl: url }));
    setIsImageUploading(false); // Image upload completed
    console.log('After state update - should update newCategory.imageUrl to:', url);
  };

  const handleImageUploadStart = () => {
    setIsImageUploading(true);
  };

  const handleImageUploadEnd = () => {
    setIsImageUploading(false);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProductImageUploading) {
      alert('Please wait for the product image upload to finish before saving.');
      return;
    }
    
    // Validate German description is required
    if (!form.desc_de || !form.desc_de.trim()) {
      alert(translate('admin.germanDescriptionRequired') || 'German description is required.');
      return;
    }
    
    setLoading(true);

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const payload = {
        ...form,
        // For admins creating a product, API requires merchantId
        ...(editingProduct ? {} : (user?.role === 'admin' ? { merchantId: selectedMerchantId || undefined } : {}))
      };

      // Admin must select a merchant when creating a new product
      if (!editingProduct && user?.role === 'admin' && !selectedMerchantId) {
        setLoading(false);
        alert('Please select a merchant for this product.');
        return;
      }

      const res = await fetch(url, {
        method,
        headers: {"Content-Type":"application/json"},
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setForm({ slug:"", title_en:"", title_de:"", desc_en:"", desc_de:"", price:"0", stock:"0", imageUrl:"", images: [], category: "General", shippingCost:"", shippingCostNote:"" });
        setShowForm(false);
        setEditingProduct(null);
        setSelectedMerchantId('');
        await Promise.all([loadProducts(), loadStats()]);
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
        await Promise.all([loadProducts(), loadStats()]);
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
      shippingCost: product.shippingCost?.toString() || "",
      shippingCostNote: product.shippingCostNote || "",
      stock: product.stock.toString(),
      imageUrl: product.imageUrl || "",
      images: (product as any).images || [],
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
    setForm({ slug:"", title_en:"", title_de:"", desc_en:"", desc_de:"", price:"0", stock:"0", imageUrl:"", images: [], category: "General" });
    setEditingProduct(null);
    setShowForm(false);
    setIsProductImageUploading(false);
  };

  // Delete category
  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will not delete associated products but will remove their category assignment.')) return;
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete category');
      }

      // Optimistically remove from UI immediately
      setCategories(prev => prev.filter(cat => cat.id !== id));
      
      // Refresh the categories list from the server to ensure consistency
      await fetchCategories();
      alert(translate('admin.categoryDeleted') || 'Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      // If deletion failed, refresh from server to restore correct state
      await fetchCategories();
      alert(error instanceof Error ? error.message : translate('admin.failedToDeleteCategory') || 'Failed to delete category');
    }
  };

  // Handle delete category (wrapper for the UI)
  const handleDeleteCategory = async (categoryId: string) => {
    await deleteCategory(categoryId);
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive design */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-montserrat font-bold text-primary-800">{translate('admin.panel')}</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">{translate('admin.managePlatform')}</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <NotificationBell userRole="ADMIN" />
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-gray-600">{translate('admin.systemOnline')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats Grid - Responsive design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
              value: statsLoading ? '...' : formatCurrency(stats.revenue),
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
                  <p className="text-2xl font-montserrat font-bold text-primary-800">{statsError ? '-' : stat.value}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <stat.icon className="w-6 h-6 text-primary-warm" />
                </div>
              </div>
              {statsError && (
                <div className="mt-4 text-xs text-red-600">{statsError}</div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar Navigation - Responsive design */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 sm:space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-left rounded-lg transition-colors focus:outline-none text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-800 font-semibold'
                      : 'text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
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
                    <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('admin.recentActivity')}</h2>
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
                            <p className="text-sm font-montserrat font-medium text-primary-800">{translate(alert.message)}</p>
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
                    <h3 className="text-lg font-montserrat font-semibold text-primary-800">{translate('admin.merchantDetails')}</h3>
                    <button onClick={closeViewMerchant} className="text-primary-500 hover:text-primary-700 focus:outline-none">✕</button>
                  </div>
                  <div className="p-6 space-y-4">
                    {viewing.loading ? (
                      <div className="text-center text-gray-500 py-10">{translate('admin.loading')}</div>
                    ) : viewing.error ? (
                      <div className="text-center text-red-600 py-10">{viewing.error}</div>
                    ) : viewing.data ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">{translate('admin.storeName')}</p>
                            <p className="text-base font-montserrat font-medium text-primary-800">{viewing.data.storeName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{translate('admin.status')}</p>
                            <p className="text-base font-montserrat font-medium text-primary-800">{viewing.data.status}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{translate('admin.user')}</p>
                            <p className="text-base font-montserrat font-medium text-primary-800">{viewing.data.user?.name} ({viewing.data.user?.email})</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{translate('admin.created')}</p>
                            <p className="text-base font-montserrat font-medium text-primary-800">{new Date(viewing.data.createdAt).toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500">{translate('admin.products')}</p>
                            <p className="text-xl font-semibold">{viewing.data.stats.productCount}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500">{translate('admin.orders')}</p>
                            <p className="text-xl font-semibold">{viewing.data.stats.orderCount}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500">{translate('admin.revenue')}</p>
                            <p className="text-xl font-semibold">{formatCurrency(Number(viewing.data.stats.revenue || 0))}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-montserrat font-semibold text-primary-800 mb-2">{translate('admin.products')}</h4>
                          {viewing.data.latestProducts?.length ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {viewing.data.latestProducts.map((p: any) => (
                                <div key={p.id} className="p-3 border rounded-lg flex items-center gap-3">
                                  {p.imageUrl && (
                                    <div className="relative w-12 h-12 rounded overflow-hidden">
                                      <SmartImage
                                        src={p.imageUrl}
                                        alt={p.slug}
                                        fill
                                        sizes="48px"
                                        className="object-cover"
                                        fallbackSrc="/images/placeholder.jpg"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{p.title_en}</p>
                                    <p className="text-xs text-gray-500">{formatCurrency(p.price)} • {translate('admin.stock')}: {p.stock}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">{translate('admin.noProducts')}</p>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-montserrat font-semibold text-primary-800 mb-2">{translate('admin.orders')}</h4>
                          {viewing.data.latestOrders?.length ? (
                            <div className="space-y-2">
                              {viewing.data.latestOrders.map((o: any) => (
                                <div key={o.id} className="p-3 border rounded-lg flex items-center justify-between">
                                  <div className="text-sm text-primary-700">{o.status}</div>
                                  <div className="text-sm font-medium">{formatCurrency(o.totalAmount)}</div>
                                  <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">{translate('admin.noOrders')}</p>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            {viewing.data?.id && (
                              <button
                                className="px-3 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50 w-full sm:w-auto"
                                onClick={() => deleteMerchant(viewing.data.id)}
                              >
                                {translate('admin.deleteMerchant')}
                              </button>
                            )}
                            <button className="btn-secondary w-full sm:w-auto" onClick={closeViewMerchant}>{translate('admin.close')}</button>
                          </div>
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
                  <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('admin.userManagement')}</h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    {usersLoading ? (
                      <div className="py-8 text-center text-gray-500">{translate('admin.loadingUsers')}</div>
                    ) : usersError ? (
                      <div className="py-8 text-center text-red-600">{usersError}</div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.user')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.role')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.merchant')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.status')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.actions')}</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((u) => (
                            <tr key={u.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-montserrat font-medium text-primary-800">{u.name || '—'}</div>
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
                                    {translateRole(u.role)}
                                  </span>
                                  {u.isDeleted && (
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700" title={translate('admin.deleted')}>
                                      {translate('admin.deleted')}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {u.role === 'MERCHANT' || u.merchantId ? (
                                  <span>
                                    {(u.storeName || translate('admin.merchant'))}
                                    {u.isDeleted && <span className="ml-2 text-xs text-gray-500">{translate('admin.disabled')}</span>}
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {u.role === 'MERCHANT' || u.merchantId ? (
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    u.isDeleted ? 'bg-gray-200 text-gray-700' : u.merchantStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                    u.merchantStatus === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {u.isDeleted ? translate('admin.deleted').toUpperCase() : translateMerchantStatus(u.merchantStatus || 'PENDING')}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-500">{translate('admin.notAvailable')}</span>
                                )}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {u.role === 'MERCHANT' || u.merchantId ? (
                                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                                    {u.merchantId ? (
                                      <>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                          <button
                                            className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 btn-touch text-left sm:text-center"
                                            onClick={() => setMerchantStatus(u.merchantId!, 'PENDING')}
                                            disabled={u.merchantStatus === 'PENDING' || u.isDeleted}
                                          >
                                            {translate('admin.setPending')}
                                          </button>
                                          <button
                                            className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 btn-touch text-left sm:text-center"
                                            onClick={() => setMerchantStatus(u.merchantId!, 'ACTIVE')}
                                            disabled={u.merchantStatus === 'ACTIVE' || u.isDeleted}
                                          >
                                            {translate('admin.approve')}
                                          </button>
                                          <button
                                            className="px-3 py-2 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50 disabled:opacity-50 btn-touch text-left sm:text-center"
                                            onClick={() => setMerchantStatus(u.merchantId!, 'SUSPENDED')}
                                            disabled={u.merchantStatus === 'SUSPENDED' || u.isDeleted}
                                          >
                                            {translate('admin.suspend')}
                                          </button>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                          <button
                                            className="px-3 py-2 rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50 btn-touch text-left sm:text-center"
                                            onClick={() => openViewMerchant(u.merchantId!)}
                                            disabled={u.isDeleted}
                                          >
                                            {translate('admin.view')}
                                          </button>
                                          <button
                                            className="px-3 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50 btn-touch text-left sm:text-center"
                                            onClick={() => deleteMerchant(u.merchantId!)}
                                            disabled={u.isDeleted}
                                          >
                                            {translate('admin.delete')}
                                          </button>
                                          <button
                                            className="px-3 py-2 rounded-md border border-red-400 text-red-800 hover:bg-red-50 btn-touch text-left sm:text-center"
                                            onClick={() => deleteUser(u.id)}
                                            title={translate('admin.deleteUserAndData')}
                                          >
                                            {translate('admin.deleteUser')}
                                          </button>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                                        <span className="text-xs text-gray-400">{translate('admin.noMerchantProfile')}</span>
                                        <button
                                          className="px-3 py-2 rounded-md border border-red-400 text-red-800 hover:bg-red-50 btn-touch text-left sm:text-center"
                                          onClick={() => deleteUser(u.id)}
                                          title={translate('admin.deleteUser')}
                                        >
                                          {translate('admin.deleteUser')}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                                    <span className="text-xs text-gray-400">{translate('admin.noMerchantProfile')}</span>
                                    <button
                                      className="px-3 py-2 rounded-md border border-red-400 text-red-800 hover:bg-red-50 btn-touch text-left sm:text-center"
                                      onClick={() => deleteUser(u.id)}
                                      title={translate('admin.deleteUser')}
                                    >
                                      {translate('admin.deleteUser')}
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
                      <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('admin.orderManagement')}</h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    {ordersLoading ? (
                      <div className="py-8 text-center text-gray-500">{translate('admin.loadingOrders')}</div>
                    ) : ordersError ? (
                      <div className="py-8 text-center text-red-600">{ordersError}</div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('table.orderId')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('table.status')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('table.totalAmount')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('table.customer')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('table.merchant')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('table.createdAt')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('table.actions')}</th>
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
                                {formatCurrency(order.grandTotal)}
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
                                  <button 
                                    onClick={() => openOrderModal(order)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    {translate('admin.viewDetails')}
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
                      <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('admin.productManagement')}</h2>
                      <p className="text-gray-600 text-sm">Manage your product catalog</p>
                    </div>
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-primary-warm text-white px-2 py-1.5 rounded-md text-xs font-medium hover:bg-primary-warm-hover transition-colors flex items-center gap-1.5 sm:px-4 sm:py-3 sm:text-base sm:rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {translate('admin.addProduct')}
                    </button>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={translate('admin.searchProducts')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        // Filter functionality - placeholder for future implementation
                        // Currently search is handled by the search input above
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-not-allowed opacity-60"
                      disabled
                      title="Filter functionality coming soon"
                    >
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
                        <h3 className="text-base font-montserrat font-semibold text-primary-800 mb-2">
                          {translateOrFallback('admin.noProductsFound', 'No products found')}
                        </h3>
                        <p className="text-gray-600 mb-6 text-sm">
                          {searchTerm
                            ? translateOrFallback('admin.tryAdjustingSearch', 'Try adjusting your search terms.')
                            : translateOrFallback('admin.getStartedAddProduct', 'Get started by adding your first product.')}
                        </p>
                        {!searchTerm && (
                          <button
                            onClick={() => setShowForm(true)}
                            className="btn-primary"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            {translateOrFallback('admin.addYourFirstProduct', 'Add Your First Product')}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map(p=>(
                          <div key={p.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative flex flex-col h-full">
                            {p.imageUrl && (
                              <div className="relative w-full h-48 bg-gray-100">
                                <SmartImage
                                  src={p.imageUrl}
                                  alt={p.slug}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 400px"
                                  className="object-contain"
                                  fallbackSrc="/images/placeholder.jpg"
                                />
                              </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col">
                              <div className="flex items-start justify-between mb-4 gap-3">
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-sm font-montserrat font-semibold text-primary-800 mb-1 line-clamp-2" title={p.title_en}>{p.title_en}</h3>
                                  <p className="text-xs text-primary-600 mb-2 line-clamp-2" title={p.title_de}>{p.title_de}</p>
                                  <p className="text-xs text-primary-500 truncate">Slug: {p.slug}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0 relative z-10">
                                  <button
                                    onClick={() => editProduct(p)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors btn-touch"
                                    title="Edit product"
                                    aria-label="Edit product"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteProduct(p.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors btn-touch"
                                    title="Delete product"
                                    aria-label="Delete product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">{translate('admin.price')}:</span>
                                  <span className="font-montserrat font-semibold text-sm text-primary-warm">{formatCurrency(p.price)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">{translate('admin.stock')}:</span>
                                  <span className={`${p.stock > 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                                    {p.stock}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                  {translate('admin.created')}: {new Date(p.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="mt-2 flex flex-col gap-2">
                                <div className="flex items-center">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    p.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-800' :
                                    p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'}`}>{
                                    p.status === 'PUBLISHED' ? statusLabels.published :
                                    p.status === 'PENDING' ? statusLabels.pending :
                                    statusLabels.draft
                                  }</span>
                                </div>
                                {p.status === 'PENDING' && (
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      className="px-3 py-1.5 text-xs rounded bg-green-600 text-white hover:bg-green-700 whitespace-nowrap font-medium"
                                      onClick={async () => {
                                        try {
                                          const res = await fetch(`/api/admin/products/${p.id}/approve`, { method: 'POST', credentials: 'include' });
                                          if (!res.ok) throw new Error('Failed to publish');
                                          await loadProducts();
                                          alert(translate('admin.productApproved'));
                                        } catch (err) {
                                          alert(translate('admin.errorApprovingProduct'));
                                        }
                                      }}
                                    >{translate('action.approve')}</button>
                                    <button
                                      type="button"
                                      className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700 whitespace-nowrap font-medium"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('Reject button clicked, product ID:', p.id);
                                        setRejectModal({ isOpen: true, productId: p.id, reason: '' });
                                      }}
                                    >{translate('action.reject')}</button>
                                  </div>
                                )}
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
                  <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl md|max-w-3xl mx-4 max-h-[90vh] overflow-y-auto relative">
                      {isProductImageUploading && (
                        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                          <Loader2 className="w-8 h-8 text-turquoise-600 animate-spin mb-2" />
                          <p className="text-sm font-medium text-gray-700 text-center px-4">
                            Uploading product image… please wait while the link is generated.
                          </p>
                        </div>
                      )}
                      <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-montserrat font-semibold text-primary-800">
                            {editingProduct ? translate('admin.editProduct') : translate('admin.addNewProduct')}
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.slug')}:</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                              value={form.slug}
                              onChange={e=>setForm({...form, slug:e.target.value})}
                              placeholder={translate('admin.productSlugPlaceholder')}
                            />
                          </div>
                          {/* Admin-only merchant selector when creating new product */}
                          {(!editingProduct && user?.role === 'admin') && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.merchant')}:</label>
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                                value={selectedMerchantId}
                                onChange={e=>setSelectedMerchantId(e.target.value)}
                                required
                              >
                                <option value="">{translate('admin.selectMerchant')}</option>
                                {users.filter(u => !!u.merchantId && !u.isDeleted).map(u => (
                                  <option key={u.merchantId!} value={u.merchantId!}>
                                    {u.storeName || u.name || u.email}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.englishTitle')}:</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                              value={form.title_en}
                              onChange={e=>setForm({...form, title_en:e.target.value})}
                              placeholder={translate('admin.productTitleEnPlaceholder')}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.germanTitle')}:</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                              value={form.title_de}
                              onChange={e=>setForm({...form, title_de:e.target.value})}
                              placeholder={translate('admin.productTitleDePlaceholder')}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.price')}:</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                              value={form.price}
                              onChange={e=>setForm({...form, price:e.target.value})}
                              placeholder={translate('admin.pricePlaceholder')}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.stockQuantity')}:</label>
                            <input
                              type="number"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                              value={form.stock}
                              onChange={e=>setForm({...form, stock:e.target.value})}
                              placeholder={translate('admin.stockPlaceholder')}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {translate('admin.shippingCost')} (CHF):
                              <span className="text-xs text-gray-500 ml-1">
                                ({translate('admin.shippingCostHelp') || 'Leave empty for default CHF 8.50'})
                              </span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                              value={form.shippingCost || ''}
                              onChange={e=>setForm({...form, shippingCost:e.target.value})}
                              placeholder="8.50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {translate('admin.shippingCostNote')}:
                              <span className="text-xs text-gray-500 ml-1">
                                ({translate('admin.shippingCostNoteHelp') || 'Optional note about shipping'})
                              </span>
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                              value={form.shippingCostNote || ''}
                              onChange={e=>setForm({...form, shippingCostNote:e.target.value})}
                              placeholder={translate('admin.shippingCostNotePlaceholder') || 'Expressversand möglich'}
                              maxLength={100}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.category')}:</label>
                            <div className="flex gap-2">
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent cursor-pointer flex-1"
                                value={form.category}
                                onChange={e=>setForm({...form, category:e.target.value})}
                              >
                                <option value="General">{translate('admin.general')}</option>
                                {categories.map(category => (
                                  <option key={category.id} value={category.name}>
                                    {category.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => setShowNewCategoryModal(true)}
                                className="bg-primary-warm text-white px-2 py-1.5 rounded-md text-xs font-medium hover:bg-primary-warm-hover transition-colors sm:px-3 sm:py-2 sm:text-sm sm:rounded-lg"
                                title={translate('admin.addNewCategory')}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.productImage')} ({translate('merchant.multipleImages') || 'Multiple images allowed'})</label>
                            <MultipleImageUpload
                              onImagesChange={handleProductImagesChange}
                              currentImages={form.images}
                              onUploadStart={handleProductImageUploadStart}
                              onUploadEnd={handleProductImageUploadEnd}
                              className="mb-2"
                              maxImages={10}
                              disabled={loading}
                            />

                            {/* Alternative: Manual URL Input for backward compatibility */}
                            <div className="mt-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">{translate('admin.enterImageURLManually')} ({translate('admin.optional') || 'optional'}):</label>
                              <input
                                type="text"
                                value={form.imageUrl}
                                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder={translate('admin.imageUrlPlaceholder')}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {translate('admin.englishDescription')} <span className="text-gray-400 text-xs">({translate('admin.optional') || 'optional'})</span>:
                          </label>
                          <textarea
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                            value={form.desc_en}
                            onChange={e=>setForm({...form, desc_en:e.target.value})}
                            placeholder={translate('admin.descriptionEnPlaceholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {translate('admin.germanDescription')} <span className="text-red-500">*</span>:
                          </label>
                          <textarea
                            rows={3}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                            value={form.desc_de}
                            onChange={e=>setForm({...form, desc_de:e.target.value})}
                            placeholder={translate('admin.descriptionDePlaceholder')}
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={resetForm}
                              className="btn-secondary focus:outline-none w-full sm:w-auto"
                            >
                              {isProductImageUploading ? translate('admin.cancelUpload') : translate('cancel')}
                            </button>
                            <button
                              type="submit"
                              disabled={loading || isProductImageUploading}
                              className="btn-primary disabled:opacity-50 flex items-center focus:outline-none w-full sm:w-auto"
                            >
                            <Save className="w-4 h-4 mr-2" />
                            {loading
                              ? translate('admin.saving')
                              : isProductImageUploading
                                ? translate('admin.waitingForImageUpload')
                                : (editingProduct ? translate('admin.updateProduct') : translate('admin.addProduct'))}
                          </button>
                        </div>
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
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">{translate('admin.analyticsSection.ordersToday')}</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">{translate('admin.analyticsSection.revenue')}</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
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
                          {p.imageUrl && (
                            <div className="relative w-10 h-10 rounded overflow-hidden">
                              <SmartImage
                                src={p.imageUrl}
                                alt={p.slug}
                                fill
                                sizes="40px"
                                className="object-cover"
                                fallbackSrc="/images/placeholder.jpg"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate" title={p.title_en}>{p.title_en}</div>
                            <div className="text-xs text-gray-500 truncate">{formatCurrency(p.price)} • {p.stock} {translate('admin.inStock')}</div>
                          </div>
                        </div>
                      ))}
                      {products.length === 0 && (
                        <div className="text-sm text-gray-500">{translate('admin.noProducts')}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('admin.categories')}</h2>
                  <button
                    onClick={() => {
                      resetCategoryForm();
                      setShowNewCategoryModal(true);
                    }}
                    className="bg-primary-warm text-white px-2 py-1.5 rounded-md text-xs font-medium hover:bg-primary-warm-hover transition-colors flex items-center gap-1.5 sm:px-4 sm:py-3 sm:text-base sm:rounded-lg sm:gap-2"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {translate('admin.addNewCategory')}
                  </button>
                </div>

                {categoriesLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-turquoise-500"></div>
                  </div>
                ) : categoriesError ? (
                  <div className="text-center py-8">
                    <div className="text-red-600 mb-4">{translate('admin.errorLoadingCategories')}: {categoriesError}</div>
                    <button
                      onClick={fetchCategories}
                      className="btn-primary"
                    >
                      {translate('admin.retry')}
                    </button>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">{translate('admin.noCategoriesFound')}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map((category) => (
                      <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                          {category.image ? (
                            <SmartImage
                              src={category.image}
                              alt={category.name}
                              fill={false}
                              width={160}
                              height={160}
                              className="w-full h-full object-cover"
                              fallbackSrc="/images/placeholder-category.jpg"
                            />
                          ) : (
                            <div className="text-gray-400 p-4 text-center">
                              <SmartImage
                                src="/images/placeholder-category.jpg"
                                alt="No image"
                                fill={false}
                                width={160}
                                height={160}
                                className="w-40 h-40 object-cover opacity-50 mx-auto"
                              />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-montserrat font-medium text-primary-800">{category.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              category.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {category.isActive ? translate('admin.active') : translate('admin.inactive')}
                            </span>
                          </div>
                          {category.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{category.description}</p>
                          )}
                          <div className="mt-3 flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {category.productCount} {category.productCount === 1 ? translate('admin.product') : translate('admin.products')}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCategory(category);
                                }}
                                className="p-1.5 text-gray-500 hover:text-turquoise-600 hover:bg-gray-100 rounded"
                                title={translate('admin.edit')}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (window.confirm(translate('admin.confirmDeleteCategory', { name: category.name }))) {
                                    await handleDeleteCategory(category.id);
                                  }
                                }}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                                title={translate('admin.delete')}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* System Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('admin.settings.title')}</h2>
                </div>
                <SettingsForm />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showNewCategoryModal && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 my-8">
            <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategoryId ? translate('admin.editCategory') : translate('admin.addNewCategory')}
                </h3>
                <button
                  onClick={resetCategoryForm}
                  className="text-gray-400 hover:text-gray-500"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                saveCategory(); 
              }} 
              className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.categoryName') || 'Category Name'}:</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                  placeholder={translate('admin.categoryName') || 'Enter category name'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.description') || 'Description'}:</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                  placeholder={translate('admin.description') || 'Enter category description'}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.productImage') || 'Category Image'}:</label>
                <ImageUpload
                  onImageUpload={handleCategoryImageUpload}
                  onUploadStart={handleImageUploadStart}
                  onUploadEnd={handleImageUploadEnd}
                  currentImageUrl={newCategory.imageUrl}
                  className="mb-2"
                  disabled={creatingCategory}
                />
                <input
                  type="text"
                  value={newCategory.imageUrl}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                  placeholder={translate('admin.imageUrl') || 'Image URL'}
                />
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="btn-secondary focus:outline-none w-full sm:w-auto"
                    disabled={creatingCategory}
                  >
                    {translate('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={creatingCategory || isImageUploading}
                    className="btn-primary disabled:opacity-50 focus:outline-none w-full sm:w-auto"
                  >
                  {creatingCategory || isImageUploading
                    ? (isImageUploading ? translate('admin.uploadingImage') : translate('admin.saving'))
                    : editingCategoryId
                      ? translate('admin.updateCategory')
                      : translate('admin.createCategory')}
                </button>
              </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900">{translate('admin.orderDetails')}: #{selectedOrder.id?.slice(-8)}</h3>
              <button onClick={closeOrderModal} className="text-gray-500 hover:text-gray-700 focus:outline-none">✕</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Order Status and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('admin.status')}:</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedOrder.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    selectedOrder.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                    selectedOrder.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                    selectedOrder.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {translate(`status.${selectedOrder.status.toLowerCase()}`)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('admin.totalAmount')}:</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedOrder.grandTotal)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('admin.orderDate')}:</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">{translate('admin.customerInformation')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('admin.name')}:</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedOrder.customer.name || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('admin.email')}:</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedOrder.customer.email}</p>
                  </div>
                </div>
              </div>

              {/* Merchant Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">{translate('admin.merchantInformation')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('admin.storeName')}:</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedOrder.merchant.storeName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('admin.merchantContact')}:</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedOrder.merchant.user.name || selectedOrder.merchant.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">{translate('admin.shippingAddress')}:</h4>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedOrder.shippingAddress}</p>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">{translate('admin.orderItems')}:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.product')}:</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.quantity')}:</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.price')}:</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('admin.total')}:</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.product.imageUrl && (
                                <div className="relative h-10 w-10 rounded-lg overflow-hidden mr-3">
                                  <SmartImage
                                    src={item.product.imageUrl}
                                    alt={item.product.title_en}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                    fallbackSrc="/images/placeholder.jpg"
                                  />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.product.title_en}</div>
                                <div className="text-sm text-gray-500">{item.product.title_de}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.price)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button onClick={closeOrderModal} className="btn-secondary">{translate('admin.close')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Product Modal */}
      {rejectModal.isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setRejectModal({ isOpen: false, productId: null, reason: '' });
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              position: 'relative', 
              zIndex: 100000,
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              maxWidth: '28rem',
              width: '100%',
              padding: '1.5rem'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {translateOrFallback('admin.rejectReason', 'Grund für Ablehnung (optional)')}
              </h3>
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, productId: null, reason: '' })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder={translateOrFallback('admin.rejectReasonPlaceholder', 'Geben Sie optional einen Grund für die Ablehnung ein...')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, productId: null, reason: '' })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {translateOrFallback('action.cancel', 'Abbrechen')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!rejectModal.productId) return;
                  try {
                    const res = await fetch(`/api/admin/products/${rejectModal.productId}/reject`, { 
                      method: 'POST', 
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reason: rejectModal.reason || '' })
                    });
                    if (!res.ok) throw new Error('Failed to reject');
                    await loadProducts();
                    setRejectModal({ isOpen: false, productId: null, reason: '' });
                    alert(translateOrFallback('admin.productRejected', 'Produkt abgelehnt'));
                  } catch (err) {
                    alert(translateOrFallback('admin.errorRejectingProduct', 'Fehler beim Ablehnen'));
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                {translateOrFallback('action.reject', 'Ablehnen')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

function SettingsForm() {
  const { translate } = useTranslation();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({ storeName: 'Fienraum', currency: 'CHF', defaultLanguage: 'de' });

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/settings', { credentials: 'include' });
        const data = await res.json();
        setForm({
          storeName: data.storeName || 'Fienraum',
          currency: data.currency || 'CHF',
          defaultLanguage: data.defaultLanguage || 'de'
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.settings.storeName')}:</label>
            <input
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
              value={form.storeName}
              onChange={(e)=>setForm({ ...form, storeName: e.target.value })}
              placeholder={translate('admin.storeNamePlaceholder')}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.settings.currency')}:</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent bg-white text-gray-900"
                value={form.currency}
                onChange={(e)=>setForm({ ...form, currency: e.target.value })}
              >
                <option value="CHF">CHF</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.settings.defaultLanguage')}:</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent bg-white text-gray-900"
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
              className="btn-primary disabled:opacity-50 focus:outline-none"
            >
              {saving ? translate('admin.saving') : translate('admin.settings.save')}
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
