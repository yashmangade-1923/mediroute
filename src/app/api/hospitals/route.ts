// API: GET /api/hospitals, POST /api/hospitals/:id/resources
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  const hospitals = db.getHospitals();
  return NextResponse.json(hospitals);
}
