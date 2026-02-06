/**
 * Spark Usage History Component
 * Displays recent spark transactions
 */

'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import { History, ArrowUpRight, ArrowDownLeft, Loader2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
}

interface SparkUsageHistoryProps {
  className?: string;
  limit?: number;
  onViewAll?: () => void;
}

export function SparkUsageHistory({ className, limit = 5, onViewAll }: SparkUsageHistoryProps) {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchTransactions() {
      try {
        const response = await fetch(`/api/sparks/transactions?limit=${limit}`);
        if (response.status === 404) {
          // API route not found - table may not exist yet
          console.warn('Transactions API not found - spark_transactions table may not exist');
          setTransactions([]);
          setLoading(false);
          return;
        }
        if (response.status === 401) {
          // User not authenticated
          setError('Sessão expirada. Faça login novamente.');
          setLoading(false);
          return;
        }
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API error:', response.status, errorData);
          throw new Error(errorData.error || `Failed to fetch transactions (${response.status})`);
        }
        const data = await response.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        setError('Erro ao carregar histórico');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [user, limit]);

  if (loading) {
    return (
      <div className={cn(
        'relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-md p-6',
        className
      )}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        'relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-md',
        className
      )}>
        <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium text-gray-200">Histórico</h3>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-500 text-sm">{error}</p>
          <p className="text-gray-600 text-xs mt-1">Tente recarregar a página</p>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={cn(
        'relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-md',
        className
      )}>
        <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium text-gray-200">Histórico</h3>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-500 text-sm">Nenhuma transação ainda</p>
          <p className="text-gray-600 text-xs mt-1">Suas transações aparecerão aqui</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-md',
      className
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-medium text-gray-200">Histórico Recente</h3>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            Ver tudo
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Transaction list */}
      <div className="divide-y divide-gray-700/20">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                transaction.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'
              )}>
                {transaction.type === 'credit' ? (
                  <ArrowDownLeft className="w-4 h-4 text-green-400" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-200 truncate">{transaction.description}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(transaction.created_at))}
                </p>
              </div>
            </div>
            <span className={cn(
              'text-sm font-medium font-mono',
              transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
            )}>
              {transaction.type === 'credit' ? '+' : '-'}{transaction.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
