/**
 * Spark debit middleware for API routes
 * Validates and debits sparks before allowing generation
 */

import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGenerationCost, type GenerationType } from '@/lib/sparks/config';
import { calculatePromptSimilarity } from '@/lib/sparks/promptHash';

export interface SparkRequest extends NextRequest {
  user: {
    id: string;
    email: string;
  };
  sparkContext: {
    generationId?: string;
    sparksDebited: number;
    isRegeneration: boolean;
    generationType: GenerationType;
  };
}

export type SparkHandler = (req: SparkRequest) => Promise<Response> | Response;

interface WithSparksOptions {
  generationType: GenerationType;
  isRegeneration?: boolean;
  generationId?: string; // Required for regeneration
  newPrompt?: string; // For checking similarity on regeneration
}

/**
 * Higher-order function to handle spark validation and debit
 */
export function withSparks(options: WithSparksOptions, handler: SparkHandler) {
  return async (req: NextRequest): Promise<Response> => {
    const supabase = await createClient();
    
    try {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: 'Authentication required',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      const userId = user.id;
      const { generationType, isRegeneration = false, generationId, newPrompt } = options;
      
      // Get user's spark balance
      const { data: profile, error: profileError } = await supabase
        .schema('postspark')
        .from('profiles')
        .select('sparks, plan')
        .eq('id', userId)
        .single();
      
      if (profileError || !profile) {
        return new Response(
          JSON.stringify({
            error: 'Profile not found',
            message: 'Unable to retrieve user profile',
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      let sparksNeeded: number;
      let actualGenerationId = generationId;
      
      if (isRegeneration && generationId) {
        // Check regeneration eligibility
        const { data: session, error: sessionError } = await supabase
          .schema('postspark')
          .from('generation_sessions')
          .select('*')
          .eq('id', generationId)
          .eq('user_id', userId)
          .single();
        
        if (sessionError || !session) {
          return new Response(
            JSON.stringify({
              error: 'Generation not found',
              message: 'Invalid generation session',
            }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Check if session is active
        if (session.status !== 'ACTIVE' || new Date(session.expires_at) < new Date()) {
          return new Response(
            JSON.stringify({
              error: 'Session expired',
              message: 'Generation session has expired. Please create a new generation.',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Check if regeneration already used
        if (session.has_used_regen_basic || session.has_used_regen_pollinations) {
          return new Response(
            JSON.stringify({
              error: 'Regeneration used',
              message: 'You have already used your free regeneration for this post.',
              code: 'REGEN_LIMIT_REACHED',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Check prompt similarity if new prompt provided
        if (newPrompt) {
          const similarity = calculatePromptSimilarity(session.prompt_text, newPrompt);
          if (similarity < 0.5) {
            return new Response(
              JSON.stringify({
                error: 'Prompt too different',
                message: 'Your new prompt is too different from the original. Please create a new generation.',
                similarity,
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }
        }
        
        // Calculate regeneration cost
        const hasUsedFreeRegen = session.has_used_regen_basic || session.has_used_regen_pollinations;
        sparksNeeded = getGenerationCost(generationType as GenerationType, true, hasUsedFreeRegen);
      } else {
        // New generation
        sparksNeeded = getGenerationCost(generationType, false);
      }
      
      // Check if user has enough sparks
      if (profile.sparks < sparksNeeded) {
        return new Response(
          JSON.stringify({
            error: 'Insufficient sparks',
            message: `You need ${sparksNeeded} sparks but only have ${profile.sparks}`,
            required: sparksNeeded,
            current: profile.sparks,
            code: 'INSUFFICIENT_SPARKS',
          }),
          {
            status: 402, // Payment Required
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Debit sparks atomically using RPC
      const { data: debitSuccess, error: debitError } = await supabase.schema('postspark').rpc(
        'debit_sparks',
        {
          p_user_id: userId,
          p_amount: sparksNeeded,
          p_description: isRegeneration ? `Regeneration: ${generationType}` : `Generation: ${generationType}`,
          p_generation_id: actualGenerationId || null,
          p_metadata: {
            generation_type: generationType,
            is_regeneration: isRegeneration,
          },
        }
      );
      
      if (debitError || !debitSuccess) {
        return new Response(
          JSON.stringify({
            error: 'Debit failed',
            message: 'Failed to debit sparks. Please try again.',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Attach spark context to request
      const sparkReq = req as SparkRequest;
      sparkReq.user = {
        id: userId,
        email: user.email || '',
      };
      sparkReq.sparkContext = {
        generationId: actualGenerationId,
        sparksDebited: sparksNeeded,
        isRegeneration,
        generationType,
      };
      
      return handler(sparkReq);
    } catch (error) {
      console.error('Spark middleware error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: 'Failed to process spark validation',
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
 * Refund sparks for a failed generation
 * Should be called from catch blocks or error handlers
 */
export async function refundSparks(
  userId: string,
  amount: number,
  reason: string,
  generationId?: string
): Promise<boolean> {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase.schema('postspark').rpc('credit_sparks', {
      p_user_id: userId,
      p_amount: amount,
      p_description: `Refund: ${reason}`,
      p_generation_id: generationId || null,
      p_metadata: { refund_reason: reason },
    });
    
    return !error;
  } catch (error) {
    console.error('Refund failed:', error);
    return false;
  }
}
