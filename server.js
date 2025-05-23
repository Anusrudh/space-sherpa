
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection Pool with better error handling
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',     // Update with your MySQL username
  password: '',     // Update with your MySQL password
  database: 'parking_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  debug: false
});

// Validate database connection on startup with more detailed diagnostics
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful on startup!');
    
    // Check if tables exist with more detailed logging
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'parking_system'
    `);
    
    console.log('Available tables:', tables.map(t => t.TABLE_NAME || t.table_name));
    
    // Verify each critical table
    if (!tables.some(t => (t.TABLE_NAME || t.table_name) === 'bookings')) {
      console.error('CRITICAL: bookings table does not exist in database!');
      console.log('Please run the database-setup.sql script to create the required tables');
    }
    
    if (!tables.some(t => (t.TABLE_NAME || t.table_name) === 'parking_slots')) {
      console.error('CRITICAL: parking_slots table does not exist in database!');
      console.log('Please run the database-setup.sql script to create the required tables');
    }
    
    if (!tables.some(t => (t.TABLE_NAME || t.table_name) === 'db_monitoring')) {
      console.error('CRITICAL: db_monitoring table does not exist in database!');
      console.log('Please run the database-setup.sql script to create the required tables');
    }
    
    // Test if we can query and write to the booking table
    if (tables.some(t => (t.TABLE_NAME || t.table_name) === 'bookings')) {
      try {
        console.log('Testing direct write to bookings table...');
        // Attempt to write to bookings table directly
        const [result] = await connection.query(
          `INSERT INTO bookings (slot_id, vehicle_number, start_time, end_time, total_cost, status) 
           VALUES (1, 'TEST-STARTUP', NOW(), DATE_ADD(NOW(), INTERVAL 1 HOUR), 10.00, 'upcoming')`
        );
        console.log('Successfully wrote test entry to bookings table on startup:', result);
        
        // Now try to read it back
        const [readResult] = await connection.query('SELECT * FROM bookings WHERE vehicle_number = ?', ['TEST-STARTUP']);
        console.log('Successfully read test entry back from bookings table:', readResult);
        
        // Clean up the test entry
        await connection.query('DELETE FROM bookings WHERE vehicle_number = ?', ['TEST-STARTUP']);
        console.log('Successfully deleted test entry from bookings table');
      } catch (writeError) {
        console.error('CRITICAL ERROR: Failed to write to bookings table:', writeError);
        console.log('This likely indicates a permission issue or table structure problem');
      }
    }
    
    connection.release();
  } catch (error) {
    console.error('FATAL: Database connection failed on startup:', error);
    console.log('Please check your MySQL connection settings and ensure the server is running');
    console.log('Connection details:', {
      host: 'localhost',
      user: 'root',
      database: 'parking_system'
    });
  }
})();

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

// Get booking history with additional logging
app.get('/api/bookings', async (req, res) => {
  const startTime = process.hrtime();
  try {
    console.log('Attempting to fetch bookings from database...');
    
    // Direct raw query to check table existence first
    const [tablesCheck] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'parking_system' AND table_name = 'bookings'
    `);
    
    if (tablesCheck.length === 0) {
      console.error('ERROR: The bookings table does not exist!');
      return res.status(500).json({ error: 'The bookings table does not exist in the database' });
    }
    
    // Check if bookings table is empty
    const [countCheck] = await pool.query('SELECT COUNT(*) as count FROM bookings');
    console.log(`Found ${countCheck[0].count} bookings in the database`);
    
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
    
    console.log(`Successfully fetched ${rows.length} bookings from database`);
    
    // For debugging, log the first booking if any exist
    if (rows.length > 0) {
      console.log('First booking record:', rows[0]);
    } else {
      console.log('No booking records found in the database');
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: `Failed to fetch bookings: ${error.message}` });
  }
});

