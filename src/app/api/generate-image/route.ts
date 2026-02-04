import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// ============ TYPES ============

interface GenerateImageBody {
    prompt: string;
    isComplex: boolean;
}

type ImageProvider = 'pollinations' | 'gemini';

// ============ SINGLETON CLIENT ============

const geminiClient = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY || '',
});

// ============ PROMPT WRAPPERS ============

/**
 * Wrapper para prompts do Pollinations (modo Simple)
 * Foco: gradientes, formas abstratas, fundos modernos
 * Regra Anti-Texto aplicada via prompt explícito
 */
function wrapSimplePrompt(userPrompt: string): string {
    return `Abstract background image for social media post. Theme: ${userPrompt}.
    
    CRITICAL: This is a BACKGROUND ONLY - NO text, NO letters, NO words, NO numbers, NO typography, NO writing, NO characters, NO symbols, NO logos, NO watermarks, NO captions, NO titles, NO subtitles.
    
    Style: smooth gradient colors, modern minimalist design, professional aesthetic, geometric shapes, soft lighting, suitable for text overlay.
    
    Focus: pure visual elements, colors, textures, patterns, shapes, gradients - absolutely NO written content of any kind.`;
}

/**
 * Wrapper para prompts do Gemini (modo Complex)
 * Foco: realismo, detalhes, imagens personalizadas
 * Regra Anti-Texto aplicada via instrução explícita
 */
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

/**
 * Gera imagem usando Pollinations Flux (modo Simple)
 * Fetches the actual image and returns as base64 data URI
 */
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

    // Build URL using gen.pollinations.ai endpoint (API gateway)
    const url = `https://gen.pollinations.ai/image/${encodedPrompt}?${params.toString()}`;

    // console.log(`[Pollinations] Generated URL: ${url.slice(0, 100)}...`);
    // console.log(`[Pollinations] Fetching image from URL...`);

    // Build headers with Authorization if API key is available
    const headers: Record<string, string> = {};
    if (process.env.POLLINATIONS_API_KEY) {
        headers['Authorization'] = `Bearer ${process.env.POLLINATIONS_API_KEY}`;
    }

    // Fetch the actual image with timeout and retry
    const maxRetries = 3;
    const timeout = 30000; // 30 seconds
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // console.log(`[Pollinations] Fetch attempt ${attempt}/${maxRetries}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(url, {
                signal: controller.signal,
                headers,
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType?.startsWith('image/')) {
                throw new Error(`Unexpected content type: ${contentType}`);
            }
            
            const imageBuffer = Buffer.from(await response.arrayBuffer());
            const base64Image = imageBuffer.toString('base64');
            const mimeType = contentType || 'image/png';
            
            // console.log(`[Pollinations] Image fetched successfully - Size: ${(imageBuffer.length / 1024).toFixed(1)}KB`);
            
            return `data:${mimeType};base64,${base64Image}`;
            
        } catch (error: any) {
            // console.error(`[Pollinations] Attempt ${attempt} failed:`, error.message);

            if (attempt === maxRetries) {
                throw new Error(`Failed to fetch image after ${maxRetries} attempts: ${error.message}`);
            }
            
            // Wait before retry (exponential backoff)
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            // console.log(`[Pollinations] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw new Error('Unexpected error in image generation');
}

/**
 * Gera imagem usando Gemini (modo Complex)
 * Retorna base64 data URI
 */
async function generateWithGemini(prompt: string): Promise<string> {
    const wrappedPrompt = wrapComplexPrompt(prompt);
    const model = "gemini-2.0-flash-exp-image-generation";

    // console.log(`[Gemini] Using model: ${model}`);
    // console.log(`[Gemini] Wrapped prompt length: ${wrappedPrompt.length} chars`);

    const response = await geminiClient.models.generateContent({
        model: model,
        contents: wrappedPrompt,
        config: {
            responseModalities: ['IMAGE', 'TEXT'],
        }
    } as any);

    // Log da estrutura da resposta para debug
    // console.log('[Gemini] Response received, checking for image...');

    const imagePart = response.candidates?.[0]?.content?.parts?.find(
        (part: any) => part.inlineData
    );

    if (!imagePart?.inlineData?.data) {
        // console.error('[Gemini] No image data in response');
        throw new Error("Gemini did not return an image. Try a different prompt or use Simple mode.");
    }

    // console.log('[Gemini] Image extracted successfully');
    return `data:image/png;base64,${imagePart.inlineData.data}`;
}

