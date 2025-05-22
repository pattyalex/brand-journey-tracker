import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FolderOpen, Handshake, TrendingUp, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "../supabaseClient";
import { toast } from "sonner";
// Keep the signUp import in case it's used elsewhere
import { signUp } from "@/auth";
import Layout from "@/components/Layout";

const LandingPage = () => {
  const navigate = useNavigate();
  const { login, openLoginModal } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartFreeTrial = async () => {
    console.log("=== START: handleStartFreeTrial function started running ===");

    // Set to false to enable Supabase authentication
    const bypassAuth = false;

    if (bypassAuth) {
      console.log("Bypassing auth for development");
      login();
      navigate("/onboarding");
      return;
    }

    console.log("Checking Supabase environment variables...");
    console.log("SUPABASE URL exists:", !!import.meta.env.VITE_SUPABASE_URL);
    console.log("SUPABASE ANON KEY exists:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);

    // Generate a random email with timestamp to ensure uniqueness
    const randomEmail = `user${Math.floor(Math.random() * 10000)}-${Date.now()}@example.com`;
    // Use a strong static password
    const strongPassword = "TestPassword123!";
    const fullName = "Test User";

    console.log("=== CREDENTIALS BEING SENT TO SUPABASE ===");
    console.log(`Email: ${randomEmail}`);
    console.log(`Password: ${strongPassword}`);
    console.log(`Full Name: ${fullName}`);

    try {
      console.log("Attempting to import supabaseClient...");
      // Import supabase client directly to ensure we're using the correct instance
      const { supabase } = await import('../supabaseClient');

      if (!supabase) {
        console.error("Supabase client is undefined after import!");
        return;
      }

      console.log("Supabase client imported successfully:", !!supabase);
      console.log("Supabase auth available:", !!(supabase && supabase.auth));

      // Sign up the user directly with Supabase client
      console.log("=== SUPABASE CONFIG ===");
      console.log("Supabase URL being used:", import.meta.env.VITE_SUPABASE_URL);
      console.log("Auth endpoint:", `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/signup`);
      console.log("Using supabaseClient from supabaseClient.ts to sign up user...");

      // Log the Supabase URL and Anon Key to ensure they're defined
      console.log("=== SUPABASE CREDENTIALS CHECK ===");
      console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
      console.log("Supabase Anon Key exists:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);

      // Make the signup request
      console.log("=== SENDING SIGNUP REQUEST TO SUPABASE ===");
      let signUpResponse;
      try {
        signUpResponse = await supabase.auth.signUp({
          email: randomEmail,
          password: strongPassword
        });
        console.log("Signup response:", signUpResponse);
        console.log("Raw signup response received");
      } catch (error) {
        console.error("Signup failed:", error);
        // Fall back to login for development
        login();
        navigate("/onboarding");
        return;
      }

      // Log the full response
      console.log("=== FULL SUPABASE SIGNUP RESPONSE ===");
      try {
        console.log(JSON.stringify(signUpResponse, null, 2));
      } catch (jsonErr) {
        console.error("Could not stringify response:", jsonErr);
        console.log("Response type:", typeof signUpResponse);
        console.log("Response keys:", signUpResponse ? Object.keys(signUpResponse) : "null response");
      }

      if (!signUpResponse) {
        console.error("No response received from supabase.auth.signUp");
        login();
        navigate("/onboarding");
        return;
      }

      const { data, error } = signUpResponse;

      if (error) {
        console.error("=== SUPABASE SIGNUP ERROR ===");
        console.error("Error object:", error);
        console.error("Error message:", error.message);
        console.error("Error status:", error.status);
        console.error("Error name:", error.name);
        console.error("Error stack:", error.stack);

        // Fall back to login and navigate anyway for development
        login();
        navigate("/onboarding");
        return;
      }

      console.log("=== SUCCESS: SUPABASE SIGNUP SUCCESSFUL ===");
      console.log("Response data:", data);
      console.log(`User created with ID: ${data.user?.id}`);

      // Create user profile
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user?.id,
          full_name: fullName,
          is_on_trial: true,
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      ]);

      if (profileError) {
        console.error("Profile creation failed:", profileError);
      } else {
        console.log("Profile created successfully for user:", data.user?.id);
      }

      // Log in and navigate to onboarding
      login();
      navigate("/onboarding");
    } catch (error) {
      console.error("Unexpected error during Supabase signup:", error);
      // Fall back to login and navigate anyway for development
      login();
      navigate("/onboarding");
    }
  };

  return (
    <Layout hideSidebar={true}>
      <div className="absolute top-4 right-6 z-10">
        <Button 
          variant="outline" 
          onClick={openLoginModal}
          className="font-medium"
        >
          Log In
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16 fade-in">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Simplify Your Content <br />Creation Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            All-in-one platform for content creators to manage projects, track income, and grow their business
          </p>
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6"
              onClick={handleStartFreeTrial}
            >
              Start 7-Day Free Trial
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <feature.icon className="w-10 h-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </section>

        {/* Testimonials Section */}
        <section className="py-10">
          <h2 className="text-3xl font-bold text-center mb-10">What Our Users Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 border border-gray-100">
                <div className="flex items-start mb-4">
                  <div className="bg-gray-200 w-12 h-12 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
                <p className="italic">"{testimonial.quote}"</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-10">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Start with our 7-day free trial and discover how our platform can transform your content creation workflow
          </p>

          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">Pro Plan</h3>
                <div className="my-4">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  "Complete content management tools",
                  "Performance analytics",
                  "Income tracking",
                  "Brand deal management",
                  "Content calendar",
                  "Unlimited projects"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full py-6"
                onClick={handleStartFreeTrial}
              >
                Start 7-Day Free Trial
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Cancel anytime.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-50 p-10 rounded-xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Content Creation?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Join thousands of content creators who have simplified their workflow and boosted their productivity
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6"
            onClick={handleStartFreeTrial}
          >
            Start Your Free Trial Today
          </Button>
        </section>
      </div>
      
      {/* Footer */}
      <footer className="border-t mt-16 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} Content Creator Platform. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <span className="text-muted-foreground">|</span>
            <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <span className="text-muted-foreground">|</span>
            <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

const features = [
  {
    title: "Content Management",
    description: "Plan, organize, and track your content creation workflow in one place",
    icon: FolderOpen,
  },
  {
    title: "Revenue Growth",
    description: "Track income from brand deals, sponsorships, and other revenue streams",
    icon: Handshake,
  },
  {
    title: "Performance Analytics",
    description: "Monitor your growth and make data-driven content decisions",
    icon: TrendingUp,
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    title: "Travel Content Creator",
    quote: "This platform has completely transformed how I plan and create content. My productivity has doubled, and I'm finally staying ahead of my posting schedule!"
  },
  {
    name: "Michael Chen",
    title: "Tech YouTuber",
    quote: "The analytics tools helped me understand what my audience really wants. Since using this platform, my engagement rates have increased by 40%."
  }
];

export default LandingPage;