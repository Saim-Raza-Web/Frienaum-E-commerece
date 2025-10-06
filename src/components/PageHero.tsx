'use client';

import React from 'react';

interface PageHeroProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}

export default function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-turquoise-600 via-turquoise-500 to-primary-600" />
      {/* Decorative gradients */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

      <div className="relative text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="inline-block bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 ring-1 ring-white/20">
            <span className="text-xs tracking-wider uppercase">Feinraum</span>
          </div>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold drop-shadow-sm">{title}</h1>
          {subtitle && (
            <p className="mt-3 text-turquoise-100 max-w-2xl leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}


