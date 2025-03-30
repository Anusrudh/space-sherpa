
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-parking-primary text-white px-3 py-1 rounded-md font-bold">P</span>
          <span className="text-xl font-semibold text-parking-primary">SpaceSherpa</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/book" className="text-gray-600 hover:text-parking-accent">Book Parking</Link>
          <Link to="/bookings" className="text-gray-600 hover:text-parking-accent">My Bookings</Link>
          <Link to="/db-monitor" className="text-gray-600 hover:text-parking-accent flex items-center">
            <Database className="w-4 h-4 mr-1" /> Database Monitor
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-parking-primary hover:bg-parking-highlight">Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
