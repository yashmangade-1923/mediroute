import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.emergencyId || !body.hospitalId || !body.action) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const emergency = db.getEmergency(body.emergencyId);
  if (!emergency) {
    return NextResponse.json({ error: 'Emergency not found' }, { status: 404 });
  }

  const hospital = db.getHospital(body.hospitalId);
  if (!hospital) {
    return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
  }

  if (body.action === 'accept') {
    db.updateEmergency(body.emergencyId, {
      status: 'CONFIRMED',
      confirmationStatus: 'ACCEPTED',
      assignedHospitalId: body.hospitalId,
    });
    db.addTimelineEvent(body.emergencyId, {
      status: 'CONFIRMED',
      timestamp: new Date().toISOString(),
      description: `${hospital.name} confirmed availability`,
      actor: 'Hospital Staff',
    });
    db.addAuditLog({
      action: 'HOSPITAL_CONFIRMED',
      actor: 'Hospital Staff',
      requestId: body.emergencyId,
      hospitalId: body.hospitalId,
      details: `${hospital.name} accepted emergency ${emergency.requestNumber}`,
    });
  } else if (body.action === 'reject') {
    db.updateEmergency(body.emergencyId, {
      status: 'REJECTED',
      confirmationStatus: 'REJECTED',
    });
    db.addTimelineEvent(body.emergencyId, {
      status: 'REJECTED',
      timestamp: new Date().toISOString(),
      description: `${hospital.name} rejected the request`,
      actor: 'Hospital Staff',
    });
    db.addAuditLog({
      action: 'HOSPITAL_REJECTED',
      actor: 'Hospital Staff',
      requestId: body.emergencyId,
      hospitalId: body.hospitalId,
      details: `${hospital.name} rejected emergency ${emergency.requestNumber}`,
    });
  }

  return NextResponse.json(db.getEmergency(body.emergencyId));
}
