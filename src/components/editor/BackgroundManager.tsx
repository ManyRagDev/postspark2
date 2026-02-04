'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Image as ImageIcon, Upload, Sparkles, FolderOpen, Loader2, Check, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageGenerationModal } from '@/components/ui/ImageGenerationModal';
import type { ImageProvider } from '@/types/api';

export interface BackgroundCategory {
    id: string;
    name: string;
    images: string[];
}

export interface BackgroundSettings {
    type: 'gallery' | 'upload' | 'ai';
    url?: string;
    overlayOpacity: number;
    overlayColor?: string;
    imagePosition: { x: number; y: number };
}

interface BackgroundManagerProps {
    onSettingsChange: (settings: BackgroundSettings) => void;
    currentText: string;
}

export function BackgroundManager({ onSettingsChange, currentText }: BackgroundManagerProps) {
    const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'ai'>('upload');
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Gallery State
    const [categories, setCategories] = useState<BackgroundCategory[]>([]);
    const [isLoadingGallery, setIsLoadingGallery] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

    // Shared State
    const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
    const [imageSourceTab, setImageSourceTab] = useState<'gallery' | 'upload' | 'ai' | undefined>(undefined);
    const [overlayOpacity, setOverlayOpacity] = useState(0.5);
    const [overlayColor, setOverlayColor] = useState('#000000');
    const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });

    // AI State
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isComplex, setIsComplex] = useState(false);  // false = Pollinations, true = Gemini
    const [showGenerationModal, setShowGenerationModal] = useState(false);
    const [generationProvider, setGenerationProvider] = useState<ImageProvider | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // Garantir que estamos no cliente para usar Portal
    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevenir scroll quando galeria está aberta
    useEffect(() => {
        if (isGalleryOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isGalleryOpen]);

    // Carregar galeria quando abre
    useEffect(() => {
        if (isGalleryOpen && categories.length === 0) {
            loadGallery();
        }
    }, [isGalleryOpen, categories.length]);

    async function loadGallery() {
        setIsLoadingGallery(true);
        try {
            const res = await fetch('/api/backgrounds');
            const data = await res.json();
            setCategories(data);
        } catch (e) {
            // console.error('Falha ao carregar galeria', e);
        } finally {
            setIsLoadingGallery(false);
        }
    }

    // Notificar pai quando algo mudar
    useEffect(() => {
        onSettingsChange({
            type: activeTab,
            url: selectedImage,
            overlayOpacity,
            overlayColor,
            imagePosition,
        });
    }, [selectedImage, overlayOpacity, overlayColor, activeTab, imagePosition, onSettingsChange]);

    const handleTabClick = (tab: 'gallery' | 'upload' | 'ai') => {
        // Resetar imagem ao trocar de aba (Requisito 2)
        if (tab !== activeTab) {
            setSelectedImage(undefined);
            setImagePosition({ x: 50, y: 50 });
        }

        setActiveTab(tab);
        if (tab === 'gallery') {
            setIsGalleryOpen(true);
        }
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setSelectedImage(result);
            setImageSourceTab('upload');
        };
        reader.readAsDataURL(file);
    };

    // Ref para prevenir chamadas duplicadas (React Strict Mode / Cliques rápidos)
    const isRequestInProgress = useRef(false);

    const handleGenerateAI = async () => {
        const promptToUse = aiPrompt.trim() || currentText;
        const provider: ImageProvider = isComplex ? 'gemini' : 'pollinations';

        // console.log(`🤖 [BackgroundManager] Request Start. Mode: ${isComplex ? 'Complex' : 'Simple'}, Input:`, promptToUse);

        if (!promptToUse) return;

        // Verifica trava
        if (isRequestInProgress.current) {
            // console.warn('🤖 [BackgroundManager] Requisicao ja em andamento. Ignorando duplicata.');
            return;
        }

        try {
            isRequestInProgress.current = true;
            setIsGeneratingImage(true);
            setShowGenerationModal(true);
            setGenerationProvider(provider);
            setGenerationError(null);

            // console.log(`🤖 [BackgroundManager] Fetching /api/generate-image with isComplex=${isComplex}...`);
            const res = await fetch('/api/generate-image', {
                method: 'POST',
                body: JSON.stringify({ prompt: promptToUse, isComplex }),
                headers: { 'Content-Type': 'application/json' },
            });
            // console.log('🤖 [BackgroundManager] API Status:', res.status);

            const data = await res.json();
            // console.log('🤖 [BackgroundManager] API Response:', data);

            // Verifica erros especificos
            if (!res.ok) {
                if (data.code === 'QUOTA_EXCEEDED') {
                    setGenerationError('Limite de uso do Gemini atingido. Tente o modo Simples ou aguarde alguns minutos.');
                } else {
                    setGenerationError(data.error || 'Erro ao gerar imagem');
                }
                return;
            }

            // Aceita tanto image (base64) quanto url
            const imageUrl = data.image || data.url;

            if (imageUrl) {
                // console.log(`🤖 [BackgroundManager] Success! Provider: ${data.provider}, Image: ${imageUrl.substring(0, 50)}...`);
                setSelectedImage(imageUrl);
                setImageSourceTab('ai');
                // Fecha modal apos sucesso
                setTimeout(() => setShowGenerationModal(false), 500);
            } else {
                setGenerationError('Nenhuma imagem foi retornada');
            }
        } catch (e) {
            // console.error('🤖 [BackgroundManager] Fetch error:', e);
            setGenerationError('Erro de conexao. Tente novamente.');
        } finally {
            isRequestInProgress.current = false;
            setIsGeneratingImage(false);
            // console.log('🤖 [BackgroundManager] Request Finished.');
        }
    };

    const handleRetryGeneration = () => {
        setGenerationError(null);
        setShowGenerationModal(false);
        // Pequeno delay antes de tentar novamente
        setTimeout(() => handleGenerateAI(), 100);
    };

    const handleCloseModal = () => {
        setShowGenerationModal(false);
        setGenerationError(null);
    };

    // Ao selecionar imagem da galeria: fecha modal e aplica
    const handleSelectImage = (img: string) => {
        setSelectedImage(img);
        setImageSourceTab('gallery');
        setIsGalleryOpen(false);
    };

    // Imagens a serem exibidas
    const allImages = categories.flatMap(c => c.images);
    const displayImages = selectedCategory === 'all'
        ? allImages
        : categories.find(c => c.id === selectedCategory)?.images || [];

    const getCategoryLabel = () => {
        if (selectedCategory === 'all') return `Todos (${allImages.length})`;
        const cat = categories.find(c => c.id === selectedCategory);
        return cat ? `${cat.name} (${cat.images.length})` : 'Selecione';
    };

    return (
        <div className="glass rounded-xl p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between text-white/60 text-sm">
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Plano de Fundo</span>
                </div>
            </div>

            {/* TABS */}
            <div className="flex gap-2 p-1 bg-black/20 rounded-lg">
                {[
                    { id: 'gallery', label: 'Galeria', icon: FolderOpen },
                    { id: 'upload', label: 'Upload', icon: Upload },
                    { id: 'ai', label: 'Criar (IA)', icon: Sparkles },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id as any)}
                        className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all
              ${activeTab === tab.id
                                ? 'bg-white/20 text-white shadow-sm'
                                : 'text-white/50 hover:bg-white/10 hover:text-white/70'
                            }
            `}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area - Inline para Upload e IA */}
            <div className="bg-black/20 rounded-lg p-4 min-h-[180px]">

                {/* UPLOAD TAB */}
                {activeTab === 'upload' && (
                    <div className="h-full flex flex-col">
                        {selectedImage && imageSourceTab === 'upload' ? (
                            <div className="space-y-3">
                                <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10">
                                    <img src={selectedImage} alt="Uploaded" className="w-full h-full object-cover" />
                                    <button onClick={() => { setSelectedImage(undefined); setImageSourceTab(undefined); }} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white/70 hover:text-white transition-colors">
                                        <span className="text-xs">✕</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg hover:border-violet-500/30 transition-colors cursor-pointer min-h-[150px]">
                                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="bg-upload-inline" />
                                <label htmlFor="bg-upload-inline" className="cursor-pointer flex flex-col items-center gap-3 p-6 text-center w-full h-full justify-center">
                                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                                        <Upload className="w-7 h-7 text-white/40" />
                                    </div>
                                    <div>
                                        <span className="text-white font-medium block">Clique para enviar</span>
                                        <span className="text-white/40 text-sm">JPG, PNG ou WEBP</span>
                                    </div>
                                </label>
                            </div>
                        )}
                    </div>
                )}

                {/* AI TAB */}
                {activeTab === 'ai' && (
                    <div className="space-y-4">
                        {selectedImage && imageSourceTab === 'ai' ? (
                            <div className="space-y-3">
                                <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10">
                                    <img src={selectedImage} alt="AI Generated" className="w-full h-full object-cover" />
                                    <button onClick={() => { setSelectedImage(undefined); setImageSourceTab(undefined); }} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white/70 hover:text-white transition-colors">
                                        <span className="text-xs">✕</span>
                                    </button>
                                </div>
                                <button onClick={() => { setSelectedImage(undefined); setImageSourceTab(undefined); }} className="w-full py-2 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                                    Gerar outra imagem
                                </button>
                            </div>
                        ) : (
                            <>
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder={currentText ? `Ex: "${currentText.slice(0, 40)}..." estilo cinematografico` : "Descreva a imagem..."}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-violet-500/50 min-h-[80px] resize-none"
                                />

                                {/* Toggle Simples/Complexo */}
                                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-white text-sm font-medium">
                                            {isComplex ? 'Complexo (Gemini)' : 'Simples (Pollinations)'}
                                        </span>
                                        <span className="text-white/40 text-xs">
                                            {isComplex
                                                ? 'Imagens realistas e detalhadas'
                                                : 'Gradientes e formas abstratas'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setIsComplex(!isComplex)}
                                        className={`
                                            relative w-12 h-6 rounded-full transition-colors duration-200
                                            ${isComplex ? 'bg-violet-500' : 'bg-white/20'}
                                        `}
                                    >
                                        <motion.div
                                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                                            animate={{ left: isComplex ? '1.625rem' : '0.25rem' }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    </button>
                                </div>

                                <button
                                    onClick={handleGenerateAI}
                                    disabled={isGeneratingImage || (!aiPrompt && !currentText)}
                                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isGeneratingImage ? <><Loader2 className="animate-spin w-4 h-4" /> Gerando...</> : <><Sparkles className="w-4 h-4" /> Gerar com IA</>}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* GALLERY TAB - Preview ou instrução */}
                {activeTab === 'gallery' && (
                    <div className="flex flex-col items-center justify-center min-h-[150px]">
                        {selectedImage && imageSourceTab === 'gallery' ? (
                            <div className="space-y-3 w-full">
                                <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 cursor-pointer" onClick={() => setIsGalleryOpen(true)}>
                                    <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="text-white font-medium">Alterar</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setIsGalleryOpen(true)} className="flex flex-col items-center gap-3 text-white/50 hover:text-white/70 transition-colors">
                                <FolderOpen className="w-10 h-10" />
                                <span>Clique para abrir a galeria</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Image Controls (Opacity & Movement) */}
            <div className="space-y-4 pt-4 border-t border-white/5">
                {/* Color Picker */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-white/50">
                        <span>Cor do Overlay</span>
                        <span className="text-xs text-white/40">{overlayColor.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={overlayColor}
                            onChange={(e) => setOverlayColor(e.target.value)}
                            className="w-10 h-8 p-0 bg-transparent border-0 rounded"
                            aria-label="Selecionar cor do overlay"
                        />
                        <div className="text-sm text-white/50">Use para ajustar cor do overlay</div>
                    </div>
                </div>
                {/* Opacity Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/50">
                        <span>Opacidade do Overlay</span>
                        <span>{Math.round(overlayOpacity * 100)}%</span>
                    </div>
                    <input
                        type="range" min="0" max="1" step="0.05" value={overlayOpacity}
                        onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    />
                </div>

                {/* Movement Controls (Requisito 3) */}
                {selectedImage && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-white/50">
                                <span>Posição X</span>
                                <span>{imagePosition.x}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100" step="1" value={imagePosition.x}
                                onChange={(e) => setImagePosition(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-white/50">
                                <span>Posição Y</span>
                                <span>{imagePosition.y}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100" step="1" value={imagePosition.y}
                                onChange={(e) => setImagePosition(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ============ MODAL FLUTUANTE DA GALERIA (PORTAL) ============ */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isGalleryOpen && (
                        <>
                            {/* Backdrop escurecido */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsGalleryOpen(false)}
                                className="fixed inset-0 bg-black/80 z-[100]" // z-index alto
                            />

                            {/* Painel flutuante centralizado */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 z-[101] flex items-center justify-center p-6 md:p-12 pointer-events-none"
                            >
                                <div
                                    className="bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col pointer-events-auto"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#252540] rounded-t-2xl flex-shrink-0">
                                        <h3 className="text-white font-bold text-xl">Galeria de Backgrounds</h3>
                                        <button onClick={() => setIsGalleryOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                                        {isLoadingGallery ? (
                                            <div className="flex justify-center py-20">
                                                <Loader2 className="animate-spin w-10 h-10 text-violet-400" />
                                            </div>
                                        ) : categories.length === 0 ? (
                                            <div className="text-center py-16">
                                                <ImageIcon className="w-20 h-20 text-white/20 mx-auto mb-6" />
                                                <p className="text-white/50 text-xl">Galeria vazia</p>
                                                <p className="text-white/30 text-sm mt-3">Adicione imagens em public/images/backgrounds</p>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Category Dropdown */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                                        className="w-full flex items-center justify-between p-4 bg-[#2a2a45] border border-white/10 rounded-xl text-white hover:border-violet-500/50 transition-colors text-lg"
                                                    >
                                                        <span className="font-semibold">{getCategoryLabel()}</span>
                                                        <ChevronDown className={`w-6 h-6 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {isCategoryDropdownOpen && (
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#2a2a45] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl">
                                                            <button
                                                                onClick={() => { setSelectedCategory('all'); setIsCategoryDropdownOpen(false); }}
                                                                className={`w-full text-left p-4 hover:bg-white/10 transition-colors flex items-center justify-between border-b border-white/5 ${selectedCategory === 'all' ? 'bg-violet-500/20 text-violet-300' : 'text-white'}`}
                                                            >
                                                                <span className="font-medium">Todos</span>
                                                                <span className="text-white/40">{allImages.length} imagens</span>
                                                            </button>
                                                            {categories.map(cat => (
                                                                <button
                                                                    key={cat.id}
                                                                    onClick={() => { setSelectedCategory(cat.id); setIsCategoryDropdownOpen(false); }}
                                                                    className={`w-full text-left p-4 hover:bg-white/10 transition-colors flex items-center justify-between ${selectedCategory === cat.id ? 'bg-violet-500/20 text-violet-300' : 'text-white'}`}
                                                                >
                                                                    <span>{cat.name}</span>
                                                                    <span className="text-white/40">{cat.images.length}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Images Grid */}
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                                    {displayImages.map((img, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => handleSelectImage(img)}
                                                            className={`
                                group relative aspect-square rounded-xl overflow-hidden border-3 transition-all cursor-pointer
                                ${selectedImage === img ? 'border-violet-500 shadow-[0_0_25px_rgba(139,92,246,0.5)] scale-[1.02]' : 'border-transparent hover:border-white/40 hover:scale-[1.02]'}
                              `}
                                                        >
                                                            <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                                            {selectedImage === img && (
                                                                <div className="absolute inset-0 bg-violet-500/30 flex items-center justify-center">
                                                                    <div className="bg-violet-500 rounded-full p-2"><Check className="w-5 h-5 text-white" /></div>
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* ============ MODAL DE GERACAO DE IMAGEM ============ */}
            <ImageGenerationModal
                isOpen={showGenerationModal}
                provider={generationProvider}
                error={generationError}
                onRetry={handleRetryGeneration}
                onClose={handleCloseModal}
            />
        </div>
    );
}
