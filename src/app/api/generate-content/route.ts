import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import type { AmbientState } from '@/types/ambient';
import { createClient } from '@/lib/supabase/server';
import { createGeneration, refundSparks } from '@/lib/sparks/service';
import { checkRateLimit } from '@/lib/sparks/rateLimiter';
import { getGenerationCost } from '@/lib/sparks/config';
import type { GenerationType } from '@/lib/sparks/config';

export interface GenerateContentRequest {
    text: string;
    state: AmbientState;
    format: 'static' | 'carousel';
    idempotencyKey?: string;
}

export interface GenerateContentResponse {
    content: unknown;
    generationId?: string;
    sparksUsed?: number;
    sparksRemaining?: number;
}

export async function POST(request: NextRequest) {
    try {
        // Check rate limit
        const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimit = await checkRateLimit('generation:create', clientIP, false);
        
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { 
                    error: 'Rate limit exceeded',
                    message: `Too many requests. Try again later.`,
                    retryAfter: Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000),
                },
                { 
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': String(rateLimit.limit),
                        'X-RateLimit-Remaining': '0',
                        'Retry-After': String(Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000)),
                    },
                }
            );
        }

        // Authenticate user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Please sign in to generate content' },
                { status: 401 }
            );
        }

        const body: GenerateContentRequest = await request.json();

        if (!body.text || !body.state) {
            return NextResponse.json(
                { error: 'Missing required fields: text, state' },
                { status: 400 }
            );
        }

        // Determine generation type and cost
        const generationType: GenerationType = body.format === 'carousel' ? 'CAROUSEL' : 'STATIC_POST';
        const sparkCost = getGenerationCost(generationType, false);

        // Generate idempotency key if not provided
        const idempotencyKey = body.idempotencyKey || `${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create generation session and debit sparks
        const generationResult = await createGeneration(
            user.id,
            body.text,
            generationType,
            idempotencyKey
        );

        if (!generationResult.success) {
            return NextResponse.json(
                { 
                    error: 'Generation failed',
                    message: generationResult.error || 'Failed to process generation',
                    code: 'GENERATION_FAILED',
                },
                { status: 400 }
            );
        }

        const generationId = generationResult.generationId!;

        try {
            // Generate content
            const content = await generateContent({
                text: body.text,
                state: body.state,
                format: body.format || 'static',
            });

            // Return successful response
            const response: GenerateContentResponse = {
                content,
                generationId,
                sparksUsed: sparkCost,
                sparksRemaining: generationResult.sparksRemaining,
            };

            return NextResponse.json(response, {
                headers: {
                    'X-RateLimit-Limit': String(rateLimit.limit),
                    'X-RateLimit-Remaining': String(rateLimit.remaining - 1),
                },
            });
        } catch (genError) {
            // Refund sparks if generation failed
            await refundSparks(user.id, sparkCost, generationId, 'Content generation failed');
            
            console.error('Content generation error:', genError);
            return NextResponse.json(
                { 
                    error: 'Failed to generate content',
                    message: genError instanceof Error ? genError.message : 'Unknown error',
                    sparksRefunded: sparkCost,
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('API /generate-content error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
