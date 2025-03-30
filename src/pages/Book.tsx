
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingForm from '@/components/BookingForm';
import { ParkingLocation } from '@/components/ParkingCard';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Car, ParkingMeter } from 'lucide-react';

// Mock data for parking locations
const parkingLocations: ParkingLocation[] = [
  {
    id: 1,
    name: "Downtown Parking Garage",
    address: "123 Main St, Downtown",
    hourlyRate: 3.50,
    dailyRate: 20.00,
    availableSpots: 45,
    features: ["Covered", "Security"]
  },
  {
    id: 2,
    name: "Central Plaza Parking",
    address: "456 Center Ave, Midtown",
    hourlyRate: 4.00,
    availableSpots: 20,
    features: ["EV Charging", "24/7"]
  },
  {
    id: 3,
    name: "Riverside Parking Lot",
    address: "789 River Rd, Riverside",
    hourlyRate: 2.50,
    dailyRate: 15.00,
    availableSpots: 78,
    features: ["Outdoor", "Surveillance"]
  },
  {
    id: 4,
    name: "Station Square Garage",
    address: "101 Station Square, Downtown",
    hourlyRate: 5.00,
    dailyRate: 25.00,
    availableSpots: 32,
    features: ["Covered", "Security", "EV Charging"]
  },
  {
    id: 5,
    name: "Westside Parking",
    address: "202 West Blvd, Westside",
    hourlyRate: 3.00,
    availableSpots: 15,
    features: ["Outdoor"]
  },
  {
    id: 6,
    name: "City Center Parking",
    address: "303 Central St, Downtown",
    hourlyRate: 4.50,
    dailyRate: 22.00,
    availableSpots: 60,
    features: ["Covered", "24/7", "Valet"]
  },
];

const Book = () => {
  const { id } = useParams<{ id: string }>();
  const parkingId = parseInt(id || "1");
  
  // Find the selected parking location
  const selectedLocation = parkingLocations.find(location => location.id === parkingId) || parkingLocations[0];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="bg-parking-primary text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">{selectedLocation.name}</h1>
          <p className="text-lg flex items-center">
            <MapPin size={16} className="mr-1" />
            {selectedLocation.address}
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
                        <p className="text-parking-gray">{selectedLocation.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <ParkingMeter size={20} className="text-parking-accent mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold">Pricing</h3>
                        <p className="text-parking-gray">${selectedLocation.hourlyRate.toFixed(2)}/hour</p>
                        {selectedLocation.dailyRate && (
                          <p className="text-parking-gray">${selectedLocation.dailyRate.toFixed(2)}/day max</p>
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
                          {selectedLocation.features.map((feature, index) => (
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
            
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <BookingForm 
                parkingId={selectedLocation.id} 
                parkingName={selectedLocation.name}
                hourlyRate={selectedLocation.hourlyRate}
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
