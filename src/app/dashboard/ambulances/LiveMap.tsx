'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Ambulance, Hospital } from '@/lib/types';

// Custom icons to avoid Leaflet default image broken URL issues in Next.js
const userIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="width: 20px; height: 20px; background-color: #ef4444; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(239,68,68,0.8);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const getAmbulanceIcon = (status: string) => {
  let color = '#94a3b8'; // default gray
  if (status === 'AVAILABLE') color = '#4ade80'; // green
  if (status === 'EN_ROUTE') color = '#60a5fa'; // blue
  if (status === 'ASSIGNED') color = '#c084fc'; // purple

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="width: 24px; height: 24px; background-color: ${color}; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px ${color}; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: black;">🚑</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const getHospitalIcon = (status: string) => {
  let color = '#94a3b8'; 
  if (status === 'ONLINE') color = '#22c55e'; // green
  if (status === 'BUSY') color = '#eab308'; // yellow
  if (status === 'FULL') color = '#ef4444'; // red

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="width: 28px; height: 28px; background-color: ${color}; border-radius: 6px; border: 3px solid white; box-shadow: 0 0 10px ${color}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: white;">🏥</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Component to recenter map when user location is found
const LocationMarker = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 13);
    }
  }, [position, map]);
  return position === null ? null : (
    <Marker position={position} icon={userIcon}>
      <Popup>📍 You are here</Popup>
    </Marker>
  );
};

export default function LiveMap({ ambulances, hospitals = [] }: { ambulances: Ambulance[], hospitals?: Hospital[] }) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  // Default center is Pune (where mock data is)
  const defaultCenter: [number, number] = [18.5204, 73.8567];

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', zIndex: 0, flex: 1, minHeight: '300px' }}>
      <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%', background: '#0a1628' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {userPos && <LocationMarker position={userPos} />}

        {ambulances.map((amb) => (
          <Marker 
            key={amb.id} 
            position={[amb.currentLocation.lat, amb.currentLocation.lng]}
            icon={getAmbulanceIcon(amb.status)}
          >
            <Popup>
              <strong>{amb.vehicleNumber}</strong> ({amb.teamName})<br/>
              Status: {amb.status.replace(/_/g, ' ')}
            </Popup>
          </Marker>
        ))}

        {hospitals.map((hosp) => (
          <Marker 
            key={hosp.id} 
            position={[hosp.latitude, hosp.longitude]}
            icon={getHospitalIcon(hosp.status)}
          >
            <Popup>
              <strong>{hosp.name}</strong><br/>
              Status: {hosp.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
