/**
 * Stripe Customer Portal API
 * Creates a portal session for managing subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPortalSession, getCustomerByEmail } from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  try {
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

    // Get customer ID from Stripe
    const customer = await getCustomerByEmail(user.email!);

    if (!customer) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Create portal session
    const portalSession = await createPortalSession({
      customerId: customer.id,
      returnUrl: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('[Portal] Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
