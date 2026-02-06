/**
 * Spark Balance Card Component
 * Displays user's current spark balance prominently with plan info and upgrade button
 */

'use client';

import { useUser } from '@/contexts/UserContext';
import { PLAN_CONFIGS, type UserPlan } from '@/lib/sparks/plans';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Zap, ArrowUpRight, AlertTriangle, Crown } from 'lucide-react';

interface SparkBalanceCardProps {
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

export function SparkBalanceCard({ className, onUpgrade }: SparkBalanceCardProps) {
  const { profile, loading } = useUser();

  if (loading) {
    return (
      <div className={cn(
        'relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/50 p-6 backdrop-blur-md',
        className
      )}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-gray-700 rounded" />
          <div className="h-12 w-24 bg-gray-700 rounded" />
          <div className="h-6 w-20 bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  const sparks = profile?.sparks ?? 0;
  const plan = (profile?.plan as UserPlan) ?? 'FREE';
  const planConfig = PLAN_CONFIGS[plan];
  const planColors = PLAN_COLORS[plan];
  const isLowBalance = sparks < 50;
  const isFreePlan = plan === 'FREE';
  const monthlySparks = planConfig.monthlySparks;

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-gray-950/90 p-6 backdrop-blur-md',
      'shadow-lg shadow-black/20',
      className
    )}>
      {/* Background glow effect */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="relative">
        {/* Header with plan badge */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Seu Saldo</p>
            <div className="flex items-center gap-3">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
                planColors.bg,
                planColors.text,
                planColors.border
              )}>
                {plan === 'DEV' ? (
                  <Crown className="w-3 h-3" />
                ) : null}
                {planConfig.name}
              </span>
              {plan !== 'FREE' && plan !== 'DEV' && (
                <span className="text-gray-500 text-xs">
                  {monthlySparks.toLocaleString()} sparks/mês
                </span>
              )}
            </div>
          </div>

          {/* Upgrade button (hidden for DEV plan) */}
          {plan !== 'DEV' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onUpgrade}
              className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-1"
            >
              Upgrade
              <ArrowUpRight className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Spark balance display */}
        <div className="flex items-baseline gap-3 mb-4">
          <div className="relative">
            <Zap className={cn(
              'w-10 h-10',
              isLowBalance ? 'text-orange-400' : 'text-yellow-400'
            )} />
            <div className="absolute inset-0 blur-lg opacity-50">
              <Zap className={cn(
                'w-10 h-10',
                isLowBalance ? 'text-orange-400' : 'text-yellow-400'
              )} />
            </div>
          </div>
          <span className={cn(
            'text-5xl font-bold tracking-tight font-mono',
            isLowBalance ? 'text-orange-400' : 'text-white'
          )}>
            {sparks.toLocaleString()}
          </span>
          <span className="text-gray-500 text-lg">sparks</span>
        </div>

        {/* Low balance warning */}
        {isLowBalance && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 mb-4">
            <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <p className="text-orange-400 text-sm">
              Sparks baixos! Você pode ficar sem créditos em breve.
            </p>
          </div>
        )}

        {/* Free plan info */}
        {isFreePlan && !isLowBalance && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Plano gratuito com</span>
            <span className="text-yellow-400 font-medium">{monthlySparks} sparks</span>
            <span>iniciais</span>
          </div>
        )}

        {/* Usage hint */}
        {plan !== 'FREE' && plan !== 'DEV' && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Próxima recarga mensal em</span>
            <span className="text-blue-400 font-medium">
              {getDaysUntilNextMonth()} dias
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function getDaysUntilNextMonth(): number {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diffTime = nextMonth.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
