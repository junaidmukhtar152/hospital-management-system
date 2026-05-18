import React, { useState, useEffect, useMemo, useCallback } from "react";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import { useAuth } from "../context/AuthContext";
import API from "../api/config";
import { useNavigate } from "react-router-dom";
import PrescriptionForm from "../components/forms/PrescriptionForm";
import TestReportForm from "../components/forms/TestReportForm";

const DoctorDashboard = () => {
  const { user, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const doctorId = user?.Employee_ID;
  const token = localStorage.getItem("jwtToken");

  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptionPatient, setPrescriptionPatient] = useState(null);
  const [testReportPatient, setTestReportPatient] = useState(null);

  // Format date & time
  const formatDateWithDay = (dateString) => {
    if (!dateString) return "Invalid date";
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return "Invalid date";
    const day = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const date = dateObj.toLocaleDateString("en-CA");
    return `${day}, ${date}`;
  };

  const formatTimeOnly = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const timeObj = new Date(`1970-01-01T${timeString}`);
      return timeObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (isAuthLoading || !doctorId) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const statsRes = await API.get("/dashboard/doctor", config);
      const apptsRes = await API.get("/dashboard/appointments/doctor", config);

      setStats(statsRes.data);
      setAppointments(apptsRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthLoading, doctorId, token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Change appointment status
  const handleChangeStatus = async (appointment, newStatus) => {
    const confirm = window.confirm(
      `Mark ${appointment.Patient_Name} as "${newStatus}"?`
    );
    if (!confirm) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await API.put(
        `/appointments/${appointment.Appointment_ID}/status`,
        { Status: newStatus },
        config
      );

      setAppointments((prev) =>
        prev.map((a) =>
          a.Appointment_ID === appointment.Appointment_ID
            ? { ...a, Status: newStatus }
            : a
        )
      );
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleQuickView = (appointment) => setSelectedPatient(appointment);
  const handlePrescription = (patient) => setPrescriptionPatient(patient);

  // Today & All Appointments
  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return appointments
      .filter((appt) => appt.Date?.includes(today))
      .map((appt) => ({
        ...appt,
        formattedDate: formatDateWithDay(appt.Date),
        formattedTime: formatTimeOnly(appt.Time),
      }));
  }, [appointments]);

  const allAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => {
        // 1. Checked status: checked goes last
        if (a.Status === "Checked" && b.Status !== "Checked") return 1;
        if (a.Status !== "Checked" && b.Status === "Checked") return -1;
        // 2. By date (older first)
        const dateA = new Date(a.Date + "T" + (a.Time || "00:00"));
        const dateB = new Date(b.Date + "T" + (b.Time || "00:00"));
        return dateA - dateB;
      })
      .map((appt) => ({
        ...appt,
        formattedDate: formatDateWithDay(appt.Date),
        formattedTime: formatTimeOnly(appt.Time),
      }));
  }, [appointments]);

  const checkedCount = appointments.filter((a) => a.Status === "Checked")
    .length;
  const scheduledCount = appointments.filter(
    (a) => a.Status === "Scheduled"
  ).length;

const appointmentColumns = [
  { header: "Patient ID", accessor: "Patient_ID" }, // <-- Add this line
  { header: "Date", accessor: "formattedDate" },
  { header: "Time", accessor: "formattedTime" },
  { header: "Patient", accessor: "Patient_Name" },
  { header: "Reason", accessor: "Reason" },
  { header: "Status", accessor: "Status" },
];

  if (loading) return <p className="p-6 text-center">Loading dashboard...</p>;

  return (
    <div className="w-full min-h-screen p-6 bg-gray-50">
      <h2 className="text-3xl font-bold mb-6">
        🩺 Welcome Back, Dr. {user?.name || "Doctor"}
      </h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Today's Appointments"
          value={todayAppointments.length}
        />
        <StatCard title="Total Patients" value={stats?.totalPatients || 0} />
        <StatCard title="Pending Reports" value={stats?.pendingReports || 0} />
      </div>

      {/* Analytics */}
      <div className="bg-white p-6 rounded shadow mb-10">
        <h3 className="text-xl font-semibold mb-4">
          📊 Appointments Analytics
        </h3>
        <p>✅ Checked: {checkedCount}</p>
        <p>📅 Scheduled: {scheduledCount}</p>
      </div>

      {/* Today's Appointments */}
      {todayAppointments.length > 0 ? (
        <DataTable
          title="Today's Appointments"
          columns={appointmentColumns}
          data={todayAppointments}
          actions={[
            {
              label: "✅ Mark Checked",
              handler: (row) => handleChangeStatus(row, "Checked"),
              show: (row) => row.Status !== "Checked",
            },
            {
              label: "👁️ Quick View",
              handler: handleQuickView,
              // Quick View can always show, or add a show if you want to restrict
            },
            {
              label: "📝 Write Prescription",
              handler: handlePrescription,
              show: (row) => row.Status !== "Checked", // <-- Add this
            },
            {
              label: "🧪 Add Test Report",
              handler: (row) => setTestReportPatient(row),
              show: (row) => row.Status !== "Checked", // <-- Add this
            },
          ]}
        />
      ) : (
        <p className="text-center text-gray-500 text-lg mt-6">
          🌟 No appointments today! Take a deep breath and enjoy a calm moment.
        </p>
      )}
      <p className="text-center text-gray-800 text-2xl font-bold mt-6
"> 
          Scheduled Appointments for the Future
        </p>
      {/* All Appointments */}
      <div className="mt-10">
        {allAppointments.length > 0 ? (
          <DataTable
            title="All Appointments"
            columns={appointmentColumns}
            data={allAppointments}
            actions={[
              {
                label: "✅ Mark Checked",
                handler: (row) => handleChangeStatus(row, "Checked"),
                show: (row) => row.Status !== "Checked",
              },
              {
                label: "👁️ Quick View",
                handler: handleQuickView,
                // Quick View can always show, or add a show if you want to restrict
              },
              {
                label: "📝 Write Prescription",
                handler: handlePrescription,
                show: (row) => row.Status !== "Checked", // <-- Add this
              },
              {
                label: "🧪 Add Test Report",
                handler: (row) => setTestReportPatient(row),
                show: (row) => row.Status !== "Checked", // <-- Add this
              },
            ]}
          />
        ) : (
          <p className="text-center text-gray-500 text-lg mt-6">
            ✨ No appointments scheduled yet. The schedule is all yours! 🗓️
          </p>
        )}
      </div>

      {/* Quick View Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-2">Patient Quick View</h2>
            <p>
              <strong>Name:</strong> {selectedPatient.Patient_Name}
            </p>
            <p>
              <strong>Reason:</strong> {selectedPatient.Reason}
            </p>
            <p>
              <strong>Time:</strong> {selectedPatient.formattedTime}
            </p>

            <div className="mt-4 flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() =>
                  navigate(`/patients/${selectedPatient.Patient_ID}`)
                }
              >
                Full Profile
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setSelectedPatient(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Form */}
      {prescriptionPatient && (
        <PrescriptionForm
          patientId={prescriptionPatient.Patient_ID}
          doctorId={doctorId}
          onClose={() => setPrescriptionPatient(null)}
          onSave={() => setPrescriptionPatient(null)}
        />
      )}

      {/* Test Report Form Modal */}
      {testReportPatient && (
        <TestReportForm
          patientId={testReportPatient.Patient_ID}
          onClose={() => setTestReportPatient(null)}
          onSave={() => setTestReportPatient(null)}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
