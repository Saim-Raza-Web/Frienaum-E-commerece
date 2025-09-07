'use client';

import { useEffect, useState, useCallback } from 'react';
import { Locale } from '../types/locale';
import { loadCommonTranslations, getTranslation } from '../i18n';

export const useTranslation = (locale: Locale) => {
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the translation function to prevent unnecessary re-renders
  const t = useCallback((key: string): string => {
    if (isLoading) return key; // Return key as fallback while loading
    return getTranslation(translations, key) || key; // Return key if translation not found
  }, [isLoading, translations]);

  useEffect(() => {
    let isMounted = true;
    
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const common = await loadCommonTranslations(locale);
        
        if (isMounted) {
          setTranslations(common);
        }
      } catch (err) {
        console.error('Failed to load translations:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load translations'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTranslations();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [locale]);

  return { 
    t, 
    isLoading, 
    error,
    locale // Return current locale for convenience
  };
};
