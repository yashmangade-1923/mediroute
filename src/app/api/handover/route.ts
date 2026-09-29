import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: Request) {
  const body = await request.json();
  const { action, requestId } = body;

  if (!action || !requestId) {
    return NextResponse.json({ error: 'Missing action or requestId' }, { status: 400 });
  }

  const emergency = db.getEmergency(requestId);
  if (!emergency) {
    return NextResponse.json({ error: 'Emergency not found' }, { status: 404 });
  }

  const handover = db.getHandoverByRequest(requestId);

  switch (action) {
    case 'assign-ambulance': {
      const ambulance = db.getAvailableAmbulance();
      if (!ambulance) {
        return NextResponse.json({ error: 'No ambulance available' }, { status: 409 });
      }
      db.updateAmbulance(ambulance.id, { status: 'ASSIGNED', currentRequestId: requestId });
      db.updateEmergency(requestId, { status: 'AMBULANCE_ASSIGNED', ambulanceId: ambulance.id });
      db.addTimelineEvent(requestId, {
        status: 'AMBULANCE_ASSIGNED',
        timestamp: new Date().toISOString(),
        description: `Ambulance ${ambulance.vehicleNumber} assigned`,
        actor: 'Dispatcher',
      });
      if (emergency.assignedHospitalId) {
        db.createHandover({
          requestId,
          ambulanceId: ambulance.id,
          hospitalId: emergency.assignedHospitalId,
        });
      }
      return NextResponse.json({ success: true, ambulance });
    }

    case 'en-route': {
      if (emergency.ambulanceId) {
        db.updateAmbulance(emergency.ambulanceId, { status: 'EN_ROUTE' });
      }
      db.updateEmergency(requestId, { status: 'EN_ROUTE' });
      if (handover) {
        db.updateHandover(handover.id, { status: 'AMBULANCE_EN_ROUTE' });
      }
      db.addTimelineEvent(requestId, {
        status: 'EN_ROUTE',
        timestamp: new Date().toISOString(),
        description: 'Ambulance is en route',
        actor: 'Ambulance Team',
      });
      return NextResponse.json({ success: true });
    }

    case 'arrived': {
      if (emergency.ambulanceId) {
        db.updateAmbulance(emergency.ambulanceId, { status: 'AT_HOSPITAL' });
      }
      db.updateEmergency(requestId, { status: 'ARRIVED', handoverStatus: 'ARRIVED' });
      if (handover) {
        db.updateHandover(handover.id, { status: 'ARRIVED', arrivalTime: new Date().toISOString() });
      }
      db.addTimelineEvent(requestId, {
        status: 'ARRIVED',
        timestamp: new Date().toISOString(),
        description: 'Ambulance arrived at hospital',
        actor: 'Ambulance Team',
      });
      return NextResponse.json({ success: true });
    }

    case 'start': {
      db.updateEmergency(requestId, { status: 'HANDOVER_IN_PROGRESS', handoverStatus: 'HANDOVER_STARTED' });
      if (handover) {
        db.updateHandover(handover.id, { status: 'HANDOVER_STARTED', handoverStartTime: new Date().toISOString() });
      }
      db.addTimelineEvent(requestId, {
        status: 'HANDOVER_IN_PROGRESS',
        timestamp: new Date().toISOString(),
        description: 'Patient handover started',
        actor: 'Hospital Staff',
      });
      return NextResponse.json({ success: true });
    }

    case 'complete': {
      db.updateEmergency(requestId, { status: 'COMPLETED', handoverStatus: 'HANDOVER_COMPLETED' });
      if (handover) {
        db.updateHandover(handover.id, { status: 'HANDOVER_COMPLETED', handoverCompleteTime: new Date().toISOString() });
      }
      if (emergency.ambulanceId) {
        db.updateAmbulance(emergency.ambulanceId, { status: 'AVAILABLE', currentRequestId: null });
      }
      db.addTimelineEvent(requestId, {
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        description: 'Patient handover completed',
        actor: 'Hospital Staff',
      });
      db.addAuditLog({
        action: 'HANDOVER_COMPLETED',
        actor: 'Hospital Staff',
        requestId,
        hospitalId: emergency.assignedHospitalId || undefined,
        details: `Handover completed for ${emergency.requestNumber}`,
      });
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(db.getHandovers());
}
