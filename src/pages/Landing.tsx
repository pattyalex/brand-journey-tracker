import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const startFreeTrial = () => {
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="font-bold text-2xl text-primary">Hey Megan</div>
        <div className="space-x-4">
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Log in
          </Button>
          <Button onClick={startFreeTrial}>Start free trial</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Organize your content. <br />
          <span className="text-primary">Simplify your creator life.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          The all-in-one platform for content creators to plan, organize, 
          and optimize their social media presence.
        </p>
        <Button 
          size="lg" 
          onClick={startFreeTrial}
          className="px-8 py-6 text-lg rounded-full"
        >
          Try free for 7 days
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <p className="mt-4 text-sm text-gray-500">
          No credit card required for trial • $17/month after
        </p>
      </section>
    </div>
  );
};

export default Landing;