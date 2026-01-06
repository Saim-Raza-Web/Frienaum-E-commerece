'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ShoppingBag, Loader2, X, FileText, Shield } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';

export default function LoginPage() {
  const { translate } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'merchant',
    storeName: '',
    agreeToTerms: false,
    newsletterConsent: false,
    cookiesConsent: false
  });

  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  // T&C Popup state
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [activeTermsTab, setActiveTermsTab] = useState<'terms' | 'privacy'>('terms');
  const [termsScrolledToBottom, setTermsScrolledToBottom] = useState(false);
  const [privacyScrolledToBottom, setPrivacyScrolledToBottom] = useState(false);

  const { login, register, isAuthenticated, isLoading, error, clearError, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const currentLang = pathSegments[0] || 'de';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Get the current language from the URL path
      const currentPath = window.location.pathname;
      const langMatch = currentPath.match(/^\/([a-z]{2})(\/|$)/);
      const currentLang = langMatch ? langMatch[1] : 'en';

      // Role-based redirect logic
      if (user.role === 'merchant') {
        // Merchants always go to their dashboard
        router.push(`/${currentLang}/merchant`);
        return;
      } else if (user.role === 'admin') {
        // Admins go to admin dashboard
        router.push(`/${currentLang}/admin`);
        return;
      }

      // For customers, use redirect parameter or default to home
      const redirectTo = new URLSearchParams(window.location.search).get('redirect') || `/${currentLang}`;
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, user]);

  // Clear error when switching between login/register
  useEffect(() => {
    clearError();
  }, [isLogin, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      await login({
        email: formData.email,
        password: formData.password
      });
    } else {
      await register(formData);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      setForgotPasswordError(translate('forgotPasswordEmailRequired') || 'Please enter your email address');
      return;
    }

    try {
      setForgotPasswordLoading(true);
      setForgotPasswordError('');

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          lang: currentLang,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send reset email');
      }

      setResetEmail(formData.email);
      setForgotPasswordSuccess(true);

    } catch (err: any) {
      console.error('Forgot password error:', err);
      setForgotPasswordError(err.message || 'An error occurred');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const resetForgotPassword = () => {
    setIsForgotPassword(false);
    setForgotPasswordSuccess(false);
    setForgotPasswordError('');
    setResetEmail('');
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = useCallback(() => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
      storeName: '',
      agreeToTerms: false,
      newsletterConsent: false,
      cookiesConsent: false
    });
    clearError();
    // Reset T&C popup state
    setTermsScrolledToBottom(false);
    setPrivacyScrolledToBottom(false);
  }, [clearError]);

  // Handle scroll in T&C popup to detect if user scrolled to bottom
  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (activeTermsTab === 'terms' && isAtBottom) {
      setTermsScrolledToBottom(true);
    } else if (activeTermsTab === 'privacy' && isAtBottom) {
      setPrivacyScrolledToBottom(true);
    }
  };

  // Accept terms from popup
  const handleAcceptTerms = () => {
    handleInputChange('agreeToTerms', true);
    setShowTermsPopup(false);
  };

  // Check if user can accept (scrolled both sections)
  const canAcceptTerms = termsScrolledToBottom && privacyScrolledToBottom;

  const toggleMode = useCallback(() => {
    setIsLogin(prev => !prev);
    resetForm();
  }, [resetForm]);

  if (!translate) {
    return <div>Loading translations...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary-warm to-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg sm:text-xl font-bold">S</span>
          </div>
        </div>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-gray-900">
          {isLogin ? translate('Sign in to your account') : translate('Create your account')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? (
            <>
              {translate('Or')}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-primary-warm hover:text-primary-warm-hover"
              >
                {translate('create a new account')}
              </button>
            </>
          ) : (
            <>
              {translate('Already have an account?')}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-primary-warm hover:text-primary-warm-hover"
              >
                {translate('Sign in here')}
              </button>
            </>
          )}
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 shadow sm:rounded-lg sm:px-6 lg:px-10">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      {translate('First Name')}
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required={!isLogin}
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="input-field pl-4"
                        placeholder={translate('John')}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      {translate('Last Name')}
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required={!isLogin}
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="input-field pl-4"
                        placeholder={translate('Doe')}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    {translate('Account Type')}
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="input-field"
                    >
                      <option value="customer">{translate('Customer - Shop and buy products')}</option>
                      <option value="merchant">{translate('Merchant - Sell your products')}</option>
                    </select>
                  </div>
                </div>

                {formData.role === 'merchant' && (
                  <div className="sm:col-span-2">
                    <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                      {translate('Store Name')}
                    </label>
                    <div className="mt-1">
                      <input
                        id="storeName"
                        name="storeName"
                        type="text"
                        required={!isLogin}
                        value={formData.storeName}
                        onChange={(e) => handleInputChange('storeName', e.target.value)}
                        className="input-field"
                        placeholder={translate('Enter your store name')}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {translate('Email address')}
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input-field pl-12"
                  placeholder={translate('john@example.com')}
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {translate('Phone Number')}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="input-field pl-4"
                    placeholder={translate('+41 79 123 45 67')}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {translate('Password')}
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="input-field pl-12"
                  placeholder={translate('••••••••')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="font-medium text-primary-warm hover:text-primary-warm-hover"
                  >
                    {translate('Forgot your password?')}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  {translate('Confirm Password')}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="input-field pl-12 pr-10"
                    placeholder={translate('••••••••')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Terms & Conditions and Marketing Consents - Only for Registration */}
            {!isLogin && (
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms || false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // If trying to check, open popup
                        setShowTermsPopup(true);
                      } else {
                        // Allow unchecking directly
                        handleInputChange('agreeToTerms', false);
                        // Reset scroll states when unchecking
                        setTermsScrolledToBottom(false);
                        setPrivacyScrolledToBottom(false);
                      }
                    }}
                    className="mt-1 h-4 w-4 text-primary-warm focus:ring-primary-warm border-gray-300 rounded cursor-pointer"
                    required
                  />
                  <label className="text-sm text-gray-700">
                    {translate('I accept the')}{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsPopup(true)}
                      className="text-primary-warm hover:text-primary-warm-hover underline font-medium"
                    >
                      {translate('Terms of Service')}
                    </button>
                    {' '}{translate('and')}{' '}
                    <button
                      type="button"
                      onClick={() => { setShowTermsPopup(true); setActiveTermsTab('privacy'); }}
                      className="text-primary-warm hover:text-primary-warm-hover underline font-medium"
                    >
                      {translate('Privacy Policy')}
                    </button>
                    {' '}*
                  </label>
                </div>
                {formData.agreeToTerms && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {translate('Terms and Privacy Policy accepted')}
                  </p>
                )}

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">{translate('Marketing Preferences (Optional)')}</h4>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="newsletter"
                      name="newsletterConsent"
                      checked={formData.newsletterConsent || false}
                      onChange={(e) => handleInputChange('newsletterConsent', e.target.checked)}
                      className="mt-1 h-4 w-4 text-primary-warm focus:ring-primary-warm border-gray-300 rounded"
                    />
                    <label htmlFor="newsletter" className="text-sm text-gray-700">
                      {translate('I would like to receive newsletters and marketing updates')}
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="cookies"
                      name="cookiesConsent"
                      checked={formData.cookiesConsent || false}
                      onChange={(e) => handleInputChange('cookiesConsent', e.target.checked)}
                      className="mt-1 h-4 w-4 text-primary-warm focus:ring-primary-warm border-gray-300 rounded"
                    />
                    <label htmlFor="cookies" className="text-sm text-gray-700">
                      {translate('I agree to the use of cookies and tracking technologies')}
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
              {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isLogin ? translate('Signing in...') : translate('Creating account...')}
                  </>
                ) : (
                  isLogin ? translate('Sign in') : translate('Create account')
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 font-lora text-center">
              {translate('privacy.authNote')}
            </p>
          </form>

          {isForgotPassword && (
            <div className="mt-6">
              <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">{translate('resetYourPassword')}</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {translate('forgotPasswordInstructions')}
                  </p>
                </div>

                {forgotPasswordSuccess ? (
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{translate('passwordResetEmailSent')}</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {translate('passwordResetEmailSentDescription')}
                    </p>
                    {resetEmail && (
                      <p className="text-sm font-semibold text-gray-900 break-all mb-4">
                        {resetEmail}
                      </p>
                    )}
                    <button
                      onClick={resetForgotPassword}
                      className="font-medium text-primary-warm hover:text-primary-warm-hover"
                    >
                      {translate('backToSignIn')}
                    </button>
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleForgotPassword}>
                    <div>
                      <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700">
                        {translate('Email address')}
                      </label>
                      <div className="mt-1">
                        <input
                          id="resetEmail"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="input-field"
                          placeholder={translate('john@example.com')}
                        />
                      </div>
                    </div>

                    {forgotPasswordError && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-800">{forgotPasswordError}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <button
                        type="submit"
                        disabled={forgotPasswordLoading}
                        className="btn-primary w-full"
                      >
                        {forgotPasswordLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            {translate('sendingResetLink')}
                          </>
                        ) : (
                          translate('sendResetLink')
                        )}
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-6">
                  <button
                    onClick={resetForgotPassword}
                    className="w-full text-center text-sm text-gray-600 hover:text-gray-500"
                  >
                    {translate('Back to sign in')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center pointer-events-none">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{translate('newToPlatform')}</span>
              </div>
              <div className="flex items-center justify-center gap-4 mt-3 relative z-10">
                {isLogin ? (
                  <button
                    type="button"
                    className="text-primary-600 hover:text-primary-800 underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1 relative z-20"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleMode();
                    }}
                  >
                    {translate('createAccount')}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-gray-600 hover:text-gray-800 underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1 relative z-20"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleMode();
                    }}
                  >
                    {translate('backToLogin')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* T&C Popup Modal */}
      {showTermsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">AGB & Datenschutz</h2>
                  <p className="text-sm text-gray-500">Bitte lesen und akzeptieren Sie, um fortzufahren</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsPopup(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTermsTab('terms')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTermsTab === 'terms'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                AGB
                {termsScrolledToBottom && (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTermsTab('privacy')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTermsTab === 'privacy'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                Datenschutz
                {privacyScrolledToBottom && (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>

            {/* Content */}
            <div 
              className="flex-1 overflow-y-auto p-6 text-sm text-gray-700 leading-relaxed"
              onScroll={handleTermsScroll}
            >
              {activeTermsTab === 'terms' ? (
                <div className="space-y-6">
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Geltungsbereich</h3>
                    <p className="mb-2">Diese Allgemeinen Geschäftsbedingungen regeln die Nutzung der Online-Plattform Feinraumshop. Betreiberin der Plattform ist Feinraumshop.</p>
                    <p>Diese AGB gelten für alle Nutzerinnen und Nutzer der Plattform. Mit dem Zugriff auf die Plattform erklärst du dich mit diesen AGB einverstanden.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Vertragspartner</h3>
                    <p className="mb-2">Feinraumshop ist nicht Verkäuferin der über die Plattform angebotenen Produkte. Ein Kaufvertrag kommt ausschliesslich zwischen der Kundschaft und dem jeweiligen Lieferanten zustande.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Preise und Zahlung</h3>
                    <p>Sämtliche Preise werden in Schweizer Franken (CHF) angezeigt. Massgeblich ist der Preis zum Zeitpunkt der Bestellung.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Versand und Lieferung</h3>
                    <p>Versand und Lieferung erfolgen durch den jeweiligen Lieferanten. Standardversand beträgt CHF 8.50.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Rücksendungen</h3>
                    <p>Rücksendungen und Reklamationen werden durch den jeweiligen Lieferanten bearbeitet.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Haftung</h3>
                    <p>Feinraumshop haftet ausschliesslich für Schäden bei Vorsatz oder grober Fahrlässigkeit.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Anwendbares Recht</h3>
                    <p>Es gilt schweizerisches Recht. Gerichtsstand ist Arbon, Schweiz.</p>
                  </section>
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-xs">
                    Bitte scrollen Sie nach unten, um alle Bedingungen zu lesen
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Verantwortliche Stelle</h3>
                    <p>Verantwortliche Stelle für die Datenbearbeitung ist die Feinraumshop AG, Arbon, Schweiz.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Erhobene Daten</h3>
                    <p>Wir bearbeiten Personendaten wie Stammdaten, Vertragsdaten, Kommunikationsdaten, Nutzungsdaten und Zahlungsdaten.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Zwecke der Datenbearbeitung</h3>
                    <p>Die Datenbearbeitung dient der Bereitstellung der Plattform, Abwicklung von Bestellungen, Kommunikation und Verbesserung unserer Services.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Weitergabe von Daten</h3>
                    <p>Eine Weitergabe erfolgt nur zur Vertragserfüllung an Lieferanten, Zahlungsdienstleister und Versanddienstleister.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Cookies</h3>
                    <p>Wir verwenden Cookies für den Betrieb der Plattform und statistische Analysen. Nicht notwendige Cookies nur mit Ihrer Einwilligung.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Ihre Rechte</h3>
                    <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Datenübertragbarkeit.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Datensicherheit</h3>
                    <p>Wir treffen technische und organisatorische Massnahmen zum Schutz Ihrer Daten, einschliesslich SSL/TLS-Verschlüsselung.</p>
                  </section>
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-xs">
                    Bitte scrollen Sie nach unten, um alle Bedingungen zu lesen
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col gap-4">
                {/* Status message */}
                <div className="flex items-center gap-2 text-sm">
                  {!canAcceptTerms ? (
                    <p className="text-amber-600">
                      ⚠️ Bitte lesen Sie beide Abschnitte (AGB & Datenschutz) vollständig durch
                    </p>
                  ) : (
                    <p className="text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Beide Abschnitte gelesen
                    </p>
                  )}
                </div>

                {/* Checkbox and buttons row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Acceptance checkbox */}
                  <div className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                    canAcceptTerms 
                      ? 'border-primary-300 bg-primary-50' 
                      : 'border-gray-200 bg-gray-100 opacity-60'
                  }`}>
                    <input
                      type="checkbox"
                      id="popupTermsCheckbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => {
                        if (canAcceptTerms) {
                          handleInputChange('agreeToTerms', e.target.checked);
                        }
                      }}
                      disabled={!canAcceptTerms}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                    />
                    <label 
                      htmlFor="popupTermsCheckbox" 
                      className={`text-sm font-medium ${canAcceptTerms ? 'text-gray-900 cursor-pointer' : 'text-gray-500 cursor-not-allowed'}`}
                    >
                      Ich habe die AGB und Datenschutzerklärung gelesen und akzeptiere diese
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowTermsPopup(false)}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTermsPopup(false)}
                      disabled={!formData.agreeToTerms}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        formData.agreeToTerms
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Bestätigen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}