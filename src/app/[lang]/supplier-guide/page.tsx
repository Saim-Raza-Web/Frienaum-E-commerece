'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/i18n/TranslationProvider';
import { Store, Package, Truck, Users, FileText, Shield, MessageCircle, Settings } from 'lucide-react';
import deTranslations from '@/i18n/locales/de/common.json';
import enTranslations from '@/i18n/locales/en/common.json';

export default function SupplierGuidePage() {
  const { translate } = useTranslation();
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'de';

  const translations = lang === 'en' ? enTranslations : deTranslations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-100 to-accent-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-montserrat font-bold text-primary-800">{translate('supplierGuideTitle')}</h1>
          <p className="mt-3 text-primary-600 font-lora max-w-2xl">{translate('supplierGuide.subtitle')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-primary-200 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Store className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-montserrat font-semibold text-primary-800">{translate('supplierGuideTitle')}</h2>
          </div>
          <p className="text-primary-600 font-lora text-lg">{translations.supplierGuide.infoList}</p>
        </div>

        {/* Sidebar */}
        <div className="mt-12 flex justify-center">
          <div className="group relative bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-primary-400 p-8 transition-all duration-300 hover:shadow-lg max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-6 h-6 text-primary-600" />
              <h3 className="text-xl font-montserrat font-semibold text-primary-800">{translate('supplierGuide.supportTitle')}</h3>
            </div>
            <p className="text-primary-600 font-lora mb-6">{translate('supplierGuide.supportBody')}</p>
            <div className="flex gap-4">
              <Link href={`/${lang}/contact`} className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md font-montserrat font-medium">{translate('contact')}</Link>
              <Link href={`/${lang}/merchant`} className="border border-primary-300 text-primary-700 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors shadow-sm hover:shadow-md font-montserrat font-medium">{translate('supplierGuide.merchantPanel')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
