'use client';

import { useId } from 'react';

interface SliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    formatValue?: (value: number) => string;
}

export function Slider({
    label,
    value,
    onChange,
    min,
    max,
    step = 0.1,
    unit = '',
    formatValue,
}: SliderProps) {
    const id = useId();
    const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

    // Calculate percentage for gradient
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label
                    htmlFor={id}
                    className="text-sm text-white/70"
                >
                    {label}
                </label>
                <span className="text-sm font-medium text-white/90 tabular-nums">
                    {displayValue}
                </span>
            </div>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer
                           bg-white/10 accent-violet-500
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-4
                           [&::-webkit-slider-thumb]:h-4
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-violet-500
                           [&::-webkit-slider-thumb]:shadow-lg
                           [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-webkit-slider-thumb]:transition-transform
                           [&::-webkit-slider-thumb]:hover:scale-110
                           [&::-moz-range-thumb]:w-4
                           [&::-moz-range-thumb]:h-4
                           [&::-moz-range-thumb]:rounded-full
                           [&::-moz-range-thumb]:bg-violet-500
                           [&::-moz-range-thumb]:border-0
                           [&::-moz-range-thumb]:cursor-pointer"
                style={{
                    background: `linear-gradient(to right, rgb(139 92 246) 0%, rgb(139 92 246) ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`,
                }}
            />
        </div>
    );
}
