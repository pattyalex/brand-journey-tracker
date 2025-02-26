
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { FolderOpen, HandshakeIcon, FileText } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 fade-in">
        <section className="text-center py-16">
          <h1 className="text-5xl font-bold mb-4 font-playfair">Welcome to HeyMegan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your all-in-one platform for managing content creation projects and brand partnerships
          </p>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover-scale glass-morphism">
              <feature.icon className="w-8 h-8 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </section>

        <section className="text-center py-8">
          <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
            Get Started
          </Button>
        </section>
      </div>
    </Layout>
  );
};

const features = [
  {
    title: "Content Management",
    description: "Organize and track your content projects in one place",
    icon: FolderOpen,
  },
  {
    title: "Income Tracker",
    description: "Manage your brand collaborations and sponsorships",
    icon: HandshakeIcon,
  },
  {
    title: "Document Storage",
    description: "Securely store and access important documents",
    icon: FileText,
  },
];

export default Index;
