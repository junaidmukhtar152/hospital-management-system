// backend/controllers/roleController.js
import db from '../config/db.js';

// Get all roles (excluding Patient)
export const getRoles = async (req, res) => {
  try {
    const [roles] = await db.query(`SELECT * FROM Role WHERE Role_Name != 'Patient' ORDER BY Role_ID ASC`);
    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Server error fetching roles' });
  }
};

// Create role
export const createRole = async (req, res) => {
  const { Role_Name, Description } = req.body;
  if (!Role_Name) return res.status(400).json({ message: 'Role name is required.' });

  try {
    const [result] = await db.query(`INSERT INTO Role (Role_Name, Description) VALUES (?, ?)`, [Role_Name, Description || null]);
    res.status(201).json({ message: 'Role created successfully', Role_ID: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Role already exists.' });
    }
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Server error creating role.' });
  }
};

// Update role
export const updateRole = async (req, res) => {
  const { id } = req.params;
  const { Role_Name, Description } = req.body;
  if (!Role_Name && !Description) return res.status(400).json({ message: 'No fields to update.' });

  const setClauses = [];
  const params = [];
  if (Role_Name) { setClauses.push('Role_Name = ?'); params.push(Role_Name); }
  if (Description) { setClauses.push('Description = ?'); params.push(Description); }
  params.push(id);

  try {
    const [result] = await db.query(`UPDATE Role SET ${setClauses.join(', ')} WHERE Role_ID = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Role not found.' });
    res.status(200).json({ message: 'Role updated successfully.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Role already exists.' });
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Server error updating role.' });
  }
};
