'use client';

import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { useAmbientIntelligence, useInputQuality } from '@/hooks/useAmbientIntelligence';
import { usePostGeneration, type PostFormat, type ImageStyle } from '@/hooks/usePostGeneration';
import { useEditSettings } from '@/hooks/useEditSettings';
import { TextArea } from '@/components/ui/TextArea';
import { AmbientBadge } from './AmbientBadge';
import { ChameleonButton } from './ChameleonButton';
import { MagicPencil } from './MagicPencil';
import { BackgroundManager } from './BackgroundManager';
import { EditPanel } from './EditPanel';
import { MobileNavBar } from './MobileNavBar';
import { type BackgroundSettings } from '@/types/editor';
import { downloadCarouselAsZip } from '@/utils/downloadCarousel';
import { PostPreview } from '@/components/preview/PostPreview';
import { Check, Download, Copy, Sparkles, LayoutGrid, Maximize2, Sliders } from 'lucide-react';
import type { PostAspectRatio } from '@/types/ambient';

export interface MagicInterfaceProps {
    onGenerate?: (text: string) => void;
}
// Seletor de formato
function FormatSelector({
    value,
    onChange
}: {
    value: PostFormat;
    onChange: (v: PostFormat) => void;
}) {
    const options: { value: PostFormat; label: string; icon: string }[] = [
        { value: 'static', label: 'Estático', icon: '🖼️' },
        { value: 'carousel', label: 'Carrossel', icon: '📱' },
    ];

    return (
        <div className="flex gap-2">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${value === opt.value
                            ? 'bg-white/20 text-white'
                            : 'bg-white/5 text-white/50 hover:bg-white/10'
                        }
                    `}
                >
                    {opt.icon} {opt.label}
                </button>
            ))}
        </div>
    );
}

// Toggle de IA
function AIToggle({
    enabled,
    onChange
}: {
    enabled: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${enabled
                    ? 'bg-violet-500/30 text-violet-300 ring-1 ring-violet-500/50'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }
            `}
        >
            <Sparkles className="w-4 h-4" />
            {enabled ? 'IA Ativada' : 'Sem IA'}
        </button>
    );
}

// Seletor de tamanho (Requisito 4)
function SizeSelector({
    value,
    onChange
}: {
    value: PostAspectRatio;
    onChange: (v: PostAspectRatio) => void;
}) {
    const options: { value: PostAspectRatio; label: string }[] = [
        { value: '1:1', label: '1:1' },
        { value: '5:6', label: '5:6' },
        { value: '9:16', label: '9:16' },
    ];

    return (
        <div className="flex gap-2">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`
                        px-3 py-2 rounded-lg text-xs font-bold transition-all
                        ${value === opt.value
                            ? 'bg-violet-500/30 text-violet-300 ring-1 ring-violet-500/50'
                            : 'bg-white/5 text-white/50 hover:bg-white/10'
                        }
                    `}
                >
                    {opt.value}
                </button>
            ))}
        </div>
    );
}

