import { motion } from 'framer-motion';
import { useEffect } from 'react';
import type { AmbientConfig } from '@/types/ambient';
import type { EditSettings, LayoutSettings } from '@/types/editor';
import { LayoutCentered } from './layouts/LayoutCentered';
import { LayoutHierarchy } from './layouts/LayoutHierarchy';
import { LayoutSplit } from './layouts/LayoutSplit';
import { LayoutCard } from './layouts/LayoutCard';
import { LayoutHeadline } from './layouts/LayoutHeadline';
import { LayoutCarousel } from './layouts/LayoutCarousel';
import { WatermarkOverlay } from '@/components/Watermark';
import { useUser } from '@/contexts/UserContext';

export interface PostPreviewProps {
    text: string;
    bodyText?: string;
    config: AmbientConfig;
    imageUrl?: string;
    slides?: string[];
    editSettings?: EditSettings;
    currentSlide?: number;
    onSlideChange?: (index: number) => void;
    onLayoutUpdate?: (updates: Partial<LayoutSettings>) => void;
    overlayOpacity?: number;
    overlayColor?: string;
    /**
     * Enable Fidelity Guard protection (low-res preview + watermark)
     * Default: true for security
     */
    enableProtection?: boolean;
    /**
     * Max width for preview (for low-res rendering)
     * Default: 400px for Fidelity Guard
     */
    maxPreviewWidth?: number;
}

