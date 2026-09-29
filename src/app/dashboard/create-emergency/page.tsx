'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, ShieldAlert, Send } from 'lucide-react';

export default function CreateEmergencyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientCondition: '',
    severity: 'HIGH',
    icuRequired: false,
    ventilatorRequired: false,
    traumaRequired: false,
    cardiologyRequired: false,
    neurologyRequired: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/emergencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientCondition: formData.patientCondition,
          severity: formData.severity,
          patientRequirements: {
            icuRequired: formData.icuRequired,
            ventilatorRequired: formData.ventilatorRequired,
            emergencyBedRequired: true,
            traumaRequired: formData.traumaRequired,
            cardiologyRequired: formData.cardiologyRequired,
            neurologyRequired: formData.neurologyRequired,
            pediatricsRequired: false,
          },
          patientLocation: { lat: 18.5204, lng: 73.8567 }, // Pune coords for demo
        }),
      });

      if (res.ok) {
        router.push('/dashboard/emergencies');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Create Emergency Request</h2>
        <p className="text-white/50 text-sm">Dispatch an emergency and find the best matching hospital.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="clay-glass p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Activity size={18} className="text-blue-400" />
            Patient Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Patient Condition / Notes</label>
              <textarea 
                required
                value={formData.patientCondition}
                onChange={e => setFormData({...formData, patientCondition: e.target.value})}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition"
                rows={3}
                placeholder="Describe the patient's condition, e.g., 'Severe chest pain, suspected myocardial infarction'"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Severity Level</label>
              <div className="flex gap-4">
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
                  <label key={level} className={`flex-1 flex justify-center items-center gap-2 p-3 rounded-lg border cursor-pointer transition ${
                    formData.severity === level 
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                      : 'bg-black/20 border-white/10 text-white/50 hover:bg-white/5'
                  }`}>
                    <input 
                      type="radio" 
                      name="severity" 
                      value={level} 
                      checked={formData.severity === level}
                      onChange={e => setFormData({...formData, severity: e.target.value})}
                      className="hidden" 
                    />
                    <ShieldAlert size={16} />
                    <span className="font-medium">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="clay-glass p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Activity size={18} className="text-purple-400" />
            Resource Requirements
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'icuRequired', label: 'ICU Bed' },
              { id: 'ventilatorRequired', label: 'Ventilator' },
              { id: 'traumaRequired', label: 'Trauma Center' },
              { id: 'cardiologyRequired', label: 'Cardiology' },
              { id: 'neurologyRequired', label: 'Neurology' },
            ].map(req => (
              <label key={req.id} className="flex items-center gap-3 p-4 bg-black/20 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition">
                <input 
                  type="checkbox" 
                  checked={formData[req.id as keyof typeof formData] as boolean}
                  onChange={e => setFormData({...formData, [req.id]: e.target.checked})}
                  className="w-5 h-5 rounded border-white/20 bg-black/50 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-white/80 font-medium">{req.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-medium transition"
          >
            {loading ? 'Processing...' : 'Find Hospital & Dispatch'}
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
