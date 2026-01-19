import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { FolderOpen, Handshake, TrendingUp, CheckCircle } from "lucide-react";
import { StorageKeys, getString } from "@/lib/storage";
import { KanbanColumn } from "./production/types";

const Dashboard = () => {
  const navigate = useNavigate();

  // Calculate monthly stats from localStorage
  const monthlyStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    let scheduled = 0;
    let posted = 0;
    let planned = 0;

    const savedData = getString(StorageKeys.productionKanban);
    if (savedData) {
      try {
        const columns: KanbanColumn[] = JSON.parse(savedData);

        // Find to-schedule column for scheduled/posted content
        const toScheduleColumn = columns.find(col => col.id === 'to-schedule');
        toScheduleColumn?.cards.forEach(c => {
          if (c.schedulingStatus === 'scheduled' && c.scheduledDate) {
            const schedDate = new Date(c.scheduledDate);
            if (schedDate >= startOfMonth && schedDate <= endOfMonth) {
              if (schedDate < today) {
                posted++;
              } else {
                scheduled++;
              }
            }
          }
        });

        // Find ideate column for planned content
        const ideateColumn = columns.find(col => col.id === 'ideate');
        ideateColumn?.cards.forEach(c => {
          if (c.plannedDate) {
            const planDate = new Date(c.plannedDate);
            if (planDate >= startOfMonth && planDate <= endOfMonth) {
              planned++;
            }
          }
        });
      } catch (e) {
        console.error("Error parsing production data:", e);
      }
    }

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return { scheduled, posted, planned, monthName: monthNames[currentMonth] };
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8 fade-in">
        <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard</h1>

        {/* Monthly Overview Stats */}
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-6 border border-violet-100/50 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-violet-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              {monthlyStats.monthName} Overview
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">{monthlyStats.posted}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Posted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{monthlyStats.scheduled}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-600">{monthlyStats.planned}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Planned</div>
            </div>
          </div>
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