export function PostPreview({
    text,
    bodyText,
    config,
    imageUrl,
    slides,
    editSettings,
    currentSlide,
    onSlideChange,
    onLayoutUpdate,
    overlayOpacity: overlayOpacityProp,
    overlayColor: overlayColorProp,
    enableProtection = true,
    maxPreviewWidth = 400,
}: PostPreviewProps) {
    // Get user plan for watermark
    const { profile } = useUser();
    const userPlan = profile?.plan || 'FREE';
    // Compute image filters from editSettings
    const imageFilters = editSettings?.image ? {
        filter: `
            brightness(${editSettings.image.brightness})
            contrast(${editSettings.image.contrast})
            saturate(${editSettings.image.saturation})
            blur(${editSettings.image.blur}px)
        `.trim(),
        transform: `scale(${editSettings.image.zoom})`,
    } : {};

    // Get overlay settings (explicit prop override -> editSettings -> config)
    const overlayOpacity = typeof overlayOpacityProp === 'number'
        ? overlayOpacityProp
        : editSettings?.image?.overlayOpacity ?? config.overlayOpacity ?? 0.5;

    const overlayColor = overlayColorProp
        ? overlayColorProp
        : editSettings?.image?.overlayColor ?? config.theme.bg;
    const blendMode = editSettings?.image?.blendMode ?? 'normal';

    // Get text to display (prefer editSettings text overrides)
    const displayText = editSettings?.text?.headlineContent || text;
    const displayBody = editSettings?.text?.bodyContent || bodyText;

    // Get font scale
    const fontScale = editSettings?.text?.fontScale ?? 1;

    // Get text alignment
    const textAlign = editSettings?.layout?.textAlign ?? 'center';

    // Compute effective layout merging global layout with any slide override (if present)
    const globalLayout = editSettings?.layout ?? { padding: 24, headline: { position: 'center', textAlign: 'center' }, body: { position: 'center', textAlign: 'center' } };
    const slideLayoutOverride = (currentSlide !== undefined && editSettings?.slideOverrides?.[currentSlide]?.layout) || undefined;

    const effectiveLayout = slideLayoutOverride
        ? {
            ...globalLayout,
            ...(slideLayoutOverride as any),
            headline: { ...globalLayout.headline, ...(slideLayoutOverride.headline || {}) },
            body: { ...globalLayout.body, ...(slideLayoutOverride.body || {}) }
        }
        : globalLayout;
    
    // if (slideLayoutOverride) {
    //     console.log('[EFFECTIVE LAYOUT] PostPreview merged:', {
    //         currentSlide,
    //         globalHeadlinePos: globalLayout.headline.position,
    //         overrideHeadlinePos: slideLayoutOverride.headline?.position,
    //         effectiveHeadlinePos: effectiveLayout.headline.position,
    //         globalBodyPos: globalLayout.body.position,
    //         effectiveBodyPos: effectiveLayout.body.position
    //     });
    // }

    // Get padding
    const padding = effectiveLayout?.padding ?? 24;
    useEffect(() => {
        // console.debug('[PostPreview] imagePosition:', config.imagePosition, 'overlayOpacity:', overlayOpacity, 'overlayColor:', overlayColor);
    }, [config.imagePosition, overlayOpacity, overlayColor]);
    // ...
    const renderLayout = () => {
        const layoutProps = {
            text: displayText,
            bodyText: displayBody,
            config,
            imageUrl,
            fontScale,
            textAlign,
            headlineSettings: effectiveLayout.headline,
            bodySettings: effectiveLayout.body,
            // New props
            currentSlide,
            onSlideChange,
            onLayoutUpdate
        };

        switch (config.layout) {
            case 'centered':
                return <LayoutCentered {...layoutProps} />;
            case 'hierarchy':
                return <LayoutHierarchy {...layoutProps} />;
            case 'split':
                return <LayoutSplit {...layoutProps} />;
            case 'card':
                return <LayoutCard {...layoutProps} />;
            case 'headline':
                return <LayoutHeadline {...layoutProps} />;
            case 'carousel':
                return <LayoutCarousel {...layoutProps} slides={slides} />;
            default:
                return <LayoutCentered {...layoutProps} />;
        }
    };

    return (
        <div className="space-y-4">
            {/* Preview Header */}
            <div className="flex items-center justify-between">
                <h2
                    className="text-sm font-medium opacity-60"
                    style={{ color: config.theme.text }}
                >
                    Preview do Post
                </h2>
                <span
                    className="text-xs px-2 py-1 rounded-lg bg-white/10"
                    style={{ color: config.theme.accent }}
                >
                    Layout: {config.layout}
                </span>
            </div>

            {/* Preview Container */}
            <motion.div
                className={`relative w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${config.aspectRatio === '9:16' ? 'aspect-[9/16]' :
                    config.aspectRatio === '5:6' ? 'aspect-[5/6]' : 'aspect-square'
                    }`}
                style={{
                    backgroundColor: config.theme.bg,
                    boxShadow: `0 25px 50px -12px ${config.theme.accent}30`,
                    // Fidelity Guard: Limit max width for low-res preview
                    maxWidth: enableProtection ? maxPreviewWidth : undefined,
                    // Fidelity Guard: CSS pixelation for preview
                    imageRendering: enableProtection ? 'pixelated' : 'auto',
                }}
                animate={{
                    backgroundColor: config.theme.bg,
                    boxShadow: `0 25px 50px -12px ${config.theme.accent}30`,
                }}
                transition={{ duration: 0.5 }}
            >
                {/* Background Image Layer with Edit Settings */}
                {imageUrl && (
                    <div className="absolute inset-0 overflow-hidden">
                        <img
                            src={imageUrl}
                            alt=""
                            className="w-full h-full object-cover transition-all duration-300"
                            style={{
                                objectPosition: config.imagePosition ? `${config.imagePosition.x}% ${config.imagePosition.y}%` : 'center',
                                ...imageFilters,
                                transformOrigin: 'center center',
                            }}
                        />
                        {/* Overlay Dinamico com EditSettings */}
                        <div
                            className="absolute inset-0 transition-all duration-300"
                            style={{
                                backgroundColor: overlayColor,
                                opacity: overlayOpacity,
                                mixBlendMode: blendMode,
                            }}
                        />
                    </div>
                )}
                {/* Background gradient */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: `radial-gradient(ellipse at center, ${config.theme.accent}30 0%, transparent 70%)`,
                    }}
                />

                {/* Content */}
                <div
                    className="relative h-full w-full flex items-center justify-center transition-all duration-300"
                    style={{ padding: `${padding}px` }}
                >
                    {displayText.trim() ? (
                        renderLayout()
                    ) : (
                        <div
                            className="text-center opacity-40"
                            style={{ color: config.theme.text }}
                        >
                            <p className="text-lg">✨</p>
                            <p className="text-sm mt-2">Seu post aparecerá aqui</p>
                        </div>
                    )}
                </div>

                {/* Decorative elements based on state */}
                {config.state === 'motivational' && (
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
                        style={{
                            background: `linear-gradient(to top, ${config.theme.accent}20, transparent)`,
                        }}
                        animate={{
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                )}

                {config.state === 'promotional' && (
                    <div
                        className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                            backgroundColor: config.theme.accent,
                            color: '#fff',
                        }}
                    >
                        🔥 OFERTA
                    </div>
                )}

                {/* Fidelity Guard: Watermark Overlay */}
                {enableProtection && (
                    <WatermarkOverlay
                        plan={userPlan}
                        className="z-20"
                    />
                )}
            </motion.div>

            {/* Fidelity Guard: Preview quality indicator */}
            {enableProtection && (
                <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-500">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Preview em baixa resolução</span>
                    <span className="text-gray-600">•</span>
                    <span>Download em alta qualidade disponível</span>
                </div>
            )}
        </div>
    );
}
