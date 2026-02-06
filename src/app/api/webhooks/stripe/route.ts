/**
 * Stripe Webhook Handler
 * Processes subscription events from Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { constructWebhookEvent } from '@/lib/stripe/client';
import { getPlanFromPriceId, PLAN_SPARKS } from '@/lib/stripe/config';
import {
  updateUserPlan,
  creditSparksToUser,
  getUserByStripeCustomerId,
  setUserRefillDate,
} from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('[Webhook] Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing event:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed
 * Called when a customer completes the checkout flow
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('[Webhook] Processing checkout.session.completed');

  const userId = session.client_reference_id || session.metadata?.userId;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    console.error('[Webhook] No userId in checkout session');
    return;
  }

  // Get the subscription to find the price/plan
  const { stripe } = await import('@/lib/stripe/client');
  if (!stripe) {
    console.error('[Webhook] Stripe not configured');
    return;
  }
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error('[Webhook] No priceId found in subscription');
    return;
  }

  const plan = getPlanFromPriceId(priceId);
  if (!plan) {
    console.error('[Webhook] Unknown priceId:', priceId);
    return;
  }

  // Update user's plan in database
  await updateUserPlan(userId, plan, customerId, subscriptionId);

  // Credit initial sparks
  const sparksAmount = PLAN_SPARKS[plan];
  await creditSparksToUser(userId, sparksAmount, `Assinatura ${plan} ativada`);

  // Set next refill date (1 month from now)
  const nextRefill = new Date();
  nextRefill.setMonth(nextRefill.getMonth() + 1);
  await setUserRefillDate(userId, nextRefill);

  console.log(`[Webhook] User ${userId} upgraded to ${plan}, credited ${sparksAmount} sparks`);
}

/**
 * Handle subscription created/updated
 */
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log('[Webhook] Processing subscription change:', subscription.status);

  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error('[Webhook] No priceId in subscription');
    return;
  }

  const plan = getPlanFromPriceId(priceId);
  if (!plan) {
    console.error('[Webhook] Unknown priceId:', priceId);
    return;
  }

  // Find user by Stripe customer ID
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) {
    console.log('[Webhook] User not found for customer:', customerId);
    return;
  }

  // Only update if subscription is active
  if (subscription.status === 'active') {
    await updateUserPlan(user.id, plan, customerId, subscription.id);
    console.log(`[Webhook] Updated user ${user.id} to plan ${plan}`);
  }
}

/**
 * Handle subscription canceled
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log('[Webhook] Processing subscription cancellation');

  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) {
    console.log('[Webhook] User not found for customer:', customerId);
    return;
  }

  // Downgrade to FREE plan
  await updateUserPlan(user.id, 'FREE', customerId, undefined);
  console.log(`[Webhook] User ${user.id} downgraded to FREE`);
}

/**
 * Handle successful payment (monthly renewal)
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Only process subscription invoices (not one-time)
  if (!(invoice as any).subscription) {
    return;
  }

  console.log('[Webhook] Processing payment succeeded');

  const customerId = invoice.customer as string;

  // Find user by Stripe customer ID
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) {
    console.log('[Webhook] User not found for customer:', customerId);
    return;
  }

  // Credit monthly sparks
  const sparksAmount = PLAN_SPARKS[user.plan as keyof typeof PLAN_SPARKS] || 0;
  if (sparksAmount > 0) {
    await creditSparksToUser(user.id, sparksAmount, `Recarga mensal - Plano ${user.plan}`);

    // Set next refill date
    const nextRefill = new Date();
    nextRefill.setMonth(nextRefill.getMonth() + 1);
    await setUserRefillDate(user.id, nextRefill);

    console.log(`[Webhook] Credited ${sparksAmount} sparks to user ${user.id}`);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('[Webhook] Processing payment failed');

  const customerId = invoice.customer as string;

  // Find user by Stripe customer ID
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) {
    console.log('[Webhook] User not found for customer:', customerId);
    return;
  }

  // TODO: Send notification email to user about failed payment
  console.log(`[Webhook] Payment failed for user ${user.id}`);
}
