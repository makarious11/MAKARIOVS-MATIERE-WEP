import { NextResponse } from 'next/server';
import { getServerCatalog, getServerReviews, addServerReview, deleteServerReview } from '@/lib/serverDb';
import {
  checkRateLimit,
  getClientIp,
  isIpBlocked,
  requireAdmin,
  sanitizeSlug,
  sanitizeText,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = sanitizeSlug(searchParams.get('product_slug')) || undefined;
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
  const ip = getClientIp(request);
  if (isIpBlocked(ip)) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  // Rate limit review spam (max 5 reviews per 10 mins per IP)
  const rl = checkRateLimit(`reviews_post_${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { message: `Too many review submissions. Wait ${rl.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  try {
    const raw = await request.json();
    const name = sanitizeText(raw?.name, 80);
    const bodyText = sanitizeText(raw?.body, 1000);
    const rating = Math.min(5, Math.max(1, parseInt(String(raw?.rating || 5), 10) || 5));
    const slug = sanitizeSlug(raw?.product_slug) || 'la-fleur-du-nil';

    if (!name || name.length < 2 || !bodyText || bodyText.length < 3) {
      return NextResponse.json({ message: 'Name and review text are required' }, { status: 422 });
    }

    const catalog = getServerCatalog();
    const targetProduct = catalog.find((p) => p.slug === slug && p.is_hidden !== true);
    if (!targetProduct) {
      return NextResponse.json({ message: 'Target product not found' }, { status: 404 });
    }

    const result = addServerReview(slug, {
      name,
      rating,
      body_ar: bodyText,
      body_en: bodyText,
      product_id: targetProduct.id,
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
  const denied = requireAdmin(request, 'Delete Product Review');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const slug = sanitizeSlug(searchParams.get('product_slug'));
    const reviewId = Number(searchParams.get('id'));

    if (!slug || !Number.isFinite(reviewId) || reviewId <= 0) {
      return NextResponse.json({ message: 'Valid product_slug and review id are required' }, { status: 422 });
    }

    const updatedProduct = deleteServerReview(slug, reviewId);
    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Review deleted successfully',
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting review', error: String(err) }, { status: 500 });
  }
}
