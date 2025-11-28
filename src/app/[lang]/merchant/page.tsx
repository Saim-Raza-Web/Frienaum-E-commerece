'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n/TranslationProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  Plus,
  Search,
  Filter,
  Loader2,
  CreditCard,
  CheckCircle
} from 'lucide-react';

const ImageUpload = dynamic(() => import('@/components/ImageUpload'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 animate-pulse" />
  )
});

function MerchantDashboard() {
  const { translate } = useTranslation();
  const { user } = useAuth();
  const [merchantStatus, setMerchantStatus] = useState<string>('PENDING');

  const formatCurrency = (amount: number | string | null | undefined) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount ?? 0;
    const safeValue = Number.isFinite(value) ? (value as number) : 0;
    try {
      return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(safeValue);
    } catch {
      return `${safeValue.toFixed(2)} CHF`;
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('MerchantDashboard - User authentication state:', {
      user,
      userExists: !!user,
      userId: user?.id,
      userRole: user?.role
    });
  }, [user]);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch merchant status
  useEffect(() => {
    const fetchMerchantStatus = async () => {
      try {
        const response = await fetch('/api/merchant/stats', {
          method: 'GET',
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          // We can infer merchant status from whether they have stats or not
          // For now, assume all merchants are active. In a real implementation,
          // you'd have a separate endpoint to get merchant profile including status
          setMerchantStatus('ACTIVE');
        }
      } catch (error) {
        console.error('Error fetching merchant status:', error);
      }
    };

    if (user?.role === 'merchant' && user?.id) {
      fetchMerchantStatus();
    }
  }, [user?.role, user?.id]); // More specific dependencies

  // State declarations
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for add product modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [isProductImageUploading, setIsProductImageUploading] = useState(false);
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
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
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
  // State for orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // State for customers
  const [customers, setCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);

  // State for analytics
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // State for payouts
  const [payouts, setPayouts] = useState<any>(null);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutsError, setPayoutsError] = useState<string | null>(null);
  const [showPayoutRequest, setShowPayoutRequest] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutRequestLoading, setPayoutRequestLoading] = useState(false);

  // State for customer detail modal
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [customerNotes, setCustomerNotes] = useState('');
  const [customerTags, setCustomerTags] = useState('');

  // State for categories
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    description: '',
    imageUrl: ''
  });
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [isCategoryImageUploading, setIsCategoryImageUploading] = useState(false);
  const [customerSaving, setCustomerSaving] = useState(false);

  // Helper function to transform order status for merchant view
  const getMerchantOrderStatus = (status: string) => {
    // Orders start as PENDING after payment - merchants see them as PENDING (needs processing)
    // No transformation needed since orders are actually PENDING after successful payment
    return status;
  };

  const getMerchantOrderStatusColor = (status: string) => {
    const merchantStatus = getMerchantOrderStatus(status);
    switch (merchantStatus) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Create new category
  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      alert(translate('merchant.categoryNameRequired'));
      return;
    }
    if (isCategoryImageUploading) {
      alert(translate('merchant.waitForImageUpload'));
      return;
    }

    try {
      setCreatingCategory(true);
      
      const formData = new FormData();
      formData.append('name', newCategory.name.trim());
      formData.append('description', newCategory.description.trim());
      if (newCategory.imageUrl) {
        formData.append('imageUrl', newCategory.imageUrl);
      }

      const response = await fetch('/api/categories', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create category');
      }

      const createdCategory = await response.json();
      setCategories(prev => [...prev, createdCategory]);
      
      // Reset form
      setNewCategory({ 
        name: '', 
        description: '',
        imageUrl: ''
      });
      setShowNewCategoryModal(false);
      alert(translate('merchant.categoryCreatedSuccess'));
    } catch (error) {
      console.error('Error creating category:', error);
      alert(error instanceof Error ? error.message : translate('merchant.failedToCreateCategory'));
    } finally {
      setCreatingCategory(false);
    }
  };

  // Order detail modal state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderStatusDraft, setOrderStatusDraft] = useState<string>('');
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

  // State for order item editing
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [editingOrderItems, setEditingOrderItems] = useState<any[]>([]);
  const [updatingOrderItems, setUpdatingOrderItems] = useState(false);

  // Initialize stats with loading state
  const [stats, setStats] = useState([
    { label: translate('merchant.totalSales'), value: translate('merchant.loading'), change: '', icon: DollarSign, color: 'text-green-600' },
    { label: translate('merchant.orders'), value: translate('merchant.loading'), change: '', icon: ShoppingBag, color: 'text-blue-600' },
    { label: translate('merchant.customers'), value: translate('merchant.loading'), change: '', icon: Users, color: 'text-purple-600' },
    { label: translate('merchant.products'), value: translate('merchant.loading'), change: '', icon: Package, color: 'text-orange-600' }
  ]);

  // Fetch stats data
  const fetchStats = async (setLoadingStats: ((v: boolean) => void) | undefined = undefined) => {
    try {
      if (setLoadingStats) setLoadingStats(true);
      setError(null);
      if (!user) {
        setError('Please log in to access merchant dashboard');
        return;
      }
      const response = await fetch('/api/merchant/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session
        cache: 'no-store'
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view merchant statistics');
        }
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }
      const data = await response.json();
      if (data && typeof data === 'object' && !data.error) {
        setStats(prevStats => [
          { ...prevStats[0], value: new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(Number(data.totalSales) || 0) },
          { ...prevStats[1], value: data.totalOrders?.toString() || '0' },
          { ...prevStats[2], value: data.totalCustomers?.toString() || '0' },
          { ...prevStats[3], value: data.totalProducts?.toString() || '0' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to load stats');
    } finally {
      if (setLoadingStats) setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  // --- Orders: handlers ---
  const openOrderModal = (order: any) => {
    setSelectedOrder(order);
    setOrderStatusDraft(order?.status || 'PENDING');
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
    setOrderStatusDraft('');
  };

  const saveOrderStatus = async () => {
    if (!selectedOrder || !orderStatusDraft) return;

    try {
      setUpdatingOrderStatus(true);

      const response = await fetch(`/api/merchant/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: orderStatusDraft,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to update order status');
        }
        let errorMessage = 'Failed to update order status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Update the order in the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === selectedOrder.id
            ? { ...order, status: orderStatusDraft }
            : order
        )
      );

      // Update the selected order
      setSelectedOrder((prev) => prev ? { ...prev, status: orderStatusDraft } : null);
      await fetchStats(); // <-- immediately refresh stats on status update
      alert(translate('merchant.orderStatusUpdatedSuccess'));
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  const saveOrderItems = async () => {
    if (!editingOrder || !editingOrderItems.length) return;

    try {
      setUpdatingOrderItems(true);

      // Calculate new total based on updated items
      const newTotal = editingOrderItems.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.price);
      }, 0);

      // Update order items
      const response = await fetch(`/api/merchant/orders/${editingOrder.id}/items`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: editingOrderItems,
          totalAmount: newTotal,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to update order items');
        }
        let errorMessage = 'Failed to update order items';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Refresh orders after update
      await fetchOrdersData();

      // Close the edit modal and go back to order view
      setShowEditOrderModal(false);
      setEditingOrder(null);
      setEditingOrderItems([]);

      alert(translate('merchant.orderItemsUpdatedSuccess'));
    } catch (err) {
      console.error('Error updating order items:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order items');
    } finally {
      setUpdatingOrderItems(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    console.log('Attempting to delete order:', orderId);

    if (!confirm(translate('merchant.confirmDeleteOrder'))) return;

    try {
      const response = await fetch(`/api/merchant/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include' // Include cookies for session
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to delete orders');
        }
        let errorMessage = 'Failed to delete order';
        try {
          const responseText = await response.text();
          console.log('Error response text:', responseText);
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Failed to parse error response as JSON:', parseError);
          // If response isn't JSON, use status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Remove order from local state
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      await fetchStats(); // <-- refresh stats after deleting order
      alert(translate('merchant.orderDeletedSuccess'));
    } catch (err) {
      console.error('Error deleting order:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    }
  };

  // --- Customers: handlers ---
  const openCustomerModal = async (customerId: string) => {
    try {
      setSelectedCustomerId(customerId);
      setShowCustomerModal(true);
      // Detail
      const detailRes = await fetch(`/api/merchant/customers/${customerId}`, { credentials: 'include' });
      if (!detailRes.ok) throw new Error('Failed to load customer');
      const detail = await detailRes.json();
      setCustomerDetail(detail);
      setCustomerNotes(detail?.notes || '');
      setCustomerTags((detail?.tags || []).join(', '));
      // Orders
      const ordersRes = await fetch(`/api/merchant/customers/${customerId}/orders`, { credentials: 'include' });
      const ordersJson = ordersRes.ok ? await ordersRes.json() : [];
      setCustomerOrders(ordersJson);
    } catch (e) {
      console.error(e);
      alert(translate('merchant.failedToLoadCustomer'));
    }
  };

  const closeCustomerModal = () => {
    setShowCustomerModal(false);
    setSelectedCustomerId(null);
    setCustomerDetail(null);
    setCustomerOrders([]);
    setCustomerNotes('');
    setCustomerTags('');
  };

  const saveCustomerDetail = async () => {
    if (!selectedCustomerId) return;
    try {
      setCustomerSaving(true);
      const tagsArray = customerTags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      const res = await fetch(`/api/merchant/customers/${selectedCustomerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: tagsArray, notes: customerNotes }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to save customer');
      // Refresh list
      const list = await fetch('/api/merchant/customers', { credentials: 'include' }).then(r => r.json());
      setCustomers(list);
      alert(translate('merchant.saved'));
    } catch (e) {
      console.error(e);
      alert(translate('merchant.failedToSave'));
    } finally {
      setCustomerSaving(false);
    }
  };

  const removeCustomerLink = async (customerId?: string | null) => {
    const targetCustomerId = customerId || selectedCustomerId;
    if (!targetCustomerId) {
      console.log('No customer ID provided');
      return;
    }
    console.log('About to delete customer:', targetCustomerId);
    if (!confirm(translate('merchant.confirmRemoveCustomer'))) {
      console.log('User cancelled deletion');
      return;
    }
    try {
      console.log('Sending DELETE request for customer:', targetCustomerId);
      const res = await fetch(`/api/merchant/customers/${targetCustomerId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('DELETE request completed with status:', res.status);
      const responseText = await res.text();
      console.log('DELETE response body:', responseText);

      if (!res.ok) {
        const errorData = JSON.parse(responseText);
        throw new Error(`HTTP ${res.status}: ${errorData.error || 'Unknown error'}`);
      }

      const responseData = JSON.parse(responseText);
      console.log('DELETE successful:', responseData);

      // Force a hard refresh of the customers list
      console.log('Forcing page refresh to ensure customers list updates...');
      window.location.reload();

    } catch (e) {
      console.error('Delete error:', e);
      alert(translate('merchant.failedToRemove') + ': ' + (e instanceof Error ? e.message : translate('merchant.unknown')));
    }
  };

  

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
          credentials: 'include', // Include cookies for session
          cache: 'no-store'
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

  // Fetch customers from API
  useEffect(() => {
    if (activeTab !== 'customers') return;
    const fetchCustomers = async () => {
      try {
        setCustomersLoading(true);
        setCustomersError(null);
        if (!user) {
          setCustomersError('Please log in to access merchant dashboard');
          return;
        }
        const response = await fetch('/api/merchant/customers', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (!response.ok) {
          if (response.status === 401) throw new Error('Please log in to view customers');
          throw new Error(`Failed to fetch customers: ${response.statusText}`);
        }
        const data = await response.json();
        setCustomers(data);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setCustomersError(err instanceof Error ? err.message : 'Failed to load customers');
      } finally {
        setCustomersLoading(false);
      }
    };
    fetchCustomers();
  }, [user, activeTab]);

  // Fetch analytics on tab switch to analytics
  useEffect(() => {
    if (activeTab !== 'analytics') return;
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        setAnalyticsError(null);
        if (!user) {
          setAnalyticsError('Please log in to access merchant dashboard');
          return;
        }
        const response = await fetch('/api/merchant/analytics', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (!response.ok) {
          if (response.status === 401) throw new Error('Please log in to view analytics');
          throw new Error(`Failed to fetch analytics: ${response.statusText}`);
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setAnalyticsError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, [user, activeTab]);

  // Fetch payouts on tab switch to payouts
  useEffect(() => {
    if (activeTab !== 'payouts') return;
    const fetchPayouts = async () => {
      try {
        setPayoutsLoading(true);
        setPayoutsError(null);
        if (!user) {
          setPayoutsError('Please log in to access merchant dashboard');
          return;
        }
        const response = await fetch('/api/merchant/payouts', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (!response.ok) {
          if (response.status === 401) throw new Error('Please log in to view payouts');
          throw new Error(`Failed to fetch payouts: ${response.statusText}`);
        }
        const data = await response.json();
        setPayouts(data);
      } catch (err) {
        console.error('Error fetching payouts:', err);
        setPayoutsError(err instanceof Error ? err.message : 'Failed to load payouts');
      } finally {
        setPayoutsLoading(false);
      }
    };
    fetchPayouts();
  }, [user, activeTab]);

  const requestPayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(payoutAmount);
    const available = payouts?.balance?.available || 0;

    if (amount > available) {
      alert('Requested amount exceeds available balance');
      return;
    }

    setPayoutRequestLoading(true);
    try {
      const response = await fetch('/api/merchant/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to request payout' }));
        throw new Error(error.error || 'Failed to request payout');
      }

      const result = await response.json();
      alert('Payout request submitted successfully!');
      setPayoutAmount('');
      setShowPayoutRequest(false);
      // Refresh payouts data
      fetchPayouts();
    } catch (error) {
      console.error('Payout request error:', error);
      alert(error instanceof Error ? error.message : 'Failed to request payout');
    } finally {
      setPayoutRequestLoading(false);
    }
  };

  // Shared fetch orders function so we can reuse in buttons and effects
  const fetchOrdersData = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      if (!user) {
        setOrdersError('Please log in to access merchant dashboard');
        return;
      }
      const response = await fetch('/api/merchant/orders', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error('Please log in to view orders');
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrdersError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch orders on tab switch to orders or overview (for recent orders)
  useEffect(() => {
    if (activeTab !== 'orders' && activeTab !== 'overview') return;
    fetchOrdersData();
  }, [user, activeTab]);

  // Handle submit for approval
  const handleSubmitForApproval = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'PENDING' })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to submit products for approval');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit product for approval');
      }

      // Refresh products list
      const refreshed = await fetch('/api/merchant/products', {
        credentials: 'include',
        cache: 'no-store'
      });
      const items = await refreshed.json();
      setProducts(items);
      alert(translate('merchant.productSubmittedForApproval'));
    } catch (err: any) {
      setError(err?.message || 'Failed to submit product for approval');
      alert(err?.message || 'Failed to submit product for approval');
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm(translate('merchant.confirmDeleteProduct'))) return;

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

      // Refresh list from server to avoid stale state
      const refreshed = await fetch('/api/merchant/products', {
        credentials: 'include',
        cache: 'no-store'
      });
      const items = await refreshed.json();
      setProducts(items);

      await fetchStats(); // Refresh stats after deletion
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
      // Set image preview for existing image
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
    // Clear image upload state
  };

  const handleProductImageUpload = (url: string) => {
    setNewProduct(prev => ({ ...prev, imageUrl: url }));
  };
  const handleEditImageUpload = (url: string) => {
    setEditingProduct(prev => ({ ...prev, imageUrl: url }));
  };

  const handleCategoryImageUpload = (url: string) => {
    setNewCategory(prev => ({ ...prev, imageUrl: url }));
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
    // Clear edit image upload state
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
    if (isProductImageUploading) {
      alert(translate('merchant.waitForImageUploadProduct'));
      return;
    }
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
        credentials: 'include',
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
        credentials: 'include',
        cache: 'no-store'
      });
      const items = await refreshed.json();
      setProducts(items);
      await fetchStats(); // <--- ADD THIS LINE to update stats after product creation
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
    { id: 'analytics', label: translate('merchant.businessAnalytics'), icon: TrendingUp },
    { id: 'payouts', label: translate('merchant.payouts') || 'Payouts', icon: CreditCard }
  ];

  return (
    <ProtectedRoute requiredRole="merchant">
      <div className="min-h-screen bg-gray-50">
        {/* Header - Responsive design */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{translate('merchant.dashboard')}</h1>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">{translate('merchant.manageProducts')}</p>
                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-1 sm:mt-2 text-xs text-gray-500">
                    {translate('merchant.authStatus')}: {user ? `${translate('merchant.loggedInAs')} ${user.role}` : translate('merchant.notAuthenticated')} |
                    {translate('merchant.userId')}: {user?.id || translate('merchant.nA')}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button onClick={openAddModal} className="btn-primary flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{translate('merchant.addProduct')}</span>
                  <span className="sm:hidden">{translate('merchant.add')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Merchant Status Notices */}
        {merchantStatus === 'PENDING' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Store Under Review
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Your merchant application is being reviewed by our team. You'll receive an email notification once your store is approved and goes live.
                      This usually takes 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {merchantStatus === 'ACTIVE' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Welcome to Feinraum!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Your store is now live and ready to accept orders. Start by adding your first products to attract customers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Stats Grid - Responsive design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {stats.map((stat, index) => {
              // Determine if the value is a currency amount (for proper formatting)
              const isCurrency = stat.label.includes('Sales') || stat.label.includes('totalSales');
              const displayValue = isCurrency && !isNaN(Number(stat.value.replace(/[^0-9.-]+/g, '')))
                ? new Intl.NumberFormat('de-CH', {
                    style: 'currency',
                    currency: 'CHF',
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
                            ...
                          </span>
                        ) : error ? (
                          <span className="text-red-600">{translate('merchant.error')}</span>
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Sidebar Navigation - Responsive design */}
            <div className="lg:col-span-1">
              <nav className="merchant-sidebar space-y-1 sm:space-y-2 bg-white/95 border border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm text-gray-700">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-left rounded-lg transition-colors focus:outline-none text-sm sm:text-base text-gray-700 ${
                      activeTab === tab.id
                        ? 'profile-sidebar-active'
                        : 'profile-sidebar-inactive'
                    }`}
                    style={activeTab === tab.id ? {
                      backgroundColor: 'var(--color-primary-100)',
                      color: 'var(--color-primary-800)',
                      borderRight: '2px solid var(--color-primary-600)',
                      fontWeight: '600'
                    } : {}}
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
                  {/* Recent Orders */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">{translate('merchant.recentOrders')}</h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {ordersLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-turquoise-600 mr-2" />
                            <span className="text-gray-600">{translate('merchant.loading')}</span>
                          </div>
                        ) : ordersError ? (
                          <div className="text-center py-8">
                            <p className="text-red-600 mb-4">{ordersError}</p>
                            <button
                              onClick={() => fetchOrdersData()}
                              className="btn-primary"
                            >
                              {translate('tryAgain')}
                            </button>
                          </div>
                        ) : orders.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-600">{translate('ordersPage.noOrdersYet')}</p>
                          </div>
                        ) : (
                          orders.slice(0, 4).map((order: any) => (
                            <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                              <div>
                                <h3 className="font-semibold text-gray-900">#{order.id.slice(-8)}</h3>
                                <p className="text-sm text-gray-600">{translate('merchant.customerId')}: {order.customerId}</p>
                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">{formatCurrency(order.grandTotal)}</p>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  getMerchantOrderStatusColor(order.status)
                                }`}>
                                  {getMerchantOrderStatus(order.status)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
      
      {/* Order Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900">{translate('merchant.order')} #{selectedOrder.id?.slice(-8)}</h3>
              <button onClick={closeOrderModal} className="text-gray-500 hover:text-gray-700 focus:outline-none">✕</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('merchant.orderStatus')}</label>
                  <select value={orderStatusDraft} onChange={e=>setOrderStatusDraft(e.target.value)} className="input-field h-11">
                    <option value="PENDING">{translate('status.pending')}</option>
                    <option value="PROCESSING">{translate('status.processing')}</option>
                    <option value="SHIPPED">{translate('status.shipped')}</option>
                    <option value="DELIVERED">{translate('status.delivered')}</option>
                    <option value="CANCELLED">{translate('status.cancelled')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('merchant.orderTotal')}</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{formatCurrency(selectedOrder.grandTotal ?? selectedOrder.totalAmount)}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{translate('merchant.orderItemsTitle')}</label>
                <div className="mt-2 border rounded">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.product')}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.quantityShort')}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.price')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(selectedOrder.items || []).map((it:any) => (
                        <tr key={it.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{it.product?.title_en || it.product?.name || it.nameSnapshot || translate('merchant.items')}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{it.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(it.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button onClick={() => {
                setEditingOrder(selectedOrder);
                setEditingOrderItems(selectedOrder.items || []);
                setShowEditOrderModal(true);
                setShowOrderModal(false);
              }} className="btn-secondary">
                {translate('merchant.editItems')}
              </button>
              <button onClick={closeOrderModal} className="btn-secondary">{translate('merchant.close')}</button>
              <button onClick={saveOrderStatus} disabled={updatingOrderStatus} className="btn-primary focus:outline-none">
                {updatingOrderStatus ? translate('merchant.saving') : translate('merchant.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Items Modal */}
      {showEditOrderModal && editingOrder && (
        <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900">Edit Order Items - #{editingOrder.id?.slice(-8)}</h3>
              <button onClick={() => {
                setShowEditOrderModal(false);
                setEditingOrder(null);
                setEditingOrderItems([]);
                setShowOrderModal(true);
              }} className="text-gray-500 hover:text-gray-700 focus:outline-none">✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                {editingOrderItems.map((item: any, index: number) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Product</label>
                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {item.product?.title_en || item.nameSnapshot || 'Item'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">{translate('merchant.quantityShort')}</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...editingOrderItems];
                            newItems[index] = { ...item, quantity: parseInt(e.target.value) || 1 };
                            setEditingOrderItems(newItems);
                          }}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-turquoise-500 focus:border-turquoise-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">{translate('merchant.price')}</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => {
                            const newItems = [...editingOrderItems];
                            newItems[index] = { ...item, price: parseFloat(e.target.value) || 0 };
                            setEditingOrderItems(newItems);
                          }}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-turquoise-500 focus:border-turquoise-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">{translate('merchant.viewProductImage')}</label>
                        <div className="mt-1">
                          {item.product?.imageUrl && (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product?.title_en}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <input
                            type="url"
                            value={item.imageUrl || ''}
                            onChange={(e) => {
                              const newItems = [...editingOrderItems];
                              newItems[index] = { ...item, imageUrl: e.target.value };
                              setEditingOrderItems(newItems);
                            }}
                            placeholder={translate('merchant.imageUrl')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-turquoise-500 focus:border-turquoise-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button onClick={() => {
                setShowEditOrderModal(false);
                setEditingOrder(null);
                setEditingOrderItems([]);
                setShowOrderModal(true);
              }} className="btn-secondary">
                {translate('merchant.cancel')}
              </button>
              <button onClick={saveOrderItems} disabled={updatingOrderItems} className="btn-primary focus:outline-none">
                {updatingOrderItems ? translate('merchant.saving') : translate('merchant.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && customerDetail && (
        <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900">{translate('merchant.customer')} {customerDetail.name || customerDetail.email}</h3>
              <button onClick={closeCustomerModal} className="text-gray-500 hover:text-gray-700 focus:outline-none">✕</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('merchant.email')}</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{customerDetail.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('merchant.phone')}</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{customerDetail.profile?.phone || '—'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{translate('merchant.tags')} ({translate('merchant.commaSeparated')})</label>
                <input value={customerTags} onChange={e=>setCustomerTags(e.target.value)} className="input-field h-11" placeholder="vip, newsletter" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{translate('merchant.notes')}</label>
                <textarea rows={4} value={customerNotes} onChange={e=>setCustomerNotes(e.target.value)} className="input-field min-h-28" placeholder={translate('merchant.internalNotes')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{translate('merchant.recentOrders')}</label>
                <div className="mt-2 border rounded">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.order')}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.date')}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.orderTotal')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customerOrders.map((o:any) => (
                        <tr key={o.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">#{o.id.slice(-8)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(o.total)}</td>
                        </tr>
                      ))}
                      {customerOrders.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">{translate('merchant.noOrders')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3">
              <button onClick={() => removeCustomerLink(selectedCustomerId)} className="text-red-600 hover:text-red-800 focus:outline-none">{translate('merchant.removeCustomer')}</button>
              <div className="flex items-center gap-2">
                <button onClick={closeCustomerModal} className="btn-secondary">{translate('merchant.close')}</button>
                <button onClick={saveCustomerDetail} disabled={customerSaving} className="btn-primary focus:outline-none">{customerSaving ? translate('merchant.saving') : translate('merchant.save')}</button>
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
                        <div>
                          <input
                             type="text"
                             placeholder={translate('merchant.searchOrders')}
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
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
                          {ordersLoading ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 text-center">
                                <Loader2 className="w-6 h-6 animate-spin text-turquoise-600 mx-auto" />
                                <span className="text-gray-600 ml-2">{translate('merchant.loadingOrders')}</span>
                              </td>
                            </tr>
                          ) : ordersError ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 text-center">
                                <p className="text-red-600 mb-4">{ordersError}</p>
                                <button
                                  onClick={() => fetchOrdersData()}
                                  className="btn-primary"
                                >
                                  {translate('merchant.tryAgain')}
                                </button>
                              </td>
                            </tr>
                          ) : orders.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 text-center">
                                <p className="text-gray-600">{translate('merchant.noOrdersYet')}</p>
                              </td>
                            </tr>
                          ) : (
                            orders.map((order: any) => (
                              <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  #{order.id.slice(-8)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  Customer ID: {order.customerId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatCurrency(order.grandTotal)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    getMerchantOrderStatusColor(order.status)
                                  }`}>
                                    {getMerchantOrderStatus(order.status)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button onClick={() => openOrderModal(order)} className="text-turquoise-600 hover:text-turquoise-900 mr-3">
                                    {translate('merchant.view')}
                                  </button>
                                  <button onClick={() => openOrderModal(order)} className="text-primary-600 hover:text-primary-900 mr-3">
                                    {translate('merchant.update')}
                                  </button>
                                  <button onClick={() => deleteOrder(order.id)} className="text-red-600 hover:text-red-900">
                                    {translate('merchant.delete')}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
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
                            <h3 className="text-sm font-medium text-red-800">{translate('merchant.accessError')}</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{error}</p>
                              {!user && (
                                <p className="mt-1">
                                  {translate('merchant.pleaseLogIn')} <a href="/login" className="underline hover:no-underline">{translate('merchant.logInAsMerchant')}</a>
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
                            {products.map((product: any) => (
                              <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{product.title_en}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.price)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-col gap-1">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {product.stock > 0 ? translate('merchant.inStock') : translate('merchant.outOfStock')}
                                    </span>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      product.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-800' :
                                      product.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {product.status === 'PUBLISHED' ? translate('merchant.statusPublished') :
                                       product.status === 'PENDING' ? translate('merchant.statusPending') :
                                       translate('merchant.statusDraft')}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex flex-col gap-1">
                                    <div>
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
                                    </div>
                                    {(product.status === 'DRAFT' || product.status === 'PENDING') && (
                                      <button
                                        onClick={() => handleSubmitForApproval(product.id)}
                                        className="text-sm text-blue-600 hover:text-blue-900 font-medium"
                                      >
                                        {translate('merchant.submitForApproval')}
                                      </button>
                                    )}
                                  </div>
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
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <h2 className="text-xl font-semibold text-gray-900">{translate('merchant.customerManagement')}</h2>
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder={translate('merchant.searchCustomers')}
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
                    {customersLoading && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-turquoise-600 mr-2" />
                        <span className="text-gray-600">{translate('merchant.loading')}</span>
                      </div>
                    )}

                    {customersError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{translate('merchant.error')}</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{customersError}</p>
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

                    {!customersLoading && !customersError && customers.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{translate('merchant.noCustomers')}</h3>
                        <p className="text-gray-600">{translate('merchant.noCustomersDesc')}</p>
                      </div>
                    )}

                    {!customersLoading && !customersError && customers.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.customer')}</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.email')}</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.phone')}</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.totalOrders')}</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.totalSpent')}</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.lastOrder')}</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.status')}</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translate('merchant.actions')}</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {customers.map((customer) => (
                              <tr key={customer.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-700">
                                          {customer.firstName?.charAt(0) || customer.email?.charAt(0) || 'U'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {customer.firstName && customer.lastName
                                          ? `${customer.firstName} ${customer.lastName}`
                                          : customer.email?.split('@')[0] || translate('merchant.unknownCustomer')
                                        }
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {translate('merchant.customerId')}: {customer.id}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {customer.email || translate('merchant.nA')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {customer.phone || translate('merchant.nA')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {customer.totalOrders || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatCurrency(customer.totalSpent)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : translate('merchant.never')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    customer.status === 'active' ? 'bg-green-100 text-green-800' :
                                    customer.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {customer.status || translate('merchant.unknown')}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button onClick={() => openCustomerModal(customer.id)} className="text-turquoise-600 hover:text-turquoise-900 mr-3">
                                    {translate('merchant.view')}
                                  </button>
                                  <button onClick={() => openCustomerModal(customer.id)} className="text-primary-600 hover:text-primary-900 mr-3">
                                    {translate('merchant.edit')}
                                  </button>
                                  <button onClick={() => removeCustomerLink(customer.id)} className="text-red-600 hover:text-red-900">
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

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* Analytics Header */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">{translate('merchant.businessAnalytics')}</h2>
                      <p className="text-sm text-gray-600 mt-1">{translate('merchant.comprehensiveInsights')}</p>
                    </div>
                  </div>

                  {/* Loading State */}
                  {analyticsLoading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-turquoise-600 mr-2" />
                        <span className="text-gray-600">Loading analytics...</span>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {analyticsError && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error Loading Analytics</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{analyticsError}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analytics Content */}
                  {!analyticsLoading && !analyticsError && analytics && (
                    <div className="space-y-6">
                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Revenue Metrics */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                              <p className="text-2xl font-semibold text-gray-900">
                                {formatCurrency(analytics.revenue?.total ?? 0)}
                              </p>
                              <p className="text-sm text-gray-600">
                                This month: {formatCurrency(analytics.revenue?.monthly ?? 0)}
                              </p>
                            </div>
                            <div className="p-3 rounded-full bg-green-100">
                              <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                          {analytics.revenue?.monthlyGrowth !== undefined && (
                            <div className="mt-2">
                              <span className={`text-sm font-medium ${
                                analytics.revenue.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {analytics.revenue.monthlyGrowth >= 0 ? '+' : ''}{analytics.revenue.monthlyGrowth.toFixed(1)}% vs last month
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Orders Metrics */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Total Orders</p>
                              <p className="text-2xl font-semibold text-gray-900">
                                {analytics.orders?.total || 0}
                              </p>
                              <p className="text-sm text-gray-600">
                                This month: {analytics.orders?.monthly || 0}
                              </p>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100">
                              <ShoppingBag className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          {analytics.orders?.growth !== undefined && (
                            <div className="mt-2">
                              <span className={`text-sm font-medium ${
                                analytics.orders.growth >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {analytics.orders.growth >= 0 ? '+' : ''}{analytics.orders.growth.toFixed(1)}% vs last month
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Customers Metrics */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Total Customers</p>
                              <p className="text-2xl font-semibold text-gray-900">
                                {analytics.customers?.total || 0}
                              </p>
                              <p className="text-sm text-gray-600">
                                Active: {analytics.customers?.active || 0}
                              </p>
                            </div>
                            <div className="p-3 rounded-full bg-purple-100">
                              <Users className="w-6 h-6 text-purple-600" />
                            </div>
                          </div>
                          {analytics.customers?.growth !== undefined && (
                            <div className="mt-2">
                              <span className={`text-sm font-medium ${
                                analytics.customers.growth >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {analytics.customers.growth >= 0 ? '+' : ''}{analytics.customers.growth.toFixed(1)}% vs last month
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Products Metrics */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Products</p>
                              <p className="text-2xl font-semibold text-gray-900">
                                {analytics.products?.total || 0}
                              </p>
                              <p className="text-sm text-gray-600">
                                Low stock: {analytics.products?.lowStock || 0}
                              </p>
                            </div>
                            <div className="p-3 rounded-full bg-orange-100">
                              <Package className="w-6 h-6 text-orange-600" />
                            </div>
                          </div>
                          {analytics.products?.outOfStock > 0 && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-red-600">
                                {analytics.products.outOfStock} out of stock
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Detailed Analytics Sections */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Customers */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                          <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
                          </div>
                          <div className="p-6">
                            {analytics.customers?.topCustomers?.length > 0 ? (
                              <div className="space-y-4">
                                {analytics.customers.topCustomers.map((customer: any, index: number) => (
                                  <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-turquoise-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-turquoise-700">
                                          {index + 1}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{customer.name || 'Unknown'}</p>
                                        <p className="text-sm text-gray-500">{customer.email}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                                      <p className="text-sm text-gray-500">{customer.totalOrders} orders</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-4">No customer data available</p>
                            )}
                          </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                          <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
                          </div>
                          <div className="p-6">
                            {analytics.products?.topProducts?.length > 0 ? (
                              <div className="space-y-4">
                                {analytics.products.topProducts.map((product: any, index: number) => (
                                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-turquoise-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-turquoise-700">
                                          {index + 1}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{product.title}</p>
                                        <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-gray-900">{product.totalSold || 0} sold</p>
                                      <p className="text-sm text-gray-500">{formatCurrency(product.revenue)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-4">No product data available</p>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Empty State */}
                  {!analyticsLoading && !analyticsError && !analytics && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="text-center py-12">
                        <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
                        <p className="text-gray-600">Start making sales to see your business analytics</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payouts Tab */}
              {activeTab === 'payouts' && (
                <div className="space-y-6">
                  {/* Payouts Header */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">{translate('merchant.payouts') || 'Payouts'}</h2>
                      <p className="text-sm text-gray-600 mt-1">Manage your earnings and payout history</p>
                    </div>
                  </div>

                  {/* Loading State */}
                  {payoutsLoading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-turquoise-600 mr-2" />
                        <span className="text-gray-600">Loading payouts...</span>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {payoutsError && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error Loading Payouts</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{payoutsError}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payouts Content */}
                  {!payoutsLoading && !payoutsError && payouts && (
                    <div className="space-y-6">
                      {/* Balance Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Available Balance</p>
                              <p className="text-2xl font-semibold text-green-600">
                                {formatCurrency(payouts.balance?.available || 0)}
                              </p>
                            </div>
                            <div className="p-3 rounded-full bg-green-100">
                              <CreditCard className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Pending Balance</p>
                              <p className="text-2xl font-semibold text-yellow-600">
                                {formatCurrency(payouts.balance?.pending || 0)}
                              </p>
                            </div>
                            <div className="p-3 rounded-full bg-yellow-100">
                              <TrendingUp className="w-6 h-6 text-yellow-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                              <p className="text-2xl font-semibold text-blue-600">
                                {formatCurrency(payouts.summary?.totalEarnings || 0)}
                              </p>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100">
                              <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payout Request */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Request Payout</h3>
                            <p className="text-sm text-gray-600">Withdraw your available earnings</p>
                          </div>
                          <button
                            onClick={() => setShowPayoutRequest(!showPayoutRequest)}
                            disabled={(payouts?.balance?.available || 0) <= 0}
                            className="px-4 py-2 font-semibold bg-turquoise-600 text-white text-base rounded-lg hover:bg-turquoise-700 focus:outline-none focus:ring-2 focus:ring-turquoise-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mb-2 w-full max-w-xs mx-auto shadow"
                          >
                            <CreditCard className="w-5 h-5 mr-2" />
                            <span>Request Payout</span>
                          </button>
                        </div>

                        {showPayoutRequest && (
                          <div className="border-t pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Amount (Max: {formatCurrency(payouts?.balance?.available || 0)})
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  max={payouts?.balance?.available || 0}
                                  value={payoutAmount}
                                  onChange={(e) => setPayoutAmount(e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 text-base shadow"
                                  placeholder="Enter amount"
                                />
                              </div>
                              <div className="flex items-end gap-2">
                                <button
                                  onClick={requestPayout}
                                  disabled={payoutRequestLoading || !payoutAmount}
                                  className="w-full px-4 py-2 font-semibold bg-green-600 text-white text-base rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                  {payoutRequestLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                                  <span>Submit Request</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setShowPayoutRequest(false);
                                    setPayoutAmount('');
                                  }}
                                  className="w-full px-4 py-2 font-semibold bg-gray-300 text-gray-700 text-base rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 text-xs text-gray-500">
                              Payout requests are processed within 3-5 business days. You'll receive an email confirmation once processed.
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Transaction History */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                        </div>
                        <div className="p-6">
                          {payouts.transactions?.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Method
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {payouts.transactions.map((transaction: any, index: number) => (
                                    <tr key={transaction.id || index}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(transaction.createdAt).toLocaleDateString()}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(transaction.amount)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                          transaction.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                          transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {transaction.status}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {transaction.method || 'PLATFORM'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Yet</h3>
                              <p className="text-gray-600">Your payout transactions will appear here once you start earning</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!payoutsLoading && !payoutsError && !payouts && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="text-center py-12">
                        <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Payout Data</h3>
                        <p className="text-gray-600">Start making sales to see your payout information</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900">{translate('merchant.viewProduct')}</h3>
              <button onClick={closeViewModal} className="text-gray-500 hover:text-gray-700 focus:outline-none">✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('merchant.viewProductTitleEn')}</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedProduct.title_en}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('merchant.viewProductTitleDe')}</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedProduct.title_de || translate('merchant.nA')}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('admin.slug')}</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedProduct.slug}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('merchant.price')}</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{formatCurrency(selectedProduct.price)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('merchant.stock')}</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedProduct.stock}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('admin.category')}</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('merchant.status')}</label>
                    <p className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedProduct.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedProduct.stock > 0 ? translate('merchant.inStock') : translate('merchant.outOfStock')}
                      </span>
                    </p>
                  </div>
                </div>

                {selectedProduct.imageUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('merchant.viewProductImage')}</label>
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
                  <label className="block text-sm font-medium text-gray-700">{translate('admin.englishDescription')}</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded whitespace-pre-wrap">{selectedProduct.desc_en || translate('merchant.noDescription')}</p>
                </div>

                {selectedProduct.desc_de && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('admin.germanDescription')}</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded whitespace-pre-wrap">{selectedProduct.desc_de}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('merchant.createdAt')}</label>
                    <p>{new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{translate('merchant.updatedAt')}</label>
                    <p>{new Date(selectedProduct.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button onClick={closeViewModal} className="btn-secondary">{translate('merchant.close')}</button>
              <button
                onClick={() => {
                  closeViewModal();
                  handleEditProduct(selectedProduct.id);
                }}
                className="btn-primary focus:outline-none"
              >
                {translate('merchant.edit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900">{translate('merchant.editProduct')}</h3>
              <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700 focus:outline-none">✕</button>
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
                    placeholder={translate('merchant.exampleWirelessHeadphones')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('Title (DE)')}</label>
                  <input
                    value={editingProduct.title_de}
                    onChange={e => setEditingProduct(p => ({ ...p, title_de: e.target.value }))}
                    className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors"
                    placeholder={translate('merchant.optional')}
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
                  <p className="mt-1 text-xs text-gray-500">{translate('merchant.slugDescription')}</p>
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
                    placeholder={translate('merchant.examplePrice')}
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
                    placeholder={translate('merchant.exampleStock')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('Category')}</label>
                  <div className="flex gap-2">
                    <select
                      value={editingProduct.category}
                      onChange={e => setEditingProduct(p => ({ ...p, category: e.target.value }))}
                      className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors cursor-pointer flex-1"
                    >
                      <option value="General">General</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryModal(true)}
                      className="btn-primary text-sm"
                      title="Add new category"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  <ImageUpload
                    onImageUpload={handleEditImageUpload}
                    currentImageUrl={editingProduct.imageUrl}
                    className="mb-2"
                  />
                  
                  {/* Alternative: Manual URL Input */}
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Or enter image URL manually:</label>
                    <input
                      value={editingProduct.imageUrl}
                      onChange={e => setEditingProduct(p => ({ ...p, imageUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder={translate('merchant.exampleImageUrl')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{translate('Description (EN)')}</label>
                <textarea
                  rows={4}
                  value={editingProduct.desc_en}
                  onChange={e => setEditingProduct(p => ({ ...p, desc_en: e.target.value }))}
                  className="input-field min-h-28 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors"
                  placeholder={translate('merchant.shortDescriptionEn')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{translate('Description (DE)')}</label>
                <textarea
                  rows={4}
                  value={editingProduct.desc_de}
                  onChange={e => setEditingProduct(p => ({ ...p, desc_de: e.target.value }))}
                  className="input-field min-h-28 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors"
                  placeholder={translate('merchant.shortDescriptionDe')}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeEditModal} className="btn-secondary">{translate('merchant.cancel')}</button>
                <button type="submit" disabled={updating} className="btn-primary focus:outline-none">
                  {updating ? translate('merchant.loading') : translate('merchant.updateProduct')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg max-h-[85vh] flex flex-col relative">
            {isProductImageUploading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <Loader2 className="w-10 h-10 text-turquoise-600 animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-700 text-center px-6">
                  Uploading image… please wait while we generate the link.
                </p>
              </div>
            )}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900">{translate('merchant.addProduct')}</h3>
              <button onClick={closeAddModal} className="text-gray-500 hover:text-gray-700 focus:outline-none">✕</button>
            </div>
            <form onSubmit={createProduct} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('merchant.viewProductTitleEn')}</label>
                  <input value={newProduct.title_en} onChange={e=>setNewProduct(p=>({...p, title_en: e.target.value}))} className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors" required placeholder={translate('merchant.exampleWirelessHeadphones')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('merchant.viewProductTitleDe')}</label>
                  <input value={newProduct.title_de} onChange={e=>setNewProduct(p=>({...p, title_de: e.target.value}))} className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors" placeholder={translate('merchant.optional')} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">{translate('admin.slug')}</label>
                  <input
                    value={newProduct.slug}
                    onChange={e=>setNewProduct(p=>({...p, slug: e.target.value.toLowerCase()}))}
                    className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors"
                    placeholder={toSlug(newProduct.title_en || 'my-product')}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">{translate('merchant.slugDescription')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('merchant.price')}</label>
                  <input type="number" min="0" step="0.01" value={newProduct.price} onChange={e=>setNewProduct(p=>({...p, price: e.target.value}))} className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors" required placeholder={translate('merchant.examplePrice')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('merchant.stock')}</label>
                  <input type="number" min="0" step="1" value={newProduct.stock} onChange={e=>setNewProduct(p=>({...p, stock: e.target.value}))} className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors" required placeholder={translate('merchant.exampleStock')} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translate('admin.category')}</label>
                  <div className="flex gap-2">
                    <select
                      value={newProduct.category}
                      onChange={e=>setNewProduct(p=>({...p, category: e.target.value}))}
                      className="input-field h-11 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors cursor-pointer flex-1"
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
                      className="btn-primary text-sm"
                      title={translate('admin.addNewCategory')}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.productImage')}</label>
                  <ImageUpload
                    onImageUpload={handleProductImageUpload}
                    onUploadStart={() => setIsProductImageUploading(true)}
                    onUploadEnd={() => setIsProductImageUploading(false)}
                    currentImageUrl={newProduct.imageUrl}
                    className="mb-2"
                  />
                  
                  {/* Alternative: Manual URL Input */}
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">{translate('admin.enterImageURLManually')}:</label>
                    <input
                      value={newProduct.imageUrl}
                      onChange={e => setNewProduct(p => ({ ...p, imageUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder={translate('merchant.exampleImageUrl')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">{translate('admin.englishDescription')}</label>
                <textarea rows={4} value={newProduct.desc_en} onChange={e=>setNewProduct(p=>({...p, desc_en: e.target.value}))} className="input-field min-h-28 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors" placeholder={translate('merchant.shortDescriptionEn')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{translate('admin.germanDescription')}</label>
                <textarea rows={4} value={newProduct.desc_de} onChange={e=>setNewProduct(p=>({...p, desc_de: e.target.value}))} className="input-field min-h-28 outline-none focus:outline-none hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors" placeholder={translate('merchant.shortDescriptionDe')} />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeAddModal} className="btn-secondary">{translate('merchant.cancel')}</button>
                <button type="submit" disabled={creating || isProductImageUploading} className="btn-primary focus:outline-none">
                  {creating
                    ? translate('merchant.creating')
                    : isProductImageUploading
                      ? translate('admin.waitingForImageUpload')
                      : translate('merchant.addProduct')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative">
            {isCategoryImageUploading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
                <Loader2 className="w-8 h-8 text-turquoise-600 animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-700 text-center px-4">
                  Uploading image… please wait while we generate the link.
                </p>
              </div>
            )}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Category</h3>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createCategory(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                  placeholder={translate('admin.categoryName')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.description')}</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                  placeholder={translate('admin.description')}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{translate('admin.categoryImage')}</label>
                <ImageUpload
                  onImageUpload={handleCategoryImageUpload}
                  onUploadStart={() => setIsCategoryImageUploading(true)}
                  onUploadEnd={() => setIsCategoryImageUploading(false)}
                  currentImageUrl={newCategory.imageUrl}
                  className="mb-2"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryModal(false);
                    setNewCategory({ 
                      name: '', 
                      description: '',
                      imageUrl: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {translate('merchant.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creatingCategory || isCategoryImageUploading}
                  className="btn-primary disabled:opacity-50 focus:outline-none"
                >
                  {creatingCategory
                    ? translate('merchant.creating')
                    : isCategoryImageUploading
                      ? translate('admin.waitingForImageUpload')
                      : translate('admin.createCategory')}
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