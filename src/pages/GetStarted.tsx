import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PenLine, Workflow, Calendar, TrendingUp, Handshake, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = [
  {
    title: (
      <div className="flex flex-col">
        <span>Content</span>
        <span>Workflow</span>
      </div>
    ),
    icon: Workflow,
  },
  {
    title: "Content Ideation And Planning",
    icon: PenLine,
  },
  {
    title: "Content Calendar",
    icon: Calendar,
  },
  {
    title: "Strategy And Growth",
    icon: TrendingUp,
  },
  {
    title: "Income Tracker",
    icon: Handshake,
  },
  {
    title: "Analytics",
    icon: BarChart3,
  }
];

const GetStarted = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-8 fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Choose your starting point</h1>
          <p className="text-muted-foreground">Select a feature to begin organizing your content creation journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index}
              onClick={() => navigate("/auth")}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 bg-gray-100"
            >
              <CardHeader className="space-y-4">
                <service.icon className="w-8 h-8 text-primary" />
                <CardTitle className="text-2xl">{service.title}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default GetStarted;