// Create a new booking with enhanced debugging and validation
app.post('/api/bookings', async (req, res) => {
  const { slotId, vehicleNumber, startTime, endTime, totalCost } = req.body;
  const startHrTime = process.hrtime();
  
  console.log('-------- CREATE BOOKING REQUEST --------');
  console.log('Received booking data:', req.body);
  
  // Validate required fields
  if (!slotId || !vehicleNumber || !startTime || !endTime) {
    console.error('Booking validation failed: Missing required fields');
    return res.status(400).json({ error: 'Missing required booking fields' });
  }
  
  try {
    // First, verify if the slot exists
    const [slotCheck] = await pool.query('SELECT * FROM parking_slots WHERE id = ?', [slotId]);
    if (slotCheck.length === 0) {
      console.error(`Slot ID ${slotId} does not exist in the database`);
      return res.status(404).json({ error: 'Parking slot not found' });
    }
    
    console.log('Slot found in database:', slotCheck[0]);
    
    // Verify the bookings table exists and its structure
    try {
      const [columns] = await pool.query('SHOW COLUMNS FROM bookings');
      console.log('Bookings table structure verified:', columns.map(c => c.Field).join(', '));
    } catch (tableError) {
      console.error('CRITICAL ERROR: Could not access bookings table:', tableError);
      return res.status(500).json({ error: 'Database error: bookings table not accessible' });
    }
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Format the values correctly for insertion
      const formattedStartTime = new Date(startTime).toISOString().slice(0, 19).replace('T', ' ');
      const formattedEndTime = new Date(endTime).toISOString().slice(0, 19).replace('T', ' ');
      
      // Insert the booking record
      console.log('Inserting booking with values:', [slotId, vehicleNumber, formattedStartTime, formattedEndTime, totalCost, 'upcoming']);
      
      // Use a more direct query with explicit values for each field
      const insertSql = 'INSERT INTO bookings (slot_id, vehicle_number, start_time, end_time, total_cost, status) VALUES (?, ?, ?, ?, ?, ?)';
      console.log('Raw SQL query:', insertSql);
      
      const [result] = await connection.query(
        insertSql,
        [slotId, vehicleNumber, formattedStartTime, formattedEndTime, totalCost, 'upcoming']
      );
      
      console.log('Booking insert result:', result);
      
      if (!result || !result.insertId) {
        console.error('ERROR: Insert operation did not return an insertId');
        throw new Error('Insert operation failed');
      }
      
      // Verify the booking was actually inserted by reading it back
      const [verifyInsert] = await connection.query('SELECT * FROM bookings WHERE id = ?', [result.insertId]);
      if (verifyInsert.length === 0) {
        console.error('CRITICAL ERROR: Booking appears to have been inserted (got insertId) but could not be read back');
        throw new Error('Insert verification failed');
      }
      console.log('Insert verified successfully:', verifyInsert[0]);
      
      // Update slot status
      console.log(`Updating slot ${slotId} status to "occupied"`);
      await connection.query(
        'UPDATE parking_slots SET status = ? WHERE id = ?', 
        ['occupied', slotId]
      );
      
      // Verify the slot status was updated
      const [verifySlotUpdate] = await connection.query('SELECT status FROM parking_slots WHERE id = ?', [slotId]);
      console.log('Slot status after update:', verifySlotUpdate[0].status);
      
      // Commit transaction
      await connection.commit();
      console.log('Transaction successfully committed');
      connection.release();
      
      // Log this query
      const endHrTime = process.hrtime(startHrTime);
      const executionTime = endHrTime[0] * 1000 + endHrTime[1] / 1000000;
      await logQuery('INSERT INTO bookings', executionTime / 1000);
      
      res.status(201).json({ 
        id: result.insertId,
        message: 'Booking created successfully' 
      });
      console.log('-------- CREATE BOOKING SUCCESS --------');
    } catch (error) {
      // If error, rollback the transaction
      await connection.rollback();
      connection.release();
      console.error('Transaction rolled back due to error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    console.log('-------- CREATE BOOKING FAILED --------');
    res.status(500).json({ error: `Failed to create booking: ${error.message}` });
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
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      await connection.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);
      await connection.query('UPDATE parking_slots SET status = ? WHERE id = ?', ['available', booking[0].slot_id]);
      
      // Commit transaction
      await connection.commit();
      connection.release();
      
      // Log this query
      const endHrTime = process.hrtime(startHrTime);
      const executionTime = endHrTime[0] * 1000 + endHrTime[1] / 1000000;
      await logQuery('UPDATE parking_slots SET status', executionTime / 1000);
      
      res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
      // If error, rollback the transaction
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: `Failed to cancel booking: ${error.message}` });
  }
});

