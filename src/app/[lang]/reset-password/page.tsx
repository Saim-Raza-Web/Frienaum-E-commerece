'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Lock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';
  const router = useRouter();
  const pathname = usePathname() || '';
  const { translate } = useTranslation();

  const lang = pathname.split('/').filter(Boolean)[0] || 'de';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      setError(translate('resetTokenMissing') || 'Reset token missing');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError(translate('forgotPasswordEmailRequired') || 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(translate('passwordsDoNotMatch') || 'Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError(translate('passwordTooShort') || 'Password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: newPassword }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || translate('resetTokenInvalid') || 'Failed to reset password');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || translate('resetTokenInvalid') || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {success ? translate('passwordResetCompleteTitle') : translate('setNewPassword')}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {success
              ? translate('passwordResetCompleteDescription')
              : translate('setNewPasswordDescription')}
          </p>
        </div>

        {!token && !success && (
          <div className="mt-8 rounded-lg bg-yellow-50 border border-yellow-200 p-6">
            <div className="flex items-center text-yellow-800 mb-2">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="font-medium">{translate('resetTokenMissing')}</span>
            </div>
            <p className="text-sm text-yellow-700">
              {translate('forgotPasswordInstructions')}
            </p>
            <Link
              href={`/${lang}/login`}
              className="mt-4 inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              {translate('returnToLogin')}
            </Link>
          </div>
        )}

        {!success && token && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white shadow rounded-lg p-6">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                {translate('newPasswordLabel')}
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                {translate('confirmNewPasswordLabel')}
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {translate('updatingPassword') || 'Updating...'}
                </>
              ) : (
                translate('updatePassword')
              )}
            </button>
          </form>
        )}

        {success && (
          <div className="mt-8 rounded-lg bg-white shadow p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-6">
              {translate('passwordResetCompleteDescription')}
            </p>
            <button
              onClick={() => router.push(`/${lang}/login`)}
              className="btn-primary w-full"
            >
              {translate('returnToLogin')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

