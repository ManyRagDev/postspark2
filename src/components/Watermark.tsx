/**
 * Watermark Component
 * Renders watermark overlay for Fidelity Guard protection
 * Different watermark styles based on user plan
 */

'use client';

import { useEffect, useRef } from 'react';
import type { UserPlan } from '@/lib/sparks/plans';
import { getWatermarkType } from '@/lib/sparks/plans';

interface WatermarkProps {
  plan: UserPlan;
  width: number;
  height: number;
  text?: string;
  opacity?: number;
  className?: string;
}

/**
 * Canvas-based watermark renderer
 * Renders directly to canvas for security (harder to remove via DOM manipulation)
 */
export function Watermark({
  plan,
  width,
  height,
  text = 'POSTSPARK',
  opacity,
  className = '',
}: WatermarkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const watermarkType = getWatermarkType(plan);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (watermarkType === 'obstructive') {
      // FREE plan: Obstructive watermark covering content
      renderObstructiveWatermark(ctx, width, height, text, opacity);
    } else {
      // PAID plans: Subtle watermark in corner
      renderSubtleWatermark(ctx, width, height, text, opacity);
    }
  }, [plan, width, height, text, opacity, watermarkType]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`pointer-events-none ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
      }}
    />
  );
}

/**
 * Render obstructive watermark for FREE users
 * Covers part of the content to make screenshot unusable
 */
function renderObstructiveWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  customOpacity?: number
) {
  const opacity = customOpacity ?? 0.15;
  
  // Draw diagonal stripes pattern
  ctx.save();
  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.lineWidth = 2;
  
  const stripeSpacing = 40;
  for (let i = -height; i < width + height; i += stripeSpacing) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }
  ctx.restore();
  
  // Draw large central watermark
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 6);
  
  ctx.font = `bold ${Math.min(width, height) * 0.15}px Inter, Arial, sans-serif`;
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity + 0.1})`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  
  ctx.restore();
  
  // Draw corner watermarks
  ctx.save();
  ctx.font = `bold ${Math.min(width, height) * 0.04}px Inter, Arial, sans-serif`;
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity + 0.05})`;
  
  const padding = 20;
  ctx.fillText(text, padding, padding + 20);
  ctx.fillText(text, width - padding - ctx.measureText(text).width, height - padding);
  ctx.restore();
}

/**
 * Render subtle watermark for PAID users
 * Small, unobtrusive mark in corner
 */
function renderSubtleWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  customOpacity?: number
) {
  const opacity = customOpacity ?? 0.08;
  
  ctx.save();
  
  // Small text in bottom right corner
  const fontSize = Math.max(10, Math.min(width, height) * 0.025);
  ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  const padding = Math.max(10, width * 0.02);
  ctx.fillText(text, width - padding, height - padding);
  
  ctx.restore();
}

/**
 * Server-side watermark renderer
 * Used for generating watermarked images on the server
 */
export function generateWatermarkSVG(
  plan: UserPlan,
  width: number,
  height: number,
  text: string = 'POSTSPARK'
): string {
  const watermarkType = getWatermarkType(plan);
  
  if (watermarkType === 'obstructive') {
    // FREE plan: Obstructive SVG
    return generateObstructiveWatermarkSVG(width, height, text);
  } else {
    // PAID plans: Subtle SVG
    return generateSubtleWatermarkSVG(width, height, text);
  }
}

function generateObstructiveWatermarkSVG(width: number, height: number, text: string): string {
  const opacity = 0.15;
  const stripeSpacing = 40;
  let stripes = '';
  
  for (let i = -height; i < width + height; i += stripeSpacing) {
    stripes += `<line x1="${i}" y1="0" x2="${i + height}" y2="${height}" 
      stroke="rgba(255,255,255,${opacity})" stroke-width="2" />`;
  }
  
  const fontSize = Math.min(width, height) * 0.15;
  const smallFontSize = Math.min(width, height) * 0.04;
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="stripes" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="40" stroke="rgba(255,255,255,${opacity})" stroke-width="2" />
        </pattern>
      </defs>
      
      <!-- Diagonal stripes -->
      ${stripes}
      
      <!-- Central watermark -->
      <g transform="translate(${width/2}, ${height/2}) rotate(-30)">
        <text 
          x="0" y="0" 
          font-family="Inter, Arial, sans-serif" 
          font-size="${fontSize}" 
          font-weight="bold"
          fill="rgba(255,255,255,${opacity + 0.1})"
          text-anchor="middle"
          dominant-baseline="middle"
        >${text}</text>
      </g>
      
      <!-- Corner watermarks -->
      <text x="20" y="40" 
        font-family="Inter, Arial, sans-serif" 
        font-size="${smallFontSize}" 
        font-weight="bold"
        fill="rgba(255,255,255,${opacity + 0.05})">${text}</text>
      <text x="${width - 20}" y="${height - 20}" 
        font-family="Inter, Arial, sans-serif" 
        font-size="${smallFontSize}" 
        font-weight="bold"
        fill="rgba(255,255,255,${opacity + 0.05})"
        text-anchor="end">${text}</text>
    </svg>
  `;
}

function generateSubtleWatermarkSVG(width: number, height: number, text: string): string {
  const opacity = 0.08;
  const fontSize = Math.max(10, Math.min(width, height) * 0.025);
  const padding = Math.max(10, width * 0.02);
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="${width - padding}" y="${height - padding}" 
        font-family="Inter, Arial, sans-serif" 
        font-size="${fontSize}" 
        fill="rgba(255,255,255,${opacity})"
        text-anchor="end"
        dominant-baseline="alphabetic">${text}</text>
    </svg>
  `;
}

/**
 * CSS-based watermark for HTML previews
 * Less secure but easier to implement for dynamic content
 */
export function WatermarkOverlay({
  plan,
  className = '',
}: {
  plan: UserPlan;
  className?: string;
}) {
  const watermarkType = getWatermarkType(plan);
  
  if (watermarkType === 'obstructive') {
    return (
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
        style={{
          background: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              rgba(255,255,255,0.03) 20px,
              rgba(255,255,255,0.03) 22px
            )
          `,
        }}
      >
        {/* Central watermark */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12"
          style={{
            fontSize: 'clamp(40px, 15vw, 120px)',
            fontWeight: 'bold',
            color: 'rgba(255,255,255,0.08)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          POSTSPARK
        </div>
        
        {/* Corner watermarks */}
        <div className="absolute top-4 left-4 text-white/5 text-sm font-bold">
          POSTSPARK
        </div>
        <div className="absolute bottom-4 right-4 text-white/5 text-sm font-bold">
          POSTSPARK
        </div>
      </div>
    );
  }
  
  // Subtle watermark for paid users
  return (
    <div className={`absolute bottom-2 right-2 pointer-events-none ${className}`}>
      <span className="text-white/[0.03] text-xs font-medium">
        POSTSPARK
      </span>
    </div>
  );
}
