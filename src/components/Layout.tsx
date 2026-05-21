import React, { useEffect, useState } from "react";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";
import { Toaster } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

const SidebarHoverWrapper = ({ children }: { children: React.ReactNode }) => {
  const { setOpen } = useSidebar();
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  return (
    <div
      className="flex-shrink-0 h-full hidden md:block"
      style={{ position: 'relative', zIndex: 10002 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

const Layout = ({ children, hideSidebar = false }: LayoutProps) => {
  // Store sidebar state in localStorage
  const [sidebarKey, setSidebarKey] = useState(0);
  const { isAuthenticated, hasCompletedOnboarding } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if sidebar should be shown
  const shouldShowSidebar = !hideSidebar &&
    (isAuthenticated && hasCompletedOnboarding ||
    // Always hide sidebar on landing page
    location.pathname !== "/");

  useEffect(() => {
    // Force a re-render after component mounts to ensure
    // localStorage state is applied properly
    setSidebarKey(prev => prev + 1);
  }, []);

  // Redirect signed-in users from landing page to onboarding or dashboard
  // TEMPORARILY DISABLED FOR DEVELOPMENT
  // useEffect(() => {
  //   if (isSignedIn && location.pathname === "/") {
  //     console.log("User is signed in on landing page");
  //     // If they haven't completed onboarding, send them to onboarding
  //     if (!hasCompletedOnboarding) {
  //       console.log("Redirecting to onboarding");
  //       navigate("/onboarding");
  //     } else {
  //       console.log("Redirecting to dashboard");
  //       navigate("/home-page");
  //     }
  //   }
  // }, [isSignedIn, location.pathname, navigate, hasCompletedOnboarding]);

  return (
    <SidebarProvider key={sidebarKey} defaultOpen={false}>
      <div className="h-screen flex w-full bg-white overflow-hidden">
        {/* Sidebar - hidden on mobile, expand on hover */}
        {shouldShowSidebar && (
          <SidebarHoverWrapper>
            <Sidebar />
          </SidebarHoverWrapper>
        )}
        <main className={`flex-1 min-w-0 overflow-x-clip overflow-y-auto relative h-full bg-white scroll-smooth ${!shouldShowSidebar ? 'w-full' : ''} pb-20 md:pb-0`}>
          {children}
          <Toaster/>
        </main>
        {/* Mobile bottom navigation */}
        {shouldShowSidebar && <MobileBottomNav />}
      </div>
    </SidebarProvider>
  );
};

export default Layout;