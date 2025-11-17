import React, { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "./Sidebar";
import ToggleSidebarButton from "./sidebar/ToggleSidebarButton";
import { Toaster } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { MembershipPage } from "@/components/MembershipPage";
import { CreditCard } from "lucide-react";

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
  useEffect(() => {
    if (isSignedIn && location.pathname === "/") {
      console.log("User is signed in on landing page");
      // If they haven't completed onboarding, send them to onboarding
      if (!hasCompletedOnboarding) {
        console.log("Redirecting to onboarding");
        navigate("/onboarding");
      } else {
        console.log("Redirecting to dashboard");
        navigate("/home-page");
      }
    }
  }, [isSignedIn, location.pathname, navigate, hasCompletedOnboarding]);

  return (
    <SidebarProvider key={sidebarKey}>
      <div className="min-h-screen flex flex-col w-full bg-background">
        {/* Header with branding and auth */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-6">
            {/* Logo/Branding */}
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary">Hey Megan</h1>
            </div>

            {/* Auth buttons */}
            <div className="flex items-center gap-2">
              {isSignedIn ? (
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8"
                    }
                  }}
                >
                  <UserButton.UserProfilePage
                    label="Membership"
                    labelIcon={<CreditCard size={16} />}
                    url="membership"
                  >
                    <MembershipPage />
                  </UserButton.UserProfilePage>
                </UserButton>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main content area */}
        <div className="flex flex-1 w-full">
          {shouldShowSidebar && (
            <div className="[&_aside]:top-14">
              <Sidebar />
            </div>
          )}
          <main className={`flex-1 p-6 overflow-auto relative ${!shouldShowSidebar ? 'w-full' : ''}`}>
            {shouldShowSidebar && <ToggleSidebarButton />}
            {children}
            <Toaster/>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;