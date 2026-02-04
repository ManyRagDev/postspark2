import type { TextPosition, TextAlignment } from '@/types/editor';

interface PositionStyles {
    position?: 'absolute' | 'relative';
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
    transform?: string;
    textAlign?: TextAlignment;
    width?: string;
    maxWidth?: string;
    zIndex?: number;
}

/**
 * Calcula estilos de posicao para um elemento de texto
 *
 * MODO LIVRE: Se customPosition existe, usa coordenadas percentuais livres
 * MODO GRID: Usa uma das 9 posicoes pre-definidas
 */
export function getPositionStyles(
    position: TextPosition,
    textAlign: TextAlignment,
    customPosition?: { x: number; y: number }
): PositionStyles {
    // MODO LIVRE: customPosition tem prioridade
    if (customPosition) {
        const styles = {
            position: 'absolute' as const,
            left: `${customPosition.x}%`,
            top: `${customPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            textAlign: textAlign || 'center',
            width: 'max-content',
            maxWidth: '85%',
            zIndex: 10,
        };
        return styles;
    }

    // MODO GRID: posicoes pre-definidas
    // Usamos margem de 6% para nao ficar grudado nas bordas
    const MARGIN = '6%';

    const styles: PositionStyles = {
        position: 'absolute',
        textAlign,
        width: 'max-content',
        maxWidth: '85%',
    };

    switch (position) {
        case 'top-left':
            styles.top = MARGIN;
            styles.left = MARGIN;
            styles.textAlign = textAlign || 'left';
            break;
        case 'top-center':
            styles.top = MARGIN;
            styles.left = '50%';
            styles.transform = 'translateX(-50%)';
            styles.textAlign = textAlign || 'center';
            break;
        case 'top-right':
            styles.top = MARGIN;
            styles.right = MARGIN;
            styles.textAlign = textAlign || 'right';
            break;

        case 'center-left':
            styles.top = '50%';
            styles.left = MARGIN;
            styles.transform = 'translateY(-50%)';
            styles.textAlign = textAlign || 'left';
            break;
        case 'center':
            styles.top = '50%';
            styles.left = '50%';
            styles.transform = 'translate(-50%, -50%)';
            styles.textAlign = textAlign || 'center';
            break;
        case 'center-right':
            styles.top = '50%';
            styles.right = MARGIN;
            styles.transform = 'translateY(-50%)';
            styles.textAlign = textAlign || 'right';
            break;

        case 'bottom-left':
            styles.bottom = MARGIN;
            styles.left = MARGIN;
            styles.textAlign = textAlign || 'left';
            break;
        case 'bottom-center':
            styles.bottom = MARGIN;
            styles.left = '50%';
            styles.transform = 'translateX(-50%)';
            styles.textAlign = textAlign || 'center';
            break;
        case 'bottom-right':
            styles.bottom = MARGIN;
            styles.right = MARGIN;
            styles.textAlign = textAlign || 'right';
            break;
    }

    return styles;
}

/**
 * Calculates percentage coordinates (0-100) relative to container
 * Based on element's center point
 */
export function calculateRelativePosition(
    elementRect: DOMRect,
    containerRect: DOMRect
): { x: number; y: number } {
    // Calculate center relative to container
    const centerX = elementRect.left + elementRect.width / 2 - containerRect.left;
    const centerY = elementRect.top + elementRect.height / 2 - containerRect.top;

    // Convert to percentage
    const x = (centerX / containerRect.width) * 100;
    const y = (centerY / containerRect.height) * 100;

    // console.log('[CALC POSITION]', {
    //     elementRect: { left: elementRect.left.toFixed(1), top: elementRect.top.toFixed(1), width: elementRect.width.toFixed(1), height: elementRect.height.toFixed(1) },
    //     containerRect: { left: containerRect.left.toFixed(1), top: containerRect.top.toFixed(1), width: containerRect.width.toFixed(1), height: containerRect.height.toFixed(1) },
    //     centerX: centerX.toFixed(1),
    //     centerY: centerY.toFixed(1),
    //     percentX: x.toFixed(2),
    //     percentY: y.toFixed(2)
    // });

    return { x, y };
}
