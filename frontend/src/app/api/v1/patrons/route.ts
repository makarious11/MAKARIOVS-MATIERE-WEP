import { NextResponse } from 'next/server';
import { getServerPatrons, saveServerPatron } from '@/lib/serverDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const patrons = getServerPatrons();
    return NextResponse.json({
      success: true,
      data: patrons,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error retrieving patrons', error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.name || !body.phone) {
      return NextResponse.json({ message: 'Name and phone are required' }, { status: 422 });
    }

    const patrons = saveServerPatron(body);
    return NextResponse.json({
      success: true,
      data: body,
      patrons,
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error saving patron', error: String(err) }, { status: 500 });
  }
}
