import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { LayoutCarousel } from '@/components/preview/layouts/LayoutCarousel';
import { LayoutCentered } from '@/components/preview/layouts/LayoutCentered';
import { LayoutHierarchy } from '@/components/preview/layouts/LayoutHierarchy';
import { LayoutSplit } from '@/components/preview/layouts/LayoutSplit';
import { LayoutCard } from '@/components/preview/layouts/LayoutCard';
import { LayoutHeadline } from '@/components/preview/layouts/LayoutHeadline';
import type { AmbientConfig } from '@/types/ambient';

// Função para pegar o componente de layout correto
// Para download, vamos forçar o uso do LayoutCarousel modificado ou renderizar slides individualmente
// Mas o LayoutCarousel atual tem lógica de navegação interna.
// Melhor abordagem: Renderizar uma versão "flat" do slide.

interface DownloadOptions {
    slides: string[];
    config: AmbientConfig;
    imageUrl?: string;
    filename?: string;
}

export async function downloadCarouselAsZip({
    slides,
    config,
    imageUrl,
    filename = 'postspark-carousel'
}: DownloadOptions) {
    const zip = new JSZip();
    const container = document.createElement('div');

    // Configurar container invisível mas com tamanho fixo
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';

    // Tamanho baseado no aspect ratio 5:6 (1080x1350)
    // Usamos uma escala menor para não pesar, mas html2canvas pode escalar
    const width = 1080;
    const height = 1350; // 4:5 ratio (Instagram Portrait) ou 5:6

    // Se aspect ratio do config for 5:6, usa 1080x1350. Se 1:1, 1080x1080.
    const finalHeight = config.aspectRatio === '1:1' ? 1080 : 1350;

    container.style.width = `${width}px`;
    container.style.height = `${finalHeight}px`;
    container.style.zIndex = '-1000';

    document.body.appendChild(container);

    try {
        // Criar uma cópia do config para download (sem animações, etc)
        const exportConfig = { ...config };

        // Iterar sobre cada slide
        for (let i = 0; i < slides.length; i++) {
            const slideContent = slides[i];

            // Renderizar o slide no container
            // Usamos LayoutCarousel mas "hackeado" para mostrar apenas o slide atual?
            // Não, o LayoutCarousel tem estado interno.
            // Precisamos renderizar o CONTEÚDO do slide.
            // A maioria dos layouts suporta renderização estática.
            // Vamos usar o LayoutCentered como base para os slides de conteúdo se for texto simples,
            // ou criar um mini-componente aqui mesmo que simula o slide.

            // Renderizar componente React no container DOM
            const root = createRoot(container);

            // IMPORTANTE: Precisamos replicar a estrutura exata do slide do LayoutCarousel
            const slideElement = createElement(SlideRenderer, {
                text: slideContent,
                config: exportConfig,
                imageUrl,
                totalSlides: slides.length,
                currentSlide: i
            });

            root.render(slideElement);

            // Esperar renderização
            await new Promise(resolve => setTimeout(resolve, 500)); // Pequeno delay garante carregamento de fonts/bg

            // Capturar
            const canvas = await html2canvas(container, {
                useCORS: true,
                scale: 1, // Já estamos em alta resolução
                backgroundColor: null,
                logging: false
            });

            // Converter para blob
            const blob = await new Promise<Blob | null>(resolve =>
                canvas.toBlob(blob => resolve(blob), 'image/png')
            );

            if (blob) {
                zip.file(`slide_${i + 1}.png`, blob);
            }

            // Limpar para o próximo (unmount)
            root.unmount();
        }

        // Gerar ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${filename}.zip`);

    } catch (error) {
        // console.error('Erro ao gerar ZIP:', error);
        throw error;
    } finally {
        document.body.removeChild(container);
    }
}

// Componente auxiliar para renderizar um único slide
// Replica o visual do LayoutCarousel
function SlideRenderer({ text, config, imageUrl, totalSlides, currentSlide }: any) {
    return (
        <div 
            className= {`w-full h-full relative overflow-hidden flex flex-col p-12 ${config.theme.className}`
}
style = {{
    backgroundColor: config.theme.bg,
        color: config.theme.text
}}
        >
    {/* Background Image */ }
{
    imageUrl && (
        <>
        <div 
                        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
    style = {{
        backgroundImage: `url(${imageUrl})`,
            backgroundPosition: '50% 50%'
    }
}
                    />
    < div
className = "absolute inset-0 transition-opacity duration-300"
style = {{
    backgroundColor: config.theme.bg,
        opacity: config.overlayOpacity ?? 0.7
}}
                    />
    </>
            )}

{/* Content Container */ }
<div className="relative z-10 flex-1 flex flex-col" >
    {/* Header / Brand */ }
    < div className = "flex justify-between items-center mb-8 opacity-60" >
        <span className="text-2xl font-bold tracking-tighter" > PostSpark </span>
            < span className = "text-xl font-medium" > { currentSlide + 1}/{totalSlides}</span >
                </div>

{/* Main Content */ }
<div className="flex-1 flex items-center justify-center" >
    <h2 
                        className="text-6xl font-black leading-tight tracking-tight text-center whitespace-pre-wrap"
style = {{ textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    >
    { text }
    </h2>
    </div>

{/* Footer / CTA (only on last slide) */ }
<div className="mt-8 h-12 flex items-center justify-center" >
    { currentSlide === totalSlides - 1 && (
        <div 
                            className="bg-white text-black px-8 py-3 rounded-full font-bold text-xl shadow-lg"
    >
    { config.ctaText || 'Link na Bio' }
    </div>
                    )}
{
    currentSlide < totalSlides - 1 && (
        <div className="animate-pulse" >
            <span className="text-4xl" >→</span>
                </div>
                     )
}
</div>
    </div>
    </div>
    );
}
