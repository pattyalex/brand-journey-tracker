
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
    gradient: "from-pink-500/20 to-purple-500/20"
  },
  { 
    title: "Task Manager",
    description: "Track your content creation tasks",
    icon: ListTodo,
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  { 
    title: "Content Calendar",
    description: "Schedule and organize your content",
    icon: Calendar,
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  { 
    title: "Brand Deal Tracker",
    description: "Manage brand partnerships",
    icon: Handshake,
    gradient: "from-yellow-500/20 to-orange-500/20"
  },
  { 
    title: "Strategy & Growth",
    description: "Analyze and improve your strategy",
    icon: TrendingUp,
    gradient: "from-purple-500/20 to-indigo-500/20"
  },
  { 
    title: "Analytics",
    description: "Track your performance metrics",
    icon: BarChart3,
    gradient: "from-red-500/20 to-pink-500/20"
  },
  { 
    title: "File & Contract Storage",
    description: "Store important documents",
    icon: FolderArchive,
    gradient: "from-teal-500/20 to-green-500/20"
  }
];

const Dashboard = () => {
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
