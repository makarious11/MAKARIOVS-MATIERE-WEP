import { NextResponse } from 'next/server';
import { getServerPatrons, saveServerPatron } from '@/lib/serverDb';
import { requireAdmin, sanitizeText } from '@/lib/security';

export const dynamic = 'force-dynamic';

// ADMIN ONLY: Customer Directory contains private PII (phones, emails, addresses)
export async function GET(request: Request) {
  const denied = requireAdmin(request, 'List Patrons Directory');
  if (denied) return denied;

  try {
    const patrons = getServerPatrons().map(({ passwordHash: _ph, ...safe }) => safe);
    return NextResponse.json({
      success: true,
      data: patrons,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error retrieving patrons', error: String(err) }, { status: 500 });
  }
}

// ADMIN ONLY: Direct patron record creation/overwrite
export async function POST(request: Request) {
  const denied = requireAdmin(request, 'Create or Update Patron');
  if (denied) return denied;

  try {
    const body = await request.json();
    if (!body || !body.name || !body.phone) {
      return NextResponse.json({ message: 'Name and phone are required' }, { status: 422 });
    }

    const sanitized = {
      ...body,
      name: sanitizeText(body.name, 100),
      phone: sanitizeText(body.phone, 24),
      email: sanitizeText(body.email, 140),
      city: sanitizeText(body.city, 80),
      address: sanitizeText(body.address, 250),
    };

    const patrons = saveServerPatron(sanitized).map(({ passwordHash: _ph, ...safe }) => safe);
    return NextResponse.json({
      success: true,
      data: sanitized,
      patrons,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error saving patron', error: String(err) }, { status: 500 });
  }
}
