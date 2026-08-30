import React, { useState, useEffect } from 'react';
import LeafletMap from './LeafletMap';
import { createStudentWebSocket, fetchRoutes } from '../api';
import { Radio, Wifi, Clock, Navigation, ShieldCheck, MapPin } from 'lucide-react';

export default function StudentApp() {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [busLocation, setBusLocation] = useState({
    bus_id: 2,
    latitude: 17.2833,
    longitude: 74.1825,
    speed: 55.0,
    current_stop: "Karad Central Bus Stand (CBS)",
    next_stop: "Karad NH48 Highway Flyover Junction",
    eta_minutes: 5,
    distance_remaining_km: 43.8,
    timestamp: new Date().toISOString()
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState(null);

  useEffect(() => {
    fetchRoutes().then(data => {
      if (data && data.length > 0) {
        setRoutes(data);
        const karadRoute = data.find(r => r.route_name.includes("NH48") || r.route_name.includes("Karad")) || data[0];
        setSelectedRouteId(karadRoute.id);
        if (karadRoute.stops.length > 1) {
          setSelectedStopId(karadRoute.stops[1].id);
        }
      }
    }).catch(console.error);
  }, []);

  const activeRoute = routes.find(r => r.id === Number(selectedRouteId)) || routes[0];
  const busId = activeRoute && (activeRoute.route_name.includes("Karad") || activeRoute.route_name.includes("NH48")) ? 2 : 1;
  const busName = busId === 2 ? "BUS-12 (MH-11-AB-2012)" : "BUS-05 (MH-09-CB-1005)";
  const driverName = busId === 2 ? "Suresh Deshmukh" : "Rajesh Patil";

  useEffect(() => {
    const ws = createStudentWebSocket(busId, (payload) => {
      setBusLocation(payload);
      setWsConnected(true);
    });

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);

    return () => {
      ws.close();
    };
  }, [busId]);

  const currentStops = activeRoute ? activeRoute.stops : [];

  return (
    <div className="space-y-6">
      {/* Top Banner Status Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedRouteId || ''}
                onChange={(e) => setSelectedRouteId(Number(e.target.value))}
                className="bg-slate-900 text-white font-bold text-lg border border-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.route_name}</option>
                ))}
              </select>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${wsConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
                <Wifi className="w-3 h-3" /> {wsConnected ? 'LIVE WEBSOCKET STREAMING' : 'CONNECTING SERVER...'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Assigned Bus: <span className="text-white font-semibold">{busName}</span> • Driver: <span className="text-white font-semibold">{driverName}</span></p>
          </div>
        </div>

        {/* Boarding Stop Selector */}
        <div className="flex items-center space-x-3 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
          <MapPin className="w-5 h-5 text-cyan-400" />
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">My Boarding Stop</label>
            <select
              value={selectedStopId || ''}
              onChange={(e) => setSelectedStopId(Number(e.target.value))}
              className="bg-transparent text-white font-semibold text-sm focus:outline-none cursor-pointer"
            >
              {currentStops.map(stop => (
                <option key={stop.id} value={stop.id} className="bg-slate-900 text-white">
                  Stop #{stop.stop_order}: {stop.stop_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: ETA Card & Route Timeline */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl border-l-4 border-l-cyan-500 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Estimated Time of Arrival</span>
                <h3 className="text-4xl font-black text-white mt-1 flex items-baseline gap-2">
                  {busLocation.eta_minutes || 5} <span className="text-lg font-normal text-slate-400">mins</span>
                </h3>
              </div>
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                <Clock className="w-8 h-8" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Current Bus Speed</span>
                <span className="text-base font-bold text-emerald-400">{(busLocation.speed || 55.0).toFixed(1)} km/h</span>
              </div>
              <div>
                <span className="text-slate-400 block">Distance Remaining</span>
                <span className="text-base font-bold text-cyan-400">{busLocation.distance_remaining_km || 43.8} km</span>
              </div>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2"><Navigation className="w-4 h-4 text-cyan-400" /> Route Timeline</span>
              <span className="text-xs font-normal text-cyan-400 font-mono">NH48 Highway</span>
            </h4>

            <div className="relative pl-6 space-y-4 border-l-2 border-slate-800 max-h-[380px] overflow-y-auto pr-1">
              {currentStops.map((stop, idx) => {
                const isCollege = idx === currentStops.length - 1;
                const isCurrent = busLocation.current_stop === stop.stop_name || (idx === 0 && !busLocation.current_stop);

                return (
                  <div key={stop.id} className="relative flex items-start space-x-3">
                    <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isCurrent
                        ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/20'
                        : isCollege
                        ? 'bg-amber-500 border-white'
                        : 'bg-slate-800 border-slate-600'
                    }`}></div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${isCurrent ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                          {stop.stop_name}
                        </span>
                        {isCurrent && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                            BUS LOCATED HERE 🚌
                          </span>
                        )}
                        {isCollege && <span className="text-sm">🏫</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Lat: {stop.latitude.toFixed(4)} | Lon: {stop.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-4 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-bold text-white">Verified Highway Route</p>
                <p className="text-slate-400">License: MH11201800987</p>
              </div>
            </div>
            <a href="tel:+919822011223" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold rounded-lg transition-colors">
              Call Driver
            </a>
          </div>
        </div>

        {/* Right Column: Leaflet Map */}
        <div className="lg:col-span-2 min-h-[500px] flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400" /> Live Interactive Leaflet Map (NH48 Highway Corridor)
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              Last Telemetry: {new Date(busLocation.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex-1">
            <LeafletMap
              busLocation={busLocation}
              routeStops={currentStops}
              busNumber={busId === 2 ? "BUS-12 (Karad - ABIT Satara)" : "BUS-05 (Kolhapur)"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
