// controllers/reportController.js
import db from '../config/db.js';

// @route GET /api/v1/reports/patient/:id
// Used by Patient Profile to display test history
export const getReportsByPatient = async (req, res) => {
    const { id: patientId } = req.params;

    try {
        // Retrieve reports, ordered by date
        const [reports] = await db.query(
            `SELECT Report_ID, Date, Type, Result FROM Test_Report WHERE Patient_ID = ? ORDER BY Date DESC`,
            [patientId]
        );
        
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching patient reports:', error);
        res.status(500).json({ message: 'Server error while fetching patient reports.' });
    }
};

// @route POST /api/v1/reports
// Used by Admin/Lab to upload/log a new test result
export const createTestReport = async (req, res) => {
    // Accept both camelCase and PascalCase for compatibility
    const patientId = req.body.patientId || req.body.Patient_ID;
    const type = req.body.type || req.body.Type;
    const result = req.body.result || req.body.Result;
    const date = req.body.date || req.body.Date || new Date().toISOString().split('T')[0]; // Date the result is logged

    if (!patientId || !type || !result) {
        return res.status(400).json({ message: 'Missing required report fields: Patient ID, Type, or Result.' });
    }
    
    try {
        const [dbResult] = await db.query(
            `INSERT INTO Test_Report (Patient_ID, Type, Result, Date) VALUES (?, ?, ?, ?)`,
            [patientId, type, result, date]
        );
        
        res.status(201).json({ 
            message: 'Test report successfully logged.', 
            reportId: dbResult.insertId 
        });
    } catch (error) {
        console.error('Error creating test report:', error);
        res.status(500).json({ message: 'Server error during report logging.' });
    }
};

// DELETE /api/v1/reports/:reportId
export const deleteTestReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        await db.query("DELETE FROM Test_Report WHERE Report_ID = ?", [reportId]);
        res.status(200).json({ message: "Test report deleted successfully." });
    } catch (error) {
        console.error("Error deleting test report:", error);
        res.status(500).json({ message: "Server error deleting test report." });
    }
};