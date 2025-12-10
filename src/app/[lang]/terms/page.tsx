'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/i18n/TranslationProvider';
import { FileText, MapPin, Users, Package, DollarSign, Truck, RotateCcw, UserCheck, Shield, Mail, Database, Copyright, Edit, Gavel } from 'lucide-react';
import deTranslations from '@/i18n/locales/de/common.json';
import enTranslations from '@/i18n/locales/en/common.json';

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-montserrat font-bold text-primary-800">{translate('termsOfService')}</h1>
          <p className="mt-3 text-primary-600 font-lora max-w-2xl">{translate('terms.subtitle')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="absolute -top-2 -left-2 px-3 py-1 rounded-full text-xs bg-primary-100 text-primary-700 border border-primary-200 font-montserrat font-medium">{translate('terms.badge')}</div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.scopeTitle')}</h2>
              </div>
              <p className="text-primary-600 font-lora">{translate('terms.scopeBody')}</p>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.contractTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora" dangerouslySetInnerHTML={{ __html: translate('terms.contractBody') }} />
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.suppliersTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora" dangerouslySetInnerHTML={{ __html: translate('terms.suppliersBody') }} />
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.productsTitle')}</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-primary-600 font-lora">
                {translations.terms.productsList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.pricingTitle')}</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-primary-600 font-lora">
                {translations.terms.pricingList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.shippingTitle')}</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-primary-600 font-lora">
                {translations.terms.shippingList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <RotateCcw className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.returnsTitle')}</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-primary-600 font-lora">
                {translations.terms.returnsList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.customerObligationsTitle')}</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-primary-600 font-lora">
                {translations.terms.customerObligationsList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.liabilityTitle')}</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-primary-600 font-lora">
                {translations.terms.liabilityList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.marketingTitle')}</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-primary-600 font-lora">
                {translations.terms.marketingList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.dataProtectionTitle')}</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-primary-600 font-lora">
                {translations.terms.dataProtectionList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Copyright className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.intellectualPropertyTitle')}</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-primary-600 font-lora">
                {translations.terms.intellectualPropertyList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Edit className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.changesTitle')}</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-primary-600 font-lora">
                {translations.terms.changesList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Gavel className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.lawTitle')}</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-primary-600 font-lora">
                {translations.terms.lawList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Sidebar */}
          <div className="mt-12 flex justify-center">
            <div className="group relative bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-primary-400 p-8 transition-all duration-300 hover:shadow-lg max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.questionsTitle')}</h3>
              </div>
              <p className="text-primary-600 font-lora mb-6">{translate('terms.questionsBody')}</p>
              <div className="flex gap-4">
                <Link href={`/${lang}/help`} className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md font-montserrat font-medium">{translate('helpCenter')}</Link>
                <Link href={`/${lang}/contact`} className="border border-primary-300 text-primary-700 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors shadow-sm hover:shadow-md font-montserrat font-medium">{translate('contact')}</Link>
              </div>
            </div>
          </div>
      </div>
    </div>
  );

}
