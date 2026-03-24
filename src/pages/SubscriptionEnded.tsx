import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const SubscriptionEnded = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  const handleResubscribe = () => {
    navigate("/membership");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-5xl">💜</div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Your HeyMeg subscription has ended. Your data will be kept for 90 days
          — resubscribe anytime during this period to pick up right where you
          left off.
        </p>
        <div className="space-y-3 pt-2">
          <button
            onClick={handleResubscribe}
            className="w-full py-3 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Resubscribe
          </button>
          <button
            onClick={logout}
            className="w-full py-3 px-6 rounded-lg border border-border text-muted-foreground font-medium hover:bg-muted transition-colors"
          >
            Log out
          </button>
        </div>
        <p className="text-xs text-muted-foreground pt-4">
          Need help? Contact us at{" "}
          <a
            href="mailto:contact@heymeg.ai"
            className="underline hover:text-foreground"
          >
            contact@heymeg.ai
          </a>
        </p>
      </div>
    </div>
  );
};

export default SubscriptionEnded;
