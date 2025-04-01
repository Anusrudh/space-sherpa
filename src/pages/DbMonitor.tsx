
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DatabaseMonitor from '@/components/DatabaseMonitor';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const DbMonitor = () => {
  const [isTestingDb, setIsTestingDb] = React.useState(false);
  
  const runDatabaseTest = async () => {
    try {
      setIsTestingDb(true);
      // First check DB connection
      const connResponse = await fetch('http://localhost:3001/api/test-connection');
      const connData = await connResponse.json();
      
      if (connResponse.ok) {
        toast({
          title: "Database Connection",
          description: connData.message || "Successfully connected to database",
        });
        
        // Then check DB structure
        const structureResponse = await fetch('http://localhost:3001/api/check-db');
        const structureData = await structureResponse.json();
        
        if (structureResponse.ok) {
          const tablesList = structureData.tables?.join(', ') || 'None found';
          toast({
            title: "Database Structure",
            description: `Available tables: ${tablesList}`,
          });
          
          // Create a test booking
          const bookingResponse = await fetch('http://localhost:3001/api/test/create-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const bookingData = await bookingResponse.json();
          
          if (bookingResponse.ok) {
            toast({
              title: "Test Booking Created",
              description: `Created booking for vehicle ${bookingData.booking.vehicleNumber} in slot ${bookingData.booking.slot_number}`,
              variant: "default"
            });
          } else {
            toast({
              title: "Test Booking Failed",
              description: bookingData.error || "Could not create test booking",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Database Structure Check Failed",
            description: structureData.error || "Could not check database structure",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Database Connection Failed",
          description: connData.error || "Could not connect to database",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Database test failed:', error);
      toast({
        title: "Database Test Failed",
        description: "Could not complete database tests. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsTestingDb(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="bg-parking-primary text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Database Monitoring</h1>
          <p className="text-lg">View and analyze MySQL database requests and booking records</p>
        </div>
      </div>
      
      <div className="bg-gray-50 flex-grow py-8">
        <div className="container mx-auto px-4">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important Notice</AlertTitle>
            <AlertDescription>
              Make sure your MySQL server is running and the database is properly set up.
              If you're experiencing issues, try running the diagnostic test below.
            </AlertDescription>
          </Alert>
          
          <div className="mb-6">
            <Button 
              onClick={runDatabaseTest}
              disabled={isTestingDb}
              className="bg-parking-accent hover:bg-parking-highlight"
            >
              {isTestingDb ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Database...
                </>
              ) : "Run Database Diagnostic Test"}
            </Button>
            <p className="mt-2 text-sm text-gray-500">
              This will test database connection, check table structure, and create a test booking.
            </p>
          </div>
          
          <React.Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <p>Loading database monitor...</p>
            </div>
          }>
            <DatabaseMonitor />
          </React.Suspense>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DbMonitor;
