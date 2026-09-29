// ============================================================
// MediRoute - Core Type Definitions
// ============================================================

export type UserRole = 'dispatcher' | 'ambulance' | 'hospital' | 'admin';

export type EmergencyStatus =
  | 'CREATED'
  | 'MATCHING'
  | 'AWAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'RESOURCE_RESERVED'
  | 'AMBULANCE_ASSIGNED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'HANDOVER_IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AmbulanceStatus = 'AVAILABLE' | 'ASSIGNED' | 'EN_ROUTE' | 'AT_HOSPITAL' | 'RETURNING' | 'OFFLINE';

export type HospitalStatus = 'ONLINE' | 'BUSY' | 'OFFLINE' | 'DIVERTING';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'RELEASED' | 'REJECTED';

export type HandoverStatus = 'AMBULANCE_EN_ROUTE' | 'ARRIVED' | 'HOSPITAL_READY' | 'HANDOVER_STARTED' | 'HANDOVER_COMPLETED';

export type FreshnessLevel = 'LIVE' | 'AGING' | 'STALE';

export type ResourceType = 'ICU' | 'VENTILATOR' | 'EMERGENCY_BED' | 'GENERAL_BED' | 'TRAUMA' | 'CARDIOLOGY' | 'NEUROLOGY' | 'PEDIATRICS';

// ============================================================
// Database Models
// ============================================================

export interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  status: HospitalStatus;
  icuBedsTotal: number;
  icuBedsAvailable: number;
  emergencyBedsTotal: number;
  emergencyBedsAvailable: number;
  generalBedsTotal: number;
  generalBedsAvailable: number;
  ventilatorsTotal: number;
  ventilatorsAvailable: number;
  hasTraumaCenter: boolean;
  hasCardiology: boolean;
  hasNeurology: boolean;
  hasPediatrics: boolean;
  lastUpdated: string; // ISO timestamp
}

export interface PatientRequirements {
  icuRequired: boolean;
  ventilatorRequired: boolean;
  emergencyBedRequired: boolean;
  traumaRequired: boolean;
  cardiologyRequired: boolean;
  neurologyRequired: boolean;
  pediatricsRequired: boolean;
  icuCount?: number;
  ventilatorCount?: number;
  emergencyBedCount?: number;
}

export interface EmergencyRequest {
  id: string;
  requestNumber: string;
  patientCondition: string;
  patientRequirements: PatientRequirements;
  severity: Severity;
  ambulanceId: string | null;
  status: EmergencyStatus;
  createdAt: string;
  assignedHospitalId: string | null;
  estimatedTravelTime: number | null; // minutes
  confirmationStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;
  handoverStatus: HandoverStatus | null;
  patientLocation: { lat: number; lng: number };
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  status: EmergencyStatus | HandoverStatus | string;
  timestamp: string;
  description: string;
  actor?: string;
}

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  teamName: string;
  status: AmbulanceStatus;
  currentLocation: { lat: number; lng: number };
  currentRequestId: string | null;
}

export interface Reservation {
  id: string;
  requestId: string;
  hospitalId: string;
  resourceType: ResourceType;
  quantity: number;
  status: ReservationStatus;
  reservedAt: string;
  expiresAt: string;
}

export interface Handover {
  id: string;
  requestId: string;
  ambulanceId: string;
  hospitalId: string;
  arrivalTime: string | null;
  handoverStartTime: string | null;
  handoverCompleteTime: string | null;
  status: HandoverStatus;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hospitalId?: string;
  ambulanceId?: string;
  avatar?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  requestId?: string;
  hospitalId?: string;
  resourceType?: string;
  timestamp: string;
  details: string;
}

// ============================================================
// Matching / Ranking
// ============================================================

export interface HospitalMatch {
  hospital: Hospital;
  overallScore: number;
  resourceMatchScore: number;
  travelScore: number;
  freshnessScore: number;
  travelTimeMinutes: number;
  freshnessLevel: FreshnessLevel;
  freshnessSeconds: number;
  matchedResources: { resource: string; available: boolean; count?: number }[];
  warnings: string[];
}

// ============================================================
// Dashboard Stats
// ============================================================

export interface DashboardStats {
  activeEmergencies: number;
  hospitalsOnline: number;
  icuBedsAvailable: number;
  ventilatorsAvailable: number;
  pendingConfirmations: number;
  ambulancesEnRoute: number;
  completedHandovers: number;
  emergencyBeds: number;
}

// ============================================================
// Simulation
// ============================================================

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// ============================================================
// Auth
// ============================================================

export interface AuthUser extends User {
  password?: string; // demo only
}
