import { NextResponse } from 'next/server';
import { saveServerContact } from '@/lib/serverDb';
import { checkRateLimit, getClientIp, isIpBlocked, isValidEmail, sanitizeText } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isIpBlocked(ip)) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  const rl = checkRateLimit(`contact_${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { message: `Too many messages sent. Please wait ${rl.retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const raw = await request.json();
    const name = sanitizeText(raw?.name, 100);
    const email = sanitizeText(raw?.email, 140);
    const phone = sanitizeText(raw?.phone, 24);
    const subject = sanitizeText(raw?.subject || 'General Inquiry', 120);
    const message = sanitizeText(raw?.message, 2000);

    if (!name || name.length < 2 || !email || !isValidEmail(email) || !message || message.length < 5) {
      return NextResponse.json({ message: 'Valid name, email, and message are required' }, { status: 422 });
    }

    saveServerContact({ name, email, phone, subject, message, ip });

    return NextResponse.json({
      success: true,
      message: 'Your correspondence has been received by the Master Alchemist.',
    });
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
