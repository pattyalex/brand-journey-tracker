
import React from 'react';
import { Button } from '@/components/ui/button';

interface FallbackPageProps {
  error?: Error | null;
  resetErrorBoundary?: () => void;
}

const FallbackPage: React.FC<FallbackPageProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  const handleReset = () => {
    // Clear any stored state that might be causing issues
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error("Failed to clear storage:", e);
    }
    
    // Either call the provided reset function or reload the page
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">Application Error</h2>
        
        {error && (
          <div className="bg-gray-100 p-3 rounded text-sm text-left mb-4 overflow-auto max-h-40">
            <p><strong>Error:</strong> {error.message || "Unknown error occurred"}</p>
            {error.stack && (
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600 text-xs">View details</summary>
                <pre className="text-xs mt-2 overflow-x-auto whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}
        
        <p className="mb-4">Something went wrong while loading the application. This may be due to corrupted application data or network issues.</p>
        
        <div className="space-y-2">
          <Button 
            onClick={handleReset}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Clear Data & Reload
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/landing'}
            className="w-full bg-gray-600 hover:bg-gray-700"
          >
            Go to Landing Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FallbackPage;
