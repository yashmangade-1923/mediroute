// ============================================================
// MediRoute - Simulation Service
// ============================================================

import { db } from './database';
import { EmergencyStatus, HandoverStatus, Severity } from './types';
import { matchHospitals } from './matching';

// ============================================================
// Demo Scenario Runner
// ============================================================

export async function runDemoScenario(): Promise<{ success: boolean; steps: string[]; emergencyId: string }> {
  const steps: string[] = [];

  // Step 1: Create emergency
  const emergency = db.createEmergency({
    patientCondition: 'Cardiac arrest with respiratory failure',
    severity: 'CRITICAL',
    patientRequirements: {
      icuRequired: true,
      ventilatorRequired: true,
      emergencyBedRequired: true,
      traumaRequired: false,
      cardiologyRequired: true,
      neurologyRequired: false,
      pediatricsRequired: false,
      icuCount: 1,
      ventilatorCount: 1,
      emergencyBedCount: 1,
    },
    patientLocation: { lat: 18.5200, lng: 73.8550 },
  });
  steps.push(`Step 1: Emergency ${emergency.requestNumber} created - CRITICAL severity`);

  // Step 2: Match hospitals
  const hospitals = db.getHospitals();
  const matches = matchHospitals(hospitals, emergency.patientRequirements, emergency.patientLocation);
  db.updateEmergency(emergency.id, { status: 'MATCHING' });
  db.addTimelineEvent(emergency.id, {
    status: 'MATCHING',
    timestamp: new Date().toISOString(),
    description: `${matches.length} hospitals evaluated, best match: ${matches[0]?.hospital.name}`,
    actor: 'Matching Engine',
  });
  steps.push(`Step 2: ${matches.length} hospitals ranked. Best: ${matches[0]?.hospital.name} (Score: ${matches[0]?.overallScore})`);

  if (matches.length === 0) {
    return { success: false, steps: [...steps, 'No suitable hospitals found'], emergencyId: emergency.id };
  }

  const bestMatch = matches[0];

  // Step 3: Select hospital
  db.updateEmergency(emergency.id, {
    status: 'AWAITING_CONFIRMATION',
    assignedHospitalId: bestMatch.hospital.id,
    estimatedTravelTime: bestMatch.travelTimeMinutes,
    confirmationStatus: 'PENDING',
  });
  db.addTimelineEvent(emergency.id, {
    status: 'AWAITING_CONFIRMATION',
    timestamp: new Date().toISOString(),
    description: `Confirmation requested from ${bestMatch.hospital.name}`,
    actor: 'Dispatcher',
  });
  steps.push(`Step 3: Selected ${bestMatch.hospital.name}, awaiting confirmation`);

  // Step 4: Hospital accepts
  db.updateEmergency(emergency.id, {
    status: 'CONFIRMED',
    confirmationStatus: 'ACCEPTED',
  });
  db.addTimelineEvent(emergency.id, {
    status: 'CONFIRMED',
    timestamp: new Date().toISOString(),
    description: `${bestMatch.hospital.name} confirmed availability`,
    actor: 'Hospital Staff',
  });
  db.addAuditLog({
    action: 'HOSPITAL_CONFIRMED',
    actor: 'Hospital Staff',
    requestId: emergency.id,
    hospitalId: bestMatch.hospital.id,
    details: `${bestMatch.hospital.name} accepted emergency ${emergency.requestNumber}`,
  });
  steps.push(`Step 4: ${bestMatch.hospital.name} accepted the request`);

  // Step 5: Reserve resources
  const resourcesToReserve: Array<{ type: 'ICU' | 'VENTILATOR' | 'EMERGENCY_BED'; qty: number }> = [];
  if (emergency.patientRequirements.icuRequired) {
    resourcesToReserve.push({ type: 'ICU', qty: emergency.patientRequirements.icuCount || 1 });
  }
  if (emergency.patientRequirements.ventilatorRequired) {
    resourcesToReserve.push({ type: 'VENTILATOR', qty: emergency.patientRequirements.ventilatorCount || 1 });
  }
  if (emergency.patientRequirements.emergencyBedRequired) {
    resourcesToReserve.push({ type: 'EMERGENCY_BED', qty: emergency.patientRequirements.emergencyBedCount || 1 });
  }

  let allReserved = true;
  for (const res of resourcesToReserve) {
    const result = db.attemptReservation({
      requestId: emergency.id,
      hospitalId: bestMatch.hospital.id,
      resourceType: res.type,
      quantity: res.qty,
    });
    if (!result.success) {
      allReserved = false;
      steps.push(`Step 5: ❌ Reservation failed for ${res.type}: ${result.error}`);
    }
  }

  if (allReserved) {
    db.updateEmergency(emergency.id, { status: 'RESOURCE_RESERVED' });
    db.addTimelineEvent(emergency.id, {
      status: 'RESOURCE_RESERVED',
      timestamp: new Date().toISOString(),
      description: 'All required resources reserved',
      actor: 'System',
    });
    steps.push('Step 5: All resources reserved successfully');
  }

  // Step 6: Assign ambulance
  const ambulance = db.getAvailableAmbulance();
  if (ambulance) {
    db.updateAmbulance(ambulance.id, {
      status: 'ASSIGNED',
      currentRequestId: emergency.id,
    });
    db.updateEmergency(emergency.id, {
      status: 'AMBULANCE_ASSIGNED',
      ambulanceId: ambulance.id,
    });
    db.addTimelineEvent(emergency.id, {
      status: 'AMBULANCE_ASSIGNED',
      timestamp: new Date().toISOString(),
      description: `Ambulance ${ambulance.vehicleNumber} assigned`,
      actor: 'Dispatcher',
    });
    steps.push(`Step 6: Ambulance ${ambulance.vehicleNumber} (${ambulance.teamName}) assigned`);

    // Step 7: En Route
    db.updateAmbulance(ambulance.id, { status: 'EN_ROUTE' });
    db.updateEmergency(emergency.id, { status: 'EN_ROUTE' });
    const handover = db.createHandover({
      requestId: emergency.id,
      ambulanceId: ambulance.id,
      hospitalId: bestMatch.hospital.id,
    });
    db.addTimelineEvent(emergency.id, {
      status: 'EN_ROUTE',
      timestamp: new Date().toISOString(),
      description: `Ambulance en route to ${bestMatch.hospital.name}`,
      actor: 'Ambulance Team',
    });
    steps.push(`Step 7: Ambulance en route to ${bestMatch.hospital.name}`);

    // Step 8: Arrived
    db.updateAmbulance(ambulance.id, { status: 'AT_HOSPITAL' });
    db.updateEmergency(emergency.id, { status: 'ARRIVED', handoverStatus: 'ARRIVED' });
    db.updateHandover(handover.id, {
      status: 'ARRIVED',
      arrivalTime: new Date().toISOString(),
    });
    db.addTimelineEvent(emergency.id, {
      status: 'ARRIVED',
      timestamp: new Date().toISOString(),
      description: `Ambulance arrived at ${bestMatch.hospital.name}`,
      actor: 'Ambulance Team',
    });
    steps.push(`Step 8: Ambulance arrived at ${bestMatch.hospital.name}`);

    // Step 9: Hospital ready
    db.updateHandover(handover.id, { status: 'HOSPITAL_READY' });
    steps.push('Step 9: Hospital ready for handover');

    // Step 10: Handover started
    db.updateEmergency(emergency.id, { status: 'HANDOVER_IN_PROGRESS', handoverStatus: 'HANDOVER_STARTED' });
    db.updateHandover(handover.id, {
      status: 'HANDOVER_STARTED',
      handoverStartTime: new Date().toISOString(),
    });
    db.addTimelineEvent(emergency.id, {
      status: 'HANDOVER_IN_PROGRESS',
      timestamp: new Date().toISOString(),
      description: 'Patient handover initiated',
      actor: 'Hospital Staff',
    });
    steps.push('Step 10: Patient handover started');

    // Step 11: Handover completed
    db.updateEmergency(emergency.id, { status: 'COMPLETED', handoverStatus: 'HANDOVER_COMPLETED' });
    db.updateHandover(handover.id, {
      status: 'HANDOVER_COMPLETED',
      handoverCompleteTime: new Date().toISOString(),
    });
    db.updateAmbulance(ambulance.id, { status: 'AVAILABLE', currentRequestId: null });
    db.addTimelineEvent(emergency.id, {
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
      description: 'Patient handover completed successfully',
      actor: 'Hospital Staff',
    });
    db.addAuditLog({
      action: 'HANDOVER_COMPLETED',
      actor: 'Hospital Staff',
      requestId: emergency.id,
      hospitalId: bestMatch.hospital.id,
      details: `Emergency ${emergency.requestNumber} handover completed at ${bestMatch.hospital.name}`,
    });
    steps.push('Step 11: Patient handover completed ✓');
  } else {
    steps.push('Step 6: No ambulance available');
  }

  return { success: true, steps, emergencyId: emergency.id };
}

