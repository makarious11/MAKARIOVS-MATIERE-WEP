import { NextResponse } from 'next/server';
import { getServerCatalog, saveServerProduct, deleteServerProduct } from '@/lib/serverDb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const family = searchParams.get('family');
    const sort = searchParams.get('sort');
    const includeHidden = searchParams.get('include_hidden') === 'true';

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
  try {
    const body = await request.json();
    if (!body || !body.name_en || !body.name_ar) {
      return NextResponse.json({ message: 'Product name in Arabic & English is required' }, { status: 422 });
    }

    const updatedCatalog = saveServerProduct(body);
    return NextResponse.json({
      success: true,
      data: body,
      catalog: updatedCatalog,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error saving product', error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Product id is required' }, { status: 422 });
    }

    const updatedCatalog = deleteServerProduct(Number(id));
    return NextResponse.json({
      success: true,
      catalog: updatedCatalog,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting product', error: String(err) }, { status: 500 });
  }
}
