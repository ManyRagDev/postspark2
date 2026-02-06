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
    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'priceId is required' },
        { status: 400 }
      );
    }

    // Validate price ID
    const priceConfig = getPriceConfig(priceId);
    if (!priceConfig) {
      return NextResponse.json(
        { error: 'Invalid priceId' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user;
    const origin = request.headers.get('origin') || 'https://postspark.com.br';

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      priceId,
      userId: user.id,
      userEmail: user.email!,
      successUrl: `${origin}/dashboard?upgrade=success&plan=${priceConfig.plan}`,
      cancelUrl: `${origin}/dashboard?upgrade=canceled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('[Checkout] Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
