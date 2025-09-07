'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';

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
      icon: Mail,
      title: translate('emailUs'),
      details: ['support@shopease.com', 'business@shopease.com'],
      color: 'text-turquoise-600'
    },
    {
      icon: Phone,
      title: translate('callUs'),
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
      color: 'text-primary-600'
    },
    {
      icon: MapPin,
      title: translate('visitUs'),
      details: ['123 Commerce St', 'San Francisco, CA 94105'],
      color: 'text-turquoise-600'
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">{translate('contactUs')}</h1>
          <p className="mt-2 text-gray-600">{translate('contactSubtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-turquoise-500 to-primary-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{translate('sendMessage')}</h2>
            </div>
            
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
                className="w-full bg-gradient-to-r from-turquoise-600 to-primary-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-turquoise-700 hover:to-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{translate('getInTouch')}</h2>
              <p className="text-gray-600 mb-8">
                {translate('contactDescription')}
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 ${info.color}`}>
                    <info.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                    {info.details.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-gray-600 text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="bg-gradient-to-br from-turquoise-50 to-primary-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{translate('faqTitle')}</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{translate('shippingQuestion')}</h4>
                  <p className="text-gray-600 text-sm">{translate('shippingAnswer')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{translate('returnPolicyQuestion')}</h4>
                  <p className="text-gray-600 text-sm">{translate('returnPolicyAnswer')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{translate('internationalShippingQuestion')}</h4>
                  <p className="text-gray-600 text-sm">{translate('internationalShippingAnswer')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{translate('ourLocation')}</h2>
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{translate('mapPlaceholder')}</p>
                <p className="text-sm text-gray-500">123 Commerce St, San Francisco, CA 94105</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
