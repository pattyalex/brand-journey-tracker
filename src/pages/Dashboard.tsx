
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BrainCircuit, 
  ListTodo, 
  Calendar, 
  Handshake, 
  TrendingUp, 
  FolderArchive,
  BarChart 
} from "lucide-react";

const sections = [
  { 
    title: "Content Ideation & Planning",
    description: "Brainstorm and plan your content",
    icon: BrainCircuit,
    path: "/content-ideation"
  },
  { 
    title: "Task Manager",
    description: "Track your content creation tasks",
    icon: ListTodo,
    path: "/task-board"
  },
  { 
    title: "Content Calendar",
    description: "Schedule and organize your content",
    icon: Calendar,
    path: "/content-calendar"
  },
  { 
    title: "Brand Deal Tracker",
    description: "Manage brand partnerships",
    icon: Handshake,
    path: "/income-tracker"
  },
  { 
    title: "Strategy & Growth",
    description: "Analyze and improve your strategy",
    icon: TrendingUp,
    path: "/strategy-growth"
  },
  { 
    title: "Analytics",
    description: "Track your performance metrics",
    icon: BarChart,
    path: "/analytics"
  },
  { 
    title: "File & Contract Storage",
    description: "Store important documents",
    icon: FolderArchive,
    path: "/bank-of-content"
  }
];

const Dashboard = () => {
  const navigate = useNavigate();

  const handleCardClick = (path: string) => {
    console.log("Navigating to:", path);
    navigate(path);
  };

  return (
    <Layout>
      <div className="space-y-8 fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">
            Pick a section below to start managing your content
          </p>
        </div>
        
        <ScrollArea className="w-full px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {sections.map((section, index) => (
              <Card 
                key={index} 
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]"
                onClick={() => handleCardClick(section.path)}
              >
                <CardHeader className="pb-2">
                  <section.icon className="w-8 h-8 mb-3 text-primary" />
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{section.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Layout>
  );
};

export default Dashboard;
