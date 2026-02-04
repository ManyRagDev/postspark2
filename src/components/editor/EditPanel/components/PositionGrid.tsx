'use client';

import type { TextPosition } from '@/types/editor';

interface PositionGridProps {
    value: TextPosition;
    onChange: (position: TextPosition) => void;
}

const POSITIONS: TextPosition[] = [
    'top-left', 'top-center', 'top-right',
    'center-left', 'center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right',
];

const POSITION_LABELS: Record<TextPosition, string> = {
    'top-left': 'Topo Esq.',
    'top-center': 'Topo Centro',
    'top-right': 'Topo Dir.',
    'center-left': 'Centro Esq.',
    'center': 'Centro',
    'center-right': 'Centro Dir.',
    'bottom-left': 'Baixo Esq.',
    'bottom-center': 'Baixo Centro',
    'bottom-right': 'Baixo Dir.',
};

export function PositionGrid({ value, onChange }: PositionGridProps) {
    return (
        <div className="space-y-2">
            <label className="text-sm text-white/70">Posicao do Texto</label>
            <div className="grid grid-cols-3 gap-1 p-2 bg-black/20 rounded-lg">
                {POSITIONS.map((position) => (
                    <button
                        key={position}
                        onClick={() => onChange(position)}
                        className={`
                            aspect-square rounded-md transition-all
                            flex items-center justify-center
                            ${value === position
                                ? 'bg-violet-500 ring-2 ring-violet-400'
                                : 'bg-white/10 hover:bg-white/20'
                            }
                        `}
                        title={POSITION_LABELS[position]}
                    >
                        <div
                            className={`
                                w-2 h-2 rounded-full
                                ${value === position ? 'bg-white' : 'bg-white/40'}
                            `}
                        />
                    </button>
                ))}
            </div>
            <p className="text-xs text-white/50 text-center">
                {POSITION_LABELS[value]}
            </p>
        </div>
    );
}
