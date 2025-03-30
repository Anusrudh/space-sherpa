
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Car, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ParkingLocation {
  id: number;
  name: string;
  address: string;
  hourlyRate: number;
  dailyRate?: number;
  availableSpots: number;
  features: string[];
}

interface ParkingCardProps {
  location: ParkingLocation;
}

const ParkingCard: React.FC<ParkingCardProps> = ({ location }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    // Always navigate to Downtown Parking Garage
    navigate(`/book/1`);
  };

  return (
    <Card className="overflow-hidden card-hover">
      <div className="h-48 bg-gray-200 relative">
        <div className="absolute bottom-0 left-0 bg-parking-accent text-white px-3 py-1 m-2 rounded-md text-sm">
          {location.availableSpots} spots available
        </div>
      </div>
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-2">{location.name}</h3>
        <div className="flex items-center text-parking-gray mb-2">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">{location.address}</span>
        </div>
        <div className="flex items-center mt-2 space-x-4">
          <div className="flex items-center">
            <Car size={16} className="text-parking-accent mr-1" />
            <span className="text-sm font-medium">{location.features.join(', ')}</span>
          </div>
          <div className="flex items-center">
            <Clock size={16} className="text-parking-accent mr-1" />
            <span className="text-sm font-medium">24/7 Access</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div>
          <span className="text-lg font-bold text-parking-primary">${location.hourlyRate}/hr</span>
          {location.dailyRate && (
            <span className="text-sm text-parking-gray ml-2">${location.dailyRate}/day</span>
          )}
        </div>
        <Button className="bg-parking-accent hover:bg-parking-highlight text-white" onClick={handleBookNow}>
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ParkingCard;
