
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingHistoryCard, { Booking } from '@/components/BookingHistoryCard';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch bookings from Supabase
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('bookings')
          .select('id, slot_id, vehicle_number, start_time, end_time, total_cost, status, created_at');
        
        if (error) {
          console.error('Error fetching bookings:', error);
          toast({
            title: "Error Loading Bookings",
            description: "Could not load your bookings. Please try again later.",
            variant: "destructive"
          });
          return;
        }
        
        // If no data, leave bookings empty
        if (!data || data.length === 0) {
          setBookings([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch slot information for each booking
        const bookingsWithSlotInfo = await Promise.all(data.map(async (booking) => {
          try {
            const { data: slotData, error: slotError } = await supabase
              .from('parking_slots.csv')
              .select('number')
              .eq('id', booking.slot_id)
              .single();
              
            const slotNumber = slotError || !slotData ? 'unknown' : slotData.number;
            
            // Format dates for display
            const startDate = new Date(booking.start_time);
            const endDate = new Date(booking.end_time);
            
            return {
              id: booking.id,
              locationName: "Downtown Parking Garage", // Default location for now
              address: "123 Main St, Downtown", // Default address for now
              date: startDate.toISOString().split('T')[0],
              startTime: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
              endTime: endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
              status: booking.status as 'upcoming' | 'active' | 'completed' | 'cancelled',
              vehicleNumber: booking.vehicle_number,
              totalCost: booking.total_cost
            };
          } catch (err) {
            console.error('Error getting slot info:', err);
            return null;
          }
        }));
        
        // Filter out any null entries from errors
        const validBookings = bookingsWithSlotInfo.filter(booking => booking !== null) as Booking[];
        setBookings(validBookings);
      } catch (err) {
        console.error('Error in fetchBookings:', err);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading bookings.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  const upcomingBookings = bookings.filter(booking => booking.status === 'upcoming');
  const activeBookings = bookings.filter(booking => booking.status === 'active');
  const pastBookings = bookings.filter(booking => ['completed', 'cancelled'].includes(booking.status));
  
  const handleCancelBooking = (id: number) => {
    setBookingToCancel(id);
  };
  
  const confirmCancelBooking = async () => {
    if (bookingToCancel) {
      try {
        // Find the booking to get the slot_id
        const bookingToUpdate = bookings.find(b => b.id === bookingToCancel);
        if (!bookingToUpdate) return;
        
        // Get the slot_id for this booking
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('slot_id')
          .eq('id', bookingToCancel)
          .single();
          
        if (bookingError || !bookingData) {
          console.error('Error finding booking:', bookingError);
          return;
        }
        
        // Update booking status in database
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingToCancel);
          
        if (updateError) {
          console.error('Error cancelling booking:', updateError);
          toast({
            title: "Error",
            description: "Could not cancel booking. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        // Update slot status back to available
        const { error: slotError } = await supabase
          .from('parking_slots.csv')
          .update({ status: 'available' })
          .eq('id', bookingData.slot_id);
          
        if (slotError) {
          console.error('Error updating slot status:', slotError);
          // Booking is still cancelled even if slot update fails
        }
        
        // Update local state
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
      } catch (err) {
        console.error('Error in confirmCancelBooking:', err);
        toast({
          title: "Error",
          description: "An unexpected error occurred while cancelling the booking.",
          variant: "destructive"
        });
      } finally {
        setBookingToCancel(null);
      }
    }
  };
  
  const handleViewDetails = (id: number) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      toast({
        title: `Booking #${id} Details`,
        description: `Vehicle: ${booking.vehicleNumber}, Date: ${booking.date}, Time: ${booking.startTime}-${booking.endTime}`,
      });
    }
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
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <p>Loading your bookings...</p>
            </div>
          ) : (
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
          )}
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
