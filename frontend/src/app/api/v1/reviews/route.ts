import { NextResponse } from 'next/server';
import { getServerReviews, addServerReview, deleteServerReview } from '@/lib/serverDb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('product_slug') || undefined;
    const reviews = getServerReviews(slug);

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Failed to fetch reviews', error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, rating, body, product_id, product_slug } = await request.json();
    if (!name || !rating || !body) {
      return NextResponse.json({ message: 'Name, rating, and review text are required' }, { status: 422 });
    }

    const slug = product_slug || 'la-fleur-du-nil';
    const result = addServerReview(slug, {
      name: String(name).trim(),
      rating: Number(rating) || 5,
      body_ar: String(body).trim(),
      body_en: String(body).trim(),
      product_id,
    });

    return NextResponse.json({
      success: true,
      review: result.review,
      product: result.product,
      message: 'Review saved permanently to royal archive',
    });
  } catch (err) {
    return NextResponse.json({ message: 'Internal server error', error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('product_slug');
    const reviewId = searchParams.get('id');

    if (!slug || !reviewId) {
      return NextResponse.json({ message: 'product_slug and review id are required' }, { status: 422 });
    }

    const updatedProduct = deleteServerReview(slug, Number(reviewId));
    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Review deleted successfully',
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting review', error: String(err) }, { status: 500 });
  }
}
