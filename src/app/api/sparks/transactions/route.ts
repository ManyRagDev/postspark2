/**
 * API Route: GET /api/sparks/transactions
 * Fetches recent spark transactions for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Get the limit from query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    console.log('[API] Fetching transactions, limit:', limit);

    // Create server client
    let supabase;
    try {
      supabase = await createClient();
      console.log('[API] Supabase client created successfully');
    } catch (clientError) {
      console.error('[API] Error creating Supabase client:', clientError);
      return NextResponse.json(
        { error: 'Failed to create database client', details: (clientError as Error).message },
        { status: 500 }
      );
    }

    // Get current session
    let session;
    let sessionError;
    try {
      const result = await supabase.auth.getSession();
      session = result.data.session;
      sessionError = result.error;
      console.log('[API] Session check:', session ? 'Authenticated' : 'Not authenticated');
      if (sessionError) {
        console.error('[API] Session error:', sessionError);
      }
    } catch (authError) {
      console.error('[API] Error getting session:', authError);
      return NextResponse.json(
        { error: 'Failed to get session', details: (authError as Error).message },
        { status: 500 }
      );
    }

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', details: sessionError?.message },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('[API] User ID:', userId);

    // Fetch transactions using RPC function
    let transactions;
    let transactionsError;
    try {
      const result = await supabase
        .rpc('get_user_transactions', {
          user_uuid: userId,
          limit_count: limit
        });
      
      transactions = result.data;
      transactionsError = result.error;
      
      console.log('[API] Query result:', {
        count: transactions?.length || 0,
        error: transactionsError?.message || null,
        errorCode: transactionsError?.code || null
      });
    } catch (queryError) {
      console.error('[API] Error executing query:', queryError);
      return NextResponse.json(
        { error: 'Failed to execute query', details: (queryError as Error).message },
        { status: 500 }
      );
    }

    if (transactionsError) {
      console.error('[API] Error fetching transactions:', transactionsError);
      return NextResponse.json(
        {
          error: 'Failed to fetch transactions',
          details: transactionsError.message,
          code: transactionsError.code,
          hint: transactionsError.hint
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ transactions: transactions || [] });

  } catch (error) {
    console.error('[API] Unexpected error in transactions API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message, stack: (error as Error).stack },
      { status: 500 }
    );
  }
}
