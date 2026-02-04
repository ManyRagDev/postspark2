'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { AmbientState } from '@/types/ambient';
import type {
    GeneratedContent,
    PipelineOptions,
    PipelineResult,
    PostFormat,
    ImageStyle
} from '@/types/api';

export interface PostGenerationState {
    isLoading: boolean;
    stage: 'idle' | 'generating-content' | 'composing-image' | 'done' | 'error';
    progress: number;
    content: GeneratedContent | null;
    imageBlob: Blob | null;
    error: string | null;
}

export function usePostGeneration() {
    const [state, setState] = useState<PostGenerationState>({
        isLoading: false,
        stage: 'idle',
        progress: 0,
        content: null,
        imageBlob: null,
        error: null,
    });

    const updateStage = useCallback((
        stage: PostGenerationState['stage'],
        progress: number
    ) => {
        setState(prev => ({ ...prev, stage, progress }));
    }, []);

    /**
     * Executa a pipeline completa: Gemini → Layout → Sharp
     */
    const generate = useCallback(async (options: PipelineOptions): Promise<PipelineResult> => {
        setState({
            isLoading: true,
            stage: 'generating-content',
            progress: 10,
            content: null,
            imageBlob: null,
            error: null,
        });

        try {
            // ETAPA 1: Gerar conteúdo com Gemini (ou usar texto original)
            updateStage('generating-content', 30);

            let content: GeneratedContent;

            if (options.useAI) {
                const contentResponse = await fetch('/api/generate-content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: options.text,
                        state: options.state,
                        format: options.format,
                    }),
                });

                if (!contentResponse.ok) {
                    throw new Error('Falha ao gerar conteúdo com IA');
                }

                content = await contentResponse.json();
                // console.log('[usePostGeneration] Content recebido da API:', {
                //     hasSlides: !!content.slides,
                //     slidesCount: content.slides?.length,
                //     headline: content.headline?.substring(0, 50)
                // });
            } else {
                // Fallback sem IA
                content = {
                    headline: options.text.length > 60 ? options.text.slice(0, 60) + '...' : options.text,
                    body: '',
                    caption: options.text,
                    hashtags: ['#postspark'],
                };
            }

            setState(prev => ({ ...prev, content, progress: 50 }));

            // ETAPA 2: Compor imagem com Sharp (apenas para posts estáticos)
            // Para carrossel, mantemos o preview interativo
            let imageBlob: Blob | null = null;

            if (options.format !== 'carousel') {
                updateStage('composing-image', 70);

                const composeResponse = await fetch('/api/compose-post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        headline: content.headline,
                        body: content.body,
                        state: options.state,
                        backgroundUrl: options.backgroundUrl,
                        overlayOpacity: options.overlayOpacity,
                    }),
                });

                if (!composeResponse.ok) {
                    throw new Error('Falha ao compor imagem');
                }

                imageBlob = await composeResponse.blob();
            }

            // SUCESSO!
            setState({
                isLoading: false,
                stage: 'done',
                progress: 100,
                content,
                imageBlob,
                error: null,
            });

            return { success: true, content, imageBlob: imageBlob || undefined };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

            setState({
                isLoading: false,
                stage: 'error',
                progress: 0,
                content: null,
                imageBlob: null,
                error: errorMessage,
            });

            return { success: false, error: errorMessage };
        }
    }, [updateStage]);

    /**
     * Faz download do post gerado
     */
    const downloadPost = useCallback(() => {
        if (!state.imageBlob) return;

        const url = URL.createObjectURL(state.imageBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `postspark-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [state.imageBlob]);

    /**
     * Copia a legenda para a área de transferência
     */
    const copyCaption = useCallback(async () => {
        if (!state.content?.caption) return false;

        try {
            const captionWithHashtags = `${state.content.caption}\n\n${state.content.hashtags.join(' ')}`;
            await navigator.clipboard.writeText(captionWithHashtags);
            return true;
        } catch {
            return false;
        }
    }, [state.content]);

    /**
     * Reset do estado
     */
    const reset = useCallback(() => {
        setState({
            isLoading: false,
            stage: 'idle',
            progress: 0,
            content: null,
            imageBlob: null,
            error: null,
        });
    }, []);

    // Auto-dismiss: reseta para 'idle' após 10 segundos quando stage === 'done'
    useEffect(() => {
        if (state.stage === 'done') {
            const timer = setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    stage: 'idle',
                }));
            }, 10000); // 10 segundos
            return () => clearTimeout(timer);
        }
    }, [state.stage]);

    return {
        ...state,
        generate,
        downloadPost,
        copyCaption,
        reset,
    };
}

export type { PostFormat, ImageStyle };
