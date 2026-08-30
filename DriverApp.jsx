import React, { useState, useEffect, useRef } from 'react';
import { sendLocationREST, createDriverWebSocket } from '../api';
import { Smartphone, Play, Pause, RotateCcw, Compass, Gauge, AlertTriangle, CheckCircle2, Radio } from 'lucide-react';

export default function DriverApp() {
  const [busId] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRealGPS, setIsRealGPS] = useState(false);
  const [speed, setSpeed] = useState(35);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [lat, setLat] = useState(16.7049);
  const [lng, setLng] = useState(74.2433);
  const [lastSentTime, setLastSentTime] = useState(null);
  const [sentCount, setSentCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Driver Terminal Ready');
  const [emergencyActive, setEmergencyActive] = useState(false);

  const wsRef = useRef(null);
  const watchIdRef = useRef(null);

  // Simulated GPS Waypoints along Kolhapur Route (CBS -> Railway Circle -> Tarabai Park -> Campus)
  const waypoints = [
    { name: "Central Bus Stand (CBS)", lat: 16.7080, lng: 74.2380 },
    { name: "Approaching Railway Station", lat: 16.7065, lng: 74.2405 },
    { name: "Railway Station Circle 📍", lat: 16.7049, lng: 74.2433 },
    { name: "Assembly Road Junction", lat: 16.7030, lng: 74.2460 },
    { name: "Tarabai Park Stop 📍", lat: 16.7010, lng: 74.2490 },
    { name: "Kawala Naka Circle", lat: 16.6980, lng: 74.2515 },
    { name: "University Main Gate 📍", lat: 16.6950, lng: 74.2540 },
    { name: "Campus Avenue", lat: 16.6920, lng: 74.2570 },
    { name: "Engineering College Campus 🏫", lat: 16.6890, lng: 74.2600 }
  ];

  // Open Driver WebSocket connection
  useEffect(() => {
    try {
      wsRef.current = createDriverWebSocket(busId);
      wsRef.current.onopen = () => setStatusMessage('WebSocket Connected to FastAPI Backend');
      wsRef.current.onerror = () => setStatusMessage('WebSocket fallback to REST API');
    } catch (e) {
      console.warn("WebSocket fallback:", e);
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [busId]);

  // Transmit location update helper
  const transmitGPS = (latitude, longitude, currentSpeed) => {
    const payload = {
      bus_id: busId,
      latitude: latitude,
      longitude: longitude,
      speed: currentSpeed
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      // Fallback to REST API
      sendLocationREST(busId, latitude, longitude, currentSpeed).catch(console.error);
    }

    setLastSentTime(new Date().toLocaleTimeString());
    setSentCount(prev => prev + 1);
  };

  // Route Simulation Timer Effect
  useEffect(() => {
    let interval = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setCurrentStepIdx(prevIdx => {
          const nextIdx = (prevIdx + 1) % waypoints.length;
          const target = waypoints[nextIdx];
          setLat(target.lat);
          setLng(target.lng);
          transmitGPS(target.lat, target.lng, speed);
          setStatusMessage(`Broadcasting GPS: ${target.name}`);
          return nextIdx;
        });
      }, 3000); // Emits every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isSimulating, speed]);

  // Toggle Browser HTML5 Real Device GPS
  const toggleRealGPS = () => {
    if (!isRealGPS) {
      if ('geolocation' in navigator) {
        setIsSimulating(false);
        setIsRealGPS(true);
        setStatusMessage('Acquiring Device GPS Lock...');

        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const deviceLat = pos.coords.latitude;
            const deviceLng = pos.coords.longitude;
            const deviceSpeed = (pos.coords.speed || 0) * 3.6; // convert m/s to km/h

            setLat(deviceLat);
            setLng(deviceLng);
            setSpeed(deviceSpeed > 0 ? deviceSpeed : 35);
            transmitGPS(deviceLat, deviceLng, deviceSpeed > 0 ? deviceSpeed : 35);
            setStatusMessage(`Live Hardware GPS Locked: ${deviceLat.toFixed(4)}, ${deviceLng.toFixed(4)}`);
          },
          (err) => {
            setStatusMessage(`GPS Error: ${err.message}. Using manual mode.`);
            setIsRealGPS(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
        );
      } else {
        alert("Geolocation API is not supported by your browser.");
      }
    } else {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      setIsRealGPS(false);
      setStatusMessage('Device GPS Paused');
    }
  };

  const handleManualEmit = () => {
    transmitGPS(lat, lng, speed);
    setStatusMessage(`Manual Coordinate Pushed: ${lat}, ${lng}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Driver Phone Console (GPS Transmitter)</h2>
            <p className="text-xs text-slate-400">Assigned Vehicle: <span className="text-white font-semibold">Bus #5 (MH-09-CB-1005)</span></p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">Packets Pushed:</span>
          <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full font-bold text-sm border border-cyan-500/40">
            {sentCount}
          </span>
        </div>
      </div>

      {/* Main Grid: Phone Mockup vs Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Mobile Phone Mockup Visual */}
        <div className="glass-panel p-6 rounded-3xl border-4 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center justify-between min-h-[480px]">
          {/* Phone Top Notch */}
          <div className="w-32 h-5 bg-slate-900 rounded-b-xl border-x border-b border-slate-700 flex items-center justify-center mb-4">
            <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700"></div>
          </div>

          {/* Telemetry Display */}
          <div className="w-full text-center space-y-4 my-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs text-emerald-400 font-mono font-semibold">GPS TELEMETRY EMITTER</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Current Latitude</span>
              <div className="text-3xl font-black text-white font-mono">{lat.toFixed(4)}° N</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Current Longitude</span>
              <div className="text-3xl font-black text-cyan-400 font-mono">{lng.toFixed(4)}° E</div>
            </div>

            <div className="pt-2">
              <span className="text-xs text-slate-400 block">Calculated Speed</span>
              <span className="text-2xl font-bold text-emerald-400">{speed.toFixed(1)} km/h</span>
            </div>
          </div>

          {/* Mobile Bottom Status Bar */}
          <div className="w-full mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
            <p className="text-xs text-slate-300 font-medium flex items-center justify-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" /> {statusMessage}
            </p>
            {lastSentTime && (
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Last Transmission: {lastSentTime}</p>
            )}
          </div>
        </div>

        {/* Driver Control Panel */}
        <div className="space-y-6 flex flex-col justify-between">
          
          {/* Controls Box */}
          <div className="glass-panel p-6 rounded-xl space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" /> Transmission Mode
            </h3>

            {/* Mode Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  if (isRealGPS) toggleRealGPS();
                  setIsSimulating(!isSimulating);
                }}
                className={`p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isSimulating
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isSimulating ? 'Pause Route' : 'Auto Route Simulator'}
              </button>

              <button
                onClick={toggleRealGPS}
                className={`p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isRealGPS
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                {isRealGPS ? 'Stop Device GPS' : 'Use Device GPS'}
              </button>
            </div>

            {/* Speed Adjuster */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-semibold flex items-center gap-1">
                  <Gauge className="w-4 h-4 text-emerald-400" /> Simulated Driving Speed
                </span>
                <span className="font-bold text-emerald-400 font-mono">{speed} km/h</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Manual Coordinate Step */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Manual Coordinate Override</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleManualEmit}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs rounded-lg border border-slate-700 transition-colors"
              >
                Transmit Selected Coordinates Now
              </button>
            </div>
          </div>

          {/* Emergency Alert Button */}
          <button
            onClick={() => {
              setEmergencyActive(!emergencyActive);
              setStatusMessage(emergencyActive ? 'Emergency Alert Cleared' : 'EMERGENCY SOS SIGNAL BROADCASTED');
            }}
            className={`w-full p-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
              emergencyActive
                ? 'bg-red-500 text-white border-red-400 animate-pulse shadow-lg shadow-red-500/50'
                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            {emergencyActive ? 'CLEAR EMERGENCY SIGNAL' : 'TRIGGER EMERGENCY SOS / TRAFFIC DELAY'}
          </button>

        </div>

      </div>
    </div>
  );
}
