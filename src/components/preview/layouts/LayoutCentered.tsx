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
    textAlign?: TextAlignment;
    onLayoutUpdate?: (updates: Partial<LayoutSettings>) => void;
}

/**
 * Layout Centralizado - Sistema Hibrido Grid + Livre
 *
 * MODO GRID: Elemento segue uma das 9 posicoes pre-definidas (sem customPosition)
 * MODO LIVRE: Elemento usa coordenadas livres (com customPosition, definido via drag)
 *
 * Cada elemento (headline/body) pode estar em modo diferente - sao independentes.
 */
export function LayoutCentered({
    text,
    config,
    fontScale = 1,
    headlineSettings,
    bodySettings,
    bodyText,
    textAlign: legacyAlign,
    onLayoutUpdate
}: LayoutProps) {
    // console.log('[LAYOUT PROPS] LayoutCentered received:', {
    //     headlinePosition: headlineSettings?.position,
    //     headlineCustom: headlineSettings?.customPosition,
    //     bodyPosition: bodySettings?.position,
    //     bodyCustom: bodySettings?.customPosition,
    // });
    const isMotivational = config.state === 'motivational';
    const containerRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLParagraphElement>(null);
    const bodyRef = useRef<HTMLParagraphElement>(null);

    // Drag controls para controle manual do drag
    const headlineDragControls = useDragControls();
    const bodyDragControls = useDragControls();

    // Refs para guardar posição inicial do drag (incluindo offset do clique)
    const dragStartRef = useRef<{
        mouseX: number;
        mouseY: number;
        clickOffsetX: number;  // Offset entre mouse e centro do elemento
        clickOffsetY: number;
    } | null>(null);

    // Configuracoes do Headline
    const hlPos = headlineSettings?.position || 'center';
    const hlAlign = headlineSettings?.textAlign || legacyAlign || 'center';
    const hlCustom = headlineSettings?.customPosition;

    // Configuracoes do Body
    const bodyPos = bodySettings?.position || 'center';
    const bodyAlign = bodySettings?.textAlign || legacyAlign || 'center';
    const bodyCustom = bodySettings?.customPosition;

    // Estilos calculados - SEMPRE absolute, independentes
    const hlStyle = getPositionStyles(hlPos, hlAlign, hlCustom);
    const bodyStyle = getPositionStyles(bodyPos, bodyAlign, bodyCustom);

    // Guarda posição inicial do mouse e o offset entre mouse e centro do elemento
    const handleDragStart = useCallback((type: 'headline' | 'body', event: MouseEvent | TouchEvent | PointerEvent) => {
        const elementRef = type === 'headline' ? headlineRef : bodyRef;
        const customPos = type === 'headline' ? hlCustom : bodyCustom;
        const gridPos = type === 'headline' ? hlPos : bodyPos;
        const align = type === 'headline' ? hlAlign : bodyAlign;

        if (!containerRef.current || !elementRef.current) return;

        const elementRect = elementRef.current.getBoundingClientRect();

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
    }, [hlCustom, bodyCustom, hlPos, bodyPos, hlAlign, bodyAlign]);

    // Handler para pointer down - inicia o drag
    const handlePointerDown = useCallback((type: 'headline' | 'body', event: React.PointerEvent<HTMLElement>) => {
        const controls = type === 'headline' ? headlineDragControls : bodyDragControls;
        
        // Inicia o drag - Framer Motion calcula o offset automaticamente
        controls.start(event);
    }, [headlineDragControls, bodyDragControls]);

    // Log de movimento durante drag (reduzido para não poluir)
    const handleDrag = useCallback((_type: 'headline' | 'body', _event: MouseEvent | TouchEvent | PointerEvent) => {
        // Log desabilitado para reduzir ruído - descomentar se necessário
        // console.log('[DRAG MOVE]', { element: type, mouseX: 'clientX' in event ? event.clientX : 'N/A' });
    }, []);

    /**
     * Handler de fim do drag - USA POSIÇÃO DO MOUSE COM OFFSET
     * Calcula onde o CENTRO do elemento deve ficar baseado na posição do mouse
     */
    const handleDragEnd = useCallback((
        type: 'headline' | 'body',
        event: MouseEvent | TouchEvent | PointerEvent
    ) => {
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

        // Atualiza APENAS o elemento arrastado
        onLayoutUpdate({
            [type]: {
                position: type === 'headline' ? hlPos : bodyPos,
                textAlign: type === 'headline' ? hlAlign : bodyAlign,
                customPosition: { x: clampedX, y: clampedY }
            }
        });
    }, [onLayoutUpdate, hlPos, hlAlign, bodyPos, bodyAlign]);

    // Calcula tamanho base da fonte
    const getBaseFontSize = () => {
        if (text.length > 100) return 1.5;
        if (text.length > 50) return 2;
        return 2.5;
    };

    const baseFontSize = getBaseFontSize();
    const scaledFontSize = baseFontSize * fontScale;

    return (
        <motion.div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Headline - Sempre absolute, posicao independente */}
            <motion.p
                ref={headlineRef}
                key={`headline-${hlCustom?.x?.toFixed(1) ?? 'grid'}-${hlCustom?.y?.toFixed(1) ?? 'grid'}`}
                className={`
                    font-bold leading-tight select-none
                    ${onLayoutUpdate ? 'cursor-grab active:cursor-grabbing' : ''}
                    ${isMotivational ? 'animate-glow' : ''}
                `}
                style={{
                    color: config.theme.text,
                    fontSize: `${scaledFontSize}rem`,
                    textShadow: isMotivational
                        ? `0 0 30px ${config.theme.accent}, 0 0 60px ${config.theme.accent}`
                        : 'none',
                    ...hlStyle as React.CSSProperties,
                }}
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 1,
                    ...(isMotivational ? {
                        textShadow: [
                            `0 0 20px ${config.theme.accent}, 0 0 40px ${config.theme.accent}`,
                            `0 0 40px ${config.theme.accent}, 0 0 80px ${config.theme.accent}`,
                            `0 0 20px ${config.theme.accent}, 0 0 40px ${config.theme.accent}`,
                        ]
                    } : {})
                }}
                transition={isMotivational ? { textShadow: { duration: 2, repeat: Infinity } } : undefined}
                drag={!!onLayoutUpdate}
                dragControls={headlineDragControls}
                dragMomentum={false}
                dragElastic={0}
                onPointerDown={(e) => handlePointerDown('headline', e)}
                onDrag={(e) => handleDrag('headline', e)}
                onDragEnd={(e) => handleDragEnd('headline', e)}
                whileDrag={{ scale: 1.02, zIndex: 50, cursor: 'grabbing' }}
            >
                {text}
            </motion.p>

            {/* Body - Sempre absolute, posicao independente do headline */}
            {bodyText && (
                <motion.p
                    ref={bodyRef}
                    key={`body-${bodyCustom?.x?.toFixed(1) ?? 'grid'}-${bodyCustom?.y?.toFixed(1) ?? 'grid'}`}
                    className={`
                        leading-relaxed select-none
                        ${onLayoutUpdate ? 'cursor-grab active:cursor-grabbing' : ''}
                    `}
                    style={{
                        color: config.theme.text,
                        fontSize: `${scaledFontSize * 0.5}rem`,
                        opacity: 0.85,
                        ...bodyStyle as React.CSSProperties,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.85 }}
                    transition={{ delay: 0.1 }}
                    drag={!!onLayoutUpdate}
                    dragControls={bodyDragControls}
                    dragMomentum={false}
                    dragElastic={0}
                    onPointerDown={(e) => handlePointerDown('body', e)}
                    onDrag={(e) => handleDrag('body', e)}
                    onDragEnd={(e) => handleDragEnd('body', e)}
                    whileDrag={{ scale: 1.02, zIndex: 50, cursor: 'grabbing' }}
                >
                    {bodyText}
                </motion.p>
            )}
        </motion.div>
    );
}
