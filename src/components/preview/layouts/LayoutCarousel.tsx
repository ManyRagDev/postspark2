'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AmbientConfig } from '@/types/ambient';
import type { LayoutSettings, TextPosition, TextAlignment } from '@/types/editor';
import { LayoutCentered } from './LayoutCentered';

export interface LayoutProps {
    text: string;
    config: AmbientConfig;
    imageUrl?: string;
    slides?: string[];
    // Controlled State
    currentSlide?: number;
    onSlideChange?: (index: number) => void;
    // Granular Settings
    headlineSettings?: { position: TextPosition; textAlign: TextAlignment; customPosition?: { x: number, y: number } };
    bodySettings?: { position: TextPosition; textAlign: TextAlignment; customPosition?: { x: number, y: number } };
    onLayoutUpdate?: (updates: Partial<LayoutSettings>) => void;
}

/**
 * Layout Carousel - Vizualização de slides navegáveis
 * Wrapper para LayoutCentered com navegação
 */
export function LayoutCarousel({
    text,
    config,
    imageUrl,
    slides: aiSlides,
    currentSlide: controlledIndex,
    onSlideChange,
    ...layoutProps
}: LayoutProps) {
    const [localIndex, setLocalIndex] = useState(0);
    const currentSlide = controlledIndex ?? localIndex;

    // Usar slides da IA ou fazer fallback para parsing do texto
    const slides = aiSlides && aiSlides.length > 0
        ? aiSlides
        : text
            .split(/(?:\d+[\.\\)]\s*|\n|;)/)
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .slice(0, 6);

    const totalSlides = slides.length || 1;

    // console.log('[CAROUSEL] Current slide:', {
    //     currentSlide,
    //     totalSlides,
    //     slideText: slides[currentSlide]?.substring(0, 50),
    //     isControlled: controlledIndex !== undefined
    // });

    const changeSlide = (index: number) => {
        const newIndex = (index + totalSlides) % totalSlides;
        if (onSlideChange) {
            onSlideChange(newIndex);
        } else {
            setLocalIndex(newIndex);
        }
    };

    // Se não há slides, mostrar texto simples
    if (slides.length === 0) {
        return (
            <LayoutCentered
                text={text}
                config={config}
                {...layoutProps}
            />
        );
    }

    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Slide Content */}
            <div className="flex-1 flex items-center justify-center relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                    >
                        <LayoutCentered
                            text={slides[currentSlide]}
                            config={config}
                            {...layoutProps}
                        // Add badge or indicator?
                        // LayoutCentered renders clean text. 
                        // We might want to overlay slide number?
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Slide Number Badge (Overlay) */}
            <div
                className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                    backgroundColor: `${config.theme.accent}30`,
                    color: config.theme.accent,
                }}
            >
                {currentSlide + 1} / {totalSlides}
            </div>

            {/* Navigation Controls */}
            {totalSlides > 1 && (
                <>
                    {/* Arrow Buttons - Only visible on hover/interaction ideally, but keep accessible */}
                    <button
                        onClick={() => changeSlide(currentSlide - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all backdrop-blur-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => changeSlide(currentSlide + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all backdrop-blur-sm"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => changeSlide(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-white' : 'bg-white/50'
                                    }`}
                                style={{
                                    backgroundColor: i === currentSlide
                                        ? config.theme.accent
                                        : undefined,
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
