
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingForm from '@/components/BookingForm';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Car, ParkingMeter } from 'lucide-react';
import ParkingSlotSelector, { ParkingSlot } from '@/components/ParkingSlotSelector';
import { toast } from '@/components/ui/use-toast';

// Single parking location - Downtown Parking Garage
const parkingLocation = {
  id: 1,
  name: "Downtown Parking Garage",
  address: "123 Main St, Downtown",
  hourlyRate: 3.50,
  dailyRate: 20.00,
  availableSpots: 45,
  features: ["Covered", "Security"]
};

// Generate parking slots
const generateParkingSlots = (): ParkingSlot[] => {
  // Create 50 slots (A1-E10)
  const slots: ParkingSlot[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E'];
  
  rows.forEach(row => {
    for (let i = 1; i <= 10; i++) {
      // Make some slots randomly occupied (about 20%)
      const isOccupied = Math.random() < 0.2;
      
      slots.push({
        id: `${row}${i}`,
        number: `${row}${i}`,
        status: isOccupied ? 'occupied' : 'available'
      });
    }
  });
  
  return slots;
};

const Book = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [parkingSlots] = useState<ParkingSlot[]>(generateParkingSlots);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  // Handle slot selection
  const handleSelectSlot = (slotId: string) => {
    setSelectedSlot(slotId);
    
    // Show toast notification
    toast({
      title: "Parking Slot Selected",
      description: `You've selected parking slot ${slotId}. Continue with the booking form to confirm.`,
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="bg-parking-primary text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">{parkingLocation.name}</h1>
          <p className="text-lg flex items-center">
            <MapPin size={16} className="mr-1" />
            {parkingLocation.address}
          </p>
        </div>
      </div>
      
      <div className="bg-gray-50 flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Parking Details */}
            <div className="lg:col-span-1">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Parking Details</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin size={20} className="text-parking-accent mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold">Location</h3>
                        <p className="text-parking-gray">{parkingLocation.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <ParkingMeter size={20} className="text-parking-accent mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold">Pricing</h3>
                        <p className="text-parking-gray">${parkingLocation.hourlyRate.toFixed(2)}/hour</p>
                        {parkingLocation.dailyRate && (
                          <p className="text-parking-gray">${parkingLocation.dailyRate.toFixed(2)}/day max</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock size={20} className="text-parking-accent mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold">Hours</h3>
                        <p className="text-parking-gray">Open 24/7</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Car size={20} className="text-parking-accent mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold">Features</h3>
                        <ul className="text-parking-gray">
                          {parkingLocation.features.map((feature, index) => (
                            <li key={index}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Important Information</h2>
                  <ul className="space-y-3 text-parking-gray">
                    <li>• Arrive within your selected timeframe to ensure your spot is available.</li>
                    <li>• Bring your confirmation email or booking ID to the parking facility.</li>
                    <li>• Cancellations made at least 24 hours in advance will receive a full refund.</li>
                    <li>• For assistance, contact customer service at support@spaceparking.com.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            {/* Booking Form with Slot Selection */}
            <div className="lg:col-span-2">
              <Card className="mb-8">
                <CardContent className="p-6">
                  <ParkingSlotSelector 
                    slots={parkingSlots} 
                    selectedSlot={selectedSlot}
                    onSelectSlot={handleSelectSlot}
                  />
                </CardContent>
              </Card>
              
              <BookingForm 
                parkingId={parkingLocation.id} 
                parkingName={parkingLocation.name}
                hourlyRate={parkingLocation.hourlyRate}
                selectedSlot={selectedSlot}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Book;
