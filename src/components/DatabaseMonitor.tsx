
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
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface DatabaseRequest {
  Event: string;
  Count: number;
  'Total Latency': string;
  'Avg Latency': string;
  'Max Latency': string;
}

const DatabaseMonitor = () => {
  const [requests, setRequests] = useState<DatabaseRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDatabaseRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/monitor/requests');
      if (!response.ok) {
        throw new Error('Failed to fetch database requests');
      }
      const data = await response.json();
      setRequests(data);
      toast({
        title: "Success",
        description: "Database requests loaded successfully",
      });
    } catch (error) {
      console.error('Error fetching database requests:', error);
      toast({
        title: "Error",
        description: "Failed to load database requests",
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

      <Table>
        <TableCaption>Recent database queries and their performance metrics</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Count</TableHead>
            <TableHead>Total Latency</TableHead>
            <TableHead>Avg Latency</TableHead>
            <TableHead>Max Latency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length > 0 ? (
            requests.map((request, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium max-w-md truncate">
                  {request.Event}
                </TableCell>
                <TableCell>{request.Count}</TableCell>
                <TableCell>{request['Total Latency']}</TableCell>
                <TableCell>{request['Avg Latency']}</TableCell>
                <TableCell>{request['Max Latency']}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                {loading ? 'Loading...' : 'No database requests found'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DatabaseMonitor;
