'use client';

import { useEffect, useState } from 'react';
import { Hospital } from '@/lib/types';
import { Building2, Search, Activity, Phone, MapPin } from 'lucide-react';

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch('/api/hospitals');
        if (res.ok) {
          setHospitals(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHospitals();
    const int = setInterval(fetchHospitals, 10000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Hospital Network</h2>
          <p className="text-white/50 text-sm">Monitor hospital availability and resource capacity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && hospitals.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-white/50">Loading hospitals...</div>
        ) : (
          hospitals.map((hospital) => (
            <div key={hospital.id} className="clay-glass overflow-hidden hover:bg-white/10 transition group">
              <div className="p-5 border-b border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    hospital.status === 'ONLINE' ? 'bg-green-500/20 text-green-400' :
                    hospital.status === 'BUSY' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {hospital.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{hospital.name}</h3>
                <div className="flex items-center text-sm text-white/40 mb-1">
                  <MapPin size={14} className="mr-1" />
                  {hospital.address}
                </div>
                <div className="flex items-center text-sm text-white/40">
                  <Phone size={14} className="mr-1" />
                  {hospital.phone}
                </div>
              </div>
              
              <div className="p-5 bg-black/20">
                <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-4">Resource Availability</h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/80">ICU Beds</span>
                      <span className="text-white font-medium">{hospital.icuBedsAvailable} / {hospital.icuBedsTotal}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${hospital.icuBedsAvailable > 0 ? 'bg-blue-500' : 'bg-red-500'}`} 
                        style={{ width: `${(hospital.icuBedsAvailable / hospital.icuBedsTotal) * 100}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/80">Ventilators</span>
                      <span className="text-white font-medium">{hospital.ventilatorsAvailable} / {hospital.ventilatorsTotal}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${hospital.ventilatorsAvailable > 0 ? 'bg-purple-500' : 'bg-red-500'}`} 
                        style={{ width: `${(hospital.ventilatorsAvailable / hospital.ventilatorsTotal) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-5">
                  {hospital.hasTraumaCenter && <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded">Trauma</span>}
                  {hospital.hasCardiology && <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded">Cardio</span>}
                  {hospital.hasNeurology && <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded">Neuro</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
