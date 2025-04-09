import { supabase } from "./client";

// Function to fetch all parking slots
export const fetchAllSlots = async () => {
  const { data, error } = await supabase
    .from('parking_slots.csv')
    .select('*');
  
  if (error) {
    console.error('Error fetching parking slots:', error);
    throw error;
  }
  
  return data;
};

// Function to fetch all bookings with slot information
export const fetchAllBookings = async () => {
  try {
    // First fetch all bookings
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      throw bookingsError;
    }
    
    // Then fetch all slots to get slot numbers
    const { data: slotsData, error: slotsError } = await supabase
      .from('parking_slots.csv')
      .select('id, number');
    
    if (slotsError) {
      console.error('Error fetching slots for bookings:', slotsError);
      throw slotsError;
    }
    
    // Create a map of slot_id to slot_number
    const slotMap = {};
    if (slotsData) {
      slotsData.forEach(slot => {
        slotMap[slot.id] = slot.number;
      });
    }
    
    // Format data to match the expected structure
    return bookingsData.map(booking => ({
      ...booking,
      slot_number: slotMap[booking.slot_id] || `Slot ${booking.slot_id}`
    }));
  } catch (error) {
    console.error('Error in fetchAllBookings:', error);
    throw error;
  }
};

// Function to create a test booking
export const createTestBooking = async () => {
  // First, check if there are any parking slots
  const { data: allSlots, error: allSlotsError } = await supabase
    .from('parking_slots.csv')
    .select('*');
  
  if (allSlotsError) {
    console.error('Error checking parking slots:', allSlotsError);
    throw allSlotsError;
  }
  
  // If no slots exist, create a default one
  if (!allSlots || allSlots.length === 0) {
    console.log('No parking slots found, creating a default slot');
    const { data: newSlot, error: createSlotError } = await supabase
      .from('parking_slots.csv')
      .insert({
        id: 1,
        number: 'A1',
        status: 'available',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createSlotError) {
      console.error('Error creating default slot:', createSlotError);
      throw createSlotError;
    }
  }
  
  // Now try to get an available slot
  const { data: slots, error: slotsError } = await supabase
    .from('parking_slots.csv')
    .select('*')
    .eq('status', 'available')
    .limit(1);
  
  if (slotsError) {
    console.error('Error finding available slot:', slotsError);
    throw slotsError;
  }
  
  // If no available slots, update a random slot to be available
  if (!slots || slots.length === 0) {
    console.log('No available slots, updating a random slot to be available');
    const { data: anySlot, error: anySlotError } = await supabase
      .from('parking_slots.csv')
      .select('*')
      .limit(1);
    
    if (anySlotError || !anySlot || anySlot.length === 0) {
      console.error('Error finding any slot:', anySlotError);
      throw anySlotError || new Error('No slots found in the database');
    }
    
    const { error: updateError } = await supabase
      .from('parking_slots.csv')
      .update({ status: 'available' })
      .eq('id', anySlot[0].id);
    
    if (updateError) {
      console.error('Error updating slot status:', updateError);
      throw updateError;
    }
    
    // Fetch the updated slot
    const { data: updatedSlot, error: updatedSlotError } = await supabase
      .from('parking_slots.csv')
      .select('*')
      .eq('id', anySlot[0].id)
      .single();
    
    if (updatedSlotError) {
      console.error('Error fetching updated slot:', updatedSlotError);
      throw updatedSlotError;
    }
    
    slots[0] = updatedSlot;
  }
  
  const slot = slots[0];
  const vehicleNumber = `TEST-${Math.floor(Math.random() * 10000)}`;
  const startTime = new Date();
  const endTime = new Date(Date.now() + 3600000); // 1 hour later
  const totalCost = 25.00;
  
  // Generate a random ID for the booking
  const randomId = Math.floor(Math.random() * 1000000) + 1;
  
  // Insert booking with an explicit ID
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      id: randomId, // Specify ID explicitly
      slot_id: slot.id,
      vehicle_number: vehicleNumber,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      total_cost: totalCost,
      status: 'upcoming',
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (bookingError) {
    console.error('Error creating test booking:', bookingError);
    throw bookingError;
  }
  
  // Update slot status
  const { error: updateError } = await supabase
    .from('parking_slots.csv')
    .update({ status: 'occupied' })
    .eq('id', slot.id);
  
  if (updateError) {
    console.error('Error updating slot status:', updateError);
    // Even if update fails, we still created the booking
  }
  
  // Log query for monitoring
  await logQuery('INSERT INTO bookings', 0.01);
  
  return {
    booking: {
      ...booking,
      vehicleNumber: booking.vehicle_number,
      slot_number: slot.number
    }
  };
};

// Function to check database connection
export const testDatabaseConnection = async () => {
  try {
    // Simple query to check if we can connect
    const { data, error } = await supabase
      .from('parking_slots.csv')
      .select('*')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    return { message: 'Database connection successful!' };
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Function to check database structure
export const checkDatabaseStructure = async () => {
  try {
    // Get tables info
    const tables = ['parking_slots.csv', 'bookings', 'db_monitoring'];
    const structures = {};
    const recordCounts = {};
    
    // Check each table exists and get record counts
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table as any)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`Error checking table ${table}:`, error);
        throw error;
      }
      
      recordCounts[table] = count || 0;
      
      // Get columns for each table
      const { data, error: columnsError } = await supabase
        .from(table as any)
        .select('*')
        .limit(1);
      
      if (columnsError) {
        console.error(`Error getting columns for ${table}:`, columnsError);
      } else if (data && data.length > 0) {
        structures[table] = Object.keys(data[0]).map(field => ({
          Field: field,
          Type: typeof data[0][field]
        }));
      }
    }
    
    return {
      tables,
      structures,
      recordCounts,
      message: 'Database structure checked successfully'
    };
  } catch (error) {
    console.error('Error checking database structure:', error);
    throw error;
  }
};

