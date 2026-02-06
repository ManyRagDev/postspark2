/**
 * Spark Balance Component
 * Displays user's current spark balance with visual indicator
 */

'use client';

import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';

interface SparkBalanceProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'card';
}

export function SparkBalance({
  className,
  showLabel = true,
  size = 'md',
  variant = 'default',
}: SparkBalanceProps) {
  const { profile, loading } = useUser();

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-6 w-20 bg-gray-700 rounded" />
      </div>
    );
  }

  const sparks = profile?.sparks ?? 0;
  const plan = profile?.plan ?? 'FREE';

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-1.5', sizeClasses[size], className)}>
        <SparkIcon className={cn(iconSizes[size], 'text-yellow-400')} />
        <span className="font-semibold text-white">
          {sparks.toLocaleString()}
        </span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        'bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700',
        className
      )}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Saldo de Sparks</p>
            <div className="flex items-center gap-2 mt-1">
              <SparkIcon className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold text-white">
                {sparks.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
              {plan}
            </span>
          </div>
        </div>
        {sparks < 50 && (
          <p className="mt-3 text-xs text-orange-400">
            ⚠️ Sparks baixos! Considere recarregar.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700',
      className
    )}>
      <SparkIcon className={cn(iconSizes[size], 'text-yellow-400')} />
      <span className={cn('font-semibold text-white', sizeClasses[size])}>
        {sparks.toLocaleString()}
      </span>
      {showLabel && (
        <span className="text-gray-400 text-sm hidden sm:inline">
          sparks
        </span>
      )}
    </div>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

/**
 * Spark cost indicator for buttons
 */
interface SparkCostProps {
  cost: number;
  className?: string;
  disabled?: boolean;
}

export function SparkCost({ cost, className, disabled }: SparkCostProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-sm',
      disabled ? 'text-gray-500' : 'text-yellow-400',
      className
    )}>
      <SparkIcon className="w-3 h-3" />
      {cost}
    </span>
  );
}
