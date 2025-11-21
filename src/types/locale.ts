export type Locale = 'de' | 'en';

export const locales: Locale[] = ['de', 'en'];

export const isLocale = (value: string): value is Locale => {
  return locales.includes(value as Locale);
};
