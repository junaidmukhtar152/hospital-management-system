-- Create Database
CREATE DATABASE IF NOT EXISTS EasyCareDB;
USE EasyCareDB;

-- 1. Role Table
CREATE TABLE Role (
    Role_ID INT PRIMARY KEY AUTO_INCREMENT,
    Role_Name VARCHAR(50) NOT NULL UNIQUE,
    Description TEXT
);

-- 2. Employee Table
CREATE TABLE Employee (
    Employee_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Role_ID INT NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Status ENUM('Active', 'Inactive') DEFAULT 'Active',
    FOREIGN KEY (Role_ID) REFERENCES Role(Role_ID)
);

-- 3. Patient Table
CREATE TABLE Patient (
    Patient_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Age INT,
    DOB DATE,
    Gender ENUM('Male', 'Female', 'Other'),
    Address VARCHAR(500),
    Phone VARCHAR(11)
);

-- 4. Appointment Table
CREATE TABLE Appointment (
    Appointment_ID INT PRIMARY KEY AUTO_INCREMENT,
    Patient_ID INT NOT NULL,
    Employee_ID INT NOT NULL, -- Doctor
    Date DATE NOT NULL,
    Time TIME NOT NULL,
    Reason VARCHAR(255),
    Status ENUM('Scheduled', 'Cancelled') DEFAULT 'Scheduled',
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID),
    FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID)
);

-- 5. Prescription Table
CREATE TABLE Prescription (
    Prescription_ID INT PRIMARY KEY AUTO_INCREMENT,
    Patient_ID INT NOT NULL,
    Employee_ID INT NOT NULL, -- Doctor
    Date DATE NOT NULL,
    Medicines_List TEXT,
    Dosage VARCHAR(100),
    Duration VARCHAR(100),
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID),
    FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID)
);

-- 6. Bill Table
CREATE TABLE Bill (
    Bill_ID INT PRIMARY KEY AUTO_INCREMENT,
    Patient_ID INT NOT NULL,
    Amount DECIMAL(10, 2) NOT NULL,
    Date DATE NOT NULL,
    Status ENUM('Pending', 'Paid', 'Cancelled') DEFAULT 'Pending',
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID)
);

-- 7. Test_Report Table
CREATE TABLE Test_Report (
    Report_ID INT PRIMARY KEY AUTO_INCREMENT,
    Patient_ID INT NOT NULL,
    Result TEXT,
    Date DATE NOT NULL,
    Type VARCHAR(100),
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID)
);

-- 8. Room Table
CREATE TABLE Room (
    Room_ID INT PRIMARY KEY,
    Room_Type VARCHAR(50) NOT NULL,
    Status ENUM('Available', 'Occupied', 'Maintenance') NOT NULL
);

-- 9. Room_Assignment Table
CREATE TABLE Room_Assignment (
    Assignment_ID INT PRIMARY KEY AUTO_INCREMENT,
    Patient_ID INT NOT NULL,
    Room_ID INT NOT NULL,
    Admission_Date DATETIME NOT NULL,
    Discharge_Date DATETIME,
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID),
    FOREIGN KEY (Room_ID) REFERENCES Room(Room_ID)
);

-- Insert initial Roles
INSERT INTO Role (Role_ID, Role_Name, Description) VALUES
(1, 'Admin', 'Full system access and management.'),
(2, 'Doctor', 'Access to patient charts, prescriptions, and reports.'),
(3, 'Receptionist', 'Manages appointments, billing, rooms, and patient registration.'),
(4, 'Patient', 'Public user for self-service appointment booking.');

-- Insert initial Patients
INSERT INTO Patient (Patient_ID, Name, Age, DOB, Gender, Address, Phone) VALUES
(1, 'Alice Johnson', 35, '1988-05-15', 'Female', '123 Main St', '555-0101'),
(2, 'Bob Williams', 52, '1971-11-20', 'Male', '456 Oak Ave', '555-0102');

-- Insert initial Rooms
INSERT INTO Room (Room_ID, Room_Type, Status) VALUES
(101, 'General Ward', 'Occupied'),
(102, 'General Ward', 'Available'),
(103, 'General', 'Available'),
(104, 'General', 'Available'),
(105, 'General', 'Available'),
(106, 'General', 'Available'),
(107, 'General', 'Available'),
(108, 'General', 'Available'),
(109, 'General', 'Available'),
(110, 'General', 'Available'),
(201, 'ICU', 'Available'),
(202, 'ICU', 'Available'),
(203, 'ICU', 'Available'),
(204, 'ICU', 'Available'),
(205, 'ICU', 'Available'),
(206, 'ICU', 'Available'),
(207, 'ICU', 'Available'),
(208, 'ICU', 'Available'),
(209, 'ICU', 'Available'),
(301, 'Private', 'Available');

-- Insert initial Employee
INSERT INTO Employee (Name, Role_ID, Email, Password, Status)
VALUES ('Admin', 1, 'admin@easycare.com', 'admin123', 'Active');


ALTER TABLE Appointment 
MODIFY Status ENUM('Scheduled', 'Cancelled', 'Checked') DEFAULT 'Scheduled';

ALTER TABLE patient MODIFY Phone VARCHAR(11);

SELECT * FROM Employee ;

DELETE FROM Employee WHERE Employee_ID  = 5;



