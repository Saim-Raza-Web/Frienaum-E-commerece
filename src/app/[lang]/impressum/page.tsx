'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/i18n/TranslationProvider';

export default function ImpressumPage() {
  const { translate } = useTranslation();
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'de';

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-2xl sm:text-3xl font-montserrat font-bold text-primary-800 mb-6">
          {translate('imprint')}
        </h1>
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 space-y-6">
          <section>
            <h2 className="text-xl font-montserrat font-semibold text-primary-800 mb-2">Sandro Hauser</h2>
            <div className="text-primary-700 font-lora space-y-1">
              <p>Landquartstrasse 30</p>
              <p>9320 Arbon</p>
              <p>Schweiz</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-montserrat font-semibold text-primary-800 mb-2">{translate('contact')}</h3>
            <div className="text-primary-700 font-lora space-y-1">
              <p>E-Mail: support@feinraumshop.ch</p>
              <p>Telefon: +41 76 430 87 18</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


