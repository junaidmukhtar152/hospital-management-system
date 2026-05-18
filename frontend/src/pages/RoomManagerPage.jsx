// src/pages/RoomManagerPage.jsx
import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import RoomCard from '../components/RoomCard';
import RoomAssignmentForm from '../components/forms/RoomAssignmentForm';
import API from '../api/config';

const RoomManagerPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assignment Modal
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Fetch rooms from backend
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await API.get('/rooms');
      const realRooms = res.data.filter(r => r.Status !== 'Maintenance'); // ignore maintenance
      setRooms(realRooms);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      alert('Failed to fetch rooms from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const totalRooms = rooms.length;
  const availableCount = rooms.filter(r => r.Status === 'Available').length;
  const occupiedCount = rooms.filter(r => r.Status === 'Occupied').length;

  // Handle room admit/discharge
  const handleRoomAction = (room) => {
    setSelectedRoom(room);
    if (room.Status === 'Available') setIsAssignmentModalOpen(true);
    if (room.Status === 'Occupied') {
      if (window.confirm(`Room ${room.Room_ID} is occupied. Discharge patient?`)) {
        handleDischarge(room.Room_ID);
      }
    }
  };

  const handleDischarge = async (roomId) => {
    try {
      await API.put(`/rooms/discharge/${roomId}`);
      alert(`Patient discharged from Room ${roomId}`);
      fetchRooms();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to discharge patient.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-teal-600 mb-4">Room and Bed Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Rooms" value={totalRooms} icon="🏠" color="blue" />
        <StatCard title="Available Beds" value={availableCount} icon="🟢" color="green" />
        <StatCard title="Occupied Beds" value={occupiedCount} icon="🔴" color="red" />
      </div>

      <h3 className="text-xl font-semibold mb-4">Room Status Overview</h3>

      {/* Rooms Grid */}
      {loading ? (
        <p>Loading rooms...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {rooms.map(room => (
            <RoomCard
              key={room.Room_ID}
              room={room}
              onAction={handleRoomAction}
            />
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {isAssignmentModalOpen && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-auto pt-10 px-2">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">
              Assign Patient to Room {selectedRoom.Room_ID}
            </h3>
            <RoomAssignmentForm
              room={selectedRoom}
              onAssign={() => {
                setIsAssignmentModalOpen(false);
                fetchRooms();
              }}
            />
            <button
              onClick={() => setIsAssignmentModalOpen(false)}
              className="mt-4 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagerPage;
