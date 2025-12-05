'use client'; // Marking this file as a client component

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { isValidLocale } from './config';

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

export const TranslationProvider = ({ children, initialLocale }: TranslationProviderProps) => {
  const pathname = usePathname();
  const urlLocaleCandidate = pathname?.split('/')[1];
  const normalizedUrlLocale = isValidLocale(urlLocaleCandidate || '') ? urlLocaleCandidate : undefined;
  // Only allow 'de' or 'en', fallback always to 'de'
  const startingLocale = normalizedUrlLocale || DEFAULT_LOCALE;

  const [currentLocale, setCurrentLocale] = useState<string>(startingLocale);
  const [translations, setTranslations] = useState<Record<string, any>>({});

  useEffect(() => {
    if (normalizedUrlLocale && currentLocale !== normalizedUrlLocale) {
      setCurrentLocale(normalizedUrlLocale);
    }
  }, [normalizedUrlLocale]);

  // Load translations when locale changes
  useEffect(() => {
    let mounted = true;
    const loadTranslations = async () => {
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

  const translate = (key: string, params?: Record<string, any>): string => {
    // Handle nested keys like 'admin.panel'
    const keys = key.split('.');
    let value: any = translations;

    // Check if translations is loaded
    if (!translations || Object.keys(translations).length === 0) {
      return key; // Return key as fallback if translations not loaded yet
    }

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return the key if translation not found
        return key;
      }
    }

    if (typeof value === 'string' && params) {
      // Simple interpolation: replace {key} with params[key]
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? String(params[paramKey]) : match;
      });
    }

    return typeof value === 'string' ? value : key;
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
