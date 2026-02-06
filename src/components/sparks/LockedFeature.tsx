/**
 * Locked Feature Component
 * Overlay shown when user tries to access a locked feature
 */

'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/contexts/UserContext';
import { getUpgradeSuggestion } from '@/lib/sparks/plans';

interface LockedFeatureProps {
  feature: string;
  children: React.ReactNode;
  className?: string;
  showOverlay?: boolean;
}

export function LockedFeature({
  feature,
  children,
  className,
  showOverlay = true,
}: LockedFeatureProps) {
  const { canUseFeature } = useUser();
  const isLocked = !canUseFeature(feature);

  if (!isLocked) {
    return <>{children}</>;
  }

  if (!showOverlay) {
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
        <LockOverlayContent feature={feature} />
      </div>
    </div>
  );
}

function LockOverlayContent({ feature }: { feature: string }) {
  const { profile } = useUser();
  const currentPlan = profile?.plan ?? 'FREE';
  const suggestion = getUpgradeSuggestion(currentPlan, feature);

  return (
    <div className="text-center p-6">
      <div className="w-12 h-12 mx-auto bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mb-3">
        <LockIcon className="w-6 h-6 text-white" />
      </div>
      <h4 className="text-white font-semibold mb-1">Recurso Premium</h4>
      <p className="text-gray-400 text-sm mb-4">
        {suggestion
          ? `Disponível no plano ${suggestion.plan}`
          : 'Faça upgrade para desbloquear'}
      </p>
      <Button
        size="sm"
        className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
        onClick={() => {
          // Trigger upgrade modal or redirect
          window.dispatchEvent(new CustomEvent('openUpgradeModal', {
            detail: { reason: 'feature_locked', feature }
          }));
        }}
      >
        Desbloquear
      </Button>
    </div>
  );
}

interface PremiumBadgeProps {
  requiredPlan: string;
  className?: string;
}

export function PremiumBadge({ requiredPlan, className }: PremiumBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
      'border border-yellow-500/30 text-yellow-400',
      className
    )}>
      <CrownIcon className="w-3 h-3" />
      {requiredPlan}
    </span>
  );
}

// Icons
function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
