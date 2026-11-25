import { NextResponse } from 'next/server';
import { getServerCatalog, saveServerProduct, deleteServerProduct } from '@/lib/serverDb';
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
    const family = searchParams.get('family');
    const sort = searchParams.get('sort');
    const requestedHidden = searchParams.get('include_hidden') === 'true';

    // Only authenticated Admins can inspect hidden products
    const includeHidden = requestedHidden && verifyAdminFromRequest(request).authenticated;

    let list = getServerCatalog();

    if (!includeHidden) {
      list = list.filter((p) => p.is_hidden !== true);
    }

    if (family && family !== 'all') {
      list = list.filter((p) => p.family && p.family.toLowerCase() === family.toLowerCase());
    }

    if (sort === 'price_asc') {
      list.sort((a, b) => (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0));
    } else if (sort === 'price_desc') {
      list.sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0));
    }

    return NextResponse.json({
      data: list,
      meta: { total: list.length },
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error retrieving catalog', error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin(request, 'Save Product');
  if (denied) return denied;

  try {
    const body = await request.json();
    if (!body || !body.name_en || !body.name_ar) {
      return NextResponse.json({ message: 'Product name in Arabic & English is required' }, { status: 422 });
    }

    const cleanSlug = sanitizeSlug(body.slug || body.name_en);
    if (!cleanSlug) {
      return NextResponse.json({ message: 'Valid product slug is required' }, { status: 422 });
    }

    const fallbackImg = '/images/products/la-fleur-du-nil-bottle.jpg';
    const rawImages = body.images || {};
    const safeImages = {
      hero: isSafeAssetUrl(rawImages.hero) ? rawImages.hero.trim() : fallbackImg,
      bottle: isSafeAssetUrl(rawImages.bottle) ? rawImages.bottle.trim() : fallbackImg,
      box: isSafeAssetUrl(rawImages.box) ? rawImages.box.trim() : '/images/products/packaging-mockup.jpg',
      lifestyle: isSafeAssetUrl(rawImages.lifestyle) ? rawImages.lifestyle.trim() : '/images/brand/NEW_brand-identity.png',
      texture: isSafeAssetUrl(rawImages.texture) ? rawImages.texture.trim() : '/images/brand/NEW_brand-identity.png',
    };

    const safeVariants = Array.isArray(body.variants)
      ? body.variants.map((v: any, idx: number) => ({
          ...v,
          id: Number(v.id) || Date.now() + idx,
          name_en: sanitizeText(v.name_en || `${v.size_ml || 50} ml`, 80),
          name_ar: sanitizeText(v.name_ar || `${v.size_ml || 50} مل`, 80),
          size_ml: Math.max(1, Math.min(5000, Number(v.size_ml) || 50)),
          price: Math.max(1, Number(v.price) || 1000),
          compare_at_price: v.compare_at_price ? Math.max(1, Number(v.compare_at_price)) : null,
          sku: sanitizeText(v.sku || `${cleanSlug}-${v.size_ml || 50}`, 50),
          stock: Math.max(0, Number(v.stock) || 0),
          is_default: Boolean(v.is_default || idx === 0),
        }))
      : [];

    if (safeVariants.length === 0) {
      return NextResponse.json({ message: 'At least one valid product variant is required' }, { status: 422 });
    }

    const sanitizedProduct = {
      ...body,
      id: Number(body.id) || Date.now(),
      slug: cleanSlug,
      name_en: sanitizeText(body.name_en, 120),
      name_ar: sanitizeText(body.name_ar, 120),
      tagline_en: sanitizeText(body.tagline_en, 240),
      tagline_ar: sanitizeText(body.tagline_ar, 240),
      story_en: sanitizeText(body.story_en, 2500),
      story_ar: sanitizeText(body.story_ar, 2500),
      concentration: sanitizeText(body.concentration || 'Extrait de Parfum', 80),
      longevity: Math.min(10, Math.max(1, Number(body.longevity) || 9)),
      sillage: Math.min(10, Math.max(1, Number(body.sillage) || 8)),
      intensity: Math.min(10, Math.max(1, Number(body.intensity) || 8)),
      images: safeImages,
      variants: safeVariants,
      is_hidden: Boolean(body.is_hidden),
      featured_on_home: body.featured_on_home !== false,
    };

    const updatedCatalog = saveServerProduct(sanitizedProduct);
    return NextResponse.json({
      success: true,
      data: sanitizedProduct,
      catalog: updatedCatalog,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error saving product', error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = requireAdmin(request, 'Delete Product');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ message: 'Valid product id is required' }, { status: 422 });
    }

    const updatedCatalog = deleteServerProduct(id);
    return NextResponse.json({
      success: true,
      catalog: updatedCatalog,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting product', error: String(err) }, { status: 500 });
  }
}
