
import React from 'react';
import { Button } from '@/components/ui/button';

const FallbackPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">Application Error</h2>
        <p className="mb-4 text-gray-700">
          The application encountered an unexpected error.
        </p>
        <div className="space-y-2">
          <Button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Reload Application
          </Button>
          <Button 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/landing';
            }}
            className="w-full bg-gray-600 hover:bg-gray-700"
          >
            Reset & Go to Landing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FallbackPage;
