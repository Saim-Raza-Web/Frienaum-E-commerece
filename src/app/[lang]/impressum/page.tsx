'use client';

import React from 'react';
import { useTranslation } from '@/i18n/TranslationProvider';

export default function ImpressumPage() {
  const { translate } = useTranslation();

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-2xl sm:text-3xl font-montserrat font-bold text-primary-800 mb-6">
          {translate('imprint')}
        </h1>
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-montserrat font-semibold text-primary-800 mb-2">
              {translate('imprintCompanyHeading')}
            </h2>
            <div className="text-primary-700 font-lora space-y-1">
              <p>{translate('imprintCompanyDescription')}</p>
              <p className="font-semibold mt-2">{translate('imprintAddressLabel')}</p>
              <p>{translate('imprintAddressLine1')}</p>
              <p>{translate('imprintAddressLine2')}</p>
              <p>{translate('imprintAddressLine3')}</p>
              <p className="mt-3">{translate('imprintVat')}</p>
              <p>{translate('imprintCommercialRegister')}</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-montserrat font-semibold text-primary-800 mb-2">{translate('contact')}</h3>
            <div className="text-primary-700 font-lora space-y-1">
              <p>E-Mail: support@feinraumshop.ch</p>
              <p>Telefon: +41 76 430 87 18</p>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 border border-primary-100 rounded-lg shadow-sm bg-primary-50/40">
              <h4 className="text-lg font-montserrat font-semibold text-primary-800 mb-2">
                {translate('imprintLegalCHTitle')}
              </h4>
              <p className="text-primary-700 font-lora leading-relaxed">
                {translate('imprintLegalCHBody')}
              </p>
            </div>
            <div className="p-4 border border-primary-100 rounded-lg shadow-sm bg-primary-50/40">
              <h4 className="text-lg font-montserrat font-semibold text-primary-800 mb-2">
                {translate('imprintLegalLITitle')}
              </h4>
              <p className="text-primary-700 font-lora leading-relaxed">
                {translate('imprintLegalLIBody')}
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 border border-primary-100 rounded-lg shadow-sm">
              <h4 className="text-lg font-montserrat font-semibold text-primary-800 mb-2">
                {translate('imprintRepresentativeTitle')}
              </h4>
              <p className="text-primary-700 font-lora leading-relaxed">
                {translate('imprintRepresentativeBody')}
              </p>
            </div>
            <div className="p-4 border border-primary-100 rounded-lg shadow-sm">
              <h4 className="text-lg font-montserrat font-semibold text-primary-800 mb-2">
                {translate('imprintDataTitle')}
              </h4>
              <p className="text-primary-700 font-lora leading-relaxed">
                {translate('imprintDataBody')}
              </p>
              <p className="text-primary-600 font-lora text-sm mt-2">
                {translate('imprintTransparency')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


