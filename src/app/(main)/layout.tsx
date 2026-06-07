'use client';

import { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import VersionSelector from '@/components/VersionSelector';
import { useVersion } from '@/context/VersionContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { version } = useVersion();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (version === null) {
    return (
      <AuthGuard>
        <VersionSelector />
      </AuthGuard>
    );
  }

  if (version === 'mobile') {
    return (
      <AuthGuard>
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
          <main className="flex-1 pb-16 overflow-hidden">
            {children}
          </main>
          <MobileNav />
        </div>
      </AuthGuard>
    );
  }

  // Web layout
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
          <header className="lg:hidden flex items-center gap-3 bg-green-800 px-4 py-3 sticky top-0 z-10">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white p-1.5 rounded-lg hover:bg-green-700 transition-colors"
              aria-label="Abrir menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-white font-extrabold text-base">⚽ Figurinhas Copa 2026</span>
          </header>

          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
