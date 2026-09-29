'use client';

import { useEffect, useState } from 'react';
import { Handover } from '@/lib/types';
import { HandMetal, Search, Clock, ArrowRight } from 'lucide-react';

export default function HandoverPage() {
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHandovers = async () => {
      try {
        const res = await fetch('/api/handover');
        if (res.ok) {
          setHandovers(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHandovers();
    const int = setInterval(fetchHandovers, 10000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Patient Handover</h2>
          <p className="text-white/50 text-sm">Monitor patient transfers from ambulance to hospital.</p>
        </div>
      </div>

      <div className="clay-glass overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search handovers..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {loading && handovers.length === 0 ? (
          <div className="p-8 text-center text-white/50">Loading handovers...</div>
        ) : handovers.length === 0 ? (
          <div className="p-12 text-center text-white/50">No handovers found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-white/50 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Request ID</th>
                <th className="p-4 font-medium">Ambulance -&gt; Hospital</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Arrival Time</th>
                <th className="p-4 font-medium">Handover Complete</th>
              </tr>
            </thead>
            <tbody>
              {handovers.map((hand) => (
                <tr key={hand.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-4 font-mono text-blue-400 text-sm font-medium">{hand.requestId}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-white">
                      <span className="font-mono text-sm">{hand.ambulanceId}</span>
                      <ArrowRight size={14} className="text-white/40" />
                      <span className="font-mono text-sm">{hand.hospitalId}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      hand.status === 'HANDOVER_COMPLETED' ? 'bg-green-500/20 text-green-400' :
                      hand.status === 'HANDOVER_STARTED' ? 'bg-blue-500/20 text-blue-400' :
                      hand.status === 'ARRIVED' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {hand.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-white/60 text-sm">
                    {hand.arrivalTime ? new Date(hand.arrivalTime).toLocaleTimeString() : '-'}
                  </td>
                  <td className="p-4 text-white/60 text-sm">
                    {hand.handoverCompleteTime ? new Date(hand.handoverCompleteTime).toLocaleTimeString() : '-'}
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
