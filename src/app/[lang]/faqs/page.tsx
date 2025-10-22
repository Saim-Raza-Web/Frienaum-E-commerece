'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/i18n/TranslationProvider';
import { ChevronDown } from 'lucide-react';

type FaqItem = {
  question: string;
  answer: string;
};

export default function FAQsPage() {
  const { translate } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    { question: translate('faqs.q1') as string, answer: translate('faqs.a1') as string },
    { question: translate('faqs.q2') as string, answer: translate('faqs.a2') as string },
    { question: translate('faqs.q3') as string, answer: translate('faqs.a3') as string },
    { question: translate('faqs.q4') as string, answer: translate('faqs.a4') as string },
    { question: translate('faqs.q5') as string, answer: translate('faqs.a5') as string },
    { question: translate('faqs.q6') as string, answer: translate('faqs.a6') as string }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-100 to-accent-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-montserrat font-bold text-primary-800">{translate('faqTitle')}</h1>
          <p className="mt-3 text-primary-600 font-lora max-w-2xl">
            Find quick answers to common questions about orders, shipping, and returns.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl border ${
                  isOpen ? 'border-primary-300' : 'border-primary-200'
                } shadow-sm transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5`}
              >
                {/* gradient accent */}
                <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl transition-all ${isOpen ? 'bg-gradient-to-b from-primary-500 to-accent-500' : 'bg-primary-200'}`} />
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left p-5"
                >
                  <span className="text-base md:text-lg font-montserrat font-semibold text-primary-800">
                    {item.question}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-primary-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`px-5 pb-5 text-primary-600 ${isOpen ? 'block' : 'hidden'}`}>
                  <div className="rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 p-4 border border-primary-100 text-sm leading-6 font-lora">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