// ============ MAIN HANDLER ============

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    let provider: ImageProvider = 'pollinations';

    try {
        const body: GenerateImageBody = await req.json();
        const { prompt, isComplex = false } = body;

        // Validação do prompt
        if (!prompt?.trim()) {
            return NextResponse.json(
                { error: 'Prompt is required', code: 'INVALID_PROMPT' },
                { status: 400 }
            );
        }

        // Validação de comprimento (proteção contra DoS/abuso)
        const MAX_PROMPT_LENGTH = 500;
        if (prompt.length > MAX_PROMPT_LENGTH) {
            return NextResponse.json(
                { error: `Prompt muito longo. Máximo: ${MAX_PROMPT_LENGTH} caracteres`, code: 'PROMPT_TOO_LONG' },
                { status: 400 }
            );
        }

        // console.log(`\n========== IMAGE GENERATION REQUEST ==========`);
        // console.log(`[ImageGen] Mode: ${isComplex ? 'COMPLEX (Gemini)' : 'SIMPLE (Pollinations)'}`);
        // console.log(`[ImageGen] Prompt: "${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}"`);

        if (isComplex) {
            // ============ COMPLEX MODE: GEMINI ============
            provider = 'gemini';

            if (!process.env.GOOGLE_API_KEY) {
                // console.error('[Gemini] API key not configured');
                return NextResponse.json(
                    { error: 'GOOGLE_API_KEY not configured', code: 'CONFIG_ERROR' },
                    { status: 500 }
                );
            }

            try {
                const base64Image = await generateWithGemini(prompt);
                const duration = Date.now() - startTime;

                // console.log(`[ImageGen] SUCCESS - Gemini - ${duration}ms`);
                // console.log(`==========================================\n`);

                return NextResponse.json({
                    image: base64Image,
                    provider: 'gemini'
                });

            } catch (geminiError: any) {
                // Tratamento específico para erro de quota
                const isQuotaError =
                    geminiError.message?.toLowerCase().includes('quota') ||
                    geminiError.message?.toLowerCase().includes('rate limit') ||
                    geminiError.message?.includes('429') ||
                    geminiError.status === 429;

                if (isQuotaError) {
                    // console.error('[Gemini] QUOTA EXCEEDED');
                    return NextResponse.json({
                        error: 'Limite de uso do Gemini atingido. Tente o modo Simples ou aguarde alguns minutos.',
                        code: 'QUOTA_EXCEEDED',
                        provider: 'gemini'
                    }, { status: 429 });
                }

                // Re-throw outros erros
                throw geminiError;
            }

        } else {
            // ============ SIMPLE MODE: POLLINATIONS ============
            provider = 'pollinations';

            const imageData = await generateWithPollinations(prompt);
            const duration = Date.now() - startTime;

            // console.log(`[ImageGen] SUCCESS - Pollinations - ${duration}ms`);
            // console.log(`==========================================\n`);

            return NextResponse.json({
                image: imageData,
                provider: 'pollinations'
            });
        }

    } catch (error: any) {
        const duration = Date.now() - startTime;

        // console.error(`[ImageGen] ERROR - ${provider} - ${duration}ms`);
        // console.error(`[ImageGen] Error message: ${error.message}`);
        // console.error(`==========================================\n`);

        // if (error.response) {
        //     console.error("[ImageGen] Response details:", JSON.stringify(error.response, null, 2));
        // }

        return NextResponse.json({
            error: error.message || 'Erro desconhecido ao gerar imagem',
            details: error.toString(),
            provider: provider
        }, { status: 500 });
    }
}
