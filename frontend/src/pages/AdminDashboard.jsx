// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/config';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalRoles: 0,
    roomOccupancy: '0%',
  });
  const [loading, setLoading] = useState(true);

  // Room Management States
  const [rooms, setRooms] = useState([]);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get('/dashboard/admin');
        setStats({
          totalEmployees: response.data.totalEmployees,
          totalRoles: response.data.totalRoles,
          roomOccupancy: response.data.roomOccupancy,
        });
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      const res = await API.get('/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      alert('Failed to fetch rooms');
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleRoomAddOrEdit = (room = null) => {
    setEditingRoom(room);
    setIsRoomModalOpen(true);
    fetchRooms();
  };

  const handleRoomDelete = async (roomId) => {
    if (window.confirm(`Are you sure you want to delete room ${roomId}?`)) {
      try {
        await API.delete(`/rooms/${roomId}`);
        alert('Room deleted successfully');
        setRooms((prevRooms) => prevRooms.filter(r => r.Room_ID !== roomId));
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to delete room');
      }
    }
  };

  const saveRoom = async (roomData) => {
    try {
      if (editingRoom) {
        // Update room
        await API.put(`/rooms/${editingRoom.Room_ID}`, roomData);
        alert('Room updated successfully');
      } else {
        // Add new room
        await API.post('/rooms', roomData);
        alert('Room added successfully');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save room');
    }
  };

  const statCards = [
    { title: 'Total Employees', value: stats.totalEmployees, icon: '👥', color: 'blue' },
    { title: 'System Roles Defined', value: stats.totalRoles, icon: '🔑', color: 'blue' },
    { title: 'Current Room Occupancy', value: stats.roomOccupancy, icon: '🏥', color: 'green' },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#f0f7ff]">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#3498db]">
          Admin Control Panel
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome, {user?.name} — manage users, roles, rooms, and resources of your hospital.
        </p>
      </header>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-11">
        {loading ? (
          <p>Loading stats...</p>
        ) : (
          statCards.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))
        )}
      </section>

      {/* Core Management Buttons */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Core Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <QuickActionButton
            label="Manage Employees"
            icon="🧑‍💼"
            onClick={() => handleNavigation('/employees')}
            color="green"
          />
          <QuickActionButton
            label="Define Roles & Access"
            icon="🔐"
            onClick={() => handleNavigation('/roles')}
            color="blue"
          />
          
          <QuickActionButton
            label="Manage Rooms"
            icon="🏠"
            onClick={() => handleRoomAddOrEdit()}
            color="purple"
          />
        </div>
      </section>

      {/* Room Management Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-start overflow-auto pt-6 sm:pt-10 px-2 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl w-full max-w-lg sm:max-w-2xl p-4 sm:p-6 shadow-lg relative">
            {/* Close button */}
            <button
              onClick={() => {
                setIsRoomModalOpen(false);
                setEditingRoom(null);
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold transition"
            >
              &times;
            </button>

            <h3 className="text-xl font-semibold border-b pb-2 mb-4 text-gray-800">
              Room Management
            </h3>

            {/* Room List */}
            <div className="space-y-4 max-h-[300px] overflow-auto mb-4">
              {rooms.map((room) => (
                <div
                  key={room.Room_ID}
                  className="flex justify-between items-center p-3 border rounded-lg shadow-sm hover:bg-gray-50 transition"
                >
                  <div>
                    <p>
                      <span className="font-semibold">ID:</span> {room.Room_ID}
                    </p>
                    <p>
                      <span className="font-semibold">Type:</span> {room.Room_Type}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span> {room.Status}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRoomAddOrEdit(room)}
                      className="px-3 py-1 bg-[#f39c12] text-white rounded hover:bg-orange-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRoomDelete(room.Room_ID)}
                      className="px-3 py-1 bg-[#e74c3c] text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add/Edit Room Form */}
            <div className="border-t pt-3">
              <RoomForm
                room={editingRoom}
                onSave={(payload) => {
                  saveRoom(payload).then(() => {
                    // Update rooms list immediately
                    setRooms((prevRooms) => {
                      const index = prevRooms.findIndex(r => r.Room_ID === payload.Room_ID);
                      if (index !== -1) {
                        const newRooms = [...prevRooms];
                        newRooms[index] = payload;
                        return newRooms;
                      } else {
                        return [...prevRooms, payload];
                      }
                    });
                  });
                }}
                onCancel={() => {
                  setEditingRoom(null);
                  setIsRoomModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Quick button component
const QuickActionButton = ({ label, icon, onClick, color }) => {
  const colorClasses = {
    blue: 'bg-[#3498db] hover:bg-[#1e3a8a] border-[#3498db]',
    green: 'bg-[#2ecc71] hover:bg-[#27ae60] border-[#2ecc71]',
    red: 'bg-[#e74c3c] hover:bg-[#c0392b] border-[#e74c3c]',
    purple: 'bg-[#9b59b6] hover:bg-[#8e44ad] border-[#9b59b6]',
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl text-white font-semibold text-center text-lg shadow-lg transition transform hover:-translate-y-1 ${colorClasses[color]}`}
    >
      <span className="text-4xl mb-2">{icon}</span>
      {label}
    </button>
  );
};

// Room form component for add/edit
const RoomForm = ({ room, onSave, onCancel }) => {
  const [roomData, setRoomData] = useState({
    Room_ID: room?.Room_ID || '',
    Room_Type: room?.Room_Type || 'General',
    Status: room?.Status || 'Available',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData({ ...roomData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomData.Room_ID || !roomData.Room_Type) {
      alert('Room ID and Type are required');
      return;
    }

    const payload = {
      Room_ID: Number(roomData.Room_ID),
      Room_Type: roomData.Room_Type,
      Status: roomData.Status,
    };

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
        <input
          type="number"
          name="Room_ID"
          placeholder="Room ID"
          value={roomData.Room_ID}
          onChange={handleChange}
          className="flex-1 p-2 border rounded"
          disabled={!!room} // cannot edit Room_ID
        />
        <select
          name="Room_Type"
          value={roomData.Room_Type}
          onChange={handleChange}
          className="flex-1 p-2 border rounded"
        >
          <option value="General">General</option>
          <option value="ICU">ICU</option>
        </select>
        <select
          name="Status"
          value={roomData.Status}
          onChange={handleChange}
          className="flex-1 p-2 border rounded"
        >
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#2ecc71] text-white rounded hover:bg-[#27ae60]"
        >
          {room ? 'Update Room' : 'Add Room'}
        </button>
      </div>
    </form>
  );
};

export default AdminDashboard;
