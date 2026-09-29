import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const hospital = db.getHospital(id);
  if (!hospital) {
    return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
  }
  return NextResponse.json(hospital);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const hospital = db.updateHospitalResources(id, body);
  if (!hospital) {
    return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
  }
  db.addAuditLog({
    action: 'HOSPITAL_RESOURCES_UPDATED',
    actor: 'Hospital Staff',
    hospitalId: id,
    details: `Resources updated for ${hospital.name}`,
  });
  return NextResponse.json(hospital);
}
