'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { createClient } from '@/lib/supabase/client';
import { getPriceIdsForPlan, PLAN_SPARKS } from '@/lib/stripe/config';
import { Check, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import type { UserPlan } from '@/lib/sparks/plans';

// Plan details matching PricingSection
const PLAN_DETAILS: Record<Exclude<UserPlan, 'FREE' | 'DEV'>, {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
}> = {
  LITE: {
    name: 'LITE',
    monthlyPrice: 19,
    yearlyPrice: 15,
    description: 'Para criadores individuais',
    features: [
      '300 Sparks/mês',
      'Motores: Smart Match + Pollinations',
      'Todos os formatos (1:1, 4:5, 9:16)',
      'Preview limpo sem marca',
      'Download HD (1080px)',
      '1 Regeneração grátis (Pollinations)',
    ],
  },
  PRO: {
    name: 'PRO',
    monthlyPrice: 79,
    yearlyPrice: 63,
    description: 'Para profissionais de conteúdo',
    features: [
      '1.500 Sparks/mês',
      'Todos os motores (incl. Nano Banana Pro)',
      'Carrosséis IA ilimitados',
      'SEO 2026 para legenda',
      'Regenerações: 2-20 Sparks',
      'Todos os formatos + Carrossel',
    ],
  },
  AGENCY: {
    name: 'AGENCY',
    monthlyPrice: 249,
    yearlyPrice: 199,
    description: 'Para agências e equipes',
    features: [
      '5.000 Sparks/mês',
      'Tudo do PRO',
      'Brand Kits ilimitados',
      'Gestão de múltiplos clientes',
      'Suporte prioritário',
      'Onboarding personalizado',
    ],
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isYearly, setIsYearly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const supabase = createClient();

  // Get plan from URL
  const planParam = searchParams.get('plan')?.toUpperCase() as Exclude<UserPlan, 'FREE' | 'DEV'> | null;
  const selectedPlan = planParam && planParam in PLAN_DETAILS ? planParam : 'LITE';
  const planDetails = PLAN_DETAILS[selectedPlan];

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Redirect to signup with plan preserved
        router.push(`/signup?plan=${selectedPlan}&redirect=checkout`);
        return;
      }
      setChecking(false);
    } catch (err) {
      console.error('Auth check error:', err);
      setError('Erro ao verificar autenticação');
      setChecking(false);
    }
  }

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      // Get price IDs for selected plan
      const priceIds = getPriceIdsForPlan(selectedPlan);
      const priceId = isYearly ? priceIds.yearly : priceIds.monthly;

      if (!priceId) {
        setError('Configuração de preço não encontrada');
        setLoading(false);
        return;
      }

      // Call checkout API
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de checkout');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#050a10] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#050a10]">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="PostSpark" className="w-10 h-10" />
            <span className="text-xl font-bold gradient-text">PostSpark</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/#pricing"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para planos
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Details */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Assinar Plano {planDetails.name}
            </h1>
            <p className="text-gray-400 mb-8">{planDetails.description}</p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
              <span className={`text-sm ${!isYearly ? 'text-white' : 'text-gray-500'}`}>
                Mensal
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-cyan-500"
              />
              <span className={`text-sm ${isYearly ? 'text-white' : 'text-gray-500'}`}>
                Anual
              </span>
              {isYearly && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                  Economize 20%
                </span>
              )}
            </div>

            {/* Features */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold text-white">Incluso no plano</h3>
              </div>
              <ul className="space-y-3">
                {planDetails.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4">Resumo do Pedido</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Plano</span>
                  <span className="text-white font-medium">{planDetails.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sparks mensais</span>
                  <span className="text-white font-medium">
                    {PLAN_SPARKS[selectedPlan].toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Período</span>
                  <span className="text-white font-medium">
                    {isYearly ? 'Anual' : 'Mensal'}
                  </span>
                </div>

                {isYearly && (
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Preço mensal</span>
                      <span className="text-gray-500 line-through">
                        R$ {planDetails.monthlyPrice}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Com desconto anual</span>
                      <span className="text-green-400 font-medium">
                        R$ {planDetails.yearlyPrice}/mês
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-700 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-400">Total</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-white">
                      R$ {isYearly ? planDetails.yearlyPrice : planDetails.monthlyPrice}
                    </span>
                    <span className="text-gray-400 text-sm ml-1">/mês</span>
                  </div>
                </div>
                {isYearly && (
                  <p className="text-xs text-gray-500 text-right mt-1">
                    R$ {planDetails.yearlyPrice * 12} cobrado anualmente
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  'Continuar para Pagamento'
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Pagamento seguro processado pelo Stripe.
                Cancele quando quiser.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
