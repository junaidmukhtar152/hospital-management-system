// src/pages/NewPatient.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/config';

// Helper function to get today's date string (YYYY-MM-DD)
const getTodayDateString = () => {
  // Current time is Saturday, December 13, 2025 at 4:53:59 PM PKT.
  // This will return '2025-12-13'
  return new Date().toISOString().split('T')[0];
};

// Icons for UI Polish
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
);
const UserIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const CalendarIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const PhoneIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
);
const HomeIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);


const NewPatient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: '',
    address: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFutureModal, setShowFutureModal] = useState(false); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleDateChange = (e) => {
    const enteredDateString = e.target.value;
    const todayDateString = getTodayDateString();
    
    // Log for debugging
    console.log('--- DOB Validation (Input Change) ---');
    console.log('Entered DOB (string):', enteredDateString);
    console.log('Today (string):', todayDateString);
    
    if (enteredDateString > todayDateString) {
      console.log('Result: Future date detected. Blocking input.');
      setShowFutureModal(true);
      setFormData(prev => ({ ...prev, dob: '' }));
    } else {
      console.log('Result: Valid or today date. Accepting input.');
      handleChange(e); 
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const todayDateString = getTodayDateString();
    const isFutureDate = formData.dob > todayDateString;

    // Log for debugging
    console.log('--- DOB Validation (Submission) ---');
    console.log('Current formData DOB:', formData.dob);
    console.log('Today date:', todayDateString);
    console.log('Is DOB a future date?', isFutureDate);

    if (!formData.dob || isFutureDate) {
      console.error('Submission Blocked: Invalid Date of Birth (must not be empty or a future date).');
      if (isFutureDate && !showFutureModal) {
         setShowFutureModal(true);
      }
      return; // STOP the function here and prevent API call
    }
    
    setLoading(true);

    try {
      await API.post('/patients', formData);
      alert('Patient registered successfully!');
      navigate('/patients');
    } catch (err) {
      console.error('Failed to register patient:', err);
      setError(err.response?.data?.message || 'Server error during patient registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      
      {/* REMOVED PREVIOUS BACK BUTTON BLOCK 
        <div className="max-w-xl mx-auto mb-6">...</div>
      */}

      {/* Main Form Container - Width changed from max-w-3xl to max-w-xl */}
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Form Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">Register New Patient</h2>
          <p className="text-blue-100 mt-2 text-sm">Enter the patient's personal details below to create a new record.</p>
        </div>

        <div className="p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Grid Layout (now tighter) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Farooq"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
                  />
                </div>
              </div>

              {/* DOB Field */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon />
                  </div>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleDateChange} 
                    required
                    max={getTodayDateString()}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm text-gray-700"
                  />
                </div>
              </div>

              {/* Gender Field */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Gender <span className="text-red-500">*</span></label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Phone Field */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    placeholder="e.g. 0301-1234567"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Address Field - Full Width */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Address <span className="text-red-500">*</span></label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                  <HomeIcon />
                </div>
                <textarea
                  name="address"
                  placeholder="Full residential address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm resize-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all transform hover:-translate-y-0.5 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  'Register Patient'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
      
      {/* --- NEW FOOTER ACTIONS SECTION (View All Patients) --- */}
      <div className="max-w-xl mx-auto mt-8 flex justify-center">
         <button 
           onClick={() => navigate('/patients')} 
           // Applying the improved styling:
           className="flex items-center px-6 py-3 text-sm font-semibold text-blue-700 bg-white border border-blue-200 rounded-xl shadow-md hover:bg-blue-50 transition-colors"
         >
           <BackIcon />
           <span className="ml-2">View All Patients</span>
         </button>
      </div>
      {/* --- END NEW FOOTER ACTIONS SECTION --- */}


      {/* --- Future Date Error Modal --- */}
      {showFutureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            {/* Funny Text */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Hold your horses, McFly! 🏎️⚡
            </h3>
            <p className="text-gray-600 mb-6">
              Unless you are a time traveler from the future, please enter a valid Date of Birth. We can't register patients who haven't been born yet!
            </p>

            {/* Close Button */}
            <button
              onClick={() => setShowFutureModal(false)}
              className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Okay, I'll stay in the present
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewPatient;