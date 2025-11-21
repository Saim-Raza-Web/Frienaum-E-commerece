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
  const lang = segments[1] || 'de';

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-100 to-accent-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-montserrat font-bold text-primary-800">{translate('privacyPolicy')}</h1>
          <p className="mt-3 text-primary-600 font-lora max-w-2xl">{translate('privacy.subtitle')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="absolute -top-2 -left-2 px-3 py-1 rounded-full text-xs bg-primary-100 text-primary-700 border border-primary-200 font-montserrat font-medium">{translate('privacy.badge')}</div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.overviewTitle')}</h2>
              </div>
              <p className="text-primary-600 font-lora">{translate('privacy.overviewBody')}</p>
            </section>
            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.collectTitle')}</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-primary-600 font-lora">
                <li>{translate('privacy.collectItem1')}</li>
                <li>{translate('privacy.collectItem2')}</li>
                <li>{translate('privacy.collectItem3')}</li>
                <li>{translate('privacy.collectItem4')}</li>
              </ul>
            </section>
            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <ClipboardCheck className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.useTitle')}</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-primary-600 font-lora">
                <li>{translate('privacy.useItem1')}</li>
                <li>{translate('privacy.useItem2')}</li>
                <li>{translate('privacy.useItem3')}</li>
                <li>{translate('privacy.useItem4')}</li>
              </ul>
            </section>
            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.rightsTitle')}</h2>
              </div>
              <p className="text-primary-600 font-lora">{translate('privacy.rightsBody')}</p>
            </section>
          </div>
          <aside className="space-y-4">
            <div className="group relative bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-primary-400 p-6 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-montserrat font-semibold text-primary-800">{translate('privacy.needHelpTitle')}</h3>
              </div>
              <p className="text-primary-600 font-lora mb-3">{translate('privacy.needHelpBody')}</p>
              <div className="flex gap-3 mt-4">
                <Link href={`/${lang}/help`} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md font-montserrat font-medium">Help Center</Link>
                <Link href={`/${lang}/contact`} className="border border-primary-300 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors shadow-sm hover:shadow-md font-montserrat font-medium">Contact</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


