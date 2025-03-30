
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
  try {
    const [rows] = await pool.query('SELECT * FROM parking_slots');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching parking slots:', error);
    res.status(500).json({ error: 'Failed to fetch parking slots' });
  }
});

// Get booking history
app.get('/api/bookings', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, ps.number as slot_number 
      FROM bookings b
      JOIN parking_slots ps ON b.slot_id = ps.id
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  const { slotId, vehicleNumber, startTime, endTime, totalCost } = req.body;
  
  try {
    const [result] = await pool.query(
      'INSERT INTO bookings (slot_id, vehicle_number, start_time, end_time, total_cost, status) VALUES (?, ?, ?, ?, ?, ?)',
      [slotId, vehicleNumber, startTime, endTime, totalCost, 'upcoming']
    );
    
    // Update slot status
    await pool.query('UPDATE parking_slots SET status = ? WHERE id = ?', ['occupied', slotId]);
    
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
  
  try {
    const [booking] = await pool.query('SELECT slot_id FROM bookings WHERE id = ?', [id]);
    
    if (booking.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);
    await pool.query('UPDATE parking_slots SET status = ? WHERE id = ?', ['available', booking[0].slot_id]);
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Create a route to view DB requests for monitoring purposes
app.get('/api/monitor/requests', async (req, res) => {
  try {
    // This query gets the most recent database requests from MySQL's performance_schema
    // Note: This requires appropriate privileges and performance_schema to be enabled
    const [rows] = await pool.query(`
      SELECT 
        event_name AS 'Event',
        COUNT_STAR AS 'Count',
        sys.format_time(SUM_TIMER_WAIT) AS 'Total Latency',
        sys.format_time(AVG_TIMER_WAIT) AS 'Avg Latency',
        sys.format_time(MAX_TIMER_WAIT) AS 'Max Latency'
      FROM performance_schema.events_statements_summary_by_digest
      ORDER BY SUM_TIMER_WAIT DESC
      LIMIT 100;
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
