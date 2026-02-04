'use client';

import { PaletteSelector } from './components/PaletteSelector';
import type { DesignSettings, ColorPalette } from '@/types/editor';
import type { AmbientConfig } from '@/types/ambient';

interface DesignTabProps {
    settings: DesignSettings;
    onChange: (updates: Partial<DesignSettings>) => void;
    ambientConfig: AmbientConfig;
}

export function DesignTab({ settings, onChange, ambientConfig }: DesignTabProps) {
    const handlePaletteChange = (palette: ColorPalette) => {
        onChange({
            palette,
            // Limpa cores customizadas ao selecionar paleta
            customColors: undefined,
        });
    };

    const handleCustomColorChange = (key: 'bg' | 'text' | 'accent', color: string) => {
        onChange({
            palette: 'auto', // Muda para auto quando customiza
            customColors: {
                bg: settings.customColors?.bg || ambientConfig.theme.bg,
                text: settings.customColors?.text || ambientConfig.theme.text,
                accent: settings.customColors?.accent || ambientConfig.theme.accent,
                [key]: color,
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Seletor de Paleta */}
            <PaletteSelector
                value={settings.palette}
                onChange={handlePaletteChange}
            />

            {/* Cores Customizadas */}
            <div className="space-y-4">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Cores Customizadas
                </h4>
                <p className="text-xs text-white/40">
                    Personalizar cores substitui a paleta selecionada.
                </p>

                {/* Background Color */}
                <div className="space-y-2">
                    <label className="text-sm text-white/70">Fundo</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={settings.customColors?.bg || ambientConfig.theme.bg}
                            onChange={(e) => handleCustomColorChange('bg', e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-2 border-white/20"
                        />
                        <input
                            type="text"
                            value={settings.customColors?.bg || ambientConfig.theme.bg}
                            onChange={(e) => handleCustomColorChange('bg', e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono"
                        />
                    </div>
                </div>

                {/* Text Color */}
                <div className="space-y-2">
                    <label className="text-sm text-white/70">Texto</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={settings.customColors?.text || ambientConfig.theme.text}
                            onChange={(e) => handleCustomColorChange('text', e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-2 border-white/20"
                        />
                        <input
                            type="text"
                            value={settings.customColors?.text || ambientConfig.theme.text}
                            onChange={(e) => handleCustomColorChange('text', e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono"
                        />
                    </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-2">
                    <label className="text-sm text-white/70">Destaque</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={settings.customColors?.accent || ambientConfig.theme.accent}
                            onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-2 border-white/20"
                        />
                        <input
                            type="text"
                            value={settings.customColors?.accent || ambientConfig.theme.accent}
                            onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono"
                        />
                    </div>
                </div>
            </div>

            {/* Preview das cores atuais */}
            <div className="space-y-2">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Preview
                </h4>
                <div
                    className="h-20 rounded-lg flex items-center justify-center relative overflow-hidden"
                    style={{
                        backgroundColor: settings.customColors?.bg || ambientConfig.theme.bg,
                    }}
                >
                    <span
                        className="text-lg font-bold"
                        style={{
                            color: settings.customColors?.text || ambientConfig.theme.text,
                        }}
                    >
                        Texto de Exemplo
                    </span>
                    <div
                        className="absolute bottom-0 left-0 right-0 h-1"
                        style={{
                            backgroundColor: settings.customColors?.accent || ambientConfig.theme.accent,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
