import { Locale } from '../types/locale';

type Translations = {
  [key: string]: string | Translations;
};

const loadTranslations = async (locale: Locale, namespace: string): Promise<Translations> => {
  try {
    const translationModule = await import(`@/i18n/locales/${locale}/${namespace}.json`);
    return translationModule.default;
  } catch (error) {
    console.error(`Failed to load ${namespace} for locale ${locale}:`, error);
    return {};
  }
};

export const getTranslation = (translations: Translations, key: string): string => {
  const keys = key.split('.');
  let result: any = { ...translations };

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return key; // Return the key if translation not found
    }
  }

  return typeof result === 'string' ? result : key;
};

export const loadCommonTranslations = async (locale: Locale) => {
  return loadTranslations(locale, 'common');
};
