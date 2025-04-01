
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Database, Calendar, List, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';

interface DatabaseRequest {
  query_type: string;
  count: number;
  total_time: string;
  avg_time: string;
  max_time: string;
  last_executed?: string;
}

interface Booking {
  id: number;
  slot_id: number;
  vehicle_number: string;
  start_time: string;
  end_time: string;
  total_cost: number;
  status: string;
  created_at: string;
  slot_number?: string;
}

interface DbStructure {
  tables: string[];
  structures: { [key: string]: any[] };
  recordCounts: { [key: string]: number };
  message: string;
}

const DatabaseMonitor = () => {
  const [requests, setRequests] = useState<DatabaseRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dbStructure, setDbStructure] = useState<DbStructure | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);
  const [loadingStructure, setLoadingStructure] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const fetchDatabaseRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      // Adding a timestamp parameter to prevent caching
      const response = await fetch(`http://localhost:3001/api/monitor/requests?t=${Date.now()}`);
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Received data:", data);
      setRequests(data);
      toast({
        title: "Success",
        description: "Database requests loaded successfully",
      });
    } catch (error) {
      console.error('Error fetching database requests:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast({
        title: "Error",
        description: "Failed to load database requests. Check if server is running.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    setBookingsError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/bookings?t=${Date.now()}`);
      console.log("Bookings API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Received bookings data:", data);
      setBookings(data);
      
      if (data.length === 0) {
        console.log("No bookings found in the database");
      }
      
      toast({
        title: "Success",
        description: "Booking details loaded successfully",
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookingsError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast({
        title: "Error",
        description: "Failed to load booking details. Check if server is running.",
        variant: "destructive",
      });
    } finally {
      setLoadingBookings(false);
    }
  };
  
  const checkDatabaseStructure = async () => {
    setLoadingStructure(true);
    try {
      const response = await fetch(`http://localhost:3001/api/check-db?t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Database structure:", data);
      setDbStructure(data);
      
      toast({
        title: "Success",
        description: "Database structure checked successfully",
      });
    } catch (error) {
      console.error('Error checking database structure:', error);
      toast({
        title: "Error",
        description: "Failed to check database structure",
        variant: "destructive",
      });
    } finally {
      setLoadingStructure(false);
    }
  };

  useEffect(() => {
    fetchDatabaseRequests();
    fetchBookings();
    checkDatabaseStructure();
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchDatabaseRequests();
      fetchBookings();
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const formatDateTime = (dateTime: string) => {
    try {
      return format(new Date(dateTime), 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      return dateTime;
    }
  };
  
  // Function to create a sample booking for testing
  const createSampleBooking = async () => {
    try {
      // Get a valid slot ID from the database first
      const slotsResponse = await fetch('http://localhost:3001/api/slots');
      if (!slotsResponse.ok) {
        throw new Error(`Failed to fetch slots: ${slotsResponse.statusText}`);
      }
      
      const slots = await slotsResponse.json();
      console.log("Available slots:", slots);
      
      // Find an available slot
      const availableSlot = slots.find((slot: any) => slot.status === 'available');
      
      if (!availableSlot) {
        throw new Error('No available parking slots found');
      }
      
      const slotId = availableSlot.id;
      console.log(`Using slot ID: ${slotId} for test booking`);
      
      // Create a booking with the found slot
      const bookingData = {
        slotId: slotId,
        vehicleNumber: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
        totalCost: 10.00
      };
      
      console.log("Sending booking data:", bookingData);
      
      const response = await fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      console.log("Booking creation response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create booking: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Created sample booking:", data);
      
      toast({
        title: "Success",
        description: "Sample booking created successfully",
      });
      
      // Refresh the bookings list
      fetchBookings();
    } catch (error) {
      console.error('Error creating sample booking:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create sample booking",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Database Monitor</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              fetchDatabaseRequests();
              fetchBookings();
              checkDatabaseStructure();
            }} 
            disabled={loading || loadingBookings}
            className="bg-parking-primary hover:bg-parking-highlight"
          >
            {(loading || loadingBookings) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refreshing
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh All
              </>
            )}
          </Button>
          <Button 
            onClick={createSampleBooking}
            variant="outline"
            className="border-parking-primary text-parking-primary hover:bg-parking-primary/10"
          >
            Create Test Booking
          </Button>
        </div>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="queries" className="flex items-center">
            <Database className="w-4 h-4 mr-2" /> Query Stats
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" /> Booking Details
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex items-center">
            <List className="w-4 h-4 mr-2" /> DB Structure
          </TabsTrigger>
        </TabsList>

        {/* Query statistics tab content */}
        <TabsContent value="queries" className="mt-4">
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <div>
                  <p className="font-medium">Failed to load database requests</p>
                  <p className="text-sm">{error}</p>
                  <p className="text-sm mt-1">Make sure the server is running on port 3001.</p>
                </div>
              </div>
            )}

            <Table>
              <TableCaption>Recent database queries and their performance metrics</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Query Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Total Time</TableHead>
                  <TableHead>Average Time</TableHead>
                  <TableHead>Max Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      <p className="mt-2">Loading database requests...</p>
                    </TableCell>
                  </TableRow>
                ) : requests.length > 0 ? (
                  requests.map((request, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium max-w-md truncate">
                        {request.query_type}
                      </TableCell>
                      <TableCell>{request.count}</TableCell>
                      <TableCell>{request.total_time}</TableCell>
                      <TableCell>{request.avg_time}</TableCell>
                      <TableCell>{request.max_time}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      {error ? 'Error loading data' : 'No database requests found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {!loading && !error && requests.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p>No database activity recorded yet. Try using the application to generate some queries.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Bookings tab content */}
        <TabsContent value="bookings" className="mt-4">
          <div className="space-y-4">
            {bookingsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <div>
                  <p className="font-medium">Failed to load booking details</p>
                  <p className="text-sm">{bookingsError}</p>
                  <p className="text-sm mt-1">Make sure the server is running on port 3001.</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center">
                <List className="w-5 h-5 mr-2" /> Booking Records
              </h3>
              <Button 
                onClick={fetchBookings} 
                disabled={loadingBookings}
                variant="outline"
                size="sm"
              >
                {loadingBookings ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Refreshing
                  </>
                ) : (
                  'Refresh Bookings'
                )}
              </Button>
            </div>

            <Table>
              <TableCaption>All booking records from the database</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingBookings ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      <p className="mt-2">Loading booking records...</p>
                    </TableCell>
                  </TableRow>
                ) : bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.id}</TableCell>
                      <TableCell>{booking.slot_number || booking.slot_id}</TableCell>
                      <TableCell>{booking.vehicle_number}</TableCell>
                      <TableCell>{formatDateTime(booking.start_time)}</TableCell>
                      <TableCell>{formatDateTime(booking.end_time)}</TableCell>
                      <TableCell>${booking.total_cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'active' ? 'bg-green-100 text-green-800' :
                          booking.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatDateTime(booking.created_at)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      {bookingsError ? 'Error loading data' : 'No bookings found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {!loadingBookings && !bookingsError && bookings.length === 0 && (
              <div className="text-center py-8 border rounded-md bg-gray-50">
                <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No booking records found in the database.</p>
                <Button 
                  onClick={createSampleBooking}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Create Test Booking
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* DB Structure tab content */}
        <TabsContent value="structure" className="mt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center">
                <Database className="w-5 h-5 mr-2" /> Database Structure
              </h3>
              <Button
                onClick={checkDatabaseStructure}
                disabled={loadingStructure}
                variant="outline"
                size="sm"
              >
                {loadingStructure ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Checking...
                  </>
                ) : (
                  'Check Structure'
                )}
              </Button>
            </div>
            
            {loadingStructure ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="mt-2">Checking database structure...</p>
              </div>
            ) : dbStructure ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium mb-2">Tables in Database:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {dbStructure.tables && dbStructure.tables.map((table: string, index: number) => (
                      <div key={index} className="bg-gray-100 p-3 rounded-md">
                        {table}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium mb-2">Bookings Table Structure:</h4>
                  {dbStructure.structures && dbStructure.structures.bookings ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Null</TableHead>
                          <TableHead>Key</TableHead>
                          <TableHead>Default</TableHead>
                          <TableHead>Extra</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dbStructure.structures.bookings.map((column: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{column.Field}</TableCell>
                            <TableCell>{column.Type}</TableCell>
                            <TableCell>{column.Null}</TableCell>
                            <TableCell>{column.Key}</TableCell>
                            <TableCell>{column.Default || '-'}</TableCell>
                            <TableCell>{column.Extra || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
                      <p>Bookings table structure not available. Please check if the table exists.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md bg-gray-50">
                <p className="text-gray-500">No database structure information available.</p>
                <Button 
                  onClick={checkDatabaseStructure}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Check Database Structure
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseMonitor;
