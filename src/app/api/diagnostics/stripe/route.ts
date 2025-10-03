import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  const secret = process.env.STRIPE_SECRET_KEY || '';

  const result: any = {
    publishableKeyPresent: Boolean(publishable),
    publishableKeyPrefix: publishable ? publishable.split('_')[0] + '_' + publishable.split('_')[1] : null,
    publishableKeyLength: publishable ? publishable.length : 0,
    secretKeyPresent: Boolean(secret),
    secretKeyPrefix: secret ? secret.split('_')[0] + '_' + secret.split('_')[1] : null,
    secretKeyLength: secret ? secret.length : 0,
    secretKeyMasked: secret.includes('*'),
    stripeAccountCheck: null as null | {
      ok: boolean;
      error?: string;
      statusCode?: number;
      type?: string;
      account?: { id: string; email: string | null; livemode: boolean };
    },
    notes: [] as string[],
  };

  if (!secret) {
    return NextResponse.json(result, { status: 200 });
  }

  try {
    const sanitized = secret.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    if (sanitized.includes('*')) {
      result.notes.push('Secret key appears masked. Use the full key from Stripe.');
    }
    if (!/^sk_(test|live)_/.test(sanitized)) {
      result.notes.push('Secret key does not start with sk_test_ or sk_live_.');
    }
    const stripe = new Stripe(sanitized);
    const account = await stripe.accounts.retrieve();
    result.stripeAccountCheck = {
      ok: true,
      account: {
        id: account.id,
        email: (account as any).email ?? null,
        livemode: (account as any).livemode,
      },
    };
  } catch (err: any) {
    result.stripeAccountCheck = {
      ok: false,
      error: err?.message || 'Stripe account check failed',
      statusCode: err?.statusCode,
      type: err?.type,
    };
  }

  return NextResponse.json(result, { status: 200 });
}


