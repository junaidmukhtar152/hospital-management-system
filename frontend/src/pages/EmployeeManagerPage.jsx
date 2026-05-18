// src/pages/EmployeeManagerPage.jsx
import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import EmployeeForm from '../components/forms/EmployeeForm';
import API from '../api/config';

const EmployeeManagerPage = () => {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Fetch active employees
  const fetchEmployees = async () => {
    try {
      const response = await API.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      alert('Error fetching employees');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddOrEdit = (employee = null) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Mark employee ${row.Name} as inactive?`)) {
      try {
        await API.delete(`/employees/${row.Employee_ID}`);
        alert('Employee has been marked as inactive.');
        fetchEmployees();
      } catch (error) {
        console.error('Delete failed:', error);
        alert(error.response?.data?.message || 'Failed to delete employee.');
      }
    }
  };

  const employeeColumns = [
    { header: 'ID', accessor: 'Employee_ID' },
    { header: 'Name', accessor: 'Name' },
    { header: 'Role', accessor: 'Role_Name' },
    { header: 'Email', accessor: 'Email' },
  ];

  const employeeActions = [
    {
      label: 'Edit',
      handler: handleAddOrEdit,
      style: {
        background: '#f39c12', // Orange
        color: 'white',
        border: 'none',
        borderRadius: '6px',
      },
    },
    {
      label: 'Delete',
      handler: handleDelete,
      style: {
        background: '#e74c3c', // Red
        color: 'white',
        border: 'none',
        borderRadius: '6px',
      },
    },
  ];

  return (
    <div className="p-6 sm:p-10 bg-[#f0f7ff] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#6a1b9a] mb-4 sm:mb-0">
          Current staff of EasyCare
        </h1>
        
      </div>
      <div><button
          onClick={() => handleAddOrEdit(null)}
          className="px-5 py-2 bg-[#773ee0] hover:bg-[#4a0dd8] text-white rounded-2xl shadow-md transition duration-300"
        >
          Add New Employee
        </button></div>
        <br />
      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-md overflow-auto ">
        <DataTable
          
          columns={employeeColumns}
          data={employees}
          actions={employeeActions}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 sm:p-8 shadow-lg relative">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transition pl-2"
            >
              &times;
            </button>

            <h3 className="text-xl font-semibold border-b pb-2 mb-6 text-gray-800">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h3>

            <EmployeeForm
              employeeData={editingEmployee}
              onClose={() => {
                setIsModalOpen(false);
                fetchEmployees();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagerPage;
