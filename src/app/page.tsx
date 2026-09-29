'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, Shield, Clock, Zap, ArrowRight, Heart, Building2,
  Ambulance, Lock, CheckCircle2, BarChart3, Users, Radio, Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ hospitals: 5, ambulances: 3, handovers: 0, emergencies: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/dashboard').then(r => r.json()).then(data => {
      setStats({
        hospitals: data.hospitalsOnline || 5,
        ambulances: 3,
        handovers: data.completedHandovers || 0,
        emergencies: data.activeEmergencies || 0,
      });
    }).catch(() => {});
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left - rect.width / 2) / 30,
      y: (e.clientY - rect.top - rect.height / 2) / 30,
    });
  };

  const features = [
    {
      icon: <Activity size={24} />,
      title: 'Smart Hospital Matching',
      desc: 'AI-powered scoring ranks hospitals by resource compatibility, travel time, and data freshness.',
      color: '#2563eb',
    },
    {
      icon: <Lock size={24} />,
      title: 'Safe Resource Reservation',
      desc: 'Atomic locking prevents double-booking with server-side validation and conflict resolution.',
      color: '#dc2626',
    },
    {
      icon: <Clock size={24} />,
      title: 'Real-Time Data Freshness',
      desc: 'Live, aging, and stale indicators ensure decisions are based on current hospital capacity.',
      color: '#f59e0b',
    },
    {
      icon: <Zap size={24} />,
      title: 'End-to-End Handover',
      desc: 'Complete tracking from emergency creation through ambulance dispatch to patient handover.',
      color: '#22c55e',
    },
  ];

  const roles = [
    { icon: <Radio size={20} />, name: 'Dispatcher', desc: 'Central control hub', email: 'dispatcher@mediroute.demo' },
    { icon: <Ambulance size={20} />, name: 'Ambulance', desc: 'Field response team', email: 'ambulance@mediroute.demo' },
    { icon: <Building2 size={20} />, name: 'Hospital', desc: 'Resource management', email: 'hospital@mediroute.demo' },
    { icon: <Users size={20} />, name: 'Admin', desc: 'System simulation', email: 'admin@mediroute.demo' },
  ];

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', position: 'relative' }}>
      {/* ============ HERO SECTION ============ */}
      <section
        onMouseMove={handleMouseMove}
        style={{
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Background Grid */}
        <div className="hero-bg-grid" />
        
        {/* Animated Blobs */}
        <div className="hero-blob-1" />
        <div className="hero-blob-2" />

        {/* Floating 3D Shapes */}
        <div style={{
          position: 'absolute', top: '15%', left: '8%',
          width: 60, height: 60, borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(37,99,235,0.1))',
          border: '1px solid rgba(37,99,235,0.2)',
          animation: 'float 5s ease-in-out infinite',
          transform: 'rotate(15deg)',
        }} />
        <div style={{
          position: 'absolute', top: '25%', right: '12%',
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.1))',
          border: '1px solid rgba(239,68,68,0.2)',
          animation: 'float 7s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '20%',
          width: 50, height: 50, borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(34,197,94,0.1))',
          border: '1px solid rgba(34,197,94,0.2)',
          animation: 'float 6s ease-in-out infinite',
          transform: 'rotate(-20deg)',
        }} />

        {/* Orbiting elements */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 0, height: 0,
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: 'rgba(96,165,250,0.6)',
            animation: 'orbit 15s linear infinite',
            position: 'absolute',
          }} />
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'rgba(248,113,113,0.6)',
            animation: 'orbit-reverse 12s linear infinite',
            position: 'absolute',
          }} />
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 900, padding: '0 24px' }}>
          {/* Logo badge */}
          <div
            className={mounted ? 'animate-slide-up' : ''}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 20px', borderRadius: 50,
              background: 'rgba(37,99,235,0.15)',
              border: '1px solid rgba(37,99,235,0.25)',
              marginBottom: 32, opacity: mounted ? 1 : 0,
            }}
          >
            <Sparkles size={16} style={{ color: 'var(--navy-500)' }} />
            <span style={{ color: 'var(--navy-600)', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>
              HACKATHON PROTOTYPE — SIMULATED DATA
            </span>
          </div>

          {/* 3D Animated Logo */}
          <div
            className={mounted ? 'animate-slide-up stagger-1' : ''}
            style={{
              perspective: 1200,
              marginBottom: 20,
              opacity: mounted ? 1 : 0,
            }}
          >
            <div style={{
              transform: `rotateY(${mousePos.x * 0.5}deg) rotateX(${-mousePos.y * 0.5}deg)`,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.1s ease-out',
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 16,
                marginBottom: 8,
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
                  transform: 'translateZ(30px)',
                }}>
                  <Heart size={32} style={{ color: 'var(--text-primary)' }} className="animate-heartbeat" />
                </div>
                <h1 style={{
                  fontSize: 56, fontWeight: 900, color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  transform: 'translateZ(20px)',
                }}>
                  MEDI<span style={{ color: 'var(--navy-500)' }}>ROUTE</span>
                </h1>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <p
            className={mounted ? 'animate-slide-up stagger-2' : ''}
            style={{
              fontSize: 20, color: 'var(--text-muted)',
              maxWidth: 650, margin: '0 auto 16px',
              lineHeight: 1.7, fontWeight: 400,
              opacity: mounted ? 1 : 0,
            }}
          >
            Connecting Emergency Transport with Verified Hospital Capacity
          </p>

          <p
            className={mounted ? 'animate-slide-up stagger-3' : ''}
            style={{
              fontSize: 15, color: 'var(--text-muted)',
              maxWidth: 500, margin: '0 auto 40px',
              lineHeight: 1.6,
              opacity: mounted ? 1 : 0,
            }}
          >
            Real-time coordination · Resource-aware matching · Safe reservation · Seamless handover
          </p>

          {/* CTA */}
          <div
            className={mounted ? 'animate-slide-up stagger-4' : ''}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', opacity: mounted ? 1 : 0 }}
          >
            <button
              onClick={() => router.push('/dashboard')}
              className="btn btn-primary btn-lg"
              style={{
                fontSize: 16, padding: '16px 36px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
              }}
            >
              Launch Dashboard <ArrowRight size={18} />
            </button>
            <button
              onClick={() => router.push('/dashboard/admin')}
              className="btn btn-lg"
              style={{
                background: 'rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.1)',
                color: 'var(--text-primary)',
                padding: '16px 36px',
              }}
            >
              Run Demo Scenario
            </button>
          </div>

          {/* Live Stats */}
          <div
            className={mounted ? 'animate-slide-up stagger-5' : ''}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 20, marginTop: 64,
              opacity: mounted ? 1 : 0,
            }}
          >
            {[
              { value: stats.hospitals, label: 'Hospitals Online', icon: <Building2 size={18} />, color: '#22c55e' },
              { value: stats.ambulances, label: 'Active Ambulances', icon: <Ambulance size={18} />, color: '#3b82f6' },
              { value: stats.emergencies, label: 'Active Emergencies', icon: <Activity size={18} />, color: '#ef4444' },
              { value: stats.handovers, label: 'Completed Today', icon: <CheckCircle2 size={18} />, color: '#a855f7' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 14, padding: '20px 16px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ color: stat.color, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DEMO CREDENTIALS ============ */}
      <section style={{ padding: '80px 24px', position: 'relative' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy-500)', letterSpacing: '0.1em', marginBottom: 12 }}>
              DEMO ACCESS
            </p>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
              Role-Based Dashboards
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
              Password: <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 10px', borderRadius: 6 }}>demo123</code> for all accounts
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {roles.map((role, i) => (
              <button
                key={i}
                onClick={() => router.push('/dashboard')}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 14, padding: 24,
                  textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(37,99,235,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px', color: 'var(--navy-500)',
                }}>
                  {role.icon}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{role.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{role.desc}</div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{role.email}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section style={{ padding: '100px 24px', position: 'relative' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy-500)', letterSpacing: '0.1em', marginBottom: 12 }}>
              CORE CAPABILITIES
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
              Beyond Simple Hospital Lookup
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 550, margin: '0 auto' }}>
              MediRoute evaluates every hospital on resource match, travel efficiency, and data freshness — not just proximity.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            {features.map((feature, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 16, padding: 28,
                  transition: 'all 0.4s ease',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${feature.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, color: feature.color,
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WORKFLOW SECTION ============ */}
      <section style={{ padding: '80px 24px', position: 'relative' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy-500)', letterSpacing: '0.1em', marginBottom: 12 }}>
              EMERGENCY WORKFLOW
            </p>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
              Complete End-to-End Pipeline
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { step: '01', title: 'Emergency Request', desc: 'Dispatcher creates request with patient requirements', color: '#ef4444' },
              { step: '02', title: 'Hospital Matching', desc: 'Engine evaluates and ranks all hospitals', color: '#f59e0b' },
              { step: '03', title: 'Confirmation', desc: 'Selected hospital accepts the request', color: '#3b82f6' },
              { step: '04', title: 'Resource Reservation', desc: 'ICU bed / ventilator reserved atomically', color: '#8b5cf6' },
              { step: '05', title: 'Ambulance Dispatch', desc: 'Nearest ambulance assigned and en route', color: '#06b6d4' },
              { step: '06', title: 'Patient Handover', desc: 'Safe transfer from ambulance to hospital care', color: '#22c55e' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', position: 'relative' }}>
                {/* Timeline line */}
                {i < 5 && (
                  <div style={{
                    position: 'absolute', left: 23, top: 48, width: 2, height: 'calc(100% - 20px)',
                    background: `linear-gradient(to bottom, ${item.color}40, ${features[Math.min(i+1, 3)]?.color || '#22c55e'}40)`,
                  }} />
                )}
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${item.color}20`, border: `2px solid ${item.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: item.color,
                  flexShrink: 0, zIndex: 1,
                }}>
                  {item.step}
                </div>
                <div style={{ paddingBottom: 36 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={{
        padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <Heart size={16} style={{ color: '#ef4444' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>
            MEDIROUTE
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          Hackathon Prototype · Simulated Data Only · Not Connected to Real Hospitals
        </p>
      </footer>
    </div>
  );
}
