export type Locale = 'en' | 'es' | 'fr' | 'de';

export const locales: Locale[] = ['en', 'es', 'fr', 'de'];

export const isLocale = (value: string): value is Locale => {
  return locales.includes(value as Locale);
};
