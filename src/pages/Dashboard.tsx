import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { FolderOpen, Handshake, TrendingUp, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8 fade-in">
        <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard</h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Content Ideas</h3>
            <div className="text-3xl font-bold">12</div>
            <p className="text-sm text-muted-foreground mt-1">4 new this week</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Scheduled Content</h3>
            <div className="text-3xl font-bold">8</div>
            <p className="text-sm text-muted-foreground mt-1">Next post in 2 days</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Active Brand Deals</h3>
            <div className="text-3xl font-bold">3</div>
            <p className="text-sm text-muted-foreground mt-1">1 pending approval</p>
          </Card>
        </div>

        {/* Recent Activity */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <Card className="p-0 overflow-hidden">
            <div className="divide-y">
              {recentActivity.map((activity, index) => (
                <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button 
                key={index} 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center text-center"
                onClick={() => navigate(action.link)}
              >
                <action.icon className="h-6 w-6 mb-2" />
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

const recentActivity = [
  {
    title: "Content Idea Added",
    description: "You added 'Summer Travel Tips' to your content ideas",
    time: "2 hours ago"
  },
  {
    title: "Post Scheduled",
    description: "Instagram post scheduled for May 20th at 9:00 AM",
    time: "Yesterday"
  },
  {
    title: "Brand Deal Updated",
    description: "Contract approved for Skincare Brand collaboration",
    time: "2 days ago"
  },
  {
    title: "Analytics Updated",
    description: "April performance report is now available",
    time: "3 days ago"
  }
];

const quickActions = [
  {
    label: "New Content Idea",
    icon: TrendingUp,
    link: "/content-ideation"
  },
  {
    label: "Schedule Post",
    icon: FolderOpen,
    link: "/content-calendar"
  },
  {
    label: "Manage Brand Deals",
    icon: Handshake,
    link: "/collab-management"
  },
  {
    label: "View Analytics",
    icon: CheckCircle,
    link: "/analytics"
  }
];

export default Dashboard;