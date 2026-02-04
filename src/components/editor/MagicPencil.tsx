import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Zap, BookOpen, ShoppingBag, X } from 'lucide-react';

export interface MagicPencilProps {
    isPoor: boolean;
    reason?: string;
    onSuggestionClick?: (type: 'punch' | 'story' | 'sale') => void;
}

const suggestions = [
    { id: 'punch', label: 'Mais Punch', icon: Zap, color: '#f59e0b' },
    { id: 'story', label: 'Storytelling', icon: BookOpen, color: '#8b5cf6' },
    { id: 'sale', label: 'Venda Direta', icon: ShoppingBag, color: '#ef4444' },
] as const;

export function MagicPencil({ isPoor, reason, onSuggestionClick }: MagicPencilProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSuggestionClick = (type: 'punch' | 'story' | 'sale') => {
        onSuggestionClick?.(type);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {/* Pencil Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          relative p-3 rounded-xl
          transition-all duration-300
          ${isPoor
                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                    }
        `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isPoor ? {
                    boxShadow: [
                        '0 0 0 0 rgba(245, 158, 11, 0)',
                        '0 0 20px 5px rgba(245, 158, 11, 0.3)',
                        '0 0 0 0 rgba(245, 158, 11, 0)',
                    ],
                } : {}}
                transition={isPoor ? { duration: 2, repeat: Infinity } : {}}
                aria-label={isPoor ? `Sugestões de melhoria: ${reason}` : 'Assistente de escrita'}
            >
                <Pencil className="w-5 h-5" />

                {/* Glow dot indicator */}
                {isPoor && (
                    <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                )}
            </motion.button>

            {/* Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="
              absolute bottom-full right-0 mb-2
              min-w-[200px]
              bg-gray-900/95 backdrop-blur-xl
              rounded-2xl
              border border-white/10
              shadow-2xl
              overflow-hidden
              z-50
            "
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <span className="text-sm font-medium text-white/80">
                                ✨ Lápis Mágico
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-white/60" />
                            </button>
                        </div>

                        {/* Reason */}
                        {isPoor && reason && (
                            <div className="px-4 py-2 bg-amber-500/10 border-b border-white/10">
                                <p className="text-xs text-amber-400">💡 {reason}</p>
                            </div>
                        )}

                        {/* Suggestions */}
                        <div className="p-2">
                            {suggestions.map((suggestion) => (
                                <motion.button
                                    key={suggestion.id}
                                    onClick={() => handleSuggestionClick(suggestion.id)}
                                    className="
                    w-full flex items-center gap-3 
                    px-3 py-2.5 rounded-xl
                    text-left text-sm font-medium
                    hover:bg-white/10
                    transition-colors
                  "
                                    style={{ color: suggestion.color }}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <suggestion.icon className="w-4 h-4" />
                                    {suggestion.label}
                                </motion.button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2.5 bg-white/5 border-t border-white/10">
                            <p className="text-[10px] text-white/40 text-center">
                                ⚡ Em breve: integração com IA
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
