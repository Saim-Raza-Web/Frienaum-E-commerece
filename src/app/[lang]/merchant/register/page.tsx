'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n/TranslationProvider';
import {
  Store,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Loader2,
  FileText,
  CreditCard,
  Users,
  TrendingUp
} from 'lucide-react';

export default function MerchantRegistrationPage() {
  const { user, updateUser } = useAuth();
  const { translate } = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    storeName: '',
    businessType: '',
    description: '',
    agreeToTerms: false,
    agreeToFees: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateStep1 = () => {
    if (!formData.storeName.trim()) {
      setError('Store name is required');
      return false;
    }
    if (formData.storeName.trim().length < 3) {
      setError('Store name must be at least 3 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.businessType) {
      setError('Please select a business type');
      return false;
    }
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return false;
    }
    if (!formData.agreeToFees) {
      setError('You must agree to the fee structure');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/merchant/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ storeName: formData.storeName.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(errorData.error || 'Failed to register as merchant');
      }

      const result = await response.json();

      // Update user role in context
      updateUser({ ...user!, role: 'merchant' });

      // Redirect to merchant dashboard
      router.push('/merchant');

    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in first</h1>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === 'merchant') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">You're already a merchant!</h1>
          <Link href="/merchant" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Go to Merchant Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Store className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Become a Merchant</h1>
                <p className="text-gray-600">Start selling on Feinraum marketplace</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {step === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Set Up Your Store</h2>
                <p className="text-lg text-gray-600">Tell us about your business and get started</p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your store name"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.storeName.length}/50 characters
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select business type</option>
                    <option value="individual">Individual Seller</option>
                    <option value="small_business">Small Business</option>
                    <option value="retail_store">Retail Store</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell customers about your store..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleNext}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Review & Agree</h2>
                <p className="text-lg text-gray-600">Please review our terms before continuing</p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                {/* Benefits */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">What you'll get:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-blue-800">Online store management</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-blue-800">Secure payment processing</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-blue-800">Customer management</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-blue-800">Sales analytics</span>
                    </div>
                  </div>
                </div>

                {/* Fee Structure */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <CreditCard className="w-6 h-6 text-gray-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Fee Structure</h3>
                      <ul className="text-gray-700 space-y-1">
                        <li>• 20% commission on each sale</li>
                        <li>• No monthly fees</li>
                        <li>• No setup fees</li>
                        <li>• Payment processing fees included</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the{' '}
                      <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="fees"
                      checked={formData.agreeToFees}
                      onChange={(e) => handleInputChange('agreeToFees', e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="fees" className="text-sm text-gray-700">
                      I understand and agree to the 20% commission fee structure
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Creating Store...
                      </>
                    ) : (
                      <>
                        <Store className="w-5 h-5 mr-2" />
                        Create My Store
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p>Need help? <Link href="/contact" className="text-blue-600 hover:text-blue-800">Contact our support team</Link></p>
        </div>
      </div>
    </div>
  );
}
