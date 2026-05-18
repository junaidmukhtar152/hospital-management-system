// src/pages/AppointmentsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import DataTable from "../components/DataTable";
import AppointmentForm from "../components/forms/AppointmentForm";
import { useAuth } from "../context/AuthContext";
import API from "../api/config";

const AppointmentsPage = () => {
  const { user } = useAuth();
  const isReceptionist = user?.role === "Receptionist";

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ Format date safely
  const formatDateWithDay = (dateString) => {
    if (!dateString) return "Invalid date";
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return "Invalid date";
    const day = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const date = dateObj.toLocaleDateString("en-CA"); // YYYY-MM-DD
    return `${day}, ${date}`;
  };

  // ✅ Format time safely
  const formatTimeOnly = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const timeObj = new Date(`1970-01-01T${timeString}`);
      return timeObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "N/A";
    }
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const response = await API.get("/appointments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAppointments(response.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Cancel appointment
  const handleCancel = async (appointmentId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmCancel) return;

    try {
      setActionLoading(true);
      await API.put(`/appointments/cancel/${appointmentId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.Appointment_ID === appointmentId
            ? { ...appt, Status: "Cancelled" }
            : appt
        )
      );

      alert("Appointment cancelled ✅");
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Cancel failed ❌");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete cancelled appointment
  const handleDelete = async (row) => {
    const appointmentId = row.Appointment_ID;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this cancelled appointment?"
    );
    if (!confirmDelete) return;

    try {
      setActionLoading(true);
      await API.delete(`/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAppointments((prev) =>
        prev.filter((appt) => appt.Appointment_ID !== appointmentId)
      );
      alert("Appointment deleted ✅");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed ❌");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Format date and time for DataTable
  const formattedAppointments = useMemo(
    () =>
      appointments.map((appt) => ({
        ...appt,
        formattedDate: formatDateWithDay(appt.Date),
        formattedTime: formatTimeOnly(appt.Time),
      })),
    [appointments]
  );

  // Columns
  const appointmentColumns = [
    { header: "ID", accessor: "Appointment_ID" },
    { header: "Date", accessor: "formattedDate" },
    { header: "Time", accessor: "formattedTime" },
    { header: "Patient", accessor: "Patient_Name" },
    { header: "Doctor", accessor: "Doctor_Name" },
    { header: "Reason", accessor: "Reason" },
    { header: "Status", accessor: "Status" },
  ];

  // Actions
  const appointmentActions = [
    { label: "Cancel", handler: (row) => handleCancel(row.Appointment_ID) },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-gray-600 text-lg">
        Loading Appointments...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Manage your appointments here!</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all scheduled appointments</p>
        </div>

        {isReceptionist && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold w-full sm:w-auto"
          >
            Book Appointment
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border p-4 overflow-x-auto">
        <DataTable
          title="All Scheduled Appointments"
          columns={appointmentColumns}
          data={formattedAppointments}
          actions={appointmentActions}
          deleteAction={handleDelete}
        />
      </div>

      {/* APPOINTMENT FORM MODAL */}
      {isModalOpen && (
  <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
    <div>
      {/* Close icon removed */}
      <AppointmentForm onClose={() => setIsModalOpen(false)} />
    </div>
  </div>
)}

      {/* LOADING OVERLAY */}
      {actionLoading && (
        <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center">
          <div className="bg-white px-6 py-3 rounded-lg shadow text-blue-700 font-semibold">
            Processing...
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
