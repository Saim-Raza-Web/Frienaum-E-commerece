// Define the list of supported locales
export const locales = ['en', 'es', 'fr', 'de'] as const;
export type Locale = typeof locales[number];

// Type for our translation files
export type Translation = {
  navigation: {
    products: string;
    categories: string;
    search: string;
    cart: string;
    profile: string;
  };
  language: {
    en: string;
    es: string;
    fr: string;
    de: string;
  };
};

// Load translations for a specific locale
export async function getTranslations(locale: Locale): Promise<Translation> {
  try {
    const messages = await import(`./locales/${locale}/common.json`);
    return messages.default as Translation;
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error);
    // Fallback to English if the requested locale fails to load
    if (locale !== 'en') {
      return getTranslations('en');
    }
    throw error;
  }
}

// Check if a string is a valid locale
export function isValidLocale(locale: string | undefined): locale is Locale {
  return locales.includes(locale as Locale);
}
