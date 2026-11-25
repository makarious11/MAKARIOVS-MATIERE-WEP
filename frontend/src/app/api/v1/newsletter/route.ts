import { NextResponse } from 'next/server';
import { saveServerNewsletter } from '@/lib/serverDb';
import { checkRateLimit, getClientIp, isIpBlocked, isValidEmail, sanitizeText } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isIpBlocked(ip)) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  const rl = checkRateLimit(`newsletter_${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { message: `Too many subscription requests. Please wait ${rl.retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const raw = await request.json();
    const email = sanitizeText(raw?.email, 160);
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ message: 'Valid email is required' }, { status: 422 });
    }

    saveServerNewsletter(email, ip);

    return NextResponse.json({
      success: true,
      message: 'Subscribed to the royal apothecary register successfully',
    });
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
