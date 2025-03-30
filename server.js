
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',     // Update with your MySQL username
  password: '',     // Update with your MySQL password
  database: 'parking_system'
});

// Simple query logging middleware to track database usage
const logQuery = async (queryType, executionTime) => {
  try {
    // Check if this query type exists in our monitoring table
    const [rows] = await pool.query(
      'SELECT * FROM db_monitoring WHERE query_type = ?',
      [queryType]
    );
    
    if (rows.length > 0) {
      // Update existing record
      await pool.query(
        `UPDATE db_monitoring SET 
         count = count + 1,
         total_time = total_time + ?,
         avg_time = (total_time + ?) / (count + 1),
         max_time = GREATEST(max_time, ?),
         last_executed = CURRENT_TIMESTAMP
         WHERE query_type = ?`,
        [executionTime, executionTime, executionTime, queryType]
      );
    } else {
      // Insert new record
      await pool.query(
        `INSERT INTO db_monitoring 
         (query_type, count, total_time, avg_time, max_time)
         VALUES (?, 1, ?, ?, ?)`,
        [queryType, executionTime, executionTime, executionTime]
      );
    }
  } catch (error) {
    console.error('Error logging query:', error);
  }
};

// Test database connection
app.get('/api/test-connection', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ message: 'Database connection successful!' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
});

// Get all parking slots
app.get('/api/slots', async (req, res) => {
  const startTime = process.hrtime();
  try {
    const [rows] = await pool.query('SELECT * FROM parking_slots');
    
    // Log this query
    const endTime = process.hrtime(startTime);
    const executionTime = endTime[0] * 1000 + endTime[1] / 1000000; // Convert to milliseconds
    await logQuery('SELECT * FROM parking_slots', executionTime / 1000); // Convert to seconds
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching parking slots:', error);
    res.status(500).json({ error: 'Failed to fetch parking slots' });
  }
});

// Get booking history
app.get('/api/bookings', async (req, res) => {
  const startTime = process.hrtime();
  try {
    const [rows] = await pool.query(`
      SELECT b.*, ps.number as slot_number 
      FROM bookings b
      JOIN parking_slots ps ON b.slot_id = ps.id
      ORDER BY b.created_at DESC
    `);
    
    // Log this query
    const endTime = process.hrtime(startTime);
    const executionTime = endTime[0] * 1000 + endTime[1] / 1000000; // Convert to milliseconds
    await logQuery('SELECT * FROM bookings', executionTime / 1000); // Convert to seconds
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  const { slotId, vehicleNumber, startTime, endTime, totalCost } = req.body;
  const startHrTime = process.hrtime();
  
  try {
    const [result] = await pool.query(
      'INSERT INTO bookings (slot_id, vehicle_number, start_time, end_time, total_cost, status) VALUES (?, ?, ?, ?, ?, ?)',
      [slotId, vehicleNumber, startTime, endTime, totalCost, 'upcoming']
    );
    
    // Update slot status
    await pool.query('UPDATE parking_slots SET status = ? WHERE id = ?', ['occupied', slotId]);
    
    // Log this query
    const endHrTime = process.hrtime(startHrTime);
    const executionTime = endHrTime[0] * 1000 + endHrTime[1] / 1000000;
    await logQuery('INSERT INTO bookings', executionTime / 1000);
    
    res.status(201).json({ 
      id: result.insertId,
      message: 'Booking created successfully' 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Cancel booking
app.put('/api/bookings/:id/cancel', async (req, res) => {
  const { id } = req.params;
  const startHrTime = process.hrtime();
  
  try {
    const [booking] = await pool.query('SELECT slot_id FROM bookings WHERE id = ?', [id]);
    
    if (booking.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);
    await pool.query('UPDATE parking_slots SET status = ? WHERE id = ?', ['available', booking[0].slot_id]);
    
    // Log this query
    const endHrTime = process.hrtime(startHrTime);
    const executionTime = endHrTime[0] * 1000 + endHrTime[1] / 1000000;
    await logQuery('UPDATE parking_slots SET status', executionTime / 1000);
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Create a route to view DB requests for monitoring purposes
app.get('/api/monitor/requests', async (req, res) => {
  try {
    // Instead of using performance_schema, use our custom monitoring table
    const [rows] = await pool.query(`
      SELECT 
        query_type AS 'Event',
        count AS 'Count',
        CONCAT(ROUND(total_time * 1000, 2), ' ms') AS 'Total Latency',
        CONCAT(ROUND(avg_time * 1000, 2), ' ms') AS 'Avg Latency',
        CONCAT(ROUND(max_time * 1000, 2), ' ms') AS 'Max Latency'
      FROM db_monitoring
      ORDER BY total_time DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching database requests:', error);
    res.status(500).json({ error: 'Failed to fetch database requests' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
