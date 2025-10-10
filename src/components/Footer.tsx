'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';

export default function Footer() {
  const { translate } = useTranslation();
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'en';
  return (
    <footer className="bg-[var(--color-accent-beige)] text-[var(--color-primary-800)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
              src="/images/Logo.png" 
              alt="Frienaum Logo" 
              className="h-8 w-auto"
              style={{ filter: 'invert(37%) sepia(53%) saturate(946%) hue-rotate(336deg) brightness(90%) contrast(100%) drop-shadow(0 0 0.5px #00000066)' }}
            />
            <span className="text-xl font-bold">Frienaum</span>
            </div>
            <p className="text-[var(--color-primary-800)] mb-4 max-w-md">
              {translate('companyDescription')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-[var(--color-primary-800)] hover:text-[var(--color-primary-800)] hover:font-medium transition-all duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-[var(--color-primary-800)] hover:text-[var(--color-primary-800)] hover:font-medium transition-all duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-[var(--color-primary-800)] hover:text-[var(--color-primary-800)] hover:font-medium transition-all duration-200">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{translate('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${lang}/`} className="text-[var(--color-primary-800)] hover:text-[var(--color-primary-800)] hover:font-medium transition-all duration-200">
                  {translate('home')}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/products`} className="text-[var(--color-primary-800)] hover:text-[var(--color-primary-800)] hover:font-medium transition-all duration-200">
                  {translate('navigation.products')}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/categories`} className="text-[var(--color-primary-800)] hover:text-[var(--color-primary-800)] hover:font-medium transition-all duration-200">
                  {translate('navigation.categories')}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/about`} className="text-[var(--color-primary-800)] hover:text-[var(--color-primary-800)] hover:font-medium transition-all duration-200">
                  {translate('about')}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/contact`} className="text-[var(--color-primary-800)] hover:text-[var(--color-primary-800)] hover:font-medium transition-all duration-200">
                  {translate('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{translate('customerService')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${lang}/help`} className="text-[var(--color-primary-800)] hover:text-[var(--color-primary-800)] hover:font-medium transition-all duration-200">
                  {translate('helpCenter')}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/faqs`} className="text-[var(--color-primary-800)] hover:text-[var(--color-primary-800)] hover:font-medium transition-all duration-200">
                  {translate('faqTitle')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Contact Info */}
        <div className="mt-8 pt-8 border-t border-[var(--color-primary-200)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-[var(--color-primary-800)]" />
              <p className="text-[var(--color-primary-800)]">support@estore.com</p>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-[var(--color-primary-800)]" />
              <p className="text-[var(--color-primary-800)]">+1 (555) 123-4567</p>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-[var(--color-primary-800)]" />
              <p className="text-[var(--color-primary-800)]">123 Commerce St, City, State</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-[var(--color-primary-200)] text-center">
          <p className="text-[var(--color-primary-800)]">
            {translate('copyright')} | 
            <Link href={`/${lang}/privacy`} className="ml-2 text-[var(--color-primary-800)] hover:text-[var(--color-primary-800)] hover:font-medium transition-all duration-200">
              {translate('privacyPolicy')}
            </Link>
            {' | '}
            <Link href={`/${lang}/terms`} className="text-[var(--color-primary-800)] hover:text-[var(--color-primary-800)] hover:font-medium transition-all duration-200">
              {translate('termsOfService')}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
} 