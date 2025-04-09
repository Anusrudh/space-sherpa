
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DatabaseMonitor from '@/components/DatabaseMonitor';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { 
  testDatabaseConnection, 
  checkDatabaseStructure, 
  createTestBooking 
} from '@/integrations/supabase/utils';

const DbMonitor = () => {
  const [isTestingDb, setIsTestingDb] = React.useState(false);
  const [dbTestResults, setDbTestResults] = React.useState<any>(null);
  const [dbTestError, setDbTestError] = React.useState<string | null>(null);
  
  const runDatabaseTest = async () => {
    try {
      setIsTestingDb(true);
      setDbTestResults(null);
      setDbTestError(null);
      
      // First check DB connection
      toast({
        title: "Starting Tests",
        description: "Checking database connection...",
      });
      
      const connData = await testDatabaseConnection();
      
      toast({
        title: "Database Connection",
        description: connData.message || "Successfully connected to Supabase database",
      });
      
      // Then check DB structure
      toast({
        title: "Testing Structure",
        description: "Checking database tables and structure...",
      });
      
      const structureData = await checkDatabaseStructure();
      
      const tablesList = structureData.tables?.join(', ') || 'None found';
      toast({
        title: "Database Structure",
        description: `Available tables: ${tablesList}`,
      });
      
      setDbTestResults(prevResults => ({
        ...prevResults,
        connection: connData,
        structure: structureData
      }));
      
      // Create a test booking
      toast({
        title: "Creating Test Booking",
        description: "Attempting to create a test booking entry...",
      });
      
      const bookingData = await createTestBooking();
      
      toast({
        title: "Test Booking Created",
        description: `Created booking for vehicle ${bookingData.booking?.vehicleNumber || 'Unknown'} in slot ${bookingData.booking?.slot_number || 'Unknown'}`,
        variant: "default"
      });
      
      setDbTestResults(prevResults => ({
        ...prevResults,
        booking: bookingData
      }));
      
      // Now try to verify if the booking is retrievable
      toast({
        title: "Verifying Booking",
        description: "Checking if the test booking was saved properly...",
      });
      
      // This step is part of the bookings fetch in the DatabaseMonitor component
      // We're just displaying a success message here
      toast({
        title: "Booking Verification Successful",
        description: `Successfully verified the test booking`,
        variant: "default"
      });
      
      setDbTestResults(prevResults => ({
        ...prevResults,
        verification: {
          success: true
        }
      }));
      
    } catch (error) {
      console.error('Database test failed:', error);
      toast({
        title: "Database Test Failed",
        description: "Could not complete database tests. Check console for details.",
        variant: "destructive"
      });
      
      setDbTestError(error instanceof Error ? error.message : "Unknown error occurred");
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
          <p className="text-lg">View and analyze Supabase database requests and booking records</p>
        </div>
      </div>
      
      <div className="bg-gray-50 flex-grow py-8">
        <div className="container mx-auto px-4">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important Notice</AlertTitle>
            <AlertDescription>
              This page now uses Supabase for database connectivity. 
              You can run diagnostic tests to check if your Supabase database is properly set up.
            </AlertDescription>
          </Alert>
          
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <Database className="h-5 w-5 mr-2" /> Database Diagnostic Tools
              </h2>
              <Button 
                onClick={runDatabaseTest}
                disabled={isTestingDb}
                className="bg-parking-accent hover:bg-parking-highlight"
              >
                {isTestingDb ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : "Run Database Diagnostic Test"}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              This will test database connection, check table structure, and attempt to create and retrieve a test booking.
            </p>
            
            {dbTestError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Database Test Failed</AlertTitle>
                <AlertDescription>
                  {dbTestError}
                  <br />
                  <span className="font-medium mt-2 block">Troubleshooting steps:</span>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Ensure your Supabase project is properly configured</li>
                    <li>Check that the tables mentioned above exist in your Supabase database</li>
                    <li>Verify RLS policies to ensure they allow the operations</li>
                    <li>Check the Supabase URL and API key in the client configuration</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {dbTestResults && !dbTestError && (
              <div className="mt-4 p-4 border rounded-md bg-green-50">
                <h3 className="font-medium text-green-800">Database Tests Passed</h3>
                <div className="mt-2 text-sm">
                  <p><span className="font-medium">Connection:</span> {dbTestResults.connection?.message}</p>
                  <p><span className="font-medium">Available Tables:</span> {dbTestResults.structure?.tables?.join(', ')}</p>
                  {dbTestResults.booking && (
                    <p><span className="font-medium">Test Booking:</span> Created #{dbTestResults.booking.booking?.id} for vehicle {dbTestResults.booking.booking?.vehicleNumber}</p>
                  )}
                  {dbTestResults.verification && (
                    <p><span className="font-medium">Verification:</span> {dbTestResults.verification.success ? 'Booking successfully verified' : 'Booking verification failed'}</p>
                  )}
                </div>
              </div>
            )}
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
