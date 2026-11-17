import { NextResponse } from 'next/server';
import { PERFUMES } from '@/lib/catalog';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const family = searchParams.get('family');
  const sort = searchParams.get('sort');

  let list = [...PERFUMES];

  if (family && family !== 'all') {
    list = list.filter((p) => p.family && p.family.toLowerCase() === family.toLowerCase());
  }

  if (sort === 'price_asc') {
    list.sort((a, b) => a.variants[0].price - b.variants[0].price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.variants[0].price - a.variants[0].price);
  }

  return NextResponse.json({
    data: list,
    meta: { total: list.length },
  });
}

