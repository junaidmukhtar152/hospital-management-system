import React from 'react';

const StatCard = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: 'border-l-4 border-[#3498db] text-[#3498db]',
    green: 'border-l-4 border-[#2ecc71] text-[#2ecc71]',
    red: 'border-l-4 border-[#e74c3c] text-[#e74c3c]',
    yellow: 'border-l-4 border-[#f1c40f] text-[#f1c40f]',
    gray: 'border-l-4 border-gray-500 text-gray-500',
  };

  return (
    <div
      className={`flex justify-between items-center p-5 rounded-2xl bg-white shadow-md ${colorMap[color] || colorMap.blue}`}
    >
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
      </div>
      <span className="text-4xl">{icon}</span>
    </div>
  );
};

export default StatCard;
