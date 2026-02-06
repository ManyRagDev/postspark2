'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Sparkles, Crown, Zap } from 'lucide-react';

const APP_ID = 'postspark';

const PLAN_INFO: Record<string, { name: string; icon: typeof Sparkles; color: string }> = {
  LITE: { name: 'LITE', icon: Zap, color: 'text-cyan-400' },
  PRO: { name: 'PRO', icon: Crown, color: 'text-purple-400' },
  AGENCY: { name: 'AGENCY', icon: Sparkles, color: 'text-orange-400' },
};

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Get plan and redirect from URL
  const selectedPlan = searchParams.get('plan')?.toUpperCase();
  const redirectTo = searchParams.get('redirect');
  const planInfo = selectedPlan && selectedPlan in PLAN_INFO ? PLAN_INFO[selectedPlan] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Determine redirect URL based on plan selection
      let redirectUrl = `${window.location.origin}/dashboard`;
      if (selectedPlan && redirectTo === 'checkout') {
        redirectUrl = `${window.location.origin}/checkout?plan=${selectedPlan}`;
      }

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            app_id: APP_ID,
            selected_plan: selectedPlan || null, // Store selected plan in user metadata
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Ocorreu um erro inesperado. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Verifique seu e-mail</h2>
          <p className="mt-2 text-gray-400">
            Enviamos um link de confirmação para <strong className="text-white">{email}</strong>
          </p>
        </div>

        {selectedPlan ? (
          <>
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-cyan-400 text-sm mb-2">
                Após verificar seu e-mail, você será direcionado para completar a assinatura do plano{' '}
                <strong>{planInfo?.name}</strong>.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Comece com 50 Sparks gratuitos + ganhe acesso ao plano premium!
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Clique no link para verificar sua conta e receber 50 Sparks gratuitos para começar!
          </p>
        )}

        <Link href="/login">
          <Button className="mt-4 bg-gray-700 hover:bg-gray-600 text-white">
            Ir para o login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Badge */}
      {planInfo && (
        <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg">
          <planInfo.icon className={`w-5 h-5 ${planInfo.color}`} />
          <span className="text-white font-medium">
            Criando conta para o plano <strong>{planInfo.name}</strong>
          </span>
        </div>
      )}

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Criar Conta</h1>
        <p className="mt-2 text-gray-400">
          {planInfo
            ? 'Complete o cadastro para continuar com a assinatura'
            : 'Comece com 50 Sparks gratuitos - não precisa de cartão de crédito'
          }
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Pelo menos 8 caracteres"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirmar Senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Criando conta...' : 'Criar Conta'}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-gray-400">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Entrar
          </Link>
        </p>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-400 transition-colors">
          ← Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
