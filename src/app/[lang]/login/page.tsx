'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ShoppingBag, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';

export default function LoginPage() {
  const { translate } = useTranslation();

  if (!translate) {
    return <div>Loading translations...</div>;
  }

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
    storeName: ''
  });

  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

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
  }, [isLogin]);

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

  const handleInputChange = (field: string, value: string) => {
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
      storeName: ''
    });
    clearError();
  }, [clearError]);

  const toggleMode = useCallback(() => {
    setIsLogin(prev => !prev);
    resetForm();
  }, [resetForm]);

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
                    <div className="mt-1 relative">
                      <input
                        id="storeName"
                        name="storeName"
                        type="text"
                        required={!isLogin}
                        value={formData.storeName}
                        onChange={(e) => handleInputChange('storeName', e.target.value)}
                        className="input-field pl-4"
                        placeholder=""
                      />
                      <ShoppingBag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
    </div>
  );
}