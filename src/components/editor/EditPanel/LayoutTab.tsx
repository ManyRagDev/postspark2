'use client';

import { useState } from 'react';
import { PositionGrid } from './components/PositionGrid';
import { Slider } from './components/Slider';
import type { LayoutSettings, TextAlignment } from '@/types/editor';
import { AlignLeft, AlignCenter, AlignRight, Type, FileText } from 'lucide-react';

interface LayoutTabProps {
    settings: LayoutSettings;
    onChange: (updates: Partial<LayoutSettings>) => void;
}

const ALIGNMENTS: { value: TextAlignment; label: string; icon: React.ElementType }[] = [
    { value: 'left', label: 'Esquerda', icon: AlignLeft },
    { value: 'center', label: 'Centro', icon: AlignCenter },
    { value: 'right', label: 'Direita', icon: AlignRight },
];

export function LayoutTab({ settings, onChange }: LayoutTabProps) {
    const [activeTarget, setActiveTarget] = useState<'headline' | 'body'>('headline');

    // Helper para atualizar target especifico
    const updateTarget = (key: 'position' | 'textAlign', value: any) => {
        const update: Partial<LayoutSettings> = {
            [activeTarget]: {
                ...settings[activeTarget],
                [key]: value
            }
        };

        // IMPORTANTE: Se mudou position pelo grid, volta para Modo Grid
        // Isso limpa o customPosition (posicao livre do drag)
        if (key === 'position') {
            (update[activeTarget] as any).customPosition = undefined;
        }

        // console.log('[CLICK GRID] LayoutTab.updateTarget():', {
        //     target: activeTarget,
        //     newPosition: value,
        //     clearingCustomPos: key === 'position',
        //     updatePayload: update
        // });

        onChange(update);
    };

    const currentSettings = settings[activeTarget] || { position: 'center', textAlign: 'center' };

    return (
        <div className="space-y-6">
            {/* Toggle Target */}
            <div className="p-1 bg-black/20 rounded-lg flex gap-1">
                <button
                    onClick={() => setActiveTarget('headline')}
                    className={`
                        flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all
                        ${activeTarget === 'headline'
                            ? 'bg-violet-500 text-white shadow-lg'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }
                    `}
                >
                    <Type className="w-4 h-4" />
                    Título
                </button>
                <button
                    onClick={() => setActiveTarget('body')}
                    className={`
                        flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all
                        ${activeTarget === 'body'
                            ? 'bg-violet-500 text-white shadow-lg'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }
                    `}
                >
                    <FileText className="w-4 h-4" />
                    Corpo
                </button>
            </div>

            {/* Posicao do Texto */}
            <PositionGrid
                value={currentSettings.position}
                onChange={(position) => updateTarget('position', position)}
            />

            {/* Alinhamento */}
            <div className="space-y-2">
                <label className="text-sm text-white/70">Alinhamento do Texto</label>
                <div className="flex gap-2">
                    {ALIGNMENTS.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => updateTarget('textAlign', value)}
                            className={`
                                flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all
                                ${currentSettings.textAlign === value
                                    ? 'bg-violet-500/30 text-violet-300 ring-1 ring-violet-500'
                                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                                }
                            `}
                            title={label}
                        >
                            <Icon className="w-5 h-5" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Padding */}
            <div className="pt-4 border-t border-white/10">
                <Slider
                    label="Espaçamento Interno"
                    value={settings.padding}
                    onChange={(padding) => onChange({ padding })}
                    min={0}
                    max={100}
                    step={4}
                    unit="px"
                />
            </div>

            {/* Dicas */}
            <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                <p className="text-xs text-violet-300">
                    <strong>Dica:</strong> Use o grid para posicoes pre-definidas. Arraste o texto no preview para posicionar livremente.
                </p>
            </div>
        </div>
    );
}
