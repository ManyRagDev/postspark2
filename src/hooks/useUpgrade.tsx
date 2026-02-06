/**
 * useUpgrade Hook
 * Manages upgrade modal state and provides methods to trigger upgrades
 */

'use client';

import { useState, useCallback } from 'react';
import { UpgradeModal } from '@/components/sparks/UpgradeModal';

type UpgradeReason = 'insufficient_sparks' | 'feature_locked' | 'plan_upgrade_needed';

interface UseUpgradeOptions {
  reason?: UpgradeReason;
  requiredSparks?: number;
  lockedFeature?: string;
}

export function useUpgrade() {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<UpgradeReason>('plan_upgrade_needed');
  const [requiredSparks, setRequiredSparks] = useState<number | undefined>();
  const [lockedFeature, setLockedFeature] = useState<string | undefined>();

  const openUpgrade = useCallback((options?: UseUpgradeOptions) => {
    if (options?.reason) setReason(options.reason);
    if (options?.requiredSparks !== undefined) setRequiredSparks(options.requiredSparks);
    if (options?.lockedFeature) setLockedFeature(options.lockedFeature);
    setIsOpen(true);
  }, []);

  const closeUpgrade = useCallback(() => {
    setIsOpen(false);
    // Reset state after animation
    setTimeout(() => {
      setReason('plan_upgrade_needed');
      setRequiredSparks(undefined);
      setLockedFeature(undefined);
    }, 300);
  }, []);

  const UpgradeModalComponent = useCallback(() => {
    return (
      <UpgradeModal
        isOpen={isOpen}
        onClose={closeUpgrade}
        reason={reason}
        requiredSparks={requiredSparks}
        lockedFeature={lockedFeature}
      />
    );
  }, [isOpen, closeUpgrade, reason, requiredSparks, lockedFeature]);

  return {
    openUpgrade,
    closeUpgrade,
    isUpgradeOpen: isOpen,
    UpgradeModal: UpgradeModalComponent,
  };
}
