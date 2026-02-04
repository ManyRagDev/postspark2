import { useRef, useCallback } from 'react';
import { motion, useDragControls } from 'framer-motion';
import type { AmbientConfig } from '@/types/ambient';
import type { TextPosition, TextAlignment, LayoutSettings } from '@/types/editor';
import { getPositionStyles, calculateRelativePosition } from '@/lib/layoutUtils';

export interface LayoutProps {
    text: string;
    config: AmbientConfig;
    imageUrl?: string;
    fontScale?: number;
    headlineSettings?: { position: TextPosition; textAlign: TextAlignment; customPosition?: { x: number; y: number } };
    bodySettings?: { position: TextPosition; textAlign: TextAlignment; customPosition?: { x: number; y: number } };
    bodyText?: string;
    // Legacy mapping
    textAlign?: TextAlignment;
    // New
    onLayoutUpdate?: (updates: Partial<LayoutSettings>) => void;
}

/**
 * Layout Headline - Usado para estado Polêmico/Controverso
 * Texto ocupa 90%, estilo manchete de jornal, alto impacto
 * Suporta Drag and Drop
 */
export function LayoutHeadline({
    text,
    config,
    fontScale = 1,
    headlineSettings,
    bodySettings,
    bodyText,
    textAlign: legacyAlign,
    onLayoutUpdate
}: LayoutProps) {
    const scaledFontSize = 1 * fontScale;
    const containerRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLParagraphElement>(null);
    const bodyRef = useRef<HTMLParagraphElement>(null);

    // Drag controls para controle manual do drag
    const headlineDragControls = useDragControls();
    const bodyDragControls = useDragControls();

    // Ref para guardar posição inicial do drag (incluindo offset do clique)
    const dragStartRef = useRef<{
        mouseX: number;
        mouseY: number;
        clickOffsetX: number;  // Offset entre mouse e centro do elemento
        clickOffsetY: number;
    } | null>(null);

    // Defaults
    const hlPos = headlineSettings?.position || 'center';
    const hlAlign = headlineSettings?.textAlign || legacyAlign || 'center';
    const hlCustom = headlineSettings?.customPosition;

    const bodyPos = bodySettings?.position || 'center';
    const bodyAlign = bodySettings?.textAlign || legacyAlign || 'center';
    const bodyCustom = bodySettings?.customPosition;

    // Logic: Stacked if default center and no custom pos
    const isStacked = hlPos === 'center' && bodyPos === 'center' && !hlCustom && !bodyCustom;

    // Compute styles
    const hlStyle = getPositionStyles(hlPos, hlAlign, hlCustom);
    const bodyStyle = getPositionStyles(bodyPos, bodyAlign, bodyCustom);

    // Forced Overrides for stacked
    const finalHlStyle = isStacked ? { ...hlStyle, position: 'relative', top: 'auto', left: 'auto', transform: 'none' } : hlStyle;
    const finalBodyStyle = isStacked ? { ...bodyStyle, position: 'relative', top: 'auto', left: 'auto', transform: 'none' } : bodyStyle;

    // Handle Drag Start - guarda posição do mouse e offset do clique
    const handleDragStart = (type: 'headline' | 'body', event: MouseEvent | TouchEvent | PointerEvent) => {
        const customPos = type === 'headline' ? hlCustom : bodyCustom;
        const gridPos = type === 'headline' ? hlPos : bodyPos;
        const align = type === 'headline' ? hlAlign : bodyAlign;
        const element = type === 'headline' ? headlineRef.current : bodyRef.current;

        if (!containerRef.current || !element) return;

        const elementRect = element.getBoundingClientRect();

        const mouseX = 'clientX' in event ? event.clientX : 0;
        const mouseY = 'clientY' in event ? event.clientY : 0;

        // Calcula offset entre onde clicou e o centro do elemento
        const elementCenterX = elementRect.left + elementRect.width / 2;
        const elementCenterY = elementRect.top + elementRect.height / 2;
        const clickOffsetX = mouseX - elementCenterX;
        const clickOffsetY = mouseY - elementCenterY;

        // Guarda posição inicial e offset do clique
        dragStartRef.current = { mouseX, mouseY, clickOffsetX, clickOffsetY };

        // Drag start - apenas para logs de debug se necessário
    };

    // Handler para pointer down - inicia o drag
    const handlePointerDown = useCallback((type: 'headline' | 'body', event: React.PointerEvent<HTMLElement>) => {
        const controls = type === 'headline' ? headlineDragControls : bodyDragControls;
        
        // Inicia o drag - Framer Motion calcula o offset automaticamente
        controls.start(event);
    }, [headlineDragControls, bodyDragControls]);

    // Handle Drag Move (desabilitado para reduzir ruído)
    const handleDrag = (_type: 'headline' | 'body', _event: MouseEvent | TouchEvent | PointerEvent) => {
        // Log desabilitado
    };

    // Handle Drag End - USA POSIÇÃO DO MOUSE COM OFFSET
    const handleDragEnd = (type: 'headline' | 'body', event: MouseEvent | TouchEvent | PointerEvent) => {
        if (!containerRef.current || !onLayoutUpdate || !dragStartRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();

        // Pega posição final do mouse
        const mouseX = 'clientX' in event ? event.clientX : 0;
        const mouseY = 'clientY' in event ? event.clientY : 0;

        // Calcula onde o CENTRO do elemento deve ficar
        // (posição do mouse menos o offset de onde clicou)
        const targetCenterX = mouseX - dragStartRef.current.clickOffsetX;
        const targetCenterY = mouseY - dragStartRef.current.clickOffsetY;

        // Converte para percentual relativo ao container
        const newX = ((targetCenterX - containerRect.left) / containerRect.width) * 100;
        const newY = ((targetCenterY - containerRect.top) / containerRect.height) * 100;

        // Clamp para manter dentro do container (5-95%)
        const clampedX = Math.max(5, Math.min(95, newX));
        const clampedY = Math.max(5, Math.min(95, newY));

        // console.log('[DRAG END] Position updated to:', { x: clampedX.toFixed(2), y: clampedY.toFixed(2) });

        // Limpa ref
        dragStartRef.current = null;

        onLayoutUpdate({
            [type]: {
                ...(type === 'headline' ? headlineSettings : bodySettings),
                position: type === 'headline' ? hlPos : bodyPos,
                textAlign: type === 'headline' ? hlAlign : bodyAlign,
                customPosition: { x: clampedX, y: clampedY }
            }
        });
    };

    return (
        <motion.div
            ref={containerRef}
            className={`w-full h-full flex flex-col items-center justify-center p-4 gap-4 relative`}
            // Note: flex-col center is ignored if children are absolute
            // But we keep it for isStacked=true case where children are relative
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Warning stripe */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-2"
                style={{
                    background: `repeating-linear-gradient(
            -45deg,
            ${config.theme.accent},
            ${config.theme.accent} 10px,
            ${config.theme.bg} 10px,
            ${config.theme.bg} 20px
          )`,
                }}
                animate={{ x: [0, 20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Alert badge - Is this draggable? No, static element */}
            <motion.div
                className="mb-4 px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider z-10"
                style={{
                    backgroundColor: config.theme.accent,
                    color: config.theme.bg,
                }}
                animate={{
                    scale: [1, 1.05, 1],
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
            >
                ⚠️ ATENÇÃO
            </motion.div>

            {/* Main headline */}
            <motion.p
                ref={headlineRef}
                className="font-black uppercase leading-none tracking-tight cursor-grab active:cursor-grabbing"
                style={{
                    color: config.theme.text,
                    fontSize: `${scaledFontSize * (text.length > 80 ? 1.75 : text.length > 40 ? 2.25 : 3)}rem`,
                    textShadow: `2px 2px 0 ${config.theme.accent}`,
                    ...finalHlStyle as any,
                }}
                initial={false}
                transition={{ delay: 0.1 }}

                drag={!!onLayoutUpdate}
                dragControls={headlineDragControls}
                dragMomentum={false}
                dragElastic={0}
                onPointerDown={(e) => handlePointerDown('headline', e)}
                onDrag={(e) => handleDrag('headline', e)}
                onDragEnd={(e) => handleDragEnd('headline', e)}
                whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing' }}
            >
                {text}
            </motion.p>

            {/* Body Text */}
            {bodyText && (
                <motion.p
                    ref={bodyRef}
                    className="font-bold uppercase tracking-tight opacity-90 max-w-[90%] cursor-grab active:cursor-grabbing"
                    style={{
                        color: config.theme.text,
                        fontSize: `${scaledFontSize * 1.25}rem`,
                        ...finalBodyStyle as any,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    transition={{ delay: 0.2 }}

                    drag={!!onLayoutUpdate}
                    dragControls={bodyDragControls}
                    dragMomentum={false}
                    dragElastic={0}
                    onPointerDown={(e) => handlePointerDown('body', e)}
                    onDrag={(e) => handleDrag('body', e)}
                    onDragEnd={(e) => handleDragEnd('body', e)}
                    whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing' }}
                >
                    {bodyText}
                </motion.p>
            )}

            {/* Bottom stripe */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-2"
                style={{
                    background: `repeating-linear-gradient(
            45deg,
            ${config.theme.accent},
            ${config.theme.accent} 10px,
            ${config.theme.bg} 10px,
            ${config.theme.bg} 20px
          )`,
                }}
                animate={{ x: [0, -20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </motion.div>
    );
}
