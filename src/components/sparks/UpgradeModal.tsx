/**
 * Upgrade Modal Component
 * Shown when user has insufficient sparks or tries to use premium features
 */

'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useUser, type UserPlan } from '@/contexts/UserContext';
import { PLAN_CONFIGS, FLASH_SALE_CONFIG, getUpgradeSuggestion } from '@/lib/sparks/plans';
import { cn } from '@/lib/utils';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'insufficient_sparks' | 'feature_locked' | 'plan_upgrade_needed';
  requiredSparks?: number;
  lockedFeature?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  reason,
  requiredSparks,
  lockedFeature,
}: UpgradeModalProps) {
  const { profile } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<UserPlan | null>(null);

  const currentPlan = profile?.plan ?? 'FREE';
  const currentSparks = profile?.sparks ?? 0;

  const renderContent = () => {
    switch (reason) {
      case 'insufficient_sparks':
        return <InsufficientSparksContent
          currentSparks={currentSparks}
          requiredSparks={requiredSparks ?? 0}
          onSelectPlan={setSelectedPlan}
        />;
      case 'feature_locked':
        return <FeatureLockedContent
          feature={lockedFeature ?? ''}
          currentPlan={currentPlan}
          onSelectPlan={setSelectedPlan}
        />;
      case 'plan_upgrade_needed':
        return <PlanUpgradeContent
          currentPlan={currentPlan}
          onSelectPlan={setSelectedPlan}
        />;
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upgrade Necessário">
      <div className="space-y-6">
        {renderContent()}

        {selectedPlan && (
          <PlanSelection
            plan={selectedPlan}
            onCancel={() => setSelectedPlan(null)}
            onConfirm={() => {
              // Handle plan selection
              window.location.href = `/checkout?plan=${selectedPlan}`;
            }}
          />
        )}
      </div>
    </Modal>
  );
}

function InsufficientSparksContent({
  currentSparks,
  requiredSparks,
  onSelectPlan,
}: {
  currentSparks: number;
  requiredSparks: number;
  onSelectPlan: (plan: UserPlan) => void;
}) {
  const needed = Math.max(0, requiredSparks - currentSparks);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
          <SparkIcon className="w-8 h-8 text-yellow-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Sparks Insuficientes</h3>
        <p className="text-gray-400 mt-2">
          Você precisa de <strong className="text-white">{requiredSparks} sparks</strong> mas só tem{' '}
          <strong className="text-white">{currentSparks}</strong>.
        </p>
      </div>

      {/* Flash Sale Option */}
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-orange-400">⚡ Venda Flash</h4>
            <p className="text-sm text-gray-300">
              {FLASH_SALE_CONFIG.sparkPackAmount} sparks por ${FLASH_SALE_CONFIG.sparkPackPrice}
            </p>
          </div>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => window.location.href = '/checkout?pack=flash'}
          >
            Comprar
          </Button>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm">
        ou faça upgrade para um plano com mais sparks mensais
      </div>

      <PlanComparison onSelectPlan={onSelectPlan} />
    </div>
  );
}

function FeatureLockedContent({
  feature,
  currentPlan,
  onSelectPlan,
}: {
  feature: string;
  currentPlan: UserPlan;
  onSelectPlan: (plan: UserPlan) => void;
}) {
  const suggestion = getUpgradeSuggestion(currentPlan, feature);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
          <LockIcon className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Recurso Bloqueado</h3>
        <p className="text-gray-400 mt-2">
          O recurso <strong className="text-white">{feature}</strong> não está disponível no seu plano atual.
        </p>
      </div>

      {suggestion && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-sm text-purple-300 mb-3">
            {suggestion.reason}
          </p>
          <Button
            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
            onClick={() => onSelectPlan(suggestion.plan)}
          >
            Fazer upgrade para {PLAN_CONFIGS[suggestion.plan].name}
          </Button>
        </div>
      )}

      <PlanComparison onSelectPlan={onSelectPlan} />
    </div>
  );
}

function PlanUpgradeContent({
  currentPlan,
  onSelectPlan,
}: {
  currentPlan: UserPlan;
  onSelectPlan: (plan: UserPlan) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
          <CrownIcon className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Desbloqueie Mais Potência</h3>
        <p className="text-gray-400 mt-2">
          Seu plano atual <strong className="text-white">{PLAN_CONFIGS[currentPlan].name}</strong> tem limitações.
        </p>
      </div>

      <PlanComparison onSelectPlan={onSelectPlan} />
    </div>
  );
}

function PlanComparison({ onSelectPlan }: { onSelectPlan: (plan: UserPlan) => void }) {
  const plans: UserPlan[] = ['LITE', 'PRO', 'AGENCY'];

  return (
    <div className="grid gap-3">
      {plans.map((plan) => {
        const config = PLAN_CONFIGS[plan];
        return (
          <button
            key={plan}
            onClick={() => onSelectPlan(plan)}
            className={cn(
              'flex items-center justify-between p-4 rounded-lg border transition-all',
              'bg-gray-800/50 border-gray-700 hover:border-blue-500/50 hover:bg-gray-800'
            )}
          >
            <div className="text-left">
              <h4 className="font-semibold text-white">{config.name}</h4>
              <p className="text-sm text-gray-400">
                {config.monthlySparks.toLocaleString()} sparks/mês
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-white">${config.price}</span>
              <span className="text-gray-500 text-sm">/mês</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PlanSelection({
  plan,
  onCancel,
  onConfirm,
}: {
  plan: UserPlan;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const config = PLAN_CONFIGS[plan];

  return (
    <div className="space-y-4 pt-4 border-t border-gray-700">
      <h4 className="font-semibold text-white">Confirmar Upgrade</h4>
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Plano</span>
          <span className="text-white font-medium">{config.name}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Sparks mensais</span>
          <span className="text-white font-medium">{config.monthlySparks.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-700">
          <span className="text-gray-400">Total</span>
          <span className="text-xl font-bold text-white">${config.price}/mês</span>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={onConfirm} className="flex-1 bg-blue-500 hover:bg-blue-600">
          Continuar
        </Button>
      </div>
    </div>
  );
}

// Icons
function SparkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

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
