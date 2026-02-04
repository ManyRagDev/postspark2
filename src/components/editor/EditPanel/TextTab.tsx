'use client';

import { Slider } from './components/Slider';
import type { TextSettings } from '@/types/editor';

interface TextTabProps {
    settings: TextSettings;
    onChange: (updates: Partial<TextSettings>) => void;
    generatedHeadline?: string;
    generatedBody?: string;
}

export function TextTab({
    settings,
    onChange,
    generatedHeadline,
    generatedBody,
}: TextTabProps) {
    return (
        <div className="space-y-6">
            {/* Headline */}
            <div className="space-y-2">
                <label className="text-sm text-white/70">Titulo Principal</label>
                <textarea
                    value={settings.headlineContent ?? generatedHeadline ?? ''}
                    onChange={(e) => onChange({ headlineContent: e.target.value })}
                    placeholder={generatedHeadline || 'Digite o titulo...'}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                               text-white placeholder-white/30 text-sm resize-none
                               focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <p className="text-xs text-white/40">
                    {(settings.headlineContent ?? generatedHeadline ?? '').length} caracteres
                </p>
            </div>

            {/* Body */}
            <div className="space-y-2">
                <label className="text-sm text-white/70">Corpo do Texto</label>
                <textarea
                    value={settings.bodyContent ?? generatedBody ?? ''}
                    onChange={(e) => onChange({ bodyContent: e.target.value })}
                    placeholder={generatedBody || 'Digite o corpo do texto...'}
                    rows={4}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                               text-white placeholder-white/30 text-sm resize-none
                               focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <p className="text-xs text-white/40">
                    {(settings.bodyContent ?? generatedBody ?? '').length} caracteres
                </p>
            </div>

            {/* Font Scale */}
            <div className="space-y-4">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Tipografia
                </h4>

                <Slider
                    label="Escala da Fonte"
                    value={settings.fontScale}
                    onChange={(fontScale) => onChange({ fontScale })}
                    min={0.5}
                    max={2}
                    step={0.1}
                    formatValue={(v) => `${Math.round(v * 100)}%`}
                />

                <p className="text-xs text-white/40">
                    Ajuste a escala para aumentar ou diminuir o tamanho de todo o texto.
                </p>
            </div>

            {/* Preview de texto */}
            <div className="space-y-2">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Preview
                </h4>
                <div className="p-4 bg-black/30 rounded-lg space-y-2">
                    <p
                        className="font-bold text-white leading-tight"
                        style={{ fontSize: `${1.5 * settings.fontScale}rem` }}
                    >
                        {settings.headlineContent || generatedHeadline || 'Titulo aqui'}
                    </p>
                    <p
                        className="text-white/80 leading-relaxed"
                        style={{ fontSize: `${1 * settings.fontScale}rem` }}
                    >
                        {settings.bodyContent || generatedBody || 'Corpo do texto aqui...'}
                    </p>
                </div>
            </div>
        </div>
    );
}
