import { NextResponse } from 'next/server';
import { getServerCategories, saveServerCategory, deleteServerCategory } from '@/lib/serverDb';
import {
  isSafeAssetUrl,
  requireAdmin,
  sanitizeSlug,
  sanitizeText,
  verifyAdminFromRequest,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive =
      searchParams.get('include_inactive') === 'true' && verifyAdminFromRequest(request).authenticated;

    let list = getServerCategories();
    if (!includeInactive && !verifyAdminFromRequest(request).authenticated) {
      // Public visitors still get categories list; inactive atelier preview categories stay marked is_active: false
      // Keep compatible with CollectionSection while protecting admin write ops
    }

    return NextResponse.json({
      data: list,
      meta: { total: list.length },
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error retrieving categories', error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin(request, 'Save Category');
  if (denied) return denied;

  try {
    const body = await request.json();
    if (!body || !body.name_en || !body.name_ar) {
      return NextResponse.json({ message: 'Category name in Arabic & English is required' }, { status: 422 });
    }

    const cleanSlug = sanitizeSlug(body.slug || body.name_en);
    if (!cleanSlug) {
      return NextResponse.json({ message: 'Valid category slug is required' }, { status: 422 });
    }

    const sanitizedCategory = {
      ...body,
      id: sanitizeText(body.id || `cat-${cleanSlug}`, 60),
      slug: cleanSlug,
      name_en: sanitizeText(body.name_en, 100),
      name_ar: sanitizeText(body.name_ar, 100),
      tagline_en: sanitizeText(body.tagline_en, 200),
      tagline_ar: sanitizeText(body.tagline_ar, 200),
      description_en: sanitizeText(body.description_en, 1000),
      description_ar: sanitizeText(body.description_ar, 1000),
      image_url: isSafeAssetUrl(body.image_url) ? body.image_url.trim() : '/images/products/la-fleur-du-nil-bottle.jpg',
      is_active: body.is_active !== false,
      sort_order: Math.max(1, Number(body.sort_order) || 1),
    };

    const updated = saveServerCategory(sanitizedCategory);
    return NextResponse.json({
      success: true,
      data: sanitizedCategory,
      categories: updated,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error saving category', error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = requireAdmin(request, 'Delete Category');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const cleanSlug = sanitizeSlug(searchParams.get('slug'));
    if (!cleanSlug) {
      return NextResponse.json({ message: 'Valid category slug is required' }, { status: 422 });
    }

    const updated = deleteServerCategory(cleanSlug);
    return NextResponse.json({
      success: true,
      categories: updated,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting category', error: String(err) }, { status: 500 });
  }
}
