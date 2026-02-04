import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { AmbientConfig } from '@/types/ambient';

export interface AmbientBadgeProps {
    config: AmbientConfig;
    onReset?: () => void;
    show?: boolean;
}

export function AmbientBadge({ config, onReset, show = true }: AmbientBadgeProps) {
    // Não mostra badge para estado neutro
    if (config.state === 'neutral') {
        return null;
    }

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="
            inline-flex items-center gap-2 
            px-4 py-2 rounded-full
            text-sm font-semibold
            backdrop-blur-md
            border border-white/20
            shadow-lg
          "
                    style={{
                        backgroundColor: `${config.theme.accent}15`,
                        color: config.theme.accent,
                        boxShadow: `0 4px 20px ${config.theme.accent}25`,
                    }}
                >
                    <span className="text-lg">{config.emoji}</span>
                    <span>Modo: {config.label}</span>

                    {onReset && (
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onReset}
                            className="
                p-1 rounded-full 
                hover:bg-white/20 
                transition-colors
                ml-1
              "
                            aria-label="Resetar para modo neutro"
                        >
                            <X className="w-3.5 h-3.5" />
                        </motion.button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