export function MagicInterface({ onGenerate }: MagicInterfaceProps) {
    const [text, setText] = useState('');
    const [format, setFormat] = useState<PostFormat>('static');
    const [aspectRatio, setAspectRatio] = useState<PostAspectRatio>('1:1');
    const [useAI, setUseAI] = useState(true);
    const [captionCopied, setCaptionCopied] = useState(false);
    const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);

    // Background Settings
    const [bgSettings, setBgSettings] = useState<BackgroundSettings>({
        type: 'upload',
        overlayOpacity: 0.5,
        overlayColor: '#000000',
        imagePosition: { x: 50, y: 50 },
    });

    useEffect(() => {
        // console.debug('[MagicInterface] bgSettings changed:', bgSettings);
    }, [bgSettings]);

    const { config, reset: resetAmbient } = useAmbientIntelligence(text);
    const { isPoor, reason } = useInputQuality(text);

    // Edit Settings - Controle Total
    const {
        settings: editSettings,
        isManualOverride,
        setCurrentSlide: setConfigSlide,
        updateImage,
        updateDesign,
        updateLayout,
        updateText,
        resetToAuto,
        getComputedColors,
        getComputedSettings,
    } = useEditSettings();

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        setConfigSlide(currentSlide);
    }, [currentSlide, setConfigSlide]);

    // Merge global settings with current slide overrides
    const activeSettings = {
        ...editSettings,
        ...getComputedSettings(currentSlide),
    };
    const {
        isLoading,
        stage,
        progress,
        content,
        imageBlob,
        error,
        generate,
        downloadPost,
        copyCaption,
    } = usePostGeneration();

    const handleFormatChange = (newFormat: PostFormat) => {
        setFormat(newFormat);
        if (newFormat === 'carousel') {
            setAspectRatio('5:6');
        }
    };

    const [isZipLoading, setIsZipLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

    // Download usando html2canvas para capturar o preview com texto React
    const handleDownloadPost = async () => {
        if (!previewRef.current) return;

        try {
            setIsDownloading(true);

            // Encontra o container do preview real (dentro do PostPreview)
            const previewElement = previewRef.current.querySelector('.rounded-2xl.overflow-hidden') as HTMLElement;
            if (!previewElement) {
                // console.error('Preview element not found');
                return;
            }

            const canvas = await html2canvas(previewElement, {
                scale: 2, // Alta resolução (2x)
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
            });

            // Download
            const link = document.createElement('a');
            link.download = `postspark-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            // console.error('Erro ao baixar post:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadCarousel = async () => {
        if (!content?.slides || !config) return;

        try {
            setIsZipLoading(true);
            await downloadCarouselAsZip({
                slides: content.slides,
                config: {
                    ...config,
                    aspectRatio,
                    overlayOpacity: bgSettings.overlayOpacity,
                    imagePosition: bgSettings.imagePosition
                },
                imageUrl: bgSettings.url,
                filename: `postspark-carousel-${Date.now()}`
            });
        } catch (error) {
            // console.error('Erro ao baixar carrossel:', error);
        } finally {
            setIsZipLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!text.trim()) return;

        const result = await generate({
            text,
            state: config.state,
            format,
            imageStyle: 'realistic',
            backgroundUrl: bgSettings.url,
            overlayOpacity: bgSettings.overlayOpacity,
            imagePosition: bgSettings.imagePosition,
            aspectRatio,
            useAI,
        });

        if (result.success) {
            onGenerate?.(text);
        }
    };

    const handleCopyCaption = async () => {
        const success = await copyCaption();
        if (success) {
            setCaptionCopied(true);
            setTimeout(() => setCaptionCopied(false), 2000);
        }
    };

    const handleSuggestion = (type: 'punch' | 'story' | 'sale') => {
        const suggestions: Record<string, string> = {
            punch: text + ' 💥 AGORA!',
            story: 'Eu nunca imaginei que... ' + text,
            sale: '🔥 OFERTA IMPERDÍVEL: ' + text,
        };
        setText(suggestions[type] || text);
    };

    // Mensagens de progresso
    const progressMessages: Record<string, string> = {
        'idle': '',
        'generating-content': '✨ Gerando texto com IA...',
        'composing-image': '🎨 Compondo imagem...',
        'done': '✅ Post criado!',
        'error': '❌ Erro ao gerar',
    };

    return (
        <div
            className="relative w-full min-h-screen overflow-hidden transition-colors duration-500"
            style={{ backgroundColor: config.theme.bg }}
        >
            {/* Success/Error Toast */}
            <AnimatePresence>
                {(stage === 'done' || error) && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`
                            fixed top-4 left-1/2 -translate-x-1/2 z-50 
                            flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-lg
                            ${error ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}
                        `}
                    >
                        {error ? (
                            <span>❌ {error}</span>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                <span>Post criado com sucesso!</span>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                    >
                        <div className="text-center space-y-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="w-12 h-12 mx-auto border-4 border-white/20 border-t-white rounded-full"
                            />
                            <p className="text-white text-lg font-medium">
                                {progressMessages[stage]}
                            </p>
                            <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-50 transition-all duration-500"
                    style={{
                        background: `radial-gradient(circle at 50% 0%, ${config.theme.accent}20 0%, transparent 50%)`,
                    }}
                />
            </div>

            {/* Main content */}
            <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Editor Panel */}
                    <div id="editor-section" className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h1
                                className="text-2xl font-bold transition-colors duration-300"
                                style={{ color: config.theme.text }}
                            >
                                ✨ PostSpark
                            </h1>
                            <AmbientBadge config={config} onReset={resetAmbient} />
                        </div>

                        {/* Options Bar */}
                        <div className="flex flex-wrap items-center gap-6 glass rounded-xl p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-white/60 text-sm">
                                    <LayoutGrid className="w-4 h-4" />
                                    <span>Formato:</span>
                                </div>
                                <FormatSelector value={format} onChange={setFormat} />
                            </div>

                            <div className="w-px h-6 bg-white/10 hidden sm:block" />

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-white/60 text-sm">
                                    <Maximize2 className="w-4 h-4" />
                                    <span>Tamanho:</span>
                                </div>
                                <SizeSelector value={aspectRatio} onChange={setAspectRatio} />
                            </div>

                            <div className="w-px h-6 bg-white/10 hidden lg:block" />

                            <AIToggle enabled={useAI} onChange={setUseAI} />
                        </div>

                        {/* Background Manager */}
                        <BackgroundManager
                            currentText={text}
                            onSettingsChange={setBgSettings}
                        />

                        {/* Input Area */}
                        <div className="relative">
                            <div
                                className="rounded-2xl overflow-hidden transition-shadow duration-300"
                                style={{ boxShadow: `0 0 40px ${config.theme.accent}20` }}
                            >
                                <TextArea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Digite sua mensagem aqui... A mágica acontece enquanto você escreve ✨"
                                    minHeight={150}
                                    maxHeight={300}
                                    className="!bg-black/20 !border-white/5"
                                    style={{ color: config.theme.text }}
                                />
                            </div>
                            <div className="absolute bottom-4 right-4">
                                <MagicPencil
                                    isPoor={isPoor}
                                    reason={reason}
                                    onSuggestionClick={handleSuggestion}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <div className="text-sm" style={{ color: `${config.theme.text}60` }}>
                                {text.length > 0 && <span>{text.length} caracteres</span>}
                            </div>
                            <ChameleonButton
                                config={config}
                                onClick={handleGenerate}
                                isLoading={isLoading}
                                disabled={!text.trim()}
                            />
                        </div>

                    </div>

                    {/* Preview Panel */}
                    <div id="preview-section" className="lg:sticky lg:top-8 space-y-6">
                        <motion.div
                            ref={previewRef}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {(() => {
                                // console.log('[MagicInterface] PostPreview props:', {
                                //     contentExists: !!content,
                                //     hasSlides: !!content?.slides,
                                //     slidesCount: content?.slides?.length,
                                //     slides: content?.slides,
                                //     headline: content?.headline?.substring(0, 50)
                                // });
                                return (
                                    <PostPreview
                                        text={content?.headline || text}
                                        bodyText={content?.body}
                                        config={{
                                            ...config,
                                            // Nunca usar layout carousel quando formato é static
                                            layout: format === 'carousel'
                                                ? 'carousel'
                                                : config.layout === 'carousel'
                                                    ? 'centered'  // Fallback seguro para posts estáticos
                                                    : config.layout,
                                            aspectRatio,
                                            imagePosition: bgSettings.imagePosition,
                                            overlayOpacity: bgSettings.overlayOpacity
                                        }}
                                        overlayOpacity={bgSettings.overlayOpacity}
                                        overlayColor={bgSettings.overlayColor}
                                        imageUrl={bgSettings.url}
                                        slides={content?.slides}
                                        editSettings={activeSettings}
                                        currentSlide={currentSlide}
                                        onSlideChange={setCurrentSlide}
                                        onLayoutUpdate={(u) => updateLayout(u, currentSlide)}
                                    />
                                );
                            })()}
                        </motion.div>

                        {/* Generated Content Actions */}
                        <AnimatePresence>
                            {(imageBlob || (format === 'carousel' && content)) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="glass rounded-xl p-4 space-y-4"
                                >
                                    <h3 className="text-white font-semibold flex items-center gap-2">
                                        <Check className="w-5 h-5 text-green-400" />
                                        {format === 'carousel' ? 'Carrossel Gerado!' : 'Post Gerado!'}
                                    </h3>

                                    <div className="flex gap-3">
                                        {format !== 'carousel' && content && (
                                            <button
                                                onClick={handleDownloadPost}
                                                disabled={isDownloading}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                                            >
                                                {isDownloading ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Download className="w-5 h-5" />
                                                )}
                                                {isDownloading ? 'Gerando...' : 'Baixar PNG'}
                                            </button>
                                        )}
                                        {format === 'carousel' && content?.slides && (
                                            <button
                                                onClick={handleDownloadCarousel}
                                                disabled={isZipLoading}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                                            >
                                                {isZipLoading ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Download className="w-5 h-5" />
                                                )}
                                                {isZipLoading ? 'ZIP' : 'Baixar ZIP'}
                                            </button>
                                        )}
                                        <button
                                            onClick={handleCopyCaption}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-all"
                                        >
                                            {captionCopied ? (
                                                <>
                                                    <Check className="w-5 h-5 text-green-400" />
                                                    Copiado!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-5 h-5" />
                                                    Copiar Legenda
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Botao Controle Total */}
                                    <button
                                        onClick={() => setIsEditPanelOpen(true)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3
                                                   bg-violet-500/20 hover:bg-violet-500/30 rounded-lg
                                                   text-violet-300 font-medium transition-all
                                                   border border-violet-500/30"
                                    >
                                        <Sliders className="w-5 h-5" />
                                        Controle Total
                                        {isManualOverride && (
                                            <span className="text-xs opacity-60 ml-1">(editado)</span>
                                        )}
                                    </button>

                                    {content?.caption && (
                                        <div className="p-3 bg-black/20 rounded-lg text-white/80 text-sm max-h-48 overflow-y-auto whitespace-pre-wrap">
                                            <p>{content.caption}</p>
                                            <p className="mt-4 text-blue-400">
                                                {content.hashtags.join(' ')}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile Floating Navigation Bar */}
            <MobileNavBar
                editorSectionId="editor-section"
                previewSectionId="preview-section"
            />

            {/* Edit Panel - Controle Total */}
            <EditPanel
                isOpen={isEditPanelOpen}
                onClose={() => setIsEditPanelOpen(false)}
                settings={activeSettings}
                ambientConfig={config}
                onUpdateImage={(u) => updateImage(u, currentSlide)}
                onUpdateDesign={(u) => updateDesign(u, currentSlide)}
                onUpdateLayout={(u) => updateLayout(u, currentSlide)}
                onUpdateText={(u) => updateText(u, currentSlide)}
                onReset={resetToAuto}
                generatedHeadline={content?.headline}
                generatedBody={content?.body}
            />
        </div>
    );
}
