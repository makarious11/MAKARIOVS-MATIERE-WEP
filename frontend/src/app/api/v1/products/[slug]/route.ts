import { NextResponse } from 'next/server';
import { getServerProductBySlug } from '@/lib/serverDb';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const includeHidden = searchParams.get('include_hidden') === 'true';

    const perfume = getServerProductBySlug(slug);

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
