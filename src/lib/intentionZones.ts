import sharp from 'sharp';
import type { AmbientState } from '@/types/ambient';

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface IntentionZone {
    type: 'face' | 'subject' | 'empty' | 'complex';
    boundingBox: BoundingBox;
    weight: number; // 0-1, importância da área
}

export interface ZoneAnalysis {
    zones: IntentionZone[];
    safeAreas: BoundingBox[];
    avoidAreas: BoundingBox[];
    centerOfAttention: Point;
    suggestedTextPosition: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'overlay';
    averageLuminance: number; // 0-255
    isImageDark: boolean;
}

export interface ImageMetadata {
    width: number;
    height: number;
    luminance: number;
    zones: ZoneAnalysis;
}

/**
 * Divide a imagem em uma grid e calcula complexidade de cada célula
 */
async function analyzeComplexityGrid(
    imageBuffer: Buffer,
    gridSize: number = 3
): Promise<{ grid: number[][]; avgLuminance: number }> {
    const image = sharp(imageBuffer);
    const { width, height } = await image.metadata() as { width: number; height: number };

    const cellWidth = Math.floor(width / gridSize);
    const cellHeight = Math.floor(height / gridSize);

    const grid: number[][] = [];
    let totalLuminance = 0;
    let cellCount = 0;

    for (let row = 0; row < gridSize; row++) {
        grid[row] = [];
        for (let col = 0; col < gridSize; col++) {
            // Extrai a região da célula
            const region = await sharp(imageBuffer)
                .extract({
                    left: col * cellWidth,
                    top: row * cellHeight,
                    width: cellWidth,
                    height: cellHeight,
                })
                .grayscale()
                .raw()
                .toBuffer();

            // Calcula variância (medida de complexidade)
            const pixels = new Uint8Array(region);
            let sum = 0;
            let sumSq = 0;

            for (const pixel of pixels) {
                sum += pixel;
                sumSq += pixel * pixel;
            }

            const mean = sum / pixels.length;
            const variance = (sumSq / pixels.length) - (mean * mean);

            grid[row][col] = variance;
            totalLuminance += mean;
            cellCount++;
        }
    }

    return {
        grid,
        avgLuminance: totalLuminance / cellCount,
    };
}

/**
 * Encontra a célula com menor complexidade (ideal para texto)
 */
function findEmptyRegions(
    complexityGrid: number[][],
    threshold: number = 500
): BoundingBox[] {
    const safeAreas: BoundingBox[] = [];
    const gridSize = complexityGrid.length;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (complexityGrid[row][col] < threshold) {
                safeAreas.push({
                    x: col / gridSize,
                    y: row / gridSize,
                    width: 1 / gridSize,
                    height: 1 / gridSize,
                });
            }
        }
    }

    return safeAreas;
}

/**
 * Determina a melhor posição do texto baseado no estado e na análise
 */
function suggestTextPosition(
    state: AmbientState,
    complexityGrid: number[][],
    safeAreas: BoundingBox[]
): 'top' | 'bottom' | 'left' | 'right' | 'center' | 'overlay' {
    const gridSize = complexityGrid.length;

    // Regras por estado (do manifesto)
    switch (state) {
        case 'motivational':
        case 'controversial':
            // Modo épico: sempre centro com overlay
            return 'overlay';

        case 'personal':
            // Split screen: texto ao lado (preferência por direita)
            const rightComplexity = (complexityGrid[0][2] + complexityGrid[1][2] + complexityGrid[2][2]) / 3;
            const leftComplexity = (complexityGrid[0][0] + complexityGrid[1][0] + complexityGrid[2][0]) / 3;
            return rightComplexity < leftComplexity ? 'right' : 'left';

        case 'informative':
            // Área mais limpa
            if (safeAreas.length > 0) {
                const safest = safeAreas[0];
                if (safest.y < 0.33) return 'top';
                if (safest.y > 0.66) return 'bottom';
                if (safest.x < 0.33) return 'left';
                if (safest.x > 0.66) return 'right';
            }
            return 'bottom';

        case 'promotional':
            // Hierarquia: centro superior para headline, centro para preço
            return 'center';

        case 'educational':
            // Regra dos terços: evita centro puro
            const topComplexity = (complexityGrid[0][0] + complexityGrid[0][1] + complexityGrid[0][2]) / 3;
            const bottomComplexity = (complexityGrid[2][0] + complexityGrid[2][1] + complexityGrid[2][2]) / 3;
            return topComplexity < bottomComplexity ? 'top' : 'bottom';

        default:
            return 'center';
    }
}

/**
 * Análise completa de zonas de intenção da imagem
 */
export async function analyzeImageZones(
    imageBuffer: Buffer,
    state: AmbientState = 'neutral'
): Promise<ZoneAnalysis> {
    const { grid, avgLuminance } = await analyzeComplexityGrid(imageBuffer);
    const safeAreas = findEmptyRegions(grid);
    const suggestedPosition = suggestTextPosition(state, grid, safeAreas);

    // Encontra o centro de atenção (região mais complexa)
    let maxComplexity = 0;
    let centerOfAttention: Point = { x: 0.5, y: 0.5 };

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] > maxComplexity) {
                maxComplexity = grid[row][col];
                centerOfAttention = {
                    x: (col + 0.5) / grid.length,
                    y: (row + 0.5) / grid.length,
                };
            }
        }
    }

    // Converte safe areas normalizadas para avoid areas (inversão)
    const avoidAreas: BoundingBox[] = [];
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] > 1000) { // Alta complexidade = evitar
                avoidAreas.push({
                    x: col / grid.length,
                    y: row / grid.length,
                    width: 1 / grid.length,
                    height: 1 / grid.length,
                });
            }
        }
    }

    return {
        zones: [], // Face detection seria adicionado aqui com @vladmandic/face-api
        safeAreas,
        avoidAreas,
        centerOfAttention,
        suggestedTextPosition: suggestedPosition,
        averageLuminance: avgLuminance,
        isImageDark: avgLuminance < 128,
    };
}

/**
 * Retorna os metadados completos da imagem para o Layout Engine
 */
export async function getImageMetadata(imageBuffer: Buffer, state: AmbientState): Promise<ImageMetadata> {
    const { width, height } = await sharp(imageBuffer).metadata() as { width: number; height: number };
    const zones = await analyzeImageZones(imageBuffer, state);

    return {
        width: width || 1080,
        height: height || 1080,
        luminance: zones.averageLuminance,
        zones,
    };
}
