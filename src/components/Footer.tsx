'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Shield } from 'lucide-react';
import SmartImage from '@/components/SmartImage';
import { useTranslation } from '@/i18n/TranslationProvider';

export default function Footer() {
  const { translate } = useTranslation();
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'de';
  return (
    <footer className="bg-red-100 text-primary-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="relative h-8 w-24 sm:h-10 sm:w-32">
                <SmartImage
                  src="/images/Logo.png"
                  alt="Feinraumshop Logo"
                  fill
                  sizes="(max-width: 640px) 96px, 128px"
                  className="object-contain"
                  style={{ filter: 'invert(37%) sepia(53%) saturate(946%) hue-rotate(336deg) brightness(90%) contrast(100%)' }}
                />
              </div>
              <span className="text-xl sm:text-2xl font-montserrat font-bold text-primary-800">Feinraumshop</span>
            </div>
            <p className="text-sm sm:text-base text-primary-700 mb-4 sm:mb-6 max-w-md font-lora leading-relaxed">
              {translate('companyDescription')}
            </p>
            <div className="flex space-x-4 sm:space-x-6">
              {/* Facebook - Update with actual URL when available */}
              <a 
                href="https://www.facebook.com/feinraumshop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-500 transition-colors duration-200 p-2 rounded-lg hover:bg-primary-100"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              {/* Instagram - Update with actual URL when available */}
              <a 
                href="https://www.instagram.com/feinraumshop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-500 transition-colors duration-200 p-2 rounded-lg hover:bg-primary-100"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              {/* Twitter - Hidden as it's not actively used */}
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
            <div className="flex w-full items-start">
              <MapPin className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1 mr-3" />
              <a 
                href="https://maps.google.com/?q=Landquartstrasse+30,+9320+Arbon,+Switzerland" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-700 font-lora hover:text-primary-800 hover:underline transition-colors"
              >
                <div className="flex flex-col">
                  <span className="block">Sandro Hauser,</span>
                  <span className="block">Landquartstrasse 30</span>
                  <span className="block">9320 Arbon, Switzerland</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-200">
          <div className="flex flex-col gap-4 text-center">
            <div className="text-primary-600 font-lora text-sm">
              {translate('copyright')}
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-primary-600 font-lora text-sm">
              <Link href={`/${lang}/privacy`} className="hover:text-primary-800 hover:font-semibold transition-all duration-200">
                {translate('privacyPolicy')}
              </Link>
              <span className="text-primary-400">|</span>
              <Link href={`/${lang}/terms`} className="hover:text-primary-800 hover:font-semibold transition-all duration-200">
                {translate('termsOfService')}
              </Link>
              <span className="text-primary-400">|</span>
              <Link href={`/${lang}/supplier-guide`} className="hover:text-primary-800 hover:font-semibold transition-all duration-200">
                {translate('supplierGuideTitle')}
              </Link>
              <span className="text-primary-400">|</span>
              <Link href={`/${lang}/customer-guide`} className="hover:text-primary-800 hover:font-semibold transition-all duration-200">
                {translate('customerGuideTitle')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 