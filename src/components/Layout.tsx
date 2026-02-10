import React, { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import ToggleSidebarButton from "./sidebar/ToggleSidebarButton";
import { Toaster } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

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
  const { isSignedIn } = useUser();

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
    <SidebarProvider key={sidebarKey}>
      <div className="h-screen flex w-full bg-white overflow-hidden">
        {/* Main content area */}
        {shouldShowSidebar && (
          <div className="flex-shrink-0 h-full">
            <Sidebar />
          </div>
        )}
        <main className={`flex-1 overflow-x-clip overflow-y-auto relative h-full bg-white scroll-smooth ${!shouldShowSidebar ? 'w-full' : ''}`}>
          {shouldShowSidebar && <ToggleSidebarButton />}
          {children}
          <Toaster/>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;