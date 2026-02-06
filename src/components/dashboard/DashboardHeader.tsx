'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { createClient } from '@/lib/supabase/client';
import { SparkDropdown } from '@/components/sparks';
import { useUpgrade } from '@/hooks/useUpgrade';
import Link from 'next/link';
import { LogOut, Loader2 } from 'lucide-react';

export function DashboardHeader() {
  const { user, profile, loading } = useUser();
  const supabase = createClient();
  const { openUpgrade, UpgradeModal } = useUpgrade();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return; // Prevent double clicks

    setLoggingOut(true);
    console.log('🔓 Logout initiated...');

    // Set a timeout to force redirect if signOut takes too long
    const forceLogoutTimer = setTimeout(() => {
      console.warn('⏰ Logout timeout - forcing redirect...');
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }, 3000); // 3 seconds timeout

    try {
      // 1. Sign out from Supabase with timeout
      console.log('📤 Signing out from Supabase...');

      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SignOut timeout')), 2000)
      );

      await Promise.race([signOutPromise, timeoutPromise])
        .catch(err => {
          console.warn('⚠️ SignOut issue:', err);
          // Continue anyway
        });

      console.log('✅ Supabase signOut completed');

      // Clear the force logout timer
      clearTimeout(forceLogoutTimer);

      // 2. Clear storage
      localStorage.clear();
      sessionStorage.clear();

      // 3. Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });

      console.log('🏠 Redirecting to home...');

      // 4. Hard redirect
      window.location.href = '/';
    } catch (error) {
      clearTimeout(forceLogoutTimer);
      console.error('💥 Logout error:', error);
      // Force redirect anyway
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Aumentado 50% (w-8 h-8 → w-12 h-12) */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 h-12 relative">
                <img
                  src="/logo.png"
                  alt="PostSpark"
                  className="w-full h-full object-contain"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0, 180, 255, 0.5))' }}
                />
              </div>
              <span
                className="text-lg font-bold"
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #ff6b35 50%, #ff9500 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                PostSpark
              </span>
            </Link>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              {!loading && (
                <>
                  {profile && (
                    <>
                      {/* Spark Balance Dropdown with Upgrade */}
                      <SparkDropdown onUpgrade={() => openUpgrade()} />

                      {/* User Email */}
                      <span className="hidden md:block text-sm text-gray-400 max-w-[150px] truncate">
                        {profile.email}
                      </span>
                    </>
                  )}

                  {/* Logout Button - Sempre visível quando logado */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loggingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Saindo...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Sair</span>
                      </>
                    )}
                  </button>
                </>
              )}

              {loading && (
                <div className="flex items-center gap-2">
                  <div className="w-20 h-6 bg-gray-700 rounded animate-pulse" />
                  <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Upgrade Modal */}
      <UpgradeModal />
    </>
  );
}
