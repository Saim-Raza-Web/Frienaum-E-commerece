'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n/TranslationProvider';
import {
  Home,
  LogOut,
  Menu,
  X,
  UserCircle,
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tab: 'overview' | 'products' | 'orders';
}

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { translate } = useTranslation();
  const { logout } = useAuth();

  const lang = pathname?.split('/')?.[1] || 'de';
  const navigation: NavigationItem[] = [
    { name: 'merchant.dashboard', href: `/${lang}/merchant?tab=overview`, icon: Home, tab: 'overview' },
  ];

  const isActive = (item: NavigationItem) => {
    const currentTab = searchParams?.get('tab') || 'overview';
    return pathname?.startsWith(`/${lang}/merchant`) && currentTab === item.tab;
  };

  const handleLogout = async () => {
    setSidebarOpen(false);
    // Navigate to main page first to unmount any protected merchant routes
    try { sessionStorage.setItem('logoutRedirect', '1'); } catch {}
    router.replace(`/${lang}`);
    // Defer logout to next tick to avoid race with ProtectedRoute redirects
    setTimeout(() => {
      logout();
    }, 300);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 transform overflow-y-auto bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 flex-shrink-0 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-primary-800">{translate('merchant.dashboard')}</h1>
            <button
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="merchant-layout-sidebar flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md ${
                  isActive(item)
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                } transition-colors duration-200`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive(item) ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {translate(item.name)}
                {isActive(item) && (
                  <span className="ml-auto w-1 h-6 bg-primary-700 rounded-l-md"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="mt-auto border-t border-gray-200 p-4">
            <div className="group block w-full">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <UserCircle className="h-6 w-6" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {translate('merchant.merchantAccount')}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    {translate('logout')}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top navigation */}
          <div className="relative z-10 flex h-16 flex-shrink-0 bg-white shadow-sm sticky top-0">
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1" />
          </div>

          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 pt-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