// Function to log query in monitoring table
export const logQuery = async (queryType: string, executionTime: number) => {
  try {
    // Check if this query type exists
    const { data, error } = await supabase
      .from('db_monitoring')
      .select('*')
      .eq('query_type', queryType);
    
    if (error) {
      console.error('Error checking for existing query type:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      // Update existing record
      const record = data[0];
      const count = record.count + 1;
      const totalTime = record.total_time + executionTime;
      const avgTime = totalTime / count;
      const maxTime = Math.max(record.max_time, executionTime);
      
      const { error: updateError } = await supabase
        .from('db_monitoring')
        .update({
          count,
          total_time: totalTime,
          avg_time: avgTime,
          max_time: maxTime,
          last_executed: new Date().toISOString()
        })
        .eq('id', record.id);
      
      if (updateError) {
        console.error('Error updating query monitoring:', updateError);
      }
    } else {
      // Insert new record with an auto-generated ID (will be created by Supabase)
      // Get the next ID first
      const { data: maxIdData } = await supabase
        .from('db_monitoring')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;
      
      const { error: insertError } = await supabase
        .from('db_monitoring')
        .insert({
          id: nextId, // Specify ID explicitly
          query_type: queryType,
          count: 1,
          total_time: executionTime,
          avg_time: executionTime,
          max_time: executionTime,
          last_executed: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error inserting query monitoring:', insertError);
      }
    }
  } catch (error) {
    console.error('Error logging query:', error);
  }
};

// Function to fetch database monitoring data
export const fetchDatabaseMonitoring = async () => {
  const { data, error } = await supabase
    .from('db_monitoring')
    .select('*')
    .order('total_time', { ascending: false });
  
  if (error) {
    console.error('Error fetching database monitoring data:', error);
    throw error;
  }
  
  return data.map(record => ({
    ...record,
    total_time: `${(record.total_time * 1000).toFixed(2)} ms`,
    avg_time: `${(record.avg_time * 1000).toFixed(2)} ms`,
    max_time: `${(record.max_time * 1000).toFixed(2)} ms`
  }));
};
