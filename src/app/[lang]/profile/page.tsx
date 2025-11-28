'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useTranslation } from '../../../i18n/TranslationProvider';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Shield,
  CreditCard,
  Store,
  Package
} from 'lucide-react';

function ProfileContent() {
  const { user } = useAuth();
  const { translate } = useTranslation();
  const pathname = usePathname();
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const currentLang = pathSegments[0] || 'de';
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Debug active tab state
  console.log('Current active tab:', activeTab);
  
  // Security state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('twoFactorEnabled');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [sessions, setSessions] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sessions');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return [
      { id: 1, device: 'Chrome on Windows', location: 'San Francisco, CA', current: true, lastActive: 'Now' },
      { id: 2, device: 'iOS App', location: 'San Francisco, CA', current: false, lastActive: '2 hours ago' }
    ];
  });
  
  // Payment state
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('paymentMethods');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return [
      { id: 1, type: 'visa', last4: '4242', expiry: '12/25', default: true, cardholderName: 'John Doe' },
      { id: 2, type: 'mastercard', last4: '5555', expiry: '08/26', default: false, cardholderName: 'John Doe' },
      { id: 3, type: 'paypal', email: 'john.doe@example.com', default: false }
    ];
  });
  const [billingAddress, setBillingAddress] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('billingAddress');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      name: 'John Doe',
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'United States'
    };
  });
  const [newPaymentForm, setNewPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    type: 'visa'
  });

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '+1 (555) 123-4567',
    address: {
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'United States'
    },
    role: user?.role || 'customer'
  });

  const [tempData, setTempData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '', // should default to '' if not present
    address: {
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'United States'
    },
    role: user?.role || 'customer'
  });

  // Load profile data from API when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setProfileData(prev => ({
            ...prev,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || 'customer'
          }));
          setTempData(prev => ({
            ...prev,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || 'customer'
          }));
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  // Update profile data when user data changes (fallback)
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName || '',
        lastName: user.lastName || prev.lastName || '',
        email: user.email || prev.email || '',
        role: user.role || prev.role || 'customer'
      }));
      setTempData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName || '',
        lastName: user.lastName || prev.lastName || '',
        email: user.email || prev.email || '',
        role: user.role || prev.role || 'customer'
      }));
    }
  }, [user]);

  // Save payment methods to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
    }
  }, [paymentMethods]);

  // Save billing address to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('billingAddress', JSON.stringify(billingAddress));
    }
  }, [billingAddress]);

  // Save 2FA status to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('twoFactorEnabled', JSON.stringify(twoFactorEnabled));
    }
  }, [twoFactorEnabled]);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleSave = async () => {
    try {
      // Call API to update profile
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: tempData.firstName,
          lastName: tempData.lastName,
          phone: tempData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update local state
      setProfileData(tempData);
      setIsEditing(false);
      
      // Update user in AuthContext if available
      if (user && window.location) {
        // Reload user data from API
        const userResponse = await fetch('/api/user/profile', {
          credentials: 'include',
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          // Update localStorage if it exists
          const storedUser = localStorage.getItem('feinraum_user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            parsedUser.firstName = userData.firstName;
            parsedUser.lastName = userData.lastName;
            parsedUser.phone = userData.phone;
            localStorage.setItem('feinraum_user', JSON.stringify(parsedUser));
          }
        }
      }

      alert('Profile updated successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setTempData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setTempData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Security handlers
  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      alert('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error: any) {
      alert(error.message || 'Failed to change password');
    }
  };

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    alert(twoFactorEnabled ? 'Two-factor authentication disabled' : 'Two-factor authentication enabled');
  };

  const handleRevokeSession = (sessionId: number) => {
    setSessions((prev: any[]) => prev.filter((session: any) => session.id !== sessionId));
    alert('Session revoked successfully');
  };

  // Payment handlers
  const handleAddPaymentMethod = () => {
    setShowAddPayment(true);
  };

  const handlePaymentFormChange = (field: string, value: string) => {
    setNewPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newPaymentForm.cardNumber || !newPaymentForm.expiryDate || !newPaymentForm.cvv || !newPaymentForm.cardholderName) {
      alert('Please fill in all required fields');
      return;
    }

    // Extract last 4 digits
    const last4 = newPaymentForm.cardNumber.slice(-4);
    
    // Determine card type based on first digit
    const firstDigit = newPaymentForm.cardNumber[0];
    let cardType = 'visa';
    if (firstDigit === '5') cardType = 'mastercard';
    else if (firstDigit === '3') cardType = 'amex';

    // Create new payment method
    const newPayment = {
      id: Date.now(), // Simple ID generation
      type: cardType,
      last4: last4,
      expiry: newPaymentForm.expiryDate,
      default: paymentMethods.length === 0, // First card is default
      cardholderName: newPaymentForm.cardholderName
    };

    // Add to payment methods
    setPaymentMethods((prev: any[]) => [...prev, newPayment]);
    
    // Reset form and close
    setNewPaymentForm({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      type: 'visa'
    });
    setShowAddPayment(false);
    
    alert('Payment method added successfully!');
  };

  const handleCancelAddPayment = () => {
    setNewPaymentForm({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      type: 'visa'
    });
    setShowAddPayment(false);
  };

  const handleRemovePaymentMethod = (paymentId: number) => {
    setPaymentMethods((prev: any[]) => prev.filter((payment: any) => payment.id !== paymentId));
    alert('Payment method removed successfully');
  };

  const handleSetDefaultPayment = (paymentId: number) => {
    setPaymentMethods((prev: any[]) => prev.map((payment: any) => ({
      ...payment,
      default: payment.id === paymentId
    })));
    alert('Default payment method updated');
  };

  const [showEditBilling, setShowEditBilling] = useState(false);
  const [editBillingForm, setEditBillingForm] = useState(billingAddress);

  const handleEditBillingAddress = () => {
    setEditBillingForm(billingAddress);
    setShowEditBilling(true);
  };

  const handleBillingFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBillingAddress(editBillingForm);
    setShowEditBilling(false);
    alert('Billing address updated successfully');
  };

  const handleBillingFormChange = (field: string, value: string) => {
    setEditBillingForm((prev: { name: string; street: string; city: string; state: string; zipCode: string; country: string }) => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-turquoise-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{translate('loadingProfile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{translate('myProfile')}</h1>
              <p className="mt-2 text-gray-600">{translate('manageAccount')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-turquoise-100 text-turquoise-800">
                {user.role === 'admin' ? (
                  <Shield className="w-4 h-4 mr-1" />
                ) : user.role === 'merchant' ? (
                  <Store className="w-4 h-4 mr-1" />
                ) : (
                  <User className="w-4 h-4 mr-1" />
                )}
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'profile', label: translate('profile'), icon: User },
                { id: 'security', label: translate('security'), icon: Shield },
                { id: 'payment', label: translate('paymentMethods'), icon: CreditCard }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors focus:outline-none ${
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
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">{translate('personalInformation')}</h2>
                    <div className="flex items-center space-x-2">
                      {!isEditing ? (
                        <button
                          onClick={() => {
                            console.log('Edit clicked, setting isEditing to true');
                            setIsEditing(true);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center space-x-2"
                        >
                          <Edit className="w-4 h-4" />
                          <span>{translate('edit')}</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleSave}
                            className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white transition-colors"
                            style={{ 
                              backgroundColor: '#a97f57', 
                              minWidth: '100px',
                              display: 'inline-flex',
                              visibility: 'visible',
                              opacity: 1
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8e6a49'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#a97f57'}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            <span>{translate('save')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                          >
                            <X className="w-4 h-4 mr-2" />
                            <span>{translate('cancel')}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                            {translate('firstName')}
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="first-name"
                              id="first-name"
                              value={tempData.firstName || ''}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              className="shadow-sm focus:ring-turquoise-500 focus:border-turquoise-500 block w-full sm:text-sm border border-gray-300 rounded-md px-3 py-2"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                            {translate('lastName')}
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="last-name"
                              id="last-name"
                              value={tempData.lastName || ''}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              className="shadow-sm focus:ring-turquoise-500 focus:border-turquoise-500 block w-full sm:text-sm border border-gray-300 rounded-md px-3 py-2"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-4">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <div className="mt-1">
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={tempData.email || ''}
                              readOnly
                              disabled
                              className="shadow-sm focus:ring-turquoise-500 focus:border-turquoise-500 block w-full sm:text-sm border border-gray-300 rounded-md px-3 py-2 bg-gray-50 cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                          </div>
                        </div>

                        <div className="sm:col-span-4">
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            {translate('phone')}
                          </label>
                          <div className="mt-1">
                            <input
                              type="tel"
                              name="phone"
                              id="phone"
                              value={tempData.phone || ''}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="shadow-sm focus:ring-turquoise-500 focus:border-turquoise-500 block w-full sm:text-sm border border-gray-300 rounded-md px-3 py-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">{translate('firstName')}</h3>
                          <p className="mt-1 text-sm text-gray-900">{profileData.firstName}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">{translate('lastName')}</h3>
                          <p className="mt-1 text-sm text-gray-900">{profileData.lastName}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">{translate('email')}</h3>
                          <p className="mt-1 text-sm text-gray-900">{profileData.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">{translate('phone')}</h3>
                          <p className="mt-1 text-sm text-gray-900">{profileData.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{translate('security')}</h2>
                <div className="space-y-6">
                  {/* Password Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">{translate('password')}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {translate('changePasswordDesc')}
                    </p>
                    {!showPasswordForm ? (
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(true)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-500"
                      >
                        {translate('changePassword')}
                      </button>
                    ) : (
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                          <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-turquoise-500 focus:border-turquoise-500 text-gray-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-turquoise-500 focus:border-turquoise-500 text-gray-900"
                            required
                            minLength={6}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-turquoise-500 focus:border-turquoise-500 text-gray-900"
                            required
                            minLength={6}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-turquoise-600 hover:bg-turquoise-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-500"
                          >
                            Update Password
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            }}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">{translate('twoFactorAuth')}</h3>
                    <p className="text-sm text-blue-700 mb-4">
                      {translate('twoFactorAuthDesc')}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 font-medium">
                        {translate('status')}: {twoFactorEnabled ? translate('enabled') : translate('disabled')}
                      </span>
                      <button
                        type="button"
                        onClick={handleTwoFactorToggle}
                        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          twoFactorEnabled 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {twoFactorEnabled ? translate('disable') : translate('enable')}
                      </button>
                    </div>
                  </div>

                  {/* Login Sessions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">{translate('activeSessions')}</h3>
                    <div className="space-y-3">
                      {sessions.map((session: any) => (
                        <div key={session.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{session.device}</p>
                            <p className="text-xs text-gray-500">{session.location} • Last active {session.lastActive}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {session.current && (
                              <span className="text-xs text-green-600 font-medium">{translate('current')}</span>
                            )}
                            {!session.current && (
                              <button 
                                onClick={() => handleRevokeSession(session.id)}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                {translate('revoke')}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{translate('paymentMethods')}</h2>
                <div className="space-y-6">
                  {/* Add Payment Method */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">{translate('addPaymentMethod')}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {translate('addPaymentMethodDesc')}
                    </p>
                    
                    {!showAddPayment ? (
                      <button
                        type="button"
                        onClick={handleAddPaymentMethod}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-turquoise-600 hover:bg-turquoise-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-500"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        {translate('addCard')}
                      </button>
                    ) : (
                      <form onSubmit={handlePaymentFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {translate('cardholderName')}
                            </label>
                            <input
                              type="text"
                              value={newPaymentForm.cardholderName}
                              onChange={(e) => handlePaymentFormChange('cardholderName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-turquoise-500 focus:border-turquoise-500 text-gray-900"
                              placeholder="John Doe"
                              required
                            />
                          </div>
                          
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {translate('cardNumber')}
                            </label>
                            <input
                              type="text"
                              value={newPaymentForm.cardNumber}
                              onChange={(e) => handlePaymentFormChange('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-turquoise-500 focus:border-turquoise-500 text-gray-900"
                              placeholder="1234 5678 9012 3456"
                              maxLength={16}
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {translate('expiryDate')}
                            </label>
                            <input
                              type="text"
                              value={newPaymentForm.expiryDate}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length >= 2) {
                                  value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                }
                                handlePaymentFormChange('expiryDate', value);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-turquoise-500 focus:border-turquoise-500 text-gray-900"
                              placeholder="MM/YY"
                              maxLength={5}
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {translate('cvv')}
                            </label>
                            <input
                              type="text"
                              value={newPaymentForm.cvv}
                              onChange={(e) => handlePaymentFormChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-turquoise-500 focus:border-turquoise-500 text-gray-900"
                              placeholder="123"
                              maxLength={4}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-turquoise-600 hover:bg-turquoise-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-500"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            {translate('addCard')}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelAddPayment}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Saved Payment Methods */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">{translate('savedPaymentMethods')}</h3>
                    
                    {paymentMethods.map((payment: any) => (
                      <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded flex items-center justify-center ${
                              payment.type === 'visa' ? 'bg-blue-100' : 
                              payment.type === 'mastercard' ? 'bg-red-100' : 
                              payment.type === 'amex' ? 'bg-green-100' :
                              'bg-yellow-100'
                            }`}>
                              {payment.type === 'paypal' ? (
                                <span className="text-yellow-600 font-bold text-xs">P</span>
                              ) : (
                                <CreditCard className={`w-4 h-4 ${
                                  payment.type === 'visa' ? 'text-blue-600' : 
                                  payment.type === 'mastercard' ? 'text-red-600' :
                                  payment.type === 'amex' ? 'text-green-600' :
                                  'text-gray-600'
                                }`} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {payment.type === 'paypal' ? 'PayPal Account' : `•••• •••• •••• ${payment.last4}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {payment.type === 'paypal' 
                                  ? payment.email 
                                  : `${(payment as any).cardholderName || 'Card'} • Expires ${payment.expiry} • ${payment.type === 'visa' ? 'Visa' : payment.type === 'mastercard' ? 'Mastercard' : 'American Express'}`
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {payment.default && (
                              <span className="text-xs text-green-600 font-medium">{translate('default')}</span>
                            )}
                            {!payment.default && (
                              <button
                                onClick={() => handleSetDefaultPayment(payment.id)}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                {translate('setAsDefault')}
                              </button>
                            )}
                            <button
                              onClick={() => handleRemovePaymentMethod(payment.id)}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              {translate('remove')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Billing Address */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">{translate('billingAddress')}</h3>

                    {!showEditBilling ? (
                      <>
                        <div className="text-sm text-gray-600 mb-4">
                          <p>{billingAddress.name}</p>
                          <p>{billingAddress.street}</p>
                          <p>{billingAddress.city}, {billingAddress.state} {billingAddress.zipCode}</p>
                          <p>{billingAddress.country}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleEditBillingAddress}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-500"
                        >
                          {translate('editAddress')}
                        </button>
                      </>
                    ) : (
                      <form onSubmit={handleBillingFormSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {translate('fullName')}
                            </label>
                            <input
                              type="text"
                              value={editBillingForm.name}
                              onChange={(e) => handleBillingFormChange('name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-turquoise-500 focus:border-turquoise-500 text-gray-900"
                              required
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {translate('streetAddress')}
                            </label>
                            <input
                              type="text"
                              value={editBillingForm.street}
                              onChange={(e) => handleBillingFormChange('street', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-turquoise-500 focus:border-turquoise-500 text-gray-900"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {translate('city')}
                            </label>
                            <input
                              type="text"
                              value={editBillingForm.city}
                              onChange={(e) => handleBillingFormChange('city', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-turquoise-500 focus:border-turquoise-500 text-gray-900"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {translate('state')}
                            </label>
                            <input
                              type="text"
                              value={editBillingForm.state}
                              onChange={(e) => handleBillingFormChange('state', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-turquoise-500 focus:border-turquoise-500 text-gray-900"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {translate('zipCode')}
                            </label>
                            <input
                              type="text"
                              value={editBillingForm.zipCode}
                              onChange={(e) => handleBillingFormChange('zipCode', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-turquoise-500 focus:border-turquoise-500 text-gray-900"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {translate('country')}
                            </label>
                            <input
                              type="text"
                              value={editBillingForm.country}
                              onChange={(e) => handleBillingFormChange('country', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-turquoise-500 focus:border-turquoise-500 text-gray-900"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-turquoise-600 text-white rounded-md hover:bg-turquoise-700 focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                          >
                            {translate('saveAddress')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowEditBilling(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            {translate('cancel')}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Become a Merchant Section - Only show for non-merchants */}
            {user.role !== 'merchant' && user.role !== 'admin' && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Store className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Become a Merchant
                    </h3>
                    <p className="text-blue-700 mb-4">
                      Start selling your products on Feinraum marketplace. Create your online store and reach thousands of customers.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        No setup fees
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Secure payments
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Customer management
                      </span>
                    </div>
                    <Link
                      href="/merchant/register"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Store className="w-4 h-4 mr-2" />
                      Register as Merchant
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
};

export default ProfilePage;
