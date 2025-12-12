'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/i18n/TranslationProvider';
import { Shield, Building, Database, Target, Share, Cookie, Archive, Users, Lock, FileText } from 'lucide-react';
import deTranslations from '@/i18n/locales/de/common.json';
import enTranslations from '@/i18n/locales/en/common.json';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-montserrat font-bold text-primary-800">{translate('privacyPolicy')}</h1>
          <p className="mt-3 text-primary-600 font-lora max-w-2xl">{translate('privacy.subtitle')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="absolute -top-2 -left-2 px-3 py-1 rounded-full text-xs bg-primary-100 text-primary-700 border border-primary-200 font-montserrat font-medium">{translate('privacy.badge')}</div>
              <div className="flex items-center gap-2 mb-3">
                <Building className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.responsibleTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora" dangerouslySetInnerHTML={{ __html: translate('privacy.responsibleBody') }} />
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.dataTitle')}</h2>
              </div>
              <p className="text-primary-600 font-lora">{translations.privacy.dataList}</p>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.purposesTitle')}</h2>
              </div>
              <p className="text-primary-600 font-lora">{translations.privacy.purposesList}</p>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Share className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.sharingTitle')}</h2>
              </div>
              <p className="text-primary-600 font-lora">{translations.privacy.sharingList}</p>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Cookie className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.cookiesTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora" dangerouslySetInnerHTML={{ __html: translate('privacy.cookiesBody') }} />
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Archive className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.storageTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora" dangerouslySetInnerHTML={{ __html: translate('privacy.storageBody') }} />
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.rightsTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora" dangerouslySetInnerHTML={{ __html: translate('privacy.rightsBody') }} />
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.securityTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora" dangerouslySetInnerHTML={{ __html: translate('privacy.securityBody') }} />
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.changesTitle')}</h2>
              </div>
              <p className="text-primary-600 font-lora">{translate('privacy.changesBody')}</p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="mt-12 flex justify-center">
            <div className="group relative bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-primary-400 p-8 transition-all duration-300 hover:shadow-lg max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.needHelpTitle')}</h3>
              </div>
              <p className="text-primary-600 font-lora mb-6">{translate('privacy.needHelpBody')}</p>
              <div className="flex gap-4">
                <Link href={`/${lang}/help`} className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md font-montserrat font-medium">{translate('helpCenter')}</Link>
                <Link href={`/${lang}/contact`} className="border border-primary-300 text-primary-700 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors shadow-sm hover:shadow-md font-montserrat font-medium">{translate('contact')}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


