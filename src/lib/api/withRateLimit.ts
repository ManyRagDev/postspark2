/**
 * Rate limiting middleware for API routes
 */

import type { NextRequest } from 'next/server';
import { checkRateLimit, getClientIP, type RateLimitConfig } from '@/lib/sparks/rateLimiter';

export interface RateLimitedRequest extends NextRequest {
  rateLimit: {
    remaining: number;
    limit: number;
    resetTime: Date;
  };
}

export type RateLimitedHandler = (req: RateLimitedRequest) => Promise<Response> | Response;

interface WithRateLimitOptions {
  action: string;
  config?: RateLimitConfig;
}

/**
 * Higher-order function to add rate limiting to API routes
 */
export function withRateLimit(
  options: WithRateLimitOptions,
  handler: RateLimitedHandler
) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      // Get user ID from auth header or JWT
      let userId: string | undefined;
      let ipAddress: string | null = null;
      
      // Try to get user from authorization header
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        // Extract user ID from token (simplified - in production, verify JWT)
        // For now, we'll check cookies/session in the actual implementation
      }
      
      // Get IP address as fallback identifier
      ipAddress = getClientIP(req);
      
      const identifier = userId || ipAddress;
      
      if (!identifier) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit error',
            message: 'Unable to identify request for rate limiting',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Check rate limit
      const result = await checkRateLimit(options.action, identifier, !!userId);
      
      // Add rate limit headers
      const headers = new Headers();
      headers.set('X-RateLimit-Limit', String(result.limit));
      headers.set('X-RateLimit-Remaining', String(result.remaining));
      headers.set('X-RateLimit-Reset', String(Math.floor(result.resetTime.getTime() / 1000)));
      
      if (!result.allowed) {
        headers.set('Retry-After', String(Math.ceil((result.resetTime.getTime() - Date.now()) / 1000)));
        
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: `Too many requests. Please try again after ${result.resetTime.toISOString()}`,
            retryAfter: Math.ceil((result.resetTime.getTime() - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...Object.fromEntries(headers),
            },
          }
        );
      }
      
      // Attach rate limit info to request
      const rateLimitedReq = req as RateLimitedRequest;
      rateLimitedReq.rateLimit = {
        remaining: result.remaining,
        limit: result.limit,
        resetTime: result.resetTime,
      };
      
      // Call handler and add rate limit headers to response
      const response = await handler(rateLimitedReq);
      
      // Add rate limit headers to response
      response.headers.set('X-RateLimit-Limit', String(result.limit));
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));
      response.headers.set('X-RateLimit-Reset', String(Math.floor(result.resetTime.getTime() / 1000)));
      
      return response;
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      
      // Allow request through on error (fail open for user experience)
      return handler(req as RateLimitedRequest);
    }
  };
}

/**
 * Combined middleware: Auth + Rate Limit
 */
export function withAuthAndRateLimit(
  rateLimitOptions: WithRateLimitOptions,
  handler: RateLimitedHandler
) {
  return withRateLimit(rateLimitOptions, handler);
}
