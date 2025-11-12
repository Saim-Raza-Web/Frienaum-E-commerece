'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';
import PageHero from '@/components/PageHero';
import SectionCard from '@/components/SectionCard';

export default function ContactPage() {
  const { translate } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      alert(translate('thankYouMessage'));
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact form submission error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: translate('visitUs'),
      details: [
        'Sandro Hauser',
        'Landquartstrasse 30',
        '9320 Arbon',
        'Switzerland'
      ],
      color: 'text-primary-warm',
      clickable: true,
      mapUrl: 'https://maps.google.com/?q=Landquartstrasse+30,+9320+Arbon,+Switzerland'
    },
    {
      icon: Phone,
      title: translate('callUs'),
      details: ['+41 76 430 87 18'],
      color: 'text-primary-600'
    },
    {
      icon: Mail,
      title: translate('emailUs'),
      details: ['support@feinraumshop.ch'],
      color: 'text-primary-warm'
    },
    {
      icon: Clock,
      title: translate('businessHours'),
      details: [translate('businessHoursWeekdays'), translate('businessHoursWeekend')],
      color: 'text-primary-600'
    }
  ];

  const subjects = [
    translate('generalInquiry'),
    translate('technicalSupport'),
    translate('billingQuestion'),
    translate('partnershipOpportunity'),
    translate('productFeedback'),
    translate('other')
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero title={translate('ContactUs')} subtitle={translate('contactSubtitle')} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <SectionCard title={translate('sendMessage')}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {translate('fullName')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder={translate('enterFullName')}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {translate('emailAddress')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder={translate('enterEmail')}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {translate('subject')} *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">{translate('selectSubject')}</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {translate('message')} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="input-field resize-none"
                  placeholder={translate('messagePlaceholder')}
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{translate('sending')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>{translate('sendMessageButton')}</span>
                  </>
                )}
              </button>
            </form>
          </SectionCard>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{translate('getInTouch')}</h2>
              <p className="text-gray-600 mb-8">
                {translate('contactDescription')}
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info, idx) => (
                <div key={idx} className="flex items-start space-x-4 bg-turquoise-50 border border-turquoise-300 rounded-lg shadow px-4 py-5 mb-3">
                  <div className="pt-1">{info.icon && <info.icon className={`w-6 h-6 ${info.color || 'text-primary-600'}`} />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-primary-800 mb-0.5">{info.title}</div>
                    {Array.isArray(info.details) && info.details.map((d, i) => (
                      <div key={i} className="text-sm text-primary-800 leading-tight">{d}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <SectionCard title={translate('faqTitle')}>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{translate('shippingQuestion')} — {translate('shippingAnswer')}</p>
                <p>{translate('returnPolicyQuestion')} — {translate('returnPolicyAnswer')}</p>
                <p>{translate('internationalShippingQuestion')} — {translate('internationalShippingAnswer')}</p>
              </div>
            </SectionCard>
          </div>
        </div>

      </div>
    </div>
  );
}
