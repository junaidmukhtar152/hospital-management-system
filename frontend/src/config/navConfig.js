// src/config/navConfig.js
export const navConfig = {
    Admin: [
        { title: 'Dashboard', path: '/admin', icon: '🏠' },
        { title: 'Employee Management', path: '/employees', icon: '👥' },
        { title: 'Role Permissions', path: '/roles', icon: '🔑' },
        { title: 'System Settings', path: '/settings', icon: '⚙️' },
    ],
    Doctor: [
        { title: 'Appointments', path: '/doctor', icon: '🗓️' },
        { title: 'Patient Search', path: '/patients', icon: '🔎' },
        { title: 'Prescriptions', path: '/prescriptions', icon: '💊' },
        { title: 'Reports Viewer', path: '/reports', icon: '📄' },
    ],
    Receptionist: [
        { title: 'Dashboard', path: '/receptionist', icon: '🏠' },
        { title: 'New Registration', path: '/patients/new', icon: '➕' },
        { title: 'Appointment Booking', path: '/appointments', icon: '✍️' },
        { title: 'Billing & Payments', path: '/bills', icon: '💳' },
        { title: 'Room Assignments', path: '/rooms', icon: '🛌' },
    ],
};