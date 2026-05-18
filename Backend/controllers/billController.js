// controllers/billController.js
import db from '../config/db.js';

// @route POST /api/v1/bills
// Used by Receptionist to generate a new invoice
export const createBill = async (req, res) => {
    // Note: Description is tracked on the frontend for context, but only Patient_ID, Amount, and Date are stored in the Bill table.
    const { patientId, amount } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const initialStatus = 'Pending'; // Default status

    if (!patientId || !amount) {
        return res.status(400).json({ message: 'Missing required bill fields: Patient ID or Amount.' });
    }
    
    // Ensure amount is a positive number
    if (parseFloat(amount) <= 0) {
         return res.status(400).json({ message: 'Bill amount must be greater than zero.' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO Bill (Patient_ID, Amount, Date, Status) VALUES (?, ?, ?, ?)`,
            [patientId, amount, date, initialStatus]
        );
        
        res.status(201).json({ 
            message: 'Bill generated successfully.', 
            billId: result.insertId 
        });
    } catch (error) {
        console.error('Error creating bill:', error);
        res.status(500).json({ message: 'Server error during bill generation.' });
    }
};

// @route GET /api/v1/bills
// Used by Receptionist for the main manager table
export const getAllBills = async (req, res) => {
    try {
        // Fetch all bills and join with Patient to display the patient's name
        const [bills] = await db.query(
            `SELECT 
                B.Bill_ID, B.Amount, B.Date, B.Status,
                P.Name AS Patient_Name, P.Patient_ID
            FROM Bill B
            JOIN Patient P ON B.Patient_ID = P.Patient_ID
            ORDER BY B.Date DESC`
        );
        res.status(200).json(bills);
    } catch (error) {
        console.error('Error fetching all bills:', error);
        res.status(500).json({ message: 'Server error while fetching bills.' });
    }
};

// @route PUT /api/v1/bills/:id/status
// Used by Receptionist to update payment status
export const updateBillStatus = async (req, res) => {
    const { id: billId } = req.params;
    const { status } = req.body; // Expects 'Paid', 'Pending', or 'Cancelled'

    if (!status || !['Paid', 'Pending', 'Cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided. Must be Paid, Pending, or Cancelled.' });
    }

    try {
        const [result] = await db.query(
            `UPDATE Bill SET Status = ? WHERE Bill_ID = ?`,
            [status, billId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Bill not found.' });
        }

        res.status(200).json({ message: `Bill ID ${billId} status updated to ${status}.` });
    } catch (error) {
        console.error('Error updating bill status:', error);
        res.status(500).json({ message: 'Server error during bill status update.' });
    }
};


export const getBillsByPatient = async (req, res) => {
    const { id: patientId } = req.params;

    try {
        const [bills] = await db.query(
            `SELECT Bill_ID, Amount, Date, Status FROM Bill WHERE Patient_ID = ? ORDER BY Date DESC`,
            [patientId]
        );
        
        res.status(200).json(bills);
    } catch (error) {
        console.error('Error fetching patient bills:', error);
        res.status(500).json({ message: 'Server error while fetching patient bills.' });
    }
};