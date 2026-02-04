import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import type { AmbientState } from '@/types/ambient';

export interface GenerateContentRequest {
    text: string;
    state: AmbientState;
    format: 'static' | 'carousel';
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateContentRequest = await request.json();
        // console.log('API generate-content chamada com:', { text: body.text, state: body.state, keyAvailable: !!process.env.GOOGLE_API_KEY });

        if (!body.text || !body.state) {
            return NextResponse.json(
                { error: 'Missing required fields: text, state' },
                { status: 400 }
            );
        }

        const content = await generateContent({
            text: body.text,
            state: body.state,
            format: body.format || 'static',
        });

        // console.log('Conteúdo gerado:', content);
        // console.log('[API generate-content] Enviando para cliente:', {
        //     hasSlides: !!content.slides,
        //     slidesCount: content.slides?.length,
        //     slides: content.slides
        // });

        return NextResponse.json(content);
    } catch (error) {
        // console.error('API /generate-content error:', error);
        return NextResponse.json(
            { error: 'Failed to generate content' },
            { status: 500 }
        );
    }
}
