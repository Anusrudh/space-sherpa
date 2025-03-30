
-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS parking_system;
USE parking_system;

-- Create parking slots table
CREATE TABLE IF NOT EXISTS parking_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number VARCHAR(10) NOT NULL,
  status ENUM('available', 'occupied', 'selected') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slot_id INT NOT NULL,
  vehicle_number VARCHAR(20) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  status ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (slot_id) REFERENCES parking_slots(id)
);

-- Insert initial parking slots if empty
INSERT INTO parking_slots (number, status)
SELECT * FROM (
  SELECT 'A1', 'available' UNION
  SELECT 'A2', 'available' UNION
  SELECT 'A3', 'available' UNION
  SELECT 'A4', 'available' UNION
  SELECT 'A5', 'occupied' UNION
  SELECT 'B1', 'available' UNION
  SELECT 'B2', 'available' UNION
  SELECT 'B3', 'occupied' UNION
  SELECT 'B4', 'available' UNION
  SELECT 'B5', 'available' UNION
  SELECT 'C1', 'available' UNION
  SELECT 'C2', 'occupied' UNION
  SELECT 'C3', 'available' UNION
  SELECT 'C4', 'available' UNION
  SELECT 'C5', 'available'
) AS data
WHERE NOT EXISTS (SELECT 1 FROM parking_slots LIMIT 1);

-- Create a table to store database monitoring information manually
-- This is a workaround since not all MySQL installations have performance_schema enabled
CREATE TABLE IF NOT EXISTS db_monitoring (
  id INT AUTO_INCREMENT PRIMARY KEY,
  query_type VARCHAR(50) NOT NULL,
  count INT DEFAULT 1,
  total_time DECIMAL(10, 2) DEFAULT 0,
  avg_time DECIMAL(10, 2) DEFAULT 0,
  max_time DECIMAL(10, 2) DEFAULT 0,
  last_executed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample monitoring data
INSERT INTO db_monitoring (query_type, count, total_time, avg_time, max_time) VALUES
('SELECT * FROM parking_slots', 15, 0.023, 0.0015, 0.005),
('INSERT INTO bookings', 8, 0.046, 0.0058, 0.012),
('UPDATE parking_slots SET status', 12, 0.035, 0.0029, 0.008),
('SELECT * FROM bookings', 20, 0.031, 0.0016, 0.004);
