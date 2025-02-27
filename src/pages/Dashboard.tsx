
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
  BarChart3, 
  FolderArchive 
} from "lucide-react";

const sections = [
  { 
    title: "Content Ideation & Planning",
    description: "Brainstorm and plan your content",
    icon: BrainCircuit,
    gradient: "from-[#D2B48C]/20 to-[#8B6B4E]/20",
    path: "/content-ideation"
  },
  { 
    title: "Task Manager",
    description: "Track your content creation tasks",
    icon: ListTodo,
    gradient: "from-[#E6CCB2]/20 to-[#B38B6D]/20",
    path: "/task-manager"
  },
  { 
    title: "Content Calendar",
    description: "Schedule and organize your content",
    icon: Calendar,
    gradient: "from-[#DEB887]/20 to-[#A67B5B]/20",
    path: "/content-calendar"
  },
  { 
    title: "Brand Deal Tracker",
    description: "Manage brand partnerships",
    icon: Handshake,
    gradient: "from-[#C4A484]/20 to-[#8B735F]/20",
    path: "/brand-deals"
  },
  { 
    title: "Strategy & Growth",
    description: "Analyze and improve your strategy",
    icon: TrendingUp,
    gradient: "from-[#BC8F8F]/20 to-[#8B6969]/20",
    path: "/strategy"
  },
  { 
    title: "Analytics",
    description: "Track your performance metrics",
    icon: BarChart3,
    gradient: "from-[#D2B48C]/20 to-[#96744E]/20",
    path: "/analytics"
  },
  { 
    title: "File & Contract Storage",
    description: "Store important documents",
    icon: FolderArchive,
    gradient: "from-[#E6CCB2]/20 to-[#8B7355]/20",
    path: "/storage"
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
          <div className="flex gap-6 pb-6 min-w-max">
            {sections.map((section, index) => (
              <Card 
                key={index} 
                className={`w-80 hover-scale glass-morphism cursor-pointer relative overflow-hidden transition-all duration-300 hover:shadow-lg`}
                onClick={() => handleCardClick(section.path)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-50`} />
                <CardHeader className="relative">
                  <section.icon className="w-8 h-8 mb-3 text-primary" />
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
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
