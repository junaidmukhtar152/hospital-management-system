import React, { useState, useEffect } from 'react';
import API from '../../api/config';

const EmployeeForm = ({ employeeData, onClose }) => {
  const [name, setName] = useState(employeeData?.Name || '');
  const [email, setEmail] = useState(employeeData?.Email || '');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState(employeeData?.Role_ID || '');
  const [roles, setRoles] = useState([]);
  const isEditMode = !!employeeData;

  // Fetch roles for dropdown
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await API.get('/employees/roles');
        setRoles(response.data);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      Name: name,
      Email: email,
      Password: password || undefined, // Only include password if entered
      Role_ID: Number(roleId),
    };

    try {
      if (isEditMode) {
        await API.put(`/employees/${employeeData.Employee_ID}`, payload);
        alert(`Employee ${name} updated successfully.`);
      } else {
        if (!password) {
          alert('Password is required for new employees.');
          return;
        }
        await API.post('/employees', payload);
        alert(`New employee ${name} created successfully.`);
      }
      onClose();
    } catch (error) {
      // Handle soft-deleted duplicate email
      if (error.response?.data?.message.includes('exists')) {
        alert(`Email ${email} is already used. Please choose another email.`);
      } else {
        alert(`Error: ${error.response?.data?.message || 'Failed to save employee.'}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={!isEditMode}
          disabled={isEditMode}
          className={`w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${
            isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.Role_ID} value={role.Role_ID}>
              {role.Role_Name}
            </option>
          ))}
        </select>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isEditMode ? 'New Password (optional)' : 'Password'}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEditMode}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold transition duration-300"
      >
        {isEditMode ? 'Update Employee' : 'Create Employee'}
      </button>
    </form>
  );
};

export default EmployeeForm;
