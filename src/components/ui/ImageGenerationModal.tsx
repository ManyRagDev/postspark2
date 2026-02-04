'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Sparkles, Wand2, Loader2, AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ImageProvider } from '@/types/api';

interface ImageGenerationModalProps {
    isOpen: boolean;
    provider: ImageProvider | null;
    error: string | null;
    onRetry?: () => void;
    onClose?: () => void;
}

const providerInfo: Record<ImageProvider, {
    name: string;
    icon: typeof Sparkles;
    description: string;
    color: string;
    bgGradient: string;
}> = {
    pollinations: {
        name: 'Pollinations Flux',
        icon: Wand2,
        description: 'Gerando gradientes e formas abstratas...',
        color: 'text-cyan-400',
        bgGradient: 'from-blue-500 to-cyan-500',
    },
    gemini: {
        name: 'Gemini Pro',
        icon: Sparkles,
        description: 'Criando imagem realista e detalhada...',
        color: 'text-violet-400',
        bgGradient: 'from-violet-500 to-purple-500',
    },
};

export function ImageGenerationModal({
    isOpen,
    provider,
    error,
    onRetry,
    onClose
}: ImageGenerationModalProps) {
    const [mounted, setMounted] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Simula progresso enquanto gera
    useEffect(() => {
        if (!isOpen || error) {
            setProgress(0);
            return;
        }

        const interval = setInterval(() => {
            setProgress(prev => {
                // Progresso mais lento conforme aproxima de 90%
                if (prev >= 90) return prev;
                const increment = Math.max(1, (90 - prev) * 0.1);
                return Math.min(90, prev + increment);
            });
        }, 300);

        return () => clearInterval(interval);
    }, [isOpen, error]);

    // Reset progress quando fecha
    useEffect(() => {
        if (!isOpen) {
            const timeout = setTimeout(() => setProgress(0), 300);
            return () => clearTimeout(timeout);
        }
    }, [isOpen]);

    if (!mounted) return null;

    const info = provider ? providerInfo[provider] : null;
    const Icon = info?.icon || Loader2;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop - bloqueia toda interacao */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200]"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="fixed inset-0 z-[201] flex items-center justify-center p-6 pointer-events-none"
                    >
                        <div className="text-center space-y-6 max-w-md pointer-events-auto">

                            {/* Icone animado */}
                            <div className="relative">
                                {/* Glow effect */}
                                <motion.div
                                    animate={error ? {} : {
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0.8, 0.5]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2,
                                        ease: 'easeInOut'
                                    }}
                                    className={`
                                        absolute inset-0 rounded-full blur-2xl
                                        bg-gradient-to-br ${info?.bgGradient || 'from-gray-500 to-gray-600'}
                                        ${error ? 'opacity-0' : 'opacity-40'}
                                    `}
                                />

                                {/* Icon container */}
                                <motion.div
                                    animate={error ? {} : {
                                        rotate: [0, 360],
                                    }}
                                    transition={{
                                        rotate: { repeat: Infinity, duration: 8, ease: 'linear' },
                                    }}
                                    className={`
                                        relative w-28 h-28 mx-auto rounded-full
                                        bg-gradient-to-br ${error ? 'from-red-500/20 to-red-600/20' : info?.bgGradient || 'from-gray-500 to-gray-600'}
                                        flex items-center justify-center shadow-2xl
                                        border border-white/10
                                    `}
                                >
                                    <motion.div
                                        animate={error ? {} : {
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.5,
                                            ease: 'easeInOut'
                                        }}
                                    >
                                        {error ? (
                                            <AlertCircle className="w-14 h-14 text-red-400" />
                                        ) : (
                                            <Icon className="w-14 h-14 text-white" />
                                        )}
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* Titulo e descricao */}
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white">
                                    {error ? 'Erro na Geracao' : info?.name || 'Gerando...'}
                                </h2>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    {error || info?.description || 'Processando sua solicitacao...'}
                                </p>
                            </div>

                            {/* Progress Bar (apenas quando nao tem erro) */}
                            {!error && (
                                <div className="w-72 mx-auto space-y-2">
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full bg-gradient-to-r ${info?.bgGradient || 'from-white to-white'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                        />
                                    </div>
                                    <p className="text-white/40 text-xs">
                                        {provider === 'gemini'
                                            ? 'Isso pode levar de 10 a 30 segundos...'
                                            : 'Gerando imagem...'}
                                    </p>
                                </div>
                            )}

                            {/* Error Actions */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-3 justify-center pt-2"
                                >
                                    {onRetry && (
                                        <button
                                            onClick={onRetry}
                                            className="px-6 py-3 bg-violet-500 hover:bg-violet-600
                                                       text-white rounded-xl font-medium transition-all
                                                       hover:scale-105 active:scale-95"
                                        >
                                            Tentar Novamente
                                        </button>
                                    )}
                                    {onClose && (
                                        <button
                                            onClick={onClose}
                                            className="px-6 py-3 bg-white/10 hover:bg-white/20
                                                       text-white rounded-xl font-medium transition-all
                                                       hover:scale-105 active:scale-95"
                                        >
                                            Fechar
                                        </button>
                                    )}
                                </motion.div>
                            )}

                            {/* Provider badge */}
                            {!error && provider && (
                                <div className="pt-4">
                                    <span className={`
                                        inline-flex items-center gap-2 px-4 py-2
                                        bg-white/5 rounded-full text-xs ${info?.color}
                                    `}>
                                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                                        {provider === 'pollinations' ? 'Modo Simples' : 'Modo Complexo'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
