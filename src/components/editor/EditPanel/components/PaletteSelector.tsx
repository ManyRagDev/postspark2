'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import type { ColorPalette } from '@/types/editor';
import { getAllPalettes } from '@/lib/palettes';

interface PaletteSelectorProps {
    value: ColorPalette;
    onChange: (palette: ColorPalette) => void;
}

export function PaletteSelector({ value, onChange }: PaletteSelectorProps) {
    const palettes = getAllPalettes();

    return (
        <div className="space-y-3">
            <label className="text-sm text-white/70">Paleta de Cores</label>

            {/* Auto Option */}
            <button
                onClick={() => onChange('auto')}
                className={`
                    w-full flex items-center gap-3 p-3 rounded-lg transition-all
                    ${value === 'auto'
                        ? 'bg-violet-500/30 ring-2 ring-violet-500'
                        : 'bg-white/5 hover:bg-white/10'
                    }
                `}
            >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">Automatico</p>
                    <p className="text-xs text-white/50">Baseado no estado detectado</p>
                </div>
                {value === 'auto' && (
                    <Check className="w-5 h-5 text-violet-400" />
                )}
            </button>

            {/* Palette Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {palettes.map((palette) => (
                    <motion.button
                        key={palette.id}
                        onClick={() => onChange(palette.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                            relative p-2 rounded-lg transition-all text-left
                            ${value === palette.id
                                ? 'ring-2 ring-violet-500'
                                : 'hover:bg-white/5'
                            }
                        `}
                    >
                        {/* Preview Gradient */}
                        <div
                            className="h-12 rounded-md mb-2"
                            style={{ background: palette.preview }}
                        />

                        {/* Color Dots */}
                        <div className="flex gap-1 mb-1">
                            <div
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: palette.colors.bg }}
                            />
                            <div
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: palette.colors.text }}
                            />
                            <div
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: palette.colors.accent }}
                            />
                        </div>

                        {/* Name */}
                        <p className="text-xs font-medium text-white truncate">
                            {palette.name}
                        </p>

                        {/* Selected Check */}
                        {value === palette.id && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
