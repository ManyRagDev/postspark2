'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/Button';
import { UpgradeModal } from '@/components/sparks';
import { getGenerationCost, type GenerationType } from '@/lib/sparks/config';
import { Sparkles } from 'lucide-react';

interface SparkProtectedButtonProps {
  generationType: GenerationType;
  onGenerate: () => void;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function SparkProtectedButton({
  generationType,
  onGenerate,
  disabled,
  loading,
  children,
  className,
}: SparkProtectedButtonProps) {
  const { hasEnoughSparks } = useUser();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const cost = getGenerationCost(generationType, false);
  const canAfford = hasEnoughSparks(cost);

  const handleClick = () => {
    if (!canAfford) {
      setShowUpgradeModal(true);
      return;
    }
    onGenerate();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={disabled || loading}
        className={className}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            {children || (
              <>
                Criar Post
                <span className="ml-2 text-white/70">({cost} ⚡)</span>
              </>
            )}
          </>
        )}
      </Button>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="insufficient_sparks"
        requiredSparks={cost}
      />
    </>
  );
}
