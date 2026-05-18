// src/pages/PatientRegistrationPage.jsx (Mapped to /patients/new)
import React from 'react';
import PatientForm from '../components/forms/PatientForm';

const PatientRegistrationPage = () => {
    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: '#2ecc71', marginBottom: '20px' }}>New Patient Registration</h1>
            <PatientForm />
        </div>
    );
};

export default PatientRegistrationPage;