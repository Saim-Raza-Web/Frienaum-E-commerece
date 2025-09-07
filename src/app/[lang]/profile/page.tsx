'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useTranslation } from '../../../i18n/TranslationProvider';
import { usePathname } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  ShoppingBag,
  Heart,
  Settings,
  Shield,
  CreditCard,
  Store,
  Package,
  ShoppingCart
} from 'lucide-react';

function ProfileContent() {
  const { user } = useAuth();
  const { translate } = useTranslation();
  const pathname = usePathname();
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const currentLang = pathSegments[0] || 'en';
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

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

  const [tempData, setTempData] = useState(profileData);

  // Update profile data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || 'customer'
      }));
      setTempData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || 'customer'
      }));
    }
  }, [user]);

  const orderHistory = [
    {
      id: '#ORD-001',
      date: '2024-01-15',
      total: '$89.99',
      status: 'Delivered',
      items: [translate('wirelessHeadphones')]
    },
    {
      id: '#ORD-002',
      date: '2024-01-10',
      total: '$199.99',
      status: 'Delivered',
      items: [translate('smartWatch'), translate('phoneCase')]
    },
    {
      id: '#ORD-003',
      date: '2024-01-05',
      total: '$45.99',
      status: 'Shipped',
      items: [translate('laptopStand')]
    }
  ];

  const wishlist = [
    {
      id: 1,
      name: translate('gamingLaptop'),
      price: '$1,299.99',
      image: '/api/placeholder/100/100'
    },
    {
      id: 2,
      name: translate('wirelessEarbuds'),
      price: '$79.99',
      image: '/api/placeholder/100/100'
    },
    {
      id: 3,
      name: translate('mechanicalKeyboard'),
      price: '$149.99',
      image: '/api/placeholder/100/100'
    }
  ];

  const handleSave = () => {
    setProfileData(tempData);
    setIsEditing(false);
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
                { id: 'orders', label: translate('orderHistory'), icon: ShoppingBag },
                { id: 'wishlist', label: translate('wishlist'), icon: Heart },
                { id: 'settings', label: translate('settings'), icon: Settings },
                { id: 'security', label: translate('security'), icon: Shield },
                { id: 'payment', label: translate('paymentMethods'), icon: CreditCard }
              ].map((tab) => (
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
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">{translate('personalInformation')}</h2>
                  {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-500 flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>{translate('edit')}</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-turquoise-600 hover:bg-turquoise-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-500 flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{translate('save')}</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-500 flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>{translate('cancel')}</span>
                        </button>
                      </div>
                    )}
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
                              value={tempData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              className="shadow-sm focus:ring-turquoise-500 focus:border-turquoise-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                              value={tempData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              className="shadow-sm focus:ring-turquoise-500 focus:border-turquoise-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                              value={tempData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="shadow-sm focus:ring-turquoise-500 focus:border-turquoise-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
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
                              value={tempData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="shadow-sm focus:ring-turquoise-500 focus:border-turquoise-500 block w-full sm:text-sm border-gray-300 rounded-md"
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

            {/* Other tabs content would go here */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{translate('orderHistory')}</h2>
                {orderHistory.length > 0 ? (
                  <div className="space-y-4">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start sm:items-center">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{order.id}</h3>
                            <p className="text-sm text-gray-500">{order.date}</p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            {order.items.join(', ')}
                          </p>
                          <p className="mt-2 text-sm font-medium text-gray-900">{order.total}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{translate('noOrdersYet')}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {translate('orderHistoryEmpty')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{translate('wishlist')}</h2>
                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlist.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <h3 className="mt-4 text-sm text-gray-700">{item.name}</h3>
                        <p className="mt-1 text-lg font-medium text-gray-900">{item.price}</p>
                        <div className="mt-4">
                          <button
                            type="button"
                            className="w-full flex items-center justify-center rounded-md border border-transparent bg-turquoise-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-turquoise-700 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2"
                          >
                            {translate('addToCart')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{translate('noSavedItems')}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {translate('wishlistEmpty')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{translate('accountSettings')}</h2>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900">{translate('password')}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {translate('changePasswordDesc')}
                    </p>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-500"
                      >
                        {translate('changePassword')}
                      </button>
                    </div>
                  </div>

                  {user.role === 'merchant' && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="text-sm font-medium text-blue-800">{translate('merchantTools')}</h3>
                      <p className="mt-1 text-sm text-blue-700">
                        {translate('merchantToolsDesc')}
                      </p>
                      <div className="mt-4">
                        <a
                          href={`/${currentLang}/merchant`}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Store className="-ml-0.5 mr-2 h-4 w-4" />
                          {translate('merchantDashboard')}
                        </a>
                      </div>
                    </div>
                  )}

                  {user.role === 'admin' && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <h3 className="text-sm font-medium text-red-800">{translate('adminTools')}</h3>
                      <p className="mt-1 text-sm text-red-700">
                        {translate('adminToolsDesc')}
                      </p>
                  <div className="mt-4">
                    <a
                      href={`/${currentLang}/admin`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Shield className="-ml-0.5 mr-2 h-4 w-4" />
                      {translate('adminDashboard')}
                    </a>
                  </div>
                    </div>
                  )}
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
