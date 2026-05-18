import React, { useState } from "react";
import API from "../../api/config";

const TestReportForm = ({ patientId, onClose, onSave }) => {
  const [type, setType] = useState("");
  const [result, setResult] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(
        "/reports",
        {
          Patient_ID: patientId,
          Type: type,
          Result: result,
          Date: date,
        }
      );
      alert("Test report added!");
      onSave && onSave();
      onClose && onClose();
    } catch (err) {
      alert("Failed to add test report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded w-96 flex flex-col gap-3"
      >
        <h2 className="text-xl font-bold mb-2">Add Test Report</h2>
        <input
          type="text"
          placeholder="Test Type (e.g. Blood, X-Ray)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <textarea
          placeholder="Result"
          value={result}
          onChange={(e) => setResult(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestReportForm;