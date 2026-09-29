'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Heart, LayoutDashboard, AlertTriangle, Building2, Ambulance,
  PlusCircle, BarChart3, ClipboardList, HandMetal, Settings,
  Shield, Database, Users, Radio, LogOut, Menu, X, Bell
} from 'lucide-react';

const navItems = [
  { section: 'OPERATIONS' },
  { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { href: '/dashboard/create-emergency', icon: <PlusCircle size={18} />, label: 'Create Emergency' },
  { href: '/dashboard/emergencies', icon: <AlertTriangle size={18} />, label: 'Active Emergencies' },
  { href: '/dashboard/hospitals', icon: <Building2 size={18} />, label: 'Hospitals' },
  { href: '/dashboard/ambulances', icon: <Ambulance size={18} />, label: 'Ambulances' },
  { section: 'MANAGEMENT' },
  { href: '/dashboard/reservations', icon: <ClipboardList size={18} />, label: 'Reservations' },
  { href: '/dashboard/handover', icon: <HandMetal size={18} />, label: 'Handover' },
  { href: '/dashboard/audit-logs', icon: <Database size={18} />, label: 'Audit Logs' },
  { section: 'SYSTEM' },
  { href: '/dashboard/admin', icon: <Settings size={18} />, label: 'Admin Simulation' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 45, display: 'none',
          }}
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className="sidebar" style={{ overflowY: 'auto' }}>
        <div className="sidebar-logo">
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
          }}>
            <Heart size={18} style={{ color: 'white' }} />
          </div>
          <span style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>
            MEDI<span style={{ color: 'var(--navy-500)' }}>ROUTE</span>
          </span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if ('section' in item && item.section) {
              return (
                <div key={i} className="nav-section-title">
                  {item.section}
                </div>
              );
            }
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname?.startsWith(item.href || ''));
            return (
              <button
                key={i}
                onClick={() => router.push(item.href || '/dashboard')}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', fontFamily: 'inherit' }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid rgba(0,0,0,0.05)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 10,
            background: 'var(--bg-card)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(37,99,235,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>
              👩‍⚕️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Dr. Priya Sharma</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Dispatcher</div>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="nav-item"
            style={{
              width: '100%', marginTop: 8, background: 'none', border: 'none',
              textAlign: 'left', fontFamily: 'inherit',
            }}
          >
            <LogOut size={18} />
            <span>Exit Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display: 'none', background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--text-primary)',
              }}
              className="mobile-menu-btn"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                {getPageTitle(pathname)}
              </h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Prototype · Simulated Data
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              background: '#dcfce7', color: '#16a34a',
              fontSize: 12, fontWeight: 600,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 6px #22c55e',
              }}
              className="animate-pulse-live"
              />
              System Online
            </div>
            <button style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
              position: 'relative',
            }}>
              <Bell size={18} />
              <div style={{
                position: 'absolute', top: 6, right: 6,
                width: 8, height: 8, borderRadius: '50%',
                background: '#ef4444', border: '2px solid white',
              }} />
            </button>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}

function getPageTitle(pathname: string | null): string {
  if (!pathname) return 'Dashboard';
  const map: Record<string, string> = {
    '/dashboard': 'Dispatcher Dashboard',
    '/dashboard/create-emergency': 'Create Emergency Request',
    '/dashboard/emergencies': 'Active Emergencies',
    '/dashboard/hospitals': 'Hospital Network',
    '/dashboard/ambulances': 'Ambulance Fleet',
    '/dashboard/reservations': 'Resource Reservations',
    '/dashboard/handover': 'Patient Handover',
    '/dashboard/audit-logs': 'Audit Logs',
    '/dashboard/admin': 'Admin Simulation Panel',
  };
  return map[pathname] || 'Dashboard';
}
