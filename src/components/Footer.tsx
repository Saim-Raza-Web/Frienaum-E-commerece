'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';

export default function Footer() {
  const { translate } = useTranslation();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-turquoise-500 to-primary-500 rounded-lg"></div>
              <span className="text-xl font-bold">EStore</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              {translate('companyDescription')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-turquoise-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-turquoise-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-turquoise-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{translate('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/en/" className="text-gray-300 hover:text-turquoise-400 transition-colors">
                  {translate('home')}
                </Link>
              </li>
              <li>
                <Link href="/en/products" className="text-gray-300 hover:text-turquoise-400 transition-colors">
                  {translate('navigation.products')}
                </Link>
              </li>
              <li>
                <Link href="/en/categories" className="text-gray-300 hover:text-turquoise-400 transition-colors">
                  {translate('navigation.categories')}
                </Link>
              </li>
              <li>
                <Link href="/en/about" className="text-gray-300 hover:text-turquoise-400 transition-colors">
                  {translate('about')}
                </Link>
              </li>
              <li>
                <Link href="/en/contact" className="text-gray-300 hover:text-turquoise-400 transition-colors">
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
                <Link href="/help" className="text-gray-300 hover:text-turquoise-400 transition-colors">
                  {translate('helpCenter')}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-turquoise-400 transition-colors">
                  {translate('shippingInfo')}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-turquoise-400 transition-colors">
                  {translate('returns')}
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-gray-300 hover:text-turquoise-400 transition-colors">
                  {translate('sizeGuide')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-turquoise-400" />
              <span className="text-gray-300">support@estore.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-turquoise-400" />
              <span className="text-gray-300">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-turquoise-400" />
              <span className="text-gray-300">123 Commerce St, City, State</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400">
            {translate('copyright')} | 
            <Link href="/privacy" className="ml-2 text-gray-300 hover:text-turquoise-400 transition-colors">
              {translate('privacyPolicy')}
            </Link>
            {' | '}
            <Link href="/terms" className="text-gray-300 hover:text-turquoise-400 transition-colors">
              {translate('termsOfService')}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
} 