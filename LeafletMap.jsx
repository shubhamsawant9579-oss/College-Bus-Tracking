import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function LeafletMap({ busLocation, routeStops, busNumber }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const busMarkerRef = useRef(null);

  // Default initial center: Railway Station Circle (16.7049, 74.2433)
  const defaultCenter = [16.7049, 74.2433];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map instance
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Draw route stops and polylines if stops are provided
    if (routeStops && routeStops.length > 0) {
      const polylineCoords = routeStops.map(s => [s.latitude, s.longitude]);

      // Remove existing polylines/markers except bus marker
      map.eachLayer((layer) => {
        if (layer instanceof L.Polyline || (layer instanceof L.Marker && layer !== busMarkerRef.current)) {
          map.removeLayer(layer);
        }
      });

      // Route polyline with neon cyan line
      L.polyline(polylineCoords, {
        color: '#06b6d4',
        weight: 5,
        opacity: 0.8,
        dashArray: '8, 8',
      }).addTo(map);

      // Render Stop Markers (📍 & 🏫)
      routeStops.forEach((stop, idx) => {
        const isCollege = idx === routeStops.length - 1;
        const iconHtml = isCollege
          ? `<div class="bg-amber-500 text-slate-950 p-2 rounded-full border-2 border-white shadow-lg text-lg flex items-center justify-center w-9 h-9">🏫</div>`
          : `<div class="bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-md text-sm flex items-center justify-center w-7 h-7 font-bold">${stop.stop_order}</div>`;

        const customIcon = L.divIcon({
          className: 'custom-stop-icon',
          html: iconHtml,
          iconSize: isCollege ? [36, 36] : [28, 28],
          iconAnchor: isCollege ? [18, 18] : [14, 14],
        });

        const stopMarker = L.marker([stop.latitude, stop.longitude], { icon: customIcon }).addTo(map);
        stopMarker.bindPopup(`
          <div class="p-1">
            <h4 class="font-bold text-base text-cyan-400">${stop.stop_name}</h4>
            <p class="text-xs text-slate-300">Stop #${stop.stop_order} ${isCollege ? '(Destination College Campus)' : ''}</p>
            <p class="text-xs font-mono text-slate-400 mt-1">${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)}</p>
          </div>
        `);
      });
    }

  }, [routeStops]);

  // Update animated bus marker on location update
  useEffect(() => {
    if (!mapInstanceRef.current || !busLocation) return;
    const map = mapInstanceRef.current;
    const { latitude, longitude, speed } = busLocation;

    const busIconHtml = `
      <div class="relative flex items-center justify-center">
        <span class="absolute inline-flex h-12 w-12 rounded-full bg-emerald-400 opacity-75 live-pulse"></span>
        <div class="relative bg-emerald-500 text-slate-950 p-2 rounded-full border-2 border-white shadow-2xl text-xl flex items-center justify-center w-10 h-10 transform hover:scale-110 transition-transform">
          🚌
        </div>
      </div>
    `;

    const busIcon = L.divIcon({
      className: 'custom-bus-icon',
      html: busIconHtml,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    if (!busMarkerRef.current) {
      busMarkerRef.current = L.marker([latitude, longitude], { icon: busIcon }).addTo(map);
      busMarkerRef.current.bindPopup(`
        <div class="p-1">
          <span class="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded font-bold">LIVE TELEMETRY</span>
          <h3 class="font-bold text-lg text-white mt-1">Bus ${busNumber || '#5'}</h3>
          <p class="text-sm text-slate-300">Speed: <span class="font-bold text-emerald-400">${(speed || 0).toFixed(1)} km/h</span></p>
        </div>
      `);
    } else {
      busMarkerRef.current.setLatLng([latitude, longitude]);
    }

    // Pan map smoothly to follow bus if needed
    map.panTo([latitude, longitude], { animate: true, duration: 1.0 });

  }, [busLocation, busNumber]);

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
