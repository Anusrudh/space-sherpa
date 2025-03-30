
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserCircle, Menu } from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header: React.FC = () => {
  return (
    <header className="bg-parking-primary text-white py-4 shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="font-bold text-2xl">SpaceParking</div>
        </Link>
        
        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="px-4 py-2 hover:bg-parking-accent rounded-md">Home</Link>
                <Link to="/search" className="px-4 py-2 hover:bg-parking-accent rounded-md">Find Parking</Link>
                <Link to="/bookings" className="px-4 py-2 hover:bg-parking-accent rounded-md">My Bookings</Link>
                <Link to="/login" className="px-4 py-2 hover:bg-parking-accent rounded-md">Login</Link>
                <Link to="/register" className="px-4 py-2 hover:bg-parking-accent rounded-md">Register</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-parking-accent transition-colors">Home</Link>
          <Link to="/search" className="hover:text-parking-accent transition-colors">Find Parking</Link>
          <Link to="/bookings" className="hover:text-parking-accent transition-colors">My Bookings</Link>
          <div className="flex space-x-2">
            <Link to="/login">
              <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-parking-primary">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-parking-accent hover:bg-parking-highlight text-white">
                Register
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
