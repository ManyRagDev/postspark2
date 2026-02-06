/**
 * Regeneration Limit Modal
 * Shown when user has used up their regeneration attempts
 */

'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { getGenerationCost, type GenerationType } from '@/lib/sparks/config';

interface RegenerationLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  generationType: GenerationType;
  originalPrompt: string;
  newPrompt?: string;
  onCreateNew: () => void;
}

export function RegenerationLimitModal({
  isOpen,
  onClose,
  generationType,
  originalPrompt,
  newPrompt,
  onCreateNew,
}: RegenerationLimitModalProps) {
  const fullCost = getGenerationCost(generationType, false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Limite de Regeneração">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
            <RefreshOffIcon className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Regenerações Esgotadas
          </h3>
          <p className="text-gray-400 mt-2">
            Você já usou todas as regenerações disponíveis para este post.
          </p>
        </div>

        {/* Explanation */}
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white text-sm">Como funciona?</h4>
              <p className="text-gray-400 text-sm mt-1">
                Cada post permite apenas 1 regeneração gratuita (ou paga). 
                Após isso, você precisa criar um novo post.
              </p>
            </div>
          </div>

          {newPrompt && (
            <div className="flex items-start gap-3">
              <AlertIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white text-sm">Seu novo prompt</h4>
                <p className="text-gray-400 text-sm mt-1">
                  &ldquo;{newPrompt.length > 100 ? newPrompt.slice(0, 100) + '...' : newPrompt}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          <Button
            onClick={onCreateNew}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
          >
            <SparkIcon className="w-4 h-4 mr-2" />
            Criar Novo Post ({fullCost} sparks)
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Continuar com o Post Atual
          </Button>
        </div>

        {/* Tip */}
        <p className="text-xs text-gray-500 text-center">
          💡 Dica: Use a regeneração apenas quando necessário. 
          Cada post novo consome sparks do seu saldo.
        </p>
      </div>
    </Modal>
  );
}

// Icons
function RefreshOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
