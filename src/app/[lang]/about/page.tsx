'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Award, Globe, Heart, Shield, Truck } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';

export default function AboutPage() {
  const { translate } = useTranslation();
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'en';
  
  const features = [
    {
      icon: Shield,
      title: translate('secureShopping'),
      description: translate('secureShoppingDesc')
    },
    {
      icon: Truck,
      title: translate('fastDelivery'),
      description: translate('fastDeliveryDesc')
    },
    {
      icon: Heart,
      title: translate('customerFirst'),
      description: translate('customerFirstDesc')
    },
    {
      icon: Award,
      title: translate('qualityAssured'),
      description: translate('qualityAssuredDesc')
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: translate('ceoFounder'),
      image: '/api/placeholder/150/150',
      bio: translate('sarahBio')
    },
    {
      name: 'Michael Chen',
      role: translate('cto'),
      image: '/api/placeholder/150/150',
      bio: translate('michaelBio')
    },
    {
      name: 'Emily Rodriguez',
      role: translate('headOfDesign'),
      image: '/api/placeholder/150/150',
      bio: translate('emilyBio')
    },
    {
      name: 'David Kim',
      role: translate('headOfOperations'),
      image: '/api/placeholder/150/150',
      bio: translate('davidBio')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-100 to-accent-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-primary-800 mb-6">
              {translate('aboutFeinraum')}
            </h1>
            <p className="text-xl md:text-2xl text-primary-600 font-lora max-w-3xl mx-auto leading-relaxed">
              {translate('aboutHeroDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-montserrat font-bold text-primary-800 mb-6">
                {translate('ourMission')}
              </h2>
              <p className="text-lg text-primary-600 font-lora mb-6 leading-relaxed">
                {translate('missionParagraph1')}
              </p>
              <p className="text-lg text-primary-600 font-lora mb-6 leading-relaxed">
                {translate('missionParagraph2')}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary-warm" />
                  <span className="text-primary-700 font-lora">{translate('happyCustomers')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-primary-warm" />
                  <span className="text-primary-700 font-lora">{translate('countriesServed')}</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8 shadow-lg">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-primary-warm to-primary-warm-hover rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Heart className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-montserrat font-bold text-primary-800 mb-4">
                  {translate('customerCentricApproach')}
                </h3>
                <p className="text-primary-600 font-lora leading-relaxed">
                  {translate('customerCentricDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-montserrat font-bold text-primary-800 mb-4">
              {translate('whyChooseFeinraum')}
            </h2>
            <p className="text-lg text-primary-600 font-lora max-w-2xl mx-auto leading-relaxed">
              {translate('whyChooseDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-warm to-primary-warm-hover rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-montserrat font-semibold text-primary-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-primary-600 font-lora text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-montserrat font-bold text-primary-800 mb-4">
              {translate('meetOurTeam')}
            </h2>
            <p className="text-lg text-primary-600 font-lora max-w-2xl mx-auto leading-relaxed">
              {translate('teamDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="w-32 h-32 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-4xl font-montserrat font-bold text-primary-700">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-montserrat font-semibold text-primary-800 mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-warm font-montserrat font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-primary-600 font-lora text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-montserrat font-bold text-primary-800 mb-4">
              {translate('ourValues')}
            </h2>
            <p className="text-lg text-primary-600 font-lora max-w-2xl mx-auto leading-relaxed">
              {translate('valuesDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Heart className="w-10 h-10 text-primary-warm" />
              </div>
              <h3 className="text-xl font-montserrat font-semibold text-primary-800 mb-2">
                {translate('empathy')}
              </h3>
              <p className="text-primary-600 font-lora leading-relaxed">
                {translate('empathyDescription')}
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Award className="w-10 h-10 text-accent-600" />
              </div>
              <h3 className="text-xl font-montserrat font-semibold text-primary-800 mb-2">
                {translate('excellence')}
              </h3>
              <p className="text-primary-600 font-lora leading-relaxed">
                {translate('excellenceDescription')}
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Users className="w-10 h-10 text-primary-warm" />
              </div>
              <h3 className="text-xl font-montserrat font-semibold text-primary-800 mb-2">
                {translate('community')}
              </h3>
              <p className="text-primary-600 font-lora leading-relaxed">
                {translate('communityDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-montserrat font-bold text-white mb-4">
            {translate('readyToExperience')}
          </h2>
          <p className="text-xl text-primary-100 font-lora mb-8 leading-relaxed">
            {translate('ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${lang}/products`}
              className="btn-primary px-8 py-3"
            >
              {translate('startShopping')}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-montserrat font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-300 focus:outline-none"
            >
              {translate('contactUs')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
