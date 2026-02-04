// ==============================================
// 10 PALETAS DE CORES - PostSpark V1
// ==============================================

import type { ColorPalette, PaletteData } from '@/types/editor';

export const PALETTES: Record<Exclude<ColorPalette, 'auto'>, PaletteData> = {
    // 1. WARM NIGHT - Noite Quente
    warm_night: {
        id: 'warm_night',
        name: 'Noite Quente',
        description: 'Tons quentes de azul e laranja para criacao noturna',
        colors: {
            bg: '#0f0f14',
            text: '#ffffff',
            accent: '#ff8c42',
        },
        preview: 'linear-gradient(135deg, #0f0f14 0%, #7f39fb 50%, #ff8c42 100%)',
        bestFor: ['Conteudo criativo', 'Posts noturnos', 'Eventos'],
    },

    // 2. OCEAN - Oceano
    ocean: {
        id: 'ocean',
        name: 'Oceano',
        description: 'Azuis profundos e ciano para frescor e tecnologia',
        colors: {
            bg: '#0a1428',
            text: '#ffffff',
            accent: '#00d4ff',
        },
        preview: 'linear-gradient(135deg, #0a1428 0%, #5b8dee 50%, #00d4ff 100%)',
        bestFor: ['Tech', 'SaaS', 'Inovacao'],
    },

    // 3. VIBRANT GREEN - Verde Vibrante
    vibrant_green: {
        id: 'vibrant_green',
        name: 'Verde Vibrante',
        description: 'Verdes brilhantes para sustentabilidade e crescimento',
        colors: {
            bg: '#0a2e1f',
            text: '#ffffff',
            accent: '#22c55e',
        },
        preview: 'linear-gradient(135deg, #0a2e1f 0%, #22c55e 50%, #84cc16 100%)',
        bestFor: ['Sustentabilidade', 'Saude', 'Crescimento'],
    },

    // 4. SUNSET - Por do Sol
    sunset: {
        id: 'sunset',
        name: 'Por do Sol',
        description: 'Laranja e rosa para ambientes calorosos e acolhedores',
        colors: {
            bg: '#1f1515',
            text: '#ffffff',
            accent: '#ff6b35',
        },
        preview: 'linear-gradient(135deg, #1f1515 0%, #ff6b35 50%, #ff1744 100%)',
        bestFor: ['Lifestyle', 'Food', 'Viagens'],
    },

    // 5. NIGHT MODE - Modo Noite
    night_mode: {
        id: 'night_mode',
        name: 'Modo Noite',
        description: 'Preto puro com roxo para maximo contraste',
        colors: {
            bg: '#0a0a0f',
            text: '#ffffff',
            accent: '#a855f7',
        },
        preview: 'linear-gradient(135deg, #0a0a0f 0%, #a855f7 50%, #8b5cf6 100%)',
        bestFor: ['Dark mode', 'Tech', 'Gaming'],
    },

    // 6. FOREST - Floresta
    forest: {
        id: 'forest',
        name: 'Floresta',
        description: 'Verdes naturais para autenticidade e confianca',
        colors: {
            bg: '#1a2e1a',
            text: '#ffffff',
            accent: '#34d399',
        },
        preview: 'linear-gradient(135deg, #1a2e1a 0%, #10b981 50%, #34d399 100%)',
        bestFor: ['Natureza', 'Wellness', 'Sustentabilidade'],
    },

    // 7. CRIMSON - Carmesim
    crimson: {
        id: 'crimson',
        name: 'Carmesim',
        description: 'Vermelho profundo para paixao e urgencia',
        colors: {
            bg: '#2a0a0a',
            text: '#ffffff',
            accent: '#dc2626',
        },
        preview: 'linear-gradient(135deg, #2a0a0a 0%, #dc2626 50%, #ef4444 100%)',
        bestFor: ['Alerta', 'Promocao', 'Urgencia'],
    },

    // 8. INDIGO - Indigo
    indigo: {
        id: 'indigo',
        name: 'Indigo',
        description: 'Azul profundo para profissionalismo e confianca',
        colors: {
            bg: '#1e1b4b',
            text: '#ffffff',
            accent: '#6366f1',
        },
        preview: 'linear-gradient(135deg, #1e1b4b 0%, #6366f1 50%, #818cf8 100%)',
        bestFor: ['Negocios', 'SaaS', 'Corporativo'],
    },

    // 9. PEACHY - Pessego
    peachy: {
        id: 'peachy',
        name: 'Pessego',
        description: 'Tons quentes de rosa e pessego para leveza',
        colors: {
            bg: '#2a1810',
            text: '#ffffff',
            accent: '#fb923c',
        },
        preview: 'linear-gradient(135deg, #2a1810 0%, #fb923c 50%, #f97316 100%)',
        bestFor: ['Lifestyle', 'Beleza', 'Alimentos'],
    },

    // 10. CYBER - Cibernetico
    cyber: {
        id: 'cyber',
        name: 'Cibernetico',
        description: 'Rosa neon e ciano para futurismo extremo',
        colors: {
            bg: '#0a0a14',
            text: '#ffffff',
            accent: '#ec4899',
        },
        preview: 'linear-gradient(135deg, #0a0a14 0%, #ec4899 50%, #00d4ff 100%)',
        bestFor: ['Tech', 'Gaming', 'Futurista'],
    },
};

// Helper para obter paleta por ID
export function getPalette(id: ColorPalette): PaletteData | null {
    if (id === 'auto') return null;
    return PALETTES[id] || null;
}

// Lista de todas as paletas para UI
export function getAllPalettes(): PaletteData[] {
    return Object.values(PALETTES);
}
