// controllers/prescriptionController.js
import db from '../config/db.js';

// @route POST /api/v1/prescriptions
// Used by Doctor to issue a new prescription after a consultation
export const createPrescription = async (req, res) => {
    // Employee_ID comes from the logged-in doctor (req.user.id)
    const { patientId, medicinesList, dosage, duration } = req.body;
    const employeeId = req.user.id; 
    const date = new Date().toISOString().split('T')[0]; // Current date

    // Simple validation
    if (!patientId || !medicinesList) {
    return res.status(400).json({ message: 'Missing required prescription details.' });
}

    
    // Optional: Ensure the logged-in user is actually a Doctor (already done by restrictTo, but good for internal sanity check)

    try {
        const [result] = await db.query(
            `INSERT INTO Prescription 
             (Patient_ID, Employee_ID, Date, Medicines_List, Dosage, Duration) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [patientId, employeeId, date, medicinesList, dosage, duration]
        );
        
        res.status(201).json({ 
            message: 'Prescription successfully issued and recorded.', 
            prescriptionId: result.insertId 
        });
    } catch (error) {
        console.error('Error creating prescription:', error);
        res.status(500).json({ message: 'Server error during prescription creation.' });
    }
};

// @route GET /api/v1/prescriptions/patient/:id
// Used by Patient Profile to display history
// controllers/prescriptionController.js
export const getPrescriptionsByPatient = async (req, res) => {
  const { id: patientId } = req.params;

  try {
    const [prescriptions] = await db.query(
      `SELECT 
          P.Prescription_ID, P.Date, P.Medicines_List, P.Dosage, P.Duration,
          E.Name AS Doctor_Name,
          PT.Patient_ID, PT.Name AS Patient_Name
      FROM Prescription P
      JOIN Employee E ON P.Employee_ID = E.Employee_ID
      JOIN Patient PT ON P.Patient_ID = PT.Patient_ID
      WHERE P.Patient_ID = ?
      ORDER BY P.Date DESC`,
      [patientId]
    );

    res.status(200).json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescription history:', error);
    res.status(500).json({ message: 'Server error while fetching prescription history.' });
  }
};

// DELETE /api/v1/prescriptions/:id
export const deletePrescription = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      "DELETE FROM Prescription WHERE Prescription_ID = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Prescription not found." });
    }

    res.status(200).json({ message: "Prescription deleted successfully." });
  } catch (error) {
    console.error("Error deleting prescription:", error);
    res.status(500).json({ message: "Server error while deleting prescription." });
  }
};
