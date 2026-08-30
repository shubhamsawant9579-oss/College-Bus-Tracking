import React, { useState, useEffect } from 'react';
import { fetchBuses, fetchRoutes, fetchBusHistory } from '../api';
import { ShieldCheck, Bus, MapPin, Users, Database, Bell } from 'lucide-react';

export default function AdminPanel() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [adminTab, setAdminTab] = useState('buses');

  useEffect(() => {
    fetchBuses().then(setBuses).catch(console.error);
    fetchRoutes().then(setRoutes).catch(console.error);
    fetchBusHistory(2).then(setHistoryLogs).catch(console.error);
  }, []);

  const defaultDrivers = [
    { id: 1, name: "Suresh Deshmukh", phone: "+91 98220 11223", license: "MH11201800987", assigned_bus: "BUS-12 (Karad ➔ ABIT Satara)" },
    { id: 2, name: "Rajesh Patil", phone: "+91 98765 43210", license: "MH09201900452", assigned_bus: "BUS-05 (Kolhapur Route)" }
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="glass-panel p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" /> Fleet Management & System Admin Console
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage College Buses, Driver Assignments, Highway Routes, and Database GPS Telemetry.
          </p>
        </div>
        
        <button
          onClick={() => alert('Broadcast Alert Sent to Connected Student Apps!')}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Bell className="w-4 h-4" /> Broadcast Delay Alert
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block">Total Fleet Buses</span>
          <div className="text-2xl font-black text-white mt-1">2 <span className="text-xs font-normal text-emerald-400">(Active)</span></div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block">Active Routes</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">2 <span className="text-xs font-normal text-slate-400">(NH48 & Kolhapur)</span></div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block">Registered Drivers</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">2 <span className="text-xs font-normal text-slate-400">(Verified)</span></div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold block">GPS Telemetry Logs</span>
          <div className="text-2xl font-black text-purple-400 mt-1">{historyLogs.length || 35} <span className="text-xs font-normal text-slate-400">(In DB)</span></div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-bold space-x-6">
        <button onClick={() => setAdminTab('buses')} className={`pb-3 ${adminTab === 'buses' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>
          Fleet Buses ({buses.length || 2})
        </button>
        <button onClick={() => setAdminTab('drivers')} className={`pb-3 ${adminTab === 'drivers' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>
          Drivers & Assignments
        </button>
        <button onClick={() => setAdminTab('routes')} className={`pb-3 ${adminTab === 'routes' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>
          Highway Routes ({routes.length || 2})
        </button>
        <button onClick={() => setAdminTab('logs')} className={`pb-3 ${adminTab === 'logs' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>
          Database GPS History
        </button>
      </div>

      {/* Sub Views */}
      {adminTab === 'buses' && (
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <h3 className="font-bold text-white text-base">Fleet Bus Vehicles</h3>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase">
              <tr>
                <th className="p-3">Bus Number</th>
                <th className="p-3">Registration Number</th>
                <th className="p-3">Capacity</th>
                <th className="p-3">Assigned Route</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              <tr className="hover:bg-slate-900/40">
                <td className="p-3 font-bold text-cyan-400 font-sans">BUS-12</td>
                <td className="p-3 text-white">MH-11-AB-2012</td>
                <td className="p-3 text-slate-300 font-sans">48 Seats</td>
                <td className="p-3 text-emerald-400 font-sans">Karad ➔ ABIT Polytechnic Satara (NH48)</td>
                <td className="p-3"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold font-sans">ACTIVE</span></td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="p-3 font-bold text-cyan-400 font-sans">BUS-05</td>
                <td className="p-3 text-white">MH-09-CB-1005</td>
                <td className="p-3 text-slate-300 font-sans">52 Seats</td>
                <td className="p-3 text-emerald-400 font-sans">Kolhapur City to Campus</td>
                <td className="p-3"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold font-sans">ACTIVE</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {adminTab === 'drivers' && (
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <h3 className="font-bold text-white text-base">Drivers Roster</h3>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase">
              <tr>
                <th className="p-3">Driver Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">License Number</th>
                <th className="p-3">Assigned Bus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {defaultDrivers.map(d => (
                <tr key={d.id}>
                  <td className="p-3 font-bold text-white">{d.name}</td>
                  <td className="p-3 text-cyan-400 font-mono">{d.phone}</td>
                  <td className="p-3 text-slate-300 font-mono">{d.license}</td>
                  <td className="p-3 text-emerald-400 font-semibold">{d.assigned_bus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adminTab === 'logs' && (
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <h3 className="font-bold text-white text-base">Database Telemetry Logs (`bus_locations`)</h3>
          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 uppercase">
                <tr>
                  <th className="p-2">Log ID</th>
                  <th className="p-2">Bus ID</th>
                  <th className="p-2">Latitude</th>
                  <th className="p-2">Longitude</th>
                  <th className="p-2">Speed</th>
                  <th className="p-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {historyLogs.map(log => (
                  <tr key={log.id}>
                    <td className="p-2 text-slate-500">#{log.id}</td>
                    <td className="p-2 text-cyan-400 font-bold">Bus #{log.bus_id}</td>
                    <td className="p-2 text-white">{log.latitude.toFixed(4)}° N</td>
                    <td className="p-2 text-emerald-400">{log.longitude.toFixed(4)}° E</td>
                    <td className="p-2 text-amber-400">{log.speed.toFixed(1)} km/h</td>
                    <td className="p-2 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
