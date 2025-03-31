
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
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface DatabaseRequest {
  query_type: string;
  count: number;
  total_time: string;
  avg_time: string;
  max_time: string;
  last_executed?: string;
}

const DatabaseMonitor = () => {
  const [requests, setRequests] = useState<DatabaseRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchDatabaseRequests();
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(fetchDatabaseRequests, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Database Request Monitor</h2>
        <Button 
          onClick={fetchDatabaseRequests} 
          disabled={loading}
          className="bg-parking-primary hover:bg-parking-highlight"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refreshing
            </>
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

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
          {requests.length > 0 ? (
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
                {loading ? 'Loading...' : error ? 'Error loading data' : 'No database requests found'}
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
  );
};

export default DatabaseMonitor;
