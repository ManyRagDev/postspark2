// ==============================================
// EDIT SETTINGS - Controle Total Types
// ==============================================

import type { AmbientConfig } from './ambient';

// Blend modes para overlay
export type BlendMode =
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten';

// 10 Paletas de cores da V1
export type ColorPalette =
    | 'auto'
    | 'warm_night'
    | 'ocean'
    | 'vibrant_green'
    | 'sunset'
    | 'night_mode'
    | 'forest'
    | 'crimson'
    | 'indigo'
    | 'peachy'
    | 'cyber';

// Grid 3x3 de posições
export type TextPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'center-left'
    | 'center'
    | 'center-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

// Alinhamento de texto
export type TextAlignment = 'left' | 'center' | 'right';

// ==============================================
// IMAGE SETTINGS
// ==============================================
export interface ImageSettings {
    zoom: number;           // 0.5 - 3.0 (default: 1.0)
    brightness: number;     // 0 - 2 (default: 1.0)
    contrast: number;       // 0 - 2 (default: 1.0)
    saturation: number;     // 0 - 2 (default: 1.0)
    blur: number;           // 0 - 20px (default: 0)
    overlayOpacity: number; // 0 - 1 (default: 0.5)
    overlayColor: string;   // hex color (default: '#000000')
    blendMode: BlendMode;   // CSS blend mode (default: 'normal')
}

// ==============================================
// DESIGN SETTINGS
// ==============================================
export interface DesignSettings {
    palette: ColorPalette;
    customColors?: {
        bg: string;
        text: string;
        accent: string;
    };
}

// ==============================================
// LAYOUT SETTINGS
// ==============================================
// ==============================================
// LAYOUT SETTINGS
// ==============================================
// ==============================================
// LAYOUT SETTINGS
// ==============================================
export interface LayoutSettings {
    // Legacy mapping (optional, for compatibility)
    position?: TextPosition;
    textAlign?: TextAlignment;

    // Global
    padding: number;        // 0 - 100px (default: 24)

    // Granular Controls
    headline: {
        position: TextPosition;
        textAlign: TextAlignment;
        customPosition?: { x: number; y: number }; // Percentage 0-100
    };
    body: {
        position: TextPosition;
        textAlign: TextAlignment;
        customPosition?: { x: number; y: number }; // Percentage 0-100
    };
}

// ==============================================
// TEXT SETTINGS
// ==============================================
export interface TextSettings {
    headlineContent?: string;
    bodyContent?: string;
    fontScale: number;      // 0.5 - 2.0 (default: 1.0)
}

// ==============================================
// SLIDE OVERRIDES
// ==============================================
// DeepPartial-like structure for overrides
export interface SlideOverrides {
    hasOverride: boolean; // Flag to indicate if this slide has any override
    image?: Partial<ImageSettings>;
    design?: Partial<DesignSettings>;
    layout?: {
        padding?: number;
        headline?: Partial<LayoutSettings['headline']>;
        body?: Partial<LayoutSettings['body']>;
    };
    text?: Partial<TextSettings>;
}

// ==============================================
// MAIN EDIT SETTINGS
// ==============================================
export interface EditSettings {
    isManualOverride: boolean;
    image: ImageSettings;
    design: DesignSettings;
    layout: LayoutSettings;
    text: TextSettings;

    // Slide Specifics
    currentSlideIndex: number;
    slideOverrides: Record<number, SlideOverrides>;
}

// ==============================================
// DEFAULT VALUES
// ==============================================
export const DEFAULT_IMAGE_SETTINGS: ImageSettings = {
    zoom: 1.0,
    brightness: 1.0,
    contrast: 1.0,
    saturation: 1.0,
    blur: 0,
    overlayOpacity: 0.5,
    overlayColor: '#000000',
    blendMode: 'normal',
};

export const DEFAULT_DESIGN_SETTINGS: DesignSettings = {
    palette: 'auto',
};

export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
    padding: 24,
    headline: {
        position: 'center',
        textAlign: 'center',
    },
    body: {
        position: 'bottom-center',
        textAlign: 'center',
    },
};

export const DEFAULT_TEXT_SETTINGS: TextSettings = {
    fontScale: 1.0,
};

export function createDefaultEditSettings(): EditSettings {
    return {
        isManualOverride: false,
        image: { ...DEFAULT_IMAGE_SETTINGS },
        design: { ...DEFAULT_DESIGN_SETTINGS },
        layout: { ...DEFAULT_LAYOUT_SETTINGS },
        text: { ...DEFAULT_TEXT_SETTINGS },
        currentSlideIndex: 0,
        slideOverrides: {},
    };
}

// ==============================================
// BACKGROUND SETTINGS (já existia, mantendo compatibilidade)
// ==============================================
export interface BackgroundSettings {
    type: 'gallery' | 'upload' | 'ai';
    url?: string;
    overlayOpacity: number;
    overlayColor?: string;
    imagePosition: { x: number; y: number };
}

// ==============================================
// PALETTE DATA STRUCTURE
// ==============================================
export interface PaletteData {
    id: ColorPalette;
    name: string;
    description: string;
    colors: {
        bg: string;
        text: string;
        accent: string;
    };
    preview: string;  // CSS gradient for preview
    bestFor: string[];
}
