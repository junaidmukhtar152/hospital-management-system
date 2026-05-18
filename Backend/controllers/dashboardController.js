// D:/WebProjects/Hospital-Management-System/Backend/controllers/dashboardController.js

import db from "../config/db.js";

// ============================
// ✅ ADMIN DASHBOARD STATS
// ============================
export const getAdminDashboardStats = async (req, res) => {
  try {
    const [employees] = await db.query(`
          SELECT COUNT(*) AS totalEmployees
          FROM Employee E
          JOIN Role R ON E.Role_ID = R.Role_ID
          WHERE E.Status = 'Active'
          AND R.Role_Name != 'Patient'

        `);

    const [roles] = await db.query(`
          SELECT COUNT(*) AS totalRoles 
          FROM Role 
          WHERE Role_Name != 'Patient'
        `);

    const [roomsTotal] = await db.query(`
          SELECT COUNT(*) AS totalRooms FROM Room
        `);

    const [roomsOccupied] = await db.query(`
          SELECT COUNT(*) AS occupiedRooms 
          FROM Room 
          WHERE Status = 'Occupied'
        `);

    const roomOccupancy =
      roomsTotal[0].totalRooms === 0
        ? "0%"
        : Math.round(
            (roomsOccupied[0].occupiedRooms / roomsTotal[0].totalRooms) * 100
          ) + "%";

    res.status(200).json({
      totalEmployees: employees[0].totalEmployees,
      totalRoles: roles[0].totalRoles,
      roomOccupancy,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    res.status(500).json({ message: "Server error fetching dashboard stats" });
  }
};

// ============================
// ✅ RECEPTIONIST DASHBOARD STATS
// ============================
export const getReceptionistDashboardStats = async (req, res) => {
  try {
    // Total appointments today
    const [appointmentsToday] = await db.query(
      `SELECT COUNT(*) AS totalAppointments
            FROM Appointment
            WHERE DATE(Date) = CURDATE()
            AND Status IN ('Scheduled','Confirmed')`
    );

    // Patients currently checked in
    const [patientsCheckedIn] = await db.query(
      `SELECT COUNT(*) AS total
            FROM Room_Assignment
            WHERE Discharge_Date IS NULL`
    );

    // Total rooms and currently occupied rooms
    const [roomsTotal] = await db.query(
      `SELECT COUNT(*) AS totalRooms FROM Room`
    );

    const [roomsOccupied] = await db.query(
      `SELECT COUNT(*) AS occupiedRooms FROM Room WHERE Status = 'Occupied'`
    );

    const availableRooms =
      roomsTotal[0].totalRooms - roomsOccupied[0].occupiedRooms;

    // Pending bills
    const [pendingBills] = await db.query(
      `SELECT COUNT(*) AS totalPending FROM Bill WHERE Status = 'Pending'`
    );

    res.status(200).json({
      totalAppointmentsToday: appointmentsToday[0].totalAppointments,
      patientsCheckedIn: patientsCheckedIn[0].total,
      availableRooms,
      pendingBills: pendingBills[0].totalPending,
      totalRooms: roomsTotal[0].totalRooms,
      occupiedRooms: roomsOccupied[0].occupiedRooms,
    });
  } catch (error) {
    console.error("Error fetching receptionist dashboard stats:", error);
    res
      .status(500)
      .json({ message: "Server error fetching receptionist dashboard stats" });
  }
};

// ============================
// ✅ DOCTOR DASHBOARD STATS
// ============================
export const getDoctorDashboardStats = async (req, res) => {
  const doctorId = req.user?.id;

  if (!doctorId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Doctor ID not found in token payload." });
  }

  try {
    // 1. Fetch Today's Appointments (for the stats card count)
    const [todayAppointmentsCount] = await db.query(
      `SELECT COUNT(*) AS total
            FROM Appointment A
            WHERE A.Employee_ID = ?
            AND DATE(A.Date) = CURDATE()
            AND A.Status = 'Scheduled'`, // Only counting scheduled ones for the stat card
      [doctorId]
    );

    // 2. Total Patients Under Care
    const [totalPatients] = await db.query(
      `SELECT COUNT(DISTINCT Patient_ID) AS total
            FROM Appointment
            WHERE Employee_ID = ?`,
      [doctorId]
    );

    // 3. Pending Reports (Logic retained from your file)
    const [pendingReports] = await db.query(
      `SELECT COUNT(*) AS total
            FROM Test_Report
            WHERE Patient_ID IN (
                SELECT DISTINCT Patient_ID
                FROM Appointment
                WHERE Employee_ID = ?
            )`,
      [doctorId]
    );

    res.status(200).json({
      todayAppointments: todayAppointmentsCount[0].total, // Sending count, not the list
      totalPatients: totalPatients[0].total,
      pendingReports: pendingReports[0].total,
    });
  } catch (error) {
    console.error("Error fetching doctor dashboard stats:", error);
    res.status(500).json({ message: "Server error fetching doctor stats" });
  }
};

// ===================================
// 🟢 NEW: GET ALL APPOINTMENTS FOR DOCTOR
// ===================================
export const getDoctorAppointments = async (req, res) => {
  const doctorId = req.user?.id;

  if (!doctorId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Doctor ID not found." });
  }

  try {
    // Fetch all appointments for this doctor, joining Patient for display name
    const [allAppointments] = await db.query(
      `SELECT 
                A.Appointment_ID, 
                A.Date, 
                A.Time, 
                A.Reason,
                A.Status,
                P.Patient_ID, 
                P.Name AS Patient_Name
            FROM Appointment A
            JOIN Patient P ON A.Patient_ID = P.Patient_ID
            WHERE A.Employee_ID = ?
            ORDER BY A.Date DESC, A.Time DESC`, // Order for better display
      [doctorId]
    );

    // The frontend expects this to be the full data array.
    res.status(200).json(allAppointments);
  } catch (error) {
    console.error("Error fetching all doctor appointments:", error);
    res
      .status(500)
      .json({ message: "Server error fetching doctor appointments list" });
  }
};

