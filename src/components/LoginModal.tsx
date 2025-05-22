
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const LoginModal = () => {
  const { loginOpen, closeLoginModal, login } = useAuth();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demopassword");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Mock login with:", email);

    // Simulate API call delay
    setTimeout(() => {
      login(); // Set auth context state
      toast.success("Successfully logged in");
      setIsLoading(false);
    }, 800);
  };

  return (
    <Dialog open={loginOpen} onOpenChange={closeLoginModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mock Login</DialogTitle>
          <DialogDescription>
            This is a demo login. Click the login button to access the app.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleMockLogin} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="demo@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {loginError && (
            <p className="text-sm text-red-500">{loginError}</p>
          )}
          <div className="flex justify-between items-center mt-2">
            <Button 
              type="button" 
              variant="link" 
              className="text-sm p-0 h-auto text-muted-foreground hover:text-primary"
              onClick={() => {
                toast.info("This is a demo feature. Password reset would be sent to " + email);
              }}
            >
              Forgot Password?
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log In (Mock)"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
