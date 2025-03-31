
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DatabaseMonitor from '@/components/DatabaseMonitor';
import { Loader2 } from 'lucide-react';

const DbMonitor = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="bg-parking-primary text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Database Monitoring</h1>
          <p className="text-lg">View and analyze MySQL database requests</p>
        </div>
      </div>
      
      <div className="bg-gray-50 flex-grow py-8">
        <div className="container mx-auto px-4">
          <React.Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <p>Loading database monitor...</p>
            </div>
          }>
            <DatabaseMonitor />
          </React.Suspense>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DbMonitor;
