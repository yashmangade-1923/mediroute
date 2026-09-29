'use client';

import { useEffect, useState } from 'react';
import { AuditLog } from '@/lib/types';
import { Database, Search, Clock, FileText } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/audit-logs');
        if (res.ok) {
          setLogs(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
    const int = setInterval(fetchLogs, 10000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">System Audit Logs</h2>
          <p className="text-white/50 text-sm">View system events, actions, and security logs.</p>
        </div>
      </div>

      <div className="clay-glass overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {loading && logs.length === 0 ? (
          <div className="p-8 text-center text-white/50">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-white/50">No logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Timestamp</th>
                  <th className="p-4 font-medium">Action</th>
                  <th className="p-4 font-medium">Actor</th>
                  <th className="p-4 font-medium">Details</th>
                  <th className="p-4 font-medium">References</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="p-4 text-white/60 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-white font-medium">{log.actor}</td>
                    <td className="p-4 text-white/80 text-sm">{log.details}</td>
                    <td className="p-4 text-white/50 text-xs font-mono">
                      <div className="flex flex-col gap-1">
                        {log.requestId && <span>Req: {log.requestId}</span>}
                        {log.hospitalId && <span>Hosp: {log.hospitalId}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
