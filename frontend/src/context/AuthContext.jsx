// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/config';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Helper function to consolidate user data and derive display name
const getUserDetails = (role, email, employeeId) => ({
    // Use the name returned by the API or derive it from email
    name: email ? email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) : role,
    role,
    // CRITICAL FIX: Include Employee_ID which is necessary for dashboard data fetching
    Employee_ID: employeeId 
});

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    // New state to indicate that the initial check of localStorage is underway
    const [isAuthLoading, setIsAuthLoading] = useState(true); 
    const navigate = useNavigate();

    // --- On Mount: Check LocalStorage and set initial state ---
    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        const role = localStorage.getItem('userRole');
        const email = localStorage.getItem('userEmail');
        // FIX: Retrieve employeeId from local storage
        const employeeId = localStorage.getItem('employeeId'); 

        if (token && role && employeeId) {
            // FIX: Pass employeeId to getUserDetails
            const currentUser = getUserDetails(role, email, employeeId); 
            setUser(currentUser);
            setIsAuthenticated(true);

            // Redirect logic remains the same
            if (window.location.pathname === '/login' || window.location.pathname === '/') {
                if (role === 'Admin') navigate('/admin', { replace: true });
                else if (role === 'Doctor') navigate('/doctor', { replace: true });
                else if (role === 'Receptionist') navigate('/receptionist', { replace: true });
            }
        }
        
        // Indicate that the initial loading is complete
        setIsAuthLoading(false);
    }, [navigate]);

    // --- Login Function ---
    const login = async (email, password) => {
        try {
            const response = await API.post('/auth/login', { email, password });
            // Ensure your API returns 'employeeId' for all employee roles
            const { token, role, employeeId } = response.data; 

            // Save all necessary data to local storage
            localStorage.setItem('jwtToken', token);
            localStorage.setItem('userRole', role);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('employeeId', employeeId); // CRITICAL: Save the ID

            // Create the full user object
            const currentUser = getUserDetails(role, email, employeeId);
            setUser(currentUser);
            setIsAuthenticated(true);

            // Redirect immediately after login
            if (role === 'Admin') navigate('/admin', { replace: true });
            else if (role === 'Doctor') navigate('/doctor', { replace: true });
            else if (role === 'Receptionist') navigate('/receptionist', { replace: true });

            return true;
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            return error.response?.data?.message || 'Login failed. Check server status.';
        }
    };

    // --- Logout Function ---
    const logout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('employeeId'); // Clear the ID on logout
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login', { replace: true });
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isAuthLoading }}>
            {children}
        </AuthContext.Provider>
    );
};