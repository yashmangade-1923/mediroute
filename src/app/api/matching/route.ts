import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { matchHospitals } from '@/lib/matching';

export async function POST(request: Request) {
  const body = await request.json();
  
  if (!body.patientRequirements || !body.patientLocation) {
    return NextResponse.json({ error: 'Missing requirements or location' }, { status: 400 });
  }

  const hospitals = db.getHospitals();
  const matches = matchHospitals(hospitals, body.patientRequirements, body.patientLocation);
  
  // Update emergency status if emergencyId provided
  if (body.emergencyId) {
    db.updateEmergency(body.emergencyId, { status: 'MATCHING' });
    db.addTimelineEvent(body.emergencyId, {
      status: 'MATCHING',
      timestamp: new Date().toISOString(),
      description: `${matches.length} hospitals evaluated`,
      actor: 'Matching Engine',
    });
  }

  return NextResponse.json(matches);
}
