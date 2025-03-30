import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Clock, CreditCard, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Booking form schema
const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  vehicleNumber: z.string().min(1, { message: "Vehicle registration number is required." }),
  date: z.date({ required_error: "Please select a date." }),
  startTime: z.string({ required_error: "Select a start time." }),
  endTime: z.string({ required_error: "Select an end time." }),
  cardName: z.string().min(2, { message: "Name on card is required." }),
  cardNumber: z.string().min(12, { message: "Please enter a valid card number." }),
  expiry: z.string().min(5, { message: "Please enter a valid expiry date (MM/YY)." }),
  cvv: z.string().min(3, { message: "Please enter a valid CVV." }),
});

interface BookingFormProps {
  parkingId: number;
  parkingName: string;
  hourlyRate: number;
  selectedSlot?: string | null;
}

const BookingForm: React.FC<BookingFormProps> = ({ parkingId, parkingName, hourlyRate, selectedSlot }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      vehicleNumber: "",
      date: new Date(),
      startTime: "09:00",
      endTime: "17:00",
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    },
  });
  
  // Generate time options
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return [
      { value: `${hour}:00`, label: `${hour}:00` },
      { value: `${hour}:30`, label: `${hour}:30` },
    ];
  }).flat();

  const calculateHours = () => {
    const startTime = form.watch("startTime");
    const endTime = form.watch("endTime");
    
    if (!startTime || !endTime) return 0;
    
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    
    let hours = endHour - startHour;
    let minutes = endMinute - startMinute;
    
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    
    return hours + minutes / 60;
  };

  const calculateCost = () => {
    const hours = calculateHours();
    if (hours <= 0) return 0;
    return hours * hourlyRate;
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Validate slot selection
    if (!selectedSlot) {
      toast({
        title: "Please Select a Parking Slot",
        description: "You need to select a parking slot before proceeding with the booking.",
        variant: "destructive",
      });
      return;
    }
    
    // This would be where you'd send data to the backend
    console.log("Booking submitted:", {
      ...data,
      parkingSlot: selectedSlot
    });
    
    // Show success message
    toast({
      title: "Booking Confirmed!",
      description: `Your parking slot ${selectedSlot} at ${parkingName} has been booked for ${format(data.date, 'PPP')} from ${data.startTime} to ${data.endTime}.`,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-parking-primary mb-6">Complete Your Booking</h2>
      
      {selectedSlot ? (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 flex items-center gap-2">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
              Slot {selectedSlot}
            </span>
            <span>selected</span>
          </p>
        </div>
      ) : (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            Please select a parking slot from the map above before proceeding.
          </p>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-parking-gray" size={18} />
                      <Input placeholder="First name" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="vehicleNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Registration Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. ABC123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="bg-parking-light p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-4">Parking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <Clock className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Start time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={`start-${time.value}`} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <Clock className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="End time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={`end-${time.value}`} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-4 p-4 bg-white rounded-md border">
              <div className="flex justify-between items-center mb-2">
                <span>Rate:</span>
                <span className="font-medium">${hourlyRate.toFixed(2)}/hour</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Duration:</span>
                <span className="font-medium">{calculateHours().toFixed(1)} hours</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t font-semibold text-lg">
                <span>Total:</span>
                <span className="text-parking-primary">${calculateCost().toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-parking-light p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
            <FormField
              control={form.control}
              name="cardName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name on Card</FormLabel>
                  <FormControl>
                    <Input placeholder="Name as it appears on your card" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="mt-4">
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CreditCard className="absolute left-2 top-1/2 transform -translate-y-1/2 text-parking-gray" size={18} />
                        <Input 
                          placeholder="1234 5678 9012 3456" 
                          {...field} 
                          className="pl-10"
                          maxLength={19}
                          onChange={(e) => {
                            // Format card number with spaces
                            const value = e.target.value.replace(/\s+/g, '');
                            const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                            field.onChange(formattedValue);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="expiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="MM/YY" 
                        {...field}
                        maxLength={5}
                        onChange={(e) => {
                          // Format expiry date
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 2) {
                            field.onChange(value);
                          } else {
                            field.onChange(value.substring(0, 2) + '/' + value.substring(2, 4));
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123" 
                        {...field}
                        maxLength={4}
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-parking-accent hover:bg-parking-highlight text-white text-lg py-6"
            disabled={!selectedSlot}
          >
            {selectedSlot 
              ? `Confirm Booking - Slot ${selectedSlot} - $${calculateCost().toFixed(2)}`
              : 'Please select a parking slot first'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default BookingForm;
