import { NextResponse } from 'next/server';
import { getPerfumeBySlug } from '@/lib/catalog';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const perfume = getPerfumeBySlug(slug);

  if (!perfume) {
    return NextResponse.json(
      { message: 'Perfume not found in the royal apothecary' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: perfume,
  });
}

