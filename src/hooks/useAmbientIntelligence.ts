import { useState, useEffect, useMemo, useCallback } from 'react';
import type { AmbientState, AmbientConfig, AmbientResult } from '@/types/ambient';
import { detectAmbientState } from '@/lib/keywordDetector';
import { getAmbientConfig, getDefaultConfig } from '@/lib/ambientStates';

const DEBOUNCE_MS = 150;

/**
 * Hook principal para Inteligência Ambiental
 * Processa o texto do usuário e retorna o estado detectado com configurações
 */
export function useAmbientIntelligence(text: string): AmbientResult {
    const [debouncedText, setDebouncedText] = useState(text);
    const [isForced, setIsForced] = useState(false);
    const [forcedState, setForcedState] = useState<AmbientState>('neutral');

    // Debounce do texto para evitar processamento excessivo
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedText(text);
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [text]);

    // Detecta o estado baseado no texto (memoizado)
    const detection = useMemo(() => {
        if (isForced) {
            return {
                state: forcedState,
                confidence: 100,
                matches: [],
            };
        }
        return detectAmbientState(debouncedText);
    }, [debouncedText, isForced, forcedState]);

    // Obtém a configuração do estado detectado
    const config: AmbientConfig = useMemo(() => {
        return getAmbientConfig(detection.state);
    }, [detection.state]);

    // Função para resetar para o estado neutro
    const reset = useCallback(() => {
        setIsForced(true);
        setForcedState('neutral');
    }, []);

    // Função para forçar um estado específico
    const forceState = useCallback((state: AmbientState) => {
        setIsForced(true);
        setForcedState(state);
    }, []);

    // Remove o estado forçado quando o texto muda significativamente
    useEffect(() => {
        if (isForced && text.length > debouncedText.length + 10) {
            setIsForced(false);
        }
    }, [text, debouncedText, isForced]);

    return {
        state: detection.state,
        config,
        confidence: detection.confidence,
        reset,
    };
}

/**
 * Hook para acessar apenas o tema do estado atual
 */
export function useAmbientTheme(state: AmbientState) {
    return useMemo(() => {
        const config = getAmbientConfig(state);
        return config.theme;
    }, [state]);
}

/**
 * Hook para verificar se o input é "pobre" (precisa de ajuda)
 * Usado pelo MagicPencil
 */
export function useInputQuality(text: string): {
    isPoor: boolean;
    reason: string;
} {
    return useMemo(() => {
        const trimmed = text.trim();

        if (trimmed.length === 0) {
            return { isPoor: false, reason: '' };
        }

        if (trimmed.length < 20) {
            return { isPoor: true, reason: 'Texto muito curto' };
        }

        const words = trimmed.split(/\s+/);
        if (words.length < 4) {
            return { isPoor: true, reason: 'Poucas palavras' };
        }

        // Verifica se há repetição excessiva
        const uniqueWords = new Set(words.map(w => w.toLowerCase()));
        if (uniqueWords.size < words.length * 0.5) {
            return { isPoor: true, reason: 'Muita repetição' };
        }

        return { isPoor: false, reason: '' };
    }, [text]);
}
