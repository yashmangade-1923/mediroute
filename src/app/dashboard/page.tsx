'use client';

import { useEffect, useState } from 'react';
import { 
  Activity, Building2, AlertTriangle, CheckCircle2, 
  Ambulance, ClipboardList, Clock, RefreshCw 
} from 'lucide-react';
import { DashboardStats, EmergencyRequest } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEmergencies, setRecentEmergencies] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, emergRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/emergencies')
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (emergRes.ok) {
        const data = await emergRes.json();
        setRecentEmergencies(data.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return <div className="p-8 text-center text-white/50">Loading dashboard data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">System Overview</h2>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Emergencies" value={stats?.activeEmergencies || 0} icon={<Activity />} color="red" />
        <StatCard title="Hospitals Online" value={stats?.hospitalsOnline || 0} icon={<Building2 />} color="green" />
        <StatCard title="ICU Beds Available" value={stats?.icuBedsAvailable || 0} icon={<CheckCircle2 />} color="blue" />
        <StatCard title="Pending Confirmations" value={stats?.pendingConfirmations || 0} icon={<AlertTriangle />} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 clay-glass p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <ClipboardList size={20} className="text-blue-400" />
            Recent Emergencies
          </h3>
          <div className="space-y-4">
            {recentEmergencies.length === 0 ? (
              <p className="text-white/50">No recent emergencies.</p>
            ) : (
              recentEmergencies.map(em => (
                <div key={em.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition cursor-pointer" onClick={() => router.push('/dashboard/emergencies')}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${em.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{em.requestNumber}</h4>
                      <p className="text-sm text-white/50">{em.patientCondition}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-medium">
                      {em.status.replace(/_/g, ' ')}
                    </span>
                    <p className="text-xs text-white/40 mt-2">{new Date(em.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="clay-glass p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={20} className="text-green-400" />
            Resource Availability
          </h3>
          <div className="space-y-6">
            <ResourceBar label="ICU Beds" available={stats?.icuBedsAvailable || 0} total={(stats?.icuBedsAvailable || 0) + 15} color="bg-blue-500" />
            <ResourceBar label="Ventilators" available={stats?.ventilatorsAvailable || 0} total={(stats?.ventilatorsAvailable || 0) + 20} color="bg-purple-500" />
            <ResourceBar label="Emergency Beds" available={stats?.emergencyBeds || 0} total={(stats?.emergencyBeds || 0) + 30} color="bg-green-500" />
            
            <div className="pt-4 mt-4 border-t border-white/10">
              <h4 className="text-sm font-medium text-white/60 mb-3">Fleet Status</h4>
              <div className="flex items-center gap-3">
                <Ambulance className="text-blue-400" />
                <span className="text-white">{stats?.ambulancesEnRoute || 0} Ambulances En Route</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  const colorMap: Record<string, string> = {
    red: 'text-red-400 bg-red-400/10 border-red-400/20',
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  };
  return (
    <div className={`clay-glass p-6 border-none flex flex-col`}>
      <div className={`flex items-center gap-3 mb-2 opacity-80 ${colorMap[color].split(' ')[0]}`}>
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <span className={`text-3xl font-bold mt-auto ${colorMap[color].split(' ')[0]}`}>{value}</span>
    </div>
  );
}

function ResourceBar({ label, available, total, color }: { label: string, available: number, total: number, color: string }) {
  const percentage = total > 0 ? (available / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white/80">{label}</span>
        <span className="text-white font-medium">{available} / {total}</span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
