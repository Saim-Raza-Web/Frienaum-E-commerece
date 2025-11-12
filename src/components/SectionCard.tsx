'use client';

import React from 'react';

interface SectionCardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function SectionCard({ title, children, footer, className = '' }: SectionCardProps) {
  return (
    <section className={`group relative rounded-2xl shadow-lg border-2 border-turquoise-200 bg-white/95 ${className}`}>
      {/* Gradient ring border */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-turquoise-100 to-primary-100 opacity-60 blur-[1.5px] transition-opacity group-hover:opacity-100" />
      <div className="relative bg-white rounded-2xl shadow-sm border border-white/60 transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-0.5">
        {/* top accent bar */}
        <div className="pointer-events-none absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-turquoise-500/60 to-primary-500/60 rounded-t-2xl" />
        <div className="p-8">
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <span className="text-xs px-3 py-1 rounded-full bg-turquoise-50 text-turquoise-700 border border-turquoise-200 shadow inline-block font-bold">Info</span>
            </div>
          )}
          <div className="text-gray-700 text-base font-lora leading-relaxed">
            {children}
          </div>
        </div>
        {footer && (
          <div className="px-8 pb-8">{footer}</div>
        )}
      </div>
    </section>
  );
}


