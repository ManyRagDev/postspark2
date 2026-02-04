import type { AmbientState } from '@/types/ambient';

// Tipos para as APIs

export interface GenerateContentRequest {
    text: string;
    state: AmbientState;
    format: 'static' | 'carousel';
}

export interface GeneratedContent {
    headline: string;
    body: string;
    caption: string;
    hashtags: string[];
    slides?: string[];
}

export interface ComposePostRequest {
    headline: string;
    body?: string;
    state: AmbientState;
    backgroundUrl?: string;
    overlayOpacity?: number;
    imagePosition?: { x: number; y: number };
    aspectRatio?: '1:1' | '5:6' | '9:16';
    width?: number;
    height?: number;
}

export interface GenerateImageRequest {
    prompt: string;
    isComplex: boolean;  // true = Gemini (realistic), false = Pollinations (abstract)
    style?: 'realistic' | '3d' | 'ghibli' | 'anime' | 'minimal';  // Reserved for future use
}

export type ImageProvider = 'pollinations' | 'gemini';

export type ImageGenErrorCode = 'QUOTA_EXCEEDED' | 'INVALID_PROMPT' | 'CONFIG_ERROR' | 'PROVIDER_ERROR';

export interface GenerateImageResponse {
    image?: string;       // base64 data URI (Gemini/Complex mode)
    url?: string;         // Direct URL (Pollinations/Simple mode)
    provider: ImageProvider;
    error?: string;
    code?: ImageGenErrorCode;
    details?: string;
}

// Tipos para o Pipeline

export type PostFormat = 'static' | 'carousel';

export type ImageStyle = 'realistic' | '3d' | 'ghibli' | 'anime' | 'minimal';

export interface PipelineOptions {
    text: string;
    state: AmbientState;
    format: PostFormat;
    imageStyle: ImageStyle;
    backgroundUrl?: string;
    overlayOpacity?: number;
    imagePosition?: { x: number; y: number };
    aspectRatio?: '1:1' | '5:6' | '9:16';
    useAI: boolean;
}

export interface PipelineResult {
    success: boolean;
    content?: GeneratedContent;
    imageBlob?: Blob;
    error?: string;
}
