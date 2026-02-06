/**
 * Spark Balance Section Component
 * Combines all spark balance components in a responsive layout
 */

'use client';

import { SparkBalanceCard } from './SparkBalanceCard';
import { SparkCostsTable } from './SparkCostsTable';
import { SparkUsageHistory } from './SparkUsageHistory';
import { cn } from '@/lib/utils';

interface SparkBalanceSectionProps {
  className?: string;
  onUpgrade?: () => void;
}

export function SparkBalanceSection({ className, onUpgrade }: SparkBalanceSectionProps) {
  return (
    <section className={cn('py-6', className)}>
      {/* Main Grid - Desktop: 3 columns, Mobile: 1 column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Spark Balance Card - Takes 5 columns on desktop */}
        <div className="lg:col-span-5">
          <SparkBalanceCard onUpgrade={onUpgrade} />
        </div>

        {/* Spark Costs Table - Takes 4 columns on desktop */}
        <div className="lg:col-span-4">
          <SparkCostsTable />
        </div>

        {/* Spark Usage History - Takes 3 columns on desktop */}
        <div className="lg:col-span-3">
          <SparkUsageHistory limit={5} />
        </div>
      </div>

      {/* Mobile hint */}
      <p className="mt-4 text-center text-xs text-gray-600 lg:hidden">
        Role para baixo para ver o editor
      </p>
    </section>
  );
}
