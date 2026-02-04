import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface BadgeProps {
    label: string;
    emoji?: string;
    accentColor?: string;
    onDismiss?: () => void;
    className?: string;
}

export function Badge({
    label,
    emoji,
    accentColor = '#6366f1',
    onDismiss,
    className = '',
}: BadgeProps) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`
          inline-flex items-center gap-2 
          px-3 py-1.5 rounded-full
          text-sm font-medium
          backdrop-blur-sm
          border border-white/20
          ${className}
        `}
                style={{
                    backgroundColor: `${accentColor}20`,
                    color: accentColor,
                    boxShadow: `0 0 20px ${accentColor}30`,
                }}
            >
                {emoji && <span className="text-base">{emoji}</span>}
                <span>Modo: {label}</span>

                {onDismiss && (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onDismiss}
                        className="
              p-0.5 rounded-full 
              hover:bg-white/20 
              transition-colors
            "
                        aria-label="Resetar modo"
                    >
                        <X className="w-3 h-3" />
                    </motion.button>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
