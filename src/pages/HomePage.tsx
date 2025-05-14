import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, BarChart, FileText, Edit3 } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Welcome to Your Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {quickLinks.map((link, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => navigate(link.path)}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <link.icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">{link.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{link.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Your recent activity will appear here once you start using the platform.</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/content-ideation')}
              >
                Create Your First Idea
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">• Start by organizing your content pillars</p>
              <p className="text-sm">• Set up weekly planning sessions</p>
              <p className="text-sm">• Connect your social media accounts for analytics</p>
              <p className="text-sm">• Track your brand collaborations</p>
              <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/help')}>
                View All Tips
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

const quickLinks = [
  {
    title: "Content Calendar",
    description: "View and manage your upcoming content schedule",
    icon: Calendar,
    path: "/content-calendar"
  },
  {
    title: "Collaborations",
    description: "Manage brand partnerships and collaborations",
    icon: Users,
    path: "/collab-management"
  },
  {
    title: "Analytics",
    description: "Track performance across your platforms",
    icon: BarChart,
    path: "/analytics"
  },
  {
    title: "Content Ideas",
    description: "Create and organize your content ideas",
    icon: Edit3,
    path: "/content-ideation"
  },
  {
    title: "Content Bank",
    description: "Access your library of created content",
    icon: FileText,
    path: "/bank-of-content"
  }
];

export default HomePage;