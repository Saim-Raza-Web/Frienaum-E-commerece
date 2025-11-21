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
  const lang = segments[1] || 'de';

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-100 to-accent-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-montserrat font-bold text-primary-800">{translate('termsOfService')}</h1>
          <p className="mt-3 text-primary-600 font-lora max-w-2xl">{translate('terms.subtitle')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.acceptanceTitle')}</h2>
            </div>
            <p className="text-primary-600 font-lora">{translate('terms.acceptanceBody')}</p>
          </section>
          <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.accountsTitle')}</h2>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-primary-600 font-lora">
              <li>{translate('terms.accountsItem1')}</li>
              <li>{translate('terms.accountsItem2')}</li>
              <li>{translate('terms.accountsItem3')}</li>
            </ul>
          </section>
          <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.ordersTitle')}</h2>
            </div>
            <p className="text-primary-600 font-lora">{translate('terms.ordersBody')}</p>
          </section>
          <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.liabilityTitle')}</h2>
            </div>
            <p className="text-primary-600 font-lora">{translate('terms.liabilityBody')}</p>
          </section>
            <div className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.questionsTitle')}</h2>
            </div>
            <p className="text-primary-600 font-lora mb-4">
              {translate('terms.questionsBody')}
            </p>
            <div className="flex gap-3">
              <Link href={`/${lang}/help`} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md font-montserrat font-medium">
                {translate('helpCenter')}
              </Link>
              <Link href={`/${lang}/contact`} className="border border-primary-300 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors shadow-sm hover:shadow-md font-montserrat font-medium">
                {translate('contact')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}
