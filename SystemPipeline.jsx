import React, { useState, useEffect } from 'react';
import { createPipelineWebSocket } from '../api';
import { Smartphone, Server, Database, Zap, Monitor, ArrowRight, CheckCircle, Activity, Code } from 'lucide-react';

export default function SystemPipeline() {
  const [pipelinePackets, setPipelinePackets] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

  const samplePacket = {
    bus_id: 5,
    latitude: 16.7049,
    longitude: 74.2433,
    speed: 35.5,
    timestamp: new Date().toISOString(),
    current_stop: "Railway Station Circle",
    next_stop: "Tarabai Park Stop",
    eta_minutes: 4
  };

  const [lastPacket, setLastPacket] = useState(samplePacket);

  useEffect(() => {
    // Listen to live pipeline WebSockets
    const ws = createPipelineWebSocket((data) => {
      setLastPacket(data);
      setPipelinePackets(prev => [data, ...prev.slice(0, 9)]);
      // Animate pipeline pulse steps
      setActiveStep(1);
      setTimeout(() => setActiveStep(2), 200);
      setTimeout(() => setActiveStep(3), 400);
      setTimeout(() => setActiveStep(4), 600);
      setTimeout(() => setActiveStep(5), 800);
      setTimeout(() => setActiveStep(0), 1200);
    });

    return () => ws.close();
  }, []);

  const nodes = [
    {
      id: 1,
      title: "Driver Phone",
      sub: "HTML5 / Mobile GPS",
      icon: Smartphone,
      color: "from-blue-500 to-cyan-500",
      detail: `Lat: ${lastPacket.latitude.toFixed(4)}, Lon: ${lastPacket.longitude.toFixed(4)}`
    },
    {
      id: 2,
      title: "FastAPI Backend",
      sub: "Python Telemetry API",
      icon: Server,
      color: "from-emerald-500 to-teal-500",
      detail: `POST /api/location & /ws/driver/5`
    },
    {
      id: 3,
      title: "Database",
      sub: "bus_locations Table",
      icon: Database,
      color: "from-purple-500 to-indigo-500",
      detail: `Stored in bus_locations (history)`
    },
    {
      id: 4,
      title: "Live Tracking Service",
      sub: "WebSocket Broadcast",
      icon: Zap,
      color: "from-amber-500 to-orange-500",
      detail: `Broadcasting payload to /ws/student/5`
    },
    {
      id: 5,
      title: "Student App",
      sub: "React.js + Leaflet Map",
      icon: Monitor,
      color: "from-pink-500 to-rose-500",
      detail: `Map Marker moves smoothly`
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" /> End-to-End System Architecture & Data Flow
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry pipeline carrying GPS coordinates from Driver Phone down to Student Browser Map.
          </p>
        </div>
        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> PIPELINE ACTIVE
        </span>
      </div>

      {/* Interactive Flow Nodes Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {nodes.map((node, idx) => {
          const IconComp = node.icon;
          const isActive = activeStep === node.id;

          return (
            <div key={node.id} className="flex flex-col items-center">
              <div className={`w-full glass-panel p-4 rounded-xl border transition-all duration-300 ${
                isActive
                  ? 'border-cyan-400 ring-4 ring-cyan-500/20 scale-105 shadow-xl'
                  : 'border-slate-800'
              }`}>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${node.color} flex items-center justify-center text-slate-950 font-bold mb-3 shadow-md`}>
                  <IconComp className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-sm text-white">{node.title}</h4>
                <p className="text-[11px] text-cyan-400 font-semibold">{node.sub}</p>
                <p className="text-[10px] text-slate-400 mt-2 font-mono bg-slate-950/60 p-1.5 rounded border border-slate-900 truncate">
                  {node.detail}
                </p>
              </div>

              {idx < nodes.length - 1 && (
                <div className="hidden md:flex items-center justify-center my-auto text-slate-600 absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-5 h-5 text-cyan-500 animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Route Timeline Visualizer */}
      <div className="glass-panel p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
          Target Route Map Pipeline
        </h3>
        
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-base font-bold font-mono text-cyan-400">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚌</span> Bus #5
          </div>
          <div className="flex-1 border-t-2 border-dashed border-cyan-500/50 mx-4 flex items-center justify-center">
            <span className="bg-slate-900 text-xs text-slate-300 px-3 py-1 rounded-full border border-slate-800 font-sans">
              📍 Stop: {lastPacket.current_stop || 'Railway Station Circle'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <span className="text-2xl">🏫</span> College Campus
          </div>
        </div>
      </div>

      {/* Raw WebSocket JSON Telemetry Inspector */}
      <div className="glass-panel p-5 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" /> Live WebSocket Broadcast JSON Payload
          </h3>
          <span className="text-xs text-slate-500 font-mono">Channel: /ws/student/5</span>
        </div>

        <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto">
          {JSON.stringify(lastPacket, null, 2)}
        </pre>
      </div>

    </div>
  );
}
