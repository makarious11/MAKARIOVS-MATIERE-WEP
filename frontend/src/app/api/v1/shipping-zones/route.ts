import { NextResponse } from 'next/server';
import { EGYPT_GOVERNORATES } from '@/components/checkout/GovernorateSelect';

export async function GET() {
  return NextResponse.json({
    data: EGYPT_GOVERNORATES,
  });
}

