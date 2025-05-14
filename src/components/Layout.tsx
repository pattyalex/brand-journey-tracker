import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { MobileMenuToggle } from "@/components/ui/sidebar";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const authStatus = localStorage.getItem('isLoggedIn') === 'true' || 
                      localStorage.getItem('onboardingComplete') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  useEffect(() => {
    // Close sidebar on mobile when navigating
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/landing');
  };

  // If not authenticated, show a simplified layout
  if (!isAuthenticated) {
    return (
      <div className="h-screen overflow-y-auto bg-background">
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={`overflow-y-auto transition-transform duration-300 ease-in-out ${
          isSidebarOpen
            ? "w-64 translate-x-0"
            : "w-0 -translate-x-full md:w-20 md:translate-x-0"
        }`}
      >
        <Sidebar collapsed={!isSidebarOpen && !isMobile} />
      </div>

      {/* Main Content */}
      <div className="relative flex-1 overflow-y-auto">
        {/* Mobile menu toggle and user menu */}
        <div className="sticky top-0 z-10 flex h-12 items-center justify-between bg-background px-4 shadow-sm">
          {isMobile && (
            <MobileMenuToggle
              isOpen={isSidebarOpen}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          )}

          <div className="ml-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-muted-foreground"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="relative">{children}</main>
      </div>
    </div>
  );
};

export default Layout;