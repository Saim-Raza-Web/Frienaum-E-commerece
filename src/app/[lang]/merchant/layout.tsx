'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n/TranslationProvider';
import {
  Home,
  Package,
  ShoppingBag,
  Users,
  BarChart as BarChartIcon,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  UserCircle,
  ChevronDown,
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { translate } = useTranslation();

  const navigation: NavigationItem[] = [
    { name: 'merchant.dashboard', href: '/merchant/dashboard', icon: Home },
    { name: 'merchant.products', href: '/merchant/products', icon: Package },
    { name: 'merchant.orders', href: '/merchant/orders', icon: ShoppingBag },
    { name: 'merchant.customerManagement', href: '/merchant/customers', icon: Users },
    { name: 'merchant.businessAnalytics', href: '/merchant/analytics', icon: BarChartIcon },
    { name: 'settings', href: '/merchant/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  const handleLogout = () => {
    // Handle logout logic here
    router.push('/login');
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
            <h1 className="text-xl font-bold text-blue-600">{translate('merchant.dashboard')}</h1>
            <button
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } transition-colors duration-200`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {translate(item.name)}
                {isActive(item.href) && (
                  <span className="ml-auto w-1 h-6 bg-blue-600 rounded-l-md"></span>
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
          <div className="border-t border-gray-200 p-4">
            <button className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              {translate('logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top navigation */}
          <div className="relative z-10 flex h-16 flex-shrink-0 bg-white shadow-sm">
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            
            {/* Search bar */}
            <div className="flex flex-1 justify-between px-4">
              <div className="flex flex-1 max-w-2xl">
                <div className="flex w-full max-w-lg lg:max-w-xs">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <div className="relative w-full">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full rounded-md border-0 bg-gray-50 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                      placeholder="Search..."
                      type="search"
                    />
                  </div>
                </div>
              </div>
              
              {/* Right side icons */}
              <div className="ml-4 flex items-center md:ml-6">
                <button
                  type="button"
                  className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 relative"
                >
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" aria-hidden="true" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>
              </div>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
