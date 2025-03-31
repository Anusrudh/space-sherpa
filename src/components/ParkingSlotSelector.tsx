
import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export interface ParkingSlot {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'selected';
}

interface ParkingSlotSelectorProps {
  slots: ParkingSlot[];
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
}

const ParkingSlotSelector: React.FC<ParkingSlotSelectorProps> = ({ slots, selectedSlot, onSelectSlot }) => {
  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.status === 'occupied') {
      toast({
        title: "Unavailable",
        description: `Parking slot ${slot.number} is already occupied.`,
        variant: "destructive",
      });
      return;
    }
    
    onSelectSlot(slot.id);
    
    toast({
      title: "Selected",
      description: `You've selected parking slot ${slot.number}.`,
    });
  };

  // Group slots by row (e.g., A1, A2 belong to row A)
  const slotsByRow = slots.reduce((acc, slot) => {
    const row = slot.number.charAt(0);
    if (!acc[row]) acc[row] = [];
    acc[row].push(slot);
    return acc;
  }, {} as Record<string, ParkingSlot[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Select a Parking Slot</h2>
      </div>
      
      <div className="space-y-8">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-green-100 border border-green-500 rounded-md mr-2"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-100 border border-red-500 rounded-md mr-2"></div>
            <span className="text-sm">Occupied</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-100 border border-blue-500 rounded-md mr-2"></div>
            <span className="text-sm">Selected</span>
          </div>
        </div>
        
        {/* Parking lot visualization */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <div className="flex justify-center mb-8">
            <div className="bg-gray-300 text-center py-2 px-12 rounded-lg">
              <span className="font-bold">ENTRANCE</span>
            </div>
          </div>
          
          {/* Parking slots by row */}
          <div className="space-y-4">
            {Object.keys(slotsByRow).map(row => (
              <div key={row} className="flex justify-center space-x-2">
                <div className="w-6 flex items-center justify-center font-bold text-gray-500">
                  {row}
                </div>
                <div className="flex space-x-2">
                  {slotsByRow[row].map(slot => (
                    <Button
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      disabled={slot.status === 'occupied'}
                      className={cn(
                        "w-12 h-12 p-0 font-bold",
                        slot.status === 'available' ? "bg-green-100 text-green-800 hover:bg-green-200 border border-green-500" : 
                        slot.status === 'occupied' ? "bg-red-100 text-red-800 cursor-not-allowed border border-red-500" :
                        "bg-blue-100 text-blue-800 border border-blue-500",
                        selectedSlot === slot.id && "bg-blue-100 text-blue-800 border-2 border-blue-500"
                      )}
                    >
                      {slot.number}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {selectedSlot && (
          <div className="text-center">
            <p className="text-lg">
              You've selected spot{" "}
              <span className="font-bold text-parking-primary">
                {slots.find(slot => slot.id === selectedSlot)?.number}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingSlotSelector;
