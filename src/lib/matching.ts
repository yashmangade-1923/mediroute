// ============================================================
// MediRoute - Hospital Matching Engine
// ============================================================
// Calculates suitability scores using:
//   Resource Match = 50%
//   Travel Efficiency = 30%
//   Data Freshness = 20%
// ============================================================

import { Hospital, PatientRequirements, HospitalMatch, FreshnessLevel, ResourceType } from './types';

// ============================================================
// Constants
// ============================================================

const WEIGHTS = {
  RESOURCE_MATCH: 0.50,
  TRAVEL_EFFICIENCY: 0.30,
  DATA_FRESHNESS: 0.20,
};

// Freshness thresholds (in seconds)
const FRESHNESS_THRESHOLDS = {
  LIVE: 120,    // 0-2 minutes
  AGING: 300,   // 2-5 minutes
  // STALE: 300+   // 5+ minutes
};

// Max simulated travel time (in minutes)
const MAX_TRAVEL_TIME = 30;

// ============================================================
// Distance / Travel Time
// ============================================================

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimateTravelTime(distanceKm: number): number {
  // Assume average emergency speed of 40 km/h in city
  const timeHours = distanceKm / 40;
  return Math.max(1, Math.round(timeHours * 60)); // minutes, minimum 1
}

// ============================================================
// Freshness Calculation
// ============================================================

function calculateFreshness(lastUpdated: string): { level: FreshnessLevel; seconds: number } {
  const now = Date.now();
  const updated = new Date(lastUpdated).getTime();
  const seconds = Math.floor((now - updated) / 1000);

  let level: FreshnessLevel;
  if (seconds <= FRESHNESS_THRESHOLDS.LIVE) {
    level = 'LIVE';
  } else if (seconds <= FRESHNESS_THRESHOLDS.AGING) {
    level = 'AGING';
  } else {
    level = 'STALE';
  }

  return { level, seconds };
}

// ============================================================
// Resource Match Scoring
// ============================================================

function calculateResourceMatch(
  hospital: Hospital,
  requirements: PatientRequirements
): { score: number; matched: { resource: string; available: boolean; count?: number }[]; warnings: string[] } {
  const matched: { resource: string; available: boolean; count?: number }[] = [];
  const warnings: string[] = [];
  let totalRequired = 0;
  let totalMatched = 0;

  // ICU
  if (requirements.icuRequired) {
    totalRequired++;
    const count = requirements.icuCount || 1;
    const available = hospital.icuBedsAvailable >= count;
    matched.push({ resource: 'ICU Bed', available, count: hospital.icuBedsAvailable });
    if (available) totalMatched++;
    else warnings.push(`ICU: ${hospital.icuBedsAvailable} available, ${count} required`);
  }

  // Ventilator
  if (requirements.ventilatorRequired) {
    totalRequired++;
    const count = requirements.ventilatorCount || 1;
    const available = hospital.ventilatorsAvailable >= count;
    matched.push({ resource: 'Ventilator', available, count: hospital.ventilatorsAvailable });
    if (available) totalMatched++;
    else warnings.push(`Ventilator: ${hospital.ventilatorsAvailable} available, ${count} required`);
  }

  // Emergency Bed
  if (requirements.emergencyBedRequired) {
    totalRequired++;
    const count = requirements.emergencyBedCount || 1;
    const available = hospital.emergencyBedsAvailable >= count;
    matched.push({ resource: 'Emergency Bed', available, count: hospital.emergencyBedsAvailable });
    if (available) totalMatched++;
    else warnings.push(`Emergency Bed: ${hospital.emergencyBedsAvailable} available, ${count} required`);
  }

  // Trauma
  if (requirements.traumaRequired) {
    totalRequired++;
    const available = hospital.hasTraumaCenter;
    matched.push({ resource: 'Trauma Center', available });
    if (available) totalMatched++;
    else warnings.push('Trauma Center not available');
  }

  // Cardiology
  if (requirements.cardiologyRequired) {
    totalRequired++;
    const available = hospital.hasCardiology;
    matched.push({ resource: 'Cardiology', available });
    if (available) totalMatched++;
    else warnings.push('Cardiology not available');
  }

  // Neurology
  if (requirements.neurologyRequired) {
    totalRequired++;
    const available = hospital.hasNeurology;
    matched.push({ resource: 'Neurology', available });
    if (available) totalMatched++;
    else warnings.push('Neurology not available');
  }

  // Pediatrics
  if (requirements.pediatricsRequired) {
    totalRequired++;
    const available = hospital.hasPediatrics;
    matched.push({ resource: 'Pediatrics', available });
    if (available) totalMatched++;
    else warnings.push('Pediatrics not available');
  }

  const score = totalRequired > 0 ? (totalMatched / totalRequired) * 100 : 100;
  return { score, matched, warnings };
}

// ============================================================
// Main Matching Function
// ============================================================

export function matchHospitals(
  hospitals: Hospital[],
  requirements: PatientRequirements,
  patientLocation: { lat: number; lng: number }
): HospitalMatch[] {
  const onlineHospitals = hospitals.filter(h => h.status === 'ONLINE' || h.status === 'BUSY');
  
  const matches: HospitalMatch[] = onlineHospitals.map(hospital => {
    // 1. Resource Match (0-100)
    const resourceResult = calculateResourceMatch(hospital, requirements);
    
    // 2. Travel Time
    const distance = haversineDistance(
      patientLocation.lat, patientLocation.lng,
      hospital.latitude, hospital.longitude
    );
    const travelTimeMinutes = estimateTravelTime(distance);
    // Travel score: closer = higher (inverted, normalized to 0-100)
    const travelScore = Math.max(0, (1 - travelTimeMinutes / MAX_TRAVEL_TIME) * 100);
    
    // 3. Data Freshness
    const freshness = calculateFreshness(hospital.lastUpdated);
    let freshnessScore: number;
    switch (freshness.level) {
      case 'LIVE': freshnessScore = 100; break;
      case 'AGING': freshnessScore = 60; break;
      case 'STALE': freshnessScore = 20; break;
    }
    
    // Add stale data warning
    if (freshness.level === 'STALE') {
      resourceResult.warnings.push('⚠️ Hospital data is stale - confirmation required');
    } else if (freshness.level === 'AGING') {
      resourceResult.warnings.push('⚠️ Hospital data is aging - verify availability');
    }

    // 4. Calculate weighted overall score
    const overallScore = Math.round(
      (resourceResult.score * WEIGHTS.RESOURCE_MATCH) +
      (travelScore * WEIGHTS.TRAVEL_EFFICIENCY) +
      (freshnessScore * WEIGHTS.DATA_FRESHNESS)
    );

    return {
      hospital,
      overallScore,
      resourceMatchScore: Math.round(resourceResult.score),
      travelScore: Math.round(travelScore),
      freshnessScore: Math.round(freshnessScore),
      travelTimeMinutes,
      freshnessLevel: freshness.level,
      freshnessSeconds: freshness.seconds,
      matchedResources: resourceResult.matched,
      warnings: resourceResult.warnings,
    };
  });

  // Sort by overall score descending
  matches.sort((a, b) => b.overallScore - a.overallScore);
  return matches;
}

export { calculateFreshness, haversineDistance, estimateTravelTime };
