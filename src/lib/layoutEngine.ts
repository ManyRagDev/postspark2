import type { AmbientState } from '@/types/ambient';
import type { ImageMetadata, ZoneAnalysis } from './intentionZones';

/**
 * Layout Engine - Baseado nos 20 Princípios do Design
 * Calcula posicionamento, tamanho e estilo de elementos de forma DETERMINÍSTICA
 */

export interface TextElement {
    content: string;
    x: number;           // 0-1 normalizado
    y: number;           // 0-1 normalizado
    width: number;       // 0-1 normalizado
    fontSize: number;    // em pixels para 1080px
    fontWeight: 'normal' | 'bold' | 'black';
    textAlign: 'left' | 'center' | 'right';
    color: string;
    shadowColor?: string;
    shadowBlur?: number;
    lineHeight: number;
}

export interface OverlayConfig {
    type: 'gradient' | 'solid' | 'vignette';
    color: string;
    opacity: number;
    direction?: 'top' | 'bottom' | 'center';
}

export interface LayoutConfig {
    elements: TextElement[];
    overlay: OverlayConfig;
    badge?: {
        text: string;
        x: number;
        y: number;
        bgColor: string;
        textColor: string;
    };
}

// Design tokens por estado
const STATE_DESIGN_TOKENS: Record<AmbientState, {
    primaryColor: string;
    secondaryColor: string;
    overlayOpacity: number;
    fontScale: number;
}> = {
    neutral: {
        primaryColor: '#FFFFFF',
        secondaryColor: '#A0A0A0',
        overlayOpacity: 0.4,
        fontScale: 1.0,
    },
    motivational: {
        primaryColor: '#FFD700', // Dourado
        secondaryColor: '#FFFFFF',
        overlayOpacity: 0.6,
        fontScale: 1.3, // Texto GRANDE
    },
    informative: {
        primaryColor: '#FFFFFF',
        secondaryColor: '#60A5FA', // Azul claro
        overlayOpacity: 0.5,
        fontScale: 0.9,
    },
    promotional: {
        primaryColor: '#FFFFFF',
        secondaryColor: '#EF4444', // Vermelho
        overlayOpacity: 0.5,
        fontScale: 1.2,
    },
    personal: {
        primaryColor: '#F5F5DC', // Bege
        secondaryColor: '#D4A574', // Terracota
        overlayOpacity: 0.3,
        fontScale: 1.0,
    },
    educational: {
        primaryColor: '#FFFFFF',
        secondaryColor: '#10B981', // Verde
        overlayOpacity: 0.5,
        fontScale: 0.95,
    },
    controversial: {
        primaryColor: '#FFFF00', // Amarelo forte
        secondaryColor: '#FFFFFF',
        overlayOpacity: 0.7,
        fontScale: 1.4, // Manchete
    },
};

// Palavras de impacto que ganham escala maior (Princípio: Gravidade Visual)
const IMPACT_WORDS = [
    'nunca', 'sempre', 'agora', 'hoje', 'pare', 'atenção', 'urgente',
    'grátis', 'free', 'desconto', 'promoção', 'exclusivo', 'limitado',
    'absurdo', 'inacreditável', 'verdade', 'mentira', 'segredo', 'revelado',
    'você', 'seu', 'sua', 'conquiste', 'transforme', 'descubra',
];

/**
 * Detecta palavras de impacto no texto (Gravidade Visual)
 */
function detectImpactWords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word =>
        IMPACT_WORDS.some(impact => word.includes(impact))
    );
}

/**
 * Calcula tamanho de fonte baseado no comprimento do texto e estado
 */
function calculateFontSize(
    text: string,
    state: AmbientState,
    isHeadline: boolean
): number {
    const tokens = STATE_DESIGN_TOKENS[state];
    const baseSize = isHeadline ? 72 : 36;

    // Ajuste por comprimento do texto (Princípio: Escala)
    let lengthMultiplier = 1.0;
    if (text.length > 100) lengthMultiplier = 0.7;
    else if (text.length > 60) lengthMultiplier = 0.85;
    else if (text.length < 30) lengthMultiplier = 1.2;

    // Ajuste por palavras de impacto
    const impactWords = detectImpactWords(text);
    const impactMultiplier = impactWords.length > 0 ? 1.1 : 1.0;

    return Math.round(baseSize * tokens.fontScale * lengthMultiplier * impactMultiplier);
}

/**
 * Determina cor do texto baseado na luminosidade da imagem (Smart Contrast)
 */
function getTextColor(state: AmbientState, isImageDark: boolean): string {
    const tokens = STATE_DESIGN_TOKENS[state];

    // Para estados que usam cores específicas, manter
    if (state === 'motivational' || state === 'controversial') {
        return tokens.primaryColor;
    }

    // Smart Contrast: texto claro em fundo escuro e vice-versa
    return isImageDark ? '#FFFFFF' : '#1a1a1a';
}

