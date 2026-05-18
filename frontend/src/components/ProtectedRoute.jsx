// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isAuthLoading } = useAuth();
    const userRole = user?.role;

    // Loading spinner animation
    if (isAuthLoading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh"
            }}>
                <div className="lds-ring">
                    <div></div><div></div><div></div><div></div>
                </div>
                <style>
                {`
                .lds-ring {
                  display: inline-block;
                  position: relative;
                  width: 80px;
                  height: 80px;
                }
                .lds-ring div {
                  box-sizing: border-box;
                  display: block;
                  position: absolute;
                  width: 64px;
                  height: 64px;
                  margin: 8px;
                  border: 8px solid #1976d2;
                  border-radius: 50%;
                  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                  border-color: #1976d2 transparent transparent transparent;
                }
                .lds-ring div:nth-child(1) {
                  animation-delay: -0.45s;
                }
                .lds-ring div:nth-child(2) {
                  animation-delay: -0.3s;
                }
                .lds-ring div:nth-child(3) {
                  animation-delay: -0.15s;
                }
                @keyframes lds-ring {
                  0% {
                    transform: rotate(0deg);
                  }
                  100% {
                    transform: rotate(360deg);
                  }
                }
                `}
                </style>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        const redirectPath = userRole === 'Admin' ? '/admin' : 
                             userRole === 'Doctor' ? '/doctor' : 
                             userRole === 'Receptionist' ? '/receptionist' : '/login';
        return <Navigate to={redirectPath} replace />;
    }

    return <Outlet />; 
};

export default ProtectedRoute;