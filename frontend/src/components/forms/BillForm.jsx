import React, { useState } from "react";
import API from "../../api/config";

const BillForm = ({ onClose, onSubmit, selectedPatient }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hospitalName = "EasyCare Hospital";
  const hospitalTagline = "Quality Care, Simplified";
  const today = new Date();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await API.post("/bills", {
        patientId: selectedPatient.Patient_ID,
        amount: parseFloat(amount),
        description: description,
        date: today,
      });

      // Small delay to ensure UI updates before print dialog opens
      setTimeout(() => {
        window.print();
        if (onSubmit) onSubmit();
      }, 300);
      
    } catch (error) {
      alert("Error saving bill to database.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex justify-center items-center p-4 z-[100] print:p-0 print:bg-white">
      <div 
        id="print-area" 
        className="bg-white w-full max-w-[380px] p-6 shadow-2xl rounded-xl print:shadow-none print:max-w-full print:p-3 print:m-0"
      >
        {/* HOSPITAL HEADER */}
        <div className="text-center mb-4 print:mb-3">
          <h1 className="text-2xl font-black text-blue-600 uppercase tracking-tighter print:text-black print:text-xl">
            {hospitalName}
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] print:text-[9px]">
            {hospitalTagline}
          </p>
          <div className="mt-2 border-b-2 border-black w-12 mx-auto print:mt-1"></div>
        </div>

        {/* INVOICE METADATA */}
        <div className="text-[11px] font-mono space-y-1 mb-4 border-b border-gray-100 pb-3 print:border-black print:text-[10px] print:mb-3 print:pb-2">
          <div className="flex justify-between">
            <span className="text-gray-400 print:text-black font-bold">DATE:</span>
            <span>{today.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 print:text-black font-bold">TIME:</span>
            <span>{today.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 print:text-black font-bold">PATIENT ID:</span>
            <span>#{selectedPatient?.Patient_ID}</span>
          </div>
          <div className="flex justify-between uppercase">
            <span className="text-gray-400 print:text-black font-bold">NAME:</span>
            <span className="font-bold">{selectedPatient?.Name}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 print:space-y-3">
          {/* DESCRIPTION */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase print:hidden">Description of Services</label>
            <input
              type="text"
              required
              placeholder="e.g. OPD Consultation, Blood Test"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-b border-gray-200 px-0 py-2 text-sm focus:border-blue-500 outline-none font-medium print:border-none print:py-1 print:text-xs"
            />
          </div>

          {/* AMOUNT */}
          <div className="bg-blue-50 p-4 rounded-lg print:bg-white print:border-y print:border-dashed print:border-black print:rounded-none print:p-2">
            <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1 print:text-black print:text-[9px] print:mb-0">Total Payable</label>
            <div className="flex items-center">
              <span className="text-lg font-bold mr-1 print:text-base">Rs.</span>
              <input
                type="number"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent px-0 py-1 text-2xl font-black focus:ring-0 outline-none print:text-xl print:py-0"
              />
            </div>
          </div>

          {/* FOOTER MESSAGE */}
          <div className="text-center space-y-2 print:space-y-1 print:mt-3">
            <p className="text-[9px] text-gray-400 italic print:text-[8px] print:text-black">
              Thank you for visiting {hospitalName}.
            </p>
            <div className="text-[8px] font-mono text-gray-300 print:text-black print:text-[7px]">
              ------------------------------------------
              <br />
              COMPUTER GENERATED SLIP
            </div>
          </div>

          {/* ACTION BUTTONS (HIDDEN ON PRINT) */}
          <div className="flex gap-3 pt-4 print:hidden">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2.5 text-xs font-bold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100"
            >
              {submitting ? "SAVING..." : "CONFIRM & PRINT"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @media print {
          /* Hide everything except the print area */
          body * { 
            visibility: hidden; 
          }
          
          #print-area, #print-area * { 
            visibility: visible; 
          }
          
          /* Position print area */
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            margin: 0;
            padding: 8px;
            box-sizing: border-box;
          }

          /* Configure page size - CRITICAL FIX */
          @page {
            size: 80mm 120mm; /* Fixed height instead of auto */
            margin: 0;
          }

          /* Ensure single page */
          html, body {
            height: 120mm;
            width: 80mm;
            margin: 0;
            padding: 0;
            overflow: hidden; /* Prevent overflow to next page */
            background-color: white;
          }

          /* Prevent page breaks inside elements */
          #print-area, #print-area * {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default BillForm;