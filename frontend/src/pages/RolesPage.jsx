// src/pages/RolesPage.jsx
import React, { useEffect, useState } from 'react';
import API from '../api/config';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchRoles = async () => {
    try {
      const response = await API.get('/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      alert('Error fetching roles');
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleEdit = (role) => {
    setEditingRole(role);
    setName(role.Role_Name);
    setDescription(role.Description || '');
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await API.put(`/roles/${editingRole.Role_ID}`, { Role_Name: name, Description: description });
        alert('Role updated successfully');
      } else {
        await API.post('/roles', { Role_Name: name, Description: description });
        alert('Role created successfully');
      }
      setEditingRole(null);
      setName('');
      setDescription('');
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      alert(error.response?.data?.message || 'Failed to save role');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">System Roles</h1>

      {/* Role Form */}
      <form onSubmit={handleAddOrUpdate} className="grid gap-4 mb-6 max-w-md">
        <input
          type="text"
          placeholder="Role Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="px-4 py-2 border rounded-xl w-full"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-4 py-2 border rounded-xl w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
        >
          {editingRole ? 'Update Role' : 'Add Role'}
        </button>
        {editingRole && (
          <button
            type="button"
            onClick={() => { setEditingRole(null); setName(''); setDescription(''); }}
            className="bg-gray-400 text-white px-4 py-2 rounded-xl hover:bg-gray-500"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Roles Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Role Name</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role.Role_ID}>
              <td className="border p-2">{role.Role_ID}</td>
              <td className="border p-2">{role.Role_Name}</td>
              <td className="border p-2">{role.Description}</td>
              <td className="border p-2 flex gap-2">
                <button
                  onClick={() => handleEdit(role)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RolesPage;
