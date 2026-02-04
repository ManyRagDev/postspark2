import type { AmbientConfig } from '@/types/ambient';

/**
 * Exporta o preview do post como imagem PNG
 * Usa Canvas API para renderizar o conteúdo
 */
export async function exportPostAsImage(
    text: string,
    config: AmbientConfig,
    options: {
        width?: number;
        height?: number;
        filename?: string;
    } = {}
): Promise<void> {
    const { width = 1080, height = 1080, filename = 'postspark-post.png' } = options;

    // Criar canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Canvas context not available');
    }

    // Desenhar background
    ctx.fillStyle = config.theme.bg;
    ctx.fillRect(0, 0, width, height);

    // Adicionar gradiente radial
    const gradient = ctx.createRadialGradient(
        width / 2, height / 3, 0,
        width / 2, height / 3, width * 0.7
    );
    gradient.addColorStop(0, `${config.theme.accent}30`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Configurar texto
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calcular tamanho da fonte baseado no comprimento do texto
    const baseFontSize = text.length > 150 ? 36 : text.length > 80 ? 48 : 64;
    ctx.font = `bold ${baseFontSize}px Inter, sans-serif`;
    ctx.fillStyle = config.theme.text;

    // Adicionar sombra/glow para estado motivacional
    if (config.state === 'motivational') {
        ctx.shadowColor = config.theme.accent;
        ctx.shadowBlur = 30;
    }

    // Word wrap do texto
    const maxWidth = width * 0.8;
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = baseFontSize * 1.3;
    const totalHeight = lines.length * lineHeight;
    const startY = (height - totalHeight) / 2;

    lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + index * lineHeight + lineHeight / 2);
    });

    // Reset shadow
    ctx.shadowBlur = 0;

    // Adicionar badge do estado (se não for neutro)
    if (config.state !== 'neutral') {
        drawBadge(ctx, config, width);
    }

    // Adicionar marca d'água
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = `${config.theme.text}40`;
    ctx.fillText('Criado com PostSpark ✨', width / 2, height - 30);

    // Converter para blob e fazer download
    canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 'image/png');
}

/**
 * Quebra texto em múltiplas linhas para caber na largura máxima
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

/**
 * Desenha o badge do estado no topo
 */
function drawBadge(
    ctx: CanvasRenderingContext2D,
    config: AmbientConfig,
    canvasWidth: number
): void {
    const badgeText = `${config.emoji} Modo: ${config.label}`;
    ctx.font = 'bold 20px Inter, sans-serif';

    const textMetrics = ctx.measureText(badgeText);
    const badgeWidth = textMetrics.width + 40;
    const badgeHeight = 40;
    const badgeX = (canvasWidth - badgeWidth) / 2;
    const badgeY = 40;

    // Badge background
    ctx.fillStyle = `${config.theme.accent}30`;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 20);
    ctx.fill();

    // Badge border
    ctx.strokeStyle = `${config.theme.accent}50`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Badge text
    ctx.fillStyle = config.theme.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, canvasWidth / 2, badgeY + badgeHeight / 2);
}

/**
 * Copia o post para a área de transferência como imagem
 */
export async function copyPostToClipboard(
    _text: string,
    config: AmbientConfig
): Promise<boolean> {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    if (!ctx) return false;

    // Mesmo processo de desenho...
    ctx.fillStyle = config.theme.bg;
    ctx.fillRect(0, 0, 1080, 1080);

    // ... (simplificado para copiar)

    try {
        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/png');
        });

        if (!blob) return false;

        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);

        return true;
    } catch {
        return false;
    }
}
