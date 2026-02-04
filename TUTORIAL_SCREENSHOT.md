# Tutorial: Como Capturar Screenshots de Elementos DOM em Qualquer Projeto

Este tutorial ensina como implementar funcionalidade de screenshot/download de elementos visuais em qualquer aplicação web, baseado no mecanismo utilizado no PostSpark.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Bibliotecas Necessárias](#bibliotecas-necessárias)
3. [Instalação](#instalação)
4. [Implementação Básica](#implementação-básica)
5. [Implementação Avançada](#implementação-avançada)
6. [Casos de Uso](#casos-de-uso)
7. [Solução de Problemas](#solução-de-problemas)
8. [Exemplos Completos](#exemplos-completos)

---

## Visão Geral

A captura de elementos DOM como imagens é uma funcionalidade útil para:
- Exportar gráficos e dashboards
- Salvar previews de designs
- Gerar thumbnails de conteúdo
- Criar relatórios visuais
- Permitir que usuários baixem conteúdo criado

### Como Funciona

O processo consiste em três etapas principais:

```
Elemento DOM → html2canvas → Canvas → Imagem → Download
```

1. **Selecionar** o elemento HTML que deseja capturar
2. **Converter** o elemento em um canvas usando `html2canvas`
3. **Exportar** o canvas como imagem (PNG, JPEG, etc.)

---

## Bibliotecas Necessárias

### Biblioteca Principal

| Biblioteca | Versão | Descrição |
|------------|--------|-----------|
| **html2canvas** | ^1.4.1 | Converte elementos DOM em canvas |

### Bibliotecas Opcionais

| Biblioteca | Versão | Descrição |
|------------|--------|-----------|
| **file-saver** | ^2.0.5 | Facilita download de arquivos |
| **jszip** | ^3.10.1 | Cria arquivos ZIP (para múltiplas imagens) |

---

## Instalação

### npm

```bash
npm install html2canvas
npm install file-saver jszip  # opcional
```

### yarn

```bash
yarn add html2canvas
yarn add file-saver jszip  # opcional
```

### pnpm

```bash
pnpm add html2canvas
pnpm add file-saver jszip  # opcional
```

### CDN (para uso direto no navegador)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
```

---

## Implementação Básica

### Exemplo 1: Capturar e Baixar um Elemento

```typescript
import html2canvas from 'html2canvas';

async function captureAndDownload(element: HTMLElement, filename: string = 'screenshot.png') {
    try {
        // Captura o elemento como canvas
        const canvas = await html2canvas(element, {
            useCORS: true,        // Permite carregar imagens de outros domínios
            scale: 2,             // Alta resolução (2x para retina)
            backgroundColor: null // Mantém transparência se houver
        });

        // Converte para data URL
        const dataUrl = canvas.toDataURL('image/png');

        // Cria link de download
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();

        return true;
    } catch (error) {
        console.error('Erro ao capturar elemento:', error);
        return false;
    }
}

// Uso
const element = document.getElementById('meu-elemento');
captureAndDownload(element, 'minha-imagem.png');
```

### Exemplo 2: Capturar com file-saver (melhor para arquivos grandes)

```typescript
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

async function captureAndSave(element: HTMLElement, filename: string = 'screenshot.png') {
    try {
        const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2,
            backgroundColor: null
        });

        // Converte canvas para blob
        canvas.toBlob((blob) => {
            if (blob) {
                saveAs(blob, filename);
            }
        }, 'image/png');

        return true;
    } catch (error) {
        console.error('Erro ao capturar elemento:', error);
        return false;
    }
}
```

### Exemplo 3: Hook React Reutilizável

```typescript
import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

interface UseScreenshotOptions {
    filename?: string;
    scale?: number;
    quality?: number;
}

export function useScreenshot(options: UseScreenshotOptions = {}) {
    const [isCapturing, setIsCapturing] = useState(false);
    const elementRef = useRef<HTMLElement>(null);

    const capture = async () => {
        if (!elementRef.current) return null;

        setIsCapturing(true);

        try {
            const canvas = await html2canvas(elementRef.current, {
                useCORS: true,
                scale: options.scale || 2,
                backgroundColor: null
            });

            const dataUrl = canvas.toDataURL('image/png', options.quality || 1);
            return dataUrl;
        } catch (error) {
            console.error('Erro ao capturar:', error);
            return null;
        } finally {
            setIsCapturing(false);
        }
    };

    const download = async () => {
        const dataUrl = await capture();
        if (!dataUrl) return false;

        const link = document.createElement('a');
        link.download = options.filename || 'screenshot.png';
        link.href = dataUrl;
        link.click();

        return true;
    };

    return {
        elementRef,
        capture,
        download,
        isCapturing
    };
}

// Uso em componente
function MyComponent() {
    const { elementRef, download, isCapturing } = useScreenshot({
        filename: 'meu-screenshot.png',
        scale: 2
    });

    return (
        <div>
            <div ref={elementRef} className="p-4 bg-white rounded-lg">
                <h1>Conteúdo a ser capturado</h1>
                <p>Este elemento será convertido em imagem</p>
            </div>
            <button 
                onClick={download} 
                disabled={isCapturing}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
                {isCapturing ? 'Capturando...' : 'Baixar Screenshot'}
            </button>
        </div>
    );
}
```

---

## Implementação Avançada

### Capturar Múltiplos Elementos como ZIP

```typescript
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface CaptureMultipleOptions {
    elements: HTMLElement[];
    filename?: string;
    scale?: number;
}

async function captureMultipleAsZip(options: CaptureMultipleOptions) {
    const { elements, filename = 'screenshots.zip', scale = 2 } = options;
    const zip = new JSZip();

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];

        try {
            const canvas = await html2canvas(element, {
                useCORS: true,
                scale,
                backgroundColor: null
            });

            // Converte para blob
            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, 'image/png');
            });

            if (blob) {
                zip.file(`screenshot-${i + 1}.png`, blob);
            }
        } catch (error) {
            console.error(`Erro ao capturar elemento ${i + 1}:`, error);
        }
    }

    // Gera e baixa o ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, filename);
}
```

### Capturar com Delay (para animações/carregamento)

```typescript
async function captureWithDelay(
    element: HTMLElement,
    delay: number = 500,
    filename: string = 'screenshot.png'
) {
    // Aguarda o delay especificado
    await new Promise(resolve => setTimeout(resolve, delay));

    const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        backgroundColor: null
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
```

### Capturar com Callback de Progresso

```typescript
interface CaptureProgressOptions {
    element: HTMLElement;
    onProgress?: (progress: number) => void;
    onComplete?: (dataUrl: string) => void;
    onError?: (error: Error) => void;
}

async function captureWithProgress(options: CaptureProgressOptions) {
    const { element, onProgress, onComplete, onError } = options;

    try {
        onProgress?.(10);

        const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2,
            backgroundColor: null,
            logging: true,
            onclone: (clonedDoc) => {
                onProgress?.(50);
                return clonedDoc;
            }
        });

        onProgress?.(80);

        const dataUrl = canvas.toDataURL('image/png');
        onProgress?.(100);
        onComplete?.(dataUrl);

        return dataUrl;
    } catch (error) {
        onError?.(error as Error);
        throw error;
    }
}
```

### Capturar Elemento com Scroll (conteúdo longo)

```typescript
async function captureScrollableElement(element: HTMLElement) {
    // Salva posição original do scroll
    const originalScrollTop = element.scrollTop;
    const originalScrollLeft = element.scrollLeft;

    // Scroll para o topo
    element.scrollTop = 0;
    element.scrollLeft = 0;

    try {
        const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2,
            backgroundColor: null,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        });

        // Restaura posição original
        element.scrollTop = originalScrollTop;
        element.scrollLeft = originalScrollLeft;

        return canvas;
    } catch (error) {
        // Restaura posição original em caso de erro
        element.scrollTop = originalScrollTop;
        element.scrollLeft = originalScrollLeft;
        throw error;
    }
}
```

---

## Casos de Uso

### 1. Dashboard de Analytics

```typescript
function DashboardExportButton() {
    const dashboardRef = useRef<HTMLDivElement>(null);

    const exportDashboard = async () => {
        if (!dashboardRef.current) return;

        const canvas = await html2canvas(dashboardRef.current, {
            useCORS: true,
            scale: 2,
            backgroundColor: '#ffffff'
        });

        const link = document.createElement('a');
        link.download = `dashboard-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div>
            <div ref={dashboardRef} className="p-6 bg-white">
                {/* Conteúdo do dashboard */}
            </div>
            <button onClick={exportDashboard}>Exportar Dashboard</button>
        </div>
    );
}
```

### 2. Card de Produto para E-commerce

```typescript
function ProductCard({ product }: { product: Product }) {
    const cardRef = useRef<HTMLDivElement>(null);

    const shareProduct = async () => {
        if (!cardRef.current) return;

        const canvas = await html2canvas(cardRef.current, {
            useCORS: true,
            scale: 2
        });

        // Compartilhar via Web Share API (mobile)
        if (navigator.share) {
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const file = new File([blob], 'product.png', { type: 'image/png' });
                    await navigator.share({
                        files: [file],
                        title: product.name
                    });
                }
            });
        }
    };

    return (
        <div ref={cardRef} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.price}</p>
        </div>
    );
}
```

### 3. Gerador de Certificados

```typescript
function CertificateGenerator({ name, course, date }: CertificateProps) {
    const certificateRef = useRef<HTMLDivElement>(null);

    const downloadCertificate = async () => {
        if (!certificateRef.current) return;

        const canvas = await html2canvas(certificateRef.current, {
            useCORS: true,
            scale: 3, // Alta resolução para impressão
            backgroundColor: '#ffffff'
        });

        const link = document.createElement('a');
        link.download = `certificado-${name.replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div>
            <div 
                ref={certificateRef} 
                className="w-[842px] h-[595px] p-12 bg-white border-8 border-yellow-500"
            >
                <h1 className="text-4xl font-bold text-center">Certificado de Conclusão</h1>
                <p className="text-2xl mt-8 text-center">
                    Certificamos que <strong>{name}</strong>
                </p>
                <p className="text-xl mt-4 text-center">
                    concluiu o curso <strong>{course}</strong>
                </p>
                <p className="text-lg mt-8 text-center">Data: {date}</p>
            </div>
            <button onClick={downloadCertificate}>Baixar Certificado</button>
        </div>
    );
}
```

### 4. Preview de Post para Redes Sociais

```typescript
function SocialPostPreview({ content, theme }: PostProps) {
    const previewRef = useRef<HTMLDivElement>(null);

    const downloadPost = async () => {
        if (!previewRef.current) return;

        const canvas = await html2canvas(previewRef.current, {
            useCORS: true,
            scale: 2,
            backgroundColor: theme.backgroundColor
        });

        const link = document.createElement('a');
        link.download = `post-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div>
            <div 
                ref={previewRef}
                className="w-[1080px] h-[1080px] p-12 flex items-center justify-center"
                style={{ backgroundColor: theme.backgroundColor }}
            >
                <p className="text-6xl font-bold" style={{ color: theme.textColor }}>
                    {content}
                </p>
            </div>
            <button onClick={downloadPost}>Baixar Post</button>
        </div>
    );
}
```

---

## Solução de Problemas

### Problema 1: Imagens não aparecem no screenshot

**Causa:** Imagens de domínios diferentes podem ser bloqueadas por CORS.

**Solução:**
```typescript
const canvas = await html2canvas(element, {
    useCORS: true,        // Habilita CORS
    allowTaint: true,     // Permite imagens "tainted"
    proxy: '/api/proxy'   // Opcional: usa proxy para imagens
});
```

### Problema 2: Texto cortado ou com fonte incorreta

**Causa:** Fontes podem não estar carregadas no momento da captura.

**Solução:**
```typescript
// Aguarda carregamento de fontes
await document.fonts.ready;

const canvas = await html2canvas(element, {
    useCORS: true,
    scale: 2
});
```

### Problema 3: Elementos com scroll não capturam completamente

**Causa:** html2canvas captura apenas a área visível.

**Solução:**
```typescript
const canvas = await html2canvas(element, {
    useCORS: true,
    scale: 2,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight
});
```

### Problema 4: Cores diferentes do original

**Causa:** html2canvas pode ter problemas com certas propriedades CSS.

**Solução:**
```typescript
const canvas = await html2canvas(element, {
    useCORS: true,
    scale: 2,
    backgroundColor: null, // Mantém transparência
    logging: true           // Ativa logs para debug
});
```

### Problema 5: Baixa qualidade da imagem

**Causa:** Scale padrão é 1, o que pode resultar em imagens pixeladas.

**Solução:**
```typescript
const canvas = await html2canvas(element, {
    useCORS: true,
    scale: 2,  // ou 3 para impressão
    backgroundColor: null
});
```

### Problema 6: Elementos com animações não capturados corretamente

**Causa:** A captura pode ocorrer durante uma animação.

**Solução:**
```typescript
// Pausa animações antes de capturar
element.style.animationPlayState = 'paused';

const canvas = await html2canvas(element, {
    useCORS: true,
    scale: 2
});

// Retoma animações
element.style.animationPlayState = 'running';
```

---

## Exemplos Completos

### Exemplo 1: Aplicação Vanilla JS

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Screenshot Demo</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <style>
        .card {
            width: 400px;
            padding: 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            color: white;
            font-family: Arial, sans-serif;
        }
        .card h2 { margin: 0 0 12px 0; }
        .card p { margin: 0; opacity: 0.9; }
        button {
            margin-top: 16px;
            padding: 12px 24px;
            background: #333;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }
        button:hover { background: #555; }
    </style>
</head>
<body>
    <div id="capture-target" class="card">
        <h2>🎨 Card Exemplo</h2>
        <p>Este card será capturado como imagem quando você clicar no botão abaixo.</p>
    </div>
    
    <button onclick="captureElement()">📸 Capturar Screenshot</button>

    <script>
        async function captureElement() {
            const element = document.getElementById('capture-target');
            
            try {
                const canvas = await html2canvas(element, {
                    useCORS: true,
                    scale: 2,
                    backgroundColor: null
                });

                const link = document.createElement('a');
                link.download = 'card-screenshot.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error('Erro ao capturar:', error);
                alert('Erro ao capturar o elemento');
            }
        }
    </script>
</body>
</html>
```

### Exemplo 2: Aplicação React Completa

```typescript
// components/ScreenshotCapture.tsx
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

interface ScreenshotCaptureProps {
    children: React.ReactNode;
    filename?: string;
    onCaptureStart?: () => void;
    onCaptureEnd?: (success: boolean) => void;
}

export function ScreenshotCapture({
    children,
    filename = 'screenshot.png',
    onCaptureStart,
    onCaptureEnd
}: ScreenshotCaptureProps) {
    const [isCapturing, setIsCapturing] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    const capture = async () => {
        if (!elementRef.current) return;

        setIsCapturing(true);
        onCaptureStart?.();

        try {
            // Aguarda fontes carregarem
            await document.fonts.ready;

            const canvas = await html2canvas(elementRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: null,
                logging: false
            });

            canvas.toBlob((blob) => {
                if (blob) {
                    saveAs(blob, filename);
                    onCaptureEnd?.(true);
                }
            }, 'image/png');
        } catch (error) {
            console.error('Erro ao capturar:', error);
            onCaptureEnd?.(false);
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div ref={elementRef} className="inline-block">
                {children}
            </div>
            <button
                onClick={capture}
                disabled={isCapturing}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
                {isCapturing ? 'Capturando...' : '📸 Capturar Screenshot'}
            </button>
        </div>
    );
}

// Uso
function App() {
    return (
        <div className="p-8">
            <ScreenshotCapture filename="meu-card.png">
                <div className="w-80 p-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl text-white shadow-xl">
                    <h2 className="text-2xl font-bold mb-2">Card Exemplo</h2>
                    <p className="opacity-90">Este card será capturado como imagem PNG de alta qualidade.</p>
                </div>
            </ScreenshotCapture>
        </div>
    );
}
```

### Exemplo 3: Utilitário TypeScript Reutilizável

```typescript
// utils/screenshot.ts
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

export interface ScreenshotOptions {
    scale?: number;
    backgroundColor?: string | null;
    useCORS?: boolean;
    quality?: number;
    format?: 'png' | 'jpeg' | 'webp';
    delay?: number;
}

export interface ScreenshotResult {
    success: boolean;
    dataUrl?: string;
    blob?: Blob;
    error?: Error;
}

/**
 * Captura um elemento DOM como imagem
 */
export async function captureElement(
    element: HTMLElement,
    options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
    const {
        scale = 2,
        backgroundColor = null,
        useCORS = true,
        quality = 1,
        format = 'png',
        delay = 0
    } = options;

    try {
        // Aguarda delay se especificado
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Aguarda fontes carregarem
        await document.fonts.ready;

        const canvas = await html2canvas(element, {
            useCORS,
            scale,
            backgroundColor,
            logging: false
        });

        const mimeType = `image/${format}`;
        const dataUrl = canvas.toDataURL(mimeType, quality);

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, mimeType, quality);
        });

        return {
            success: true,
            dataUrl,
            blob: blob || undefined
        };
    } catch (error) {
        return {
            success: false,
            error: error as Error
        };
    }
}

/**
 * Captura e baixa um elemento DOM
 */
export async function captureAndDownload(
    element: HTMLElement,
    filename: string,
    options: ScreenshotOptions = {}
): Promise<boolean> {
    const result = await captureElement(element, options);

    if (result.success && result.blob) {
        saveAs(result.blob, filename);
        return true;
    }

    return false;
}

/**
 * Captura múltiplos elementos como ZIP
 */
export async function captureMultipleAsZip(
    elements: HTMLElement[],
    filename: string = 'screenshots.zip',
    options: ScreenshotOptions = {}
): Promise<boolean> {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (let i = 0; i < elements.length; i++) {
        const result = await captureElement(elements[i], options);

        if (result.success && result.blob) {
            zip.file(`screenshot-${i + 1}.png`, result.blob);
        }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, filename);

    return true;
}

/**
 * Copia screenshot para área de transferência
 */
export async function copyToClipboard(
    element: HTMLElement,
    options: ScreenshotOptions = {}
): Promise<boolean> {
    const result = await captureElement(element, options);

    if (result.success && result.blob) {
        try {
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': result.blob })
            ]);
            return true;
        } catch {
            return false;
        }
    }

    return false;
}
```

---

## Dicas e Melhores Práticas

### ✅ Boas Práticas

1. **Sempre use `useCORS: true`** para permitir imagens de outros domínios
2. **Use `scale: 2` ou maior** para imagens de alta qualidade
3. **Aguarde fontes carregarem** com `await document.fonts.ready`
4. **Use refs em React** para referenciar elementos
5. **Trate erros adequadamente** com try/catch
6. **Mostre feedback visual** durante a captura (loading states)
7. **Teste em diferentes navegadores** (Chrome, Firefox, Safari)

### ❌ Evite

1. Não capture elementos muito grandes (pode causar problemas de performance)
2. Não use `backgroundColor: null` se precisar de fundo sólido
3. Não esqueça de limpar recursos (blobs, URLs temporárias)
4. Não capture elementos com animações em andamento
5. Não use scale muito alto (pode causar problemas de memória)

---

## Referências

- [html2canvas Documentation](https://html2canvas.hertzen.com/)
- [file-saver Documentation](https://github.com/eligrey/FileSaver.js)
- [jszip Documentation](https://stuk.github.io/jszip/)
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)

---

## Conclusão

Com este tutorial, você agora tem todas as ferramentas necessárias para implementar funcionalidade de screenshot em qualquer projeto web. A combinação de `html2canvas` com bibliotecas auxiliares como `file-saver` e `jszip` oferece uma solução robusta e flexível para capturar elementos DOM como imagens.

Lembre-se de testar sempre em diferentes navegadores e dispositivos, pois o comportamento pode variar ligeiramente entre eles.
