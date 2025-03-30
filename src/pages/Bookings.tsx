
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingHistoryCard, { Booking } from '@/components/BookingHistoryCard';
import { toast } from '@/components/ui/use-toast';

// Mock data for bookings
const mockBookings: Booking[] = [
  {
    id: 1,
    locationName: "Downtown Parking Garage",
    address: "123 Main St, Downtown",
    date: "2023-10-25",
    startTime: "09:00",
    endTime: "17:00",
    status: "upcoming",
    vehicleNumber: "ABC123",
    totalCost: 28.00
  },
  {
    id: 2,
    locationName: "Central Plaza Parking",
    address: "456 Center Ave, Midtown",
    date: "2023-10-20",
    startTime: "08:30",
    endTime: "14:30",
    status: "active",
    vehicleNumber: "XYZ789",
    totalCost: 24.00
  },
  {
    id: 3,
    locationName: "Riverside Parking Lot",
    address: "789 River Rd, Riverside",
    date: "2023-09-15",
    startTime: "10:00",
    endTime: "15:00",
    status: "completed",
    vehicleNumber: "DEF456",
    totalCost: 12.50
  },
  {
    id: 4,
    locationName: "Station Square Garage",
    address: "101 Station Square, Downtown",
    date: "2023-08-22",
    startTime: "12:00",
    endTime: "16:00",
    status: "completed",
    vehicleNumber: "GHI789",
    totalCost: 20.00
  },
  {
    id: 5,
    locationName: "City Center Parking",
    address: "303 Central St, Downtown",
    date: "2023-11-05",
    startTime: "09:00",
    endTime: "18:00",
    status: "upcoming",
    vehicleNumber: "JKL012",
    totalCost: 40.50
  }
];

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);
  
  const upcomingBookings = bookings.filter(booking => booking.status === 'upcoming');
  const activeBookings = bookings.filter(booking => booking.status === 'active');
  const pastBookings = bookings.filter(booking => ['completed', 'cancelled'].includes(booking.status));
  
  const handleCancelBooking = (id: number) => {
    setBookingToCancel(id);
  };
  
  const confirmCancelBooking = () => {
    if (bookingToCancel) {
      // In a real app, this would make an API call to cancel the booking
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingToCancel
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
      
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
      
      setBookingToCancel(null);
    }
  };
  
  const handleViewDetails = (id: number) => {
    // In a real app, this might navigate to a detailed view or show a modal
    console.log(`View details for booking ${id}`);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="bg-parking-primary text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">My Bookings</h1>
        </div>
      </div>
      
      <div className="bg-gray-50 flex-grow py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-8 w-full max-w-md mx-auto grid grid-cols-3">
              <TabsTrigger value="upcoming" className="flex-1">
                Upcoming ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex-1">
                Active ({activeBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1">
                Past ({pastBookings.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              <div className="space-y-6">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking) => (
                    <BookingHistoryCard 
                      key={booking.id} 
                      booking={booking} 
                      onCancel={handleCancelBooking}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">No Upcoming Bookings</h3>
                    <p className="text-gray-600 mb-4">You don't have any upcoming parking reservations.</p>
                    <a href="/search" className="text-parking-accent hover:text-parking-highlight font-medium">
                      Book parking now
                    </a>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="active">
              <div className="space-y-6">
                {activeBookings.length > 0 ? (
                  activeBookings.map((booking) => (
                    <BookingHistoryCard 
                      key={booking.id} 
                      booking={booking} 
                      onViewDetails={handleViewDetails}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">No Active Bookings</h3>
                    <p className="text-gray-600 mb-4">You don't have any active parking sessions right now.</p>
                    <a href="/search" className="text-parking-accent hover:text-parking-highlight font-medium">
                      Book parking now
                    </a>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="past">
              <div className="space-y-6">
                {pastBookings.length > 0 ? (
                  pastBookings.map((booking) => (
                    <BookingHistoryCard 
                      key={booking.id} 
                      booking={booking} 
                      onViewDetails={handleViewDetails}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">No Past Bookings</h3>
                    <p className="text-gray-600">Your booking history will appear here.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <AlertDialog open={bookingToCancel !== null} onOpenChange={(open) => !open && setBookingToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelBooking}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
};

export default Bookings;
