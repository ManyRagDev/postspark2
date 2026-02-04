import { motion } from 'framer-motion';
import type { AmbientConfig } from '@/types/ambient';

export interface LayoutProps {
    text: string;
    config: AmbientConfig;
    imageUrl?: string;
    fontScale?: number;
    textAlign?: 'left' | 'center' | 'right';
    bodyText?: string;
}

/**
 * Layout Hierarquia - Usado para estado Promocional
 * Preço em destaque, texto secundário, botão urgente
 */
export function LayoutHierarchy({ text, config, fontScale = 1, textAlign = 'center', bodyText }: LayoutProps) {
    // Tenta extrair preco do texto
    const priceMatch = text.match(/(?:R\$|r\$)?\s*(\d+(?:[.,]\d{2})?)/);
    const price = priceMatch?.[0] ?? null;
    const remainingText = price && priceMatch ? text.replace(priceMatch[0], '').trim() : text;

    const scaledFontSize = 1.125 * fontScale; // Base 1.125rem (lg)

    return (
        <motion.div
            className="w-full h-full flex flex-col items-center justify-center gap-6 p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Tag de Urgência */}
            <motion.div
                className="px-4 py-1.5 rounded-full font-bold text-sm uppercase tracking-wider"
                style={{
                    backgroundColor: config.theme.accent,
                    color: '#fff',
                }}
                animate={{
                    scale: [1, 1.05, 1],
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
            >
                🔥 Oferta Limitada
            </motion.div>

            {/* Preço em destaque */}
            {price && (
                <motion.div
                    className="font-black"
                    style={{
                        color: config.theme.accent,
                        fontSize: `${4 * fontScale}rem`, // Base 4rem
                        lineHeight: 1,
                        textShadow: `0 0 40px ${config.theme.accent}50`,
                    }}
                    animate={{
                        scale: [1, 1.02, 1],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    {price.includes('R$') || price.includes('r$') ? price : `R$ ${price}`}
                </motion.div>
            )}

            <p
                className="font-semibold max-w-[80%]"
                style={{
                    color: config.theme.text,
                    fontSize: `${scaledFontSize}rem`,
                    textAlign,
                }}
            >
                {remainingText || text}
            </p>

            {/* Body Text */}
            {bodyText && (
                <p
                    className="opacity-90 max-w-[90%]"
                    style={{
                        color: config.theme.text,
                        fontSize: `${scaledFontSize * 0.8}rem`,
                        textAlign,
                    }}
                >
                    {bodyText}
                </p>
            )}

            {/* CTA Fake */}
            <motion.div
                className="px-8 py-3 rounded-xl font-bold uppercase tracking-wider"
                style={{
                    backgroundColor: config.theme.accent,
                    color: '#fff',
                }}
                animate={{
                    boxShadow: [
                        `0 0 0 0 ${config.theme.accent}`,
                        `0 0 0 10px ${config.theme.accent}00`,
                    ],
                }}
                transition={{ duration: 1, repeat: Infinity }}
            >
                QUERO AGORA
            </motion.div>
        </motion.div>
    );
}
