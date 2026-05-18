// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

// Middleware to protect routes (checks for token validity)
export const protect = async (req, res, next) => {
    let token;

    // 1. Check if token exists in the 'Authorization' header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token (format: 'Bearer <token>')
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify the token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 3. Attach the user's ID and Role to the request object
            req.user = { 
                id: decoded.id, 
                role: decoded.role 
            };

            next(); // Proceed to the next middleware or route handler

        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
};

// Middleware to restrict access based on user role
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if the user's role (attached by the 'protect' middleware) is in the allowed roles list
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Forbidden: Access denied. Role (${req.user.role}) cannot perform this action.` 
            });
        }
        next(); // User has the required role
    };
};