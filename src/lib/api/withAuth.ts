/**
 * Authentication middleware for API routes
 * Wraps API handlers to ensure user is authenticated
 */

import { createClient } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
  };
}

export type AuthenticatedHandler = (
  req: AuthenticatedRequest
) => Promise<Response> | Response;

/**
 * Higher-order function to protect API routes with authentication
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest): Promise<Response> => {
    const supabase = await createClient();
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: 'Authentication required. Please sign in.',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Attach user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        id: user.id,
        email: user.email || '',
      };
      
      return handler(authenticatedReq);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: 'Failed to authenticate request',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}

/**
 * Optional authentication - attaches user if available but doesn't require it
 */
export function withOptionalAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest): Promise<Response> => {
    const supabase = await createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const authenticatedReq = req as AuthenticatedRequest;
      
      if (user) {
        authenticatedReq.user = {
          id: user.id,
          email: user.email || '',
        };
      }
      
      return handler(authenticatedReq);
    } catch (error) {
      // Continue without auth if there's an error
      const authenticatedReq = req as AuthenticatedRequest;
      return handler(authenticatedReq);
    }
  };
}
