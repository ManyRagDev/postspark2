/**
 * Stripe Configuration
 * Maps Stripe price IDs to PostSpark plans
 */

import type { UserPlan } from '@/lib/sparks/plans';

export type BillingInterval = 'month' | 'year';

export interface StripePriceConfig {
  priceId: string;
  plan: UserPlan;
  interval: BillingInterval;
  amount: number; // in cents (BRL)
}

// Price IDs from Stripe Dashboard
export const STRIPE_PRICES: StripePriceConfig[] = [
  // LITE Plan
  {
    priceId: 'price_1SxdbxE9QJm1ioJLyfG0x9zw',
    plan: 'LITE',
    interval: 'month',
    amount: 1900, // R$19,00
  },
  {
    priceId: 'price_1SxddDE9QJm1ioJLcbzwIwoO',
    plan: 'LITE',
    interval: 'year',
    amount: 18000, // R$180,00 (anual = R$15/mês)
  },
  // PRO Plan
  {
    priceId: 'price_1SxdeAE9QJm1ioJL37UEAnRz',
    plan: 'PRO',
    interval: 'month',
    amount: 7900, // R$79,00
  },
  {
    priceId: 'price_1SxdeRE9QJm1ioJLgPJ5Pcz6',
    plan: 'PRO',
    interval: 'year',
    amount: 75600, // R$756,00 (anual = R$63/mês)
  },
  // AGENCY - Coming soon (personalizado)
];

/**
 * Get plan from Stripe price ID
 */
export function getPlanFromPriceId(priceId: string): UserPlan | null {
  const config = STRIPE_PRICES.find(p => p.priceId === priceId);
  return config?.plan ?? null;
}

/**
 * Get price config from price ID
 */
export function getPriceConfig(priceId: string): StripePriceConfig | null {
  return STRIPE_PRICES.find(p => p.priceId === priceId) ?? null;
}

/**
 * Get price IDs for a specific plan
 */
export function getPriceIdsForPlan(plan: UserPlan): { monthly: string | null; yearly: string | null } {
  const prices = STRIPE_PRICES.filter(p => p.plan === plan);
  return {
    monthly: prices.find(p => p.interval === 'month')?.priceId ?? null,
    yearly: prices.find(p => p.interval === 'year')?.priceId ?? null,
  };
}

/**
 * Spark amounts for each plan (monthly refill)
 */
export const PLAN_SPARKS: Record<UserPlan, number> = {
  FREE: 50,
  LITE: 300,
  PRO: 1500,
  AGENCY: 5000,
  DEV: 999999,
};

/**
 * Webhook events we listen to
 */
export const STRIPE_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
] as const;

export type StripeWebhookEvent = typeof STRIPE_WEBHOOK_EVENTS[number];
