import React from 'react';

const getStatusColor = (status) => {
    switch (status) {
        case 'Available': return '#2ecc71'; // Green
        case 'Occupied': return '#e74c3c'; // Red
        case 'Maintenance': return '#f39c12'; // Orange
        default: return '#95a5a6'; // Gray
    }
};

const RoomCard = ({ room, onAction }) => {
    const cardColor = getStatusColor(room.Status);

    return (
        <div 
            onClick={() => onAction(room)}
            className="border rounded-lg p-4 text-center bg-white shadow hover:shadow-lg cursor-pointer transition transform hover:-translate-y-1"
            style={{ borderColor: cardColor }}
        >
            <h4 className="text-lg font-semibold text-gray-800 mb-1">Room {room.Room_ID}</h4>
            <p className="text-sm text-gray-500 mb-2">{room.Room_Type}</p>
            <div className="h-1 w-full mb-2 rounded" style={{ backgroundColor: cardColor }}></div>

            <p className={`font-bold mb-2`} style={{ color: cardColor }}>
                {room.Status}
            </p>

            {room.Patient_Name && (
                <p className="text-sm text-gray-700 mb-2">
                    Patient: <span className="font-medium">{room.Patient_Name}</span>
                </p>
            )}

            <button
                className={`px-3 py-1 rounded text-white font-medium`}
                style={{ backgroundColor: cardColor }}
            >
                {room.Status === 'Available' ? 'Assign Bed' : 'Discharge Patient'}
            </button>
        </div>
    );
};

export default RoomCard;
