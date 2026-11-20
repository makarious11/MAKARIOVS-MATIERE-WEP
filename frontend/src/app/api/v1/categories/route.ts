import { NextResponse } from 'next/server';
import { getServerCategories, saveServerCategory, deleteServerCategory } from '@/lib/serverDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = getServerCategories();
    return NextResponse.json({
      data: list,
      meta: { total: list.length },
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error retrieving categories', error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.name_en || !body.name_ar) {
      return NextResponse.json({ message: 'Category name in Arabic & English is required' }, { status: 422 });
    }

    const updated = saveServerCategory(body);
    return NextResponse.json({
      success: true,
      data: body,
      categories: updated,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error saving category', error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ message: 'Category slug is required' }, { status: 422 });
    }

    const updated = deleteServerCategory(slug);
    return NextResponse.json({
      success: true,
      categories: updated,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting category', error: String(err) }, { status: 500 });
  }
}
