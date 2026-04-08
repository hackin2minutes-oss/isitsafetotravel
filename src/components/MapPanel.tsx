'use client';

import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/types';
import { reverseGeocode } from '@/services/locationService';
import { useSafetyStore } from '@/store/safetyStore';
import { Compass, Navigation2, Satellite } from 'lucide-react';

// --- Explicit Red Target Marker ---
const createRedTargetIcon = () => {
  return L.divIcon({
    className: 'premium-marker-container z-[1000]',
    html: `
      <div class="relative flex flex-col items-center group cursor-crosshair">
        <!-- Pulsing radar ring -->
        <div class="absolute w-12 h-12 rounded-full animate-ping opacity-60 pointer-events-none" style="border: 2px solid #ef4444; background-color: rgba(239, 68, 68, 0.2);"></div>
        <!-- Center Dot -->
        <div class="relative z-10 w-5 h-5 rounded-full border-[3px] border-white shadow-[0_0_20px_rgba(239,68,68,0.9)] transition-transform duration-300 group-hover:scale-[1.3] bg-rose-500"></div>
        <!-- Shadow/Pin stem -->
        <div class="absolute top-4 w-1 h-6 opacity-60 blur-[1px] bg-gradient-to-b from-rose-500 to-transparent"></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });
};

// --- Map Controller ---
function MapController({ onLocationSelect }: { onLocationSelect: (loc: Location) => void }) {
  const map = useMap();
  const { selectedLocation } = useSafetyStore();

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const location = await reverseGeocode(lat, lng);
      
      if (location) {
        onLocationSelect(location);
      } else {
        onLocationSelect({
          id: `coord-${lat.toFixed(4)}-${lng.toFixed(4)}`,
          name: `Region [${lat.toFixed(2)}, ${lng.toFixed(2)}]`,
          type: 'city',
          coordinates: { latitude: lat, longitude: lng },
        });
      }
    },
  });

  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(
        [selectedLocation.coordinates.latitude, selectedLocation.coordinates.longitude],
        selectedLocation.type === 'country' ? 4 : 10,
        { duration: 2, easeLinearity: 0.25 }
      );
    }
  }, [selectedLocation, map]);

  return null;
}

interface MapPanelProps {
  onLocationSelect: (location: Location) => void;
}

export function MapPanel({ onLocationSelect }: MapPanelProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { selectedLocation, assessment } = useSafetyStore();
  const score = assessment?.score || 100;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="relative w-full h-full bg-slate-100 dark:bg-slate-900" />;
  }

  return (
    <div className="relative w-full h-full overflow-hidden transition-all duration-700 bg-slate-100 dark:bg-slate-900">
      
      {/* Map Overlays: Floating HUD Elements */}
      <div className="hidden md:block absolute top-6 left-6 z-[1000] pointer-events-auto hover:-translate-y-1 transition-transform duration-300 cursor-help">
        <div className="flex flex-col gap-2">
          <div className="px-4 py-2 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.3)] flex items-center gap-3 transition-shadow">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
             <div className="w-2 h-2 rounded-full bg-emerald-500 relative z-10" />
             <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 tracking-widest uppercase">
               Live_Data_Feed
             </span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex absolute top-6 right-6 z-[1000] flex-col gap-3 pointer-events-auto">
        <div className="p-2.5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/5 shadow-premium hover:scale-110 hover:-translate-x-1 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group">
           <Compass className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors animate-[spin_4s_linear_infinite]" />
        </div>
        <div className="p-2.5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/5 shadow-premium hover:scale-110 hover:-translate-x-1 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group">
           <Satellite className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors hover:animate-bounce" />
        </div>
      </div>

      {/* Map Engine */}
      <MapContainer
        key="sentinel-global-map"
        center={[20, 0]}
        zoom={2}
        zoomControl={false}
        className="w-full h-full"
        style={{ zIndex: 10 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        
        <ZoomControl position="bottomright" />
        <MapController onLocationSelect={onLocationSelect} />

        {selectedLocation && (
          <Marker
            position={[selectedLocation.coordinates.latitude, selectedLocation.coordinates.longitude]}
            icon={createRedTargetIcon()}
          />
        )}
      </MapContainer>

      {/* Bottom Coordinates Overlay */}
      <div className="hidden md:block absolute bottom-6 left-6 z-[1000] pointer-events-auto hover:-translate-y-2 transition-transform duration-500 cursor-crosshair">
        <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/20 dark:border-white/5 shadow-premium hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-6 transition-shadow group">
           <div className="flex items-center gap-2">
              <Navigation2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20 group-hover:rotate-45 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                {selectedLocation?.coordinates.latitude.toFixed(4) || '0.000'} / {selectedLocation?.coordinates.longitude.toFixed(4) || '0.000'}
              </span>
           </div>
           <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-emerald-400 transition-colors">
             Resolution_High
           </span>
        </div>
      </div>

      {/* Subtle Visual Touches */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white data-dark:from-slate-950 to-transparent pointer-events-none z-20 opacity-40" />
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white data-dark:from-slate-950 to-transparent pointer-events-none z-20 opacity-40" />
    </div>
  );
}