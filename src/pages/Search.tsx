
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchForm from '@/components/SearchForm';
import ParkingCard, { ParkingLocation } from '@/components/ParkingCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

// Mock data for parking locations
const allParkingLocations: ParkingLocation[] = [
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

const Search = () => {
  const [searchParams] = useSearchParams();
  const [maxPrice, setMaxPrice] = useState<number>(10);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<ParkingLocation[]>(allParkingLocations);
  
  // Get all unique features from the parking locations
  const allFeatures = Array.from(
    new Set(
      allParkingLocations.flatMap(location => location.features)
    )
  );
  
  useEffect(() => {
    // Apply filters
    const filtered = allParkingLocations.filter(location => {
      // Price filter
      if (location.hourlyRate > maxPrice) {
        return false;
      }
      
      // Features filter
      if (selectedFeatures.length > 0) {
        return selectedFeatures.every(feature => 
          location.features.includes(feature)
        );
      }
      
      return true;
    });
    
    setFilteredLocations(filtered);
  }, [maxPrice, selectedFeatures]);
  
  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };
  
  // Get search parameters from URL
  const location = searchParams.get('location') || '';
  const date = searchParams.get('date') || '';
  const startTime = searchParams.get('startTime') || '';
  const endTime = searchParams.get('endTime') || '';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="bg-parking-primary text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Find Available Parking</h1>
          {location && (
            <p className="text-lg">
              Showing results for {location} {date && `on ${date}`} 
              {startTime && endTime && ` from ${startTime} to ${endTime}`}
            </p>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-8">
                <h2 className="text-xl font-bold mb-6">Filter Results</h2>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Search Again</h3>
                  <SearchForm />
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Price Range (hourly)</h3>
                  <div className="space-y-4">
                    <Slider
                      defaultValue={[10]}
                      max={10}
                      step={0.5}
                      value={[maxPrice]}
                      onValueChange={(value) => setMaxPrice(value[0])}
                    />
                    <div className="flex justify-between">
                      <span>$0</span>
                      <span className="font-medium">Up to ${maxPrice.toFixed(2)}/hr</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Features</h3>
                  <div className="space-y-2">
                    {allFeatures.map((feature) => (
                      <label
                        key={feature}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-parking-accent focus:ring-parking-accent"
                          checked={selectedFeatures.includes(feature)}
                          onChange={() => toggleFeature(feature)}
                        />
                        <span>{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Results */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="list" className="w-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{filteredLocations.length} Parking Locations</h2>
                  <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="map">Map View</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="list">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((location) => (
                        <ParkingCard key={location.id} location={location} />
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12">
                        <h3 className="text-xl font-semibold mb-2">No parking spots match your criteria</h3>
                        <p className="text-gray-600">Try adjusting your filters or search for a different location.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="map">
                  <div className="bg-gray-200 rounded-lg h-[600px] flex items-center justify-center">
                    <p className="text-gray-600">Map view would be integrated here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Search;
