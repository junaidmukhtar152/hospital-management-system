// controllers/authController.js
import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper function to generate JWT
const generateToken = (id, roleName) => {
  return jwt.sign({ id, role: roleName }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch employee and role
    const [rows] = await db.query(
      `SELECT E.Employee_ID, E.Name, E.Email, E.Password, R.Role_Name
       FROM Employee E
       JOIN Role R ON E.Role_ID = R.Role_ID
       WHERE E.Email = ?`,
      [email]
    );

    const employee = rows[0];

    if (employee && (await bcrypt.compare(password, employee.Password))) {
      res.json({
        token: generateToken(employee.Employee_ID, employee.Role_Name),
        employeeId: employee.Employee_ID,
        role: employee.Role_Name,
        name: employee.Name,
        email: employee.Email
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials or user not found.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};
