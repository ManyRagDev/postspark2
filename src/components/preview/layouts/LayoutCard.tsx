import { motion } from 'framer-motion';
import type { AmbientConfig } from '@/types/ambient';
import { Lightbulb } from 'lucide-react';
import type { TextPosition, TextAlignment } from '@/types/editor';
import { getPositionStyles } from '@/lib/layoutUtils';

export interface LayoutProps {
    text: string;
    config: AmbientConfig;
    imageUrl?: string;
    fontScale?: number;
    headlineSettings?: { position: TextPosition; textAlign: TextAlignment };
    bodySettings?: { position: TextPosition; textAlign: TextAlignment };
    bodyText?: string;
    // Legacy support
    textAlign?: TextAlignment;
}

/**
 * Layout Card - Usado para estado Informativo
 * Visual limpo/tech, ícone, texto organizado
 */
export function LayoutCard({ text, config, fontScale = 1, headlineSettings, bodySettings, bodyText, textAlign: legacyAlign }: LayoutProps) {
    const baseFontSize = text.length > 150 ? 0.875 : 1;
    const scaledFontSize = baseFontSize * fontScale;

    // Defaults
    const hlPos = headlineSettings?.position || 'center';
    const hlAlign = headlineSettings?.textAlign || legacyAlign || 'left'; // Card default left? function legacy default was 'left'

    const bodyPos = bodySettings?.position || 'center';
    const bodyAlign = bodySettings?.textAlign || legacyAlign || 'left';

    const isStacked = hlPos === 'center' && bodyPos === 'center';

    // Compute styles
    const hlStyle = isStacked ? { textAlign: hlAlign } : getPositionStyles(hlPos, hlAlign);
    const bodyStyle = isStacked ? { textAlign: bodyAlign } : getPositionStyles(bodyPos, bodyAlign);

    return (
        <motion.div
            className="w-full h-full flex items-center justify-center p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div
                className="w-full max-w-[90%] rounded-2xl p-6 relative"
                style={{
                    backgroundColor: `${config.theme.accent}10`,
                    borderLeft: `4px solid ${config.theme.accent}`,
                    // If not stacked, we assume manual control might want to break flow? 
                    // But inside card, flow is space-y-4.
                    // If absolute children, simple gap won't work.
                    // We can keep gap if they are in flow.
                }}
            >
                {/* Flow container for non-absolute elements */}
                <div className={`space-y-4 ${isStacked ? '' : 'h-full static'}`}>
                    {/* Icon */}
                    <motion.div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${config.theme.accent}20` }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.1 }}
                    >
                        <Lightbulb
                            className="w-6 h-6"
                            style={{ color: config.theme.accent }}
                        />
                    </motion.div>

                    {/* Label */}
                    <span
                        className="block text-xs font-semibold uppercase tracking-wider"
                        style={{ color: config.theme.accent }}
                    >
                        💡 Você sabia?
                    </span>

                    {/* Headline */}
                    <p
                        className="font-bold leading-tight"
                        style={{
                            color: config.theme.text,
                            fontSize: `${scaledFontSize}rem`,
                            ...hlStyle as any,
                        }}
                    >
                        {text}
                    </p>

                    {/* Body Text */}
                    {bodyText && (
                        <p
                            className="font-medium leading-relaxed opacity-90"
                            style={{
                                color: config.theme.text,
                                fontSize: `${scaledFontSize * 0.9}rem`,
                                ...bodyStyle as any,
                            }}
                        >
                            {bodyText}
                        </p>
                    )}

                    {/* Footer decoration - hidden if absolute text overlaps? No, keep it. */}
                    <div
                        className="h-1 w-16 rounded-full opacity-50 block"
                        style={{ backgroundColor: config.theme.accent }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
