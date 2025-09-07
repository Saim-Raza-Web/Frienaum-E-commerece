'use client'; // Marking this file as a client component

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';

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

export const TranslationProvider = ({ children, initialLocale }: TranslationProviderProps) => {
  const [currentLocale, setCurrentLocale] = useState<string>(initialLocale);
  const [translations, setTranslations] = useState<any>({});

  // Load translations when locale changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const messages = await import(`./locales/${currentLocale}/common.json`);
        setTranslations(messages.default);
      } catch (error) {
        console.error(`Failed to load translations for locale: ${currentLocale}`, error);
        // Fallback to English
        if (currentLocale !== 'en') {
          try {
            const fallbackMessages = await import('./locales/en/common.json');
            setTranslations(fallbackMessages.default);
          } catch (fallbackError) {
            console.error('Failed to load fallback translations', fallbackError);
          }
        }
      }
    };

    loadTranslations();
  }, [currentLocale]);

  const translate = (key: string, params?: Record<string, any>): string => {
    // Handle nested keys like 'admin.panel'
    const keys = key.split('.');
    let value: any = translations;

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
    setCurrentLocale(locale);
  };

  return (
    <TranslationContext.Provider value={{ translate, currentLocale, setLocale }}>
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
