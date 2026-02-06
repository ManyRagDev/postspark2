import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';
import { createGeneration, refundSparks } from '@/lib/sparks/service';
import { checkRateLimit } from '@/lib/sparks/rateLimiter';
import { getGenerationCost } from '@/lib/sparks/config';
import type { GenerationType } from '@/lib/sparks/config';

// ============ TYPES ============

interface GenerateImageBody {
    prompt: string;
    isComplex: boolean;
    idempotencyKey?: string;
}

export interface GenerateImageResponse {
    image: string;
    provider: 'pollinations' | 'gemini';
    generationId?: string;
    sparksUsed?: number;
    sparksRemaining?: number;
}

type ImageProvider = 'pollinations' | 'gemini';

// ============ SINGLETON CLIENT ============

const geminiClient = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY || '',
});

// ============ PROMPT WRAPPERS ============

function wrapSimplePrompt(userPrompt: string): string {
    return `Abstract background image for social media post. Theme: ${userPrompt}.
    
    CRITICAL: This is a BACKGROUND ONLY - NO text, NO letters, NO words, NO numbers, NO typography, NO writing, NO characters, NO symbols, NO logos, NO watermarks, NO captions, NO titles, NO subtitles.
    
    Style: smooth gradient colors, modern minimalist design, professional aesthetic, geometric shapes, soft lighting, suitable for text overlay.
    
    Focus: pure visual elements, colors, textures, patterns, shapes, gradients - absolutely NO written content of any kind.`;
}

function wrapComplexPrompt(userPrompt: string): string {
    return `Generate a visually striking, high-quality background image for a social media post.

Theme/Topic: "${userPrompt}"

CRITICAL REQUIREMENTS:
- The image MUST NOT contain any text, letters, words, numbers, or typography
- NO watermarks, logos, brand names, or written content of any kind
- Focus strictly on visual composition and imagery only

STYLE REQUIREMENTS:
- Realistic, detailed, professional quality
- Rich colors with good contrast
- Suitable for overlaying text on top
- Instagram/LinkedIn post style (square or vertical format)
- High contrast areas for text readability
- Modern, visually appealing aesthetic`;
}

// ============ PROVIDER IMPLEMENTATIONS ============

async function generateWithPollinations(prompt: string): Promise<string> {
    const wrappedPrompt = wrapSimplePrompt(prompt);
    const encodedPrompt = encodeURIComponent(wrappedPrompt);

    const params = new URLSearchParams({
        model: 'flux',
        nologo: 'true',
        width: '1080',
        height: '1080',
        enhance: 'true',
    });

    const url = `https://gen.pollinations.ai/image/${encodedPrompt}?${params.toString()}`;

    const headers: Record<string, string> = {};
    if (process.env.POLLINATIONS_API_KEY) {
        headers['Authorization'] = `Bearer ${process.env.POLLINATIONS_API_KEY}`;
    }

    const maxRetries = 3;
    const timeout = 30000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(url, { 
                headers,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const imageBuffer = await response.arrayBuffer();
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            return `data:image/jpeg;base64,${base64Image}`;
            
        } catch (error: any) {
            if (attempt === maxRetries) {
                throw new Error(`Failed to fetch from Pollinations after ${maxRetries} attempts: ${error.message}`);
            }
            await new Promise(r => setTimeout(r, 1000 * attempt));
        }
    }
    
    throw new Error('Unexpected end of retry loop');
}

async function generateWithGemini(prompt: string): Promise<string> {
    const wrappedPrompt = wrapComplexPrompt(prompt);
    
    const response = await geminiClient.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: wrappedPrompt,
        config: {
            responseModalities: ['Text', 'Image']
        },
    });

    if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No candidates returned from Gemini');
    }

    const candidate = response.candidates[0];
    
    if (!candidate.content || !candidate.content.parts) {
        throw new Error('No content parts returned from Gemini');
    }

    for (const part of candidate.content.parts) {
        if (part.inlineData) {
            const imageData = part.inlineData.data;
            if (imageData) {
                return `data:image/png;base64,${imageData}`;
            }
        }
    }

    throw new Error('No image data found in Gemini response');
}

// ============ MAIN HANDLER ============

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    let provider: ImageProvider = 'pollinations';

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
                { status: 429 }
            );
        }

        // Authenticate user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Please sign in to generate images' },
                { status: 401 }
            );
        }

        const body: GenerateImageBody = await request.json();
        const { prompt, isComplex } = body;

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid "prompt" field', code: 'VALIDATION_ERROR' },
                { status: 400 }
            );
        }

        // Determine generation type and cost
        const generationType: GenerationType = isComplex ? 'NANO_BANANA' : 'POLLINATIONS';
        const sparkCost = getGenerationCost(generationType, false);

        // Generate idempotency key
        const idempotencyKey = body.idempotencyKey || `${user.id}-img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create generation session and debit sparks
        const generationResult = await createGeneration(
            user.id,
            prompt,
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
            let imageData: string;

            if (isComplex) {
                provider = 'gemini';

                if (!process.env.GOOGLE_API_KEY) {
                    await refundSparks(user.id, sparkCost, generationId, 'API key not configured');
                    return NextResponse.json(
                        { error: 'GOOGLE_API_KEY not configured', code: 'CONFIG_ERROR' },
                        { status: 500 }
                    );
                }

                imageData = await generateWithGemini(prompt);
            } else {
                provider = 'pollinations';
                imageData = await generateWithPollinations(prompt);
            }

            const duration = Date.now() - startTime;

            const response: GenerateImageResponse = {
                image: imageData,
                provider,
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

        } catch (genError: any) {
            // Refund sparks if generation failed
            await refundSparks(user.id, sparkCost, generationId, genError.message || 'Image generation failed');
            
            const isQuotaError =
                genError.message?.toLowerCase().includes('quota') ||
                genError.message?.toLowerCase().includes('rate limit') ||
                genError.message?.includes('429') ||
                (genError as any).status === 429;

            if (isQuotaError) {
                return NextResponse.json({
                    error: 'Limite de uso atingido. Tente novamente em alguns minutos.',
                    code: 'QUOTA_EXCEEDED',
                    provider: provider,
                    sparksRefunded: sparkCost,
                }, { status: 429 });
            }

            throw genError;
        }

    } catch (error: any) {
        const duration = Date.now() - startTime;

        return NextResponse.json({
            error: error.message || 'Erro desconhecido ao gerar imagem',
            details: error.toString(),
            provider: provider,
            duration: `${duration}ms`,
        }, { status: 500 });
    }
}
