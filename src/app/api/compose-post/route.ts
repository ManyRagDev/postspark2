import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { getImageMetadata } from '@/lib/intentionZones';
import { calculateLayout, layoutToSharpConfig } from '@/lib/layoutEngine';
import type { AmbientState } from '@/types/ambient';
import path from 'path';
import fs from 'fs';

export interface ComposePostRequest {
  headline: string;
  body?: string;
  state: AmbientState;
  backgroundUrl?: string;
  overlayOpacity?: number; // 0-1
  width?: number;
  height?: number;
}

// Whitelist de domínios permitidos para fetch externo (proteção SSRF)
const ALLOWED_EXTERNAL_DOMAINS = [
  'pollinations.ai',
  'image.pollinations.ai',
  'gen.pollinations.ai',
];

/**
 * Verifica se um hostname está na whitelist de domínios permitidos
 */
function isAllowedDomain(hostname: string): boolean {
  return ALLOWED_EXTERNAL_DOMAINS.some(domain =>
    hostname === domain || hostname.endsWith(`.${domain}`)
  );
}

/**
 * Carrega imagem de background (URL, Data URI ou arquivo local)
 * Inclui proteções contra Path Traversal e SSRF
 */
async function loadBackgroundImage(
  backgroundUrl: string | undefined,
  width: number,
  height: number
): Promise<Buffer> {
  if (!backgroundUrl) {
    // Fallback: criar background gradiente
    return createFallbackGradient(width, height);
  }

  try {
    if (backgroundUrl.startsWith('data:image')) {
      // Base64 Data URI (Upload do usuário ou IA direta)
      const base64Data = backgroundUrl.split(';base64,').pop();
      if (!base64Data) throw new Error('Invalid base64 data');
      return Buffer.from(base64Data, 'base64');
    }

    if (backgroundUrl.startsWith('http')) {
      // SSRF Protection: Validar domínio antes de fazer fetch
      try {
        const url = new URL(backgroundUrl);

        // Bloquear protocolos não-HTTPS em produção
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
          return createFallbackGradient(width, height);
        }

        // Bloquear localhost e IPs privados
        const hostname = url.hostname.toLowerCase();
        if (
          hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.') ||
          hostname === '0.0.0.0'
        ) {
          return createFallbackGradient(width, height);
        }

        // Verificar whitelist de domínios
        if (!isAllowedDomain(hostname)) {
          return createFallbackGradient(width, height);
        }
      } catch {
        return createFallbackGradient(width, height);
      }

      // Fetch de URL externa (validada)
      const response = await fetch(backgroundUrl);
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    // Arquivo local em /public
    // SECURITY: Path Traversal Protection
    const relativePath = backgroundUrl.startsWith('/') ? backgroundUrl.slice(1) : backgroundUrl;

    // Resolver paths e validar que está dentro de /public
    const publicDir = path.resolve(process.cwd(), 'public');
    const filePath = path.resolve(publicDir, relativePath);

    // Verificar se o path resolvido ainda está dentro de /public
    if (!filePath.startsWith(publicDir + path.sep)) {
      // Path traversal detectado - retornar fallback
      return createFallbackGradient(width, height);
    }

    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    }

    // console.warn(`Background not found locally: ${filePath}, using fallback.`);
    return createFallbackGradient(width, height);
  } catch (err) {
    // console.error('Error loading background:', err);
    return createFallbackGradient(width, height);
  }
}

function createFallbackGradient(width: number, height: number): Promise<Buffer> {
  const fallbackSvg = `
    <svg width="${width}" height="${height}">
      <defs>
        <radialGradient id="bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" style="stop-color:#2a2a4a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f0f1a;stop-opacity:1" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
    </svg>
  `;
  return sharp(Buffer.from(fallbackSvg))
    .resize(width, height)
    .png()
    .toBuffer();
}

/**
 * Cria SVG de overlay
 */
function createOverlaySvg(
  width: number,
  height: number,
  overlay: { type: string; color: string; opacity: number; direction?: string }
): string {
  const alpha = Math.round(overlay.opacity * 255).toString(16).padStart(2, '0');

  if (overlay.type === 'vignette') {
    return `
      <svg width="${width}" height="${height}">
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="60%">
            <stop offset="0%" style="stop-color:transparent;stop-opacity:0" />
            <stop offset="100%" style="stop-color:${overlay.color};stop-opacity:${overlay.opacity}" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#vignette)" />
      </svg>
    `;
  }

  // Gradient
  const y1 = overlay.direction === 'top' ? '0%' : overlay.direction === 'bottom' ? '100%' : '50%';
  const y2 = overlay.direction === 'top' ? '60%' : overlay.direction === 'bottom' ? '40%' : '50%';

  return `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="${y1}" x2="0%" y2="${y2}">
          <stop offset="0%" style="stop-color:${overlay.color};stop-opacity:${overlay.opacity}" />
          <stop offset="100%" style="stop-color:${overlay.color};stop-opacity:0" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `;
}

