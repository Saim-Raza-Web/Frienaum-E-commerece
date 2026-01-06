'use client';

import { useEffect, useState, startTransition } from 'react';

export default function HtmlWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}