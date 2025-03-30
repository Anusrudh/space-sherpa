
import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

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

const ParkingSlotSelector: React.FC<ParkingSlotSelectorProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
}) => {
  // Group slots into rows of 5 for better display
  const slotRows = slots.reduce<ParkingSlot[][]>((acc, slot, index) => {
    const rowIndex = Math.floor(index / 5);
    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }
    acc[rowIndex].push(slot);
    return acc;
  }, []);

  return (
    <div className="parking-slot-selector">
      <div className="mb-8">
        <div className="bg-parking-primary text-white py-3 text-center rounded-t-lg font-semibold">
          Downtown Parking Garage - Select Your Slot
        </div>

        <div className="my-6 flex justify-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
              <span className="text-xs">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded-sm"></div>
              <span className="text-xs">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-parking-accent rounded-sm"></div>
              <span className="text-xs">Selected</span>
            </div>
          </div>
        </div>

        <RadioGroup value={selectedSlot || ""} onValueChange={onSelectSlot}>
          <div className="grid gap-6">
            {slotRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-3">
                {row.map((slot) => (
                  <div key={slot.id} className="parking-slot">
                    <div
                      className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-md transition-colors",
                        slot.status === 'available' ? "bg-gray-200 hover:bg-gray-300 cursor-pointer" :
                        slot.status === 'occupied' ? "bg-gray-500 cursor-not-allowed" :
                        slot.status === 'selected' ? "bg-parking-accent text-white" : ""
                      )}
                    >
                      {slot.status !== 'occupied' ? (
                        <Label
                          htmlFor={`slot-${slot.id}`}
                          className={cn(
                            "cursor-pointer flex items-center justify-center w-full h-full",
                            slot.status === 'selected' && "text-white"
                          )}
                        >
                          <RadioGroupItem
                            id={`slot-${slot.id}`}
                            value={slot.id}
                            className="sr-only"
                            disabled={slot.status === 'occupied'}
                          />
                          <span>{slot.number}</span>
                          {slot.id === selectedSlot && (
                            <Check size={14} className="ml-1" />
                          )}
                        </Label>
                      ) : (
                        <span className="text-white">{slot.number}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </RadioGroup>

        <div className="mt-8 py-2 bg-gray-100 text-center text-gray-500 text-sm rounded-b-lg">
          Entrance
        </div>
      </div>
    </div>
  );
};

export default ParkingSlotSelector;
