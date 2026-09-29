'use client';

import { useEffect, useState } from 'react';
import { EmergencyRequest } from '@/lib/types';
import { Activity, AlertTriangle, Clock, MapPin, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EmergenciesPage() {
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const res = await fetch('/api/emergencies');
        if (res.ok) {
          setEmergencies(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmergencies();
    const int = setInterval(fetchEmergencies, 5000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Active Emergencies</h2>
          <p className="text-white/50 text-sm">Monitor and manage ongoing emergency requests.</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/create-emergency')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
        >
          + New Emergency
        </button>
      </div>

      <div className="clay-glass overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search emergencies..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {loading && emergencies.length === 0 ? (
          <div className="p-8 text-center text-white/50">Loading...</div>
        ) : emergencies.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/30 mb-4">
              <Activity size={32} />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No active emergencies</h3>
            <p className="text-white/50">There are currently no active emergency requests in the system.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-white/50 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Request ID</th>
                <th className="p-4 font-medium">Condition & Severity</th>
                <th className="p-4 font-medium">Requirements</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {emergencies.map((em) => (
                <tr key={em.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-4">
                    <span className="font-mono text-blue-400 font-medium">{em.requestNumber}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${em.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                      <div>
                        <div className="text-white font-medium">{em.patientCondition}</div>
                        <div className="text-xs text-white/50">{em.severity}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {em.patientRequirements.icuRequired && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">ICU</span>
                      )}
                      {em.patientRequirements.ventilatorRequired && (
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded">Ventilator</span>
                      )}
                      {!em.patientRequirements.icuRequired && !em.patientRequirements.ventilatorRequired && (
                        <span className="text-white/30 text-sm">General</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-medium">
                      {em.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-white/50 text-sm flex items-center gap-2">
                    <Clock size={14} />
                    {new Date(em.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
