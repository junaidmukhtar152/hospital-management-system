import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/config';
import { useAuth } from '../context/AuthContext';
import PrescriptionForm from './forms/PrescriptionForm';
import PrescriptionHistoryTab from './PatientProfile/PrescriptionHistoryTab';
import TestReportHistoryTab from './PatientProfile/TestReportHistoryTab';

const PatientProfile = () => {
  const { id } = useParams();
  const { user } = useAuth(); // get role and id
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  const fetchPatient = async () => {
    try {
      const res = await API.get(`/patients/${id}`);
      setPatient(res.data);
    } catch (err) {
      console.error('Failed to fetch patient profile:', err);
      alert('Could not load patient profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [id]);

  if (loading) return <p className="p-6">Loading patient data...</p>;
  if (!patient) return <p className="p-6">Patient not found.</p>;

  const tabs = ['profile', 'prescriptions', 'reports', 'billing'];
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dateString.split('T')[0];
  };


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">{patient.Name}'s Profile</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 font-semibold ${
              activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <p><strong>Patient ID:</strong> {patient.Patient_ID}</p>
            <p><strong>DOB:</strong> {formatDate(patient.DOB)}</p>
            <p><strong>Gender:</strong> {patient.Gender}</p>
            <p><strong>Phone:</strong> {patient.Phone}</p>
            <p className="sm:col-span-2"><strong>Address:</strong> {patient.Address}</p>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <>
            {user.role === 'doctor' && !showPrescriptionForm && (
              <button
                onClick={() => setShowPrescriptionForm(true)}
                className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                ✍️ Issue Prescription
              </button>
            )}

            {showPrescriptionForm && user.role === 'doctor' && (
              <PrescriptionForm
                patientId={patient.Patient_ID}
                doctorId={user.Employee_ID}
                onSave={() => {
                  setShowPrescriptionForm(false);
                  fetchPatient();
                }}
                onClose={() => setShowPrescriptionForm(false)}
              />
            )}

            <PrescriptionHistoryTab data={patient.prescriptions || []} />
          </>
        )}

        {activeTab === 'reports' && (
          <TestReportHistoryTab data={patient.reports || []} />
        )}

        {activeTab === 'billing' && (
          <ul className="list-disc pl-5">
            {patient.bills?.map(b => (
              <li key={b.Bill_ID}>Amount: ${b.Amount} ({b.Status})</li>
            )) || <p>No bills.</p>}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
