'use client';

import { ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  // Always render children, but with suppressHydrationWarning to prevent mismatches
  return (
    <div suppressHydrationWarning={true}>
      {children}
    </div>
  );
}