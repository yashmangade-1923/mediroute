import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const emergency = db.getEmergency(id);
  if (!emergency) {
    return NextResponse.json({ error: 'Emergency not found' }, { status: 404 });
  }
  return NextResponse.json(emergency);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const emergency = db.updateEmergency(id, body);
  if (!emergency) {
    return NextResponse.json({ error: 'Emergency not found' }, { status: 404 });
  }
  return NextResponse.json(emergency);
}