/**
 * Cria SVG de texto
 */
function createTextSvg(
  width: number,
  height: number,
  elements: Array<{
    content: string;
    x: number;
    y: number;
    width: number;
    fontSize: number;
    fontWeight: string;
    textAlign: string;
    color: string;
    shadowColor?: string;
    shadowBlur?: number;
    lineHeight: number;
  }>
): string {
  const textElements = elements.map(el => {
    // Calcula posição X baseado no alinhamento
    let anchorX = el.x;
    let textAnchor = 'start';

    if (el.textAlign === 'center') {
      anchorX = el.x + el.width / 2;
      textAnchor = 'middle';
    } else if (el.textAlign === 'right') {
      anchorX = el.x + el.width;
      textAnchor = 'end';
    }

    // Word wrap simples
    const words = el.content.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const maxCharsPerLine = Math.floor(el.width / (el.fontSize * 0.5));

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length > maxCharsPerLine && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Gera tspans para cada linha
    const tspans = lines.map((line, i) =>
      `<tspan x="${anchorX}" dy="${i === 0 ? 0 : el.fontSize * el.lineHeight}">${escapeXml(line)}</tspan>`
    ).join('');

    const filter = el.shadowBlur ? `filter="url(#shadow${el.fontSize})"` : '';

    return `
      <text 
        x="${anchorX}" 
        y="${el.y}" 
        font-family="Inter, Arial, sans-serif"
        font-size="${el.fontSize}"
        font-weight="${el.fontWeight === 'black' ? '900' : el.fontWeight === 'bold' ? '700' : '400'}"
        fill="${el.color}"
        text-anchor="${textAnchor}"
        ${filter}
      >
        ${tspans}
      </text>
    `;
  }).join('');

  // Criar filtros de sombra
  const filters = elements
    .filter(el => el.shadowBlur)
    .map(el => `
      <filter id="shadow${el.fontSize}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="${el.shadowBlur || 10}" flood-color="${el.shadowColor || 'black'}" flood-opacity="0.5"/>
      </filter>
    `).join('');

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>${filters}</defs>
      ${textElements}
    </svg>
  `;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function POST(request: NextRequest) {
  try {
    const body: ComposePostRequest = await request.json();

    if (!body.headline) {
      return NextResponse.json(
        { error: 'Missing required field: headline' },
        { status: 400 }
      );
    }

    const width = body.width || 1080;
    const height = body.height || 1080;
    const state = body.state || 'neutral';

    // 1. Carregar imagem de fundo
    const backgroundBuffer = await loadBackgroundImage(body.backgroundUrl, width, height);

    // 2. Analisar zonas de intenção
    const imageMetadata = await getImageMetadata(backgroundBuffer, state);

    // 3. Calcular layout
    const layout = calculateLayout(
      body.headline,
      body.body || '',
      state,
      imageMetadata
    );

    // Override opacity se fornecido pelo usuário
    if (typeof body.overlayOpacity === 'number') {
      layout.overlay.opacity = Math.max(0, Math.min(1, body.overlayOpacity));
    }

    // 4. Converter para coordenadas absolutas
    const sharpLayout = layoutToSharpConfig(layout, width, height);

    // 5. Criar overlay (texto removido para permitir edição client-side)
    const overlaySvg = createOverlaySvg(width, height, sharpLayout.overlay);

    // BACKUP: Texto SVG comentado para permitir edição via "Controle Total"
    // O texto agora é renderizado no cliente via React e capturado com html2canvas
    // Para reverter, descomente as linhas abaixo:
    // const textSvg = createTextSvg(width, height, sharpLayout.elements);

    // 6. Compor imagem final (apenas background + overlay, sem texto)
    const composedImage = await sharp(backgroundBuffer)
      .resize(width, height, { fit: 'cover' })
      .composite([
        {
          input: Buffer.from(overlaySvg),
          top: 0,
          left: 0,
        },
        // BACKUP: Composite de texto comentado
        // Para reverter, descomente o bloco abaixo:
        // {
        //   input: Buffer.from(textSvg),
        //   top: 0,
        //   left: 0,
        // },
      ])
      .png({ quality: 90 })
      .toBuffer();

    // Retornar como imagem
    return new NextResponse(composedImage as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="postspark-${state}-${Date.now()}.png"`,
      },
    });
  } catch (error) {
    // console.error('API /compose-post error:', error);
    return NextResponse.json(
      { error: 'Failed to compose post' },
      { status: 500 }
    );
  }
}
