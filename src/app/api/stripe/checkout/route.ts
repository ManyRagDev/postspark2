/**
 * Stripe Checkout API
 * Creates a checkout session for subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe/client';
import { getPriceConfig } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    console.log('[Checkout] Starting checkout session creation');

    const { priceId } = await request.json();
    console.log('[Checkout] Received priceId:', priceId);

    if (!priceId) {
      console.error('[Checkout] Missing priceId');
      return NextResponse.json(
        { error: 'priceId is required' },
        { status: 400 }
      );
    }

    // Validate price ID
    const priceConfig = getPriceConfig(priceId);
    console.log('[Checkout] Price config:', priceConfig);

    if (!priceConfig) {
      console.error('[Checkout] Invalid priceId:', priceId);
      return NextResponse.json(
        { error: 'Invalid priceId' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      console.error('[Checkout] Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user;
    console.log('[Checkout] User authenticated:', { id: user.id, email: user.email });

    // Get absolute URL for redirects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://postspark.com.br';
    const origin = request.headers.get('origin') || appUrl;

    // Ensure URLs are absolute
    const successUrl = `${origin}/dashboard?upgrade=success&plan=${priceConfig.plan}`;
    const cancelUrl = `${origin}/dashboard?upgrade=canceled`;

    console.log('[Checkout] Redirect URLs:', { successUrl, cancelUrl });

    // Validate email
    if (!user.email) {
      console.error('[Checkout] User email is missing');
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Create checkout session
    console.log('[Checkout] Creating Stripe session with:', {
      priceId,
      userId: user.id,
      userEmail: user.email,
      plan: priceConfig.plan,
    });

    const checkoutSession = await createCheckoutSession({
      priceId,
      userId: user.id,
      userEmail: user.email,
      successUrl,
      cancelUrl,
    });

    console.log('[Checkout] Session created successfully:', checkoutSession.id);
    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    // Detailed error logging
    console.error('[STRIPE_CHECKOUT_ERROR] Full error:', error);
    console.error('[STRIPE_CHECKOUT_ERROR] Error message:', error?.message);
    console.error('[STRIPE_CHECKOUT_ERROR] Error type:', error?.type);
    console.error('[STRIPE_CHECKOUT_ERROR] Error code:', error?.code);
    console.error('[STRIPE_CHECKOUT_ERROR] Error stack:', error?.stack);

    // If it's a Stripe error, return specific message
    if (error?.type) {
      return NextResponse.json(
        {
          error: error.message || 'Stripe error',
          type: error.type,
          code: error.code
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
