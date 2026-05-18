import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import API from '../api/config';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    patientsCheckedIn: 0,
    availableRooms: 0,
    totalRooms: 0,
    pendingBills: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [apptRes, dashRes] = await Promise.all([
          API.get('/appointments/total'),
          API.get('/dashboard/receptionist')
        ]);
        setStats({
          totalAppointments: apptRes.data.totalAppointments || 0,
          patientsCheckedIn: dashRes.data.patientsCheckedIn || 0,
          availableRooms: dashRes.data.availableRooms || 0,
          totalRooms: dashRes.data.totalRooms || 0,
          pendingBills: dashRes.data.pendingBills || 0,
        });
      } catch (err) {
        console.error('Stats Sync Error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12">
      {/* --- Header --- */}
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Hello, {user?.name || 'Receptionist'}
        </h1>
        <p className="text-slate-500 font-medium text-lg mt-2">
          Central Hub for Front-Desk Operations
        </p>
      </header>

      {/* --- Metrics Grid --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Scheduled Today" 
          value={loading ? '...' : stats.totalAppointments} 
          icon="📅" 
          color="indigo" 
        />
        <StatCard 
          title="Patient Check-ins" 
          value={loading ? '...' : stats.patientsCheckedIn} 
          icon="✅" 
          color="emerald" 
        />
        <StatCard 
          title="Room Availability" 
          value={loading ? '...' : `${stats.availableRooms}/${stats.totalRooms}`} 
          icon="🛌" 
          color="amber" 
        />
        <StatCard 
          title="Unpaid Invoices" 
          value={loading ? '...' : stats.pendingBills} 
          icon="💳" 
          color="rose" 
        />
      </section>

      {/* --- Large Navigation Actions --- */}
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">
          Management Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <NavTile 
            title="Patient Directory"
            desc="Register new patients and view medical histories."
            icon="👥"
            onClick={() => navigate('/patients')}
            accent="bg-indigo-600"
          />
          <NavTile 
            title="Appointment Calendar"
            desc="Manage time slots and doctor availability."
            icon="🕒"
            onClick={() => navigate('/appointments')}
            accent="bg-purple-600"
          />
          <NavTile 
            title="Room Management"
            desc="Track occupancy and assign patient rooms."
            icon="🏢"
            onClick={() => navigate('/rooms')}
            accent="bg-amber-500"
          />
          
          <NavTile 
            title="Emergency Intake"
            desc="Quick registration for urgent care cases."
            icon="🚨"
            onClick={() => navigate('/patients/new?type=emergency')}
            accent="bg-rose-600"
          />
        </div>
      </section>
    </div>
  );
};

// Sub-component for clean Navigation
const NavTile = ({ title, desc, icon, onClick, accent }) => (
  <button
    onClick={onClick}
    className="group relative bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
  >
    <div className={`absolute top-0 left-0 w-2 h-full ${accent}`} />
    <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform">{icon}</span>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </button>
);

export default ReceptionistDashboard;