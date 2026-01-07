'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/i18n/TranslationProvider';

const COOKIE_BANNER_ENABLED = true;
const STORAGE_KEY = 'feinraum_cookie_consent_v1';

type ConsentState = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const defaultConsent: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export default function CookieBanner() {
  const { translate: t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<ConsentState>(defaultConsent);

  const storedConsent = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ConsentState;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!COOKIE_BANNER_ENABLED) return;
    if (storedConsent) {
      setPreferences(storedConsent);
      return;
    }
    setIsOpen(true);
  }, [storedConsent]);

  const handleSave = (updated: ConsentState) => {
    setPreferences(updated);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    setIsOpen(false);
  };

  const handleAcceptAll = () => {
    handleSave({ necessary: true, analytics: true, marketing: true });
  };

  const handleRejectOptional = () => {
    handleSave({ necessary: true, analytics: false, marketing: false });
  };

  if (!COOKIE_BANNER_ENABLED || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-2xl border border-primary-100 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-montserrat font-semibold text-primary-900 mb-2">
              {t('cookie.title')}
            </h2>
            <p className="text-sm sm:text-base text-primary-700 font-lora">
              {t('cookie.description')}
            </p>
          </div>

          <div className="space-y-3 rounded-xl bg-primary-50/60 p-3 sm:p-4">
            <ConsentToggle
              label={t('cookie.necessary')}
              description={t('cookie.necessaryDesc')}
              checked
              disabled
            />
            <ConsentToggle
              label={t('cookie.analytics')}
              description={t('cookie.analyticsDesc')}
              checked={preferences.analytics}
              onChange={(value) => setPreferences((prev) => ({ ...prev, analytics: value }))}
            />
            <ConsentToggle
              label={t('cookie.marketing')}
              description={t('cookie.marketingDesc')}
              checked={preferences.marketing}
              onChange={(value) => setPreferences((prev) => ({ ...prev, marketing: value }))}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs sm:text-sm text-primary-600 font-lora">
              {t('cookie.learnMore')}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="border border-primary-200 text-primary-700 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary-50 transition-colors"
              >
                {t('cookie.reject')}
              </button>
              <button
                type="button"
                onClick={() => handleSave(preferences)}
                className="border border-primary-200 text-primary-700 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary-50 transition-colors"
              >
                {t('cookie.save')}
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="btn-primary px-4 py-2 text-sm font-semibold text-white"
              >
                {t('cookie.acceptAll')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type ConsentToggleProps = {
  label: string;
  description: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
};

function ConsentToggle({ label, description, checked = false, disabled = false, onChange }: ConsentToggleProps) {
  return (
    <label className={`flex items-start gap-3 rounded-lg border border-primary-100 bg-white/80 p-3 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <div>
        <p className="text-sm font-semibold text-primary-800">{label}</p>
        <p className="text-xs text-primary-600">{description}</p>
      </div>
    </label>
  );
}

