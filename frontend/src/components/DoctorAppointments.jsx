// src/components/DoctorAppointments.jsx (Renamed from AppointmentCalendar)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import API from '../api/config';
import { useAuth } from '../context/AuthContext';
import DataTable from './DataTable'; // Assuming this component is available

const DoctorAppointments = ({ doctorId }) => {
    const { token } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all appointments for the given doctor ID
    const fetchAppointments = useCallback(async () => {
        if (!doctorId) return;
        
        try {
            setLoading(true);
            setError(null);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Fetch all appointments for the doctor
            const res = await API.get(`/appointments?doctorId=${doctorId}`, config); 
            
            // Assuming the API returns a structured array of appointments
            setAppointments(res.data);
        } catch (err) {
            console.error('Failed to fetch doctor appointments:', err);
            setError("Could not load appointments. Check API or Doctor ID.");
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [doctorId, token]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Define columns for the DataTable
    const appointmentColumns = useMemo(() => [
        { header: 'Date', accessor: 'Date' },
        { header: 'Time', accessor: 'Time' },
        { header: 'Patient Name', accessor: 'Patient_Name' }, // Requires join in API
        { header: 'Reason', accessor: 'Reason' },
        { header: 'Status', accessor: 'Status' },
    ], []);

    if (loading) return <div className="p-4 text-center text-gray-500">Loading full appointment list...</div>;
    if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-blue-700 mb-4">🗓️ Full Appointment Schedule</h3>
            
            {appointments.length === 0 ? (
                <p className="text-gray-500">No appointments found for this doctor.</p>
            ) : (
                <DataTable
                    title={`All Appointments (${appointments.length})`}
                    columns={appointmentColumns}
                    data={appointments.map(appt => ({
                        ...appt,
                        // ⚠️ The API must return Patient_Name, Patient_ID in the appointment object
                        // For now, mapping placeholders or assuming API returns the full object structure
                        Patient_Name: appt.Patient_Name || `Patient ${appt.Patient_ID}`, 
                        Status: appt.Status || 'Scheduled',
                    }))}
                    // Actions can be added here (e.g., 'View Patient Profile')
                />
            )}
        </div>
    );
};

export default DoctorAppointments;