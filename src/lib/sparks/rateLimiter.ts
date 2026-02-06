/**
 * Rate limiting for API protection
 * Prevents abuse and bot attacks
 */

import { createClient } from '@/lib/supabase/server';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// Rate limit configurations for different actions
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'generation:create': { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
  'generation:regenerate': { maxRequests: 5, windowMs: 60 * 1000 }, // 5 per minute
  'download:request': { maxRequests: 20, windowMs: 60 * 1000 }, // 20 per minute
  'auth:login': { maxRequests: 5, windowMs: 5 * 60 * 1000 }, // 5 per 5 minutes
  'auth:signup': { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  limit: number;
}

/**
 * Check rate limit for a user or IP
 */
export async function checkRateLimit(
  action: string,
  identifier: string, // userId or IP address
  isUserId: boolean = true
): Promise<RateLimitResult> {
  const supabase = await createClient();
  const config = RATE_LIMITS[action] || { maxRequests: 30, windowMs: 60 * 1000 };

  const windowStart = new Date(Date.now() - config.windowMs);

  // Query current count
  const query = supabase
    .schema('postspark')
    .from('rate_limits')
    .select('*')
    .eq('action', action)
    .gte('window_start', windowStart.toISOString());

  const { data: records } = isUserId
    ? await query.eq('user_id', identifier)
    : await query.eq('ip_address', identifier);

  const count = records?.length || 0;
  const allowed = count < config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - count);
  const resetTime = new Date(Date.now() + config.windowMs);

  // Increment count if allowed
  if (allowed) {
    const insertData: Record<string, unknown> = {
      action,
      count: 1,
      window_start: new Date().toISOString(),
    };

    if (isUserId) {
      insertData.user_id = identifier;
    } else {
      insertData.ip_address = identifier;
    }

    await supabase.schema('postspark').from('rate_limits').insert(insertData);
  }

  return {
    allowed,
    remaining,
    resetTime,
    limit: config.maxRequests,
  };
}

/**
 * Middleware-compatible rate limit check
 * Returns null if allowed, or error response if limited
 */
export async function rateLimitMiddleware(
  action: string,
  userId?: string,
  ipAddress?: string
): Promise<{ error: string; status: number; headers: Record<string, string> } | null> {
  const identifier = userId || ipAddress;

  if (!identifier) {
    return {
      error: 'Unable to determine rate limit identifier',
      status: 400,
      headers: {},
    };
  }

  const result = await checkRateLimit(action, identifier, !!userId);

  if (!result.allowed) {
    return {
      error: `Rate limit exceeded. Try again after ${result.resetTime.toISOString()}`,
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.floor(result.resetTime.getTime() / 1000)),
        'Retry-After': String(Math.ceil((result.resetTime.getTime() - Date.now()) / 1000)),
      },
    };
  }

  return null;
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string | null {
  // Try to get IP from various headers
  const headers = request.headers;

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return null;
}

/**
 * Cleanup old rate limit records
 * Should be called periodically (e.g., via cron job)
 */
export async function cleanupRateLimits(): Promise<number> {
  const supabase = await createClient();

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  const { count } = await supabase
    .schema('postspark')
    .from('rate_limits')
    .delete({ count: 'exact' })
    .lt('window_start', cutoff.toISOString());

  return count || 0;
}
