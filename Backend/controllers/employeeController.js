// employeeController.js
import db from '../config/db.js';
import bcrypt from 'bcryptjs';

// Get all roles (for dropdowns)
export const getAllRoles = async (req, res) => {
  try {
    const [roles] = await db.query(
      `SELECT Role_ID, Role_Name FROM Role WHERE Role_Name != 'Patient' ORDER BY Role_ID ASC`
    );
    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Server error while fetching roles.' });
  }
};

// Get employees (Admin: all, Receptionist: only doctors, only Active)
export const getEmployeesByRoleOrAll = async (req, res) => {
  try {
    let query;
    const params = [];

    if (req.user.role === 'Admin') {
      query = `
        SELECT E.Employee_ID, E.Name, E.Email, R.Role_Name, R.Role_ID
        FROM Employee E
        JOIN Role R ON E.Role_ID = R.Role_ID
        WHERE R.Role_Name != 'Patient' AND E.Status = 'Active'
        ORDER BY E.Employee_ID ASC
      `;
    } else if (req.user.role === 'Receptionist') {
      query = `
        SELECT E.Employee_ID, E.Name, E.Email, R.Role_Name, R.Role_ID
        FROM Employee E
        JOIN Role R ON E.Role_ID = R.Role_ID
        WHERE R.Role_Name = 'Doctor' AND E.Status = 'Active'
        ORDER BY E.Employee_ID ASC
      `;
    } else {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
    }

    const [employees] = await db.query(query, params);
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error while fetching employees.' });
  }
};

// Create Employee
export const createEmployee = async (req, res) => {
  const { Name, Email, Password, Role_ID } = req.body;
  if (!Name || !Email || !Password || !Role_ID) {
    return res.status(400).json({ message: 'Missing required employee fields.' });
  }

  try {
    // Check email uniqueness among active employees
    const [existing] = await db.query(
      'SELECT Employee_ID FROM Employee WHERE Email = ? AND Status = "Active"',
      [Email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Employee with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    const [result] = await db.query(
      `INSERT INTO Employee (Name, Role_ID, Email, Password, Status) VALUES (?, ?, ?, ?, 'Active')`,
      [Name, Role_ID, Email, hashedPassword]
    );

    res.status(201).json({ message: 'Employee created successfully', employeeId: result.insertId });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server error during employee creation.' });
  }
};

// Update Employee
export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { Name, Email, Role_ID, Password } = req.body;

  if (!Name && !Email && !Role_ID && !Password) {
    return res.status(400).json({ message: 'No fields provided for update.' });
  }

  try {
    const setClauses = [];
    const params = [];

    if (Name) { setClauses.push('Name = ?'); params.push(Name); }

    if (Email) {
      // Check email uniqueness
      const [existing] = await db.query(
        'SELECT Employee_ID FROM Employee WHERE Email = ? AND Status = "Active" AND Employee_ID != ?',
        [Email, id]
      );
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Email already in use by another employee.' });
      }
      setClauses.push('Email = ?'); params.push(Email);
    }

    if (Role_ID) { setClauses.push('Role_ID = ?'); params.push(Role_ID); }

    if (Password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(Password, salt);
      setClauses.push('Password = ?'); 
      params.push(hashedPassword);
    }

    params.push(id);

    const [result] = await db.query(
      `UPDATE Employee SET ${setClauses.join(', ')} WHERE Employee_ID = ? AND Status = 'Active'`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found or no changes made.' });
    }

    res.status(200).json({ message: 'Employee updated successfully.' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Server error during employee update.' });
  }
};

// Soft Delete Employee
export const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      `UPDATE Employee SET Status = 'Inactive' WHERE Employee_ID = ? AND Status = 'Active'`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found or already inactive.' });
    }

    res.status(200).json({ message: 'Employee marked as inactive successfully.' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error during employee deletion.' });
  }
};

export const getEmployeeById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT Employee_ID, Name FROM Employee WHERE Employee_ID = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
