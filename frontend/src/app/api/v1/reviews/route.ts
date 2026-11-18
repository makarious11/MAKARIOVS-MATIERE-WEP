import { NextResponse } from 'next/server';

interface StoredReview {
  id: number;
  name: string;
  rating: number;
  body: string;
  product_id?: number | string;
  product_slug?: string;
  created_at: string;
}

const memoryReviews: StoredReview[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('product_slug');
    const id = searchParams.get('product_id');

    let list = memoryReviews;
    if (slug) {
      list = list.filter((r) => r.product_slug === slug);
    } else if (id) {
      list = list.filter((r) => String(r.product_id) === String(id));
    }

    return NextResponse.json({
      success: true,
      reviews: list,
    });
  } catch {
    return NextResponse.json({ message: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, rating, body, product_id, product_slug } = await request.json();
    if (!name || !rating || !body) {
      return NextResponse.json({ message: 'Name, rating, and review text are required' }, { status: 422 });
    }

    const review: StoredReview = {
      id: Date.now(),
      name: String(name).trim(),
      rating: Number(rating) || 5,
      body: String(body).trim(),
      product_id,
      product_slug,
      created_at: new Date().toISOString(),
    };

    memoryReviews.unshift(review);

    return NextResponse.json({
      success: true,
      review,
      message: 'Review submitted successfully',
    });
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
