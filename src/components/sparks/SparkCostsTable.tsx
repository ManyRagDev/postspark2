/**
 * Spark Costs Table Component
 * Displays generation costs for reference with plan availability indicators
 */

'use client';

import { SPARK_COSTS, getGenerationTypeLabel, type GenerationType } from '@/lib/sparks/config';
import { canUseEngine, type UserPlan } from '@/lib/sparks/plans';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import { Zap, Check, X, Sparkles } from 'lucide-react';

interface SparkCostsTableProps {
  className?: string;
}

const ENGINE_TO_TYPE: Record<string, GenerationType> = {
  'smart_match': 'STATIC_POST',
  'pollinations': 'POLLINATIONS',
  'nano_banana': 'NANO_BANANA',
};

export function SparkCostsTable({ className }: SparkCostsTableProps) {
  const { profile } = useUser();
  const plan = (profile?.plan as UserPlan) ?? 'FREE';

  const generationTypes: GenerationType[] = ['STATIC_POST', 'POLLINATIONS', 'NANO_BANANA', 'CAROUSEL'];

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-md',
      className
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-medium text-gray-200">Custos por Tipo</h3>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700/30">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tipo</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">1ª Geração</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Regeneração</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {generationTypes.map((type) => {
              const cost = SPARK_COSTS[type];
              const label = getGenerationTypeLabel(type);
              const isAvailable = isEngineAvailable(type, plan);

              return (
                <tr
                  key={type}
                  className={cn(
                    'border-b border-gray-700/20 last:border-b-0 transition-colors',
                    isAvailable ? 'hover:bg-gray-800/30' : 'opacity-50'
                  )}
                >
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-sm',
                      isAvailable ? 'text-gray-200' : 'text-gray-500'
                    )}>
                      {label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-300">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      {cost.first}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-300">
                      {cost.freeRegen ? (
                        <span className="text-green-400 text-xs">Grátis (1ª vez)</span>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 text-yellow-400" />
                          {cost.regen}
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-400">
                        <Check className="w-3 h-3" />
                        <span className="hidden sm:inline">Disponível</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <X className="w-3 h-3" />
                        <span className="hidden sm:inline">Upgrade</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function isEngineAvailable(type: GenerationType, plan: UserPlan): boolean {
  // Map generation types to engines
  const engineMap: Record<GenerationType, string> = {
    'STATIC_POST': 'smart_match',
    'POLLINATIONS': 'pollinations',
    'NANO_BANANA': 'nano_banana',
    'CAROUSEL': 'nano_banana', // Carousel requires nano_banana engine
  };

  const engine = engineMap[type];
  return canUseEngine(plan, engine);
}
