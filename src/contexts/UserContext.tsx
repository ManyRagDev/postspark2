'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export type UserPlan = 'FREE' | 'LITE' | 'PRO' | 'AGENCY' | 'DEV';

export interface UserProfile {
  id: string;
  email: string;
  plan: UserPlan;
  sparks: number;
  sparks_refill_date: string | null;
  created_at: string;
  updated_at: string;
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAppUser: boolean;
  refreshProfile: () => Promise<void>;
  hasEnoughSparks: (amount: number) => boolean;
  canUseFeature: (feature: string) => boolean;
  canUseEngine: (engine: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAppUser, setIsAppUser] = useState(false);
  const supabase = createClient();

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      console.log('[UserContext] Fetching profile for user:', userId);

      // Add timeout to prevent infinite loading (10 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );

      // Use RPC function to access data from postspark schema
      const profilePromise = supabase
        .rpc('get_user_profile', { user_uuid: userId });

      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      console.log('[UserContext] Profile result:', { data, error });

      if (error) {
        console.error('[UserContext] Error fetching profile:', error);

        // If RPC doesn't exist, create a default profile
        if (error.message?.includes('function') || error.code === '42883') {
          console.warn('[UserContext] RPC function not found, using default profile');
          setProfile({
            id: userId,
            email: userEmail || '',
            plan: 'FREE',
            sparks: 50,
            sparks_refill_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as UserProfile);
          return;
        }

        throw error;
      }

      if (data && data.length > 0) {
        console.log('[UserContext] Profile found:', data[0]);
        setProfile(data[0] as UserProfile);
      } else {
        console.warn('[UserContext] No profile found for user, creating default');
        // Create default profile if none exists
        setProfile({
          id: userId,
          email: userEmail || '',
          plan: 'FREE',
          sparks: 50,
          sparks_refill_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserProfile);
      }
    } catch (err) {
      console.error('[UserContext] Error fetching profile:', err);

      // Set default profile on error to prevent infinite loading
      if (err instanceof Error && err.message === 'Profile fetch timeout') {
        console.error('[UserContext] Timeout - using default profile');
        setProfile({
          id: userId,
          email: userEmail || '',
          plan: 'FREE',
          sparks: 50,
          sparks_refill_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserProfile);
      } else {
        setError('Falha ao carregar perfil do usuário');
      }
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id, user.email);
    }
  };

  useEffect(() => {
    // Add overall timeout for session check (15 seconds)
    const sessionTimeout = setTimeout(() => {
      if (loading) {
        console.error('[UserContext] Session check timeout - forcing loading to false');
        setLoading(false);
        setError('Timeout ao verificar sessão');
      }
    }, 15000);

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          setIsAppUser(true);
          fetchProfile(currentUser.id, currentUser.email).finally(() => {
            setLoading(false);
            clearTimeout(sessionTimeout);
          });
        } else {
          setIsAppUser(false);
          setLoading(false);
          clearTimeout(sessionTimeout);
        }
      })
      .catch((err) => {
        console.error('[UserContext] Error getting session:', err);
        setError('Falha ao verificar sessão');
        setLoading(false);
        clearTimeout(sessionTimeout);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          setIsAppUser(true);
          await fetchProfile(currentUser.id, currentUser.email);
        } else {
          setIsAppUser(false);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(sessionTimeout);
    };
  }, []);

  const hasEnoughSparks = (amount: number): boolean => {
    return (profile?.sparks ?? 0) >= amount;
  };

  const canUseFeature = (feature: string): boolean => {
    const plan = profile?.plan ?? 'FREE';
    
    const featureAccess: Record<string, UserPlan[]> = {
      'carousel': ['PRO', 'AGENCY', 'DEV'],
      'seo_2026': ['PRO', 'AGENCY', 'DEV'],
      'brand_kits': ['AGENCY', 'DEV'],
      'pollinations': ['LITE', 'PRO', 'AGENCY', 'DEV'],
      'nano_banana': ['PRO', 'AGENCY', 'DEV'],
      'smart_match': ['FREE', 'LITE', 'PRO', 'AGENCY', 'DEV'],
    };

    const allowedPlans = featureAccess[feature];
    if (!allowedPlans) return true;
    
    return allowedPlans.includes(plan);
  };

  const canUseEngine = (engine: string): boolean => {
    const plan = profile?.plan ?? 'FREE';
    
    const engineAccess: Record<string, UserPlan[]> = {
      'smart_match': ['FREE', 'LITE', 'PRO', 'AGENCY', 'DEV'],
      'pollinations': ['LITE', 'PRO', 'AGENCY', 'DEV'],
      'nano_banana': ['PRO', 'AGENCY', 'DEV'],
    };

    const allowedPlans = engineAccess[engine];
    if (!allowedPlans) return false;
    
    return allowedPlans.includes(plan);
  };

  const value: UserContextType = {
    user,
    profile,
    loading,
    error,
    isAppUser,
    refreshProfile,
    hasEnoughSparks,
    canUseFeature,
    canUseEngine,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
