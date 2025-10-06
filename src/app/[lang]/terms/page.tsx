'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/i18n/TranslationProvider';
import { FileText, User, CreditCard, ShieldAlert } from 'lucide-react';

export default function TermsOfServicePage() {
  const { translate } = useTranslation();
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'en';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-turquoise-600 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold">{translate('termsOfService')}</h1>
          <p className="mt-3 text-turquoise-100 max-w-2xl">{translate('terms.subtitle')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <section className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:border-turquoise-400 hover:shadow-lg">
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-turquoise-300 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-turquoise-600" />
              <h2 className="text-xl font-semibold text-gray-900">{translate('terms.acceptanceTitle')}</h2>
            </div>
            <p className="text-gray-700">{translate('terms.acceptanceBody')}</p>
          </section>
          <section className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:border-turquoise-400 hover:shadow-lg">
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-turquoise-300 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-turquoise-600" />
              <h2 className="text-xl font-semibold text-gray-900">{translate('terms.accountsTitle')}</h2>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>{translate('terms.accountsItem1')}</li>
              <li>{translate('terms.accountsItem2')}</li>
              <li>{translate('terms.accountsItem3')}</li>
            </ul>
          </section>
          <section className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:border-turquoise-400 hover:shadow-lg">
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-turquoise-300 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-turquoise-600" />
              <h2 className="text-xl font-semibold text-gray-900">{translate('terms.ordersTitle')}</h2>
            </div>
            <p className="text-gray-700">{translate('terms.ordersBody')}</p>
          </section>
          <section className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:border-turquoise-400 hover:shadow-lg">
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-turquoise-300 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-turquoise-600" />
              <h2 className="text-xl font-semibold text-gray-900">{translate('terms.liabilityTitle')}</h2>
            </div>
            <p className="text-gray-700">{translate('terms.liabilityBody')}</p>
          </section>
            <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:border-turquoise-400 hover:shadow-lg">
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-turquoise-300 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-turquoise-600" />
              <h2 className="text-xl font-semibold text-gray-900">{translate('terms.questionsTitle')}</h2>
            </div>
            <p className="text-gray-700 mb-4">
              {translate('terms.questionsBody')}
            </p>
            <div className="flex gap-3">
              <Link href={`/${lang}/help`} className="bg-turquoise-600 text-white px-4 py-2 rounded-lg hover:bg-turquoise-700 transition-colors shadow-sm hover:shadow-md">
                {translate('helpCenter')}
              </Link>
              <Link href={`/${lang}/contact`} className="border border-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md">
                {translate('contact')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}
