'use client';

import { useEffect, useState } from 'react';
import { Ambulance, Hospital } from '@/lib/types';
import { Ambulance as AmbulanceIcon, MapPin, Search } from 'lucide-react';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('./LiveMap'), { ssr: false });


export default function AmbulancesPage() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ambRes, hospRes] = await Promise.all([
          fetch('/api/ambulances'),
          fetch('/api/hospitals')
        ]);
        if (ambRes.ok) setAmbulances(await ambRes.json());
        if (hospRes.ok) setHospitals(await hospRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const int = setInterval(fetchData, 10000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Ambulance Fleet</h2>
          <p className="text-white/50 text-sm">Monitor ambulance statuses and locations.</p>
        </div>
      </div>

      <div className="clay-glass overflow-hidden flex-1 flex flex-col min-h-0">
        <LiveMap ambulances={ambulances} hospitals={hospitals} />
        
        <div className="p-4 border-b border-white/10 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search ambulances by team, vehicle, or status..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        <div className="overflow-auto">
          {loading && ambulances.length === 0 ? (
          <div className="p-8 text-center text-white/50">Loading ambulances...</div>
        ) : ambulances.length === 0 ? (
          <div className="p-12 text-center text-white/50">No ambulances found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-white/50 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Vehicle</th>
                <th className="p-4 font-medium">Team Name</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium">Current Request</th>
              </tr>
            </thead>
            <tbody>
              {ambulances
                .filter(amb => 
                  amb.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  amb.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  amb.status.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((amb) => (
                <tr key={amb.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <AmbulanceIcon size={16} />
                      </div>
                      <span className="font-mono text-white font-medium">{amb.vehicleNumber}</span>
                    </div>
                  </td>
                  <td className="p-4 text-white/80">{amb.teamName}</td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      amb.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' :
                      amb.status === 'EN_ROUTE' ? 'bg-blue-500/20 text-blue-400' :
                      amb.status === 'ASSIGNED' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {amb.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-white/50 text-sm flex items-center gap-1">
                    <MapPin size={14} />
                    {amb.currentLocation.lat.toFixed(4)}, {amb.currentLocation.lng.toFixed(4)}
                  </td>
                  <td className="p-4 text-white/50 text-sm font-mono">
                    {amb.currentRequestId || 'None'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      </div>
    </div>
  );
}
