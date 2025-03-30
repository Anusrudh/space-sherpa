
import React from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchForm from '@/components/SearchForm';
import ParkingCard, { ParkingLocation } from '@/components/ParkingCard';
import { Link } from 'react-router-dom';

// Mock data for popular parking locations
const popularLocations: ParkingLocation[] = [
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
  }
];

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-parking-primary text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-30"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find and Book Parking in Seconds</h1>
            <p className="text-lg mb-8">Save time and money with SpaceParking - your one-stop solution for hassle-free parking reservations.</p>
            <Button 
              asChild
              size="lg"
              className="bg-parking-accent hover:bg-parking-highlight text-white px-8 py-6 text-lg"
            >
              <Link to="/search">Find Parking Now</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Search Form Section */}
      <section className="container mx-auto px-4 -mt-16 relative z-20">
        <SearchForm className="rounded-xl shadow-xl" />
      </section>
      
      {/* Popular Locations Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-parking-primary">Popular Parking Locations</h2>
            <Link to="/search" className="text-parking-accent hover:text-parking-highlight font-medium">
              View all locations
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularLocations.map((location) => (
              <ParkingCard key={location.id} location={location} />
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-parking-primary mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-parking-accent text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-3">Search</h3>
              <p className="text-parking-gray">Enter your destination, choose your parking date and time.</p>
            </div>
            
            <div className="p-6">
              <div className="w-16 h-16 bg-parking-accent text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-3">Book</h3>
              <p className="text-parking-gray">Select your preferred parking location and make a reservation.</p>
            </div>
            
            <div className="p-6">
              <div className="w-16 h-16 bg-parking-accent text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-3">Park</h3>
              <p className="text-parking-gray">Arrive at the location and park with ease using your booking confirmation.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-parking-primary mb-12">Why Choose SpaceParking</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Guaranteed Spots</h3>
              <p className="text-parking-gray">Your parking spot is reserved and waiting for you.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Save Time</h3>
              <p className="text-parking-gray">No more driving in circles looking for parking.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Save Money</h3>
              <p className="text-parking-gray">Often cheaper than drive-up rates at parking facilities.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Easy Booking</h3>
              <p className="text-parking-gray">Simple, fast and secure booking process.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-parking-primary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to start parking smarter?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of drivers who save time and money by reserving their parking with SpaceParking.</p>
          <Button 
            asChild
            size="lg"
            className="bg-parking-accent hover:bg-parking-highlight text-white px-8 py-6 text-lg"
          >
            <Link to="/register">Create Free Account</Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
