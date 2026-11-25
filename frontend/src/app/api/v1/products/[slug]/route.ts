import { NextResponse } from 'next/server';
import { getServerProductBySlug } from '@/lib/serverDb';
import { sanitizeSlug, verifyAdminFromRequest } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cleanSlug = sanitizeSlug(slug);
    if (!cleanSlug) {
      return NextResponse.json({ message: 'Invalid product identifier' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const requestedHidden = searchParams.get('include_hidden') === 'true';
    const includeHidden = requestedHidden && verifyAdminFromRequest(request).authenticated;

    const perfume = getServerProductBySlug(cleanSlug);

    if (!perfume || (!includeHidden && perfume.is_hidden === true)) {
      return NextResponse.json(
        { message: 'Perfume not found in the royal apothecary' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: perfume,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error retrieving perfume', error: String(err) }, { status: 500 });
  }
}
