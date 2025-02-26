
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { ScrollArea } from "@/components/ui/scroll-area";

const sections = [
  { title: "Content Ideation & Planning", description: "Brainstorm and plan your content" },
  { title: "Task Manager", description: "Track your content creation tasks" },
  { title: "Content Calendar", description: "Schedule and organize your content" },
  { title: "Brand Deal Tracker", description: "Manage brand partnerships" },
  { title: "Strategy & Growth", description: "Analyze and improve your strategy" },
  { title: "Analytics", description: "Track your performance metrics" },
  { title: "File & Contract Storage", description: "Store important documents" },
];

const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-6 fade-in">
        <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
        
        <ScrollArea className="w-full">
          <div className="flex gap-6 pb-6 min-w-max">
            {sections.map((section, index) => (
              <Card key={index} className="w-80 hover-scale glass-morphism">
                <CardHeader>
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