/**
 * Calcula configuração de overlay adaptativo
 */
function calculateOverlay(
    state: AmbientState,
    zones: ZoneAnalysis,
    textPosition: string
): OverlayConfig {
    const tokens = STATE_DESIGN_TOKENS[state];

    // Determina direção do gradiente baseado na posição do texto
    let direction: 'top' | 'bottom' | 'center' = 'center';
    if (textPosition === 'top') direction = 'top';
    else if (textPosition === 'bottom') direction = 'bottom';

    // Overlay mais forte se imagem for clara (para contraste)
    const opacityBoost = zones.isImageDark ? 0 : 0.2;

    return {
        type: state === 'motivational' || state === 'controversial' ? 'vignette' : 'gradient',
        color: '#000000',
        opacity: Math.min(0.8, tokens.overlayOpacity + opacityBoost),
        direction,
    };
}

/**
 * Calcula posição do texto baseado nas zonas e estado
 */
function calculateTextPosition(
    suggestedPosition: string,
    state: AmbientState
): { x: number; y: number; width: number; textAlign: 'left' | 'center' | 'right' } {
    switch (suggestedPosition) {
        case 'center':
        case 'overlay':
            return { x: 0.1, y: 0.35, width: 0.8, textAlign: 'center' };
        case 'top':
            return { x: 0.1, y: 0.15, width: 0.8, textAlign: 'center' };
        case 'bottom':
            return { x: 0.1, y: 0.55, width: 0.8, textAlign: 'center' };
        case 'left':
            return { x: 0.05, y: 0.3, width: 0.45, textAlign: 'left' };
        case 'right':
            return { x: 0.5, y: 0.3, width: 0.45, textAlign: 'right' };
        default:
            return { x: 0.1, y: 0.4, width: 0.8, textAlign: 'center' };
    }
}

/**
 * Layout Engine Principal: calcula layout completo do post
 */
export function calculateLayout(
    headline: string,
    body: string,
    state: AmbientState,
    imageMetadata: ImageMetadata
): LayoutConfig {
    const { zones } = imageMetadata;
    const tokens = STATE_DESIGN_TOKENS[state];
    const textPosition = calculateTextPosition(zones.suggestedTextPosition, state);
    const overlay = calculateOverlay(state, zones, zones.suggestedTextPosition);

    const elements: TextElement[] = [];

    // Headline (elemento principal)
    const headlineFontSize = calculateFontSize(headline, state, true);
    elements.push({
        content: headline,
        x: textPosition.x,
        y: textPosition.y,
        width: textPosition.width,
        fontSize: headlineFontSize,
        fontWeight: state === 'controversial' ? 'black' : 'bold',
        textAlign: textPosition.textAlign,
        color: getTextColor(state, zones.isImageDark),
        shadowColor: 'rgba(0,0,0,0.5)',
        shadowBlur: state === 'motivational' ? 20 : 10,
        lineHeight: 1.2,
    });

    // Body (se existir e não for muito longo)
    if (body && body.length > 0 && body !== headline) {
        const bodyFontSize = calculateFontSize(body, state, false);
        elements.push({
            content: body,
            x: textPosition.x,
            y: textPosition.y + 0.25,
            width: textPosition.width,
            fontSize: bodyFontSize,
            fontWeight: 'normal',
            textAlign: textPosition.textAlign,
            color: tokens.secondaryColor,
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowBlur: 5,
            lineHeight: 1.4,
        });
    }

    // Badge de estado (opcional)
    const stateLabels: Record<AmbientState, string> = {
        neutral: '',
        motivational: '✨ Motivação',
        informative: '💡 Dica',
        promotional: '🔥 Oferta',
        personal: '💭 História',
        educational: '📚 Tutorial',
        controversial: '⚡ Verdade',
    };

    const badge = stateLabels[state] ? {
        text: stateLabels[state],
        x: 0.5,
        y: 0.08,
        bgColor: `${tokens.primaryColor}30`,
        textColor: tokens.primaryColor,
    } : undefined;

    return {
        elements,
        overlay,
        badge,
    };
}

/**
 * Exporta configuração para uso pelo Sharp na composição final
 */
export function layoutToSharpConfig(layout: LayoutConfig, width: number, height: number) {
    return {
        elements: layout.elements.map(el => ({
            ...el,
            x: Math.round(el.x * width),
            y: Math.round(el.y * height),
            width: Math.round(el.width * width),
        })),
        overlay: layout.overlay,
        badge: layout.badge ? {
            ...layout.badge,
            x: Math.round(layout.badge.x * width),
            y: Math.round(layout.badge.y * height),
        } : undefined,
    };
}
