// src/api/config.js
import axios from 'axios';

const API = axios.create({
    // IMPORTANT: Ensure this matches your Node.js server port
    baseURL: 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach the JWT token to every request
API.interceptors.request.use(config => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Optional: Interceptor to handle expired tokens globally
API.interceptors.response.use(response => response, error => {
    if (error.response && error.response.status === 401 && error.response.data.message === 'Not authorized, token failed.') {
        // Token expired or invalid - force logout
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
        // You might want to redirect to login page here, depending on your router setup
        console.error("Token expired or invalid. User logged out.");
    }
    return Promise.reject(error);
});

export default API;