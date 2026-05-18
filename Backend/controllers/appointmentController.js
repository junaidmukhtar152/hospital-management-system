// backend/controllers/appointmentController.js
import db from '../config/db.js';

// Create Appointment
export const createAppointment = async (req, res) => {
  const { patientId, doctorId, date, time, reason } = req.body;

  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ message: 'Missing required appointment fields.' });
  }

  try {
    const [existing] = await db.query(
      `SELECT * FROM Appointment WHERE Employee_ID = ? AND Date = ? AND Time = ?`,
      [doctorId, date, time]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: 'Appointment slot already booked for this doctor.',
      });
    }

    const [result] = await db.query(
      `INSERT INTO Appointment (Patient_ID, Employee_ID, Date, Time, Reason)
       VALUES (?, ?, ?, ?, ?)`,
      [patientId, doctorId, date, time, reason]
    );

    res.status(201).json({
      message: 'Appointment booked successfully.',
      appointmentId: result.insertId,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error during appointment creation.' });
  }
};

// Get All Appointments
export const getAllAppointments = async (req, res) => {
  try {
    const [appointments] = await db.query(`
      SELECT 
        A.Appointment_ID, 
        A.Date, 
        A.Time, 
        A.Reason,
        A.Status,
        P.Name AS Patient_Name, 
        P.Patient_ID,
        E.Name AS Doctor_Name, 
        E.Employee_ID
      FROM Appointment A
      JOIN Patient P ON A.Patient_ID = P.Patient_ID
      JOIN Employee E ON A.Employee_ID = E.Employee_ID
      ORDER BY A.Date DESC, A.Time ASC
    `);
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    res.status(500).json({ message: 'Server error while fetching appointments.' });
  }
};

// Get total appointments
export const getTotalAppointments = async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT COUNT(*) AS totalAppointments FROM Appointment`
    );
    res.status(200).json({ totalAppointments: result[0].totalAppointments });
  } catch (error) {
    console.error('Error fetching total appointments:', error);
    res.status(500).json({ message: 'Server error while fetching total appointments.' });
  }
};

// Get Doctor Appointments
export const getAppointmentsByDoctor = async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (req.user.role === 'Doctor' && req.user.id != id) {
    return res.status(403).json({ message: 'Forbidden: You can only view your own appointments.' });
  }

  let query = `
    SELECT 
      A.Appointment_ID, 
      A.Date, 
      A.Time, 
      A.Reason,
      P.Name AS Patient_Name, 
      P.Patient_ID
    FROM Appointment A
    JOIN Patient P ON A.Patient_ID = P.Patient_ID
    WHERE A.Employee_ID = ?
  `;

  const params = [id];
  if (date) {
    query += ` AND A.Date = ?`;
    params.push(date);
  }

  query += ` ORDER BY A.Time ASC`;

  try {
    const [appointments] = await db.query(query, params);
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: 'Server error while fetching doctor appointments.' });
  }
};

// Update Appointment
export const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { doctorId, date, time, reason } = req.body;

  const setClauses = [];
  const params = [];

  if (doctorId) { setClauses.push('Employee_ID = ?'); params.push(doctorId); }
  if (date) { setClauses.push('Date = ?'); params.push(date); }
  if (time) { setClauses.push('Time = ?'); params.push(time); }
  if (reason) { setClauses.push('Reason = ?'); params.push(reason); }

  if (setClauses.length === 0) {
    return res.status(400).json({ message: 'No fields provided for update.' });
  }

  params.push(id);

  try {
    const [result] = await db.query(
      `UPDATE Appointment SET ${setClauses.join(', ')} WHERE Appointment_ID = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found or no changes made.' });
    }

    res.status(200).json({ message: 'Appointment updated successfully.' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error during appointment update.' });
  }
};

// Delete / Cancel Appointment
export const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(`DELETE FROM Appointment WHERE Appointment_ID = ?`, [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Appointment not found.' });
    res.status(200).json({ message: 'Appointment cancelled successfully.' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error while cancelling appointment.' });
  }
};

// Cancel Appointment (status only)
export const cancelAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(`UPDATE Appointment SET Status = 'Cancelled' WHERE Appointment_ID = ?`, [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Appointment not found.' });
    res.status(200).json({ message: 'Appointment cancelled successfully.' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Server error while cancelling appointment.' });
  }
};

// Update Appointment Status (e.g., mark as Checked)
export const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { Status } = req.body; // Expect "Checked" or "Cancelled"

  if (!Status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  // Optional: only allow certain statuses
  const allowedStatuses = ['Scheduled', 'Cancelled', 'Checked'];
  if (!allowedStatuses.includes(Status)) {
    return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
  }

  try {
    const [result] = await db.query(
      `UPDATE Appointment SET Status = ? WHERE Appointment_ID = ?`,
      [Status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    res.status(200).json({ message: `Appointment status updated to "${Status}" successfully.` });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Server error while updating appointment status.' });
  }
};

