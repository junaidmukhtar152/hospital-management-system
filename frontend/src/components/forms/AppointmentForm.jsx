import React, { useState, useEffect } from "react";
import API from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarPlus,
  FaEdit,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
} from "react-icons/fa";
import PastTimeModal from "../PastTimeModal"; // Assuming this modal component is styled nicely

// --- Helper components ---
// Added subtle transition and better focus styling
const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm transition duration-150 ease-in-out focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  required = false,
  options = [],
  placeholder = "Select",
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm appearance-none bg-white transition duration-150 ease-in-out focus:ring-indigo-500 focus:border-indigo-500"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// New component for modern flash messages/toasts
const FlashMessage = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses = "flex items-center p-3 mb-4 rounded-lg shadow-md";
  let classes = "";
  let Icon = FaTimesCircle;

  if (type === "success") {
    classes = "bg-green-100 text-green-700 border border-green-200";
    Icon = FaCheckCircle;
  } else if (type === "error") {
    classes = "bg-red-100 text-red-700 border border-red-200";
    Icon = FaTimesCircle;
  }

  return (
    <div className={`${baseClasses} ${classes}`} role="alert">
      <Icon className="text-xl mr-3" />
      <span className="flex-grow">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-gray-500 hover:text-gray-700"
      >
        <FaTimes />
      </button>
    </div>
  );
};

// --- Main Component ---
const AppointmentForm = ({ initialData = {}, isEdit = false }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State for modern flash message
  const [flash, setFlash] = useState({ message: null, type: null });

  const [formData, setFormData] = useState({
    patientId: initialData.Patient_ID || "",
    doctorId: initialData.Employee_ID || "",
    date: initialData.Date || "",
    time: initialData.Time || "",
    reason: initialData.Reason || "",
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const showModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const showFlash = (message, type = "error") => {
    setFlash({ message, type });
    // Auto-hide the message after 5 seconds
    setTimeout(() => setFlash({ message: null, type: null }), 5000);
  };

  // Fetch doctors & patients
  useEffect(() => {
    const fetchData = async () => {
      setFlash({ message: null, type: null });
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [doctorsRes, patientsRes] = await Promise.all([
          API.get("/employees?role=Doctor", config),
          API.get("/patients", config),
        ]);
        setDoctors(doctorsRes.data);
        setPatients(patientsRes.data);
      } catch (err) {
        console.error(err);
        showFlash("Failed to fetch doctors or patients.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFlash({ message: null, type: null });

    const { patientId, doctorId, date, time, reason } = formData;
    if (!patientId || !doctorId || !date || !time || !reason) {
      showFlash("Please fill all required fields.", "error");
      return;
    }

    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    // Allow a small buffer (e.g., 5 minutes)
    const fiveMinutesAhead = new Date(now.getTime() + 5 * 60000);

    if (selectedDateTime < fiveMinutesAhead) {
      showModal(
        "You cannot book an appointment in the past. Please select a future date and time."
      );
      return;
    }

    try {
      setSubmitting(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let response;
      if (isEdit) {
        response = await API.put(
          `/appointments/${initialData.Appointment_ID}`,
          formData,
          config
        );
        showFlash("Appointment updated successfully!", "success");
      } else {
        response = await API.post("/appointments", formData, config);
        showFlash("Appointment booked successfully!", "success");
      }

      // Reset form if new
      if (!isEdit)
        setFormData({
          patientId: "",
          doctorId: "",
          date: "",
          time: "",
          reason: "",
        });
    } catch (err) {
      console.error(err);
      showFlash(
        "Failed to submit appointment. Please check your data and try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  // The main wrapper gives the card effect and controls the size
  return (
    <div>
      <div className="w-full max-w-xl bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-100">
        {/* Header */}
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-3 flex items-center">
          {isEdit ? (
            <FaEdit className="mr-3 text-yellow-500" />
          ) : (
            <FaCalendarPlus className="mr-3 text-indigo-600" />
          )}
          {isEdit ? "Edit Appointment" : "Book New Appointment"}
        </h2>

        {/* Loading State */}
        {loading && (
          <div className="p-10 flex flex-col items-center justify-center">
            <FaSpinner className="animate-spin text-indigo-500 text-3xl mb-3" />
            <div className="text-lg font-medium text-gray-600">
              Loading Data...
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Flash Messages */}
            <FlashMessage
              message={flash.message}
              type={flash.type}
              onClose={() => setFlash({ message: null, type: null })}
            />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient & Doctor Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SelectField
                  label="Patient"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                  options={patients.map((p) => ({
                    value: p.Patient_ID,
                    label: p.Name,
                  }))}
                  placeholder="Select Patient"
                />
                <SelectField
                  label="Doctor"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                  options={doctors.map((d) => ({
                    value: d.Employee_ID,
                    label: d.Name,
                  }))}
                  placeholder="Select Doctor"
                />
              </div>

              {/* Date & Time Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField
                  label="Date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={today}
                  required
                />
                <InputField
                  label="Time"
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Reason Textarea */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Reason for Appointment
                </label>
                <textarea
                  name="reason"
                  rows="4"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm transition duration-150 ease-in-out focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Briefly describe the reason for your visit..."
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-between sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex items-center justify-center px-6 py-2 text-white font-semibold rounded-lg shadow-md transition duration-150 ${
                    submitting
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }`}
                >
                  {submitting ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : isEdit ? (
                    <FaEdit className="mr-2" />
                  ) : (
                    <FaCalendarPlus className="mr-2" />
                  )}
                  {submitting
                    ? "Processing..."
                    : isEdit
                    ? "Update Appointment"
                    : "Book Appointment"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Past Time Modal */}
        <PastTimeModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="You cannot enter the past date/time "
          message={modalMessage}
        />
      </div>
    </div>
  );
};

export default AppointmentForm;
