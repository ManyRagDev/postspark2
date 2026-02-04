// Core Ambient Intelligence Types

export type AmbientState =
    | 'neutral'
    | 'motivational'
    | 'informative'
    | 'promotional'
    | 'personal'
    | 'educational'
    | 'controversial';

export type LayoutType =
    | 'centered'
    | 'card'
    | 'hierarchy'
    | 'split'
    | 'carousel'
    | 'headline';

export type PostAspectRatio = '1:1' | '5:6' | '9:16';

export interface ImagePosition {
    x: number;
    y: number;
}

export interface AmbientTheme {
    bg: string;
    text: string;
    accent: string;
    className: string;
}

/**
 * Estrutura hierárquica de keywords com pesos diferenciados
 * - primary: palavras-chave fortes (peso 3x)
 * - secondary: palavras de apoio (peso 1x)
 * - exclude: palavras que invalidam o estado
 */
export interface KeywordConfig {
    primary: string[];
    secondary: string[];
    exclude: string[];
}

export interface AmbientConfig {
    state: AmbientState;
    label: string;
    emoji: string;
    keywords: KeywordConfig;
    theme: AmbientTheme;
    layout: LayoutType;
    ctaText: string;
    // Novos campos para controle de mídia
    overlayOpacity?: number;
    imagePosition?: ImagePosition;
    aspectRatio?: PostAspectRatio;
}

export interface AmbientResult {
    state: AmbientState;
    config: AmbientConfig;
    confidence: number;
    reset: () => void;
}

export interface KeywordMatch {
    state: AmbientState;
    score: number;
    matches: string[];
}