// Create a route to view DB requests for monitoring purposes
app.get('/api/monitor/requests', async (req, res) => {
  try {
    // Use our custom monitoring table
    const [rows] = await pool.query(`
      SELECT 
        query_type,
        count,
        CONCAT(ROUND(total_time * 1000, 2), ' ms') AS total_time,
        CONCAT(ROUND(avg_time * 1000, 2), ' ms') AS avg_time,
        CONCAT(ROUND(max_time * 1000, 2), ' ms') AS max_time,
        last_executed
      FROM db_monitoring
      ORDER BY total_time DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching database requests:', error);
    res.status(500).json({ error: 'Failed to fetch database requests' });
  }
});

// Enhanced endpoint to check database structure
app.get('/api/check-db', async (req, res) => {
  try {
    // Check if tables exist
    const [tables] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'parking_system'
    `);
    
    // Get important table structures
    const tableStructures = {};
    
    if (tables.length > 0) {
      for (const table of tables) {
        const tableName = table.TABLE_NAME || table.table_name;
        const [columns] = await pool.query(`SHOW COLUMNS FROM ${tableName}`);
        tableStructures[tableName] = columns;
      }
    }
    
    // Get sample data counts
    const counts = {};
    for (const tableName in tableStructures) {
      const [countResult] = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      counts[tableName] = countResult[0].count;
    }
    
    res.json({
      tables: tables.map(t => t.TABLE_NAME || t.table_name),
      structures: tableStructures,
      recordCounts: counts,
      message: 'Database structure checked successfully'
    });
  } catch (error) {
    console.error('Error checking database structure:', error);
    res.status(500).json({ error: `Failed to check database structure: ${error.message}` });
  }
});

// Add a way to create test booking data directly from the API
app.post('/api/test/create-booking', async (req, res) => {
  try {
    // First get an available slot
    const [slots] = await pool.query('SELECT * FROM parking_slots WHERE status = "available" LIMIT 1');
    
    if (slots.length === 0) {
      return res.status(404).json({ error: 'No available slots found' });
    }
    
    const slot = slots[0];
    const bookingData = {
      slotId: slot.id,
      vehicleNumber: `TEST-${Math.floor(Math.random() * 10000)}`,
      startTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 19).replace('T', ' '),
      totalCost: 25.00
    };
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert the booking record
      console.log('Creating test booking with data:', bookingData);
      
      const [result] = await connection.query(
        'INSERT INTO bookings (slot_id, vehicle_number, start_time, end_time, total_cost, status) VALUES (?, ?, ?, ?, ?, ?)',
        [bookingData.slotId, bookingData.vehicleNumber, bookingData.startTime, bookingData.endTime, bookingData.totalCost, 'upcoming']
      );
      
      // Update slot status
      await connection.query(
        'UPDATE parking_slots SET status = ? WHERE id = ?', 
        ['occupied', bookingData.slotId]
      );
      
      // Commit transaction
      await connection.commit();
      connection.release();
      
      res.status(201).json({
        message: 'Test booking created successfully',
        booking: {
          id: result.insertId,
          ...bookingData,
          slot_number: slot.number
        }
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error creating test booking:', error);
    res.status(500).json({ error: `Failed to create test booking: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Access database monitor at http://localhost:${port}/api/check-db`);
  console.log(`To test MySQL connection: http://localhost:${port}/api/test-connection`);
});
