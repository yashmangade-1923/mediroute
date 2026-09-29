import { NextResponse } from 'next/server';
import {
  runDemoScenario,
  runDoubleBookingDemo,
  simulateStaleData,
  simulateResourceChange,
  simulateHospitalRejection,
  resetDemoData,
} from '@/lib/simulation';

export async function POST(request: Request) {
  const body = await request.json();
  const { scenario } = body;

  switch (scenario) {
    case 'demo': {
      const result = await runDemoScenario();
      return NextResponse.json(result);
    }
    case 'double-booking': {
      const result = runDoubleBookingDemo();
      return NextResponse.json(result);
    }
    case 'stale-data': {
      simulateStaleData(body.hospitalId);
      return NextResponse.json({ success: true, message: 'Hospital data set to stale' });
    }
    case 'resource-change': {
      simulateResourceChange(body.hospitalId);
      return NextResponse.json({ success: true, message: 'Hospital resources changed' });
    }
    case 'hospital-rejection': {
      const result = simulateHospitalRejection();
      return NextResponse.json({ success: true, result });
    }
    case 'reset': {
      resetDemoData();
      return NextResponse.json({ success: true, message: 'Demo data reset' });
    }
    default:
      return NextResponse.json({ error: 'Unknown scenario' }, { status: 400 });
  }
}
