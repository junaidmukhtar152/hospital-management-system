import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import { useAuth } from "../context/AuthContext";
import API from "../api/config";
import BillForm from "../components/forms/BillForm";

// --- Icons (Merged into a cleaner set) ---
const Icons = {
  Plus: () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
};

// --- Refined Quick Book Modal ---
const QuickBookModal = ({ patient, onClose }) => {
  const [doctors, setDoctors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    reason: "Follow-up Visit"
  });

  useEffect(() => {
    API.get("/employees?role=Doctor")
      .then(res => setDoctors(res.data || []))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  const handleQuickBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/appointments", { patientId: patient.Patient_ID, ...formData });
      onClose();
      // Use a toast here if you have one, alert is a UX killer
      alert("Appointment successfully scheduled.");
    } catch (err) {
      alert("Scheduling conflict: Please select another time.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 transform transition-all scale-100">
        <div className="bg-indigo-600 px-6 py-5 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Quick Schedule</h2>
            <p className="text-indigo-100 text-xs opacity-90 mt-0.5">Booking for {patient.Name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Icons.Close />
          </button>
        </div>

        <form onSubmit={handleQuickBook} className="p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Attending Physician</label>
            <select 
              required
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
              value={formData.doctorId}
              onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
            >
              <option value="">Choose a doctor...</option>
              {doctors.map(d => <option key={d.Employee_ID} value={d.Employee_ID}>{d.Name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Preferred Date</label>
              <input 
                type="date" required 
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                min={new Date().toISOString().split("T")[0]}
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Time Slot</label>
              <input 
                type="time" required 
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all flex justify-center items-center active:scale-[0.97] disabled:opacity-50"
          >
            {submitting ? "Confirming..." : "Confirm Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
};

const PatientManagerPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [quickBookModal, setQuickBookModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState("");

  const isReceptionist = user?.role === "Receptionist" || user?.role === "Admin";

  useEffect(() => {
    API.get("/patients").then(res => {
      setPatients((res.data || []).reverse());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const searchedPatients = useMemo(() => {
    const term = search.toLowerCase();
    return patients.filter(p => 
      p.Name?.toLowerCase().includes(term) || 
      String(p.Patient_ID).includes(term)
    );
  }, [search, patients]);

  const patientActions = [
    {
      label: " ,View Profile",
      handler: (p) => navigate(`/patients/${p.Patient_ID}`),
      className: "px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-md transition-colors font-medium text-xs",
    },
    {
      label: "Book Appointment",
      handler: (p) => { setSelectedPatient(p); setQuickBookModal(true); },
      role: "Receptionist",
      className: "px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors font-bold text-xs",
    },
    {
      label: "Generate Invoice",
      handler: (p) => { setSelectedPatient(p); setInvoiceModal(true); },
      role: "Receptionist",
      className: "px-3 py-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors font-bold text-xs",
    }
  ];

  const filteredActions = patientActions.filter(a => !a.role || user?.role === a.role || user?.role === "Admin");

  return (
    <div className="w-full min-h-screen bg-[#F1F5F9] p-4 md:p-8 lg:px-12">
      {/* --- Header Section --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-blue-700 tracking-tight">Patient Directory</h1>
          <p className="text-slate-500 text-sm font-medium">Streamlined record management and scheduling</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group flex-grow md:flex-grow-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center">
              <Icons.Search />
            </div>
            <input
              type="text" 
              placeholder="Search by name or ID..."
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-80 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>

          {isReceptionist && (
            <button
              onClick={() => navigate("/patients/new")}
              className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:translate-y-0.5"
            >
              <Icons.Plus /> New Patient
            </button>
          )}
        </div>
      </div>

      {/* --- Main Table Container --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-4">
             <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
             <p className="text-slate-400 font-semibold animate-pulse">Syncing Database...</p>
          </div>
        ) : searchedPatients.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center p-6">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
                <Icons.Search />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No patients found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">We couldn't find any records matching "{search}". Try a different name or ID.</p>
          </div>
        ) : (
          <DataTable
            data={searchedPatients}
            columns={[
              { header: "ID", accessor: "Patient_ID" },
              { header: "Patient Name", accessor: "Name" },
              { header: "Gender", accessor: "Gender" },
              { header: "Contact Info", accessor: "Phone" },
            ]}
            actions={filteredActions}
          />
        )}
      </div>

      {/* --- Modals with improved Z-indexing --- */}
      {quickBookModal && selectedPatient && (
        <QuickBookModal patient={selectedPatient} onClose={() => setQuickBookModal(false)} />
      )}

      {invoiceModal && selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <BillForm selectedPatient={selectedPatient} onClose={() => setInvoiceModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagerPage;