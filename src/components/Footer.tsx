'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Shield, Lock } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';

export default function Footer() {
  const { translate } = useTranslation();
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'en';
  return (
    <footer className="bg-primary-50 text-primary-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <img 
              src="/images/Logo.png" 
              alt="Feinraumshop Logo" 
              className="h-8 w-auto sm:h-10"
              style={{ filter: 'invert(37%) sepia(53%) saturate(946%) hue-rotate(336deg) brightness(90%) contrast(100%)' }}
            />
            <span className="text-xl sm:text-2xl font-montserrat font-bold text-primary-800">Feinraumshop</span>
            </div>
            <p className="text-sm sm:text-base text-primary-700 mb-4 sm:mb-6 max-w-md font-lora leading-relaxed">
              {translate('companyDescription')}
            </p>
            <div className="flex space-x-4 sm:space-x-6">
              <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors duration-200 p-2 rounded-lg hover:bg-primary-100">
                <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors duration-200 p-2 rounded-lg hover:bg-primary-100">
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors duration-200 p-2 rounded-lg hover:bg-primary-100">
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-montserrat font-semibold mb-4 sm:mb-6 text-primary-800">{translate('quickLinks')}</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href={`/${lang}/`} className="text-primary-600 hover:text-primary-800 hover:font-semibold font-lora transition-all duration-200">
                  {translate('home')}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/products`} className="text-primary-600 hover:text-primary-800 hover:font-semibold font-lora transition-all duration-200">
                  {translate('navigation.products')}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/categories`} className="text-primary-600 hover:text-primary-800 hover:font-semibold font-lora transition-all duration-200">
                  {translate('navigation.categories')}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/about`} className="text-primary-600 hover:text-primary-800 hover:font-semibold font-lora transition-all duration-200">
                  {translate('about')}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/contact`} className="text-primary-600 hover:text-primary-800 hover:font-semibold font-lora transition-all duration-200">
                  {translate('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-montserrat font-semibold mb-6 text-primary-800">{translate('customerService')}</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${lang}/help`} className="text-primary-600 hover:text-primary-800 hover:font-semibold font-lora transition-all duration-200">
                  {translate('helpCenter')}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/faqs`} className="text-primary-600 hover:text-primary-800 hover:font-semibold font-lora transition-all duration-200">
                  {translate('faqTitle')}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/impressum`} className="text-primary-600 hover:text-primary-800 hover:font-semibold font-lora transition-all duration-200">
                  {translate('imprint')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-primary-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-4">
              <Mail className="w-6 h-6 text-primary-600" />
              <a href="mailto:support@feinraumshop.ch" className="text-primary-700 font-lora hover:text-primary-800 hover:underline transition-colors">
                support@feinraumshop.ch
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="w-6 h-6 text-primary-600" />
              <a href="tel:+41764308718" className="text-primary-700 font-lora hover:text-primary-800 hover:underline transition-colors">
                +41 76 430 87 18
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <MapPin className="w-6 h-6 text-primary-600" />
              <a 
                href="https://maps.google.com/?q=Landquartstrasse+30,+9320+Arbon,+Switzerland" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-700 font-lora hover:text-primary-800 hover:underline transition-colors"
              >
                <p>Sandro Hauser</p>
                <p>Landquartstrasse 30</p>
                <p>9320 Arbon, Switzerland</p>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-600 font-lora">
              {translate('copyright')} | 
              <Link href={`/${lang}/privacy`} className="ml-2 text-primary-600 hover:text-primary-800 hover:font-semibold transition-all duration-200">
                {translate('privacyPolicy')}
              </Link>
              {' | '}
              <Link href={`/${lang}/terms`} className="text-primary-600 hover:text-primary-800 hover:font-semibold transition-all duration-200">
                {translate('termsOfService')}
              </Link>
            </p>
            
            {/* SSL Security Indicator */}
            <div className="flex items-center gap-2 text-trust-600 bg-trust-50 px-3 py-2 rounded-lg">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium font-montserrat">SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 