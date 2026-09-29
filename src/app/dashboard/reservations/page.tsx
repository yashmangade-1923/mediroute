'use client';

import { useEffect, useState } from 'react';
import { Reservation } from '@/lib/types';
import { ClipboardList, Search, Clock } from 'lucide-react';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await fetch('/api/reservations');
        if (res.ok) {
          setReservations(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservations();
    const int = setInterval(fetchReservations, 10000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Resource Reservations</h2>
          <p className="text-white/50 text-sm">Manage locked and confirmed hospital resources.</p>
        </div>
      </div>

      <div className="clay-glass overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search reservations..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {loading && reservations.length === 0 ? (
          <div className="p-8 text-center text-white/50">Loading reservations...</div>
        ) : reservations.length === 0 ? (
          <div className="p-12 text-center text-white/50">No reservations found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-white/50 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Request ID</th>
                <th className="p-4 font-medium">Hospital ID</th>
                <th className="p-4 font-medium">Resource Type</th>
                <th className="p-4 font-medium">Quantity</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Time Reserved</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-4 font-mono text-blue-400 text-sm">{res.requestId}</td>
                  <td className="p-4 font-mono text-white/60 text-sm">{res.hospitalId}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs font-medium">
                      {res.resourceType}
                    </span>
                  </td>
                  <td className="p-4 text-white font-medium">{res.quantity}</td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      res.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                      res.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="p-4 text-white/50 text-sm flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(res.reservedAt).toLocaleTimeString()}
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
