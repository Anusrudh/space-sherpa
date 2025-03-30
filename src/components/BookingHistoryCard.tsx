
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Car } from 'lucide-react';

export interface Booking {
  id: number;
  locationName: string;
  address: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  vehicleNumber: string;
  totalCost: number;
}

interface BookingHistoryCardProps {
  booking: Booking;
  onCancel?: (id: number) => void;
  onViewDetails?: (id: number) => void;
}

const BookingHistoryCard: React.FC<BookingHistoryCardProps> = ({ 
  booking, 
  onCancel,
  onViewDetails 
}) => {
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    upcoming: 'Upcoming',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  // Format the date from ISO string
  const formattedDate = new Date(booking.date);
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold mb-1">{booking.locationName}</h3>
            <div className="flex items-center text-parking-gray mb-4">
              <MapPin size={16} className="mr-1" />
              <span className="text-sm">{booking.address}</span>
            </div>
          </div>
          <Badge className={statusColors[booking.status]}>
            {statusLabels[booking.status]}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center">
            <Calendar size={16} className="text-parking-accent mr-2" />
            <div>
              <div className="text-sm text-parking-gray">Date</div>
              <div>{format(formattedDate, 'PPP')}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Clock size={16} className="text-parking-accent mr-2" />
            <div>
              <div className="text-sm text-parking-gray">Time</div>
              <div>{booking.startTime} - {booking.endTime}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Car size={16} className="text-parking-accent mr-2" />
            <div>
              <div className="text-sm text-parking-gray">Vehicle</div>
              <div>{booking.vehicleNumber}</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="font-medium">Total Cost: <span className="text-lg font-bold text-parking-primary">${booking.totalCost.toFixed(2)}</span></div>
          <div className="text-sm text-parking-gray">Booking #{booking.id}</div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-6 py-3">
        <div className="flex justify-between w-full">
          <Button 
            variant="outline" 
            className="text-parking-primary border-parking-primary hover:bg-parking-primary hover:text-white"
            onClick={() => onViewDetails && onViewDetails(booking.id)}
          >
            View Details
          </Button>
          
          {booking.status === 'upcoming' && onCancel && (
            <Button 
              variant="ghost" 
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => onCancel(booking.id)}
            >
              Cancel Booking
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default BookingHistoryCard;
