'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/i18n/TranslationProvider';
import { Shield, ListChecks, ClipboardCheck, UserCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { translate } = useTranslation();
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'en';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-turquoise-600 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold">{translate('privacyPolicy')}</h1>
          <p className="mt-3 text-turquoise-100 max-w-2xl">{translate('privacy.subtitle')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:border-turquoise-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-turquoise-300 transition-all duration-300 pointer-events-none" />
              <div className="absolute -top-2 -left-2 px-3 py-1 rounded-full text-xs bg-turquoise-100 text-turquoise-700 border border-turquoise-200">{translate('privacy.badge')}</div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-turquoise-600" />
                <h2 className="text-xl font-semibold text-gray-900">{translate('privacy.overviewTitle')}</h2>
              </div>
              <p className="text-gray-700">{translate('privacy.overviewBody')}</p>
            </section>
            <section className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:border-turquoise-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-turquoise-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="w-5 h-5 text-turquoise-600" />
                <h2 className="text-xl font-semibold text-gray-900">{translate('privacy.collectTitle')}</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>{translate('privacy.collectItem1')}</li>
                <li>{translate('privacy.collectItem2')}</li>
                <li>{translate('privacy.collectItem3')}</li>
                <li>{translate('privacy.collectItem4')}</li>
              </ul>
            </section>
            <section className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:border-turquoise-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-turquoise-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <ClipboardCheck className="w-5 h-5 text-turquoise-600" />
                <h2 className="text-xl font-semibold text-gray-900">{translate('privacy.useTitle')}</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>{translate('privacy.useItem1')}</li>
                <li>{translate('privacy.useItem2')}</li>
                <li>{translate('privacy.useItem3')}</li>
                <li>{translate('privacy.useItem4')}</li>
              </ul>
            </section>
            <section className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:border-turquoise-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-turquoise-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="w-5 h-5 text-turquoise-600" />
                <h2 className="text-xl font-semibold text-gray-900">{translate('privacy.rightsTitle')}</h2>
              </div>
              <p className="text-gray-700">{translate('privacy.rightsBody')}</p>
            </section>
          </div>
          <aside className="space-y-4">
            <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:border-turquoise-400 hover:shadow-lg">
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-turquoise-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-turquoise-600" />
                <h3 className="text-lg font-semibold text-gray-900">{translate('privacy.needHelpTitle')}</h3>
              </div>
              <p className="text-gray-700 mb-3">{translate('privacy.needHelpBody')}</p>
              <div className="flex gap-3 mt-4">
                <Link href={`/${lang}/help`} className="bg-turquoise-600 text-white px-4 py-2 rounded-lg hover:bg-turquoise-700 transition-colors shadow-sm hover:shadow-md">Help Center</Link>
                <Link href={`/${lang}/contact`} className="border border-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md">Contact</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


