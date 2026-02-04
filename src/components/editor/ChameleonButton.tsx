import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import type { AmbientConfig } from '@/types/ambient';

export interface ChameleonButtonProps {
    config: AmbientConfig;
    onClick?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
}

export function ChameleonButton({
    config,
    onClick,
    isLoading = false,
    disabled = false,
}: ChameleonButtonProps) {
    const isPromotional = config.state === 'promotional';

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`
        relative overflow-hidden
        px-8 py-4
        rounded-2xl
        font-bold text-lg
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-4
        ${isPromotional ? 'animate-pulse' : ''}
      `}
            style={{
                backgroundColor: config.theme.accent,
                color: config.state === 'personal' ? '#422006' : '#ffffff',
                boxShadow: `0 4px 30px ${config.theme.accent}50`,
            }}
            whileHover={{
                scale: 1.05,
                boxShadow: `0 8px 40px ${config.theme.accent}70`,
            }}
            whileTap={{ scale: 0.98 }}
            animate={isPromotional ? {
                scale: [1, 1.02, 1],
                transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1 }
            } : {}}
        >
            {/* Gradient overlay */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `linear-gradient(135deg, transparent 0%, ${config.theme.accent} 100%)`,
                }}
            />

            {/* Content */}
            <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={config.ctaText}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {config.ctaText}
                            </motion.span>
                        </AnimatePresence>

                        {config.state !== 'neutral' && (
                            <motion.span
                                initial={{ rotate: 0 }}
                                animate={{ rotate: [0, 15, -15, 0] }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Sparkles className="w-5 h-5" />
                            </motion.span>
                        )}
                    </>
                )}
            </span>

            {/* Shine effect */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                }}
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            />
        </motion.button>
    );
}
