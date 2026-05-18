import React, { useState } from 'react';
import API from '../../api/config';

// --- Icon Components ---
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
);
const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

const PatientForm = ({ initialData = {}, isEdit = false, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showFutureModal, setShowFutureModal] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData.Name || '',
    dob: initialData.DOB || '',
    gender: initialData.Gender || '',
    address: initialData.Address || '',
    phone: initialData.Phone || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Custom handler for DOB validation
  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    
    // Set time to midnight for accurate comparison
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      // 1. Trigger the funny modal
      setShowFutureModal(true);
      
      // 2. Refresh/Clear the entered value immediately
      // This step is critical for preventing submission via the 'required' attribute,
      // but we will also add a check in handleSubmit for robustness.
      setFormData(prev => ({ ...prev, dob: '' }));
    } else {
      // 3. Valid date: proceed with normal handleChange
      handleChange(e); 
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- CRITICAL ADDITION: CHECK FOR INVALID/CLEARED DATE BEFORE SUBMISSION ---
    // If the dob field is empty (because it was cleared by the validation),
    // we set loading to false and stop the function immediately.
    if (!formData.dob) {
      console.log('Submission blocked: Date of Birth is required or invalid (future date).');
      setLoading(false); // Ensure loading is off if we block
      return; // Stop the submission process
    }
    // --- END CRITICAL ADDITION ---


    setLoading(true);
    try {
      if (isEdit) {
        await API.put(`/patients/${initialData.Patient_ID}`, formData);
        alert('Patient details updated successfully!');
      } else {
        await API.post('/patients', formData);
        alert('New Patient Registered Successfully!');
        // Only clear if successful and not editing
        setFormData({ name: '', dob: '', gender: '', address: '', phone: '' }); 
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Submission failed:', error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.message || 'Could not save data.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      
      {/* Header Section */}
      <div className={`px-8 py-6 ${isEdit ? 'bg-orange-50' : 'bg-blue-50'} border-b border-gray-100`}>
        <h2 className={`text-2xl font-bold ${isEdit ? 'text-orange-700' : 'text-blue-700'}`}>
          {isEdit ? 'Edit Patient Details' : 'New Patient Registration'}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {isEdit ? 'Update the information below to save changes.' : 'Please fill in the information below to create a new patient record.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        {/* Section 1: Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700 block">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <UserIcon />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. Farooq"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out placeholder-gray-400 text-gray-800"
                />
              </div>
            </div>

            {/* DOB Field */}
            <div className="space-y-2">
              <label htmlFor="dob" className="text-sm font-medium text-gray-700 block">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <CalendarIcon />
                </div>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  // Using the custom validation handler
                  onChange={handleDateChange} 
                  required
                  // Enforces the max date in the native date picker UI
                  max={new Date().toISOString().split("T")[0]} 
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800"
                />
              </div>
            </div>

            {/* Gender Field */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="gender" className="text-sm font-medium text-gray-700 block">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                {/* Simplified radio button structure */}
                {['Male', 'Female', 'Other'].map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={formData.gender === option}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 group-hover:text-blue-600 transition-colors">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Contact Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700 block">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <PhoneIcon />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g. 0301-1234567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800"
                />
              </div>
            </div>

            {/* Address Field - Full width */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="address" className="text-sm font-medium text-gray-700 block">
                Residential Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                  <LocationIcon />
                </div>
                <textarea
                  id="address"
                  name="address"
                  placeholder="Street address, Apartment, City, State"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none placeholder-gray-400 text-gray-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center px-8 py-3.5 rounded-xl text-white font-bold shadow-md transition-all duration-200 hover:shadow-lg transform active:scale-[0.98] ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 
              isEdit ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' : 
              'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              isEdit ? 'Save Changes' : 'Register Patient'
            )}
          </button>
        </div>
      </form>
      
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

export default PatientForm;