'use client';

import { Slider } from './components/Slider';
import type { ImageSettings, BlendMode } from '@/types/editor';

interface ImageTabProps {
    settings: ImageSettings;
    onChange: (updates: Partial<ImageSettings>) => void;
}

const BLEND_MODES: { value: BlendMode; label: string }[] = [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiplicar' },
    { value: 'screen', label: 'Clarear' },
    { value: 'overlay', label: 'Sobrepor' },
    { value: 'darken', label: 'Escurecer' },
    { value: 'lighten', label: 'Clarear' },
];

export function ImageTab({ settings, onChange }: ImageTabProps) {
    return (
        <div className="space-y-6">
            {/* Transformacoes */}
            <div className="space-y-4">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Transformacoes
                </h4>

                <Slider
                    label="Zoom"
                    value={settings.zoom}
                    onChange={(zoom) => onChange({ zoom })}
                    min={0.5}
                    max={3}
                    step={0.1}
                    formatValue={(v) => `${v.toFixed(1)}x`}
                />
            </div>

            {/* Ajustes de Cor */}
            <div className="space-y-4">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Ajustes de Cor
                </h4>

                <Slider
                    label="Brilho"
                    value={settings.brightness}
                    onChange={(brightness) => onChange({ brightness })}
                    min={0}
                    max={2}
                    step={0.05}
                    formatValue={(v) => `${Math.round(v * 100)}%`}
                />

                <Slider
                    label="Contraste"
                    value={settings.contrast}
                    onChange={(contrast) => onChange({ contrast })}
                    min={0}
                    max={2}
                    step={0.05}
                    formatValue={(v) => `${Math.round(v * 100)}%`}
                />

                <Slider
                    label="Saturacao"
                    value={settings.saturation}
                    onChange={(saturation) => onChange({ saturation })}
                    min={0}
                    max={2}
                    step={0.05}
                    formatValue={(v) => `${Math.round(v * 100)}%`}
                />
            </div>

            {/* Efeitos */}
            <div className="space-y-4">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Efeitos
                </h4>

                <Slider
                    label="Desfoque"
                    value={settings.blur}
                    onChange={(blur) => onChange({ blur })}
                    min={0}
                    max={20}
                    step={1}
                    unit="px"
                />
            </div>

            {/* Overlay */}
            <div className="space-y-4">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Overlay
                </h4>

                <Slider
                    label="Opacidade"
                    value={settings.overlayOpacity}
                    onChange={(overlayOpacity) => onChange({ overlayOpacity })}
                    min={0}
                    max={1}
                    step={0.05}
                    formatValue={(v) => `${Math.round(v * 100)}%`}
                />

                <div className="space-y-2">
                    <label className="text-sm text-white/70">Cor do Overlay</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={settings.overlayColor}
                            onChange={(e) => onChange({ overlayColor: e.target.value })}
                            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-2 border-white/20"
                        />
                        <input
                            type="text"
                            value={settings.overlayColor}
                            onChange={(e) => onChange({ overlayColor: e.target.value })}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono"
                            placeholder="#000000"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-white/70">Modo de Mistura</label>
                    <select
                        value={settings.blendMode}
                        onChange={(e) => onChange({ blendMode: e.target.value as BlendMode })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm appearance-none cursor-pointer"
                    >
                        {BLEND_MODES.map((mode) => (
                            <option key={mode.value} value={mode.value} className="bg-[#1a1a2e]">
                                {mode.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
