/**
 * Stripe Client
 * Server-side Stripe instance
 */

import Stripe from 'stripe';

// Allow build without STRIPE_SECRET_KEY, but warn
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ STRIPE_SECRET_KEY is not set. Stripe features will be unavailable.');
}

// Create Stripe instance only if key is available
const stripeInstance = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  : null;

// Export for direct use (webhooks, etc.) - will be null if not configured
export const stripe = stripeInstance;

// Helper to ensure Stripe is configured before use
function ensureStripe(): Stripe {
  if (!stripeInstance) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
  return stripeInstance;
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession({
  priceId,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const stripeClient = ensureStripe();
  return stripeClient.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: userEmail,
    client_reference_id: userId,
    metadata: {
      userId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    locale: 'pt-BR',
  });
}

/**
 * Create a customer portal session
 */
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const stripeClient = ensureStripe();
  return stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Get customer by email
 */
export async function getCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
  const stripeClient = ensureStripe();
  const customers = await stripeClient.customers.list({
    email,
    limit: 1,
  });
  return customers.data[0] ?? null;
}

/**
 * Get subscription by customer ID
 */
export async function getSubscriptionByCustomerId(customerId: string): Promise<Stripe.Subscription | null> {
  const stripeClient = ensureStripe();
  const subscriptions = await stripeClient.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  });
  return subscriptions.data[0] ?? null;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripeClient = ensureStripe();
  return stripeClient.subscriptions.cancel(subscriptionId);
}

/**
 * Construct webhook event from request
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  const stripeClient = ensureStripe();
  return stripeClient.webhooks.constructEvent(payload, signature, webhookSecret);
}
