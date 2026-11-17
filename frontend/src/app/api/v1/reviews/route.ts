import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, rating, body, product_id } = await request.json();
    if (!name || !rating || !body) {
      return NextResponse.json({ message: 'Name, rating, and review text are required' }, { status: 422 });
    }
    return NextResponse.json({
      success: true,
      message: 'Review submitted and awaiting moderation.',
    });
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

