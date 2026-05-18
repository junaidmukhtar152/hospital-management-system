import React, { useState } from "react";
import API from "../../api/config";
import { useAuth } from "../../context/AuthContext";

const PrescriptionForm = ({ patientId, doctorId, onSave, onClose }) => {
  const { token } = useAuth();
  const [prescription, setPrescription] = useState({
    medicinesList: "",
    dosage: "",
    duration: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrescription((prev) => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  // Only medicinesList is required
  if (!prescription.medicinesList) {
    alert("Please enter medicines.");
    return;
  }

 const payload = {
  patientId: patientId,               // lowercase 'patientId'
  medicinesList: prescription.medicinesList, // lowercase 'medicinesList'
  dosage: prescription.dosage || null,
  duration: prescription.duration || null,
};



  try {
    setSubmitting(true);
    await API.post("/prescriptions", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Prescription issued successfully!");
    if (onSave) onSave();
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Failed to issue prescription.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-40 overflow-auto p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg space-y-4 border border-green-200"
      >
        <h4 className="text-2xl font-bold text-green-600 border-b pb-2 mb-4">
          ✍️ New Prescription
        </h4>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Medicines List:
          </label>
          <textarea
            name="medicinesList"
            rows="4"
            value={prescription.medicinesList}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Dosage:</label>
            <input
              name="dosage"
              value={prescription.dosage}
              onChange={handleChange}
            
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Duration:</label>
            <input
              name="duration"
              value={prescription.duration}
              onChange={handleChange}
              
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className={`flex-1 py-3 rounded-md font-semibold text-white ${
              submitting ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {submitting ? "Issuing..." : "Issue Prescription"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-md font-semibold border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;
