/**
 * Spark Dropdown Component
 * Compact dropdown showing spark balance and quick info when clicking on the balance
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { PLAN_CONFIGS, type UserPlan } from '@/lib/sparks/plans';
import { SPARK_COSTS } from '@/lib/sparks/config';
import { cn } from '@/lib/utils';
import { Zap, ChevronDown, Crown, AlertTriangle, Sparkles, X } from 'lucide-react';

interface SparkDropdownProps {
  className?: string;
  onUpgrade?: () => void;
}

const PLAN_COLORS: Record<UserPlan, { bg: string; text: string; border: string }> = {
  FREE: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
  LITE: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  PRO: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  AGENCY: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  DEV: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
};

export function SparkDropdown({ className, onUpgrade }: SparkDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { profile, loading } = useUser();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-8 w-24 bg-gray-700 rounded-full" />
      </div>
    );
  }

  const sparks = profile?.sparks ?? 0;
  const plan = (profile?.plan as UserPlan) ?? 'FREE';
  const planConfig = PLAN_CONFIGS[plan];
  const planColors = PLAN_COLORS[plan];
  const isLowBalance = sparks < 50;

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200',
          'bg-gray-800/50 border border-gray-700 hover:border-gray-600',
          'hover:bg-gray-800/70 active:scale-95',
          isOpen && 'border-gray-500 bg-gray-800/70'
        )}
      >
        <Zap className={cn(
          'w-4 h-4',
          isLowBalance ? 'text-orange-400' : 'text-yellow-400'
        )} />
        <span className={cn(
          'font-semibold text-sm',
          isLowBalance ? 'text-orange-400' : 'text-white'
        )}>
          {sparks.toLocaleString()}
        </span>
        <ChevronDown className={cn(
          'w-3 h-3 text-gray-400 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className={cn(
          'absolute right-0 top-full mt-2 w-72 z-50',
          'bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}>
          {/* Arrow */}
          <div className="absolute -top-2 right-6 w-4 h-4 bg-gray-900/95 border-l border-t border-gray-700/50 rotate-45" />

          {/* Content */}
          <div className="relative p-4">
            {/* Header with plan badge */}
            <div className="flex items-center justify-between mb-3">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                planColors.bg,
                planColors.text,
                planColors.border
              )}>
                {plan === 'DEV' && <Crown className="w-3 h-3" />}
                {planConfig.name}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Balance Display */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Zap className={cn(
                  'w-8 h-8',
                  isLowBalance ? 'text-orange-400' : 'text-yellow-400'
                )} />
                <div className="absolute inset-0 blur-md opacity-50">
                  <Zap className={cn(
                    'w-8 h-8',
                    isLowBalance ? 'text-orange-400' : 'text-yellow-400'
                  )} />
                </div>
              </div>
              <div>
                <span className={cn(
                  'text-3xl font-bold tracking-tight font-mono',
                  isLowBalance ? 'text-orange-400' : 'text-white'
                )}>
                  {sparks.toLocaleString()}
                </span>
                <span className="text-gray-500 text-sm ml-2">sparks</span>
              </div>
            </div>

            {/* Low balance warning */}
            {isLowBalance && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 mb-3">
                <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <p className="text-orange-400 text-xs">
                  Sparks baixos! Considere fazer upgrade.
                </p>
              </div>
            )}

            {/* Quick costs reference */}
            <div className="border-t border-gray-700/50 pt-3 mb-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Custos por geração</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between items-center px-2 py-1.5 rounded bg-gray-800/50">
                  <span className="text-gray-400">Post básico</span>
                  <span className="text-yellow-400 font-medium">{SPARK_COSTS.STATIC_POST.first}</span>
                </div>
                <div className="flex justify-between items-center px-2 py-1.5 rounded bg-gray-800/50">
                  <span className="text-gray-400">Com imagem</span>
                  <span className="text-yellow-400 font-medium">{SPARK_COSTS.POLLINATIONS.first}</span>
                </div>
              </div>
            </div>

            {/* Upgrade button (if not DEV) */}
            {plan !== 'DEV' && onUpgrade && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onUpgrade();
                }}
                className={cn(
                  'w-full py-2 px-3 rounded-lg text-sm font-medium transition-all',
                  'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500',
                  'text-white shadow-lg shadow-blue-500/20'
                )}
              >
                Fazer Upgrade
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
