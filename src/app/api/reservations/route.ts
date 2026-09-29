import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  return NextResponse.json(db.getReservations());
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.requestId || !body.hospitalId || !body.resourceType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const result = db.attemptReservation({
    requestId: body.requestId,
    hospitalId: body.hospitalId,
    resourceType: body.resourceType,
    quantity: body.quantity || 1,
  });

  if (!result.success) {
    return NextResponse.json({ 
      error: result.error,
      success: false,
    }, { status: 409 });
  }

  // Update emergency status
  db.updateEmergency(body.requestId, { status: 'RESOURCE_RESERVED' });
  db.addTimelineEvent(body.requestId, {
    status: 'RESOURCE_RESERVED',
    timestamp: new Date().toISOString(),
    description: `${body.resourceType} reserved`,
    actor: 'System',
  });

  return NextResponse.json({ success: true, reservation: result.reservation }, { status: 201 });
}
