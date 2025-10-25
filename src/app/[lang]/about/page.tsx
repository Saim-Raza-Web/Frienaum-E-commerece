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
    <div className="min-h-screen bg-primary-50 overflow-x-hidden">
      {/* Hero Section */}
      <div className="bg-primary-100 overflow-hidden about-section">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-montserrat font-bold text-primary-800 mb-3 sm:mb-4 md:mb-6">
              {translate('aboutFeinraum')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary-600 font-lora max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              {translate('aboutHeroDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-montserrat font-bold text-primary-800 mb-3 sm:mb-4 md:mb-6">
                {translate('ourMission')}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-primary-600 font-lora mb-3 sm:mb-4 md:mb-6 leading-relaxed">
                {translate('missionParagraph1')}
              </p>
              <p className="text-sm sm:text-base md:text-lg text-primary-600 font-lora mb-4 sm:mb-6 leading-relaxed">
                {translate('missionParagraph2')}
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-warm" />
                  <span className="text-sm sm:text-base text-primary-700 font-lora">{translate('happyCustomers')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary-warm" />
                  <span className="text-sm sm:text-base text-primary-700 font-lora">{translate('countriesServed')}</span>
                </div>
              </div>
            </div>
            <div className="bg-primary-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-primary-warm to-primary-warm-hover rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-montserrat font-bold text-primary-800 mb-3 sm:mb-4">
                  {translate('customerCentricApproach')}
                </h3>
                <p className="text-sm sm:text-base text-primary-600 font-lora leading-relaxed">
                  {translate('customerCentricDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-primary-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-montserrat font-bold text-primary-800 mb-3 sm:mb-4">
              {translate('whyChooseFeinraum')}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-primary-600 font-lora max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              {translate('whyChooseDescription')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-primary-warm to-primary-warm-hover rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-montserrat font-semibold text-primary-800 mb-1 sm:mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-primary-600 font-lora leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-montserrat font-bold text-primary-800 mb-3 sm:mb-4">
              {translate('meetOurTeam')}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-primary-600 font-lora max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              {translate('teamDescription')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-base sm:text-lg md:text-xl lg:text-4xl font-montserrat font-bold text-primary-700">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-montserrat font-semibold text-primary-800 mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-warm font-montserrat font-medium mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">
                  {member.role}
                </p>
                <p className="text-primary-600 font-lora text-xs sm:text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-primary-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-montserrat font-bold text-primary-800 mb-3 sm:mb-4">
              {translate('ourValues')}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-primary-600 font-lora max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              {translate('valuesDescription')}
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <div className="text-center group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-20 lg:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-10 lg:h-10 text-primary-warm" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-montserrat font-semibold text-primary-800 mb-1 sm:mb-2">
                {translate('empathy')}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-primary-600 font-lora leading-relaxed">
                {translate('empathyDescription')}
              </p>
            </div>

            <div className="text-center group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-20 lg:h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-10 lg:h-10 text-accent-600" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-montserrat font-semibold text-primary-800 mb-1 sm:mb-2">
                {translate('excellence')}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-primary-600 font-lora leading-relaxed">
                {translate('excellenceDescription')}
              </p>
            </div>

            <div className="text-center group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-20 lg:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-10 lg:h-10 text-primary-warm" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-montserrat font-semibold text-primary-800 mb-1 sm:mb-2">
                {translate('community')}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-primary-600 font-lora leading-relaxed">
                {translate('communityDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-primary-600 to-accent-600 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center px-3 sm:px-4 md:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-montserrat font-bold text-white mb-3 sm:mb-4">
            {translate('readyToExperience')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-primary-100 font-lora mb-4 sm:mb-6 md:mb-8 leading-relaxed px-2 sm:px-0">
            {translate('ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link
              href={`/${lang}/products`}
              className="btn-primary px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base whitespace-nowrap text-center"
            >
              {translate('startShopping')}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="px-6 sm:px-8 py-2 sm:py-3 bg-transparent border-2 border-white text-white font-montserrat font-semibold rounded-lg hover:bg-white hover:text-orange-500 transition-all duration-300 focus:outline-none text-sm sm:text-base whitespace-nowrap text-center"
            >
              {translate('contactUs')}
            </Link>
          </div>
        </div>
      </div>
      {/* Additional CSS for complete horizontal scroll prevention */}
      <style jsx>{`
        .about-section {
          max-width: 100vw;
          overflow-x: hidden;
        }

        /* Ensure all gradient backgrounds are contained */
        .contained-gradient {
          background-attachment: fixed;
          background-size: cover;
        }

        /* Mobile-first approach for all elements */
        @media (max-width: 767px) {
          .mobile-container {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }

          .mobile-card {
            margin-left: 0;
            margin-right: 0;
          }
        }
      `}</style>
    </div>
  );
}
