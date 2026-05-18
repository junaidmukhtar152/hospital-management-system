import React from 'react';

const PastTimeModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  // Simple overlay and modal styling (using Tailwind CSS classes)
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6 transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-red-600">{title}</h3>
          
        </div>
        <div className="text-gray-700">
          {children}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-150"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default PastTimeModal;