// ============================================================
// MediRoute - In-Memory Database (Hackathon Prototype)
// ============================================================
// This module provides a clean repository/service abstraction
// with an in-memory store. Can be replaced with MongoDB/Mongoose.
// ============================================================

import {
  Hospital, EmergencyRequest, Ambulance, Reservation,
  Handover, AuditLog, User, AuthUser,
  HospitalStatus, AmbulanceStatus, EmergencyStatus,
  ReservationStatus, HandoverStatus, Severity,
  ResourceType, PatientRequirements, TimelineEvent
} from './types';

// ============================================================
// Utility
// ============================================================

let counter = 1000;
function generateId(prefix: string): string {
  counter++;
  return `${prefix}-${counter}`;
}

function generateRequestNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ER-${num}`;
}

// ============================================================
// Seed Data
// ============================================================

const SEED_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-001',
    name: 'CityCare Hospital',
    address: '123 MG Road, Pune',
    latitude: 18.5204,
    longitude: 73.8567,
    phone: '+91-20-2612-3456',
    status: 'ONLINE',
    icuBedsTotal: 10,
    icuBedsAvailable: 3,
    emergencyBedsTotal: 20,
    emergencyBedsAvailable: 8,
    generalBedsTotal: 100,
    generalBedsAvailable: 42,
    ventilatorsTotal: 8,
    ventilatorsAvailable: 4,
    hasTraumaCenter: true,
    hasCardiology: true,
    hasNeurology: true,
    hasPediatrics: false,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'hosp-002',
    name: 'Metro General Hospital',
    address: '456 FC Road, Pune',
    latitude: 18.5308,
    longitude: 73.8475,
    phone: '+91-20-2567-8901',
    status: 'ONLINE',
    icuBedsTotal: 15,
    icuBedsAvailable: 5,
    emergencyBedsTotal: 25,
    emergencyBedsAvailable: 12,
    generalBedsTotal: 150,
    generalBedsAvailable: 67,
    ventilatorsTotal: 12,
    ventilatorsAvailable: 6,
    hasTraumaCenter: true,
    hasCardiology: true,
    hasNeurology: false,
    hasPediatrics: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'hosp-003',
    name: 'LifeLine Medical Center',
    address: '789 JM Road, Pune',
    latitude: 18.5128,
    longitude: 73.8740,
    phone: '+91-20-2534-5678',
    status: 'ONLINE',
    icuBedsTotal: 8,
    icuBedsAvailable: 2,
    emergencyBedsTotal: 15,
    emergencyBedsAvailable: 5,
    generalBedsTotal: 80,
    generalBedsAvailable: 30,
    ventilatorsTotal: 6,
    ventilatorsAvailable: 2,
    hasTraumaCenter: false,
    hasCardiology: true,
    hasNeurology: true,
    hasPediatrics: true,
    lastUpdated: new Date(Date.now() - 180000).toISOString(), // 3 min ago - AGING
  },
  {
    id: 'hosp-004',
    name: 'Unity Trauma Hospital',
    address: '321 University Road, Pune',
    latitude: 18.5485,
    longitude: 73.8292,
    phone: '+91-20-2789-0123',
    status: 'ONLINE',
    icuBedsTotal: 12,
    icuBedsAvailable: 4,
    emergencyBedsTotal: 30,
    emergencyBedsAvailable: 15,
    generalBedsTotal: 120,
    generalBedsAvailable: 55,
    ventilatorsTotal: 10,
    ventilatorsAvailable: 5,
    hasTraumaCenter: true,
    hasCardiology: false,
    hasNeurology: true,
    hasPediatrics: false,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'hosp-005',
    name: 'Sahyadri Emergency Center',
    address: '654 Bund Garden Road, Pune',
    latitude: 18.5362,
    longitude: 73.8808,
    phone: '+91-20-2456-7890',
    status: 'ONLINE',
    icuBedsTotal: 6,
    icuBedsAvailable: 1,
    emergencyBedsTotal: 18,
    emergencyBedsAvailable: 7,
    generalBedsTotal: 90,
    generalBedsAvailable: 38,
    ventilatorsTotal: 5,
    ventilatorsAvailable: 1,
    hasTraumaCenter: true,
    hasCardiology: true,
    hasNeurology: false,
    hasPediatrics: true,
    lastUpdated: new Date(Date.now() - 420000).toISOString(), // 7 min ago - STALE
  },
];

const SEED_AMBULANCES: Ambulance[] = [
  {
    id: 'amb-001',
    vehicleNumber: 'MH-12-AB-1234',
    teamName: 'Alpha Response Unit',
    status: 'AVAILABLE',
    currentLocation: { lat: 18.5150, lng: 73.8500 },
    currentRequestId: null,
  },
  {
    id: 'amb-002',
    vehicleNumber: 'MH-12-CD-5678',
    teamName: 'Bravo Medical Team',
    status: 'AVAILABLE',
    currentLocation: { lat: 18.5350, lng: 73.8650 },
    currentRequestId: null,
  },
  {
    id: 'amb-003',
    vehicleNumber: 'MH-12-EF-9012',
    teamName: 'Charlie Rapid Response',
    status: 'AVAILABLE',
    currentLocation: { lat: 18.5250, lng: 73.8400 },
    currentRequestId: null,
  },
];

const SEED_USERS: AuthUser[] = [
  {
    id: 'user-001',
    name: 'Dr. Priya Sharma',
    email: 'dispatcher@mediroute.demo',
    role: 'dispatcher',
    password: 'demo123',
    avatar: '👩‍⚕️',
  },
  {
    id: 'user-002',
    name: 'Rajesh Kumar',
    email: 'ambulance@mediroute.demo',
    role: 'ambulance',
    ambulanceId: 'amb-001',
    password: 'demo123',
    avatar: '🚑',
  },
  {
    id: 'user-003',
    name: 'Dr. Anjali Patel',
    email: 'hospital@mediroute.demo',
    role: 'hospital',
    hospitalId: 'hosp-001',
    password: 'demo123',
    avatar: '🏥',
  },
  {
    id: 'user-004',
    name: 'Admin User',
    email: 'admin@mediroute.demo',
    role: 'admin',
    password: 'demo123',
    avatar: '⚙️',
  },
];

// ============================================================
// In-Memory Store (Singleton)
// ============================================================

class InMemoryDatabase {
  hospitals: Hospital[] = [];
  emergencies: EmergencyRequest[] = [];
  ambulances: Ambulance[] = [];
  reservations: Reservation[] = [];
  handovers: Handover[] = [];
  auditLogs: AuditLog[] = [];
  users: AuthUser[] = [];
  
  // Mutex for reservation locking (prevents double-booking)
  private reservationLocks: Map<string, boolean> = new Map();

  constructor() {
    this.reset();
  }

  reset() {
    this.hospitals = JSON.parse(JSON.stringify(SEED_HOSPITALS));
    this.ambulances = JSON.parse(JSON.stringify(SEED_AMBULANCES));
    this.users = JSON.parse(JSON.stringify(SEED_USERS));
    this.emergencies = [];
    this.reservations = [];
    this.handovers = [];
    this.auditLogs = [];
    this.reservationLocks = new Map();
    counter = 1000;

    // Refresh timestamps
    this.hospitals.forEach(h => {
      if (h.id !== 'hosp-003' && h.id !== 'hosp-005') {
        h.lastUpdated = new Date().toISOString();
      }
    });
  }

  // ============================================================
  // Hospital Repository
  // ============================================================

  getHospitals(): Hospital[] {
    return [...this.hospitals];
  }

  getHospital(id: string): Hospital | undefined {
    return this.hospitals.find(h => h.id === id);
  }

  updateHospital(id: string, updates: Partial<Hospital>): Hospital | undefined {
    const idx = this.hospitals.findIndex(h => h.id === id);
    if (idx === -1) return undefined;
    this.hospitals[idx] = { ...this.hospitals[idx], ...updates, lastUpdated: new Date().toISOString() };
    return this.hospitals[idx];
  }

  updateHospitalResources(id: string, resources: Partial<Hospital>): Hospital | undefined {
    const hospital = this.getHospital(id);
    if (!hospital) return undefined;
    return this.updateHospital(id, { ...resources, lastUpdated: new Date().toISOString() });
  }

  // ============================================================
  // Emergency Repository
  // ============================================================

  createEmergency(data: {
    patientCondition: string;
    severity: Severity;
    patientRequirements: PatientRequirements;
    patientLocation: { lat: number; lng: number };
  }): EmergencyRequest {
    const emergency: EmergencyRequest = {
      id: generateId('emr'),
      requestNumber: generateRequestNumber(),
      patientCondition: data.patientCondition,
      patientRequirements: data.patientRequirements,
      severity: data.severity,
      ambulanceId: null,
      status: 'CREATED',
      createdAt: new Date().toISOString(),
      assignedHospitalId: null,
      estimatedTravelTime: null,
      confirmationStatus: null,
      handoverStatus: null,
      patientLocation: data.patientLocation,
      timeline: [{
        status: 'CREATED',
        timestamp: new Date().toISOString(),
        description: 'Emergency request created',
        actor: 'System'
      }],
    };
    this.emergencies.push(emergency);
    this.addAuditLog({
      action: 'EMERGENCY_CREATED',
      actor: 'Dispatcher',
      requestId: emergency.id,
      details: `Emergency ${emergency.requestNumber} created - Severity: ${data.severity}`,
    });
    return emergency;
  }

  getEmergencies(): EmergencyRequest[] {
    return [...this.emergencies];
  }

  getEmergency(id: string): EmergencyRequest | undefined {
    return this.emergencies.find(e => e.id === id);
  }

  updateEmergency(id: string, updates: Partial<EmergencyRequest>): EmergencyRequest | undefined {
    const idx = this.emergencies.findIndex(e => e.id === id);
    if (idx === -1) return undefined;
    this.emergencies[idx] = { ...this.emergencies[idx], ...updates };
    return this.emergencies[idx];
  }

  addTimelineEvent(emergencyId: string, event: TimelineEvent): void {
    const emr = this.getEmergency(emergencyId);
    if (emr) {
      emr.timeline.push(event);
    }
  }

  // ============================================================
  // Ambulance Repository
  // ============================================================

  getAmbulances(): Ambulance[] {
    return [...this.ambulances];
  }

  getAmbulance(id: string): Ambulance | undefined {
    return this.ambulances.find(a => a.id === id);
  }

  updateAmbulance(id: string, updates: Partial<Ambulance>): Ambulance | undefined {
    const idx = this.ambulances.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    this.ambulances[idx] = { ...this.ambulances[idx], ...updates };
    return this.ambulances[idx];
  }

  getAvailableAmbulance(): Ambulance | undefined {
    return this.ambulances.find(a => a.status === 'AVAILABLE');
  }

  // ============================================================
  // Reservation Repository (with atomic locking)
  // ============================================================

  /**
   * Attempts to reserve a resource atomically.
   * Returns the reservation if successful, null if the resource is unavailable.
   * Uses a simple lock mechanism to prevent double-booking.
   */
  attemptReservation(data: {
    requestId: string;
    hospitalId: string;
    resourceType: ResourceType;
    quantity: number;
  }): { success: boolean; reservation?: Reservation; error?: string } {
    const lockKey = `${data.hospitalId}-${data.resourceType}`;
    
    // Check if resource is being modified (simple mutex)
    if (this.reservationLocks.get(lockKey)) {
      return { success: false, error: 'Resource is currently being reserved by another request. Please try again.' };
    }

    // Acquire lock
    this.reservationLocks.set(lockKey, true);

    try {
      const hospital = this.getHospital(data.hospitalId);
      if (!hospital) {
        return { success: false, error: 'Hospital not found.' };
      }

      // Check availability based on resource type
      let available = 0;
      switch (data.resourceType) {
        case 'ICU':
          available = hospital.icuBedsAvailable;
          break;
        case 'VENTILATOR':
          available = hospital.ventilatorsAvailable;
          break;
        case 'EMERGENCY_BED':
          available = hospital.emergencyBedsAvailable;
          break;
        case 'GENERAL_BED':
          available = hospital.generalBedsAvailable;
          break;
        default:
          // For facilities (TRAUMA, CARDIOLOGY, etc.), check boolean
          available = this.checkFacility(hospital, data.resourceType) ? 1 : 0;
      }

      if (available < data.quantity) {
        this.addAuditLog({
          action: 'RESERVATION_FAILED',
          actor: 'System',
          requestId: data.requestId,
          hospitalId: data.hospitalId,
          resourceType: data.resourceType,
          details: `Reservation failed: ${data.resourceType} capacity insufficient (available: ${available}, requested: ${data.quantity})`,
        });
        return {
          success: false,
          error: `${data.resourceType} capacity has already been reserved. Available: ${available}, Requested: ${data.quantity}`,
        };
      }

      // Deduct resource (atomic operation in real DB)
      switch (data.resourceType) {
        case 'ICU':
          this.updateHospital(data.hospitalId, { icuBedsAvailable: hospital.icuBedsAvailable - data.quantity });
          break;
        case 'VENTILATOR':
          this.updateHospital(data.hospitalId, { ventilatorsAvailable: hospital.ventilatorsAvailable - data.quantity });
          break;
        case 'EMERGENCY_BED':
          this.updateHospital(data.hospitalId, { emergencyBedsAvailable: hospital.emergencyBedsAvailable - data.quantity });
          break;
        case 'GENERAL_BED':
          this.updateHospital(data.hospitalId, { generalBedsAvailable: hospital.generalBedsAvailable - data.quantity });
          break;
      }

      // Create reservation
      const reservation: Reservation = {
        id: generateId('rsv'),
        requestId: data.requestId,
        hospitalId: data.hospitalId,
        resourceType: data.resourceType,
        quantity: data.quantity,
        status: 'CONFIRMED',
        reservedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
      };
      this.reservations.push(reservation);

      this.addAuditLog({
        action: 'RESOURCE_RESERVED',
        actor: 'System',
        requestId: data.requestId,
        hospitalId: data.hospitalId,
        resourceType: data.resourceType,
        details: `${data.resourceType} x${data.quantity} reserved at ${hospital.name} for ${data.requestId}`,
      });

      return { success: true, reservation };
    } finally {
      // Release lock
      this.reservationLocks.set(lockKey, false);
    }
  }

  private checkFacility(hospital: Hospital, resourceType: ResourceType): boolean {
    switch (resourceType) {
      case 'TRAUMA': return hospital.hasTraumaCenter;
      case 'CARDIOLOGY': return hospital.hasCardiology;
      case 'NEUROLOGY': return hospital.hasNeurology;
      case 'PEDIATRICS': return hospital.hasPediatrics;
      default: return false;
    }
  }

  getReservations(): Reservation[] {
    return [...this.reservations];
  }

  getReservationsByRequest(requestId: string): Reservation[] {
    return this.reservations.filter(r => r.requestId === requestId);
  }

  releaseReservation(id: string): boolean {
    const idx = this.reservations.findIndex(r => r.id === id);
    if (idx === -1) return false;
    const res = this.reservations[idx];
    res.status = 'RELEASED';

    // Return resource to hospital
    const hospital = this.getHospital(res.hospitalId);
    if (hospital) {
      switch (res.resourceType) {
        case 'ICU':
          this.updateHospital(res.hospitalId, { icuBedsAvailable: hospital.icuBedsAvailable + res.quantity });
          break;
        case 'VENTILATOR':
          this.updateHospital(res.hospitalId, { ventilatorsAvailable: hospital.ventilatorsAvailable + res.quantity });
          break;
        case 'EMERGENCY_BED':
          this.updateHospital(res.hospitalId, { emergencyBedsAvailable: hospital.emergencyBedsAvailable + res.quantity });
          break;
        case 'GENERAL_BED':
          this.updateHospital(res.hospitalId, { generalBedsAvailable: hospital.generalBedsAvailable + res.quantity });
          break;
      }
    }

    this.addAuditLog({
      action: 'RESERVATION_RELEASED',
      actor: 'System',
      requestId: res.requestId,
      hospitalId: res.hospitalId,
      resourceType: res.resourceType,
      details: `Reservation ${id} released`,
    });

    return true;
  }

  // ============================================================
  // Handover Repository
  // ============================================================

  createHandover(data: { requestId: string; ambulanceId: string; hospitalId: string }): Handover {
    const handover: Handover = {
      id: generateId('hnd'),
      requestId: data.requestId,
      ambulanceId: data.ambulanceId,
      hospitalId: data.hospitalId,
      arrivalTime: null,
      handoverStartTime: null,
      handoverCompleteTime: null,
      status: 'AMBULANCE_EN_ROUTE',
    };
    this.handovers.push(handover);
    return handover;
  }

  getHandovers(): Handover[] {
    return [...this.handovers];
  }

  getHandover(id: string): Handover | undefined {
    return this.handovers.find(h => h.id === id);
  }

  getHandoverByRequest(requestId: string): Handover | undefined {
    return this.handovers.find(h => h.requestId === requestId);
  }

  updateHandover(id: string, updates: Partial<Handover>): Handover | undefined {
    const idx = this.handovers.findIndex(h => h.id === id);
    if (idx === -1) return undefined;
    this.handovers[idx] = { ...this.handovers[idx], ...updates };
    return this.handovers[idx];
  }

  // ============================================================
  // Audit Log
  // ============================================================

  addAuditLog(data: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const log: AuditLog = {
      id: generateId('log'),
      ...data,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.push(log);
    return log;
  }

  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs].reverse(); // newest first
  }

  // ============================================================
  // User / Auth Repository
  // ============================================================

  getUsers(): User[] {
    return this.users.map(({ password, ...u }) => u as User);
  }

  authenticateUser(email: string, password: string): AuthUser | null {
    const user = this.users.find(u => u.email === email && u.password === password);
    return user || null;
  }

  getUserByRole(role: string): AuthUser | undefined {
    return this.users.find(u => u.role === role);
  }

  // ============================================================
  // Dashboard Stats
  // ============================================================

  getDashboardStats() {
    const emergencies = this.getEmergencies();
    const hospitals = this.getHospitals().filter(h => h.status === 'ONLINE');
    const ambulances = this.getAmbulances();
    
    return {
      activeEmergencies: emergencies.filter(e => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(e.status)).length,
      hospitalsOnline: hospitals.length,
      icuBedsAvailable: hospitals.reduce((sum, h) => sum + h.icuBedsAvailable, 0),
      ventilatorsAvailable: hospitals.reduce((sum, h) => sum + h.ventilatorsAvailable, 0),
      pendingConfirmations: emergencies.filter(e => e.status === 'AWAITING_CONFIRMATION').length,
      ambulancesEnRoute: ambulances.filter(a => a.status === 'EN_ROUTE').length,
      completedHandovers: this.handovers.filter(h => h.status === 'HANDOVER_COMPLETED').length,
      emergencyBeds: hospitals.reduce((sum, h) => sum + h.emergencyBedsAvailable, 0),
    };
  }
}

// Singleton instance
const globalDB = globalThis as unknown as { __mediroute_db?: InMemoryDatabase };
if (!globalDB.__mediroute_db) {
  globalDB.__mediroute_db = new InMemoryDatabase();
}
export const db: InMemoryDatabase = globalDB.__mediroute_db;
