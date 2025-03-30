
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-parking-primary text-white py-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">SpaceParking</h3>
            <p className="text-sm text-gray-300">
              The easiest way to find and book parking spaces online.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-parking-accent transition-colors">Home</Link></li>
              <li><Link to="/search" className="text-sm hover:text-parking-accent transition-colors">Find Parking</Link></li>
              <li><Link to="/about" className="text-sm hover:text-parking-accent transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-parking-accent transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-sm hover:text-parking-accent transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-sm hover:text-parking-accent transition-colors">Register</Link></li>
              <li><Link to="/bookings" className="text-sm hover:text-parking-accent transition-colors">My Bookings</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <address className="not-italic text-sm text-gray-300 space-y-2">
              <p>123 Parking Avenue</p>
              <p>City, ST 12345</p>
              <p>Email: info@spaceparking.com</p>
              <p>Phone: (123) 456-7890</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-300">© 2023 SpaceParking. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link to="/terms" className="text-sm text-gray-300 hover:text-parking-accent transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="text-sm text-gray-300 hover:text-parking-accent transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
