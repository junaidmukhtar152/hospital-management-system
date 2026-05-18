import React, { useState, useEffect } from "react";
import API from "../../api/config";
import { FaSpinner, FaTimes } from "react-icons/fa";

const QuickBookModal = ({ patient, onClose, onSuccess }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    reason: "General Consultation" // Default reason
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get("/employees?role=Doctor");
        setDoctors(res.data || []);
      } catch (err) {
        console.error("Error fetching doctors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        patientId: patient.Patient_ID,
        ...formData
      };
      await API.post("/appointments", payload);
      alert("Appointment Booked Successfully! ✅");
      onSuccess();
    } catch (err) {
      alert("Booking failed. Please check doctor availability.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-blue-600 font-bold">Loading Doctors...</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl w-full max-w-md relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400"><FaTimes /></button>
      
      <h2 className="text-xl font-bold text-gray-800 mb-1">Quick Book</h2>
      <p className="text-sm text-blue-600 mb-6">Patient: {patient.Name}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Select Doctor</label>
          <select 
            required
            className="w-full border p-2 rounded-lg"
            value={formData.doctorId}
            onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
          >
            <option value="">Choose a Doctor...</option>
            {doctors.map(dr => <option key={dr.Employee_ID} value={dr.Employee_ID}>{dr.Name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Date</label>
            <input 
              type="date" required className="w-full border p-2 rounded-lg"
              value={formData.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Time</label>
            <input 
              type="time" required className="w-full border p-2 rounded-lg"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
            />
          </div>
        </div>

        <button 
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center items-center"
        >
          {submitting ? <FaSpinner className="animate-spin mr-2"/> : "Confirm Appointment"}
        </button>
      </form>
    </div>
  );
};

export default QuickBookModal;