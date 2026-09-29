'use client';

import { useState } from 'react';
import { Play, Settings, AlertTriangle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const runSimulation = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger_cardiac_arrest' }),
      });
      if (res.ok) {
        setMessage('Simulation triggered successfully! A cardiac arrest emergency has been created.');
        setTimeout(() => {
          router.push('/dashboard/emergencies');
        }, 2000);
      } else {
        setMessage('Failed to trigger simulation.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error running simulation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Admin Simulation Panel</h2>
        <p className="text-white/50 text-sm">Control the environment and test scenarios.</p>
      </div>

      <div className="clay-glass p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center shrink-0">
            <Settings size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-2">Scenario: Cardiac Arrest & ICU Requirement</h3>
            <p className="text-white/50 text-sm mb-4">
              This will simulate an emergency request for a patient suffering from cardiac arrest. 
              The system will automatically search for hospitals with Cardiology departments, available ICU beds, and ventilators.
            </p>
            <button 
              onClick={runSimulation}
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-medium transition"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />}
              {loading ? 'Running...' : 'Run Scenario'}
            </button>
            {message && <p className="mt-4 text-green-400 text-sm font-medium">{message}</p>}
          </div>
        </div>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="text-red-400" size={20} />
          <h3 className="text-lg font-medium text-red-400">System Reset</h3>
        </div>
        <p className="text-white/50 text-sm mb-4">
          Clear all active emergencies, release all reservations, and restore hospital capacities to default values.
        </p>
        <button className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 px-5 py-2.5 rounded-lg font-medium transition">
          Reset Environment
        </button>
      </div>
    </div>
  );
}
