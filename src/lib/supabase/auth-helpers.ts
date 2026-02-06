/**
 * Auth Helpers para Multi-Tenancy
 * Gerencia app_metadata para separar usuários por aplicação
 */

import { createClient } from './client';

const APP_ID = 'postspark';

/**
 * Sign up com app_metadata
 * Define qual aplicação o usuário pertence
 */
export async function signUpWithApp(
  email: string,
  password: string,
  options?: { emailRedirectTo?: string }
) {
  const supabase = createClient();
  
  return supabase.auth.signUp({
    email,
    password,
    options: {
      ...options,
      data: {
        app_id: APP_ID,
      },
    },
  });
}

/**
 * Verifica se o usuário atual pertence ao app postspark
 */
export async function isCurrentUserFromApp(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const userAppId = user.app_metadata?.app_id;
  return userAppId === APP_ID;
}

/**
 * Get app_id do usuário atual
 */
export function getUserAppId(user: { app_metadata?: { app_id?: string } } | null): string | null {
  return user?.app_metadata?.app_id || null;
}

/**
 * Verifica se usuário tem acesso ao app atual
 */
export function hasAppAccess(user: { app_metadata?: { app_id?: string } } | null): boolean {
  return getUserAppId(user) === APP_ID;
}
