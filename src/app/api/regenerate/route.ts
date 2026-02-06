/**
 * Regeneration API endpoint
 * Handles regeneration requests with proper validation and spark management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { useRegeneration, completeGeneration, getSparkBalance } from '@/lib/sparks/service';
import { checkRateLimit } from '@/lib/sparks/rateLimiter';
import type { RegenerationType } from '@/lib/sparks/config';
import { generateContent } from '@/lib/gemini';

export interface RegenerateRequest {
    generationId: string;
    regenType: RegenerationType;
    prompt?: string; // Optional new prompt
    contentParams?: {
        text: string;
        state: string;
        format: 'static' | 'carousel';
    };
}

export interface RegenerateResponse {
    success: boolean;
    content?: unknown;
    sparksUsed: number;
    sparksRemaining: number;
    alreadyUsed: boolean;
    error?: string;
    code?: string;
}

export async function POST(request: NextRequest) {
    try {
        // Check rate limit
        const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimit = await checkRateLimit('generation:regenerate', clientIP, false);
        
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { 
                    error: 'Rate limit exceeded',
                    message: 'Too many regeneration requests. Try again later.',
                    retryAfter: Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000),
                },
                { status: 429 }
            );
        }

        // Authenticate user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Please sign in to regenerate' },
                { status: 401 }
            );
        }

        const body: RegenerateRequest = await request.json();

        // Validate request
        if (!body.generationId || !body.regenType) {
            return NextResponse.json(
                { error: 'Bad request', message: 'generationId and regenType are required' },
                { status: 400 }
            );
        }

        // Process regeneration
        const regenResult = await useRegeneration(
            body.generationId,
            user.id,
            body.regenType,
            body.prompt
        );

        if (!regenResult.success) {
            const response: RegenerateResponse = {
                success: false,
                sparksUsed: 0,
                sparksRemaining: 0,
                alreadyUsed: regenResult.alreadyUsed,
                error: regenResult.error || 'Regeneration failed',
                code: regenResult.alreadyUsed ? 'REGEN_ALREADY_USED' : 
                       regenResult.isDrasticallyDifferent ? 'PROMPT_TOO_DIFFERENT' : 
                       'REGEN_FAILED',
            };

            return NextResponse.json(response, { status: 400 });
        }

        // Get updated spark balance
        const balance = await getSparkBalance(user.id);

        // Generate new content based on type
        let newContent: unknown;

        try {
            if (body.contentParams) {
                // Regenerate content
                newContent = await generateContent({
                    text: body.contentParams.text,
                    state: body.contentParams.state as any,
                    format: body.contentParams.format,
                });
            }

            const response: RegenerateResponse = {
                success: true,
                content: newContent,
                sparksUsed: regenResult.cost,
                sparksRemaining: balance?.sparks || 0,
                alreadyUsed: false,
            };

            return NextResponse.json(response);
        } catch (genError) {
            console.error('Regeneration content error:', genError);
            
            // Don't refund - regeneration was valid, just generation failed
            return NextResponse.json(
                {
                    success: false,
                    sparksUsed: regenResult.cost,
                    sparksRemaining: balance?.sparks || 0,
                    alreadyUsed: true, // Mark as used since we attempted
                    error: 'Content generation failed during regeneration',
                    code: 'GEN_FAILED',
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('API /regenerate error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET endpoint to check regeneration status
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const generationId = url.searchParams.get('generationId');

        if (!generationId) {
            return NextResponse.json(
                { error: 'generationId is required' },
                { status: 400 }
            );
        }

        // Get generation session
        const { data: session, error } = await supabase
          .schema('postspark')
          .from('generation_sessions')
            .select('*')
            .eq('id', generationId)
            .eq('user_id', user.id)
            .single();

        if (error || !session) {
            return NextResponse.json(
                { error: 'Generation not found' },
                { status: 404 }
            );
        }

        // Check if expired
        const isExpired = new Date(session.expires_at) < new Date() || session.status !== 'ACTIVE';

        return NextResponse.json({
            generationId: session.id,
            status: session.status,
            isExpired,
            hasUsedRegenBasic: session.has_used_regen_basic,
            hasUsedRegenPollinations: session.has_used_regen_pollinations,
            expiresAt: session.expires_at,
        });
    } catch (error) {
        console.error('API /regenerate GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
