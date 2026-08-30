import React, { useState, useEffect } from 'react';
import StudentApp from './components/StudentApp';
import DriverApp from './components/DriverApp';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import { Smartphone, ShieldCheck, MapPin, User, LogOut } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('student');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('user_role');
    const name = localStorage.getItem('user_name');
    if (token) {
      setUser({ role, name });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('student')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-xl">🚌</div>
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                COLLEGE BUS <span className="text-cyan-400 font-mono">LIVE TRACKER</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">Karad to ABIT Polytechnic Satara (NH48)</p>
            </div>
          </div>

          <nav className="flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-800/80 text-xs">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Student App & Map</span>
            </button>

            <button
              onClick={() => setActiveTab('driver')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'driver'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Driver GPS Terminal</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>⚙️ Admin Panel</span>
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-bold text-white block leading-none">{user.name}</span>
                  <span className="text-[10px] text-cyan-400 capitalize">{user.role} Account</span>
                </div>
                <button onClick={handleLogout} className="ml-2 text-slate-400 hover:text-red-400 p-1">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                <User className="w-4 h-4" />
                <span>JWT Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'student' && <StudentApp />}
        {activeTab === 'driver' && <DriverApp />}
        {activeTab === 'admin' && <AdminPanel />}
      </main>

      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        Karad (17.2833° N, 74.1825° E) ➔ ABIT Polytechnic Satara (17.6550° N, 74.0100° E) via NH48
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(data) => setUser({ role: data.role, name: data.name })}
      />
    </div>
  );
}
