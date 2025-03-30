
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

-- Create view for monitoring requests
CREATE OR REPLACE VIEW db_requests AS
SELECT 
  event_name AS 'Event',
  COUNT_STAR AS 'Count',
  sys.format_time(SUM_TIMER_WAIT) AS 'Total_Latency',
  sys.format_time(AVG_TIMER_WAIT) AS 'Avg_Latency',
  sys.format_time(MAX_TIMER_WAIT) AS 'Max_Latency'
FROM performance_schema.events_statements_summary_by_digest
ORDER BY SUM_TIMER_WAIT DESC
LIMIT 100;
