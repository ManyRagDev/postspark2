import path from 'path';
import fs from 'fs';

export interface BackgroundMatch {
    filename: string;
    path: string;
    score: number;
    category: string;
}

// Mapping de keywords para categorias de imagens
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    motivation: ['motivação', 'sonho', 'conquista', 'força', 'believe', 'sucesso', 'vitória', 'poder', 'nunca desista'],
    business: ['negócio', 'empresa', 'empreendedor', 'vendas', 'lucro', 'dinheiro', 'investimento', 'mercado'],
    nature: ['natureza', 'paisagem', 'céu', 'montanha', 'praia', 'floresta', 'pôr do sol', 'amanhecer'],
    tech: ['tecnologia', 'digital', 'inovação', 'futuro', 'inteligência artificial', 'dados', 'app'],
    lifestyle: ['vida', 'rotina', 'hábito', 'saúde', 'bem-estar', 'qualidade', 'família', 'amor'],
    urban: ['cidade', 'urbano', 'rua', 'prédio', 'noite', 'luzes', 'metrópole'],
    abstract: ['abstrato', 'arte', 'criativo', 'design', 'minimalista', 'geométrico'],
    food: ['comida', 'receita', 'culinária', 'restaurante', 'chef', 'sabor', 'delícia'],
    fitness: ['fitness', 'treino', 'academia', 'corpo', 'saúde', 'esporte', 'atleta'],
    education: ['educação', 'aprender', 'estudo', 'curso', 'aula', 'conhecimento', 'livro'],
};

/**
 * Analisa o texto e retorna a categoria mais relevante
 */
function detectCategory(text: string): string {
    const normalizedText = text.toLowerCase();
    let bestCategory = 'abstract';
    let highestScore = 0;

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        let score = 0;
        for (const keyword of keywords) {
            if (normalizedText.includes(keyword)) {
                score += 1;
            }
        }
        if (score > highestScore) {
            highestScore = score;
            bestCategory = category;
        }
    }

    return bestCategory;
}

/**
 * Lista imagens disponíveis no diretório de backgrounds
 */
function listAvailableBackgrounds(): BackgroundMatch[] {
    const backgroundsDir = path.join(process.cwd(), 'public', 'images', 'backgrounds');

    if (!fs.existsSync(backgroundsDir)) {
        return [];
    }

    const files = fs.readdirSync(backgroundsDir);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    return files
        .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
        .map(file => {
            // Extrai categoria do nome do arquivo (ex: motivation_001.jpg -> motivation)
            const category = file.split('_')[0] || 'abstract';
            return {
                filename: file,
                path: `/images/backgrounds/${file}`,
                score: 0,
                category,
            };
        });
}

/**
 * Smart Match: encontra a melhor imagem de fundo baseada no texto
 */
export function findBestBackground(text: string): BackgroundMatch | null {
    const backgrounds = listAvailableBackgrounds();

    if (backgrounds.length === 0) {
        return null;
    }

    const targetCategory = detectCategory(text);

    // Pontua cada imagem
    for (const bg of backgrounds) {
        if (bg.category === targetCategory) {
            bg.score = 10;
        } else if (bg.category === 'abstract') {
            bg.score = 5; // Abstract é fallback genérico
        }
    }

    // Ordena por score e retorna a melhor
    backgrounds.sort((a, b) => b.score - a.score);

    // Se nenhuma tem score, retorna a primeira disponível
    return backgrounds[0] || null;
}

/**
 * Gera um prompt para IA de imagens baseado no texto e estado
 */
export function generateImagePrompt(
    text: string,
    style: 'realistic' | '3d' | 'ghibli' | 'anime' | 'minimal'
): string {
    const category = detectCategory(text);

    const styleModifiers: Record<string, string> = {
        realistic: 'photorealistic, 8k, professional photography, cinematic lighting',
        '3d': '3D render, octane render, smooth, modern, futuristic',
        ghibli: 'Studio Ghibli style, anime, hand-painted, dreamy, whimsical',
        anime: 'anime style, vibrant colors, dynamic, Japanese animation',
        minimal: 'minimalist, clean, simple shapes, geometric, flat design',
    };

    const categoryContext: Record<string, string> = {
        motivation: 'epic sunrise, mountain peak, golden hour, triumphant atmosphere',
        business: 'modern office, city skyline, professional, sleek',
        nature: 'beautiful landscape, serene, organic, peaceful',
        tech: 'futuristic, digital patterns, neon accents, dark background',
        lifestyle: 'warm tones, cozy, authentic, lifestyle photography',
        urban: 'city at night, neon lights, street photography, moody',
        abstract: 'abstract background, gradient, geometric shapes, modern art',
        food: 'food photography, appetizing, warm lighting, close-up',
        fitness: 'gym environment, athletic, powerful, energetic',
        education: 'books, study environment, warm lighting, knowledge',
    };

    const basePrompt = categoryContext[category] || categoryContext.abstract;
    const styleModifier = styleModifiers[style] || styleModifiers.minimal;

    return `${basePrompt}, ${styleModifier}, background for social media post, no text, no people faces, suitable for text overlay`;
}
