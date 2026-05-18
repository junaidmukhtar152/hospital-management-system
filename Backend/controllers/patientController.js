import db from '../config/db.js';

// Get all patients
export const getAllPatients = async (req, res) => {
    try {
        const [patients] = await db.query(`SELECT Patient_ID, Name, DOB, Phone, Gender FROM Patient`);
        res.status(200).json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Server error while fetching patients.' });
    }
};

// Get patient by ID
export const getPatientById = async (req, res) => {
    const { id } = req.params;
    try {
        const [patientRows] = await db.query(`SELECT * FROM Patient WHERE Patient_ID = ?`, [id]);
        if (patientRows.length === 0) {
            return res.status(404).json({ message: 'Patient not found.' });
        }
        const patient = patientRows[0];

        // Fetch related data
        const [prescriptions] = await db.query(`SELECT * FROM Prescription WHERE Patient_ID = ? ORDER BY Date DESC`, [id]);
        const [reports] = await db.query(`SELECT * FROM Test_Report WHERE Patient_ID = ? ORDER BY Date DESC`, [id]);
        const [bills] = await db.query(`SELECT * FROM Bill WHERE Patient_ID = ? ORDER BY Date DESC`, [id]);

        res.status(200).json({ ...patient, prescriptions, reports, bills });
    } catch (error) {
        console.error('Error fetching patient profile:', error);
        res.status(500).json({ message: 'Server error while fetching patient profile.' });
    }
};

// Create patient
export const createPatient = async (req, res) => {
    const { name, dob, gender, address, phone } = req.body;
    const age = new Date().getFullYear() - new Date(dob).getFullYear();

    try {
        const [result] = await db.query(
            `INSERT INTO Patient (Name, DOB, Age, Gender, Address, Phone) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, dob, age, gender, address, phone]
        );
        res.status(201).json({ message: 'Patient registered successfully.', patientId: result.insertId });
    } catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).json({ message: 'Server error during patient registration.' });
    }
};

// Update patient
export const updatePatient = async (req, res) => {
    const { id } = req.params;
    const { name, dob, gender, address, phone } = req.body;

    if (!name && !dob && !gender && !address && !phone) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    try {
        const [result] = await db.query(
            `UPDATE Patient SET Name=?, DOB=?, Gender=?, Address=?, Phone=? WHERE Patient_ID=?`,
            [name, dob, gender, address, phone, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Patient not found or no changes made.' });
        }
        res.status(200).json({ message: 'Patient details updated successfully.' });
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ message: 'Server error during patient update.' });
    }
};

// DELETE patient ✅
export const deletePatient = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query(`DELETE FROM Patient WHERE Patient_ID=?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        res.status(200).json({ message: 'Patient removed successfully.' });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({ message: 'Server error during patient deletion.' });
    }
};

// Get total patients (for Admin Dashboard)
export const getTotalPatients = async (req, res) => {
  try {
    const [result] = await db.query(`SELECT COUNT(*) AS totalPatients FROM Patient`);
    res.status(200).json({ totalPatients: result[0]?.totalPatients || 0 });
  } catch (error) {
    console.error('Error fetching total patients:', error);
    res.status(500).json({ message: 'Server error while fetching total patients.' });
  }
};
