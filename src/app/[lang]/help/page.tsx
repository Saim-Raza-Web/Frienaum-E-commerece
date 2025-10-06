'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/i18n/TranslationProvider';
import { HelpCircle, Shield, FileText } from 'lucide-react';

export default function HelpCenterPage() {
  const { translate } = useTranslation();
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'en';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-turquoise-600 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold">{translate('helpCenter')}</h1>
          <p className="mt-3 text-turquoise-100 max-w-2xl">{translate('help.subtitle')}</p>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <Link href={`/${lang}/faqs`} className="group relative rounded-2xl overflow-hidden block h-full">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-turquoise-300 to-primary-300 opacity-25 transition-opacity duration-200 group-hover:opacity-45" />
            {/* decorative shine */}
            <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 bg-white/20 blur-2xl rounded-full" />
            <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-full transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1 group-hover:ring-1 group-hover:ring-turquoise-300 flex flex-col">
              <HelpCircle className="w-8 h-8 text-turquoise-600 mb-3" />
              <h2 className="text-xl font-semibold text-gray-900">{translate('faqTitle')}</h2>
              <p className="text-gray-700 mt-2 flex-1">{translate('help.cardFaqDesc')}</p>
              <span className="inline-flex items-center gap-1 mt-4 text-turquoise-600 group-hover:underline">View FAQs</span>
            </div>
          </Link>
          <Link href={`/${lang}/privacy`} className="group relative rounded-2xl overflow-hidden block h-full">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-turquoise-300 to-primary-300 opacity-25 transition-opacity duration-200 group-hover:opacity-45" />
            <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 bg-white/20 blur-2xl rounded-full" />
            <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-full transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1 group-hover:ring-1 group-hover:ring-turquoise-300 flex flex-col">
              <Shield className="w-8 h-8 text-turquoise-600 mb-3" />
              <h2 className="text-xl font-semibold text-gray-900">{translate('privacyPolicy')}</h2>
              <p className="text-gray-700 mt-2 flex-1">{translate('help.cardPrivacyDesc')}</p>
              <span className="inline-flex items-center gap-1 mt-4 text-turquoise-600 group-hover:underline">Read Policy</span>
            </div>
          </Link>
          <Link href={`/${lang}/terms`} className="group relative rounded-2xl overflow-hidden block h-full">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-turquoise-300 to-primary-300 opacity-25 transition-opacity duration-200 group-hover:opacity-45" />
            <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 bg-white/20 blur-2xl rounded-full" />
            <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-full transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1 group-hover:ring-1 group-hover:ring-turquoise-300 flex flex-col">
              <FileText className="w-8 h-8 text-turquoise-600 mb-3" />
              <h2 className="text-xl font-semibold text-gray-900">{translate('termsOfService')}</h2>
              <p className="text-gray-700 mt-2 flex-1">{translate('help.cardTermsDesc')}</p>
              <span className="inline-flex items-center gap-1 mt-4 text-turquoise-600 group-hover:underline">View Terms</span>
            </div>
          </Link>
        </div>

        <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">{translate('help.stillNeedHelpTitle')}</h2>
          <p className="text-gray-700 mt-2">{translate('help.stillNeedHelpDesc')}</p>
          <div className="mt-4 flex gap-3">
            <Link href={`/${lang}/contact`} className="bg-turquoise-600 text-white px-4 py-2 rounded-lg hover:bg-turquoise-700 transition-colors">{translate('contact')}</Link>
            <a href="mailto:support@estore.com" className="border border-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">{translate('help.emailSupport')}</a>
          </div>
        </div>
      </div>
    </div>
  );
}


