/**
 * Spark Service - Core business logic for credit system
 * Handles debits, credits, regeneration tracking, and validation
 */

import { createClient } from '@/lib/supabase/server';
import type { GenerationType, RegenerationType } from './config';
import { getGenerationCost, SPARK_COSTS } from './config';
import { calculatePromptSimilarity, isPromptDrasticallyDifferent } from './promptHash';

export interface GenerationResult {
  success: boolean;
  generationId?: string;
  error?: string;
  sparksRemaining?: number;
}

export interface RegenerationResult {
  success: boolean;
  allowed: boolean;
  cost: number;
  alreadyUsed: boolean;
  error?: string;
  isDrasticallyDifferent: boolean;
}

export interface SparkBalance {
  sparks: number;
  plan: string;
}

/**
 * Create a new generation session and debit sparks
 */
export async function createGeneration(
  userId: string,
  promptText: string,
  generationType: GenerationType,
  idempotencyKey: string
): Promise<GenerationResult> {
  const supabase = await createClient();
  
  try {
    // Check for idempotency - prevent double-charging
    const { data: existingSession } = await supabase
      .schema('postspark')
      .from('generation_sessions')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .single();
    
    if (existingSession) {
      // Return existing generation without charging again
      return {
        success: true,
        generationId: existingSession.id,
      };
    }
    
    // Get spark cost
    const sparkCost = getGenerationCost(generationType, false);
    
    // Check user balance and debit sparks atomically using RPC
    const { data: debitSuccess, error: debitError } = await supabase.schema('postspark').rpc(
      'debit_sparks',
      {
        p_user_id: userId,
        p_amount: sparkCost,
        p_description: `Generation: ${generationType}`,
        p_generation_id: null, // Will be updated after creation
        p_metadata: {
          generation_type: generationType,
          prompt_preview: promptText.slice(0, 100),
        },
      }
    );
    
    if (debitError || !debitSuccess) {
      return {
        success: false,
        error: 'Insufficient sparks balance',
      };
    }
    
    // Create generation session
    const { data: session, error: sessionError } = await supabase
      .schema('postspark')
      .from('generation_sessions')
      .insert({
        user_id: userId,
        prompt_hash: promptText, // Store full prompt for comparison
        prompt_text: promptText,
        original_sparks_used: sparkCost,
        generation_type: generationType,
        idempotency_key: idempotencyKey,
        status: 'ACTIVE',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();
    
    if (sessionError) {
      // Attempt to refund sparks if session creation failed
      await supabase.schema('postspark').rpc('credit_sparks', {
        p_user_id: userId,
        p_amount: sparkCost,
        p_description: `Refund for failed generation session`,
      });
      
      return {
        success: false,
        error: 'Failed to create generation session',
      };
    }
    
    // Get updated balance
    const { data: profile } = await supabase
      .schema('postspark')
      .from('profiles')
      .select('sparks')
      .eq('id', userId)
      .single();
    
    return {
      success: true,
      generationId: session.id,
      sparksRemaining: profile?.sparks,
    };
  } catch (error) {
    console.error('Error in createGeneration:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
}

/**
 * Check if regeneration is allowed for a generation session
 */
export async function checkRegenerationStatus(
  generationId: string,
  userId: string,
  regenType: RegenerationType,
  newPrompt?: string
): Promise<RegenerationResult> {
  const supabase = await createClient();
  
  try {
    // Get generation session
    const { data: session, error: sessionError } = await supabase
      .schema('postspark')
      .from('generation_sessions')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', userId)
      .single();
    
    if (sessionError || !session) {
      return {
        success: false,
        allowed: false,
        cost: 0,
        alreadyUsed: false,
        error: 'Generation session not found',
        isDrasticallyDifferent: false,
      };
    }
    
    // Check if session is still active
    if (session.status !== 'ACTIVE') {
      return {
        success: false,
        allowed: false,
        cost: 0,
        alreadyUsed: false,
        error: 'Generation session has expired',
        isDrasticallyDifferent: false,
      };
    }
    
    // Check if regeneration has already been used
    const regenField = regenType === 'basic' 
      ? 'has_used_regen_basic' 
      : 'has_used_regen_pollinations';
    
    if (session[regenField as keyof typeof session]) {
      return {
        success: false,
        allowed: false,
        cost: 0,
        alreadyUsed: true,
        error: 'Regeneration already used for this session',
        isDrasticallyDifferent: false,
      };
    }
    
    // Check if prompt is drastically different
    let isDrasticallyDifferent = false;
    if (newPrompt) {
      isDrasticallyDifferent = calculatePromptSimilarity(session.prompt_text, newPrompt) < 0.5;
      
      if (isDrasticallyDifferent) {
        return {
          success: false,
          allowed: false,
          cost: 0,
          alreadyUsed: false,
          error: 'Prompt is too different - create a new generation instead',
          isDrasticallyDifferent: true,
        };
      }
    }
    
    // Calculate cost
    const generationType = session.generation_type as GenerationType;
    const hasUsedFreeRegen = session.has_used_regen_basic || session.has_used_regen_pollinations;
    const cost = getGenerationCost(generationType, true, hasUsedFreeRegen);
    
    return {
      success: true,
      allowed: true,
      cost,
      alreadyUsed: false,
      isDrasticallyDifferent: false,
    };
  } catch (error) {
    console.error('Error in checkRegenerationStatus:', error);
    return {
      success: false,
      allowed: false,
      cost: 0,
      alreadyUsed: false,
      error: 'Internal server error',
      isDrasticallyDifferent: false,
    };
  }
}

/**
 * Use regeneration for a generation session
 */
export async function useRegeneration(
  generationId: string,
  userId: string,
  regenType: RegenerationType,
  newPrompt?: string
): Promise<RegenerationResult> {
  const supabase = await createClient();
  
  try {
    // First check if regeneration is allowed
    const checkResult = await checkRegenerationStatus(generationId, userId, regenType, newPrompt);
    
    if (!checkResult.success || !checkResult.allowed) {
      return checkResult;
    }
    
    // Debit sparks if cost > 0
    if (checkResult.cost > 0) {
      const { data: debitSuccess, error: debitError } = await supabase.schema('postspark').rpc(
        'debit_sparks',
        {
          p_user_id: userId,
          p_amount: checkResult.cost,
          p_description: `Regeneration: ${regenType}`,
          p_generation_id: generationId,
          p_metadata: {
            regen_type: regenType,
            prompt_preview: newPrompt?.slice(0, 100),
          },
        }
      );
      
      if (debitError || !debitSuccess) {
        return {
          success: false,
          allowed: false,
          cost: 0,
          alreadyUsed: false,
          error: 'Insufficient sparks for regeneration',
          isDrasticallyDifferent: false,
        };
      }
    }
    
    // Mark regeneration as used using RPC
    const { data: regenResult, error: regenError } = await supabase.schema('postspark').rpc(
      'use_regeneration',
      {
        p_generation_id: generationId,
        p_user_id: userId,
        p_regen_type: regenType,
      }
    );
    
    if (regenError) {
      // Refund sparks if marking failed
      if (checkResult.cost > 0) {
        await supabase.schema('postspark').rpc('credit_sparks', {
          p_user_id: userId,
          p_amount: checkResult.cost,
          p_description: `Refund for failed regeneration`,
        });
      }
      
      return {
        success: false,
        allowed: false,
        cost: 0,
        alreadyUsed: false,
        error: 'Failed to process regeneration',
        isDrasticallyDifferent: false,
      };
    }
    
    return {
      success: true,
      allowed: true,
      cost: checkResult.cost,
      alreadyUsed: false,
      isDrasticallyDifferent: false,
    };
  } catch (error) {
    console.error('Error in useRegeneration:', error);
    return {
      success: false,
      allowed: false,
      cost: 0,
      alreadyUsed: false,
      error: 'Internal server error',
      isDrasticallyDifferent: false,
    };
  }
}

/**
 * Complete a generation session (mark as completed)
 */
export async function completeGeneration(generationId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase
      .schema('postspark')
      .from('generation_sessions')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
      })
      .eq('id', generationId)
      .eq('user_id', userId);
    
    return !error;
  } catch (error) {
    console.error('Error in completeGeneration:', error);
    return false;
  }
}

/**
 * Get user's current spark balance
 */
export async function getSparkBalance(userId: string): Promise<SparkBalance | null> {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .schema('postspark')
      .from('profiles')
      .select('sparks, plan')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return {
      sparks: data.sparks,
      plan: data.plan,
    };
  } catch (error) {
    console.error('Error in getSparkBalance:', error);
    return null;
  }
}

/**
 * Refund sparks for a failed generation
 */
export async function refundSparks(
  userId: string,
  amount: number,
  generationId: string,
  reason: string
): Promise<boolean> {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase.schema('postspark').rpc('credit_sparks', {
      p_user_id: userId,
      p_amount: amount,
      p_description: `Refund: ${reason}`,
      p_generation_id: generationId,
      p_metadata: { refund_reason: reason },
    });
    
    return !error;
  } catch (error) {
    console.error('Error in refundSparks:', error);
    return false;
  }
}
