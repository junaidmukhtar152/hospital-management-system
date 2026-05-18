// controllers/roomController.js
import db from '../config/db.js';

// Get all rooms
export const getAllRooms = async (req, res) => {
  try {
    const [rooms] = await db.query(
      `SELECT 
         R.Room_ID, R.Room_Type, R.Status,
         A.Patient_ID, P.Name AS Patient_Name, A.Admission_Date
       FROM Room R
       LEFT JOIN Room_Assignment A ON R.Room_ID = A.Room_ID AND A.Discharge_Date IS NULL
       LEFT JOIN Patient P ON A.Patient_ID = P.Patient_ID
       ORDER BY R.Room_ID ASC`
    );
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Server error while fetching rooms.' });
  }
};

// Assign patient
export const createRoomAssignment = async (req, res) => {
  const { patientId, roomId, admissionDate } = req.body;
  if (!patientId || !roomId || !admissionDate) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const [roomCheck] = await db.query(`SELECT Status FROM Room WHERE Room_ID = ?`, [roomId]);
    if (roomCheck.length === 0 || roomCheck[0].Status !== 'Available') {
      return res.status(409).json({ message: `Room ${roomId} is not available.` });
    }

    const [assignment] = await db.query(
      `INSERT INTO Room_Assignment (Patient_ID, Room_ID, Admission_Date, Discharge_Date)
       VALUES (?, ?, ?, NULL)`,
      [patientId, roomId, admissionDate]
    );

    await db.query(`UPDATE Room SET Status='Occupied' WHERE Room_ID=?`, [roomId]);
    res.status(201).json({ message: 'Patient assigned successfully.', assignmentId: assignment.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during assignment.' });
  }
};

// Discharge patient
export const dischargePatient = async (req, res) => {
  const { roomId } = req.params;
  const dischargeDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    const [assignment] = await db.query(
      `SELECT Assignment_ID FROM Room_Assignment WHERE Room_ID=? AND Discharge_Date IS NULL`,
      [roomId]
    );
    if (assignment.length === 0) {
      return res.status(404).json({ message: 'No active assignment found.' });
    }

    await db.query(
      `UPDATE Room_Assignment SET Discharge_Date=? WHERE Assignment_ID=?`,
      [dischargeDate, assignment[0].Assignment_ID]
    );

    await db.query(`UPDATE Room SET Status='Available' WHERE Room_ID=?`, [roomId]);
    res.status(200).json({ message: 'Patient discharged successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during discharge.' });
  }
};

// Update room status only
export const updateRoomStatus = async (req, res) => {
  const { roomId } = req.params;
  const { status } = req.body;

  if (!status || !['Available', 'Occupied', 'Maintenance'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  try {
    const [result] = await db.query(`UPDATE Room SET Status=? WHERE Room_ID=?`, [status, roomId]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Room not found.' });

    res.status(200).json({ message: `Room status updated to ${status}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating room status.' });
  }
};

// Create new room
export const createRoom = async (req, res) => {
  const { Room_ID, Room_Type, Status } = req.body;
  if (!Room_ID || !Room_Type || !Status) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    await db.query(`INSERT INTO Room (Room_ID, Room_Type, Status) VALUES (?, ?, ?)`, [
      Room_ID, Room_Type, Status
    ]);
    res.status(201).json({ message: 'Room added successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding room. Maybe Room_ID already exists.' });
  }
};

// Update room info
export const updateRoom = async (req, res) => {
  const { roomId } = req.params;
  const { Room_Type, Status } = req.body;

  try {
    const [result] = await db.query(`UPDATE Room SET Room_Type=?, Status=? WHERE Room_ID=?`, [
      Room_Type, Status, roomId
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Room not found.' });

    res.status(200).json({ message: 'Room updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating room.' });
  }
};

// Delete room
export const deleteRoom = async (req, res) => {
  const { roomId } = req.params;
  try {
    const [result] = await db.query(`DELETE FROM Room WHERE Room_ID=?`, [roomId]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Room not found.' });

    res.status(200).json({ message: 'Room deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting room.' });
  }
};
