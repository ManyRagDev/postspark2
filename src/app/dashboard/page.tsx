'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { MagicInterface } from '@/components/editor/MagicInterface';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { UpgradeModal, RegenerationLimitModal } from '@/components/sparks';
import { useState } from 'react';
import { getGenerationCost, type GenerationType } from '@/lib/sparks/config';

export default function Dashboard() {
  const { user, profile, loading, hasEnoughSparks } = useUser();
  const router = useRouter();
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showRegenLimitModal, setShowRegenLimitModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'insufficient_sparks' | 'feature_locked'>('insufficient_sparks');
  const [requiredSparks, setRequiredSparks] = useState(0);
  const [lockedFeature, setLockedFeature] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleGenerate = async (text: string) => {
    // Check if user has enough sparks for generation
    const cost = getGenerationCost('STATIC_POST', false);
    
    if (!hasEnoughSparks(cost)) {
      setUpgradeReason('insufficient_sparks');
      setRequiredSparks(cost);
      setShowUpgradeModal(true);
      return;
    }

    // Proceed with generation
    console.log('Generating post:', text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      
      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Magic Interface */}
          <MagicInterface onGenerate={handleGenerate} />
        </div>
      </main>

      {/* Modals */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={upgradeReason}
        requiredSparks={requiredSparks}
        lockedFeature={lockedFeature}
      />

      <RegenerationLimitModal
        isOpen={showRegenLimitModal}
        onClose={() => setShowRegenLimitModal(false)}
        generationType="STATIC_POST"
        originalPrompt=""
        onCreateNew={() => {
          setShowRegenLimitModal(false);
          // Trigger new generation
        }}
      />
    </div>
  );
}
