'use client'; // Marking this file as a client component

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Locale, isValidLocale } from './config';
import deTranslations from '@/i18n/locales/de/common.json';
import enTranslations from '@/i18n/locales/en/common.json';

interface TranslationContextType {
  translate: (key: string, params?: Record<string, any>) => string;
  currentLocale: string;
  setLocale: (locale: string) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
  initialLocale: string;
}

const DEFAULT_LOCALE = 'de';
const PRELOADED_TRANSLATIONS: Record<Locale, Record<string, any>> = {
  de: deTranslations as Record<string, any>,
  en: enTranslations as Record<string, any>,
};

const getPreloadedTranslations = (locale: string) => {
  return PRELOADED_TRANSLATIONS[locale as Locale];
};

export const TranslationProvider = ({ children, initialLocale }: TranslationProviderProps) => {
  const pathname = usePathname();
  const urlLocaleCandidate = pathname?.split('/')[1];
  const normalizedUrlLocale = isValidLocale(urlLocaleCandidate || '') ? urlLocaleCandidate : undefined;
  // Only allow 'de' or 'en', fallback always to 'de'
  const startingLocale = normalizedUrlLocale || initialLocale || DEFAULT_LOCALE;

  const [currentLocale, setCurrentLocale] = useState<string>(startingLocale);
  const [translations, setTranslations] = useState<Record<string, any>>(
    getPreloadedTranslations(startingLocale) || {}
  );

  useEffect(() => {
    if (normalizedUrlLocale && currentLocale !== normalizedUrlLocale) {
      setCurrentLocale(normalizedUrlLocale);
    }
  }, [normalizedUrlLocale]);

  // Load translations when locale changes
  useEffect(() => {
    let mounted = true;
    const loadTranslations = async () => {
      const preloaded = getPreloadedTranslations(currentLocale);
      if (preloaded) {
        if (mounted) {
          setTranslations(preloaded);
        }
        return;
      }
      try {
        const messages = await import(`@/i18n/locales/${currentLocale}/common.json`);
        if (mounted && messages.default) {
          setTranslations(messages.default);
        }
      } catch (error) {
        console.error(`Failed to load translations for locale: ${currentLocale}`, error);
        // Fallback to German
        if (currentLocale !== DEFAULT_LOCALE && mounted) {
          try {
            const fallbackMessages = await import(`@/i18n/locales/${DEFAULT_LOCALE}/common.json`);
            if (mounted && fallbackMessages.default) {
              setTranslations(fallbackMessages.default);
            }
          } catch (fallbackError) {
            console.error('Failed to load fallback translations', fallbackError);
          }
        }
      }
    };
    loadTranslations();
    return () => { mounted = false; };
  }, [currentLocale]);

  const applyParams = (text: string, params?: Record<string, any>) => {
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (match, paramKey) =>
      params[paramKey] !== undefined ? String(params[paramKey]) : match
    );
  };

  const translate = (key: string, params?: Record<string, any>): string => {
    if (!translations || Object.keys(translations).length === 0) {
      return key; // translations not ready yet
    }

    // First try nested lookup (admin.panel)
    const keys = key.split('.');
    let nestedValue: any = translations;
    for (const k of keys) {
      if (nestedValue && typeof nestedValue === 'object' && k in nestedValue) {
        nestedValue = nestedValue[k];
      } else {
        nestedValue = undefined;
        break;
      }
    }
    if (typeof nestedValue === 'string') {
      return applyParams(nestedValue, params);
    }

    // Support flat keys stored as "admin.panel"
    const directValue = translations[key];
    if (typeof directValue === 'string') {
      return applyParams(directValue, params);
    }

    return key;
  };

  const setLocale = (locale: string) => {
    if (!isValidLocale(locale)) return;
    setCurrentLocale(locale);
  };

  return (
    <TranslationContext.Provider value={{ currentLocale, translate, setLocale }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
