
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold mb-2 text-purple-800">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          The page "{location.pathname}" doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            variant="default" 
            className="gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
          
          <Link to="/" className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="gap-2 px-5 py-2 border-purple-300 text-purple-700 hover:bg-purple-50 w-full"
            >
              <Home size={18} />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