// ============================================================
// Double-Booking Demo
// ============================================================

export function runDoubleBookingDemo(): {
  success: boolean;
  result: {
    request1: { id: string; number: string; reserved: boolean; error?: string };
    request2: { id: string; number: string; reserved: boolean; error?: string };
    hospitalName: string;
    resourceType: string;
    initialAvailable: number;
  };
} {
  // Find a hospital with exactly 1 ICU bed available
  const hospital = db.getHospital('hosp-005'); // Sahyadri has 1 ICU
  if (!hospital) {
    return {
      success: false,
      result: {
        request1: { id: '', number: '', reserved: false },
        request2: { id: '', number: '', reserved: false },
        hospitalName: '',
        resourceType: 'ICU',
        initialAvailable: 0,
      },
    };
  }

  // Set ICU to exactly 1
  db.updateHospital(hospital.id, { icuBedsAvailable: 1, lastUpdated: new Date().toISOString() });

  const initialAvailable = 1;

  // Create two emergency requests
  const emr1 = db.createEmergency({
    patientCondition: 'Severe head trauma',
    severity: 'CRITICAL',
    patientRequirements: {
      icuRequired: true, ventilatorRequired: false, emergencyBedRequired: false,
      traumaRequired: true, cardiologyRequired: false, neurologyRequired: false,
      pediatricsRequired: false, icuCount: 1,
    },
    patientLocation: { lat: 18.5300, lng: 73.8700 },
  });

  const emr2 = db.createEmergency({
    patientCondition: 'Critical respiratory failure',
    severity: 'CRITICAL',
    patientRequirements: {
      icuRequired: true, ventilatorRequired: false, emergencyBedRequired: false,
      traumaRequired: false, cardiologyRequired: false, neurologyRequired: false,
      pediatricsRequired: false, icuCount: 1,
    },
    patientLocation: { lat: 18.5400, lng: 73.8600 },
  });

  // Attempt reservation for both
  const res1 = db.attemptReservation({
    requestId: emr1.id,
    hospitalId: hospital.id,
    resourceType: 'ICU',
    quantity: 1,
  });

  const res2 = db.attemptReservation({
    requestId: emr2.id,
    hospitalId: hospital.id,
    resourceType: 'ICU',
    quantity: 1,
  });

  // Update emergency statuses
  if (res1.success) {
    db.updateEmergency(emr1.id, { status: 'RESOURCE_RESERVED', assignedHospitalId: hospital.id });
  }
  if (res2.success) {
    db.updateEmergency(emr2.id, { status: 'RESOURCE_RESERVED', assignedHospitalId: hospital.id });
  }
  if (!res2.success) {
    db.updateEmergency(emr2.id, { status: 'REJECTED' });
  }

  db.addAuditLog({
    action: 'DOUBLE_BOOKING_PREVENTED',
    actor: 'System',
    hospitalId: hospital.id,
    details: `Double-booking prevented: ICU reserved by ${emr1.requestNumber}, rejected for ${emr2.requestNumber}`,
  });

  return {
    success: true,
    result: {
      request1: { id: emr1.id, number: emr1.requestNumber, reserved: res1.success, error: res1.error },
      request2: { id: emr2.id, number: emr2.requestNumber, reserved: res2.success, error: res2.error },
      hospitalName: hospital.name,
      resourceType: 'ICU',
      initialAvailable,
    },
  };
}

// ============================================================
// Simulation Controls
// ============================================================

export function simulateStaleData(hospitalId?: string): void {
  const id = hospitalId || 'hosp-003';
  db.updateHospital(id, {
    lastUpdated: new Date(Date.now() - 600000).toISOString(), // 10 min ago
  });
  db.addAuditLog({
    action: 'SIMULATION_STALE_DATA',
    actor: 'Admin',
    hospitalId: id,
    details: 'Hospital data set to stale (10 minutes old)',
  });
}

export function simulateResourceChange(hospitalId?: string): void {
  const id = hospitalId || 'hosp-001';
  const hospital = db.getHospital(id);
  if (hospital) {
    db.updateHospital(id, {
      icuBedsAvailable: Math.max(0, hospital.icuBedsAvailable - 2),
      ventilatorsAvailable: Math.max(0, hospital.ventilatorsAvailable - 1),
    });
    db.addAuditLog({
      action: 'SIMULATION_RESOURCE_CHANGE',
      actor: 'Admin',
      hospitalId: id,
      details: `Resources reduced: ICU -2, Ventilators -1 at ${hospital.name}`,
    });
  }
}

export function simulateHospitalRejection(): {
  emergencyId: string;
  hospitalName: string;
} | null {
  const emergency = db.createEmergency({
    patientCondition: 'Multi-organ failure',
    severity: 'CRITICAL',
    patientRequirements: {
      icuRequired: true, ventilatorRequired: true, emergencyBedRequired: true,
      traumaRequired: true, cardiologyRequired: true, neurologyRequired: true,
      pediatricsRequired: false, icuCount: 1, ventilatorCount: 1, emergencyBedCount: 1,
    },
    patientLocation: { lat: 18.5220, lng: 73.8580 },
  });

  const hospital = db.getHospital('hosp-002');
  if (!hospital) return null;

  db.updateEmergency(emergency.id, {
    status: 'AWAITING_CONFIRMATION',
    assignedHospitalId: hospital.id,
    confirmationStatus: 'PENDING',
  });

  // Hospital rejects
  db.updateEmergency(emergency.id, {
    status: 'REJECTED',
    confirmationStatus: 'REJECTED',
  });
  db.addTimelineEvent(emergency.id, {
    status: 'REJECTED',
    timestamp: new Date().toISOString(),
    description: `${hospital.name} rejected the request - insufficient capacity`,
    actor: 'Hospital Staff',
  });
  db.addAuditLog({
    action: 'HOSPITAL_REJECTED',
    actor: 'Hospital Staff',
    requestId: emergency.id,
    hospitalId: hospital.id,
    details: `${hospital.name} rejected emergency ${emergency.requestNumber}`,
  });

  return { emergencyId: emergency.id, hospitalName: hospital.name };
}

export function resetDemoData(): void {
  db.reset();
  db.addAuditLog({
    action: 'DEMO_RESET',
    actor: 'Admin',
    details: 'All demo data has been reset to initial state',
  });
}
