import React, { useEffect, useState } from "react";
import API from "../../api/config";

const PrescriptionHistoryTab = ({ data, clinicName = "EasyCare",  clinicLogo = "/logo.png" }) => {
  const [prescriptions, setPrescriptions] = useState([]);

  // Fetch patient and doctor names if missing
  useEffect(() => {
    const fetchNames = async () => {
      const updatedData = await Promise.all(
        data.map(async (p) => {
          let patientName = p.Patient_Name || "";
          let doctorName = p.Doctor_Name || "";

          if (!patientName && p.Patient_ID) {
            try {
              const res = await API.get(`/patients/${p.Patient_ID}`);
              patientName = res.data.Name;
            } catch (err) {
              console.error("Failed to fetch patient:", err);
            }
          }

          if (!doctorName && p.Employee_ID) {
            try {
              const res = await API.get(`/employees/${p.Employee_ID}`);
              doctorName = res.data.Name;
            } catch (err) {
              console.error("Failed to fetch doctor:", err);
            }
          }

          return { ...p, Patient_Name: patientName, Doctor_Name: doctorName };
        })
      );
      setPrescriptions(updatedData);
    };
    fetchNames();
  }, [data]);

  // Updated Print Logic to print ONLY the specific card
const handlePrintSingle = (id) => {
    const printContent = document.getElementById(`print-section-${id}`);
    if (!printContent) return;

    // 1. Clone the content to modify it without affecting the live DOM
    const printClone = printContent.cloneNode(true);
    
    // 2. Select and remove all elements with the 'no-print' class from the clone
    const noPrintElements = printClone.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.remove());

    // 3. Use the cleaned clone's HTML for printing
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printClone.outerHTML;
    
    // Add temporary inline print styling for clarity (optional, but helps PDF formatting)
    const style = document.createElement('style');
    style.innerHTML = `
      body { margin: 0; padding: 0; }
      #print-section-${id} { width: 100%; border: none !important; box-shadow: none !important; }
    `;
    document.head.appendChild(style);

    window.print();
    
    // Clean up and restore
    document.head.removeChild(style);
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload to restore React event listeners
};
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;
    try {
      await API.delete(`/prescriptions/${id}`);
      setPrescriptions((prev) => prev.filter((p) => p.Prescription_ID !== id));
      alert("Prescription deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete prescription.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-2 bg-gray-50 min-h-screen">
      <h4 className="font-bold text-lg text-gray-800 mb-3 text-center">
        History ({prescriptions.length})
      </h4>

      <div className="space-y-4">
        {prescriptions.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">No records found.</p>
        ) : (
          prescriptions.map((p) => (
            <div 
              key={p.Prescription_ID} 
              // ID used for printing just this card
              id={`print-section-${p.Prescription_ID}`} 
              className="bg-white rounded shadow-sm border border-gray-300 overflow-hidden"
            >
              {/* COMPACT CONTENT AREA */}
              <div className="p-3">
                {/* Header: Logo + Clinic + Date */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    {clinicLogo && <img src={clinicLogo} alt="Logo" className="h-8 w-8 object-contain" />}
                    <div>
                      <h2 className="text-sm font-bold text-gray-800 leading-tight">{clinicName}</h2>
                      <p className="text-[10px] text-gray-500">RX #{p.Prescription_ID}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-700">
                      {new Date(p.Date).toLocaleDateString("en-GB", { year: "2-digit", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Patient / Doctor Row */}
                <div className="flex justify-between bg-gray-50 p-2 rounded text-xs mb-2">
                  <div>
                    <span className="text-gray-500 mr-1">Patient:</span>
                    <span className="font-semibold text-gray-900">{p.Patient_Name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 mr-1">Dr:</span>
                    <span className="font-semibold text-gray-900">{p.Doctor_Name}</span>
                  </div>
                </div>

                {/* Medicines Section */}
                <div className="mb-2">
                  <div className="flex gap-2 text-xs">
                    <span className="font-serif font-bold text-teal-700 italic text-base">Rx</span>
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap text-gray-800 font-medium leading-snug">
                        {p.Medicines_List}
                      </p>
                      
                      {/* Dosage/Duration Inline */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] text-gray-600">
                        {p.Dosage && <span><strong>Dosage:</strong> {p.Dosage}</span>}
                        {p.Duration && <span><strong>Duration:</strong> {p.Duration}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature - Very Compact */}
                <div className="flex justify-end mt-1">
                  <div className="text-center">
                    <div className="w-20 border-b border-gray-300 mb-0.5"></div>
                    <span className="text-[9px] text-gray-400 uppercase">Signature</span>
                  </div>
                </div>
              </div>

              {/* BUTTONS: BOTTOM CENTER (Inside the card) */}
              <div className="no-print bg-gray-50 border-t border-gray-200 py-1.5 flex justify-center items-center gap-3">
                
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(p.Prescription_ID)}
                  className="flex items-center gap-1 px-3 py-1 bg-white text-red-600 border border-red-200 rounded hover:bg-red-50 text-xs font-medium shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>

                {/* Print Button */}
                <button
                  onClick={() => handlePrintSingle(p.Prescription_ID)}
                  className="flex items-center gap-1 px-3 py-1 bg-teal-600 text-white border border-teal-600 rounded hover:bg-teal-700 text-xs font-medium shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                
              </div>
            </div>
          ))
        )}
      </div>

      {/* CSS to ensure full width printing for single cards */}
      <style>
        {`@media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          /* Logic to show only the specific card being printed if we swapped innerHTML */
          body { background: white; }
          div[id^="print-section-"] { 
            visibility: visible; 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            margin: 0; 
            padding: 20px;
            border: none;
            box-shadow: none;
          }
        }`}
      </style>
    </div>
  );
};

export default PrescriptionHistoryTab;