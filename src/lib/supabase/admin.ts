/**
 * Supabase Admin Client
 * Uses service role key for server-side operations without user context
 * Use this for webhooks and background jobs
 */

import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Allow build without keys, but warn
  if (!SUPABASE_URL && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL is not set. Supabase admin features will be unavailable.');
  }

  if (!SUPABASE_SERVICE_ROLE_KEY && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is not set. Supabase admin features will be unavailable.');
  }

  // Return null if keys missing (for build-time safety)
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'postspark',
    },
  });
}

// Create singleton instance
const supabaseAdminInstance = createAdminClient();

export const supabaseAdmin = supabaseAdminInstance;

// Export type with correct schema inference
export type SupabaseAdminClient = ReturnType<typeof createAdminClient>;

// Helper to ensure Supabase admin is configured before use
function ensureAdmin(): NonNullable<SupabaseAdminClient> {
  if (!supabaseAdminInstance) {
    throw new Error('Supabase admin is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return supabaseAdminInstance;
}

/**
 * Update user plan in database
 */
export async function updateUserPlan(
  userId: string,
  plan: string,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): Promise<void> {
  const admin = ensureAdmin();
  const { error } = await admin
    .from('profiles')
    .update({
      plan,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('[Admin] Error updating user plan:', error);
    throw error;
  }
}

/**
 * Credit sparks to user account
 */
export async function creditSparksToUser(
  userId: string,
  amount: number,
  description: string
): Promise<void> {
  const admin = ensureAdmin();
  const { error } = await admin.rpc('credit_sparks', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
  });

  if (error) {
    console.error('[Admin] Error crediting sparks:', error);
    throw error;
  }
}

/**
 * Get user by Stripe customer ID
 */
export async function getUserByStripeCustomerId(customerId: string): Promise<{ id: string; email: string; plan: string } | null> {
  const admin = ensureAdmin();
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, plan')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<{ id: string; email: string; plan: string; stripe_customer_id?: string } | null> {
  const admin = ensureAdmin();
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, plan, stripe_customer_id')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Set user's next refill date
 */
export async function setUserRefillDate(userId: string, date: Date): Promise<void> {
  const admin = ensureAdmin();
  const { error } = await admin
    .from('profiles')
    .update({
      sparks_refill_date: date.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('[Admin] Error setting refill date:', error);
    throw error;
  }
}
