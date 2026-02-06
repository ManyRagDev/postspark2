'use client';

import { useUser } from '@/contexts/UserContext';
import { SparkBalance } from '@/components/sparks';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, LogOut, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface HeaderWithAuthProps {
  isVisible?: boolean;
}

export function HeaderWithAuth({ isVisible = true }: HeaderWithAuthProps) {
  const { user, profile, loading } = useUser();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-4">
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-20 h-6 bg-gray-700/50 rounded animate-pulse" />
        </div>
      ) : user ? (
        <>
          {/* Spark Balance - Show on desktop */}
          <div className="hidden sm:block">
            <SparkBalance variant="default" size="sm" showLabel={false} />
          </div>

          {/* Dashboard Button */}
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              <Sparkles className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </>
      ) : (
        <>
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              Entrar
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              Criar Conta
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
