// src/components/forms/RoomAssignmentForm.jsx
import React, { useState, useEffect } from 'react';
import API from '../../api/config';

const RoomAssignmentForm = ({ room, onAssign }) => {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    admissionDate: new Date().toISOString().slice(0, 16),
  });
  const [loadingPatients, setLoadingPatients] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        const res = await API.get('/patients');
        setPatients(res.data);
      } catch (err) {
        console.error('Failed to fetch patients:', err);
        alert('Error fetching patients from server.');
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/rooms/assign', {
        roomId: room.Room_ID,
        patientId: formData.patientId,
        admissionDate: formData.admissionDate,
      });
      alert(`Patient assigned to Room ${room.Room_ID} successfully.`);
      onAssign();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error assigning patient.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <p className="font-semibold">
        Assigning to Room {room.Room_ID} ({room.Room_Type})
      </p>

      <div>
        <label>Select Patient:</label>
        <select
          name="patientId"
          value={formData.patientId}
          onChange={handleChange}
          required
          className="w-full border rounded px-2 py-1"
          disabled={loadingPatients}
        >
          <option value="">Select Patient</option>
          {patients.map(p => (
            <option key={p.Patient_ID} value={p.Patient_ID}>
              {p.Name} (ID: {p.Patient_ID})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Admission Date/Time:</label>
        <input
          type="datetime-local"
          name="admissionDate"
          value={formData.admissionDate}
          onChange={handleChange}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Confirm Admission
      </button>
    </form>
  );
};

export default RoomAssignmentForm;
