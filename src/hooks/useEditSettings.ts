'use client';

import { useState, useCallback } from 'react';
import type {
    EditSettings,
    ImageSettings,
    DesignSettings,
    LayoutSettings,
    TextSettings,
    SlideOverrides,
} from '@/types/editor';
import {
    createDefaultEditSettings,
} from '@/types/editor';
import type { AmbientConfig } from '@/types/ambient';
import { getPalette } from '@/lib/palettes';

export interface UseEditSettingsReturn {
    settings: EditSettings;
    isManualOverride: boolean;

    // Actions
    setCurrentSlide: (index: number) => void;

    // Updaters (accept optional index for slides)
    updateImage: (updates: Partial<ImageSettings>, index?: number) => void;
    updateDesign: (updates: Partial<DesignSettings>, index?: number) => void;
    updateLayout: (updates: Partial<LayoutSettings> | Partial<LayoutSettings['headline']> | Partial<LayoutSettings['body']>, index?: number, section?: 'global' | 'headline' | 'body') => void;
    // Layout update is complex because granular vs specific section.
    // Let's simplify: updateLayout accepts Partial<LayoutSettings>.
    // But LayoutSettings has nested.
    // The previous updateLayout was: `layout: { ...prev.layout, ...updates }`.
    // If updates is granular, deep merge is needed?
    // User passes `headline: { ... }`.
    // If I use shallow merge for layout, I might lose other props?
    // Previous implementation was shallow merge of layout root props.
    // `layout: { ...prev.layout, ...updates }`.
    // If `updates` has `headline`, it overwrites `prev.layout.headline`.
    // This wipes `headline.position` if `updates` only has `headline.customPosition`.
    // So updateLayout needs DEEP MERGE for nested props ideally.
    // Or `EditPanel` sends full object?
    // Let's implement deep merge logic inside updaters for safety.

    updateText: (updates: Partial<TextSettings>, index?: number) => void;

    // Actions
    resetToAuto: () => void;
    setManualOverride: (value: boolean) => void;

    // Slide Management
    applyToAll: (index: number) => void; // Propagate override to global
    resetSlide: (index: number) => void; // Clear override

    // Computed
    getComputedSettings: (index: number) => {
        image: ImageSettings;
        design: DesignSettings;
        layout: LayoutSettings;
        text: TextSettings;
    };
    getComputedColors: (ambientConfig: AmbientConfig, index?: number) => {
        bg: string;
        text: string;
        accent: string;
    };
}

// Simple Deep Merge Helper for our specific depth
function mergeLayout(base: LayoutSettings, update: any): LayoutSettings {
    if (!update) return base;
    const merged = { ...base, ...update };
    if (update.headline) {
        merged.headline = { ...base.headline, ...update.headline };
    }
    if (update.body) {
        merged.body = { ...base.body, ...update.body };
    }
    return merged;
}

export function useEditSettings(): UseEditSettingsReturn {
    const [settings, setSettings] = useState<EditSettings>(createDefaultEditSettings);

    const setCurrentSlide = useCallback((index: number) => {
        setSettings(prev => ({ ...prev, currentSlideIndex: index }));
    }, []);

    // Helper to update global or override
    const applyUpdate = (
        prev: EditSettings,
        section: Exclude<keyof SlideOverrides, 'hasOverride'>,
        updates: any,
        index?: number
    ): EditSettings => {
        // If index is provided, update override
        if (index !== undefined && index >= 0) {
            const currentOverrides = prev.slideOverrides[index] || { hasOverride: true };
            const sectionOverrides = (currentOverrides as any)[section] || {};

            // Merge logic for section
            // For layout, we need careful merging if partial
            let newSectionValue = { ...sectionOverrides, ...updates };

            // Special handling for nested layout in overrides
            if (section === 'layout') {
                // If updating layout override, we merge deep?
                // Overrides are partials.
                // If I have override { headline: { position: top } }
                // And update { headline: { custom: xy } }
                // Result override should be { headline: { position: top, custom: xy } }
                if (currentOverrides.layout) {
                    newSectionValue = mergeLayout(currentOverrides.layout as any, updates);
                }
            }

            return {
                ...prev,
                isManualOverride: true,
                slideOverrides: {
                    ...prev.slideOverrides,
                    [index]: {
                        ...currentOverrides,
                        [section]: newSectionValue,
                        hasOverride: true
                    }
                }
            };
        }

        // Global Update
        // Special deep merge for layout
        if (section === 'layout') {
            return {
                ...prev,
                isManualOverride: true,
                layout: mergeLayout(prev.layout, updates)
            };
        }

        return {
            ...prev,
            isManualOverride: true,
            [section]: { ...(prev as any)[section], ...updates }
        };
    };

    const updateImage = useCallback((updates: Partial<ImageSettings>, index?: number) => {
        setSettings(prev => applyUpdate(prev, 'image', updates, index));
    }, []);

    const updateDesign = useCallback((updates: Partial<DesignSettings>, index?: number) => {
        setSettings(prev => applyUpdate(prev, 'design', updates, index));
    }, []);

    const updateLayout = useCallback((updates: Partial<LayoutSettings>, index?: number) => {
        setSettings(prev => {
            const result = applyUpdate(prev, 'layout', updates, index);
            // console.log('[UPDATE LAYOUT] useEditSettings:', {
            //     target: 'headline' in updates ? 'headline' : 'body',
            //     newHeadlinePos: result.layout.headline.position,
            //     newBodyPos: result.layout.body.position,
            //     slideIndex: index,
            //     isGlobal: index === undefined,
            //     slideOverride: index !== undefined ? result.slideOverrides[index]?.layout : null
            // });
            return result;
        });
    }, []);

    const updateText = useCallback((updates: Partial<TextSettings>, index?: number) => {
        setSettings(prev => applyUpdate(prev, 'text', updates, index));
    }, []);

    const resetToAuto = useCallback(() => {
        setSettings(createDefaultEditSettings());
    }, []);

    const setManualOverride = useCallback((value: boolean) => {
        setSettings(prev => ({ ...prev, isManualOverride: value }));
    }, []);

    const applyToAll = useCallback((index: number) => {
        setSettings(prev => {
            const override = prev.slideOverrides[index];
            if (!override) return prev;

            return {
                ...prev,
                image: { ...prev.image, ...(override.image || {}) },
                design: { ...prev.design, ...(override.design || {}) },
                layout: mergeLayout(prev.layout, override.layout || {}),
                text: { ...prev.text, ...(override.text || {}) },
                // Optional: clear overrides?
            };
        });
    }, []);

    const resetSlide = useCallback((index: number) => {
        setSettings(prev => {
            const newOverrides = { ...prev.slideOverrides };
            delete newOverrides[index];
            return { ...prev, slideOverrides: newOverrides };
        });
    }, []);

    const getComputedSettings = useCallback((index: number) => {
        // Assume settings available in closure, but better pass index to selector
        // React state 'settings' is current.
        const base = settings;
        const override = settings.slideOverrides[index];

        if (!override) return {
            image: base.image,
            design: base.design,
            layout: base.layout,
            text: base.text
        };

        return {
            image: { ...base.image, ...override.image },
            design: { ...base.design, ...override.design },
            layout: mergeLayout(base.layout, override.layout),
            text: { ...base.text, ...override.text }
        };
    }, [settings]);

    const getComputedColors = useCallback((ambientConfig: AmbientConfig, index?: number) => {
        // Logic to get design settings for index
        const effectiveDesign = index !== undefined && settings.slideOverrides[index]?.design
            ? { ...settings.design, ...settings.slideOverrides[index].design! }
            : settings.design;

        const { palette, customColors } = effectiveDesign;

        if (customColors) return customColors;
        if (palette === 'auto') return {
            bg: ambientConfig.theme.bg,
            text: ambientConfig.theme.text,
            accent: ambientConfig.theme.accent,
        };

        const paletteData = getPalette(palette);
        return paletteData ? paletteData.colors : {
            bg: ambientConfig.theme.bg,
            text: ambientConfig.theme.text,
            accent: ambientConfig.theme.accent,
        };
    }, [settings]);

    return {
        settings,
        isManualOverride: settings.isManualOverride,
        setCurrentSlide,
        updateImage,
        updateDesign,
        updateLayout,
        updateText,
        resetToAuto,
        setManualOverride,
        applyToAll,
        resetSlide,
        getComputedSettings,
        getComputedColors,
    };
}
