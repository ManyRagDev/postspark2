import type { AmbientState, KeywordMatch } from '@/types/ambient';
import { AMBIENT_STATES } from './ambientStates';

/**
 * Normaliza texto para matching
 * - Lowercase
 * - Remove acentos
 * - Remove pontuação extra
 */
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^\w\s%$]/g, ' ') // Mantém % e $ para promos
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Calcula o score de match para um estado específico
 * Usa pesos diferenciados: primary (6 pontos), secondary (2 pontos)
 * Exclusões invalidam o estado completamente
 */
function calculateStateScore(
    normalizedText: string,
    state: AmbientState
): KeywordMatch {
    const config = AMBIENT_STATES[state];
    const keywords = config.keywords;
    const matches: string[] = [];
    let score = 0;

    // Verificar exclusões primeiro - invalidam o estado
    for (const excludeWord of keywords.exclude) {
        const normalizedExclude = normalizeText(excludeWord);
        if (normalizedText.includes(normalizedExclude)) {
            return { state, score: -100, matches: [] }; // Estado invalidado
        }
    }

    // Keywords primárias (peso 6 - equivalente a 3x do peso base)
    for (const keyword of keywords.primary) {
        const normalizedKeyword = normalizeText(keyword);

        // Match exato (palavra completa)
        const exactRegex = new RegExp(`\\b${normalizedKeyword}\\b`, 'gi');
        if (exactRegex.test(normalizedText)) {
            score += 6; // Peso alto para keywords primárias
            matches.push(keyword);
        } else if (normalizedText.includes(normalizedKeyword)) {
            // Match parcial
            score += 3;
            matches.push(keyword);
        }
    }

    // Keywords secundárias (peso 2)
    for (const keyword of keywords.secondary) {
        const normalizedKeyword = normalizeText(keyword);

        const exactRegex = new RegExp(`\\b${normalizedKeyword}\\b`, 'gi');
        if (exactRegex.test(normalizedText)) {
            score += 2;
            matches.push(keyword);
        } else if (normalizedText.includes(normalizedKeyword)) {
            score += 1;
            matches.push(keyword);
        }
    }

    // Bonus para múltiplos matches (indica maior certeza)
    if (matches.length >= 3) {
        score *= 1.3;
    }

    return { state, score, matches };
}

// Threshold mínimo: precisa de pelo menos 1 keyword primária (score >= 6)
const MINIMUM_SCORE_THRESHOLD = 6;

/**
 * Detecta o estado ambiental dominante do texto
 * Retorna o estado com maior score, ou 'neutral' se nenhum for detectado
 */
export function detectAmbientState(text: string): {
    state: AmbientState;
    confidence: number;
    matches: string[];
} {
    if (!text || text.trim().length < 3) {
        return { state: 'neutral', confidence: 0, matches: [] };
    }

    const normalizedText = normalizeText(text);
    const results: KeywordMatch[] = [];

    // Calcula score para cada estado (exceto neutral)
    const states = Object.keys(AMBIENT_STATES).filter(
        (s) => s !== 'neutral'
    ) as AmbientState[];

    for (const state of states) {
        const result = calculateStateScore(normalizedText, state);
        if (result.score > 0) {
            results.push(result);
        }
    }

    // Ordena por score decrescente
    results.sort((a, b) => b.score - a.score);

    // Se não há matches ou score abaixo do threshold, retorna neutral
    if (results.length === 0 || results[0].score < MINIMUM_SCORE_THRESHOLD) {
        return { state: 'neutral', confidence: 0, matches: [] };
    }

    const winner = results[0];

    // Calcula confiança (0-100)
    // Baseado no score relativo ao threshold e quantidade de matches
    const confidence = Math.min(100, Math.round((winner.score / 20) * 100));

    return {
        state: winner.state,
        confidence,
        matches: winner.matches,
    };
}

/**
 * Retorna todos os estados detectados ordenados por relevância
 * Útil para sugestões secundárias
 */
export function detectAllAmbientStates(text: string): KeywordMatch[] {
    if (!text || text.trim().length < 3) {
        return [];
    }

    const normalizedText = normalizeText(text);
    const results: KeywordMatch[] = [];

    const states = Object.keys(AMBIENT_STATES).filter(
        (s) => s !== 'neutral'
    ) as AmbientState[];

    for (const state of states) {
        const result = calculateStateScore(normalizedText, state);
        if (result.score >= MINIMUM_SCORE_THRESHOLD) {
            results.push(result);
        }
    }

    return results.sort((a, b) => b.score - a.score);
}
