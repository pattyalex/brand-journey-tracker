
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { FolderOpen, HandshakeIcon, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16 fade-in">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 font-playfair leading-tight">
            Simplify Your Content <br />Creation Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            All-in-one platform for content creators to manage projects, track income, and grow their business
          </p>
          <Button 
            size="lg" 
            className="bg-primary text-white hover:bg-primary/90 text-lg px-8 py-6"
            onClick={() => navigate("/get-started")}
          >
            Get Started
          </Button>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 bg-gray-50/50">
              <feature.icon className="w-10 h-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </section>
      </div>
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
    icon: HandshakeIcon,
  },
  {
    title: "Performance Analytics",
    description: "Monitor your growth and make data-driven content decisions",
    icon: TrendingUp,
  },
];

export default Index;
