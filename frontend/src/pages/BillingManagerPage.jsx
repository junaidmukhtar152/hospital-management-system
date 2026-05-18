import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import API from '../api/config';

// Helper function to format date
const formatDate = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return `${date.getDate().toString().padStart(2,'0')}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getFullYear()}`;
};

const BillingManagerPage = () => {
  const [patients, setPatients] = useState([]);
  const [bills, setBills] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [amount, setAmount] = useState('');

  // Fetch all patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await API.get('/patients');
        setPatients(res.data);
      } catch (err) {
        console.error('Failed to fetch patients:', err);
      }
    };
    fetchPatients();
  }, []);

  // Fetch bills
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await API.get('/bills');
        setBills(res.data);
      } catch (err) {
        console.error('Failed to fetch bills:', err);
      }
    };
    fetchBills();
  }, []);

  // Open modal for selected patient
  const handleOpenModal = (patient) => {
    setSelectedPatient(patient);
    setAmount('');
    setModalOpen(true);
  };

  // Generate and print invoice
  const handleGenerateInvoice = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Enter a valid amount.');
      return;
    }

    const newBill = {
      Patient_ID: selectedPatient.Patient_ID,
      Patient_Name: selectedPatient.Name,
      Date: new Date().toISOString(),
      Amount: parseFloat(amount).toFixed(2),
      Status: 'Pending',
    };

    try {
      const res = await API.post('/bills', newBill);
      const bill = res.data;
      setBills(prev => [bill, ...prev]);
      setModalOpen(false);

      // Automatically print invoice
      const printContent = `
        <html>
          <head>
            <title>Bill ID: ${bill.Bill_ID}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h2 { color: #27ae60; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
            </style>
          </head>
          <body>
            <h2>EasyCare HMS - Bill</h2>
            <p><strong>Bill ID:</strong> ${bill.Bill_ID}</p>
            <p><strong>Patient:</strong> ${bill.Patient_Name} (ID: ${bill.Patient_ID})</p>
            <p><strong>Date:</strong> ${formatDate(bill.Date)}</p>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Services / Consultation</td>
                  <td>${parseFloat(bill.Amount).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <p><strong>Status:</strong> ${bill.Status}</p>
          </body>
        </html>
      `;
      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } catch (err) {
      console.error('Failed to generate invoice:', err);
      alert('Failed to generate invoice.');
    }
  };

  // Delete a paid bill
  const handleDeleteBill = async (billId) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    try {
      await API.delete(`/bills/${billId}`);
      setBills(prev => prev.filter(b => b.Bill_ID !== billId));
      alert('Bill deleted successfully.');
    } catch (err) {
      console.error('Failed to delete bill:', err);
      alert('Failed to delete bill.');
    }
  };

  // Patient table columns
  const patientColumns = [
    { header: 'Patient ID', accessor: 'Patient_ID' },
    { header: 'Name', accessor: 'Name' },
    { header: 'Age', accessor: 'Age' },
    { header: 'Gender', accessor: 'Gender' },
  ];

  const patientActions = [
    {
      label: 'Generate Invoice',
      handler: handleOpenModal,
      style: { background: '#f59e0b', color: 'white', borderRadius: '6px', border: 'none', padding: '4px 10px' },
    },
  ];

  // Bills table columns
  const billColumns = [
    { header: 'Bill ID', accessor: 'Bill_ID' },
    { header: 'Patient', accessor: 'Patient_Name' },
    { header: 'Amount', accessor: 'Amount', cell: row => `$${parseFloat(row.Amount).toFixed(2)}` },
    { header: 'Date', accessor: 'Date', cell: row => formatDate(row.Date) },
    { 
      header: 'Status', 
      accessor: 'Status',
      cell: row => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          row.Status === 'Paid' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
        }`}>
          {row.Status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'Actions',
      cell: row => (
        row.Status === 'Paid' ? (
          <button
            onClick={() => handleDeleteBill(row.Bill_ID)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs"
          >
            Delete
          </button>
        ) : null
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-green-600 text-center mb-4">
        Billing Manager
      </h1>

      {/* Patients Table */}
      <div className="overflow-x-auto">
        <DataTable 
          title="All Patients"
          columns={patientColumns} 
          data={patients} 
          actions={patientActions} 
        />
      </div>

      {/* Bills Table */}
      <div className="overflow-x-auto mt-6">
        <DataTable 
          title="Recent Bills" 
          columns={billColumns} 
          data={bills}
        />
      </div>

      {/* Amount Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-sm p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Generate Invoice</h2>
            <p className="mb-2">Patient: <strong>{selectedPatient?.Name}</strong></p>
            <input
              type="number"
              placeholder="Enter Amount ($)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateInvoice}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Generate & Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagerPage;
