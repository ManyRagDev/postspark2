import { motion } from 'framer-motion';
import type { AmbientConfig } from '@/types/ambient';
import { User } from 'lucide-react';

export interface LayoutProps {
    text: string;
    config: AmbientConfig;
    imageUrl?: string;
    fontScale?: number;
    textAlign?: 'left' | 'center' | 'right';
    bodyText?: string;
}

/**
 * Layout Split Screen - Usado para estado Pessoal/Story
 * Foto de um lado, texto do outro, visual íntimo
 */
export function LayoutSplit({ text, config, imageUrl, fontScale = 1, textAlign = 'left', bodyText }: LayoutProps) {
    const scaledFontSize = 1 * fontScale;

    return (
        <motion.div
            className="w-full h-full grid grid-cols-2 gap-4 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Foto/Avatar Side */}
            <div className="flex items-center justify-center">
                <motion.div
                    className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg"
                    style={{
                        backgroundColor: `${config.theme.accent}30`,
                        boxShadow: `0 10px 30px ${config.theme.accent}20`,
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt="Foto pessoal"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ color: config.theme.accent }}
                        >
                            <User className="w-16 h-16 opacity-50" />
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Text Side */}
            <motion.div
                className="flex items-center"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div
                    className="relative p-4 rounded-xl flex flex-col gap-3"
                    style={{
                        backgroundColor: `${config.theme.bg}80`,
                    }}
                >
                    {/* Quote decoration */}
                    <span
                        className="absolute -top-2 -left-2 text-4xl opacity-30 font-serif"
                        style={{ color: config.theme.accent }}
                    >
                        "
                    </span>

                    {/* Headline / Quote */}
                    <p
                        className="font-medium italic leading-relaxed"
                        style={{
                            color: config.theme.text,
                            fontSize: `${scaledFontSize}rem`,
                            textAlign,
                        }}
                    >
                        {text}
                    </p>

                    {/* Body Text */}
                    {bodyText && (
                        <p
                            className="text-sm opacity-90 leading-relaxed"
                            style={{
                                color: config.theme.text,
                                fontSize: `${scaledFontSize * 0.85}rem`,
                                textAlign,
                            }}
                        >
                            {bodyText}
                        </p>
                    )}

                    <span
                        className="absolute -bottom-4 -right-2 text-4xl opacity-30 font-serif"
                        style={{ color: config.theme.accent }}
                    >
                        "
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
}
