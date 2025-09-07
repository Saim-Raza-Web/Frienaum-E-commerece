'use client';

import React from 'react';
import { Users, Award, Globe, Heart, Shield, Truck } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';

export default function AboutPage() {
  const { translate } = useTranslation();
  
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-turquoise-600 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {translate('aboutFeinraum')}
            </h1>
            <p className="text-xl md:text-2xl text-turquoise-100 max-w-3xl mx-auto">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {translate('ourMission')}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {translate('missionParagraph1')}
              </p>
              <p className="text-lg text-gray-600 mb-6">
                {translate('missionParagraph2')}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-turquoise-600" />
                  <span className="text-gray-700">{translate('happyCustomers')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-turquoise-600" />
                  <span className="text-gray-700">{translate('countriesServed')}</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-turquoise-100 to-primary-100 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-turquoise-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {translate('customerCentricApproach')}
                </h3>
                <p className="text-gray-600">
                  {translate('customerCentricDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {translate('whyChooseFeinraum')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {translate('whyChooseDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-turquoise-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {translate('meetOurTeam')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {translate('teamDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-turquoise-200 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold text-gray-600">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-turquoise-600 font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-gradient-to-r from-turquoise-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {translate('ourValues')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {translate('valuesDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-turquoise-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-turquoise-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {translate('empathy')}
              </h3>
              <p className="text-gray-600">
                {translate('empathyDescription')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {translate('excellence')}
              </h3>
              <p className="text-gray-600">
                {translate('excellenceDescription')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-turquoise-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-turquoise-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {translate('community')}
              </h3>
              <p className="text-gray-600">
                {translate('communityDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-turquoise-600 to-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            {translate('readyToExperience')}
          </h2>
          <p className="text-xl text-turquoise-100 mb-8">
            {translate('ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/products"
              className="bg-white text-turquoise-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {translate('startShopping')}
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-turquoise-600 transition-colors"
            >
              {translate('contactUs')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
