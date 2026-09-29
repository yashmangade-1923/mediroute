import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  return NextResponse.json(db.getEmergencies());
}

export async function POST(request: Request) {
  const body = await request.json();
  
  if (!body.patientCondition || !body.severity || !body.patientRequirements) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const emergency = db.createEmergency({
    patientCondition: body.patientCondition,
    severity: body.severity,
    patientRequirements: body.patientRequirements,
    patientLocation: body.patientLocation || { lat: 18.5200, lng: 73.8550 },
  });

  return NextResponse.json(emergency, { status: 201 });
}
