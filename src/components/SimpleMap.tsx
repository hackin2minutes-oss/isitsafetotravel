'use client';

import { useEffect, useRef, useState } from 'react';
import { Location } from '@/types';
import { MapPin, Layers, Navigation, Satellite } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface SimpleMapProps {
  selectedLocation?: Location | null;
  onLocationSelect?: (location: Location) => void;
}

export function SimpleMap({ selectedLocation, onLocationSelect }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [activeLayer, setActiveLayer] = useState('dark');
  const [showLayers, setShowLayers] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      const map = L.map(mapRef.current!, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true,
      });

      const darkLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19 }
      );

      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18 }
      );

      const streetLayer = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '© OSM' }
      );

      const voyagerLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 19 }
      );

      darkLayer.addTo(map);

      (window as any).mapLayers = { dark: darkLayer, satellite: satelliteLayer, street: streetLayer, voyager: voyagerLayer };
      (window as any).L = L;

      leafletMapRef.current = map;

      map.on('click', async (e: any) => {
        if (onLocationSelect) {
          const L = (window as any).L;
          try {
            const response = await fetch(`/api/location?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`);
            const data = await response.json();
            
            let locationName = `${e.latlng.lat.toFixed(2)}, ${e.latlng.lng.toFixed(2)}`;
            let countryName = 'Unknown';
            
            if (data && data.address) {
              locationName = data.address.city || data.address.town || data.address.village || data.address.state || locationName;
              countryName = data.address.country || 'Unknown';
            }
            
            onLocationSelect({
              id: `map-${Date.now()}`,
              name: locationName,
              type: 'city',
              countryName: countryName,
              coordinates: { latitude: e.latlng.lat, longitude: e.latlng.lng },
            });
          } catch {
            onLocationSelect({
              id: `map-${Date.now()}`,
              name: `${e.latlng.lat.toFixed(2)}, ${e.latlng.lng.toFixed(2)}`,
              type: 'city',
              coordinates: { latitude: e.latlng.lat, longitude: e.latlng.lng },
            });
          }
        }
      });
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [onLocationSelect]);

  useEffect(() => {
    if (leafletMapRef.current && selectedLocation) {
      const map = leafletMapRef.current;
      
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }

      map.flyTo(
        [selectedLocation.coordinates.latitude, selectedLocation.coordinates.longitude],
        12,
        { duration: 2, easeLinearity: 0.25 }
      );

      const L = (window as any).L;
      if (L) {
        const pulsingIcon = L.divIcon({
          className: 'pulsing-marker',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-16 h-16 bg-emerald-500/30 rounded-full animate-ping" style="animation-duration: 2s;"></div>
              <div class="absolute w-12 h-12 bg-emerald-500/40 rounded-full animate-ping" style="animation-duration: 1.5s; animation-delay: 0.5s;"></div>
              <div class="relative w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50 border-2 border-white/80">
                <div class="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          `,
          iconSize: [64, 64],
          iconAnchor: [32, 32],
        });

        markerRef.current = L.marker(
          [selectedLocation.coordinates.latitude, selectedLocation.coordinates.longitude],
          { icon: pulsingIcon, zIndexOffset: 1000 }
        ).addTo(map);

        const popup = L.popup({
          className: 'attractive-popup',
          closeButton: false,
          autoPan: true,
          autoPanPadding: [50, 50],
        }).setContent(`
          <div class="bg-gray-900/95 backdrop-blur-lg rounded-xl p-4 border border-emerald-500/30 shadow-xl shadow-emerald-500/20 min-w-[220px]">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-white font-bold text-sm">${selectedLocation.name}</h3>
                <p class="text-gray-400 text-xs">${selectedLocation.countryName || 'Unknown Region'}</p>
              </div>
            </div>
            <div class="bg-black/30 rounded-lg p-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500">Coordinates</span>
                <span class="text-emerald-400 font-mono">${selectedLocation.coordinates.latitude.toFixed(4)}°, ${selectedLocation.coordinates.longitude.toFixed(4)}°</span>
              </div>
            </div>
          </div>
        `);

        markerRef.current.bindPopup(popup).openPopup();
      }
    }
  }, [selectedLocation]);

  const switchLayer = (layer: string) => {
    const map = leafletMapRef.current;
    const layers = (window as any).mapLayers;
    if (!map || !layers) return;

    Object.values(layers).forEach((l: any) => map.removeLayer(l));
    layers[layer].addTo(map);
    setActiveLayer(layer);
    setShowLayers(false);
  };

  return (
    <div className="w-full h-full relative bg-gray-900">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Elegant Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-[999] pointer-events-none">
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/10 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm tracking-wide">Explore Location</h2>
              <p className="text-gray-400 text-xs">Click anywhere on map</p>
            </div>
          </div>
        </div>

        {selectedLocation && (
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-5 py-3 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 pointer-events-auto">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Selected</span>
            </div>
            <h3 className="text-white font-bold">{selectedLocation.name}</h3>
            <p className="text-gray-400 text-xs">{selectedLocation.countryName}</p>
          </div>
        )}
      </div>

      {/* Layer Selector */}
      <div className="absolute bottom-6 right-6 z-[999]">
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <button
            onClick={() => setShowLayers(!showLayers)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span className="text-white text-xs font-semibold">Layers</span>
            </div>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${showLayers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showLayers && (
            <div className="border-t border-white/10">
              {[
                { id: 'dark', name: 'Dark', icon: '🌙', color: 'purple' },
                { id: 'satellite', name: 'Satellite', icon: '🛰️', color: 'blue' },
                { id: 'street', name: 'Street', icon: '🗺️', color: 'green' },
                { id: 'voyager', name: 'Voyager', icon: '🧭', color: 'amber' },
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => switchLayer(layer.id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors ${
                    activeLayer === layer.id ? 'bg-indigo-500/20 border-l-2 border-indigo-500' : ''
                  }`}
                >
                  <span className="text-lg">{layer.icon}</span>
                  <span className={`text-sm font-medium ${
                    activeLayer === layer.id ? 'text-indigo-400' : 'text-white'
                  }`}>{layer.name}</span>
                  {activeLayer === layer.id && (
                    <div className="ml-auto w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 left-6 z-[999]">
        <div className="bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
          <button
            onClick={() => leafletMapRef.current?.zoomIn()}
            className="block px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
          </button>
          <button
            onClick={() => leafletMapRef.current?.zoomOut()}
            className="block px-4 py-3 hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 left-2 z-[999]">
        <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1">
          <span className="text-[10px] text-gray-500">© CARTO © OSM © Esri</span>
        </div>
      </div>

      <style jsx global>{`
        .pulsing-marker {
          background: transparent !important;
          border: none !important;
        }
        .attractive-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        .attractive-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .attractive-popup .leaflet-popup-tip-container {
          display: none !important;
        }
        .attractive-popup .leaflet-popup-close-button {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
